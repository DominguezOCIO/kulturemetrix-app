import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2, AlertCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { QUESTIONS, BLOCKS, LIKERT_OPTIONS, BLOCK5_BANK, pickRandomBlock5Questions, CLOSING_QUESTION, BLOCK5_QUESTION_COUNT, type Bank5Question } from '@/lib/questions';
import { submitSurvey } from '@/lib/scoring';
import { validateToken } from '@/lib/campaign';
import type { Empresa } from '@/lib/scoring';
import { Logo } from './Logo';

interface SurveyProps {
  empresa: Empresa;
  token: string;
  onComplete: () => void;
  onBack: () => void;
  departamentoPreselected?: string;
}

interface SavedProgress {
  step: number;
  answers: Record<string, number>;
  block5Answers: Record<string, number>;
  closingAnswer: number | null;
  block5QuestionIds: string[];
}

export function Survey({ empresa, token, onComplete, onBack, departamentoPreselected }: SurveyProps) {
  const progressKey = `km-survey-${token}`;

  const [savedInit] = useState<SavedProgress | null>(() => {
    try {
      const raw = localStorage.getItem(progressKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SavedProgress;
      if (typeof parsed.step !== 'number') return null;
      return parsed;
    } catch {
      return null;
    }
  });

  // Restore the same Block 5 questions if resuming, otherwise pick fresh
  const [block5Questions] = useState<Bank5Question[]>(() => {
    if (savedInit?.block5QuestionIds?.length) {
      const restored = savedInit.block5QuestionIds
        .map((id) => BLOCK5_BANK.find((q) => q.id === id))
        .filter((q): q is Bank5Question => q != null);
      if (restored.length === BLOCK5_QUESTION_COUNT) return restored;
    }
    return pickRandomBlock5Questions(BLOCK5_QUESTION_COUNT);
  });

  const totalBlockQuestions = QUESTIONS.length; // 20
  const block5Start = totalBlockQuestions + 1; // step 21
  const block5End = totalBlockQuestions + block5Questions.length; // step 25
  const closingStep = block5End + 1; // step 26
  const doneStep = closingStep + 1; // step 27

  const [step, setStep] = useState(() =>
    savedInit && savedInit.step > 0 && savedInit.step < doneStep ? savedInit.step : 0,
  );
  const [departamento, setDepartamento] = useState(departamentoPreselected || '');
  const [answers, setAnswers] = useState<Record<string, number>>(savedInit?.answers ?? {});
  const [block5Answers, setBlock5Answers] = useState<Record<string, number>>(savedInit?.block5Answers ?? {});
  const [closingAnswer, setClosingAnswer] = useState<number | null>(savedInit?.closingAnswer ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Persist progress so the worker can resume if they leave before submitting.
  // Cleared automatically once the survey is submitted (step >= doneStep).
  useEffect(() => {
    if (step >= doneStep) {
      try { localStorage.removeItem(progressKey); } catch { /* ignore */ }
      return;
    }
    if (step === 0) return;
    const progress: SavedProgress = {
      step,
      answers,
      block5Answers,
      closingAnswer,
      block5QuestionIds: block5Questions.map((q) => q.id),
    };
    try {
      localStorage.setItem(progressKey, JSON.stringify(progress));
    } catch { /* ignore */ }
  }, [progressKey, step, answers, block5Answers, closingAnswer, block5Questions, doneStep]);

  // Current question context
  const isBlock1to4 = step >= 1 && step <= totalBlockQuestions;
  const isBlock5 = step >= block5Start && step <= block5End;
  const isClosing = step === closingStep;

  const currentQ = isBlock1to4 ? QUESTIONS[step - 1] : null;
  const currentB5Q: Bank5Question | null = isBlock5 ? block5Questions[step - block5Start] : null;

  const answeredCount = Object.keys(answers).length + Object.keys(block5Answers).length + (closingAnswer !== null ? 1 : 0);
  const totalAllQuestions = totalBlockQuestions + block5Questions.length + 1; // 26
  const progress = step === 0 ? 0 : Math.round((answeredCount / totalAllQuestions) * 100);

  const handleLikertAnswer = (value: number) => {
    if (!currentQ) return;
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);
    if (step < totalBlockQuestions) {
      setTimeout(() => setStep(step + 1), 200);
    } else {
      setTimeout(() => setStep(block5Start), 200);
    }
  };

  const handleBlock5Answer = (value: number) => {
    if (!currentB5Q) return;
    const newAnswers = { ...block5Answers, [currentB5Q.id]: value };
    setBlock5Answers(newAnswers);
    if (step < block5End) {
      setTimeout(() => setStep(step + 1), 200);
    } else {
      setTimeout(() => setStep(closingStep), 200);
    }
  };

  const handleClosingAnswer = (value: number) => {
    setClosingAnswer(value);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      // Calculate Block 5 sum from random questions
      let block5Sum = 0;
      for (const q of block5Questions) {
        block5Sum += block5Answers[q.id] ?? 0;
      }

      // Check if veto was triggered
      const closingOption = CLOSING_QUESTION.opciones[closingAnswer ?? 0];
      const triggeredVeto = closingOption?.accion === 'trigger_veto_alert';

      await submitSurvey(token, departamento, answers, { block5Sum, triggeredVeto });
      setStep(doneStep);
    } catch (err) {
      setError('Hubo un error al enviar la encuesta. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Pantalla de éxito
  if (step >= doneStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 flex items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-emerald-200 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-slate-900">¡Gracias por tu participación!</h2>
          <p className="mt-3 text-slate-600">
            Tus respuestas se han registrado de forma anónima. Tu contribución ayuda a mejorar el bienestar en {empresa.nombre}.
          </p>
          <button
            onClick={onComplete}
            className="mt-8 w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Paso 0: selección de departamento
  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <button onClick={onBack} className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition">
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>

          <div className="mb-8 flex items-center gap-4">
            <Logo className="h-12 w-56 text-slate-900" />
            <div>
              <h1 className="text-lg font-bold text-slate-900">Encuesta de Bienestar Laboral</h1>
              <p className="text-xs text-slate-500">{empresa.nombre}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Antes de empezar</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Tómate 10 min para realizar este cuestionario, <span className="font-semibold text-slate-800">¡no es un examen, es algo muy favorable para poder mejorar tu propio bienestar laboral!</span> Ahora te toca a ti evaluar a tu empresa. <span className="font-bold uppercase tracking-wide text-slate-800">Recuerda:</span> tus respuestas son <span className="font-semibold text-slate-800">100% anónimas</span> y no se almacenan de forma individual. Por ello, esperamos que seas <span className="font-bold text-slate-800">HONESTO, SINCERO Y JUSTO</span>.
            </p>

            {/* Privacy banner */}
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-emerald-600" />
              <p className="text-xs text-emerald-700">
                Has accedido mediante un enlace personal de un solo uso. Tu identidad no está vinculada a tus respuestas. Una vez enviada la encuesta, este enlace quedará invalidado.
              </p>
            </div>

            {/* Empresa y Departamento — asignados automáticamente */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Empresa</label>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#43B59C]/30 bg-[#43B59C]/5 px-4 py-3">
                  <ShieldCheck className="h-4 w-4 text-[#43B59C]" />
                  <span className="text-sm font-medium text-slate-700">{empresa.nombre}</span>
                  <span className="ml-auto text-xs text-slate-400">Asignado automáticamente</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Departamento</label>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#43B59C]/30 bg-[#43B59C]/5 px-4 py-3">
                  <ShieldCheck className="h-4 w-4 text-[#43B59C]" />
                  <span className="text-sm font-medium text-slate-700">{departamentoPreselected || departamento || 'General'}</span>
                  <span className="ml-auto text-xs text-slate-400">Asignado automáticamente</span>
                </div>
              </div>
            </div>

            {savedInit && savedInit.step > 0 && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <ShieldAlert className="h-5 w-5 flex-shrink-0 text-amber-600" />
                <p className="text-xs text-amber-700">
                  Detectamos que ya habías empezado. Si retomas la encuesta, volverás a la última pregunta que estabas respondiendo. Tus respuestas guardadas se conservan en este navegador.
                </p>
              </div>
            )}

            <button
              onClick={() => setStep(savedInit && savedInit.step > 0 && savedInit.step < doneStep ? savedInit.step : 1)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-400 hover:to-red-500"
            >
              Comenzar encuesta
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Progress bar (shared for all question steps)
  const currentBlockInfo = () => {
    if (isBlock1to4 && currentQ) {
      return BLOCKS.find((b) => b.id === currentQ.bloque);
    }
    if (isBlock5) {
      return BLOCKS.find((b) => b.id === 5);
    }
    if (isClosing) {
      return null;
    }
    return null;
  };

  const blockInfo = currentBlockInfo();
  const isLast = step === closingStep;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">
              {isClosing ? 'Pregunta final' : `Pregunta ${step} de ${totalAllQuestions}`}
            </span>
            <span className="font-semibold text-slate-900">{progress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-12">
        <button onClick={() => setStep(step - 1)} className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition">
          <ArrowLeft className="h-4 w-4" /> Anterior
        </button>

        {blockInfo && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Bloque {blockInfo.id}: {blockInfo.title}
          </div>
        )}

        {/* Bloques 1-4: Likert */}
        {isBlock1to4 && currentQ && (
          <>
            <h2 className="text-2xl font-bold leading-snug text-slate-900">{currentQ.text}</h2>
            <p className="mt-2 text-sm text-slate-500">Selecciona la opción que mejor refleja tu situación.</p>
            <div className="mt-8 space-y-3">
              {LIKERT_OPTIONS.map((opt) => {
                const selected = answers[currentQ.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleLikertAnswer(opt.value)}
                    className={`flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition ${
                      selected
                        ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-500/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      selected ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {opt.value}
                    </div>
                    <span className={`font-medium ${selected ? 'text-orange-900' : 'text-slate-700'}`}>{opt.label}</span>
                    {selected && <Check className="ml-auto h-5 w-5 text-orange-500" />}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Bloque 5: preguntas con 3 opciones (puntos 1/3/5) */}
        {isBlock5 && currentB5Q && (
          <>
            <h2 className="text-2xl font-bold leading-snug text-slate-900">{currentB5Q.pregunta}</h2>
            <p className="mt-2 text-sm text-slate-500">Elige la opción que más se acerque a la realidad de tu empresa.</p>
            <div className="mt-8 space-y-3">
              {currentB5Q.opciones.map((opt, idx) => {
                const selected = block5Answers[currentB5Q.id] === opt.puntos;
                return (
                  <button
                    key={idx}
                    onClick={() => handleBlock5Answer(opt.puntos)}
                    className={`flex w-full items-start gap-4 rounded-xl border-2 px-5 py-4 text-left transition ${
                      selected
                        ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-500/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      selected ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`font-medium ${selected ? 'text-orange-900' : 'text-slate-700'}`}>{opt.texto}</span>
                    {selected && <Check className="ml-auto h-5 w-5 flex-shrink-0 text-orange-500" />}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Pregunta fija de cierre */}
        {isClosing && (
          <>
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">Pregunta de control — Verificación de libertad</span>
            </div>
            <h2 className="text-xl font-bold leading-snug text-slate-900">{CLOSING_QUESTION.pregunta}</h2>
            <div className="mt-8 space-y-3">
              {CLOSING_QUESTION.opciones.map((opt, idx) => {
                const selected = closingAnswer === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleClosingAnswer(idx)}
                    className={`flex w-full items-start gap-4 rounded-xl border-2 px-5 py-4 text-left transition ${
                      selected
                        ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-500/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      selected ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`font-medium ${selected ? 'text-orange-900' : 'text-slate-700'}`}>{opt.texto}</span>
                    {selected && <Check className="ml-auto h-5 w-5 flex-shrink-0 text-orange-500" />}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {isLast && closingAnswer !== null && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-400 hover:to-red-500 disabled:opacity-50"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Enviando…</>
            ) : (
              <><Check className="h-4 w-4" /> Enviar encuesta</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/** Token validation screen — shown when user arrives via campaign link */
export function SurveyTokenEntry({ token, onValid, onBack }: { token: string; onValid: (empresa: Empresa, departamento?: string) => void; onBack: () => void }) {
  const [status, setStatus] = useState<'validating' | 'valid' | 'invalid' | 'used'>('validating');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let active = true;

    validateToken(token).then((res) => {
      if (!active) return;
      if (res.valid && res.empresa) {
        setStatus('valid');
        onValid(res.empresa, res.departamento || undefined);
      } else if (res.used) {
        setStatus('used');
        setErrorMsg(res.error || '');
      } else {
        setStatus('invalid');
        setErrorMsg(res.error || 'Token no válido.');
      }
    });

    return () => {
      active = false;
    };
  }, [token, onValid]);

  if (status === 'validating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-500" />
          <p className="mt-4 text-slate-500">Verificando tu enlace…</p>
        </div>
      </div>
    );
  }

  if (status === 'valid') {
    return null; // parent will render Survey
  }

  // Invalid or used
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-6">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-slate-900">
          {status === 'used' ? 'Enlace ya utilizado' : 'Enlace no válido'}
        </h2>
        <p className="mt-3 text-slate-600">
          {status === 'used'
            ? 'Este enlace de encuesta ya ha sido utilizado. Cada enlace es de un solo uso para garantizar la integridad de los datos.'
            : errorMsg || 'El enlace no es válido o ha expirado.'}
        </p>
        <button
          onClick={onBack}
          className="mt-8 w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
