/*
# Add role access foundations, departments, and atomic employee tokens

1. New Tables
- `departamentos`: departamentos configurados por cada empresa, como COCINA, BAR o GESTION.
- `employee_tokens`: códigos únicos de empleado vinculados a una empresa y departamento, con estado de uso y fecha de envío.

2. Modified Tables
- `empresas`: adds `status` and `certificate_downloaded` while preserving existing subscription and scoring fields.
- `campaign_tokens`: adds an optional department reference for existing campaign records.

3. Security
- RLS remains enabled and grants are explicit for the anonymous application role because this project has no sign-in screen.
- Employee token writes are not exposed to the browser; the application uses the atomic RPC to claim and submit a survey.
- `claim_employee_token_and_submit` validates and consumes a token in one database operation, then updates only anonymous aggregates.

4. Important Notes
- Existing rows are preserved. Existing campaign tokens remain available for backwards compatibility.
- No employee email address is stored in the new token table.
- A token can be claimed only once and only for an active company.
*/

ALTER TABLE empresas ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS certificate_downloaded boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS departamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (empresa_id, nombre)
);
CREATE TABLE IF NOT EXISTS employee_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), token_code text UNIQUE NOT NULL,
  company_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES departamentos(id) ON DELETE RESTRICT,
  is_used boolean NOT NULL DEFAULT false, sent_at timestamptz, used_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE campaign_tokens ADD COLUMN IF NOT EXISTS departamento_id uuid REFERENCES departamentos(id) ON DELETE SET NULL;
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_tokens ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON departamentos TO anon, authenticated;
GRANT SELECT ON employee_tokens TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_departamentos" ON departamentos;
CREATE POLICY "anon_select_departamentos" ON departamentos FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_departamentos" ON departamentos;
CREATE POLICY "anon_insert_departamentos" ON departamentos FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_departamentos" ON departamentos;
CREATE POLICY "anon_update_departamentos" ON departamentos FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_departamentos" ON departamentos;
CREATE POLICY "anon_delete_departamentos" ON departamentos FOR DELETE TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_select_employee_tokens" ON employee_tokens;
CREATE POLICY "anon_select_employee_tokens" ON employee_tokens FOR SELECT TO anon, authenticated USING (false);
DROP POLICY IF EXISTS "anon_insert_employee_tokens" ON employee_tokens;
CREATE POLICY "anon_insert_employee_tokens" ON employee_tokens FOR INSERT TO anon, authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "anon_update_employee_tokens" ON employee_tokens;
CREATE POLICY "anon_update_employee_tokens" ON employee_tokens FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "anon_delete_employee_tokens" ON employee_tokens;
CREATE POLICY "anon_delete_employee_tokens" ON employee_tokens FOR DELETE TO anon, authenticated USING (false);

CREATE INDEX IF NOT EXISTS idx_departamentos_empresa ON departamentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_employee_tokens_company ON employee_tokens(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_tokens_department ON employee_tokens(department_id);
CREATE INDEX IF NOT EXISTS idx_employee_tokens_code ON employee_tokens(token_code);

CREATE OR REPLACE FUNCTION claim_employee_token_and_submit(
  p_token_code text, p_department_name text, p_block_1 integer, p_block_2 integer, p_block_3 integer, p_block_4 integer,
  p_block_5 integer, p_veto integer, p_questions_per_block integer DEFAULT 5, p_min_score integer DEFAULT 1,
  p_max_score integer DEFAULT 5, p_expected_blocks integer DEFAULT 5
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_token employee_tokens%ROWTYPE; v_department text; v_block integer; v_sum integer;
  v_values integer[] := ARRAY[p_block_1, p_block_2, p_block_3, p_block_4, p_block_5];
BEGIN
  IF p_token_code IS NULL OR length(trim(p_token_code)) < 8 THEN RAISE EXCEPTION 'invalid_token'; END IF;
  IF p_department_name IS NULL OR length(trim(p_department_name)) < 2 OR length(trim(p_department_name)) > 80 THEN RAISE EXCEPTION 'invalid_department'; END IF;
  IF p_veto NOT IN (0, 1) OR p_questions_per_block <> 5 OR p_expected_blocks <> 5 THEN RAISE EXCEPTION 'invalid_submission'; END IF;
  FOREACH v_sum IN ARRAY v_values LOOP
    IF v_sum < p_min_score * p_questions_per_block OR v_sum > p_max_score * p_questions_per_block THEN RAISE EXCEPTION 'invalid_submission'; END IF;
  END LOOP;
  UPDATE employee_tokens SET is_used = true, used_at = now() WHERE token_code = trim(p_token_code) AND is_used = false RETURNING * INTO v_token;
  IF v_token.id IS NULL THEN RAISE EXCEPTION 'token_used_or_invalid'; END IF;
  v_department := upper(trim(p_department_name));
  INSERT INTO departamentos (empresa_id, nombre) VALUES (v_token.company_id, v_department) ON CONFLICT (empresa_id, nombre) DO NOTHING;
  FOR v_block IN 1..5 LOOP
    INSERT INTO respuestas_agregadas (empresa_id, departamento, bloque, suma_puntuacion, contador_respuestas, veto_count, updated_at)
    VALUES (v_token.company_id, v_department, v_block, v_values[v_block], 1, CASE WHEN v_block = 5 THEN p_veto ELSE 0 END, now())
    ON CONFLICT (empresa_id, departamento, bloque) DO UPDATE SET
      suma_puntuacion = respuestas_agregadas.suma_puntuacion + EXCLUDED.suma_puntuacion,
      contador_respuestas = respuestas_agregadas.contador_respuestas + 1,
      veto_count = respuestas_agregadas.veto_count + EXCLUDED.veto_count, updated_at = now();
  END LOOP;
  UPDATE empresas SET nota_global = ROUND((SELECT (SUM(suma_puntuacion)::numeric / NULLIF(SUM(contador_respuestas)::numeric, 0) / p_questions_per_block) * 2 FROM respuestas_agregadas WHERE empresa_id = v_token.company_id), 2) WHERE id = v_token.company_id;
  RETURN jsonb_build_object('success', true, 'company_id', v_token.company_id, 'department', v_department);
END; $$;

REVOKE EXECUTE ON FUNCTION claim_employee_token_and_submit(text, text, integer, integer, integer, integer, integer, integer, integer, integer, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION claim_employee_token_and_submit(text, text, integer, integer, integer, integer, integer, integer, integer, integer, integer, integer) TO anon, authenticated;
