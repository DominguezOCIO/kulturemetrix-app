import { useState, useEffect, useCallback } from 'react';
import {
  Mail, Users, Clock, CheckCircle2, Tag, Send, Loader2,
  RefreshCw, AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { Empresa } from '@/lib/scoring';
import {
  fetchTrabajadoresAgrupados, getTrabajadoresStats,
  fetchPendingTrabajadores, hasActiveCampaign,
} from '@/lib/trabajadores';
import type { TrabajadoresStats, TrabajadorPendiente } from '@/lib/trabajadores';
import { resendCampaignEmails } from '@/lib/campaign';

interface CampaignPanelProps {
  empresa: Empresa;
  onSent?: () => void;
}

export function CampaignPanel({ empresa, onSent }: CampaignPanelProps) {
  const [stats, setStats] = useState<TrabajadoresStats>({ total: 0, completados: 0, pendientes: 0, participacion: 0, porDepartamento: [] });
  const [loadingStats, setLoadingStats] = useState(true);
  const [workers, setWorkers] = useState<Record<string, { email: string; departamento_id: string }[]>>({});
  const [pending, setPending] = useState<TrabajadorPendiente[]>([]);
  const [showPending, setShowPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendResult, setResendResult] = useState<{ sent: number; failed: number } | null>(null);
  const [campaignActive, setCampaignActive] = useState(false);

  const loadAll = useCallback(async () => {
    const [s, grouped, pendingList, active] = await Promise.all([
      getTrabajadoresStats(empresa.id).catch(() => ({ total: 0, completados: 0, pendientes: 0, participacion: 0, porDepartamento: [] })),
      fetchTrabajadoresAgrupados(empresa.id).catch(() => ({} as Record<string, { email: string; departamento_id: string }[]>)),
      fetchPendingTrabajadores(empresa.id).catch(() => [] as TrabajadorPendiente[]),
      hasActiveCampaign(empresa.id).catch(() => false),
    ]);
    setStats(s);
    setWorkers(grouped);
    setPending(pendingList);
    setCampaignActive(active);
    setLoadingStats(false);
  }, [empresa.id]);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 15000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const totalWorkers = Object.values(workers).reduce((acc, list) => acc + list.length, 0);

  const handleResend = async () => {
    const pendingEmails = pending.filter((p) => p.has_invitation).map((p) => p.email);
    if (pendingEmails.length === 0) return;
    setResending(true);
    setResendResult(null);
    try {
      const result = await resendCampaignEmails(empresa.id, empresa.nombre, pendingEmails);
      if (result.success) {
        setResendResult({ sent: result.sent || 0, failed: result.failed || 0 });
        await loadAll();
        onSent?.();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResending(false);
    }
  };

  if (loadingStats) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Estado de la campaña</h3>
            <p className="text-xs text-slate-500">Cargando datos…</p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Estado de la campaña</h3>
            <p className="text-xs text-slate-500">
              {campaignActive ? 'Campaña activa — seguimiento en tiempo real' : 'Aún no se ha activado ninguna campaña'}
            </p>
          </div>
        </div>
        <button onClick={loadAll} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" title="Actualizar">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {stats.total > 0 ? (
        <>
          {/* Stats: Enviados / Realizados / Pendientes */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-slate-500">
                <Mail className="h-4 w-4" />
              </div>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">Enviados</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.completados}</p>
              <p className="text-xs text-emerald-600">Realizados</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
              <p className="mt-1 text-2xl font-bold text-amber-700">{stats.pendientes}</p>
              <p className="text-xs text-amber-600">Pendientes</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Progreso global de participación</span>
              <span>{stats.completados} de {stats.total} ({stats.participacion}%)</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-1000"
                style={{ width: `${stats.participacion}%` }}
              />
            </div>
            {stats.pendientes > 0 && (
              <p className="mt-2 text-xs text-slate-500">
                Faltan <strong className="text-amber-600">{stats.pendientes}</strong> trabajador{stats.pendientes !== 1 ? 'es' : ''} por completar la encuesta.
              </p>
            )}
            {stats.pendientes === 0 && stats.total > 0 && (
              <p className="mt-2 text-xs font-semibold text-emerald-600">Todos los trabajadores han completado la encuesta.</p>
            )}
          </div>

          {/* Per-department breakdown */}
          {stats.porDepartamento.length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <h4 className="text-sm font-bold text-slate-900">Participación por departamento</h4>
              <div className="mt-3 space-y-3">
                {stats.porDepartamento.map((d) => (
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

          {/* Pending workers table */}
          {campaignActive && pending.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowPending(!showPending)}
                className="flex w-full items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left transition hover:bg-amber-100"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">
                    {pending.length} trabajador{pending.length !== 1 ? 'es' : ''} pendiente{pending.length !== 1 ? 's' : ''} de completar
                  </span>
                </div>
                {showPending ? <ChevronUp className="h-4 w-4 text-amber-600" /> : <ChevronDown className="h-4 w-4 text-amber-600" />}
              </button>

              {showPending && (
                <div className="mt-2 overflow-hidden rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Listado de pendientes</span>
                    <button
                      onClick={handleResend}
                      disabled={resending || !pending.some((p) => p.has_invitation)}
                      className="flex items-center gap-1.5 rounded-lg bg-[#205072] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1a3f5e] disabled:opacity-50"
                    >
                      {resending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      Reenviar recordatorio
                    </button>
                  </div>
                  {resendResult && (
                    <div className="border-b border-slate-200 bg-blue-50 px-4 py-2">
                      <p className="text-xs text-blue-700">
                        Recordatorio enviado: {resendResult.sent} correo{resendResult.sent !== 1 ? 's' : ''} enviado{resendResult.sent !== 1 ? 's' : ''}{resendResult.failed > 0 ? `, ${resendResult.failed} fallido${resendResult.failed !== 1 ? 's' : ''}` : ''}.
                      </p>
                    </div>
                  )}
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-white text-xs uppercase tracking-wide text-slate-400">
                        <tr>
                          <th className="px-4 py-2 font-semibold">Correo</th>
                          <th className="px-4 py-2 font-semibold">Departamento</th>
                          <th className="px-4 py-2 font-semibold">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pending.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 transition">
                            <td className="px-4 py-2.5 font-medium text-slate-700">{p.email}</td>
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                <Tag className="h-3 w-3 text-[#43B59C]" />
                                {p.departamento_nombre}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              {p.has_invitation ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Pendiente
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />Sin invitación
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Worker list grouped by department */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">
                Trabajadores registrados
              </label>
              <span className="text-xs font-medium text-slate-500">{totalWorkers} en total</span>
            </div>

            {totalWorkers === 0 ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                <Users className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">No hay trabajadores registrados todavía.</p>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {Object.entries(workers).map(([deptName, workerList]) => (
                  <div key={deptName} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-[#43B59C]" />
                      <span className="text-sm font-semibold text-slate-700">{deptName}</span>
                      <span className="ml-auto text-xs font-medium text-slate-400">{workerList.length} trabajador{workerList.length !== 1 ? 'es' : ''}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {workerList.map((w, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs text-slate-600 border border-slate-200">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {w.email}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
          <Mail className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">Aún no hay trabajadores registrados para la campaña.</p>
        </div>
      )}
    </div>
  );
}
