/*
# Allow short KM- access codes in survey submission

## Summary
The `validate-token` edge function already accepts both the long invitation
`access_code` (XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX) and the short
`trabajadores.codigo_acceso` (KM-XXXXXX). However, `submit_survey_anonymous`
only looked up by `access_code`, so a worker who entered the short code could
pass validation but fail submission with `code_used_or_invalid`.

This migration replaces `submit_survey_anonymous` so it resolves a short
`KM-` code to its matching `invitaciones.access_code` before the atomic
UPDATE/claim. No new tables, no columns changed, no data lost.

## Changes
1. Replaces `public.submit_survey_anonymous` with a version that, when the
   submitted code does not match any `invitaciones.access_code` directly,
   looks up `trabajadores.codigo_acceso` and resolves the email + empresa_id
   to the corresponding `invitaciones.access_code`.
2. Keeps all existing security properties: SECURITY DEFINER, score-range
   validation, atomic claim, disconnected response insert, EXECUTE on anon.
*/

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
  v_resolved_code text;
  v_trab record;
BEGIN
  -- Validate access code format
  IF p_access_code IS NULL OR length(trim(p_access_code)) < 4 THEN
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

  -- Resolve the code: try direct access_code first, then short KM- code
  v_resolved_code := trim(p_access_code);

  IF NOT EXISTS (SELECT 1 FROM public.invitaciones WHERE access_code = v_resolved_code) THEN
    -- Try short codigo_acceso from trabajadores
    SELECT t.email, t.empresa_id INTO v_trab
    FROM public.trabajadores t
    WHERE t.codigo_acceso = v_resolved_code
    LIMIT 1;

    IF v_trab.email IS NOT NULL THEN
      SELECT i.access_code INTO v_resolved_code
      FROM public.invitaciones i
      WHERE i.empresa_id = v_trab.empresa_id
        AND i.email = lower(v_trab.email)
      LIMIT 1;
    END IF;
  END IF;

  -- Atomically claim the invitation: mark as completed ONLY if not already completed
  UPDATE invitaciones
  SET has_completed = true, completed_at = now()
  WHERE access_code = v_resolved_code AND has_completed = false
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

-- Re-grant EXECUTE (CREATE OR REPLACE may have reset grants)
REVOKE EXECUTE ON FUNCTION public.submit_survey_anonymous(text, integer, integer, integer, integer, integer, integer, integer, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_survey_anonymous(text, integer, integer, integer, integer, integer, integer, integer, integer, integer) TO anon, authenticated;
