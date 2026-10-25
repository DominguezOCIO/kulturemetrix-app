import { useState, useEffect } from 'react';
import { Mail, Send, Loader2, CheckCircle2, AlertCircle, Users, Clock, Check, Tag } from 'lucide-react';
import { launchCampaign, getCampaignStats } from '@/lib/campaign';
import type { CampaignResult } from '@/lib/campaign';
import type { Empresa } from '@/lib/scoring';
import { fetchTrabajadoresAgrupados } from '@/lib/trabajadores';

interface CampaignPanelProps {
  empresa: Empresa;
  onSent?: () => void;
}

export function CampaignPanel({ empresa, onSent }: CampaignPanelProps) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<CampaignResult | null>(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, used: 0, pending: 0 });
  const [workers, setWorkers] = useState<Record<string, { email: string; departamento_id: string }[]>>({});
  const [loadingWorkers, setLoadingWorkers] = useState(true);

  const loadStats = async () => {
    try {
      const s = await getCampaignStats(empresa.id);
      setStats(s);
    } catch (err) {
      console.error(err);
    }
  };

  const loadWorkers = async () => {
    setLoadingWorkers(true);
    try {
      const grouped = await fetchTrabajadoresAgrupados(empresa.id);
      setWorkers(grouped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWorkers(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadWorkers();
  }, []);

  const totalWorkers = Object.values(workers).reduce((acc, list) => acc + list.length, 0);

  const handleLaunch = async () => {
    if (totalWorkers === 0) {
      setError('No hay trabajadores registrados para esta empresa.');
      return;
    }

    setSending(true);
    setError('');
    setResult(null);

    try {
      const res = await launchCampaign(empresa.id, empresa.nombre, []);
      setResult(res);
      if (res.success) {
        await loadStats();
        onSent?.();
      } else {
        setError(res.error || 'Error al lanzar la campaña.');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Lanzar Campaña de Encuesta</h3>
          <p className="text-xs text-slate-500">Los enlaces se generan automáticamente a partir de los trabajadores registrados</p>
        </div>
      </div>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-500">
              <Users className="h-4 w-4" />
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-500">Enviados</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.used}</p>
            <p className="text-xs text-emerald-600">Completados</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
            <p className="mt-1 text-2xl font-bold text-amber-700">{stats.pending}</p>
            <p className="text-xs text-amber-600">Pendientes</p>
          </div>
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

        {loadingWorkers ? (
          <div className="mt-3 flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : totalWorkers === 0 ? (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
            <Users className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No hay trabajadores registrados todavía.</p>
            <p className="mt-1 text-xs text-slate-400">Los empleados pueden registrarse desde la página principal de la plataforma.</p>
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

      {/* Privacy notice */}
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <Check className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-blue-900">Privacidad garantizada</p>
          <p className="mt-1 text-xs text-blue-700">
            Cada token se genera con el departamento incrustado para segmentar resultados automáticamente.
            Los correos nunca se vinculan con las respuestas: el anonimato es absoluto.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success result */}
      {result?.success && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="font-semibold text-emerald-800">
              Campaña procesada con éxito{result.from_email ? ` desde ${result.from_email}` : ''}
            </p>
          </div>
          <p className="mt-2 text-sm text-emerald-700">
            {result.count} enlace{result.count !== 1 ? 's' : ''} generado{result.count !== 1 ? 's' : ''}. {result.sent} correo{result.sent !== 1 ? 's' : ''} enviado{result.sent !== 1 ? 's' : ''} correctamente.
            {result.failed ? ` ${result.failed} fallaron.` : ''}
          </p>
        </div>
      )}

      {/* Launch button */}
      <button
        onClick={handleLaunch}
        disabled={sending || totalWorkers === 0}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-400 hover:to-red-500 disabled:opacity-50"
      >
        {sending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Enviando campaña…</>
        ) : (
          <><Send className="h-4 w-4" /> Lanzar campaña ({totalWorkers} trabajador{totalWorkers !== 1 ? 'es' : ''})</>
        )}
      </button>
    </div>
  );
}
