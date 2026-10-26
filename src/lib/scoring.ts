import { supabase } from './supabase';
import { QUESTIONS } from './questions';

export interface BlockScore {
  bloque: number;
  promedio: number; // 1-5
  nota: number; // sobre 100
  contador: number;
  vetoCount?: number;
  vetoed?: boolean;
}

export interface DeptScore extends BlockScore {
  departamento: string;
  penalizada?: boolean;
  penalizacion?: number;
  diferenciaPct?: number;
  notaCuantitativa?: number;
  notaCualitativa?: number;
  notaFinal?: number;
}

export interface Empresa {
  id: string;
  nombre: string;
  api_key: string;
  estado_suscripcion: string;
  nota_global: number; // sobre 100
}

export const CERTIFICATE_THRESHOLD = 70;

export interface Block5Answers {
  block5Sum: number;
  triggeredVeto: boolean;
}

/**
 * Convierte un promedio Likert (1-5) a puntuación sobre 100.
 * Fórmula: ((promedio - 1) / 4) * 100
 */
export function likertTo100(promedioLikert: number): number {
  return ((promedioLikert - 1) / 4) * 100;
}

/**
 * Envía una encuesta completa de forma anónima usando el RPC SECURITY DEFINER
 * submit_survey_anonymous, que marca atómicamente la invitación como completada
 * e inserta una respuesta totalmente desconectada (sin access_code, sin email).
 * Cumple RGPD: privacidad desde el diseño, sin relación entre identidad y respuestas.
 */
export async function submitSurvey(
  accessCode: string,
  _departamento: string,
  answers: Record<string, number>,
  block5Data: Block5Answers,
): Promise<void> {
  const sums: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const q of QUESTIONS) {
    sums[q.bloque] += answers[q.id] ?? 0;
  }

  const { data, error } = await supabase.rpc('submit_survey_anonymous', {
    p_access_code: accessCode,
    p_block_1: sums[1],
    p_block_2: sums[2],
    p_block_3: sums[3],
    p_block_4: sums[4],
    p_block_5: block5Data.block5Sum,
    p_veto: block5Data.triggeredVeto ? 1 : 0,
  });

  if (error) throw error;
  if (!data || data.success !== true) {
    throw new Error('submission_failed');
  }
}

// Número de preguntas por bloque
const QUESTIONS_PER_BLOCK: Record<number, number> = { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 };

/**
 * Obtiene las puntuaciones agregadas por bloque para toda la empresa.
 */
export async function getEmpresaBlockScores(empresaId: string): Promise<BlockScore[]> {
  const { data, error } = await supabase
    .from('respuestas_agregadas')
    .select('bloque, suma_puntuacion, contador_respuestas, veto_count')
    .eq('empresa_id', empresaId);
  if (error) throw error;
  if (!data || data.length === 0) return [];

  const result: BlockScore[] = [];
  for (const bloque of [1, 2, 3, 4, 5]) {
    const rows = data.filter((r) => r.bloque === bloque);
    const totalSum = rows.reduce((acc, r) => acc + r.suma_puntuacion, 0);
    const totalCount = rows.reduce((acc, r) => acc + r.contador_respuestas, 0);
    const totalVeto = rows.reduce((acc, r) => acc + (r.veto_count ?? 0), 0);
    const numQuestions = QUESTIONS_PER_BLOCK[bloque] ?? 5;
    if (totalCount > 0) {
      const promedio = totalSum / (totalCount * numQuestions);
      const nota = likertTo100(promedio);
      const vetoed = totalVeto / totalCount > 0.10;
      result.push({ bloque, promedio, nota, contador: totalCount, vetoCount: totalVeto, vetoed });
    }
  }
  return result;
}

export interface DeptPenaltyInfo {
  penalizada: boolean;
  penalizacion: number;
  diferenciaPct: number;
  notaCuantitativa: number;
  notaCualitativa: number;
  notaFinal: number;
  vetoed: boolean;
}

/**
 * Calcula la penalización por discrepancia entre nota cuantitativa (bloques 1-4)
 * y nota cualitativa (bloque 5), más la regla de veto.
 * Todas las notas están sobre 100.
 */
export function calculatePenalty(
  notaCuantitativa: number,
  notaCualitativa: number,
  vetoCount: number,
  totalResponses: number,
): DeptPenaltyInfo {
  const diferenciaPct = notaCuantitativa > 0
    ? ((notaCuantitativa - notaCualitativa) / notaCuantitativa) * 100
    : 0;

  // Regla de Veto: >10% de empleados con veto → nota = 0
  const vetoed = totalResponses > 0 && vetoCount / totalResponses > 0.10;

  if (vetoed) {
    return {
      penalizada: true,
      penalizacion: notaCuantitativa,
      diferenciaPct,
      notaCuantitativa,
      notaCualitativa,
      notaFinal: 0,
      vetoed: true,
    };
  }

  let penalizacion = 0;
  if (diferenciaPct > 15) {
    // Penalización proporcional a la discrepancia.
    // 15% de diferencia → 1 punto. 50% de diferencia → 5 puntos. Máximo 5 puntos.
    // Esto permite dar feedback de mejora sin un "FALLIDA" directo.
    penalizacion = Math.min(5, Math.max(0, (diferenciaPct - 15) / 7));
  }

  const notaFinal = Math.max(0, notaCuantitativa - penalizacion);

  return {
    penalizada: penalizacion > 0,
    penalizacion,
    diferenciaPct,
    notaCuantitativa,
    notaCualitativa,
    notaFinal,
    vetoed: false,
  };
}

/**
 * Obtiene las puntuaciones por departamento. Aplica el filtro mínimo de 5 encuestas.
 * Incluye cálculo de penalizaciones y veto.
 */
export async function getDeptScores(empresaId: string): Promise<DeptScore[]> {
  const { data, error } = await supabase
    .from('respuestas_agregadas')
    .select('departamento, bloque, suma_puntuacion, contador_respuestas, veto_count')
    .eq('empresa_id', empresaId);
  if (error) throw error;
  if (!data || data.length === 0) return [];

  const deptMap: Record<string, Record<number, { sum: number; count: number; veto: number }>> = {};
  for (const row of data) {
    if (!deptMap[row.departamento]) deptMap[row.departamento] = {};
    deptMap[row.departamento][row.bloque] = {
      sum: row.suma_puntuacion,
      count: row.contador_respuestas,
      veto: row.veto_count ?? 0,
    };
  }

  const result: DeptScore[] = [];
  for (const [dept, blocks] of Object.entries(deptMap)) {
    const firstBlockCount = Object.values(blocks)[0]?.count ?? 0;
    if (firstBlockCount < 5) continue;

    // Calcular nota cuantitativa (media bloques 1-4) y cualitativa (bloque 5) sobre 100
    let cuantSum = 0;
    let cuantCount = 0;
    for (const bloque of [1, 2, 3, 4]) {
      const b = blocks[bloque];
      if (b && b.count > 0) {
        const numQ = QUESTIONS_PER_BLOCK[bloque] ?? 5;
        const promedio = b.sum / (b.count * numQ);
        cuantSum += likertTo100(promedio);
        cuantCount++;
      }
    }
    const notaCuantitativa = cuantCount > 0 ? cuantSum / cuantCount : 0;

    const b5 = blocks[5];
    const numQ5 = QUESTIONS_PER_BLOCK[5] ?? 5;
    const notaCualitativa = b5 && b5.count > 0 ? likertTo100(b5.sum / (b5.count * numQ5)) : 0;

    const b5ResponseCount = b5?.count ?? 0;
    const b5VetoCount = b5?.veto ?? 0;

    const penalty = calculatePenalty(notaCuantitativa, notaCualitativa, b5VetoCount, b5ResponseCount);

    for (const bloque of [1, 2, 3, 4, 5]) {
      const b = blocks[bloque];
      const numQuestions = QUESTIONS_PER_BLOCK[bloque] ?? 5;
      if (b && b.count > 0) {
        const promedio = b.sum / (b.count * numQuestions);
        const baseNota = likertTo100(promedio);
        const adjustedNota = bloque <= 4 && penalty.penalizada
          ? (penalty.vetoed ? 0 : penalty.notaFinal)
          : baseNota;
        result.push({
          departamento: dept,
          bloque,
          promedio,
          nota: adjustedNota,
          contador: b.count,
          vetoCount: bloque === 5 ? b.veto : undefined,
          vetoed: penalty.vetoed,
          penalizada: penalty.penalizada,
          penalizacion: penalty.penalizacion,
          diferenciaPct: penalty.diferenciaPct,
          notaCuantitativa: penalty.notaCuantitativa,
          notaCualitativa: penalty.notaCualitativa,
          notaFinal: penalty.notaFinal,
        });
      }
    }
  }
  return result;
}

export function getNotaColor(nota: number): { bg: string; text: string; border: string; label: string } {
  if (nota >= CERTIFICATE_THRESHOLD) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Certificable' };
  } else if (nota >= 65) {
    return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Precaución' };
  } else {
    return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Crítico' };
  }
}
