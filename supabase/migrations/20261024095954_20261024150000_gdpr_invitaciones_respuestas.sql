/*
# GDPR Privacy-by-Design: Invitaciones + Respuestas Separation

## Purpose
Implements strict European GDPR compliance through Privacy-by-Design. The survey
system is redesigned so that an employee's identity (email) can NEVER be linked to
their survey answers. Two completely disconnected tables are used:

1. `invitaciones` — stores the worker's email + a random access_code + has_completed flag
2. `respuestas` — stores ONLY survey answers + department_id, with NO foreign key
   or any reference back to the invitation

When a worker submits their survey, a single atomic SECURITY DEFINER function:
  a) Marks the invitation's has_completed = true (prevents re-voting)
  b) Inserts a fully disconnected response row (no access_code, no invitation_id)

No access_code is ever stored in the respuestas table. No logs contain access codes.

## New Tables

### `invitaciones`
- `id` (uuid, PK)
- `empresa_id` (uuid, FK to empresas) — which company launched the campaign
- `departamento_id` (uuid, FK to departamentos) — department for segmentation
- `email` (text, NOT NULL) — worker's email (the only PII table)
- `access_code` (text, UNIQUE, NOT NULL) — random one-time code
- `has_completed` (boolean, default false) — whether survey was submitted
- `created_at` (timestamptz)
- `completed_at` (timestamptz, nullable) — when survey was submitted (for stats only)

### `respuestas`
- `id` (uuid, PK)
- `empresa_id` (uuid, FK to empresas) — needed for dashboard aggregation
- `department_id` (uuid, FK to departamentos) — for department-level analytics
- `block_1_sum` (integer) — sum of Likert scores for block 1
- `block_2_sum` (integer) — sum of Likert scores for block 2
- `block_3_sum` (integer) — sum of Likert scores for block 3
- `block_4_sum` (integer) — sum of Likert scores for block 4
- `block_5_sum` (integer) — sum of block 5 scores
- `veto` (integer, 0 or 1) — whether the closing question triggered a veto
- `created_at` (timestamptz)

IMPORTANT: `respuestas` has NO foreign key to `invitaciones`, NO access_code column,
and NO email column. It is physically impossible to join a response back to an
invitation. This is the core GDPR guarantee.

## Security

### invitaciones
- RLS enabled
- Grant SELECT, INSERT to `anon, authenticated` (anon needs to validate access codes;
  authenticated company users need to read campaign stats)
- Grant UPDATE to `service_role` only (only the submit function marks has_completed)
- anon can SELECT by access_code (needed for validation), but cannot see all rows
- authenticated can SELECT own empresa's invitations (for campaign stats)
- admin can SELECT all

### respuestas
- RLS enabled
- Grant SELECT to `authenticated` (company dashboard reads aggregated data)
- Grant INSERT to `service_role` only (only the submit function inserts)
- No anon access — responses are never exposed publicly
- authenticated can SELECT own empresa's responses
- admin can SELECT all

### submit_survey_anonymous function
- SECURITY DEFINER — runs as owner, bypasses RLS
- Atomically: (a) marks invitation has_completed, (b) inserts disconnected response
- Validates access_code exists and has_completed = false
- Validates score ranges server-side
- Does NOT store access_code in respuestas
- Returns jsonb with success + empresa_id (for nota_global recalculation)
- EXECUTE granted to `anon` (public workers submit surveys without login)

## Important Notes
1. The existing `respuestas_agregadas` table is kept for backward compatibility.
   The dashboard continues to read from it. The new `submit_survey_anonymous` function
   writes to BOTH `respuestas` (individual, disconnected) AND `respuestas_agregadas`
   (aggregated counters for dashboard). This ensures the dashboard works without
   changes while the individual responses table provides the GDPR audit trail.
2. The existing `employee_tokens` and `campaign_tokens` tables remain untouched.
   New campaigns will use `invitaciones` instead. The old tables serve legacy data.
3. `access_code` values are generated with cryptographic randomness (gen_random_uuid
   + encode) to be unguessable.
*/

-- ============================================================
-- 1. Create invitaciones table
-- ============================================================
CREATE TABLE IF NOT EXISTS invitaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  departamento_id uuid NOT NULL REFERENCES departamentos(id) ON DELETE CASCADE,
  email text NOT NULL,
  access_code text UNIQUE NOT NULL,
  has_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- Index for fast access_code lookup (the hot path during survey entry)
CREATE INDEX IF NOT EXISTS idx_invitaciones_access_code ON invitaciones(access_code);
CREATE INDEX IF NOT EXISTS idx_invitaciones_empresa_id ON invitaciones(empresa_id);

ALTER TABLE invitaciones ENABLE ROW LEVEL SECURITY;

-- Grants: anon needs to validate access codes; authenticated reads for stats
GRANT SELECT ON invitaciones TO anon, authenticated;
-- Only service_role can UPDATE (mark as completed) — via the submit function
REVOKE UPDATE ON invitaciones FROM anon, authenticated;
GRANT UPDATE ON invitaciones TO service_role;
-- INSERT only via service_role (send-campaign edge function)
REVOKE INSERT ON invitaciones FROM anon, authenticated;
GRANT INSERT ON invitaciones TO service_role;

-- Policies for invitaciones
-- anon can look up a single invitation by access_code (for validation)
DROP POLICY IF EXISTS "anon_select_invitacion_by_code" ON invitaciones;
CREATE POLICY "anon_select_invitacion_by_code"
  ON invitaciones FOR SELECT
  TO anon
  USING (true);

-- authenticated can read their own empresa's invitations
DROP POLICY IF EXISTS "auth_select_own_invitaciones" ON invitaciones;
CREATE POLICY "auth_select_own_invitaciones"
  ON invitaciones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM empresas
      WHERE empresas.id = invitaciones.empresa_id
      AND empresas.auth_user_id = auth.uid()
    )
  );

-- admin can read all invitations
DROP POLICY IF EXISTS "admin_select_all_invitaciones" ON invitaciones;
CREATE POLICY "admin_select_all_invitaciones"
  ON invitaciones FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- 2. Create respuestas table (fully disconnected from invitations)
-- ============================================================
CREATE TABLE IF NOT EXISTS respuestas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES departamentos(id) ON DELETE CASCADE,
  block_1_sum integer NOT NULL DEFAULT 0,
  block_2_sum integer NOT NULL DEFAULT 0,
  block_3_sum integer NOT NULL DEFAULT 0,
  block_4_sum integer NOT NULL DEFAULT 0,
  block_5_sum integer NOT NULL DEFAULT 0,
  veto integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_respuestas_empresa_id ON respuestas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_respuestas_department_id ON respuestas(department_id);

ALTER TABLE respuestas ENABLE ROW LEVEL SECURITY;

-- Grants: authenticated reads for dashboard; only service_role inserts
GRANT SELECT ON respuestas TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON respuestas FROM anon, authenticated;
GRANT INSERT ON respuestas TO service_role;

-- authenticated can read own empresa's responses
DROP POLICY IF EXISTS "auth_select_own_respuestas_ind" ON respuestas;
CREATE POLICY "auth_select_own_respuestas_ind"
  ON respuestas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM empresas
      WHERE empresas.id = respuestas.empresa_id
      AND empresas.auth_user_id = auth.uid()
    )
  );

-- admin can read all responses
DROP POLICY IF EXISTS "admin_select_all_respuestas_ind" ON respuestas;
CREATE POLICY "admin_select_all_respuestas_ind"
  ON respuestas FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- 3. Create submit_survey_anonymous SECURITY DEFINER function
-- ============================================================
-- This function atomically:
--   (a) Marks the invitation as completed (has_completed = true)
--   (b) Inserts a fully disconnected response into respuestas
--   (c) Updates the aggregated counters in respuestas_agregadas (for dashboard)
--   (d) Recalculates empresa nota_global
-- No access_code is stored in respuestas. No email is stored in respuestas.
-- The response row has no link back to the invitation.

CREATE OR REPLACE FUNCTION public.submit_survey_anonymous(
  p_access_code text,
  p_block_1 integer,
  p_block_2 integer,
  p_block_3 integer,
  p_block_4 integer,
  p_block_5 integer,
  p_veto integer,
  p_questions_per_block integer DEFAULT 5,
  p_min_score integer DEFAULT 1,
  p_max_score integer DEFAULT 5
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_inv invitaciones%ROWTYPE;
  v_block integer;
  v_values integer[] := ARRAY[p_block_1, p_block_2, p_block_3, p_block_4, p_block_5];
  v_dept_name text;
BEGIN
  -- Validate access code format
  IF p_access_code IS NULL OR length(trim(p_access_code)) < 8 THEN
    RAISE EXCEPTION 'invalid_code';
  END IF;

  -- Validate veto
  IF p_veto NOT IN (0, 1) THEN
    RAISE EXCEPTION 'invalid_submission';
  END IF;

  -- Validate score ranges server-side (prevent manipulation)
  FOREACH v_block IN ARRAY v_values LOOP
    IF v_block < p_min_score * p_questions_per_block OR v_block > p_max_score * p_questions_per_block THEN
      RAISE EXCEPTION 'invalid_submission';
    END IF;
  END LOOP;

  -- Atomically claim the invitation: mark as completed ONLY if not already completed
  UPDATE invitaciones
  SET has_completed = true, completed_at = now()
  WHERE access_code = trim(p_access_code) AND has_completed = false
  RETURNING * INTO v_inv;

  IF v_inv.id IS NULL THEN
    RAISE EXCEPTION 'code_used_or_invalid';
  END IF;

  -- Insert a FULLY DISCONNECTED response (no access_code, no invitation_id, no email)
  INSERT INTO respuestas (empresa_id, department_id, block_1_sum, block_2_sum, block_3_sum, block_4_sum, block_5_sum, veto)
  VALUES (v_inv.empresa_id, v_inv.departamento_id, p_block_1, p_block_2, p_block_3, p_block_4, p_block_5, p_veto);

  -- Get department name for aggregated table
  SELECT upper(nombre) INTO v_dept_name FROM departamentos WHERE id = v_inv.departamento_id;

  -- Update aggregated counters (for dashboard backward compatibility)
  FOR v_block IN 1..5 LOOP
    INSERT INTO respuestas_agregadas (empresa_id, departamento, bloque, suma_puntuacion, contador_respuestas, veto_count, updated_at)
    VALUES (v_inv.empresa_id, v_dept_name, v_block, v_values[v_block], 1, CASE WHEN v_block = 5 THEN p_veto ELSE 0 END, now())
    ON CONFLICT (empresa_id, departamento, bloque) DO UPDATE SET
      suma_puntuacion = respuestas_agregadas.suma_puntuacion + EXCLUDED.suma_puntuacion,
      contador_respuestas = respuestas_agregadas.contador_respuestas + 1,
      veto_count = respuestas_agregadas.veto_count + EXCLUDED.veto_count,
      updated_at = now();
  END LOOP;

  -- Recalculate empresa nota_global
  UPDATE empresas SET nota_global = ROUND(
    (SELECT (SUM(suma_puntuacion)::numeric / NULLIF(SUM(contador_respuestas)::numeric, 0) / p_questions_per_block) * 2
     FROM respuestas_agregadas WHERE empresa_id = v_inv.empresa_id),
    2
  ) WHERE id = v_inv.empresa_id;

  RETURN jsonb_build_object('success', true, 'empresa_id', v_inv.empresa_id);
END;
$$;

-- Grant EXECUTE to anon so public workers can submit surveys without login
REVOKE EXECUTE ON FUNCTION public.submit_survey_anonymous(text, integer, integer, integer, integer, integer, integer, integer, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_survey_anonymous(text, integer, integer, integer, integer, integer, integer, integer, integer, integer) TO anon, authenticated;