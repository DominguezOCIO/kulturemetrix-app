import { useState } from 'react';
import { ArrowRight, BarChart3, FileCheck, ShieldCheck, Shuffle, Cpu, Ban, ArrowLeftRight, Award, Star, Lock, Building2, User, ChevronDown, Mail, CheckCircle2, Loader2, Users, TrendingUp, Check, Newspaper, Radio, X, Briefcase, Phone } from 'lucide-react';
// All icons use strokeWidth={1.75} for a consistent, refined stroke weight across the UI.
import { Logo } from './Logo';
import { supabase } from '@/lib/supabase';

interface LandingProps {
  onEnter: (email: string, password: string) => Promise<boolean>;
  onWorkerToken?: (token: string) => Promise<boolean>;
  onAdminClick?: (e: React.MouseEvent) => void;
  externalError?: string;
}

export function Landing({ onEnter, onWorkerToken, onAdminClick, externalError }: LandingProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [workerCode, setWorkerCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessMode, setAccessMode] = useState<'empresa' | 'trabajador'>('empresa');
  const [showAuditModal, setShowAuditModal] = useState(false);

  const displayError = externalError || error;

  const openAuditModal = () => setShowAuditModal(true);
  const closeAuditModal = () => setShowAuditModal(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accessMode === 'empresa') {
      if (!loginEmail.trim() || !loginPassword) {
        setError('Introduce tu correo y contraseña.');
        return;
      }
      setLoading(true);
      setError('');
      const ok = await onEnter(loginEmail.trim(), loginPassword);
      if (!ok) setLoading(false);
    } else {
      if (!workerCode.trim()) {
        setError('Introduce tu Código de Empleado.');
        return;
      }
      if (!onWorkerToken) {
        setError('Acceso de trabajador no disponible.');
        return;
      }
      setLoading(true);
      setError('');
      const ok = await onWorkerToken(workerCode.trim());
      if (!ok) setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero — Certificado de Bienestar Corporativo */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,88,12,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.08),transparent_45%)]" />

        {/* Top bar */}
        <div className="relative mx-auto max-w-6xl px-6 pt-12">
          <div className="flex items-center gap-3">
            <Logo className="h-16 w-72 text-white" />
            <div>
              <p className="text-sm text-slate-400 sm:text-base tracking-tight">Auditoría externa del bienestar corporativo</p>
            </div>
          </div>
        </div>

        {/* Certificate hero block */}
        <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-20">
          <div className="mx-auto max-w-4xl text-center">
            {/* Michelin-inspired stars accent */}
            <div className="mb-6 flex items-center justify-center gap-2">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-orange-500/50" />
              {[...Array(3)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-orange-400" fill="currentColor" />
              ))}
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-orange-500/50" />
            </div>

            {/* Certificate icon */}
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/15 to-red-600/10 shadow-[0_8px_30px_-6px_rgba(234,88,12,0.25)]">
              <Award className="h-10 w-10 text-orange-400" strokeWidth={1.75} />
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Mide y potencia el
              <span className="block bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">bienestar real de tu equipo.</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-slate-300/90 sm:text-lg">
              Auditoría externa de clima laboral y salud organizacional. Analizamos y optimizamos la cultura de tu empresa con indicadores de precisión.
            </p>

            {/* Pillars row */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-cyan-400" strokeWidth={1.75} />
                <span className="text-sm font-medium text-slate-300/90">Anonimato blindado</span>
              </div>
              <div className="hidden h-4 w-px bg-slate-700 sm:block" />
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" strokeWidth={1.75} />
                <span className="text-sm font-medium text-slate-300/90">Independencia total</span>
              </div>
              <div className="hidden h-4 w-px bg-slate-700 sm:block" />
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-orange-400" fill="currentColor" strokeWidth={1.75} />
                <span className="text-sm font-medium text-slate-300/90">Se merece, no se compra</span>
              </div>
            </div>

            {/* Manifiesto / cita del fundador */}
            <blockquote className="mx-auto mt-12 max-w-3xl rounded-2xl border-l-4 border-orange-500 bg-gradient-to-br from-orange-500/10 via-red-600/5 to-transparent px-6 py-6 text-left shadow-[0_10px_40px_-12px_rgba(234,88,12,0.25)] backdrop-blur sm:px-8 sm:py-8">
              <span className="block text-4xl leading-none text-orange-400/60" aria-hidden="true">&ldquo;</span>
              <p className="-mt-3 text-sm font-bold uppercase tracking-wide text-orange-200 sm:text-base md:text-lg leading-relaxed">
                Reemplazar a un empleado quemado cuesta hasta el doble de su sueldo anual. Diseñamos <span className="text-white">KultureMetrix</span> para evaluar el burnout mediante micro-pulsos automatizados de 5 minutos, blindando la retención de talento y mejorando el bienestar de los equipos, otorgando la insignia a las empresas con salud laboral real.
              </p>
              <span className="mt-3 block text-4xl leading-none text-right text-orange-400/60" aria-hidden="true">&rdquo;</span>
              <footer className="mt-3 text-right text-sm font-semibold uppercase tracking-wide text-orange-300/80 sm:text-base">
                — FOUNDER&CEO KULTUREMETRIX
              </footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Access bar — dual mode */}
      <div className="relative border-t border-slate-800/60 bg-slate-900/60 backdrop-blur-md">
        <div className="mx-auto max-w-md px-6 py-10">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/80 p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md">
            {/* Mode tabs */}
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-900/60 p-1">
              <button
                type="button"
                onClick={() => { setAccessMode('empresa'); setError(''); setLoading(false); }}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  accessMode === 'empresa'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Building2 className="h-4 w-4" />
                Empresa
              </button>
              <button
                type="button"
                onClick={() => { setAccessMode('trabajador'); setError(''); setLoading(false); }}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  accessMode === 'trabajador'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <User className="h-4 w-4" />
                Trabajador
              </button>
            </div>

            {accessMode === 'empresa' ? (
              <>
                <h3 className="text-lg font-semibold text-white">Acceso Empresa</h3>
                <p className="mt-1 text-sm text-slate-400">Inicia sesión con tu correo y contraseña para acceder al dashboard y consultar el cuestionario.</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-white">Acceso Trabajador</h3>
                <p className="mt-1 text-sm text-slate-400">Introduce tu Código de Empleado para realizar la encuesta anónima. El código es de un solo uso.</p>
              </>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {accessMode === 'empresa' ? (
                <>
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-slate-300">Correo electrónico</label>
                    <input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="tu.correo@empresa.com"
                      className="mt-2 w-full rounded-lg border border-slate-600/70 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-500 transition duration-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-slate-300">Contraseña</label>
                    <input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-2 w-full rounded-lg border border-slate-600/70 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-500 transition duration-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label htmlFor="accesskey" className="block text-sm font-medium text-slate-300">Código de Empleado</label>
                  <input
                    id="accesskey"
                    type="text"
                    value={workerCode}
                    onChange={(e) => setWorkerCode(e.target.value)}
                    placeholder="Tu código personal de un solo uso"
                    className="mt-2 w-full rounded-lg border border-slate-600/70 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-500 transition duration-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              )}

              {displayError && <p className="text-sm text-red-400">{displayError}</p>}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/30 hover:brightness-110 disabled:opacity-60"
              >
                {loading ? 'Verificando…' : accessMode === 'empresa' ? 'Acceder' : 'Comenzar encuesta'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            {accessMode === 'empresa' && (
              <div className="mt-5 rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">¿No tienes cuenta?</span> Las credenciales de acceso son creadas por el equipo de KULTUREMETRIX durante el proceso de auditoría. Contacta con nosotros si necesitas acceso.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features strip */}
      <div className="bg-[#0f172a] py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <FeatureRow icon={<BarChart3 className="h-5 w-5" />} title="Dashboard analítico" desc="KPIs en tiempo real por departamento y bloque temático." />
            <FeatureRow icon={<ShieldCheck className="h-5 w-5" />} title="Privacidad desde el diseño" desc="100% anónimo. Cumple RGPD. Sin datos individuales." />
            <FeatureRow icon={<FileCheck className="h-5 w-5" />} title="Insignia Kulturemetrix de Bienestar" desc="Descarga una insignia Kulturemetrix verificable al alcanzar 70+ puntos sobre 100." />
          </div>
        </div>
      </div>

      {/* Sección: Cómo Funciona */}
      <section id="como-funciona" className="bg-slate-50 py-20 px-6 border-t border-b border-slate-200">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold tracking-widest text-[#43B59C] uppercase bg-[#43B59C]/10 px-3 py-1 rounded-full border border-[#43B59C]/20">
              Proceso sencillo y transparente
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#205072] mt-4 tracking-tight">
              CÓMO FUNCIONA
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-500 sm:text-lg">
              Del acceso al panel a la insignia Kulturemetrix oficial: cuatro pasos para transformar el bienestar de tu organización en una ventaja medible.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Paso 1 */}
            <HowItWorksStep
              number="01"
              icon={<Building2 className="h-6 w-6" strokeWidth={1.75} />}
              title="Acceso a tu panel de empresa"
              description="Te facilitamos un panel de control exclusivo donde visualizarás las métricas globales, los resultados segmentados por departamento y la puntuación final una vez concluida la auditoría."
            />
            {/* Paso 2 */}
            <HowItWorksStep
              number="02"
              icon={<Mail className="h-6 w-6" strokeWidth={1.75} />}
              title="Envío de invitaciones 100% anónimas"
              description="Nos facilitas los correos de tu equipo organizados por departamentos. Cada empleado recibirá un correo explicando la iniciativa de bienestar laboral junto con un enlace único y 100% anónimo para completar un breve cuestionario web de menos de 5 minutos, garantizando total confidencialidad y sinceridad."
            />
            {/* Paso 3 */}
            <HowItWorksStep
              number="03"
              icon={<BarChart3 className="h-6 w-6" strokeWidth={1.75} />}
              title="Diagnóstico y planes de acción automáticos"
              description="Una vez completado por el equipo, tu panel generará al instante las gráficas de métricas, la nota final y planes de acción personalizados para reforzar los puntos débiles detectados."
            />
            {/* Paso 4 */}
            <HowItWorksStep
              number="04"
              icon={<Award className="h-6 w-6" strokeWidth={1.75} />}
              title="Insignia Kulturemetrix oficial e informe PDF"
              description="Si la organización alcanza una puntuación mínima de 70/100, podrás descargar automáticamente desde tu panel nuestra Insignia Kulturemetrix Oficial, junto con un informe completo en PDF con todas las métricas obtenidas y los planes de acción a implementar."
            />
          </div>
        </div>
      </section>

      {/* Sección: Condiciones de la Convocatoria */}
      <section id="convocatoria" className="bg-white py-20 border-t border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#205072]/15 bg-[#205072]/5 px-4 py-1.5">
              <FileCheck className="h-4 w-4 text-[#205072]" strokeWidth={1.75} />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#205072]">Marco normativo</span>
            </div>
            <h2 className="mt-5 text-2xl font-extrabold text-[#205072] sm:text-3xl lg:text-4xl tracking-tight">
              Bases del Proceso de Auditoría Anual
            </h2>
          </div>

          {/* Intro */}
          <p className="mt-6 text-center text-base leading-relaxed text-slate-500 sm:text-lg">
            El acceso a la <span className="font-bold text-[#205072]">INSIGNIA KULTUREMETRIX</span> está sujeto a un estricto proceso de evaluación diseñado bajo un principio de convocatoria única anual:
          </p>

          {/* Conditions grid */}
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {/* Evaluación Única */}
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-7 shadow-[0_2px_12px_-4px_rgba(32,80,114,0.08)] transition-all duration-200 hover:-translate-y-1 hover:border-[#43B59C]/40 hover:bg-[#43B59C]/5 hover:shadow-[0_12px_30px_-8px_rgba(67,181,156,0.2)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#205072]/10 text-[#205072]">
                <Award className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#205072]">Evaluación Única</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Cada organización registrada dispondrá de una sola oportunidad por año para realizar la auditoría de bienestar corporativo.
              </p>
            </div>

            {/* Emisión y Renovación */}
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-7 shadow-[0_2px_12px_-4px_rgba(32,80,114,0.08)] transition-all duration-200 hover:-translate-y-1 hover:border-[#43B59C]/40 hover:bg-[#43B59C]/5 hover:shadow-[0_12px_30px_-8px_rgba(67,181,156,0.2)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#43B59C]/10 text-[#43B59C]">
                <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#205072]">Emisión y Renovación</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Las compañías que alcancen la puntuación requerida obtendrán la <span className="font-bold text-[#205072]">INSIGNIA KULTUREMETRIX ANUAL</span>, la cual tendrá validez por 12 meses. La renovación del distintivo requerirá superar una nueva auditoría desde cero al cumplirse el año de su fecha de alta.
              </p>
            </div>

            {/* Política de No Aprobación */}
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-7 shadow-[0_2px_12px_-4px_rgba(32,80,114,0.08)] transition-all duration-200 hover:-translate-y-1 hover:border-red-400/40 hover:bg-red-500/5 hover:shadow-[0_12px_30px_-8px_rgba(239,68,68,0.18)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                <Ban className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#205072]">Política de No Aprobación</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Aquellas empresas que no superen los estándares mínimos exigidos no podrán reintentar la evaluación ni optar al ranking hasta la apertura de su siguiente ciclo anual (a contar desde su fecha de alta original).
              </p>
            </div>
          </div>

          {/* Closing statement */}
          <p className="mt-10 rounded-2xl border border-[#205072]/12 bg-[#205072]/[0.03] px-6 py-5 text-center text-sm leading-relaxed text-slate-600 sm:text-base">
            Este marco metodológico garantiza la <span className="font-bold text-[#205072]">transparencia</span>, la <span className="font-bold text-[#205072]">competitividad</span> y el <span className="font-bold text-[#205072]">valor</span> de nuestra distinción en el mercado.
          </p>
        </div>
      </section>

      {/* Sección: Planes y Precios */}
      <section id="precios" className="bg-slate-100 py-24">
        <div className="mx-auto max-w-6xl px-6">
          {/* GDPR Badge */}
          <div className="mx-auto mb-8 flex max-w-2xl items-center justify-center gap-3 rounded-2xl border border-[#43B59C]/25 bg-[#43B59C]/8 px-5 py-3 text-center shadow-[0_4px_20px_-8px_rgba(67,181,156,0.2)]">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[#43B59C]" strokeWidth={1.75} />
            <p className="text-sm font-semibold text-[#205072]">
              Cumplimiento estricto del RGPD laboral — Mínimo de 15 empleados requerido para garantizar el anonimato absoluto por departamento
            </p>
          </div>

          {/* Header */}
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold text-[#205072] sm:text-4xl lg:text-5xl tracking-tight">
              Planes adaptados al tamaño de tu organización
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-500 sm:text-lg">
              Facturación anual simplificada mediante transferencia bancaria corporativa. Sin tarjetas de crédito ni costes ocultos.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {/* Plan PYMES */}
            <PricingCard
              name="PYMES"
              tier="15 a 49 empleados"
              price="1.188 €"
              priceLabel="(+ IVA) · Pago anual"
              description="Ideal para empresas ágiles que buscan proteger el bienestar de su equipo desde el inicio y potenciar su marca empleadora."
              features={[
                'Cobertura completa: Auditoría para hasta 49 trabajadores.',
                'Tests automatizados: Medición rápida de 5 minutos sin interrumpir la operativa diaria.',
                'Panel de control: Métricas globales y segmentadas por departamento, indicadores de bienestar y alertas tempranas de riesgo de burnout.',
                'Insignia Kulturemetrix oficial: Derecho de uso del Sello KultureMetrix (sujeto a superar los estándares de la auditoría).',
              ]}
              cta="Contactar para Auditoría"
              featured={false}
              onCtaClick={openAuditModal}
            />

            {/* Plan EXPANSIÓN */}
            <PricingCard
              name="EXPANSIÓN"
              tier="50 a 150 empleados"
              price="2.388 €"
              priceLabel="(+ IVA) · Pago anual"
              description="Para organizaciones en crecimiento que necesitan profesionalizar la escucha interna y reducir la rotación de talento."
              features={[
                'Todo lo incluido en el Plan PYMES.',
                'Conferencia webinar: Sesión previa con los responsables de la empresa y RR. HH. antes de la apertura de la auditoría.',
              ]}
              cta="Contactar para Auditoría"
              featured={false}
              onCtaClick={openAuditModal}
            />

            {/* Plan CORPORATE — DESTACADA */}
            <PricingCard
              name="CORPORATE"
              tier="151 a 500 empleados"
              price="5.988 €"
              priceLabel="(+ IVA) · Pago anual"
              description="Para empresas medianas y grandes que buscan convertir el bienestar laboral en una ventaja competitiva medible."
              features={[
                'Todo lo incluido en el Plan EXPANSIÓN.',
                'Acompañamiento personalizado: Seguimiento continuo durante todo el proceso de auditoría vía videoconferencia.',
              ]}
              cta="Contactar para Auditoría"
              featured={true}
              onCtaClick={openAuditModal}
            />

            {/* Plan GRAN EMPRESA */}
            <PricingCard
              name="GRAN EMPRESA"
              tier="Más de 500 empleados"
              price="A medida"
              priceLabel="Proyecto personalizado"
              description="Soluciones a escala corporativa para impulsar el bienestar laboral desde la alta dirección."
              features={[
                'Todo lo incluido en el Plan CORPORATE.',
                'Conferencia presencial del CEO: Sesión impartida por el CEO de KultureMetrix en la sede principal de la empresa (nacional o internacional) antes de la apertura de la auditoría.',
              ]}
              cta="Contactar para Auditoría"
              featured={false}
              onCtaClick={openAuditModal}
            />
          </div>
        </div>
      </section>

      {/* Sección: Reputación en Medios */}
      <section id="reputacion-medios" className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1a2744] to-[#0f172a] py-24">
        {/* Decorative glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(67,181,156,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(234,88,12,0.08),transparent_45%)]" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          {/* Icon accent */}
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#43B59C]/25 bg-gradient-to-br from-[#43B59C]/15 to-[#205072]/10 shadow-[0_8px_30px_-8px_rgba(67,181,156,0.3)]">
            <Newspaper className="h-8 w-8 text-[#43B59C]" strokeWidth={1.75} />
          </div>

          {/* Italic headline */}
          <h2 className="text-3xl font-bold italic tracking-tight text-white sm:text-4xl lg:text-5xl">
            REPUTACIÓN EN MEDIOS DE COMUNICACIÓN ANUAL
          </h2>

          {/* Body text */}
          <p className="mx-auto mt-8 max-w-3xl text-base leading-relaxed text-slate-300/90 sm:text-lg">
            Impulse la visibilidad y el prestigio de su organización a través del rigor de KULTUREMETRIX. Las compañías que superen con éxito nuestros estándares y obtengan nuestra exclusiva <span className="font-bold text-[#43B59C]">INSIGNIA KULTUREMETRIX</span>, formarán parte de un prestigioso ranking anual. Esta clasificación se proyectará estratégicamente en espacios editoriales y medios de comunicación de referencia, consolidando su posicionamiento como un claro referente en el <span className="font-bold text-[#43B59C]">RANKING DE LAS EMPRESAS DE BIENESTAR CORPORATIVO</span>.
          </p>

          {/* CTA button */}
          <button onClick={openAuditModal} className="mt-10 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#205072] to-[#43B59C] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-[#43B59C]/20 transition-all duration-200 hover:shadow-xl hover:shadow-[#43B59C]/30 hover:brightness-110 hover:from-[#1a4060] hover:to-[#3aa588]">
            <Radio className="h-5 w-5" strokeWidth={1.75} />
            Iniciar Insignia Kulturemetrix
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Sección: Nuestra Metodología */}
      <section id="metodologia" className="bg-[#0f172a] py-24">
        <div className="mx-auto max-w-6xl px-6">
          {/* Encabezado */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/5 px-4 py-1.5">
              <ShieldCheck className="h-4 w-4 text-cyan-400" strokeWidth={1.75} />
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Protección y precisión garantizadas</span>
            </div>
            <h2 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Nuestra Metodología
            </h2>
            <p className="mt-4 text-lg text-slate-400/90 leading-relaxed">
              Un sistema de auditoría de cinco capas diseñado para detectar incoherencias, eliminar manipulaciones y garantizar que cada resultado refleje la realidad laboral de tu organización con máxima fiabilidad técnica.
            </p>
          </div>

          {/* Tarjetas de metodología */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {/* Validación Cruzada */}
            <MethodologyCard
              icon={<ArrowLeftRight className="h-6 w-6" />}
              accent="cyan"
              title="Validación Cruzada"
              number="01"
              description="Comparamos automáticamente la nota cuantitativa de los bloques 1-4 con la nota cualitativa del bloque 5. Si existe una discrepancia significativa, el sistema aplica penalizaciones proporcionales para revelar brechas entre lo que se declara y lo que se vive."
            />

            {/* Rotación Aleatoria */}
            <MethodologyCard
              icon={<Shuffle className="h-6 w-6" />}
              accent="emerald"
              title="Rotación Aleatoria"
              number="02"
              description="El bloque 5 selecciona 5 preguntas de un banco de 10 de forma totalmente aleatoria para cada trabajador. Esto imposibilita que la dirección prepare respuestas memorizadas o instruya al equipo sobre qué contestar."
            />

            {/* Algoritmo de Incoherencias */}
            <MethodologyCard
              icon={<Cpu className="h-6 w-6" />}
              accent="cyan"
              title="Algoritmo de Incoherencias"
              number="03"
              description="Un motor de cálculo evalúa la diferencia porcentual entre ambas notas. A partir de un 15% de discrepancia se aplica una penalización proporcional de hasta 5 puntos, permitiendo dar feedback de mejora sin descalificar automáticamente. Las notas nunca se inflan artificialmente."
            />

            {/* Veto Crítico */}
            <MethodologyCard
              icon={<Ban className="h-6 w-6" />}
              accent="red"
              title="Veto Crítico"
              number="04"
              description="Si más del 10% de los empleados de un departamento reportan haber sentido coacción al responder, el sistema invalida automáticamente ese departamento con nota 0 y emite una alerta de Coacción Crítica para investigación confidencial inmediata."
            />
          </div>

          {/* Cinta de confianza */}
          <div className="mt-14 flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-700/40 bg-slate-800/30 p-7 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.4)] sm:flex-row sm:gap-10">
            <TrustBadge label="100% Anónimo" />
            <div className="hidden h-8 w-px bg-slate-700 sm:block" />
            <TrustBadge label="Cumplimiento RGPD" />
            <div className="hidden h-8 w-px bg-slate-700 sm:block" />
            <TrustBadge label="Cifrado extremo a extremo" />
            <div className="hidden h-8 w-px bg-slate-700 sm:block" />
            <TrustBadge label="Auditoría automatizada" />
          </div>
        </div>
      </section>

      {/* Sección: Quiero Auditar Mi Empresa */}
      <section id="auditar-empresa" className="bg-gradient-to-br from-[#205072] to-[#0f172a] py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/35 bg-orange-500/10 px-4 py-1.5">
            <Award className="h-4 w-4 text-orange-400" strokeWidth={1.75} />
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-300">Comienza tu auditoría hoy</span>
          </div>
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Quiero Auditar Mi Empresa
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-300/90">
            Solicita una auditoría externa del bienestar corporativo de tu organización.
          </p>
          <button
            onClick={openAuditModal}
            className="mt-10 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-10 py-5 text-lg font-bold text-white shadow-xl shadow-orange-500/30 transition-all duration-200 hover:shadow-2xl hover:shadow-orange-500/40 hover:brightness-110 hover:from-orange-400 hover:to-red-500 hover:scale-[1.03]"
          >
            Solicitar auditoría
            <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" strokeWidth={1.75} />
              <span className="text-sm font-medium text-slate-300/90">100% ANÓNIMO</span>
            </div>
            <div className="hidden h-4 w-px bg-slate-600 sm:block" />
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-cyan-400" strokeWidth={1.75} />
              <span className="text-sm font-medium text-slate-300/90">Cumplimiento RGPD</span>
            </div>
            <div className="hidden h-4 w-px bg-slate-600 sm:block" />
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-orange-400" strokeWidth={1.75} />
              <span className="text-sm font-medium text-slate-300/90">Insignia Kulturemetrix</span>
            </div>
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section id="faq" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#43B59C]/25 bg-[#43B59C]/10 px-4 py-1.5">
              <ShieldCheck className="h-4 w-4 text-[#43B59C]" strokeWidth={1.75} />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#205072]">Resolvemos tus dudas</span>
            </div>
            <h2 className="mt-6 text-4xl font-bold tracking-tight text-[#205072] sm:text-5xl">Preguntas frecuentes</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-500">
              Conoce cómo protegemos los datos, cómo funciona la auditoría y qué valor aporta la insignia Kulturemetrix.
            </p>
          </div>

          <div className="mt-14 space-y-6">
            {FAQ_SECTIONS.map((section) => (
              <div key={section.title} className="overflow-hidden rounded-2xl border border-[#205072]/12 bg-white shadow-[0_2px_16px_-6px_rgba(32,80,114,0.12)] transition-shadow duration-200 hover:shadow-[0_8px_30px_-10px_rgba(32,80,114,0.18)]">
                <div className="flex items-center gap-3 border-b border-[#205072]/8 bg-[#205072]/[0.04] px-6 py-5 sm:px-8">
                  <section.icon className="h-5 w-5 flex-shrink-0 text-[#43B59C]" strokeWidth={1.75} />
                  <h3 className="text-lg font-bold text-[#205072]">{section.title}</h3>
                </div>
                <div className="divide-y divide-slate-200 px-6 sm:px-8">
                  {section.questions.map((item) => (
                    <details key={item.question} className="group">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-semibold text-[#205072] transition-colors duration-200 hover:text-[#43B59C] [&::-webkit-details-marker]:hidden">
                        <span>{item.question}</span>
                        <ChevronDown className="h-5 w-5 flex-shrink-0 text-[#43B59C] transition-transform duration-200 group-open:rotate-180" />
                      </summary>
                      <div className="max-w-4xl pb-5 pr-8 text-sm leading-7 text-slate-500">{item.answer}</div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showAuditModal && <AuditRequestModal onClose={closeAuditModal} />}

      <footer className="border-t border-slate-800/60 py-6">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between text-sm text-slate-500">
          <span>KULTUREMETRIX — Auditoría externa del bienestar corporativo · Privacidad desde el diseño (RGPD)</span>
          <button onClick={onAdminClick} className="flex items-center gap-1.5 text-slate-400 transition-colors duration-200 hover:text-orange-400">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
            Panel Admin
          </button>
        </div>
      </footer>
    </div>
  );
}

const FAQ_SECTIONS = [
  {
    title: 'Sobre la Plataforma y Privacidad',
    icon: ShieldCheck,
    questions: [
      {
        question: '¿Qué es KULTUREMETRIX?',
        answer: 'Es una plataforma avanzada de auditoría externa especializada en el bienestar corporativo, diseñada para medir, analizar y optimizar la salud organizacional y el clima laboral mediante métricas e indicadores de precisión.',
      },
      {
        question: '¿Las auditorías y encuestas son realmente anónimas?',
        answer: 'Sí, el anonimato es absoluto. KULTUREMETRIX actúa como un tercero independiente; las respuestas se procesan de forma protegida y los resultados se entregan de manera agregada, sin asociar una respuesta individual con la identidad de un empleado.',
      },
      {
        question: '¿Cómo garantizan la seguridad de los datos de los empleados?',
        answer: 'Aplicamos medidas de seguridad de alto nivel y cumplimos estrictamente con el Reglamento General de Protección de Datos (RGPD), procurando que la información confidencial no quede expuesta ni se comparta con terceros no autorizados.',
      },
    ],
  },
  {
    title: 'Funcionamiento y Metodología',
    icon: BarChart3,
    questions: [
      {
        question: '¿Qué aspectos del bienestar corporativo evalúa la plataforma?',
        answer: 'Las métricas cubren áreas clave como la salud mental y emocional, el equilibrio entre vida laboral y personal, la carga de trabajo, la calidad del liderazgo, la cultura de inclusión y los niveles generales de motivación y burnout.',
      },
      {
        question: '¿De dónde salen las preguntas de la auditoría?',
        answer: (
          <div className="space-y-3">
            <p>Las dimensiones analíticas evaluadas en los cuestionarios de KULTUREMETRIX no responden a formulaciones arbitrarias. La arquitectura metodológica se encuentra estrictamente alineada con el Marco Estratégico de la UE en materia de Salud y Seguridad en el Trabajo y los parámetros de bienestar laboral comunitarios, respondiendo a un riguroso &lsquo;porqué&rsquo; científico y normativo:</p>
            <ul className="space-y-2.5 pl-1">
              <li className="flex gap-2"><span className="text-[#43B59C] mt-0.5">•</span><span><strong className="font-semibold text-[#205072]">Directiva Marco Europea (Directiva 89/391/CEE):</strong> Da cumplimiento exacto a la obligación legal imperativa impuesta a las empresas de identificar, evaluar y prevenir proactivamente los riesgos psicosociales y salvaguardar de manera efectiva la salud mental de las personas trabajadoras.</span></li>
              <li className="flex gap-2"><span className="text-[#43B59C] mt-0.5">•</span><span><strong className="font-semibold text-[#205072]">Factores Clínico-Laborales Evaluados:</strong> Los reactivos del cuestionario miden con precisión técnica las dimensiones validadas por los estándares del sector: Carga y Ritmo de Trabajo, Autonomía y Control sobre las tareas, Calidad del Liderazgo, Apoyo Social, Entorno Físico Operativo y Conciliación de la vida personal y profesional.</span></li>
              <li className="flex gap-2"><span className="text-[#43B59C] mt-0.5">•</span><span><strong className="font-semibold text-[#205072]">Documento Técnico Oficial:</strong> La rigurosidad científica aplicada confiere a los informes resultantes el carácter de documento técnico de evaluación climática plenamente válido y auditable ante cualquier Inspección de Trabajo o auditoría de estándares internacionales (ej. criterios de ESG).</span></li>
            </ul>
          </div>
        ),
      },
      {
        question: '¿Cuánto tiempo se necesita para completar una auditoría interna?',
        answer: 'Las evaluaciones dinámicas están optimizadas para el entorno digital y suelen completarse en un rango de 5 a 10 minutos, minimizando la interrupción de la jornada laboral diaria de los equipos.',
      },
      {
        question: '¿Qué tipo de informes reciben las empresas tras la auditoría?',
        answer: 'Las organizaciones obtienen acceso a un panel analítico con gráficos interactivos, comparativas entre departamentos y planes de acción recomendados a partir de los puntos críticos detectados en el diagnóstico.',
      },
    ],
  },
  {
    title: 'Insignias y Valor de Mercado',
    icon: Award,
    questions: [
      {
        question: '¿Qué es la Insignia Kulturemetrix de Bienestar Corporativo?',
        answer: 'Es un distintivo oficial de calidad emitido por nuestra entidad externa que avala que una empresa cumple con estándares óptimos de salud organizacional y bienestar humano tras superar la auditoría correspondiente.',
      },
      {
        question: '¿Cómo se obtiene la insignia Kulturemetrix?',
        answer: 'Una vez acabada la auditoría con las respuestas recibidas de manera anónima de todos los test por parte de tu equipo, y obteniendo la puntuación de 70/100 en adelante. Se requiere ser una empresa notable cuidando el bienestar corporativo.',
      },
      {
        question: '¿Qué pasa si mi empresa no obtiene la puntuación necesaria?',
        answer: 'Se quedará la auditoría fallida, pero no te preocupes, todo quedará en el anonimato, y obtendrás consejos de planes de acción a implementar para poder mejorar las áreas que tu propio equipo te pide mejorar. Y pasados 12 meses siguientes, podrás volver a pasar nuestra auditoría.',
      },
      {
        question: '¿Por qué es importante contar con una auditoría externa en lugar de una interna?',
        answer: 'La auditoría externa reduce los sesgos internos y genera confianza real en los empleados, quienes pueden expresarse con mayor honestidad al saber que sus datos están protegidos por una entidad neutral y especializada.',
      },
      {
        question: '¿Cómo beneficia esta insignia Kulturemetrix a la atracción de talento?',
        answer: 'El sello de KULTUREMETRIX funciona como una herramienta de Employer Branding que demuestra de forma transparente el compromiso real de la empresa con el cuidado de sus equipos, ayudando a atraer y retener talento.',
      },
    ],
  },
];

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/15">
        {icon}
      </div>
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="text-sm text-slate-400/90">{desc}</p>
      </div>
    </div>
  );
}

function HowItWorksStep({ number, icon, title, description }: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-7 shadow-[0_2px_12px_-4px_rgba(32,80,114,0.08)] transition-all duration-200 hover:-translate-y-1.5 hover:border-[#43B59C]/50 hover:shadow-[0_16px_40px_-12px_rgba(67,181,156,0.2)]">
      {/* Number badge */}
      <span className="pointer-events-none absolute -top-3 right-5 text-5xl font-black text-[#205072]/8 select-none transition-transform duration-200 group-hover:scale-110">
        {number}
      </span>
      {/* Icon */}
      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#205072]/10 text-[#205072] ring-1 ring-[#205072]/10 transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="relative mt-5 text-base font-bold leading-snug tracking-tight text-[#205072]">{title}</h3>
      <p className="relative mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

const ACCENT_STYLES: Record<string, { border: string; iconBg: string; iconText: string; number: string; glow: string }> = {
  cyan: {
    border: 'border-cyan-500/25 hover:border-cyan-400/60',
    iconBg: 'bg-cyan-500/10',
    iconText: 'text-cyan-400',
    number: 'text-cyan-500/15',
    glow: 'hover:shadow-cyan-500/10',
  },
  emerald: {
    border: 'border-emerald-500/25 hover:border-emerald-400/60',
    iconBg: 'bg-emerald-500/10',
    iconText: 'text-emerald-400',
    number: 'text-emerald-500/15',
    glow: 'hover:shadow-emerald-500/10',
  },
  red: {
    border: 'border-red-500/25 hover:border-red-400/60',
    iconBg: 'bg-red-500/10',
    iconText: 'text-red-400',
    number: 'text-red-500/15',
    glow: 'hover:shadow-red-500/10',
  },
};

function MethodologyCard({ icon, accent, title, number, description }: {
  icon: React.ReactNode;
  accent: 'cyan' | 'emerald' | 'red';
  title: string;
  number: string;
  description: string;
}) {
  const s = ACCENT_STYLES[accent];
  return (
    <div className={`group relative overflow-hidden rounded-2xl border ${s.border} bg-slate-800/40 p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${s.glow}`}>
      <span className={`pointer-events-none absolute -top-2 right-4 text-7xl font-black ${s.number} select-none transition-transform duration-200 group-hover:scale-110`}>
        {number}
      </span>
      <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl ${s.iconBg} ${s.iconText} ring-1 ring-white/5 transition-transform duration-200 group-hover:scale-110`}>
        {icon}
      </div>
      <h3 className="relative mt-6 text-xl font-bold tracking-tight text-white">{title}</h3>
      <p className="relative mt-3 text-sm leading-relaxed text-slate-400/90">{description}</p>
    </div>
  );
}

function TrustBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <ShieldCheck className="h-4 w-4 text-slate-400" strokeWidth={1.75} />
      <span className="text-sm font-medium text-slate-400/90">{label}</span>
    </div>
  );
}

function PricingCard({
  name,
  tier,
  price,
  priceLabel,
  description,
  features,
  cta,
  featured,
  onCtaClick,
}: {
  name: string;
  tier: string;
  price: string;
  priceLabel: string;
  description: string;
  features: string[];
  cta: string;
  featured: boolean;
  onCtaClick?: () => void;
}) {
  return (
    <div
      className={`group relative flex flex-col rounded-3xl border p-8 transition-all duration-200 hover:-translate-y-2 ${
        featured
          ? 'border-[#43B59C]/60 bg-white shadow-[0_12px_40px_-12px_rgba(67,181,156,0.3)] hover:shadow-[0_20px_60px_-15px_rgba(67,181,156,0.4)]'
          : 'border-slate-200/80 bg-white shadow-[0_4px_20px_-8px_rgba(15,23,42,0.12)] hover:border-[#43B59C]/40 hover:shadow-[0_16px_40px_-12px_rgba(32,80,114,0.15)]'
      }`}
    >
      {/* Header */}
      <div className="text-center">
        <h3 className={`text-xl font-extrabold uppercase tracking-tight ${featured ? 'text-[#43B59C]' : 'text-[#205072]'}`}>
          {name}
        </h3>
        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">{tier}</p>
      </div>

      {/* Price */}
      <div className="mt-5 text-center">
        <span className={`text-4xl font-black ${featured ? 'text-[#205072]' : 'text-slate-800'}`}>
          {price}
        </span>
        <p className="mt-1.5 text-xs font-medium text-slate-500">{priceLabel}</p>
      </div>

      {/* Description */}
      <p className="mt-4 text-sm leading-relaxed text-slate-600 text-center">{description}</p>

      {/* Divider */}
      <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Features */}
      <ul className="flex-1 space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
              featured ? 'bg-[#43B59C]/15 text-[#43B59C]' : 'bg-slate-100 text-slate-500'
            }`}>
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <span className="text-sm leading-relaxed text-slate-700">{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={onCtaClick}
        className={`mt-6 w-full rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-200 ${
          featured
            ? 'bg-gradient-to-r from-[#205072] to-[#43B59C] text-white shadow-lg shadow-[#43B59C]/20 hover:shadow-xl hover:shadow-[#43B59C]/30 hover:brightness-110 hover:from-[#1a4060] hover:to-[#3aa588]'
            : 'border border-slate-200 bg-white text-[#205072] hover:border-[#43B59C] hover:bg-[#43B59C]/5 hover:shadow-sm'
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

const PAISES = [
  'España', 'Portugal', 'Francia', 'Alemania', 'Italia', 'Reino Unido',
  'Países Bajos', 'Bélgica', 'Suiza', 'Austria', 'Estados Unidos', 'México',
  'Argentina', 'Chile', 'Colombia', 'Perú', 'Brasil', 'Otro',
];

function AuditRequestModal({ onClose }: { onClose: () => void }) {
  const [empresa, setEmpresa] = useState('');
  const [trabajadores, setTrabajadores] = useState('');
  const [pais, setPais] = useState('España');
  const [contacto, setContacto] = useState('');
  const [cargo, setCargo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!empresa.trim() || !contacto.trim() || !cargo.trim() || !telefono.trim() || !email.trim()) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Introduce un correo electrónico válido.');
      return;
    }
    const numTrab = parseInt(trabajadores, 10);
    if (!numTrab || numTrab < 1) {
      setError('Introduce un número válido de trabajadores.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from('solicitudes_auditoria').insert({
        empresa: empresa.trim(),
        num_trabajadores: numTrab,
        pais,
        persona_contacto: contacto.trim(),
        cargo: cargo.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
      });
      if (insertError) throw insertError;

      const { data: configData } = await supabase
        .from('site_config')
        .select('notif_email_destino')
        .eq('id', 1)
        .maybeSingle();

      if (configData?.notif_email_destino) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        try {
          const notifyRes = await fetch(`${supabaseUrl}/functions/v1/send-audit-notification`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${anonKey}`,
              apikey: anonKey,
            },
            body: JSON.stringify({
              empresa: empresa.trim(),
              num_trabajadores: numTrab,
              pais,
              persona_contacto: contacto.trim(),
              cargo: cargo.trim(),
              telefono: telefono.trim(),
              email: email.trim(),
            }),
          });

          if (!notifyRes.ok) {
            let serverError = `El servidor respondió ${notifyRes.status}`;
            try { const errJson = await notifyRes.json(); if (errJson?.error) serverError = errJson.error; }
            catch { try { serverError = await notifyRes.text(); } catch { /* keep default */ } }
            console.warn('Notificación de auditoría no enviada por el servidor:', serverError);
          }
        } catch (notifyErr) {
          // El lead ya quedó guardado en la base de datos (solicitudes_auditoria).
          // La notificación por email es un paso secundario: si la red falla,
          // el admin podrá ver el lead desde el panel. No bloqueamos el éxito.
          console.warn('No se pudo contactar con el servidor de notificaciones:', notifyErr);
        }
      }

      setSuccess(true);
    } catch (err: any) {
      const detail = err?.message || 'No se pudo enviar la solicitud. Inténtalo de nuevo.';
      console.error('Error al enviar solicitud de auditoría:', err);
      setError(`No se pudo enviar la solicitud: ${detail}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Solicitar auditoría"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="px-8 py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-[#205072]">Solicitud recibida</h3>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
              Nuestro equipo de auditoría se pondrá en contacto con usted en menos de 24 horas.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-lg bg-gradient-to-r from-[#205072] to-[#43B59C] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#43B59C]/30 hover:brightness-110 hover:from-[#1a4060] hover:to-[#3aa588]"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gradient-to-br from-[#205072] to-[#43B59C] px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/10">
                  <Briefcase className="h-6 w-6 text-white" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Solicitar Auditoría</h3>
                  <p className="text-sm text-white/80">Rellena el formulario y te contactaremos en menos de 24 horas.</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-h-[60vh] space-y-4 overflow-y-auto px-8 py-6">
              <div>
                <label htmlFor="ar-empresa" className="block text-sm font-medium text-slate-700">Nombre de la empresa</label>
                <input
                  id="ar-empresa"
                  type="text"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Tu empresa S.L."
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition duration-200 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20"
                  required
                />
              </div>

              <div>
                <label htmlFor="ar-trabajadores" className="block text-sm font-medium text-slate-700">Nº de trabajadores</label>
                <input
                  id="ar-trabajadores"
                  type="number"
                  min={1}
                  value={trabajadores}
                  onChange={(e) => setTrabajadores(e.target.value)}
                  placeholder="Ej. 75"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition duration-200 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20"
                  required
                />
              </div>

              <div>
                <label htmlFor="ar-pais" className="block text-sm font-medium text-slate-700">País de la sede</label>
                <select
                  id="ar-pais"
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 transition duration-200 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20"
                  required
                >
                  {PAISES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ar-contacto" className="block text-sm font-medium text-slate-700">Persona de contacto</label>
                <input
                  id="ar-contacto"
                  type="text"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                  placeholder="Nombre y apellidos"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition duration-200 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20"
                  required
                />
              </div>

              <div>
                <label htmlFor="ar-cargo" className="block text-sm font-medium text-slate-700">Cargo</label>
                <input
                  id="ar-cargo"
                  type="text"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Ej. Director de RRHH"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition duration-200 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20"
                  required
                />
              </div>

              <div>
                <label htmlFor="ar-email" className="block text-sm font-medium text-slate-700">Correo electrónico</label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="ar-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contacto@empresa.com"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition duration-200 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ar-telefono" className="block text-sm font-medium text-slate-700">Teléfono</label>
                <div className="relative mt-2">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
                  <input
                    id="ar-telefono"
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition duration-200 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 shadow-sm">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#205072] to-[#43B59C] px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:shadow-[#43B59C]/30 hover:brightness-110 hover:from-[#1a3f5e] hover:to-[#3a9d87] disabled:opacity-60"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Enviando…</>
                ) : (
                  <>Enviar Solicitud</>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
