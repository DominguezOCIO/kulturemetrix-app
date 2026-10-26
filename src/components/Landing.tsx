import { useState, useEffect } from 'react';
import { ArrowRight, BarChart3, FileCheck, ShieldCheck, Shuffle, Cpu, Ban, ArrowLeftRight, Award, Star, Lock, Building2, User, ChevronDown, Mail, CheckCircle2, Loader2, Users, TrendingUp, Check, Newspaper, Radio, X, Briefcase, Phone } from 'lucide-react';
import { Logo } from './Logo';
import { supabase } from '@/lib/supabase';
import { fetchDepartamentosActivos, registerTrabajador } from '@/lib/trabajadores';
import type { Departamento } from '@/lib/trabajadores';

interface LandingProps {
  onEnter: (email: string, password: string) => Promise<boolean>;
  onWorkerToken?: (token: string) => Promise<boolean>;
  onAdminClick?: (e: React.MouseEvent) => void;
  externalError?: string;
}

export function Landing({ onEnter, onWorkerToken, onAdminClick, externalError }: LandingProps) {
  const [loginEmail, setLoginEmail] = useState('demo@kulturemetrix.com');
  const [loginPassword, setLoginPassword] = useState('DemoCorp2026!');
  const [workerCode, setWorkerCode] = useState('kLetX8Cp-T0tKGFbK-iLaXHSTz-7D5vBW9v');
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
              <p className="text-sm text-slate-400 sm:text-base">Auditoría externa del bienestar corporativo</p>
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
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/15 to-red-600/10 shadow-lg shadow-orange-500/10">
              <Award className="h-10 w-10 text-orange-400" />
            </div>

            <h1 className="text-3xl font-bold uppercase tracking-wide text-white sm:text-4xl lg:text-5xl">
              Nuestro Certificado de
              <span className="block bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Bienestar Corporativo</span>
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Inspirado en la rigurosidad e independencia de las <span className="font-semibold text-orange-300">Estrellas Michelin</span>. KultureMetrix evalúa el entorno laboral de manera <span className="font-semibold text-white">100% ajena a la dirección de la empresa</span>. Nuestro certificado <span className="font-semibold text-white">no se puede comprar</span> con presupuestos de marketing; <span className="font-semibold text-orange-300">se merece</span>. Nuestro valor reside en ofrecer una visión clara, transparente y real de la cultura corporativa a través de una auditoría implacable que blinda el anonimato del empleado y premia a las organizaciones humanas.
            </p>

            {/* Pillars row */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-slate-300">Anonimato blindado</span>
              </div>
              <div className="hidden h-4 w-px bg-slate-700 sm:block" />
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-slate-300">Independencia total</span>
              </div>
              <div className="hidden h-4 w-px bg-slate-700 sm:block" />
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-orange-400" fill="currentColor" />
                <span className="text-sm font-medium text-slate-300">Se merece, no se compra</span>
              </div>
            </div>

            {/* Manifiesto / cita del fundador */}
            <blockquote className="mx-auto mt-12 max-w-3xl rounded-2xl border-l-4 border-orange-500 bg-gradient-to-br from-orange-500/10 via-red-600/5 to-transparent px-6 py-6 text-left shadow-lg shadow-orange-500/5 backdrop-blur sm:px-8 sm:py-8">
              <span className="block text-4xl leading-none text-orange-400/60" aria-hidden="true">&ldquo;</span>
              <p className="-mt-3 text-sm font-bold uppercase tracking-wide text-orange-200 sm:text-base md:text-lg leading-relaxed">
                Viví el corazón de las grandes corporaciones y presencié cómo el tiempo y el talento se gestionaban como recursos desechables. Ahí comprendí que el modelo actual de gestión humana está roto. De esa frustración nace <span className="text-white">KultureMetrix</span>: una solución tecnológica justa, humana y valiente, diseñada para medir y cuidar el bienestar del activo más valioso de cualquier organización: sus personas.
              </p>
              <span className="mt-3 block text-4xl leading-none text-right text-orange-400/60" aria-hidden="true">&rdquo;</span>
              <footer className="mt-3 text-right text-sm font-semibold uppercase tracking-wide text-orange-300/80 sm:text-base">
                — Fran Domínguez, CEO DE KULTUREMETRIX
              </footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Access bar — dual mode */}
      <div className="relative border-t border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto max-w-md px-6 py-10">
          <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-8 shadow-2xl backdrop-blur">
            {/* Mode tabs */}
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-900/60 p-1">
              <button
                type="button"
                onClick={() => { setAccessMode('empresa'); setError(''); setLoading(false); }}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  accessMode === 'empresa'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="h-4 w-4" />
                Empresa
              </button>
              <button
                type="button"
                onClick={() => { setAccessMode('trabajador'); setError(''); setLoading(false); }}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  accessMode === 'trabajador'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20'
                    : 'text-slate-400 hover:text-slate-200'
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
                      className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
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
                      className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
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
                    className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
                  />
                </div>
              )}

              {displayError && <p className="text-sm text-red-400">{displayError}</p>}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-400 hover:to-red-500 disabled:opacity-60"
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
            <FeatureRow icon={<FileCheck className="h-5 w-5" />} title="Certificado de Bienestar" desc="Descarga un certificado verificable al alcanzar 85+ puntos sobre 100." />
          </div>
        </div>
      </div>

      {/* Sección: Nuestro Sello de Valor */}
      <section className="bg-slate-50 py-16 px-6 border-t border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold tracking-widest text-[#43B59C] uppercase bg-[#43B59C]/10 px-3 py-1 rounded-full">
            Garantía Antifraude Auditable
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#205072] mt-4 mb-6 tracking-tight">
            NUESTRO SELLO DE VALOR
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 text-left">
              <h3 className="font-bold text-[#205072] flex items-center gap-2">
                <span className="text-[#43B59C]">✓</span> Filtro de Veracidad
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Validación humana y presencial en tiempo real. Cero cuentas fantasma, cero sesgos manipulados.
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 text-left">
              <h3 className="font-bold text-[#205072] flex items-center gap-2">
                <span className="text-[#43B59C]">✓</span> Valor Seguro
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Un blindaje corporativo que convierte los resultados en una métrica limpia e incontestable.
              </p>
            </div>
          </div>
          <p className="text-base md:text-lg text-slate-700 leading-relaxed max-w-3xl mx-auto font-medium">
            En <span className="font-bold text-[#205072]">KULTURE</span><span className="font-bold text-[#43B59C]">METRIX</span> no creemos en las encuestas masivas que se archivan en el spam. Nuestra auditoría arranca físicamente <span className="underline decoration-[#43B59C] decoration-2 font-semibold">en la sede de la organización</span> a través de una sesión grupal presencial con toda la plantilla.
          </p>
          <p className="text-base md:text-lg text-slate-700 leading-relaxed max-w-3xl mx-auto mt-4">
            Es en ese preciso instante bajo supervisión técnica cuando <span className="font-semibold text-[#205072]">encendemos digitalmente la captación en vivo</span> de los correos corporativos. Un ecosistema blindado que emite accesos únicos y encriptados, garantizando un cuestionario posterior <span className="bg-[#205072]/5 px-1.5 py-0.5 rounded font-bold text-[#205072]">100% anónimo, seguro y libre de fraude corporativo</span>. Datos reales para empresas transparentes.
          </p>
        </div>
      </section>

      {/* Sección: Condiciones de la Convocatoria */}
      <section id="convocatoria" className="bg-white py-20 border-t border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#205072]/20 bg-[#205072]/5 px-4 py-1.5">
              <FileCheck className="h-4 w-4 text-[#205072]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#205072]">Marco normativo</span>
            </div>
            <h2 className="mt-5 text-2xl font-extrabold text-[#205072] sm:text-3xl lg:text-4xl tracking-tight">
              Bases del Proceso de Auditoría Anual
            </h2>
          </div>

          {/* Intro */}
          <p className="mt-6 text-center text-base leading-relaxed text-slate-600 sm:text-lg">
            El acceso al <span className="font-bold text-[#205072]">CERTIFICADO KULTUREMETRIX</span> está sujeto a un estricto proceso de evaluación diseñado bajo un principio de convocatoria única anual:
          </p>

          {/* Conditions grid */}
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {/* Evaluación Única */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 transition-all duration-300 hover:border-[#43B59C]/40 hover:bg-[#43B59C]/5 hover:shadow-lg hover:shadow-[#43B59C]/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#205072]/10 text-[#205072]">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#205072]">Evaluación Única</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Cada organización registrada dispondrá de una sola oportunidad por año para realizar la auditoría de bienestar corporativo.
              </p>
            </div>

            {/* Emisión y Renovación */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 transition-all duration-300 hover:border-[#43B59C]/40 hover:bg-[#43B59C]/5 hover:shadow-lg hover:shadow-[#43B59C]/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#43B59C]/10 text-[#43B59C]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#205072]">Emisión y Renovación</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Las compañías que alcancen la puntuación requerida obtendrán el <span className="font-bold text-[#205072]">CERTIFICADO ANUAL</span>, el cual tendrá validez por 12 meses. La renovación del distintivo requerirá superar una nueva auditoría desde cero al cumplirse el año de su fecha de alta.
              </p>
            </div>

            {/* Política de No Aprobación */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 transition-all duration-300 hover:border-[#43B59C]/40 hover:bg-[#43B59C]/5 hover:shadow-lg hover:shadow-[#43B59C]/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                <Ban className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#205072]">Política de No Aprobación</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Aquellas empresas que no superen los estándares mínimos exigidos no podrán reintentar la evaluación ni optar al ranking hasta la apertura de su siguiente ciclo anual (a contar desde su fecha de alta original).
              </p>
            </div>
          </div>

          {/* Closing statement */}
          <p className="mt-10 rounded-2xl border border-[#205072]/15 bg-[#205072]/[0.03] px-6 py-5 text-center text-sm leading-relaxed text-slate-700 sm:text-base">
            Este marco metodológico garantiza la <span className="font-bold text-[#205072]">transparencia</span>, la <span className="font-bold text-[#205072]">competitividad</span> y el <span className="font-bold text-[#205072]">valor</span> de nuestra distinción en el mercado.
          </p>
        </div>
      </section>

      {/* Sección: Planes y Precios */}
      <section id="precios" className="bg-slate-100 py-24">
        <div className="mx-auto max-w-6xl px-6">
          {/* GDPR Badge */}
          <div className="mx-auto mb-8 flex max-w-2xl items-center justify-center gap-3 rounded-2xl border border-[#43B59C]/30 bg-[#43B59C]/8 px-5 py-3 text-center">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[#43B59C]" />
            <p className="text-sm font-semibold text-[#205072]">
              Cumplimiento estricto del RGPD laboral — Mínimo de 50 empleados requerido para garantizar el anonimato absoluto por departamento
            </p>
          </div>

          {/* Header */}
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold text-[#205072] sm:text-4xl lg:text-5xl tracking-tight">
              Planes adaptados al tamaño de tu organización
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              Facturación anual simplificada mediante transferencia bancaria corporativa. Sin tarjetas de crédito ni costes ocultos.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Plan Crecimiento (PYME) */}
            <PricingCard
              name="Plan Crecimiento"
              tier="PYME"
              range="50 a 149 empleados"
              price="99€"
              priceUnit="/ mes"
              secondary="Facturado anualmente: 1.188€ + IVA"
              features={[
                { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Cuestionarios: Cobertura total para organizaciones de hasta 149 trabajadores.' },
                { icon: <Lock className="h-4 w-4" />, text: 'Acceso: Credenciales de acceso único para la gestión del plan.' },
                { icon: <Users className="h-4 w-4" />, text: 'Conferencia Exclusiva: 1 sesión presencial impartida por el CEO de KULTUREMETRIX (30 min aprox.), previa a la apertura de la campaña de auditoría, en la sede central designada por la empresa contratante (válido dentro de España).' },
                { icon: <BarChart3 className="h-4 w-4" />, text: 'Analítica: Métricas avanzadas de clima laboral.' },
                { icon: <Mail className="h-4 w-4" />, text: 'Soporte: Atención al cliente y resolución de incidencias vía email.' },
                { icon: <ShieldCheck className="h-4 w-4" />, text: 'Seguridad: Garantía absoluta de anonimato por diseño (Privacy by Design).' },
              ]}
              cta="Contactar para Auditoría"
              featured={false}
              onCtaClick={openAuditModal}
            />

            {/* Plan Consolidación (Corporate) — DESTACADA */}
            <PricingCard
              name="Plan Consolidación"
              tier="Corporate"
              range="150 a 499 empleados"
              price="249€"
              priceUnit="/ mes"
              secondary="Facturado anualmente: 2.988€ + IVA"
              features={[
                { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Incluye: Todo el alcance y beneficios contemplados en el Plan PYME.' },
                { icon: <Users className="h-4 w-4" />, text: 'Conferencias Corporativas: Sesiones presenciales impartidas por el CEO de KULTUREMETRIX (30 min aprox.), previas a la apertura de la campaña de auditoría. Flexibilidad de ejecución en formato grupal unificado o segmentado por departamentos, según las directrices de la empresa contratante, en la sede central designada (dentro de España).' },
              ]}
              cta="Contactar para Auditoría"
              featured={true}
              onCtaClick={openAuditModal}
            />

            {/* Plan Enterprise */}
            <PricingCard
              name="Plan Enterprise"
              tier="Enterprise"
              range="Más de 500 empleados"
              price="Desde 499€"
              priceUnit="/ mes"
              secondary="Contrato personalizado a medida"
              features={[
                { icon: <CheckCircle2 className="h-4 w-4" />, text: 'Incluye: Todo el alcance corporativo y beneficios del Plan CORPORATE.' },
                { icon: <TrendingUp className="h-4 w-4" />, text: 'Conferencias Globales: Sesiones presenciales impartidas por el CEO de KULTUREMETRIX (30 min aprox.), previas a la apertura de la campaña de auditoría. Formato flexible (grupal o por departamentos) con despliegue en múltiples ubicaciones geográficas designadas por la empresa contratante a nivel INTERNACIONAL.' },
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
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#43B59C]/30 bg-gradient-to-br from-[#43B59C]/15 to-[#205072]/10 shadow-lg shadow-[#43B59C]/10">
            <Newspaper className="h-8 w-8 text-[#43B59C]" />
          </div>

          {/* Italic headline */}
          <h2 className="text-3xl font-bold italic tracking-tight text-white sm:text-4xl lg:text-5xl">
            REPUTACIÓN EN MEDIOS DE COMUNICACIÓN ANUAL
          </h2>

          {/* Body text */}
          <p className="mx-auto mt-8 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Impulse la visibilidad y el prestigio de su organización a través del rigor de KULTUREMETRIX. Las compañías que superen con éxito nuestros estándares y obtengan nuestro exclusivo <span className="font-bold text-[#43B59C]">CERTIFICADO</span>, formarán parte de un prestigioso ranking anual. Esta clasificación se proyectará estratégicamente en espacios editoriales y medios de comunicación de referencia, consolidando su posicionamiento como un claro referente en el <span className="font-bold text-[#43B59C]">RANKING DE LAS EMPRESAS DE BIENESTAR CORPORATIVO</span>.
          </p>

          {/* CTA button */}
          <button onClick={openAuditModal} className="mt-10 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#205072] to-[#43B59C] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#43B59C]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#43B59C]/30 hover:from-[#1a4060] hover:to-[#3aa588]">
            <Radio className="h-5 w-5" />
            Iniciar Certificación
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Sección: Nuestra Metodología */}
      <section id="metodologia" className="bg-[#0f172a] py-24">
        <div className="mx-auto max-w-6xl px-6">
          {/* Encabezado */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 px-4 py-1.5">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Protección y precisión garantizadas</span>
            </div>
            <h2 className="mt-6 text-4xl font-bold text-white sm:text-5xl">
              Nuestra Metodología
            </h2>
            <p className="mt-4 text-lg text-slate-400 leading-relaxed">
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
              description="Un motor de cálculo evalúa la diferencia porcentual entre ambas notas. Una discrepancia del 15-30% resta 1.5 puntos directos; si supera el 30%, se penaliza con un 35% del valor total. Las notas nunca se inflan artificialmente."
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
          <div className="mt-14 flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 sm:flex-row sm:gap-10">
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

      {/* Preguntas frecuentes */}
      <section id="faq" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#43B59C]/30 bg-[#43B59C]/10 px-4 py-1.5">
              <ShieldCheck className="h-4 w-4 text-[#43B59C]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#205072]">Resolvemos tus dudas</span>
            </div>
            <h2 className="mt-6 text-4xl font-bold text-[#205072] sm:text-5xl">Preguntas frecuentes</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Conoce cómo protegemos los datos, cómo funciona la auditoría y qué valor aporta la certificación KULTUREMETRIX.
            </p>
          </div>

          <div className="mt-14 space-y-6">
            {FAQ_SECTIONS.map((section) => (
              <div key={section.title} className="overflow-hidden rounded-2xl border border-[#205072]/15 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-[#205072]/10 bg-[#205072]/[0.04] px-6 py-5 sm:px-8">
                  <section.icon className="h-5 w-5 flex-shrink-0 text-[#43B59C]" />
                  <h3 className="text-lg font-bold text-[#205072]">{section.title}</h3>
                </div>
                <div className="divide-y divide-slate-200 px-6 sm:px-8">
                  {section.questions.map((item) => (
                    <details key={item.question} className="group">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-semibold text-[#205072] transition hover:text-[#43B59C] [&::-webkit-details-marker]:hidden">
                        <span>{item.question}</span>
                        <ChevronDown className="h-5 w-5 flex-shrink-0 text-[#43B59C] transition-transform duration-300 group-open:rotate-180" />
                      </summary>
                      <p className="max-w-4xl pb-5 pr-8 text-sm leading-7 text-slate-600">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ContactoTrabajador */}
      <section id="contacto-trabajador" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mx-auto max-w-xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#205072]/30 bg-[#205072]/5 px-4 py-1.5">
              <User className="h-4 w-4 text-[#205072]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#205072]">Registro de trabajadores</span>
            </div>
            <h2 className="mt-6 text-4xl font-bold text-[#205072] sm:text-5xl">ContactoTrabajador</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Regístrate para recibir tu enlace personal de encuesta cuando tu empresa lance una campaña de auditoría.
            </p>
          </div>

          <ContactoTrabajadorForm />
        </div>
      </section>

      {showAuditModal && <AuditRequestModal onClose={closeAuditModal} />}

      <footer className="border-t border-slate-800 py-6">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between text-sm text-slate-500">
          <span>KULTUREMETRIX — Auditoría externa del bienestar corporativo · Privacidad desde el diseño (RGPD)</span>
          <button onClick={onAdminClick} className="flex items-center gap-1.5 text-slate-400 transition hover:text-orange-400">
            <ShieldCheck className="h-3.5 w-3.5" />
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
    title: 'Certificados y Valor de Mercado',
    icon: Award,
    questions: [
      {
        question: '¿Qué es el Certificado de Bienestar Corporativo de KULTUREMETRIX?',
        answer: 'Es un distintivo oficial de calidad emitido por nuestra entidad externa que avala que una empresa cumple con estándares óptimos de salud organizacional y bienestar humano tras superar la auditoría correspondiente.',
      },
      {
        question: '¿Cómo y dónde se pueden descargar los certificados obtenidos?',
        answer: 'Una vez completado el proceso de validación, los administradores pueden acceder a la sección privada de descargas dentro de la plataforma para obtener sus certificados oficiales en formato PDF de alta resolución.',
      },
      {
        question: '¿Por qué es importante contar con una auditoría externa en lugar de una interna?',
        answer: 'La auditoría externa reduce los sesgos internos y genera confianza real en los empleados, quienes pueden expresarse con mayor honestidad al saber que sus datos están protegidos por una entidad neutral y especializada.',
      },
      {
        question: '¿Cómo beneficia esta certificación a la atracción de talento?',
        answer: 'El sello de KULTUREMETRIX funciona como una herramienta de Employer Branding que demuestra de forma transparente el compromiso real de la empresa con el cuidado de sus equipos, ayudando a atraer y retener talento.',
      },
    ],
  },
];

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
        {icon}
      </div>
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="text-sm text-slate-400">{desc}</p>
      </div>
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
    <div className={`group relative overflow-hidden rounded-2xl border ${s.border} bg-slate-800/40 p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${s.glow}`}>
      <span className={`pointer-events-none absolute -top-2 right-4 text-7xl font-black ${s.number} select-none transition-transform duration-300 group-hover:scale-110`}>
        {number}
      </span>
      <div className={`relative flex h-14 w-14 items-center justify-center rounded-xl ${s.iconBg} ${s.iconText} transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </div>
      <h3 className="relative mt-6 text-xl font-bold text-white">{title}</h3>
      <p className="relative mt-3 text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}

function TrustBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <ShieldCheck className="h-4 w-4 text-slate-500" />
      <span className="text-sm font-medium text-slate-400">{label}</span>
    </div>
  );
}

interface PricingFeature {
  icon: React.ReactNode;
  text: string;
}

function PricingCard({
  name,
  tier,
  range,
  price,
  priceUnit,
  secondary,
  features,
  cta,
  featured,
  onCtaClick,
}: {
  name: string;
  tier: string;
  range: string;
  price: string;
  priceUnit: string;
  secondary: string;
  features: PricingFeature[];
  cta: string;
  featured: boolean;
  onCtaClick?: () => void;
}) {
  return (
    <div
      className={`group relative flex flex-col rounded-3xl border-2 p-8 transition-all duration-300 hover:-translate-y-2 ${
        featured
          ? 'border-[#43B59C] bg-white shadow-xl shadow-[#43B59C]/10 hover:shadow-2xl hover:shadow-[#43B59C]/20'
          : 'border-slate-200 bg-white shadow-lg hover:shadow-xl hover:border-slate-300'
      }`}
    >
      {/* Header */}
      <div className="text-center">
        <p className={`text-xs font-bold uppercase tracking-widest ${featured ? 'text-[#43B59C]' : 'text-slate-400'}`}>
          {tier}
        </p>
        <h3 className="mt-2 text-2xl font-extrabold text-[#205072]">{name}</h3>
        <p className="mt-1 text-sm text-slate-500">{range}</p>
      </div>

      {/* Price */}
      <div className="mt-6 text-center">
        <div className="flex items-baseline justify-center gap-1">
          <span className={`text-4xl font-black ${featured ? 'text-[#205072]' : 'text-slate-800'}`}>
            {price}
          </span>
          <span className="text-sm font-medium text-slate-400">{priceUnit}</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">{secondary}</p>
      </div>

      {/* Divider */}
      <div className="my-6 h-px bg-slate-100" />

      {/* Features */}
      <ul className="flex-1 space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
              featured ? 'bg-[#43B59C]/15 text-[#43B59C]' : 'bg-slate-100 text-slate-500'
            }`}>
              {f.icon}
            </span>
            <span className="text-sm leading-relaxed text-slate-700">{f.text}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={onCtaClick}
        className={`mt-8 w-full rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-300 ${
          featured
            ? 'bg-gradient-to-r from-[#205072] to-[#43B59C] text-white shadow-lg shadow-[#43B59C]/20 hover:shadow-xl hover:shadow-[#43B59C]/30 hover:from-[#1a4060] hover:to-[#3aa588]'
            : 'border-2 border-slate-200 bg-white text-[#205072] hover:border-[#43B59C] hover:bg-[#43B59C]/5'
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

interface EmpresaOption {
  id: string;
  nombre: string;
}

function ContactoTrabajadorForm() {
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState('');
  const [selectedDepto, setSelectedDepto] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);
  const [loadingDeptos, setLoadingDeptos] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data, error: queryError } = await supabase
          .from('empresas')
          .select('id, nombre')
          .eq('captacion_activa', true)
          .order('nombre', { ascending: true });
        if (queryError) throw queryError;
        setEmpresas((data || []) as EmpresaOption[]);
      } catch {
        setError('No se pudieron cargar las empresas.');
      } finally {
        setLoadingEmpresas(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedEmpresa) {
      setDepartamentos([]);
      setSelectedDepto('');
      return;
    }
    setLoadingDeptos(true);
    setError('');
    fetchDepartamentosActivos(selectedEmpresa)
      .then((depts) => {
        setDepartamentos(depts);
        setSelectedDepto('');
      })
      .catch(() => {
        setDepartamentos([]);
        setError('No se pudieron cargar los departamentos.');
      })
      .finally(() => setLoadingDeptos(false));
  }, [selectedEmpresa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Introduce un correo válido.');
      return;
    }
    if (!selectedEmpresa) {
      setError('Selecciona tu empresa.');
      return;
    }
    if (!selectedDepto) {
      setError('Selecciona tu departamento.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await registerTrabajador(email, selectedEmpresa, selectedDepto);
      if (result.success) {
        setSuccess(true);
        setEmail('');
        setSelectedEmpresa('');
        setSelectedDepto('');
        setDepartamentos([]);
      } else {
        setError(result.error || 'Error al registrarse.');
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mt-10 rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-[#205072]">¡Registro completado!</h3>
        <p className="mt-2 text-sm text-slate-600">
          Te has registrado correctamente. Cuando tu empresa lance la campaña de auditoría, recibirás un enlace personal en tu correo para participar en la encuesta.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-5 text-sm font-semibold text-[#43B59C] transition hover:text-[#205072]"
        >
          Registrar a otro trabajador
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 rounded-2xl border border-[#205072]/15 bg-white p-8 shadow-sm">
      <div className="space-y-5">
        <div>
          <label htmlFor="ct-email" className="block text-sm font-medium text-slate-700">Inserta tu correo</label>
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="ct-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.correo@empresa.com"
              className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20 transition"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="ct-empresa" className="block text-sm font-medium text-slate-700">Selecciona tu empresa</label>
          <select
            id="ct-empresa"
            value={selectedEmpresa}
            onChange={(e) => setSelectedEmpresa(e.target.value)}
            disabled={loadingEmpresas}
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20 transition disabled:bg-slate-50"
            required
          >
            <option value="">{loadingEmpresas ? 'Cargando empresas…' : empresas.length === 0 ? 'No hay empresas activas ahora mismo' : '— Selecciona —'}</option>
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ct-depto" className="block text-sm font-medium text-slate-700">Selecciona tu departamento</label>
          <select
            id="ct-depto"
            value={selectedDepto}
            onChange={(e) => setSelectedDepto(e.target.value)}
            disabled={!selectedEmpresa || loadingDeptos}
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20 transition disabled:bg-slate-50"
            required
          >
            <option value="">
              {!selectedEmpresa ? 'Primero selecciona una empresa' : loadingDeptos ? 'Cargando departamentos…' : '— Selecciona —'}
            </option>
            {departamentos.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.nombre}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {empresas.length === 0 && !loadingEmpresas && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-700">
              En este momento no hay ninguna empresa con la captación activada. Vuelve a intentarlo cuando tu empresa haya iniciado su auditoría presencial.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || empresas.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#205072] to-[#43B59C] px-4 py-3 font-semibold text-white shadow-lg transition hover:from-[#1a3f5e] hover:to-[#3a9d87] disabled:opacity-60"
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Registrando…</>
          ) : (
            <><User className="h-4 w-4" /> Enviar / Registrarse</>
          )}
        </button>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#43B59C]/20 bg-[#43B59C]/5 p-4">
        <ShieldCheck className="h-4 w-4 flex-shrink-0 text-[#43B59C]" />
        <p className="text-xs text-slate-600">
          Tu correo se usa únicamente para enviarte el enlace de la encuesta. Nunca se vincula con tus respuestas, garantizando un anonimato absoluto conforme al RGPD.
        </p>
      </div>
    </form>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Solicitar auditoría"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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
              className="mt-6 rounded-lg bg-gradient-to-r from-[#205072] to-[#43B59C] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-[#1a4060] hover:to-[#3aa588]"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gradient-to-br from-[#205072] to-[#43B59C] px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <Briefcase className="h-6 w-6 text-white" />
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
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20 transition"
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
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20 transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="ar-pais" className="block text-sm font-medium text-slate-700">País de la sede</label>
                <select
                  id="ar-pais"
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20 transition"
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
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20 transition"
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
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20 transition"
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
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ar-telefono" className="block text-sm font-medium text-slate-700">Teléfono</label>
                <div className="relative mt-2">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="ar-telefono"
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20 transition"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#205072] to-[#43B59C] px-4 py-3 font-semibold text-white shadow-lg transition hover:from-[#1a3f5e] hover:to-[#3a9d87] disabled:opacity-60"
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
