import { useEffect, useState, useMemo } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft, Download, AlertTriangle, Lightbulb, TrendingUp,
  Users, Clock, Brain, Trophy, Loader2, BarChart3, ShieldAlert,
  ShieldCheck, Ban, Scale, Target, Sparkles, ChevronRight, Rocket,
  CheckCircle2, Mail,
} from 'lucide-react';
import { BLOCKS, ACTION_PLANS } from '@/lib/questions';
import { getEmpresaBlockScores, getDeptScores, getNotaColor, CERTIFICATE_THRESHOLD } from '@/lib/scoring';
import type { Empresa, BlockScore, DeptScore } from '@/lib/scoring';
import { getTrabajadoresStats } from '@/lib/trabajadores';
import type { TrabajadoresStats } from '@/lib/trabajadores';
import { CertificateModal } from './CertificateModal';
import { Logo } from './Logo';

interface DashboardProps {
  empresa: Empresa;
  onBack: () => void;
}

const BLOCK_ICONS: Record<number, React.ReactNode> = {
  1: <Clock className="h-5 w-5" />,
  2: <Brain className="h-5 w-5" />,
  3: <Users className="h-5 w-5" />,
  4: <TrendingUp className="h-5 w-5" />,
  5: <ShieldCheck className="h-5 w-5" />,
};

// Circular gauge component — renders an SVG progress ring with the score
function ScoreGauge({ score, threshold }: { score: number; threshold: number }) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, score));
  const offset = circumference - (pct / 100) * circumference;
  const passed = score >= threshold;

  const ringColor = passed ? '#059669' : score >= 65 ? '#f59e0b' : '#dc2626';
  const bgColor = passed ? '#059669' : score >= 65 ? '#f59e0b' : '#dc2626';

  return (
    <div className="relative flex items-center justify-center">
      <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90">
        {/* Track */}
        <circle
          cx="110" cy="110" r={radius}
          fill="none" stroke="#e2e8f0" strokeWidth="14"
        />
        {/* Progress */}
        <circle
          cx="110" cy="110" r={radius}
          fill="none" stroke={ringColor} strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease' }}
        />
        {/* Threshold marker at 85% */}
        <circle
          cx="110" cy="110" r={radius}
          fill="none" stroke="#0f172a" strokeWidth="2"
          strokeDasharray="2 6"
          strokeDashoffset={circumference - (threshold / 100) * circumference}
          opacity={0.3}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className="text-5xl font-bold"
          style={{ color: bgColor }}
        >
          {score.toFixed(0)}
        </span>
        <span className="text-sm font-medium text-slate-400">/ 100</span>
        <div
          className={`mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            passed
              ? 'bg-emerald-50 text-emerald-700'
              : score >= 65
                ? 'bg-amber-50 text-amber-700'
                : 'bg-red-50 text-red-700'
          }`}
        >
          {passed ? 'Certificable' : score >= 65 ? 'Precaución' : 'Crítico'}
        </div>
      </div>
    </div>
  );
}

export function Dashboard({ empresa, onBack }: DashboardProps) {
  const [blockScores, setBlockScores] = useState<BlockScore[]>([]);
  const [deptScores, setDeptScores] = useState<DeptScore[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('__global__');
  const [loading, setLoading] = useState(true);
  const [showCert, setShowCert] = useState(false);
  const [trabStats, setTrabStats] = useState<TrabajadoresStats>({ total: 0, completados: 0, pendientes: 0, participacion: 0, porDepartamento: [] });
  const [loadingTrabStats, setLoadingTrabStats] = useState(true);

  useEffect(() => {
    loadData();
    loadTrabStats();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [blocks, depts] = await Promise.all([
        getEmpresaBlockScores(empresa.id),
        getDeptScores(empresa.id),
      ]);
      setBlockScores(blocks);
      setDeptScores(depts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTrabStats = async () => {
    setLoadingTrabStats(true);
    try {
      const s = await getTrabajadoresStats(empresa.id);
      setTrabStats(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTrabStats(false);
    }
  };

  const departments = useMemo(
    () => [...new Set(deptScores.map((d) => d.departamento))],
    [deptScores],
  );

  const displayScores = useMemo(() => {
    if (selectedDept === '__global__') return blockScores;
    return deptScores.filter((d) => d.departamento === selectedDept);
  }, [selectedDept, blockScores, deptScores]);

  const deptMeetsMinimum = useMemo(() => {
    if (selectedDept === '__global__') return true;
    const deptData = deptScores.filter((d) => d.departamento === selectedDept);
    if (deptData.length === 0) return false;
    return deptData[0].contador >= 5;
  }, [selectedDept, deptScores]);

  const notaGlobal = empresa.nota_global;
  const notaInfo = getNotaColor(notaGlobal);
  const isCertified = notaGlobal >= CERTIFICATE_THRESHOLD;

  const radarData = BLOCKS.map((b) => {
    const score = displayScores.find((s) => s.bloque === b.id);
    return {
      bloque: b.short,
      nota: score ? Math.round(score.nota * 10) / 10 : 0,
    };
  });

  const weakestBlock = useMemo(() => {
    if (displayScores.length === 0) return null;
    let min = displayScores[0];
    for (const s of displayScores) {
      if (s.nota < min.nota) min = s;
    }
    return min;
  }, [displayScores]);

  const deptBarData = useMemo(() => {
    return departments.map((dept) => {
      const deptBlocks = deptScores.filter((d) => d.departamento === dept && d.bloque <= 4);
      const deptB1 = deptBlocks[0];
      const useFinal = deptB1?.penalizada;
      const avg = deptBlocks.reduce((acc, d) => acc + d.nota, 0) / (deptBlocks.length || 1);
      const finalNota = useFinal && deptB1?.notaFinal !== undefined ? deptB1.notaFinal : avg;
      return { departamento: dept, nota: Math.round(finalNota * 10) / 10 };
    });
  }, [departments, deptScores]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-500" />
          <p className="mt-4 text-slate-500">Cargando analíticas…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition">
                <ArrowLeft className="h-4 w-4" /> Inicio
              </button>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-3">
                <Logo className="h-9 w-40 text-slate-900" />
                <span className="font-bold text-slate-900">{empresa.nombre}</span>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${isCertified ? 'bg-emerald-500 text-white' : notaGlobal > 0 ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
              <span className="h-2 w-2 rounded-full bg-white/80" />
              {isCertified ? 'CERTIFICADA' : notaGlobal > 0 ? 'FALLIDA' : 'AUDITANDO'}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Participation panel */}
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Participación de la plantilla</h2>
          {loadingTrabStats ? (
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-10">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : trabStats.total === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <Users className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">Aún no hay trabajadores registrados para tu empresa.</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Mail className="h-5 w-5 text-slate-600" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-slate-900">{trabStats.total}</p>
                  <p className="text-xs text-slate-500">Enviados</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-emerald-700">{trabStats.completados}</p>
                  <p className="text-xs text-emerald-600">Realizados</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <p className="mt-3 text-3xl font-bold text-amber-700">{trabStats.pendientes}</p>
                  <p className="text-xs text-amber-600">Pendientes</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>Tasa de participación general</span>
                  <span>{trabStats.participacion}% completado</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-1000"
                    style={{ width: `${trabStats.participacion}%` }}
                  />
                </div>
              </div>

              {trabStats.porDepartamento.length > 0 && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
                  <h3 className="font-bold text-slate-900">Participación por departamento</h3>
                  <div className="mt-4 space-y-4">
                    {trabStats.porDepartamento.map((d) => (
                      <div key={d.nombre}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">{d.nombre}</span>
                          <span className="text-slate-500">
                            <span className="font-semibold text-emerald-600">{d.completados}</span>
                            <span className="text-slate-400"> / {d.total}</span>
                            <span className="ml-2 text-slate-700">{d.participacion}%</span>
                          </span>
                        </div>
                        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700"
                            style={{ width: `${d.participacion}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* KPI Header with circular gauge */}
        <div className={`rounded-2xl border-2 p-8 ${notaInfo.border} ${notaInfo.bg}`}>
          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row lg:items-center">
            {/* Left: gauge + label */}
            <div className="flex flex-col items-center gap-4">
              <ScoreGauge score={notaGlobal} threshold={CERTIFICATE_THRESHOLD} />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Nota Global Corporativa</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  {isCertified ? (
                    <Trophy className="h-5 w-5 text-emerald-600" />
                  ) : notaGlobal >= 65 ? (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  ) : (
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`text-sm font-semibold ${notaInfo.text}`}>
                    Umbral de certificación: {CERTIFICATE_THRESHOLD} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Right: certificate or upsell */}
            <div className="w-full lg:flex-1">
              {isCertified ? (
                <div className="rounded-xl border-2 border-emerald-200 bg-white p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">¡Empresa Certificada!</h3>
                      <p className="text-sm text-slate-500">
                        Has superado el umbral de {CERTIFICATE_THRESHOLD} puntos. Tu organización demuestra un nivel de bienestar laboral ejemplar.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCert(true)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:from-emerald-500 hover:to-emerald-600"
                  >
                    <Download className="h-5 w-5" />
                    Descargar Certificado Oficial de Bienestar Corporativo KULTUREMETRIX
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-slate-200 bg-white p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/20">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Aún no alcanzas la certificación</h3>
                      <p className="text-sm text-slate-500">
                        Tu puntuación actual es de <span className="font-bold text-slate-700">{notaGlobal.toFixed(1)} / 100</span>.
                        Necesitas al menos <span className="font-bold text-emerald-600">{CERTIFICATE_THRESHOLD} puntos</span> para obtener el Certificado Oficial de Bienestar Corporativo.
                      </p>
                    </div>
                  </div>

                  {/* Progress bar to certification */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                      <span>Progreso hacia la certificación</span>
                      <span>{Math.min(100, Math.round((notaGlobal / CERTIFICATE_THRESHOLD) * 100))}%</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min(100, (notaGlobal / CERTIFICATE_THRESHOLD) * 100)}%`,
                          background: notaGlobal >= 65
                            ? 'linear-gradient(to right, #f59e0b, #ea580c)'
                            : 'linear-gradient(to right, #dc2626, #ea580c)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Upsell CTA */}
                  <div className="mt-5 rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 p-5">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 flex-shrink-0 text-orange-600" />
                      <div>
                        <p className="font-semibold text-slate-800">¿Quieres alcanzar la certificación?</p>
                        <p className="mt-1 text-sm text-slate-600">
                          Contrata nuestra <strong>consultoría especializada</strong> o mejora a un plan <strong>PRO / ENTERPRISE</strong> para implementar planes de mejora guiados, auditorías continuas y volver a auditarte hasta conseguir el sello KultureMetrix.
                        </p>
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                          <button className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-orange-400 hover:to-red-500">
                            <Rocket className="h-4 w-4" />
                            Hablar con un consultor
                          </button>
                          <button className="flex items-center justify-center gap-2 rounded-lg border border-orange-300 bg-white px-5 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-50">
                            Ver planes PRO / ENTERPRISE
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mini KPIs por bloque */}
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
            {BLOCKS.map((b) => {
              const score = blockScores.find((s) => s.bloque === b.id);
              const nota = score ? score.nota : 0;
              const info = getNotaColor(nota);
              return (
                <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    {BLOCK_ICONS[b.id]}
                    <span className="text-xs font-medium">{b.short}</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className={`text-2xl font-bold ${info.text}`}>{nota.toFixed(0)}</span>
                    <span className="text-xs text-slate-400">/100</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {score ? `${score.contador} respuestas` : 'Sin datos'}
                  </div>
                  {b.id === 5 && score && score.vetoCount && score.vetoCount > 0 && (
                    <div className="mt-1 text-xs font-medium text-red-600">
                      {score.vetoed ? 'Coacción crítica' : `${score.vetoCount} alertas de coacción`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Filtro de departamento */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Análisis por departamento</h2>
            <p className="text-sm text-slate-500">Los datos se muestran solo si el departamento tiene ≥ 5 encuestas completadas.</p>
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="__global__">Vista global (toda la empresa)</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Alerta de filtro mínimo */}
        {selectedDept !== '__global__' && !deptMeetsMinimum && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <ShieldAlert className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800">Datos insuficientes para mostrar</p>
              <p className="text-sm text-amber-700">
                El departamento <strong>{selectedDept}</strong> no alcanza el mínimo de 5 encuestas completadas. Por seguridad y privacidad de los datos, los resultados no se muestran.
              </p>
            </div>
          </div>
        )}

        {/* Alerta de Coacción Crítica (Veto) */}
        {selectedDept !== '__global__' && (() => {
          const deptB5 = deptScores.find((d) => d.departamento === selectedDept && d.bloque === 5);
          if (!deptB5?.vetoed) return null;
          return (
            <div className="mt-4 flex items-start gap-3 rounded-xl border-2 border-red-300 bg-red-50 p-5">
              <Ban className="h-6 w-6 flex-shrink-0 text-red-600" />
              <div>
                <p className="font-bold text-red-800">Coacción Crítica — Departamento Invalidado</p>
                <p className="mt-1 text-sm text-red-700">
                  Más del 10% de los empleados de <strong>{selectedDept}</strong> han reportado haber sentido presión o coacción al responder la encuesta.
                  Por seguridad, la nota de este departamento se ha establecido en <strong>0.0</strong> y sus resultados no se consideran válidos.
                  Se recomienda una investigación confidencial inmediata sobre las prácticas de liderazgo en este departamento.
                </p>
              </div>
            </div>
          );
        })()}

        {/* Alerta de Penalización por Discrepancia */}
        {selectedDept !== '__global__' && (() => {
          const deptData = deptScores.find((d) => d.departamento === selectedDept && d.bloque === 1);
          if (!deptData?.penalizada || deptData.vetoed) return null;
          return (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-5">
              <Scale className="h-6 w-6 flex-shrink-0 text-orange-600" />
              <div>
                <p className="font-bold text-orange-800">Penalización por Discrepancia Cultural</p>
                <p className="mt-1 text-sm text-orange-700">
                  Se ha detectado una diferencia del <strong>{Math.round(deptData.diferenciaPct ?? 0)}%</strong> entre la nota cuantitativa
                  ({(deptData.notaCuantitativa ?? 0).toFixed(1)}) y la cualitativa ({(deptData.notaCualitativa ?? 0).toFixed(1)}).
                  {deptData.diferenciaPct && deptData.diferenciaPct > 30
                    ? ' Al superar el 30%, se ha aplicado una penalización del 35% sobre la nota total.'
                    : ' Al estar entre el 15% y 30%, se han restado 15 puntos directos.'}
                  {' '}Nota final: <strong>{(deptData.notaFinal ?? 0).toFixed(1)} / 100</strong> (penalización: -{(deptData.penalizacion ?? 0).toFixed(1)}).
                </p>
              </div>
            </div>
          );
        })()}

        {/* Charts section */}
        {deptMeetsMinimum && displayScores.length > 0 ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Radar chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-slate-400" />
                <h3 className="font-bold text-slate-900">Perfil de bienestar por bloque</h3>
              </div>
              <p className="mt-1 text-xs text-slate-500">Notas sobre 100 por bloque temático</p>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="bloque" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Radar name="Nota" dataKey="nota" stroke="#ea580c" fill="#ea580c" fillOpacity={0.3} strokeWidth={2} />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(1)} / 100`, 'Nota']} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar chart - departamentos */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-slate-400" />
                <h3 className="font-bold text-slate-900">Comparativa por departamento</h3>
              </div>
              <p className="mt-1 text-xs text-slate-500">Nota global sobre 100</p>
              <div className="mt-4 h-72">
                {deptBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="departamento" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(1)} / 100`, 'Nota']} cursor={{ fill: '#f1f5f9' }} />
                      <Bar dataKey="nota" fill="#0284c7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    Sin datos suficientes por departamento
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : deptMeetsMinimum && displayScores.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-4 font-semibold text-slate-700">Aún no hay datos</h3>
            <p className="mt-1 text-sm text-slate-500">Cuando los empleados completen la encuesta, aquí verás las analíticas.</p>
          </div>
        ) : null}

        {/* Plan de acción IA */}
        {deptMeetsMinimum && weakestBlock && (
          <div className="mt-8 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-slate-50 p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Plan de Acción — Recomendación Automática</h3>
                <p className="text-xs text-slate-500">Generado a partir del bloque con menor puntuación</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Área detectada como prioritaria:</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    {BLOCK_ICONS[weakestBlock.bloque]}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {BLOCKS.find((b) => b.id === weakestBlock.bloque)?.title}
                  </span>
                </div>
                <span className="text-lg font-bold text-red-600">{weakestBlock.nota.toFixed(1)} / 100</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {ACTION_PLANS[weakestBlock.bloque].map((suggestion, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {idx + 1}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCert && (
        <CertificateModal empresa={empresa} notaGlobal={notaGlobal} onClose={() => setShowCert(false)} />
      )}
    </div>
  );
}
