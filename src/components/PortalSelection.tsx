import { LayoutDashboard, ArrowLeft, Eye } from 'lucide-react';
import type { Empresa } from '@/lib/scoring';
import { Logo } from './Logo';

interface PortalSelectionProps {
  empresa: Empresa;
  onSelectQuestionnaire: () => void;
  onSelectDashboard: () => void;
  onBack: () => void;
}

export function PortalSelection({ empresa, onSelectQuestionnaire, onSelectDashboard, onBack }: PortalSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <button onClick={onBack} className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition">
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>

        <div className="mb-10 flex items-center gap-4">
          <Logo className="h-14 w-64 text-slate-900" />
          <p className="text-sm text-slate-500">Empresa: <span className="font-medium text-slate-700">{empresa.nombre}</span></p>
        </div>

        <h2 className="text-3xl font-bold text-slate-900">¿Qué deseas hacer?</h2>
        <p className="mt-2 text-slate-500">Selecciona una opción para continuar.</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {/* Ver cuestionario */}
          <button
            onClick={onSelectQuestionnaire}
            className="group flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:border-orange-300 hover:shadow-lg"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition group-hover:bg-orange-100">
              <Eye className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-slate-900">Ver cuestionario</h3>
            <p className="mt-2 text-sm text-slate-500">
              Consulta las 25 preguntas fijas, las preguntas aleatorias y las opciones de respuesta que reciben los trabajadores. Vista de solo lectura para la dirección.
            </p>
            <span className="mt-4 text-sm font-semibold text-orange-600 group-hover:text-orange-700">Ver preguntas →</span>
          </button>

          {/* Dashboard */}
          <button
            onClick={onSelectDashboard}
            className="group flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:border-blue-300 hover:shadow-lg"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
              <LayoutDashboard className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-slate-900">Panel de empresa</h3>
            <p className="mt-2 text-sm text-slate-500">
              Accede al dashboard analítico con KPIs, gráficos por bloque temático, comparativa por departamentos y plan de acción.
            </p>
            <span className="mt-4 text-sm font-semibold text-blue-600 group-hover:text-blue-700">Ver dashboard →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
