/*
# Fix nota_global calculation and add participation gate

## Problems
1. nota_global mixed block 5 (cualitativa, scored 1/3/5) with blocks 1-4 (Likert 1-5),
   diluting the score. A company with all 4s and 5s got only 80/100 — below the 85 threshold.
2. nota_global was recalculated after every single submission, so pass/fail showed
   immediately with only 2 responses. The final result should only be determined
   when ALL sent invitations are completed.

## Changes
1. Rewrite submit_survey_anonymous so nota_global is calculated from blocks 1-4 ONLY.
   Block 5 is applied as a penalty via discrepancy check, not averaged into the base.
2. nota_global is only written when ALL invitations are completed. Until then it stays 0 (AUDITANDO).
3. Recalculates all existing companies.

## Security
- No new tables. Same RLS, same grants. SECURITY DEFINER preserved.
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
  v_total_inv integer;
  v_completed_inv integer;
  v_quant_avg numeric;
  v_qual_avg numeric;
  v_veto_count integer;
  v_b5_count integer;
  v_nota numeric;
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

  -- Check if ALL invitations are completed
  SELECT count(*), count(*) FILTER (WHERE has_completed)
    INTO v_total_inv, v_completed_inv
  FROM public.invitaciones WHERE empresa_id = v_inv.empresa_id;

  -- Only set nota_global when 100% of invitations are completed
  IF v_total_inv > 0 AND v_completed_inv >= v_total_inv THEN
    -- Quantitative average from blocks 1-4 only (Likert 1-5 → 0-100)
    SELECT ((SUM(CASE WHEN bloque <= 4 THEN suma_puntuacion ELSE 0 END)::numeric
             / NULLIF(SUM(CASE WHEN bloque <= 4 THEN contador_respuestas ELSE 0 END)::numeric, 0)
             / p_questions_per_block) - 1) / 4 * 100
    INTO v_quant_avg
    FROM respuestas_agregadas WHERE empresa_id = v_inv.empresa_id;

    -- Qualitative average from block 5 (1/3/5 scale → normalize to 0-100)
    SELECT (SUM(suma_puntuacion)::numeric
            / NULLIF(SUM(contador_respuestas)::numeric, 0)
            / p_max_score) * 100
    INTO v_qual_avg
    FROM respuestas_agregadas
    WHERE empresa_id = v_inv.empresa_id AND bloque = 5;

    -- Veto check
    SELECT SUM(veto_count), SUM(contador_respuestas)
      INTO v_veto_count, v_b5_count
    FROM respuestas_agregadas
    WHERE empresa_id = v_inv.empresa_id AND bloque = 5;

    v_nota := COALESCE(v_quant_avg, 0);

    -- Veto rule: >10% veto rate → nota = 0
    IF v_b5_count > 0 AND v_veto_count::numeric / v_b5_count > 0.10 THEN
      v_nota := 0;
    ELSE
      -- Discrepancy penalty: if qualitative is >30 points below quantitative, deduct 20%
      IF v_qual_avg IS NOT NULL AND v_quant_avg > 0 AND (v_quant_avg - v_qual_avg) > 30 THEN
        v_nota := v_nota * 0.80;
      END IF;
    END IF;

    UPDATE empresas SET nota_global = ROUND(v_nota, 2) WHERE id = v_inv.empresa_id;
  ELSE
    -- Audit still in progress — reset nota_global to 0 (AUDITANDO)
    UPDATE empresas SET nota_global = 0 WHERE id = v_inv.empresa_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'empresa_id', v_inv.empresa_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_survey_anonymous(text, integer, integer, integer, integer, integer, integer, integer, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_survey_anonymous(text, integer, integer, integer, integer, integer, integer, integer, integer, integer) TO anon, authenticated;

-- Recalculate nota_global for all companies with the new formula
-- Only set non-zero for companies where all invitations are completed
UPDATE empresas e SET nota_global = sub.nota_final
FROM (
  SELECT DISTINCT ON (ra.empresa_id)
    ra.empresa_id,
    CASE
      WHEN inv.total > 0 AND inv.completed >= inv.total THEN
        ROUND(
          CASE
            WHEN b5.veto_count > 0 AND b5.veto_count::numeric / NULLIF(b5.count, 0) > 0.10 THEN 0
            WHEN (quant.avg_quant - COALESCE(b5.avg_qual, 0)) > 30 THEN quant.avg_quant * 0.80
            ELSE quant.avg_quant
          END, 2
        )
      ELSE 0
    END AS nota_final
  FROM respuestas_agregadas ra
  JOIN LATERAL (
    SELECT count(*) AS total, count(*) FILTER (WHERE has_completed) AS completed
    FROM invitaciones i WHERE i.empresa_id = ra.empresa_id
  ) inv ON true
  JOIN LATERAL (
    SELECT ((SUM(CASE WHEN bloque <= 4 THEN suma_puntuacion ELSE 0 END)::numeric
             / NULLIF(SUM(CASE WHEN bloque <= 4 THEN contador_respuestas ELSE 0 END)::numeric, 0)
             / 5) - 1) / 4 * 100 AS avg_quant
    FROM respuestas_agregadas r2 WHERE r2.empresa_id = ra.empresa_id
  ) quant ON true
  JOIN LATERAL (
    SELECT (SUM(suma_puntuacion)::numeric / NULLIF(SUM(contador_respuestas)::numeric, 0) / 5) * 100 AS avg_qual,
           SUM(veto_count) AS veto_count,
           SUM(contador_respuestas) AS count
    FROM respuestas_agregadas r3 WHERE r3.empresa_id = ra.empresa_id AND r3.bloque = 5
  ) b5 ON true
) sub
WHERE e.id = sub.empresa_id;
