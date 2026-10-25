import { useState, useEffect } from 'react';
import { Mail, Users, Clock, CheckCircle2, Tag } from 'lucide-react';
import type { Empresa } from '@/lib/scoring';
import { fetchTrabajadoresAgrupados, getTrabajadoresStats } from '@/lib/trabajadores';
import type { TrabajadoresStats } from '@/lib/trabajadores';

interface CampaignPanelProps {
  empresa: Empresa;
  onSent?: () => void;
}

export function CampaignPanel({ empresa }: CampaignPanelProps) {
  const [stats, setStats] = useState<TrabajadoresStats>({ total: 0, completados: 0, pendientes: 0, participacion: 0, porDepartamento: [] });
  const [loadingStats, setLoadingStats] = useState(true);
  const [workers, setWorkers] = useState<Record<string, { email: string; departamento_id: string }[]>>({});
  const [loadingWorkers, setLoadingWorkers] = useState(true);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const s = await getTrabajadoresStats(empresa.id);
      setStats(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
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
  }, [empresa.id]);

  const totalWorkers = Object.values(workers).reduce((acc, list) => acc + list.length, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Estado de la campaña</h3>
          <p className="text-xs text-slate-500">Seguimiento de los enlaces enviados a través del CSV de trabajadores</p>
        </div>
      </div>

      {/* Stats: Enviados / Realizados / Pendientes */}
      {loadingStats ? (
        <div className="mt-5 flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
        </div>
      ) : stats.total > 0 ? (
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
      ) : (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
          <Mail className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">Aún no hay trabajadores registrados para la campaña.</p>
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
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
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
    </div>
  );
}
