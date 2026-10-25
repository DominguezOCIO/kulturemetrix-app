import { ArrowLeft, Clock, Brain, Users, TrendingUp, ShieldCheck, Shuffle } from 'lucide-react';
import { QUESTIONS, BLOCKS, LIKERT_OPTIONS, BLOCK5_BANK, CLOSING_QUESTION } from '@/lib/questions';
import type { Empresa } from '@/lib/scoring';
import { Logo } from './Logo';

interface QuestionnairePreviewProps {
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

export function QuestionnairePreview({ empresa, onBack }: QuestionnairePreviewProps) {
  const fixedBlocks = BLOCKS.filter((b) => b.id <= 4);
  const block5 = BLOCKS.find((b) => b.id === 5)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition">
              <ArrowLeft className="h-4 w-4" /> Volver al panel
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <Logo className="h-9 w-40 text-slate-900" />
              <span className="font-bold text-slate-900">{empresa.nombre}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-slate-900">Cuestionario de bienestar laboral</h1>
          <p className="mt-1 text-sm text-slate-500">
            El cuestionario consta de 25 preguntas fijas (bloques 1-4), 5 preguntas aleatorias del banco cultural (bloque 5) y una pregunta final de control. Las respuestas son 100% anónimas.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <Clock className="h-5 w-5 flex-shrink-0 text-blue-600" />
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Vista de solo lectura.</span> Esta vista es informativa para la dirección.
            Los trabajadores responden únicamente a través de su enlace personal de un solo uso.
          </p>
        </div>

        {/* Escala Likert (bloques 1-4) */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-700">Escala de respuesta — Bloques 1 a 4</h3>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {LIKERT_OPTIONS.map((opt) => (
              <div key={opt.value} className="rounded-lg bg-slate-50 px-2 py-3 text-center">
                <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                  {opt.value}
                </div>
                <p className="mt-2 text-xs font-medium text-slate-600">{opt.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Preguntas fijas bloques 1-4 */}
        <div className="mt-6 space-y-6">
          {fixedBlocks.map((block) => {
            const blockQuestions = QUESTIONS.filter((q) => q.bloque === block.id);
            return (
              <div key={block.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    {BLOCK_ICONS[block.id]}
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Bloque {block.id}</p>
                    <h3 className="text-lg font-bold text-slate-900">{block.title}</h3>
                  </div>
                  <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                    {blockQuestions.length} preguntas
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  {blockQuestions.map((q, idx) => (
                    <div key={q.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                          {idx + 1}
                        </span>
                        <p className="text-sm font-medium text-slate-800">{q.text}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5 pl-9">
                        {LIKERT_OPTIONS.map((opt) => (
                          <span
                            key={opt.value}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500"
                          >
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                              {opt.value}
                            </span>
                            {opt.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bloque 5: Banco aleatorio */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              {BLOCK_ICONS[5]}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Bloque 5</p>
              <h3 className="text-lg font-bold text-slate-900">{block5.title}</h3>
            </div>
            <span className="ml-auto rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
              <Shuffle className="mr-1 inline h-3 w-3" />5 aleatorias de 10
            </span>
          </div>

          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <p className="text-sm text-slate-600">
              Cada trabajador recibe <strong>5 preguntas seleccionadas aleatoriamente</strong> de un banco de 10.
              Las opciones tienen puntuaciones de <strong>5, 3 o 1 puntos</strong> según la gravedad de la respuesta.
              Tras estas preguntas, se muestra una <strong>pregunta fija de cierre</strong> para detectar coacción.
            </p>
          </div>

          {/* Banco completo de 10 preguntas */}
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Banco completo (10 preguntas)</p>
          <div className="mt-3 space-y-4">
            {BLOCK5_BANK.map((q, idx) => (
              <div key={q.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-medium text-slate-800">{q.pregunta}</p>
                </div>
                <div className="mt-3 space-y-1.5 pl-9">
                  {q.opciones.map((opt, oidx) => (
                    <div key={oidx} className="flex items-center gap-2">
                      <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        opt.puntos === 5 ? 'bg-emerald-100 text-emerald-700' :
                        opt.puntos === 3 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {opt.puntos}
                      </span>
                      <span className="text-xs text-slate-600">{opt.texto}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pregunta fija de cierre */}
          <div className="mt-6 rounded-xl border-2 border-orange-200 bg-orange-50/50 p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-orange-600" />
              <p className="text-sm font-bold text-slate-900">Pregunta fija de cierre — Detección de coacción</p>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-800">{CLOSING_QUESTION.pregunta}</p>
            <div className="mt-3 space-y-1.5">
              {CLOSING_QUESTION.opciones.map((opt, oidx) => (
                <div key={oidx} className="flex items-start gap-2">
                  <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5 ${
                    opt.accion === 'trigger_veto_alert'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {opt.puntos}
                  </span>
                  <span className="text-xs text-slate-600">
                    {opt.texto}
                    {opt.accion === 'trigger_veto_alert' && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                        Activa alerta de coacción
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sistema de penalización */}
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <ShieldCheck className="h-5 w-5 text-amber-600" />
            Sistema de penalización y veto
          </h3>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="font-semibold text-slate-900">Discrepancia 15% - 30%</p>
              <p className="mt-1 text-slate-600">Si la diferencia entre la nota cuantitativa (bloques 1-4) y la cualitativa (bloque 5) está entre el 15% y 30%, se restan <strong>1.5 puntos directos</strong> al departamento.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="font-semibold text-slate-900">Discrepancia superior al 30%</p>
              <p className="mt-1 text-slate-600">Si la diferencia supera el 30%, se aplica una penalización del <strong>35% sobre el valor total</strong> de la nota del departamento.</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="font-semibold text-red-800">Regla de veto — Coacción crítica</p>
              <p className="mt-1 text-red-700">Si más del 10% de los empleados de un departamento responden que sintieron coacción en la pregunta final, el departamento se <strong>invalida (nota = 0)</strong> y se muestra una alerta de "Coacción Crítica".</p>
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al panel
        </button>
      </div>
    </div>
  );
}
