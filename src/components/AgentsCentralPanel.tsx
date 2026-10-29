import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Bot, Power, Settings, Inbox, Terminal, Loader2, RefreshCw, Send, Pencil, X,
  CheckCircle2, Ban, Mail, Newspaper, TrendingUp, Users, Eye, MousePointerClick,
  CalendarCheck, Megaphone, ChevronRight, Activity, AlertCircle, Cpu, Globe,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
  IaLead, IaPress, IaConfig, IaLog, IaMetricaDiaria,
  fetchIaConfig, updateIaConfig, fetchIaLeads, fetchIaPress,
  updateIaLeadEstado, updateIaLeadEmail, deleteIaLead,
  updateIaPressEstado, updateIaPressEmail, deleteIaPress,
  fetchIaMetricas, fetchIaLogs, triggerIaCentral,
  PAISES_OPTIONS, SECTORES_OPTIONS, TIPOS_MEDIO_OPTIONS, AGENT_INFO,
} from '@/lib/iaAgents';

type Tab = 'dashboard' | 'config' | 'inbox' | 'logs';

const ESTADO_STYLES: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  aprobado: 'bg-blue-100 text-blue-700',
  enviado: 'bg-emerald-100 text-emerald-700',
  respondido: 'bg-purple-100 text-purple-700',
  descartado: 'bg-slate-200 text-slate-500',
};

const NIVEL_STYLES: Record<string, string> = {
  info: 'text-slate-400',
  ok: 'text-emerald-400',
  warn: 'text-amber-400',
  error: 'text-red-400',
};

const NIVEL_DOT: Record<string, string> = {
  info: 'bg-slate-500',
  ok: 'bg-emerald-500',
  warn: 'bg-amber-500',
  error: 'bg-red-500',
};

export function AgentsCentralPanel({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition">
                <ChevronRight className="h-4 w-4 rotate-180" /> Volver al panel
              </button>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-sm">
                  <Bot className="h-5 w-5" />
                </div>
                <span className="font-bold text-slate-900">Central de Agentes IA</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TabButton icon={<Activity className="h-4 w-4" />} label="Dashboard" active={tab === 'dashboard'} onClick={() => setTab('dashboard')} />
              <TabButton icon={<Settings className="h-4 w-4" />} label="Configuración" active={tab === 'config'} onClick={() => setTab('config')} />
              <TabButton icon={<Inbox className="h-4 w-4" />} label="Aprobación" active={tab === 'inbox'} onClick={() => setTab('inbox')} />
              <TabButton icon={<Terminal className="h-4 w-4" />} label="Logs" active={tab === 'logs'} onClick={() => setTab('logs')} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {tab === 'dashboard' && <DashboardTab />}
        {tab === 'config' && <ConfigTab />}
        {tab === 'inbox' && <InboxTab />}
        {tab === 'logs' && <LogsTab />}
      </div>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
    >
      {icon} {label}
    </button>
  );
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>{icon}</div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

// =============== TAB 1: DASHBOARD ===============
function DashboardTab() {
  const [metricas, setMetricas] = useState<IaMetricaDiaria[]>([]);
  const [leads, setLeads] = useState<IaLead[]>([]);
  const [press, setPress] = useState<IaPress[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<'b2b' | 'rrpp'>('b2b');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, l, p] = await Promise.all([fetchIaMetricas(), fetchIaLeads(), fetchIaPress()]);
      setMetricas(m);
      setLeads(l);
      setPress(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const b2bMetrics = useMemo(() => {
    const enviados = leads.filter((l) => l.estado !== 'pendiente' && l.estado !== 'descartado').length;
    const aperturas = leads.filter((l) => l.abierto).length;
    const clics = leads.filter((l) => l.clicado).length;
    const respuestas = leads.filter((l) => l.respondido).length;
    const reuniones = leads.filter((l) => l.reunion_agendada).length;
    const openRate = enviados > 0 ? Math.round((aperturas / enviados) * 100) : 0;
    return { enviados, aperturas, clics, respuestas, reuniones, openRate };
  }, [leads]);

  const rrppMetrics = useMemo(() => {
    const enviados = press.filter((p) => p.estado !== 'pendiente' && p.estado !== 'descartado').length;
    const aperturas = press.filter((p) => p.abierto).length;
    const clics = press.filter((p) => p.clicado).length;
    const menciones = press.filter((p) => p.mencion_conseguida).length;
    return { enviados, aperturas, clics, menciones };
  }, [press]);

  const chartData = useMemo(() => {
    return metricas
      .filter((m) => m.tipo === section)
      .map((m) => ({
        fecha: m.fecha,
        Enviados: m.enviados,
        Aperturas: m.aperturas,
        Clics: m.clics,
        Respuestas: section === 'b2b' ? m.respuestas : undefined,
        Reuniones: section === 'b2b' ? m.reuniones : undefined,
        Menciones: section === 'rrpp' ? m.menciones : undefined,
      }));
  }, [metricas, section]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Dashboard Central</h2>
          <p className="text-sm text-slate-500">Métricas del día en tiempo real, divididas por célula de trabajo.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSection('b2b')} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${section === 'b2b' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
            <TrendingUp className="mr-1.5 inline h-4 w-4" /> B2B / Ventas
          </button>
          <button onClick={() => setSection('rrpp')} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${section === 'rrpp' ? 'bg-cyan-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
            <Megaphone className="mr-1.5 inline h-4 w-4" /> RRPP / Medios
          </button>
        </div>
      </div>

      {section === 'b2b' ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <MetricCard icon={<Send className="h-5 w-5 text-white" />} label="Correos enviados" value={b2bMetrics.enviados} color="bg-indigo-500" />
          <MetricCard icon={<Eye className="h-5 w-5 text-white" />} label="Tasa de apertura" value={`${b2bMetrics.openRate}%`} color="bg-blue-500" />
          <MetricCard icon={<MousePointerClick className="h-5 w-5 text-white" />} label="Clics en enlace" value={b2bMetrics.clics} color="bg-cyan-500" />
          <MetricCard icon={<Mail className="h-5 w-5 text-white" />} label="Respuestas interesadas" value={b2bMetrics.respuestas} color="bg-emerald-500" />
          <MetricCard icon={<CalendarCheck className="h-5 w-5 text-white" />} label="Reuniones agendadas" value={b2bMetrics.reuniones} color="bg-orange-500" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard icon={<Send className="h-5 w-5 text-white" />} label="Notas enviadas (meta 100-200/mes)" value={rrppMetrics.enviados} color="bg-cyan-500" />
          <MetricCard icon={<Eye className="h-5 w-5 text-white" />} label="Aperturas de periodistas" value={rrppMetrics.aperturas} color="bg-blue-500" />
          <MetricCard icon={<MousePointerClick className="h-5 w-5 text-white" />} label="Clics al dossier" value={rrppMetrics.clics} color="bg-indigo-500" />
          <MetricCard icon={<Newspaper className="h-5 w-5 text-white" />} label="Menciones conseguidas" value={rrppMetrics.menciones} color="bg-emerald-500" />
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-slate-400" />
          <h3 className="font-bold text-slate-900">Evolución histórica — {section === 'b2b' ? 'B2B' : 'RRPP'}</h3>
        </div>
        <p className="mt-1 text-sm text-slate-500">Tendencia de enviados, aperturas y clics a lo largo del tiempo.</p>
        <div className="mt-6 h-64">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gradEnv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradApe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false} />
                <ReTooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Area type="monotone" dataKey="Enviados" stroke="#6366f1" strokeWidth={2} fill="url(#gradEnv)" />
                <Area type="monotone" dataKey="Aperturas" stroke="#06b6d4" strokeWidth={2} fill="url(#gradApe)" />
                <Area type="monotone" dataKey="Clics" stroke="#f59e0b" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">Sin datos históricos todavía.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============== TAB 2: CONFIGURACIÓN ===============
function ConfigTab() {
  const [config, setConfig] = useState<IaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const [paises, setPaises] = useState<string[]>([]);
  const [sectores, setSectores] = useState<string[]>([]);
  const [tamanoMin, setTamanoMin] = useState(50);
  const [tamanoMax, setTamanoMax] = useState(5000);
  const [tiposMedio, setTiposMedio] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const c = await fetchIaConfig();
      if (c) {
        setConfig(c);
        setPaises(c.paises || []);
        setSectores(c.sectores || []);
        setTamanoMin(c.tamano_min || 50);
        setTamanoMax(c.tamano_max || 5000);
        setTiposMedio(c.tipos_medio || []);
        setKeywords(c.keywords_rrpp || []);
        setWebhookUrl(c.webhook_url || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (list: string[], value: string, setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
      setKeywordInput('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateIaConfig({
        paises, sectores, tamano_min: tamanoMin, tamano_max: tamanoMax,
        tipos_medio: tiposMedio, keywords_rrpp: keywords, webhook_url: webhookUrl,
      });
      setMessage({ type: 'ok', text: 'Configuración guardada correctamente.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al guardar.' });
    } finally {
      setSaving(false);
    }
  };

  const handleStart = async () => {
    setStarting(true);
    setMessage(null);
    try {
      await handleSave();
      const result = await triggerIaCentral();
      setMessage({ type: result.ok ? 'ok' : 'error', text: result.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al iniciar la central.' });
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Configuración de Filtros y Activación</h2>
        <p className="text-sm text-slate-500">Define los parámetros de prospección B2B y RRPP que los 7 agentes usarán.</p>
      </div>

      {message && (
        <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${message.type === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulario Comercial */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600"><Users className="h-4 w-4" /></div>
            <h3 className="font-bold text-slate-900">Filtros Comerciales (B2B)</h3>
          </div>

          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Países objetivo</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {PAISES_OPTIONS.map((p) => (
                <button key={p} onClick={() => toggle(paises, p, setPaises)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${paises.includes(p) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sectores</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {SECTORES_OPTIONS.map((s) => (
                <button key={s} onClick={() => toggle(sectores, s, setSectores)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${sectores.includes(s) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tamaño mínimo</label>
              <input type="number" value={tamanoMin} onChange={(e) => setTamanoMin(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tamaño máximo</label>
              <input type="number" value={tamanoMax} onChange={(e) => setTamanoMax(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
          </div>
        </div>

        {/* Formulario RRPP */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600"><Newspaper className="h-4 w-4" /></div>
            <h3 className="font-bold text-slate-900">Filtros RRPP y Medios</h3>
          </div>

          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo de medio</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TIPOS_MEDIO_OPTIONS.map((t) => (
                <button key={t} onClick={() => toggle(tiposMedio, t, setTiposMedio)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${tiposMedio.includes(t) ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Palabras clave de búsqueda</label>
            <div className="mt-2 flex gap-2">
              <input type="text" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                placeholder="ej: burnout, bienestar laboral..." className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
              <button onClick={addKeyword} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">Añadir</button>
            </div>
            {keywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {keywords.map((k) => (
                  <span key={k} className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                    {k}
                    <button onClick={() => setKeywords(keywords.filter((x) => x !== k))}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conexión Técnica */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600"><Cpu className="h-4 w-4" /></div>
          <h3 className="font-bold text-slate-900">Conexión Técnica</h3>
        </div>

        <div className="mt-5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">URL del Webhook de salida (Make.com)</label>
          <input type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hook.make.com/xxxx" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          <p className="mt-2 text-xs text-slate-400">Al pulsar el botón, se enviará un POST con todos los filtros activos a esta URL.</p>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
          <Globe className="h-3.5 w-3.5" />
          Endpoints de entrada seguros:
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">/functions/v1/ia-leads</code>
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">/functions/v1/ia-press</code>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Guardar filtros
          </button>
          <button onClick={handleStart} disabled={starting}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-60">
            {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />} Iniciar Central de Agentes IA
          </button>
          {config?.activo && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Central activa
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// =============== TAB 3: BANDEJA DE APROBACIÓN ===============
function InboxTab() {
  const [sub, setSub] = useState<'leads' | 'press'>('leads');
  const [leads, setLeads] = useState<IaLead[]>([]);
  const [press, setPress] = useState<IaPress[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ type: 'lead' | 'press'; id: string; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [l, p] = await Promise.all([fetchIaLeads(), fetchIaPress()]);
      setLeads(l);
      setPress(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApproveLead = async (id: string) => {
    setBusyId(id);
    try { await updateIaLeadEstado(id, 'aprobado'); await load(); } finally { setBusyId(null); }
  };
  const handleDiscardLead = async (id: string) => {
    setBusyId(id);
    try { await updateIaLeadEstado(id, 'descartado'); await load(); } finally { setBusyId(null); }
  };
  const handleSaveLeadEmail = async () => {
    if (!editing) return;
    setBusyId(editing.id);
    try { await updateIaLeadEmail(editing.id, editing.text); setEditing(null); await load(); } finally { setBusyId(null); }
  };

  const handleApprovePress = async (id: string) => {
    setBusyId(id);
    try { await updateIaPressEstado(id, 'aprobado'); await load(); } finally { setBusyId(null); }
  };
  const handleDiscardPress = async (id: string) => {
    setBusyId(id);
    try { await updateIaPressEstado(id, 'descartado'); await load(); } finally { setBusyId(null); }
  };
  const handleSavePressEmail = async () => {
    if (!editing) return;
    setBusyId(editing.id);
    try { await updateIaPressEmail(editing.id, editing.text); setEditing(null); await load(); } finally { setBusyId(null); }
  };

  const pendingLeads = leads.filter((l) => l.estado === 'pendiente');
  const pendingPress = press.filter((p) => p.estado === 'pendiente');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Bandeja de Aprobación Centralizada</h2>
          <p className="text-sm text-slate-500">Revisa, edita y aprueba el contenido generado por los agentes antes de enviarlo.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSub('leads')} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${sub === 'leads' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
            Leads Comerciales {pendingLeads.length > 0 && <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-xs text-white">{pendingLeads.length}</span>}
          </button>
          <button onClick={() => setSub('press')} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${sub === 'press' ? 'bg-cyan-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
            Notas de Prensa {pendingPress.length > 0 && <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-xs text-white">{pendingPress.length}</span>}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
      ) : sub === 'leads' ? (
        <InboxTable
          columns={['Empresa', 'País', 'Director RR.HH.', 'Email']}
          rows={leads.map((l) => ({
            id: l.id,
            estado: l.estado,
            cells: [l.empresa, l.pais || '—', l.director_rrhh_nombre || '—', l.director_rrhh_email || '—'],
            text: l.email_redactado || '',
          }))}
          onApprove={handleApproveLead}
          onEdit={(id, text) => setEditing({ type: 'lead', id, text })}
          onDiscard={handleDiscardLead}
          busyId={busyId}
        />
      ) : (
        <InboxTable
          columns={['Medio', 'Tipo', 'Periodista', 'Enfoque']}
          rows={press.map((p) => ({
            id: p.id,
            estado: p.estado,
            cells: [p.medio, p.tipo_medio || '—', p.periodista_nombre || '—', p.enfoque_articulo || '—'],
            text: p.email_propuesta || '',
          }))}
          onApprove={handleApprovePress}
          onEdit={(id, text) => setEditing({ type: 'press', id, text })}
          onDiscard={handleDiscardPress}
          busyId={busyId}
        />
      )}

      {editing && (
        <EditModal
          title={editing.type === 'lead' ? 'Editar correo del lead' : 'Editar nota de prensa'}
          text={editing.text}
          onChange={(text) => setEditing({ ...editing, text })}
          onSave={editing.type === 'lead' ? handleSaveLeadEmail : handleSavePressEmail}
          onClose={() => setEditing(null)}
          saving={busyId === editing.id}
        />
      )}
    </div>
  );
}

function InboxTable({ columns, rows, onApprove, onEdit, onDiscard, busyId }: {
  columns: string[];
  rows: { id: string; estado: string; cells: string[]; text: string }[];
  onApprove: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onDiscard: (id: string) => void;
  busyId: string | null;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
        <Inbox className="mx-auto h-10 w-10 text-slate-300" />
        <h3 className="mt-4 font-semibold text-slate-700">Bandeja vacía</h3>
        <p className="mt-1 text-sm text-slate-500">No hay registros pendientes de aprobación.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((c) => <th key={c} className="px-5 py-3 font-semibold">{c}</th>)}
              <th className="px-5 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id} className="transition hover:bg-slate-50">
                {r.cells.map((c, i) => <td key={i} className="px-5 py-4 text-slate-700">{c}</td>)}
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <span className={`mr-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADO_STYLES[r.estado] || 'bg-slate-100 text-slate-600'}`}>{r.estado}</span>
                    <button onClick={() => onApprove(r.id)} disabled={busyId === r.id} title="Aprobar y enviar"
                      className="rounded-lg bg-emerald-500 p-2 text-white transition hover:bg-emerald-600 disabled:opacity-50">
                      {busyId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                    <button onClick={() => onEdit(r.id, r.text)} title="Editar texto"
                      className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDiscard(r.id)} disabled={busyId === r.id} title="Descartar"
                      className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-200">
                      <Ban className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditModal({ title, text, onChange, onSave, onClose, saving }: {
  title: string; text: string; onChange: (t: string) => void; onSave: () => void; onClose: () => void; saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <textarea value={text} onChange={(e) => onChange(e.target.value)} rows={12}
          className="mt-4 w-full rounded-lg border border-slate-300 p-4 text-sm leading-relaxed text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button>
          <button onClick={onSave} disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

// =============== TAB 4: CONSOLA DE LOGS ===============
function LogsTab() {
  const [logs, setLogs] = useState<IaLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number | 'all'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchIaLogs(300);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.agente === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Consola de Logs</h2>
          <p className="text-sm text-slate-500">Actividad en tiempo real de los 7 agentes del sistema.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none">
            <option value="all">Todos los agentes</option>
            {AGENT_INFO.map((a) => (
              <option key={a.agente} value={a.agente}>Agente {a.agente}: {a.nombre}</option>
            ))}
          </select>
          <button onClick={load} className="rounded-lg border border-slate-300 p-2 text-slate-500 hover:bg-slate-100" title="Refrescar">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Agent status strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {AGENT_INFO.map((a) => {
          const lastLog = logs.find((l) => l.agente === a.agente);
          const active = lastLog ? Date.now() - new Date(lastLog.created_at).getTime() < 60000 : false;
          return (
            <div key={a.agente} className={`rounded-xl border p-3 ${active ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${active ? 'animate-pulse bg-emerald-500' : 'bg-slate-300'}`} />
                <span className="text-xs font-bold text-slate-700">Agente {a.agente}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-slate-600">{a.nombre}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">Célula {a.celula} · {a.rol}</p>
            </div>
          );
        })}
      </div>

      {/* Log terminal */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">
        <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-2.5">
          <Terminal className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-400">terminal — ia-central</span>
          <span className="ml-auto text-xs text-slate-500">{filtered.length} entradas</span>
        </div>
        <div className="h-96 overflow-y-auto p-4 font-mono text-xs leading-relaxed">
          {loading ? (
            <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-500">Sin actividad registrada.</div>
          ) : (
            <div className="space-y-1">
              {filtered.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-slate-600">{new Date(log.created_at).toLocaleTimeString('es-ES')}</span>
                  <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${NIVEL_STYLES[log.nivel]} bg-slate-800`}>A{log.agente}</span>
                  <span className={`flex-shrink-0 mt-1 h-1.5 w-1.5 rounded-full ${NIVEL_DOT[log.nivel]}`} />
                  <span className={NIVEL_STYLES[log.nivel]}>{log.mensaje}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
