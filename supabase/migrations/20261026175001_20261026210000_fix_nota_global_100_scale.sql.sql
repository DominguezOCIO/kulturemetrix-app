/*
# Fix nota_global calculation to 0-100 scale

## Problem
The `submit_survey_anonymous` function recalculates `empresas.nota_global` using
`* 2`, which produces a 0-10 value. But the app expects a 0-100 scale (the
certificate threshold is 85/100, and `getNotaColor` compares against 85 and 65).
Every new survey submission overwrote the correctly-converted value back to 0-10,
so companies always showed as "FALLIDA" (failed) even with positive responses.

## Changes
1. Replaces `submit_survey_anonymous` so the nota_global recalculation uses
   `* 20` (0-100 scale) instead of `* 2` (0-10 scale).
   Formula: (SUM(suma_puntuacion) / SUM(contador_respuestas) / questions_per_block) * 20
   This maps average Likert 1→0, 3→50, 5→100.
2. Recalculates existing `nota_global` values for all companies that have
   respuestas_agregadas data, using the corrected formula.
3. No new tables, no columns changed. Security properties preserved.
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
  IF p_access_code IS NULL OR length(trim(p_access_code)) < 4 THEN
    RAISE EXCEPTION 'invalid_code';
  END IF;

  IF p_veto NOT IN (0, 1) THEN
    RAISE EXCEPTION 'invalid_submission';
  END IF;

  FOREACH v_block IN ARRAY v_values LOOP
    IF v_block < p_min_score * p_questions_per_block OR v_block > p_max_score * p_questions_per_block THEN
      RAISE EXCEPTION 'invalid_submission';
    END IF;
  END LOOP;

  v_resolved_code := trim(p_access_code);

  IF NOT EXISTS (SELECT 1 FROM public.invitaciones WHERE access_code = v_resolved_code) THEN
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

  UPDATE invitaciones
  SET has_completed = true, completed_at = now()
  WHERE access_code = v_resolved_code AND has_completed = false
  RETURNING * INTO v_inv;

  IF v_inv.id IS NULL THEN
    RAISE EXCEPTION 'code_used_or_invalid';
  END IF;

  INSERT INTO respuestas (empresa_id, department_id, block_1_sum, block_2_sum, block_3_sum, block_4_sum, block_5_sum, veto)
  VALUES (v_inv.empresa_id, v_inv.departamento_id, p_block_1, p_block_2, p_block_3, p_block_4, p_block_5, p_veto);

  SELECT upper(nombre) INTO v_dept_name FROM departamentos WHERE id = v_inv.departamento_id;

  FOR v_block IN 1..5 LOOP
    INSERT INTO respuestas_agregadas (empresa_id, departamento, bloque, suma_puntuacion, contador_respuestas, veto_count, updated_at)
    VALUES (v_inv.empresa_id, v_dept_name, v_block, v_values[v_block], 1, CASE WHEN v_block = 5 THEN p_veto ELSE 0 END, now())
    ON CONFLICT (empresa_id, departamento, bloque) DO UPDATE SET
      suma_puntuacion = respuestas_agregadas.suma_puntuacion + EXCLUDED.suma_puntuacion,
      contador_respuestas = respuestas_agregadas.contador_respuestas + 1,
      veto_count = respuestas_agregadas.veto_count + EXCLUDED.veto_count,
      updated_at = now();
  END LOOP;

  -- Recalculate nota_global on 0-100 scale
  -- (avg_likert - 1) / 4 * 100  maps 1→0, 3→50, 5→100
  UPDATE empresas SET nota_global = ROUND(
    (SELECT ((SUM(suma_puntuacion)::numeric / NULLIF(SUM(contador_respuestas)::numeric, 0) / p_questions_per_block) - 1) / 4 * 100
     FROM respuestas_agregadas WHERE empresa_id = v_inv.empresa_id),
    2
  ) WHERE id = v_inv.empresa_id;

  RETURN jsonb_build_object('success', true, 'empresa_id', v_inv.empresa_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_survey_anonymous(text, integer, integer, integer, integer, integer, integer, integer, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_survey_anonymous(text, integer, integer, integer, integer, integer, integer, integer, integer, integer) TO anon, authenticated;

-- Recalculate nota_global for all companies with existing data
UPDATE empresas e SET nota_global = sub.nota_100
FROM (
  SELECT ra.empresa_id,
    ROUND(((SUM(ra.suma_puntuacion)::numeric / NULLIF(SUM(ra.contador_respuestas)::numeric, 0) / 5) - 1) / 4 * 100, 2) AS nota_100
  FROM respuestas_agregadas ra
  GROUP BY ra.empresa_id
) sub
WHERE e.id = sub.empresa_id
  AND sub.nota_100 IS NOT NULL;
