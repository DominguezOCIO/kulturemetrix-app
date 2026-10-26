import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Pencil, Trash2, X, Loader2, Building2, Users,
  DollarSign, Calendar, Mail, Copy, Check, AlertCircle,
  ArrowLeft, ShieldCheck, Activity, ChevronRight, Tag, Power,
  Award, BarChart3, PieChart, Target, Lock, KeyRound, Eye, EyeOff,
  Download, CheckCircle2, Clock, Send,
} from 'lucide-react';
import {
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip,
} from 'recharts';
import { CERTIFICATE_THRESHOLD } from '@/lib/scoring';
import {
  fetchAllEmpresas, createEmpresa, updateEmpresa, deleteEmpresa, fetchEmpresaStats, toggleCaptacion,
  fetchSolicitudesAuditoria, deleteSolicitudAuditoria, updateSolicitudEstado,
  fetchCertificateEnvios, addCertificateEnvio, markCertificateEnvioEnviado,
} from '@/lib/admin';
import type { AdminEmpresa, AdminEmpresaInput, SolicitudAuditoria, CertificateEnvio } from '@/lib/admin';
import { CampaignPanel } from './CampaignPanel';
import type { Empresa } from '@/lib/scoring';
import { Logo } from './Logo';
import { fetchDepartamentos, createDepartamento, deleteDepartamento, fetchTrabajadores, toggleDepartamentoCaptacion, fetchTrabajadoresDetalle, updateTrabajadorEmail, deleteTrabajador, getGlobalTrabajadoresStats } from '@/lib/trabajadores';
import type { Departamento, TrabajadorConToken } from '@/lib/trabajadores';
import { supabase } from '@/lib/supabase';
import { setupCompanyAuth, deleteCompanyAuth } from '@/lib/auth';

const ADMIN_EMAIL = 'admin@kulturemetrix.com';
const ADMIN_PASSWORD = 'KultureAdmin2026!';

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  starter: { label: 'Starter', color: 'bg-slate-100 text-slate-700' },
  pro: { label: 'Pro', color: 'bg-blue-100 text-blue-700' },
  enterprise: { label: 'Enterprise', color: 'bg-purple-100 text-purple-700' },
};

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  activa: { label: 'Activa', color: 'bg-emerald-100 text-emerald-700' },
  suspendida: { label: 'Suspendida', color: 'bg-amber-100 text-amber-700' },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
};

const AUDIT_ESTADO = {
  auditando: { label: 'AUDITANDO', color: 'bg-slate-200 text-slate-700' },
  certificada: { label: 'CERTIFICADA', color: 'bg-emerald-500 text-white' },
  fallida: { label: 'FALLIDA', color: 'bg-red-500 text-white' },
};

function getAuditEstado(notaGlobal: number) {
  if (notaGlobal <= 0) return AUDIT_ESTADO.auditando;
  return notaGlobal >= CERTIFICATE_THRESHOLD ? AUDIT_ESTADO.certificada : AUDIT_ESTADO.fallida;
}

type View = 'login' | 'list';

export function AdminPanel({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState(ADMIN_PASSWORD);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user?.email?.toLowerCase() === ADMIN_EMAIL) {
          setAdminToken(data.session.access_token);
          setView('list');
        }
      }
    })();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error || !data.session) {
        setLoginError('Credenciales de administrador incorrectas.');
        setLoggingIn(false);
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
        await supabase.auth.signOut();
        setLoginError('Esta cuenta no tiene permisos de administrador.');
        setLoggingIn(false);
        return;
      }
      setAdminToken(data.session.access_token);
      setView('list');
    } catch {
      setLoginError('Error al iniciar sesión.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleAdminSignOut = async () => {
    await supabase.auth.signOut();
    setAdminToken(null);
    setView('login');
    onBack();
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition">
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </button>

          <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-8 shadow-2xl backdrop-blur">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Panel de Administración</h1>
                <p className="text-xs text-slate-400">KultureMetrix — Gestión de empresas</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Correo de administrador</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kulturemetrix.com"
                  className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
                />
              </div>

              {loginError && <p className="text-sm text-red-400">{loginError}</p>}

              <button
                type="submit"
                disabled={loggingIn}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-400 hover:to-red-500 disabled:opacity-60"
              >
                {loggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Acceder al panel
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <AdminList onBack={handleAdminSignOut} adminToken={adminToken} />;
}

function AdminList({ onBack, adminToken }: { onBack: () => void; adminToken: string | null }) {
  const [empresas, setEmpresas] = useState<AdminEmpresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminEmpresa | null>(null);
  const [statsCache, setStatsCache] = useState<Record<string, { encuestas: number; tokens: number; tokensUsados: number }>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<AdminEmpresa | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState<AdminEmpresa | null>(null);
  const [tab, setTab] = useState<'empresas' | 'leads'>('empresas');

  const [globalTrabStats, setGlobalTrabStats] = useState({ total: 0, completados: 0, pendientes: 0, participacion: 0 });
  const [loadingTrabStats, setLoadingTrabStats] = useState(true);
  const [certEnvios, setCertEnvios] = useState<CertificateEnvio[]>([]);
  const [certBusyId, setCertBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [data, gStats, envios] = await Promise.all([
        fetchAllEmpresas(),
        getGlobalTrabajadoresStats().catch(() => ({ total: 0, completados: 0, pendientes: 0, participacion: 0 })),
        fetchCertificateEnvios().catch(() => [] as CertificateEnvio[]),
      ]);
      setEmpresas(data);
      setGlobalTrabStats(gStats);
      setCertEnvios(envios);
      setLoadingTrabStats(false);
      const statsMap: Record<string, { encuestas: number; tokens: number; tokensUsados: number }> = {};
      await Promise.all(
        data.map(async (emp) => {
          try {
            statsMap[emp.id] = await fetchEmpresaStats(emp.id);
          } catch {
            statsMap[emp.id] = { encuestas: 0, tokens: 0, tokensUsados: 0 };
          }
        }),
      );
      setStatsCache(statsMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = empresas.filter((e) => {
    const q = search.toLowerCase();
    return e.nombre.toLowerCase().includes(q) || e.api_key.toLowerCase().includes(q) || (e.contacto_email || '').toLowerCase().includes(q);
  });

  const totalMRR = empresas
    .filter((e) => e.estado_suscripcion === 'activa')
    .reduce((acc, e) => acc + Number(e.precio_mensual || 0), 0);

  const activeCount = empresas.filter((e) => e.estado_suscripcion === 'activa').length;
  const totalEncuestas = Object.values(statsCache).reduce((acc, s) => acc + s.encuestas, 0);

  const annualStats = useMemo(() => {
    const empresasConEncuestas = empresas.filter((e) => {
      const s = statsCache[e.id];
      return s && s.encuestas > 0;
    });
    const empresasCertificadas = empresasConEncuestas.filter((e) => e.nota_global >= CERTIFICATE_THRESHOLD);
    const tasaExito = empresasConEncuestas.length > 0
      ? (empresasCertificadas.length / empresasConEncuestas.length) * 100
      : 0;
    return {
      totalAltas: empresas.length,
      totalConEncuestas: empresasConEncuestas.length,
      totalCertificadas: empresasCertificadas.length,
      tasaExito: Math.round(tasaExito * 10) / 10,
    };
  }, [empresas, statsCache]);

  const pieData = [
    { name: 'Certificadas (≥85)', value: annualStats.totalCertificadas, color: '#059669' },
    { name: 'No certificadas (<85)', value: annualStats.totalConEncuestas - annualStats.totalCertificadas, color: '#f59e0b' },
  ];
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = async (input: AdminEmpresaInput, id?: string) => {
    if (id) {
      await updateEmpresa(id, input);
    } else {
      await createEmpresa(input);
    }
    setShowForm(false);
    setEditing(null);
    await load();
  };

  const handleDelete = async (id: string) => {
    await deleteEmpresa(id);
    setDeleteConfirm(null);
    await load();
  };

  const envioEmpresaIds = useMemo(() => new Set(certEnvios.map((e) => e.empresa_id)), [certEnvios]);

  const handleAddCertEnvio = async (emp: AdminEmpresa) => {
    if (envioEmpresaIds.has(emp.id)) return;
    setCertBusyId(emp.id);
    try {
      const nuevo = await addCertificateEnvio(emp);
      setCertEnvios((prev) => [...prev, nuevo]);
    } catch (err) {
      console.error(err);
    } finally {
      setCertBusyId(null);
    }
  };

  const handleMarkEnviado = async (envioId: string) => {
    setCertBusyId(envioId);
    try {
      await markCertificateEnvioEnviado(envioId);
      setCertEnvios((prev) =>
        prev.map((e) => (e.id === envioId ? { ...e, estado: 'enviado', enviado_at: new Date().toISOString() } : e)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setCertBusyId(null);
    }
  };

  if (selectedEmpresa) {
    return (
      <EmpresaDetail
        empresa={selectedEmpresa}
        onBack={() => setSelectedEmpresa(null)}
        onStatsChanged={load}
        adminToken={adminToken}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition">
                <ArrowLeft className="h-4 w-4" /> Cerrar sesión
              </button>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-3">
                <Logo className="h-9 w-40 text-slate-900" />
                <span className="font-bold text-slate-900">Panel de administración</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTab('empresas')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === 'empresas' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <Building2 className="h-4 w-4" /> Empresas
              </button>
              <button
                onClick={() => setTab('leads')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === 'leads' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <Mail className="h-4 w-4" /> Solicitudes de Auditoría
              </button>
              {tab === 'empresas' && (
                <button
                  onClick={() => { setEditing(null); setShowForm(true); }}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:from-orange-400 hover:to-red-500"
                >
                  <Plus className="h-4 w-4" /> Nueva empresa
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {tab === 'leads' ? (
          <SolicitudesAuditoriaPanel />
        ) : (
          <>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={<KeyRound className="h-5 w-5" />} label="Total Códigos Generados" value={loadingTrabStats ? '—' : globalTrabStats.total.toString()} color="text-slate-700 bg-slate-100" />
          <KpiCard icon={<CheckCircle2 className="h-5 w-5" />} label="Auditorías Completadas" value={loadingTrabStats ? '—' : globalTrabStats.completados.toString()} color="text-emerald-700 bg-emerald-100" />
          <KpiCard icon={<Clock className="h-5 w-5" />} label="Auditorías Pendientes" value={loadingTrabStats ? '—' : globalTrabStats.pendientes.toString()} color="text-amber-700 bg-amber-100" />
          <KpiCard icon={<Activity className="h-5 w-5" />} label="Tasa de Participación" value={loadingTrabStats ? '—' : `${globalTrabStats.participacion}%`} color="text-blue-700 bg-blue-100" />
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-900">Dashboard Analítico Global Anual</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">Resumen del rendimiento del proceso de auditoría y certificación.</p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <AnnualKpiRow icon={<Building2 className="h-5 w-5" />} label="Empresas dadas de alta" value={annualStats.totalAltas} color="text-slate-700 bg-slate-100" />
              <AnnualKpiRow icon={<Target className="h-5 w-5" />} label="Empresas que realizaron la auditoría" value={annualStats.totalConEncuestas} color="text-blue-700 bg-blue-100" />
              <AnnualKpiRow icon={<Award className="h-5 w-5" />} label="Empresas certificadas (≥85 pts)" value={annualStats.totalCertificadas} color="text-emerald-700 bg-emerald-100" />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Tasa de Éxito Anual</h3>
              </div>
              <p className="mt-1 text-xs text-slate-500">Empresas certificadas vs. total auditadas</p>
              <div className="mt-3 h-48">
                {annualStats.totalConEncuestas > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                        {pieData.map((entry, idx) => (<Cell key={idx} fill={entry.color} />))}
                      </Pie>
                      <ReTooltip formatter={(v: number) => [`${v} empresas`, '']} />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">Sin datos</div>
                )}
              </div>
              <div className="mt-2 text-center">
                <span className="text-3xl font-bold text-emerald-600">{annualStats.tasaExito}%</span>
                <p className="text-xs text-slate-500">de tasa de éxito</p>
              </div>
              <div className="mt-3 flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  <span className="text-slate-600">Certificadas ({annualStats.totalCertificadas})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600">No certificadas ({annualStats.totalConEncuestas - annualStats.totalCertificadas})</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-8 relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, API key o email…" className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center"><Building2 className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-4 font-semibold text-slate-700">No hay empresas</h3><p className="mt-1 text-sm text-slate-500">Crea tu primera empresa para empezar.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Empresa</th>
                    <th className="px-5 py-3 font-semibold">Plan</th>
                    <th className="px-5 py-3 font-semibold">Estado</th>
                    <th className="px-5 py-3 font-semibold">Cuenta</th>
                    <th className="px-5 py-3 font-semibold">Mensual</th>
                    <th className="px-5 py-3 font-semibold">Encuestas</th>
                    <th className="px-5 py-3 font-semibold">API Key</th>
                    <th className="px-5 py-3 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((emp) => {
                    const stats = statsCache[emp.id] || { encuestas: 0, tokens: 0, tokensUsados: 0 };
                    const planInfo = PLAN_LABELS[emp.plan_suscripcion] || PLAN_LABELS.starter;
                    const auditEstado = getAuditEstado(emp.nota_global);
                    return (
                      <tr key={emp.id} className="transition hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <button onClick={() => setSelectedEmpresa(emp)} className="group text-left">
                            <div className="flex items-center gap-1 font-semibold text-slate-900 group-hover:text-orange-600 transition">
                              {emp.nombre}<ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-orange-500 transition" />
                            </div>
                            {emp.contacto_email && (<div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400"><Mail className="h-3 w-3" /> {emp.contacto_email}</div>)}
                          </button>
                        </td>
                        <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${planInfo.color}`}>{planInfo.label}</span></td>
                        <td className="px-5 py-4">
                          {auditEstado === AUDIT_ESTADO.certificada ? (
                            <button
                              onClick={() => handleAddCertEnvio(emp)}
                              disabled={envioEmpresaIds.has(emp.id) || certBusyId === emp.id}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition ${envioEmpresaIds.has(emp.id) ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                              title={envioEmpresaIds.has(emp.id) ? 'Ya en el listado de envío' : 'Enviar a listado de certificados'}
                            >
                              {certBusyId === emp.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                              {auditEstado.label}
                            </button>
                          ) : (
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${auditEstado.color}`}>{auditEstado.label}</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {emp.auth_user_id ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700"><ShieldCheck className="h-3 w-3 text-slate-500" /> Cuenta Activa</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700"><AlertCircle className="h-3 w-3 text-amber-500" /> Sin Accesos</span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-700">{Number(emp.precio_mensual || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td>
                        <td className="px-5 py-4"><div className="flex items-center gap-1 text-slate-600"><Users className="h-3.5 w-3.5 text-slate-400" /><span className="font-medium">{stats.encuestas}</span></div></td>
                        <td className="px-5 py-4"><button onClick={() => handleCopyKey(emp.api_key)} className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600 transition hover:bg-slate-200">{emp.api_key}{copiedKey === emp.api_key ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}</button></td>
                        <td className="px-5 py-4"><div className="flex items-center justify-end gap-2"><button onClick={() => { setEditing(emp); setShowForm(true); }} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700" title="Editar"><Pencil className="h-4 w-4" /></button><button onClick={() => setDeleteConfirm(emp)} className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600" title="Eliminar"><Trash2 className="h-4 w-4" /></button></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </>
        )}

        {tab === 'empresas' && (
          <CertificateEnviosPanel
            envios={certEnvios}
            onMarkEnviado={handleMarkEnviado}
            busyId={certBusyId}
          />
        )}
      </div>

      {showForm && <EmpresaForm empresa={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />}
      {deleteConfirm && <DeleteConfirm empresa={deleteConfirm} onConfirm={() => handleDelete(deleteConfirm.id)} onCancel={() => setDeleteConfirm(null)} />}
    </div>
  );
}

function SolicitudesAuditoriaPanel() {
  const [solicitudes, setSolicitudes] = useState<SolicitudAuditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchSolicitudesAuditoria();
      setSolicitudes(data);
    } catch (err: any) {
      const detail = err?.message || 'No se pudieron cargar las solicitudes.';
      console.error('Error al cargar solicitudes:', err);
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteSolicitudAuditoria(id);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar la solicitud.');
    }
  };

  const handleEstadoToggle = async (s: SolicitudAuditoria) => {
    const isPendiente = s.estado === 'pendiente';
    const nuevoEstado = isPendiente ? 'contactado' : 'pendiente';
    setUpdatingId(s.id);
    try {
      await updateSolicitudEstado(s.id, nuevoEstado);
      setSolicitudes((prev) =>
        prev.map((item) => (item.id === s.id ? { ...item, estado: nuevoEstado } : item)),
      );
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar el estado.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownload = () => {
    if (solicitudes.length === 0) return;
    const headers = ['Empresa', 'Nº Trabajadores', 'País', 'Persona de contacto', 'Cargo', 'Teléfono', 'Email', 'Estado', 'Fecha'];
    const rows = solicitudes.map((s) => [
      `"${s.empresa.replace(/"/g, '""')}"`,
      s.num_trabajadores,
      `"${s.pais.replace(/"/g, '""')}"`,
      `"${s.persona_contacto.replace(/"/g, '""')}"`,
      `"${s.cargo.replace(/"/g, '""')}"`,
      `"${s.telefono.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      `"${s.estado.replace(/"/g, '""')}"`,
      new Date(s.created_at).toLocaleString('es-ES'),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `solicitudes_auditoria_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const filtered = solicitudes
    .filter((s) => {
      const q = search.toLowerCase();
      return s.empresa.toLowerCase().includes(q)
        || s.persona_contacto.toLowerCase().includes(q)
        || s.email.toLowerCase().includes(q)
        || s.cargo.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const aPendiente = a.estado === 'pendiente';
      const bPendiente = b.estado === 'pendiente';
      if (aPendiente !== bPendiente) return aPendiente ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Solicitudes de Auditoría</h2>
              <p className="text-xs text-slate-500">Leads de empresas que rellenaron el formulario público. Se guardan automáticamente aunque el correo de notificación falle.</p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            disabled={solicitudes.length === 0}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {downloaded ? <Check className="h-4 w-4 text-emerald-400" /> : <ArrowLeft className="h-4 w-4 rotate-90" />}
            Descargar CSV
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-700">Error: {error}</p>
          </div>
        )}

        <div className="mt-5 relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por empresa, contacto, cargo o email…"
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-orange-500" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Mail className="mx-auto h-9 w-9 text-slate-300" />
              <h3 className="mt-3 font-semibold text-slate-700">No hay solicitudes</h3>
              <p className="mt-1 text-sm text-slate-500">Las solicitudes del formulario público aparecerán aquí.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Empresa</th>
                    <th className="px-4 py-3 font-semibold">Contacto</th>
                    <th className="px-4 py-3 font-semibold">Cargo</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Teléfono</th>
                    <th className="px-4 py-3 font-semibold">Trab.</th>
                    <th className="px-4 py-3 font-semibold">País</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                    <th className="px-4 py-3 font-semibold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((s) => (
                    <tr key={s.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{s.empresa}</td>
                      <td className="px-4 py-3 text-slate-700">{s.persona_contacto}</td>
                      <td className="px-4 py-3 text-slate-600">{s.cargo}</td>
                      <td className="px-4 py-3 text-slate-600">{s.email}</td>
                      <td className="px-4 py-3 text-slate-600">{s.telefono}</td>
                      <td className="px-4 py-3 text-slate-600">{s.num_trabajadores}</td>
                      <td className="px-4 py-3 text-slate-600">{s.pais}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEstadoToggle(s)}
                          disabled={updatingId === s.id}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:opacity-60 ${s.estado === 'pendiente' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                          title={s.estado === 'pendiente' ? 'Marcar como contactado' : 'Marcar como pendiente'}
                        >
                          {updatingId === s.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <span className={`h-1.5 w-1.5 rounded-full ${s.estado === 'pendiente' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                          )}
                          {s.estado === 'pendiente' ? 'Pendiente' : 'Contactado'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(s.created_at).toLocaleDateString('es-ES')}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(s.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmpresaDetail({ empresa, onBack, onStatsChanged, adminToken }: {
  empresa: AdminEmpresa;
  onBack: () => void;
  onStatsChanged: () => void;
  adminToken: string | null;
}) {
  const planInfo = PLAN_LABELS[empresa.plan_suscripcion] || PLAN_LABELS.starter;
  const auditEstado = getAuditEstado(empresa.nota_global);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [newDept, setNewDept] = useState('');
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [deptError, setDeptError] = useState('');
  const [authSetupOpen, setAuthSetupOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authShowPassword, setAuthShowPassword] = useState(false);
  const [authSaving, setAuthSaving] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState(false);
  const [hasAuth, setHasAuth] = useState(false);

  const empresaForCampaign: Empresa = {
    id: empresa.id, nombre: empresa.nombre, api_key: empresa.api_key,
    estado_suscripcion: empresa.estado_suscripcion, nota_global: empresa.nota_global,
  };

  const loadDepartamentos = async () => {
    setLoadingDepts(true);
    try {
      const depts = await fetchDepartamentos(empresa.id);
      setDepartamentos(depts);
    } catch (err) { console.error(err); } finally { setLoadingDepts(false); }
  };

  useEffect(() => {
    loadDepartamentos();
    setHasAuth(!!(empresa as AdminEmpresa & { auth_user_id?: string | null }).auth_user_id);
  }, []);

  const handleAddDept = async () => {
    const name = newDept.trim();
    if (!name) return;
    setDeptError('');
    try { await createDepartamento(empresa.id, name); setNewDept(''); await loadDepartamentos(); }
    catch (err: any) { setDeptError(err.message || 'Error al crear el departamento.'); }
  };

  const handleDeleteDept = async (id: string) => {
    setDeptError('');
    try { await deleteDepartamento(id); await loadDepartamentos(); }
    catch { setDeptError('No se puede eliminar: tiene trabajadores o campañas vinculadas.'); }
  };

  const handleToggleDept = async (id: string, current: boolean) => {
    try { await toggleDepartamentoCaptacion(id, !current); await loadDepartamentos(); } catch (err) { console.error(err); }
  };

  const handleCampaignSent = async () => { onStatsChanged(); };

  const [captacionActiva, setCaptacionActiva] = useState(empresa.captacion_activa ?? false);
  const [toggling, setToggling] = useState(false);

  const handleToggleCaptacion = async () => {
    setToggling(true);
    try { const newValue = !captacionActiva; await toggleCaptacion(empresa.id, newValue); setCaptacionActiva(newValue); }
    catch (err) { console.error(err); } finally { setToggling(false); }
  };

  const handleSetupAuth = async () => {
    if (!adminToken) { setAuthError('No hay sesión de administrador.'); return; }
    if (!authEmail.trim() || !authPassword) { setAuthError('Correo y contraseña son obligatorios.'); return; }
    if (authPassword.length < 8) { setAuthError('La contraseña debe tener al menos 8 caracteres.'); return; }
    setAuthSaving(true);
    setAuthError('');
    try {
      const result = await setupCompanyAuth(adminToken, empresa.id, authEmail.trim(), authPassword);
      if (result.success) {
        setAuthSuccess(true);
        setHasAuth(true);
        setAuthSetupOpen(false);
        setAuthEmail('');
        setAuthPassword('');
        onStatsChanged();
        setTimeout(() => setAuthSuccess(false), 3000);
      } else {
        setAuthError(result.error || 'Error al crear las credenciales.');
      }
    } catch {
      setAuthError('Error de conexión.');
    } finally { setAuthSaving(false); }
  };

  const handleDeleteAuth = async () => {
    if (!adminToken) return;
    setAuthSaving(true);
    try {
      const result = await deleteCompanyAuth(adminToken, empresa.id);
      if (result.success) { setHasAuth(false); onStatsChanged(); }
    } catch { console.error('Error'); } finally { setAuthSaving(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition"><ArrowLeft className="h-4 w-4" /> Volver al panel</button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3"><Logo className="h-9 w-40 text-slate-900" /><span className="font-bold text-slate-900">{empresa.nombre}</span></div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"><Building2 className="h-5 w-5 text-slate-600" /></div>
                <div><h2 className="text-lg font-bold text-slate-900">{empresa.nombre}</h2><p className="text-xs text-slate-500">{empresa.contacto_nombre || 'Sin contacto'} · {empresa.contacto_email || 'Sin email'}</p></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${planInfo.color}`}>{planInfo.label}</span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${auditEstado.color}`}>{auditEstado.label}</span>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Mensual</p><p className="mt-1 text-sm font-bold text-slate-900">{Number(empresa.precio_mensual || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</p></div>
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Nota global</p><p className="mt-1 text-sm font-bold text-slate-900">{empresa.nota_global.toFixed(1)} / 100</p></div>
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Alta</p><p className="mt-1 text-sm font-bold text-slate-900">{empresa.fecha_alta || '—'}</p></div>
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Renovación</p><p className="mt-1 text-sm font-bold text-slate-900">{empresa.fecha_renovacion || '—'}</p></div>
          </div>
        </div>

        {/* Auth credentials management */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${hasAuth ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                <KeyRound className={`h-5 w-5 transition ${hasAuth ? 'text-emerald-600' : 'text-amber-600'}`} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Credenciales de acceso</h3>
                <p className="text-xs text-slate-500">
                  {hasAuth ? 'La empresa tiene credenciales de acceso configuradas.' : 'Sin credenciales. Crea unas para que la empresa pueda iniciar sesión.'}
                </p>
              </div>
            </div>
            {hasAuth ? (
              <button onClick={handleDeleteAuth} disabled={authSaving} className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50">
                <Trash2 className="h-4 w-4" /> Eliminar acceso
              </button>
            ) : (
              <button onClick={() => setAuthSetupOpen(true)} className="flex items-center gap-2 rounded-lg bg-[#205072] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1a3f5e]">
                <KeyRound className="h-4 w-4" /> Crear credenciales
              </button>
            )}
          </div>
          {authSuccess && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <Check className="h-4 w-4 text-emerald-600" />
              <p className="text-sm text-emerald-700">Credenciales creadas correctamente. La empresa ya puede iniciar sesión.</p>
            </div>
          )}
        </div>

        {/* Captación switch */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${captacionActiva ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                <Power className={`h-5 w-5 transition ${captacionActiva ? 'text-emerald-600' : 'text-slate-400'}`} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Activar captación ahora</h3>
                <p className="text-xs text-slate-500">{captacionActiva ? 'La empresa es visible en el formulario público. Los trabajadores pueden registrarse.' : 'La empresa no es visible en el formulario público. Actívala durante la reunión presencial.'}</p>
              </div>
            </div>
            <button onClick={handleToggleCaptacion} disabled={toggling} className={`relative inline-flex h-8 w-16 flex-shrink-0 items-center rounded-full transition-colors duration-300 disabled:opacity-50 ${captacionActiva ? 'bg-emerald-500' : 'bg-slate-300'}`} title={captacionActiva ? 'Desactivar captación' : 'Activar captación'}>
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${captacionActiva ? 'translate-x-9' : 'translate-x-1'}`} />
              <span className={`absolute text-[10px] font-bold ${captacionActiva ? 'right-2 text-emerald-50' : 'left-2 text-slate-500'}`}>{captacionActiva ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Department management */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#205072]/10 text-[#205072]"><Tag className="h-5 w-5" /></div>
            <div><h3 className="font-bold text-slate-900">Configuración de departamentos</h3><p className="text-xs text-slate-500">Crea los departamentos de esta empresa para la segmentación de campañas.</p></div>
          </div>
          {deptError && (<div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3"><AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" /><p className="text-sm text-red-700">{deptError}</p></div>)}
          {loadingDepts ? (<div className="mt-5 flex items-center justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>) : (
            <>
              <div className="mt-5 space-y-2">
                {departamentos.length === 0 && (<p className="text-sm text-slate-400">No hay departamentos creados todavía.</p>)}
                {departamentos.map((dept) => (
                  <div key={dept.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                    <Tag className={`h-4 w-4 ${dept.captacion_activa ? 'text-[#43B59C]' : 'text-slate-300'}`} />
                    <span className="flex-1 text-sm font-medium text-slate-700">{dept.nombre}</span>
                    <span className={`text-[10px] font-bold ${dept.captacion_activa ? 'text-emerald-600' : 'text-slate-400'}`}>{dept.captacion_activa ? 'CAPTACIÓN ON' : 'CAPTACIÓN OFF'}</span>
                    <button onClick={() => handleToggleDept(dept.id, dept.captacion_activa)} className={`relative inline-flex h-6 w-12 flex-shrink-0 items-center rounded-full transition-colors duration-300 ${dept.captacion_activa ? 'bg-emerald-500' : 'bg-slate-300'}`} title={dept.captacion_activa ? 'Desactivar captación' : 'Activar captación'}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${dept.captacion_activa ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                    <button onClick={() => handleDeleteDept(dept.id)} className="rounded p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600" title="Eliminar departamento"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <input type="text" value={newDept} onChange={(e) => setNewDept(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newDept.trim()) { e.preventDefault(); handleAddDept(); } }} placeholder="Ej. Recursos Humanos, Ventas, IT…" className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20 transition" />
                <button onClick={handleAddDept} disabled={!newDept.trim()} className="flex items-center gap-2 rounded-lg bg-[#205072] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3f5e] disabled:opacity-50"><Plus className="h-4 w-4" /> Añadir</button>
              </div>
            </>
          )}
        </div>

        <TrabajadoresTable empresaId={empresa.id} onStatsChanged={onStatsChanged} />

        <div className="mt-6"><CampaignPanel empresa={empresaForCampaign} onSent={handleCampaignSent} /></div>
      </div>

      {/* Auth setup modal */}
      {authSetupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Crear credenciales de acceso</h3>
              <button onClick={() => setAuthSetupOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <p className="mt-2 text-sm text-slate-500">Estas credenciales permitirán a <strong>{empresa.nombre}</strong> acceder a su dashboard.</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Correo electrónico</label>
                <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="contacto@empresa.com" className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Contraseña (mín. 8 caracteres)</label>
                <div className="relative mt-2">
                  <input type={authShowPassword ? 'text' : 'password'} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-sm text-slate-900 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20" />
                  <button type="button" onClick={() => setAuthShowPassword(!authShowPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {authShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {authError && <div className="rounded-xl border border-red-200 bg-red-50 p-3"><p className="text-sm text-red-700">{authError}</p></div>}
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button onClick={() => setAuthSetupOpen(false)} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancelar</button>
                <button onClick={handleSetupAuth} disabled={authSaving} className="flex items-center gap-2 rounded-lg bg-[#205072] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3f5e] disabled:opacity-50">
                  {authSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Crear credenciales
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrabajadoresTable({ empresaId, onStatsChanged }: { empresaId: string; onStatsChanged: () => void; }) {
  const [trabajadores, setTrabajadores] = useState<TrabajadorConToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TrabajadorConToken | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');

  const [downloadedCsv, setDownloadedCsv] = useState(false);

  const deptosUnicos = useMemo(() => Array.from(new Set(trabajadores.map((t) => t.departamento_nombre))).sort(), [trabajadores]);
  const filteredTrabajadores = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return trabajadores.filter((t) => {
      const matchSearch = !q || t.email.toLowerCase().includes(q) || t.departamento_nombre.toLowerCase().includes(q);
      const matchDept = filterDept === 'all' || t.departamento_nombre === filterDept;
      return matchSearch && matchDept;
    });
  }, [trabajadores, searchTerm, filterDept]);

  const load = async () => {
    try { const data = await fetchTrabajadoresDetalle(empresaId); setTrabajadores(data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [empresaId]);

  const handleSaveEdit = async (id: string) => {
    setSaving(true); setEditError('');
    try { await updateTrabajadorEmail(id, editEmail); setEditingId(null); await load(); onStatsChanged(); }
    catch (err: any) { setEditError(err.message || 'Error al guardar.'); } finally { setSaving(false); }
  };

  const handleCancelEdit = () => { setEditingId(null); setEditEmail(''); setEditError(''); };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteTrabajador(deleteTarget.id); setDeleteTarget(null); await load(); onStatsChanged(); }
    catch (err) { console.error(err); setDeleteTarget(null); }
  };

  const handleDownloadCsv = () => {
    if (trabajadores.length === 0) return;
    const rows = filteredTrabajadores.map((t) => [
      `"${t.email.replace(/"/g, '""')}"`,
      `"${t.departamento_nombre.replace(/"/g, '""')}"`,
      `"${t.codigo_acceso || ''}"`,
    ]);
    const csv = ['Correo electrónico,Departamento,Código de Acceso', ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trabajadores_${empresaId.slice(0, 8)}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadedCsv(true);
    setTimeout(() => setDownloadedCsv(false), 2000);
  };

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#205072]/10 text-[#205072]"><Users className="h-5 w-5" /></div>
        <div><h3 className="font-bold text-slate-900">Trabajadores registrados</h3><p className="text-xs text-slate-500">Lista en tiempo real de los correos registrados desde la Home.</p></div>
      </div>
      {trabajadores.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {downloadedCsv ? <Check className="h-4 w-4 text-emerald-400" /> : <Download className="h-4 w-4" />}
            Descargar CSV de Trabajadores
          </button>
        </div>
      )}
      {loading ? (
        <div className="mt-5 flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
      ) : trabajadores.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center"><p className="text-sm text-slate-400">Aún no se ha registrado ningún trabajador.</p></div>
      ) : (
        <>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por correo o departamento..." className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20 transition" />
            </div>
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20 transition">
              <option value="all">Todos los departamentos</option>
              {deptosUnicos.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>
          {filteredTrabajadores.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center"><p className="text-sm text-slate-400">No se encontraron trabajadores que coincidan con la búsqueda.</p></div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><th className="px-3 py-2.5">Correo</th><th className="px-3 py-2.5">Departamento</th><th className="px-3 py-2.5">Código de Acceso</th><th className="px-3 py-2.5">Estado del código</th><th className="px-3 py-2.5 text-right">Acciones</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTrabajadores.map((t) => (
                    <tr key={t.id} className="group hover:bg-slate-50 transition">
                      <td className="px-3 py-2.5">
                        {editingId === t.id ? (
                          <div className="flex items-center gap-2">
                            <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveEdit(t.id); } if (e.key === 'Escape') handleCancelEdit(); }} className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:border-[#43B59C] focus:outline-none focus:ring-2 focus:ring-[#43B59C]/20" autoFocus />
                            {saving ? <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-slate-400" /> : (<><button onClick={() => handleSaveEdit(t.id)} disabled={!editEmail.trim() || editEmail.trim() === t.email} className="rounded p-1 text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-30" title="Guardar"><Check className="h-4 w-4" /></button><button onClick={handleCancelEdit} className="rounded p-1 text-slate-400 transition hover:bg-slate-100" title="Cancelar"><X className="h-4 w-4" /></button></>)}
                          </div>
                        ) : (<span className="font-medium text-slate-700">{t.email}</span>)}
                      </td>
                      <td className="px-3 py-2.5"><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"><Tag className="h-3 w-3 text-[#43B59C]" />{t.departamento_nombre}</span></td>
                      <td className="px-3 py-2.5">
                        {t.codigo_acceso ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 font-mono text-xs font-semibold text-slate-700 border border-slate-200"><KeyRound className="h-3 w-3 text-slate-400" />{t.codigo_acceso}</span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {!t.token_existe ? (<span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-slate-300" />Sin código</span>) : t.token_usado ? (<span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Usado</span>) : (<span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Pendiente</span>)}
                      </td>
                      <td className="px-3 py-2.5"><div className="flex items-center justify-end gap-1">
                        {editingId !== t.id && (<button onClick={() => { setEditingId(t.id); setEditEmail(t.email); setEditError(''); }} className="rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" title="Editar correo"><Pencil className="h-4 w-4" /></button>)}
                        <button onClick={() => setDeleteTarget(t)} className="rounded p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600" title="Eliminar trabajador"><Trash2 className="h-4 w-4" /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {editError && <p className="mt-3 text-xs text-red-600">{editError}</p>}
            </div>
          )}
        </>
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100"><AlertCircle className="h-6 w-6 text-red-600" /></div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">¿Eliminar este trabajador?</h3>
            <p className="mt-2 text-sm text-slate-500">Se eliminará el registro de <span className="font-semibold text-slate-700">{deleteTarget.email}</span> de la base de datos. El trabajador podrá volver a registrarse desde la Home si es necesario.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancelar</button>
              <button onClick={handleConfirmDelete} className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"><Trash2 className="h-4 w-4" /> Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (<div className="rounded-2xl border border-slate-200 bg-white p-5"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>{icon}</div><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p></div>);
}

function AnnualKpiRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (<div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"><div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>{icon}</div><div><p className="text-2xl font-bold text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p></div></div>);
}

function EmpresaForm({ empresa, onSave, onCancel }: { empresa: AdminEmpresa | null; onSave: (input: AdminEmpresaInput, id?: string) => void; onCancel: () => void; }) {
  const [form, setForm] = useState<AdminEmpresaInput>({
    nombre: empresa?.nombre || '', api_key: empresa?.api_key || '', estado_suscripcion: empresa?.estado_suscripcion || 'activa',
    plan_suscripcion: empresa?.plan_suscripcion || 'starter', precio_mensual: empresa ? Number(empresa.precio_mensual) : 0,
    fecha_alta: empresa?.fecha_alta || new Date().toISOString().slice(0, 10), fecha_renovacion: empresa?.fecha_renovacion || '',
    contacto_email: empresa?.contacto_email || '', contacto_nombre: empresa?.contacto_nombre || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) { setError('El nombre de la empresa es obligatorio.'); return; }
    setSaving(true); setError('');
    try { await onSave(form, empresa?.id); } catch (err: any) { setError(err.message || 'Error al guardar.'); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">{empresa ? 'Editar empresa' : 'Nueva empresa'}</h2>
          <button onClick={onCancel} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div><label className="block text-sm font-medium text-slate-700">Nombre de la empresa *</label><input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" placeholder="Ej. Acme Corp" autoFocus /></div>
            <div><label className="block text-sm font-medium text-slate-700">API Key</label><input type="text" value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 font-mono text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" placeholder="Se genera automáticamente si se deja vacío" /><p className="mt-1 text-xs text-slate-400">Deja vacío para autogenerar</p></div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div><label className="block text-sm font-medium text-slate-700">Plan de suscripción</label><select value={form.plan_suscripcion} onChange={(e) => setForm({ ...form, plan_suscripcion: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"><option value="starter">Starter</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option></select></div>
            <div><label className="block text-sm font-medium text-slate-700">Estado</label><select value={form.estado_suscripcion} onChange={(e) => setForm({ ...form, estado_suscripcion: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"><option value="activa">Activa</option><option value="suspendida">Suspendida</option><option value="cancelada">Cancelada</option></select></div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div><label className="block text-sm font-medium text-slate-700">Precio mensual (€)</label><input type="number" step="0.01" min="0" value={form.precio_mensual} onChange={(e) => setForm({ ...form, precio_mensual: Number(e.target.value) })} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" /></div>
            <div><label className="block text-sm font-medium text-slate-700">Contacto (nombre)</label><input type="text" value={form.contacto_nombre || ''} onChange={(e) => setForm({ ...form, contacto_nombre: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" placeholder="Ej. María García" /></div>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div><label className="flex items-center gap-1.5 text-sm font-medium text-slate-700"><Calendar className="h-3.5 w-3.5" /> Fecha de alta</label><input type="date" value={form.fecha_alta || ''} onChange={(e) => setForm({ ...form, fecha_alta: e.target.value || null })} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" /></div>
            <div><label className="flex items-center gap-1.5 text-sm font-medium text-slate-700"><Calendar className="h-3.5 w-3.5" /> Próxima renovación</label><input type="date" value={form.fecha_renovacion || ''} onChange={(e) => setForm({ ...form, fecha_renovacion: e.target.value || null })} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" /></div>
            <div><label className="flex items-center gap-1.5 text-sm font-medium text-slate-700"><Mail className="h-3.5 w-3.5" /> Email de contacto</label><input type="email" value={form.contacto_email || ''} onChange={(e) => setForm({ ...form, contacto_email: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" placeholder="contacto@empresa.com" /></div>
          </div>
          {error && (<div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"><AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" /><p className="text-sm text-red-700">{error}</p></div>)}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-orange-400 hover:to-red-500 disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{empresa ? 'Guardar cambios' : 'Crear empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ empresa, onConfirm, onCancel }: { empresa: AdminEmpresa; onConfirm: () => void; onCancel: () => void; }) {
  const [deleting, setDeleting] = useState(false);
  const handleConfirm = async () => { setDeleting(true); try { await onConfirm(); } catch (err) { console.error(err); } finally { setDeleting(false); } };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100"><AlertCircle className="h-6 w-6 text-red-600" /></div>
        <h3 className="mt-4 text-lg font-bold text-slate-900">¿Eliminar {empresa.nombre}?</h3>
        <p className="mt-2 text-sm text-slate-500">Esta acción eliminará la empresa, todas sus respuestas agregadas y todos los tokens de campaña asociados. Esta acción no se puede deshacer.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancelar</button>
          <button onClick={handleConfirm} disabled={deleting} className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50">{deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Eliminar</button>
        </div>
      </div>
    </div>
  );
}

function CertificateEnviosPanel({ envios, onMarkEnviado, busyId }: {
  envios: CertificateEnvio[];
  onMarkEnviado: (id: string) => void;
  busyId: string | null;
}) {
  const sorted = [...envios].sort((a, b) => {
    const aPend = a.estado === 'pendiente';
    const bPend = b.estado === 'pendiente';
    if (aPend !== bPend) return aPend ? -1 : 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
          <Award className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Enviar Certificado</h2>
          <p className="text-xs text-slate-500">Empresas certificadas pendientes de envío. Al marcar como ENVIADO pasan al final del listado.</p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="py-12 text-center">
          <Award className="mx-auto h-9 w-9 text-slate-300" />
          <h3 className="mt-3 font-semibold text-slate-700">No hay empresas en el listado</h3>
          <p className="mt-1 text-sm text-slate-500">Las empresas certificadas aparecerán aquí al hacer clic en su etiqueta CERTIFICADA.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Empresa</th>
                <th className="px-5 py-3 font-semibold">Correo</th>
                <th className="px-5 py-3 font-semibold">Persona de contacto</th>
                <th className="px-5 py-3 font-semibold text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((envio) => (
                <tr key={envio.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-900">{envio.empresa_nombre}</td>
                  <td className="px-5 py-4 text-slate-600">{envio.contacto_email || '—'}</td>
                  <td className="px-5 py-4 text-slate-600">{envio.contacto_nombre || '—'}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => envio.estado === 'pendiente' && onMarkEnviado(envio.id)}
                      disabled={envio.estado === 'enviado' || busyId === envio.id}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                        envio.estado === 'pendiente'
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {busyId === envio.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <span className={`h-1.5 w-1.5 rounded-full ${envio.estado === 'pendiente' ? 'bg-amber-500' : 'bg-white'}`} />
                      )}
                      {envio.estado === 'pendiente' ? 'PENDIENTE' : 'ENVIADO'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
