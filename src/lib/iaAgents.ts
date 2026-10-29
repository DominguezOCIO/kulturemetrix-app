import { supabase } from './supabase';

export interface IaLead {
  id: string;
  empresa: string;
  pais: string | null;
  sector: string | null;
  tamano: number | null;
  director_rrhh_nombre: string | null;
  director_rrhh_email: string | null;
  email_redactado: string | null;
  estado: string;
  agente_origen: string | null;
  abierto: boolean;
  clicado: boolean;
  respondido: boolean;
  reunion_agendada: boolean;
  created_at: string;
  updated_at: string;
}

export interface IaPress {
  id: string;
  medio: string;
  tipo_medio: string | null;
  periodista_nombre: string | null;
  periodista_email: string | null;
  enfoque_articulo: string | null;
  email_propuesta: string | null;
  estado: string;
  agente_origen: string | null;
  abierto: boolean;
  clicado: boolean;
  mencion_conseguida: boolean;
  created_at: string;
  updated_at: string;
}

export interface IaMetricaDiaria {
  id: string;
  fecha: string;
  tipo: 'b2b' | 'rrpp';
  enviados: number;
  aperturas: number;
  clics: number;
  respuestas: number;
  reuniones: number;
  menciones: number;
}

export interface IaConfig {
  id: string;
  paises: string[];
  sectores: string[];
  tamano_min: number;
  tamano_max: number;
  tipos_medio: string[];
  keywords_rrpp: string[];
  webhook_url: string;
  activo: boolean;
  ultima_activacion: string | null;
  limite_diario_empresas: number;
  limite_diario_medios: number;
}

export interface IaLog {
  id: string;
  agente: number;
  celula: number;
  mensaje: string;
  nivel: 'info' | 'ok' | 'warn' | 'error';
  created_at: string;
}

export const IA_ESTADOS = ['pendiente', 'aprobado', 'enviado', 'respondido', 'descartado'] as const;

export const PAISES_OPTIONS = [
  'España', 'México', 'Colombia', 'Chile', 'Perú', 'Argentina', 'Uruguay', 'Ecuador', 'Costa Rica', 'Panamá',
];

export const SECTORES_OPTIONS = [
  'Tecnología', 'Finanzas', 'Sanidad', 'Educación', 'Industria', 'Retail', 'Consultoría', 'Energía', ' Telecomunicaciones', 'Logística',
];

export const TIPOS_MEDIO_OPTIONS = [
  'Prensa Digital', 'Blogs RR.HH.', 'Newsletters Substack/LinkedIn', 'Revistas Empresariales', 'Podcasts',
];

const CONFIG_COLUMNS = 'id, paises, sectores, tamano_min, tamano_max, tipos_medio, keywords_rrpp, webhook_url, activo, ultima_activacion, limite_diario_empresas, limite_diario_medios';

function parseError(err: any): string {
  if (!err) return 'Error desconocido.';
  return err.message || String(err);
}

export async function fetchIaConfig(): Promise<IaConfig | null> {
  const { data, error } = await supabase
    .from('ia_config')
    .select(CONFIG_COLUMNS)
    .maybeSingle();
  if (error) throw new Error(parseError(error));
  return data as IaConfig | null;
}

export async function updateIaConfig(patch: Partial<IaConfig>): Promise<void> {
  const { data: existing } = await supabase.from('ia_config').select('id').maybeSingle();
  if (!existing) {
    const { error } = await supabase.from('ia_config').insert({ ...patch });
    if (error) throw new Error(parseError(error));
    return;
  }
  const { error } = await supabase.from('ia_config').update(patch).eq('id', existing.id);
  if (error) throw new Error(parseError(error));
}

export async function fetchIaLeads(): Promise<IaLead[]> {
  const { data, error } = await supabase
    .from('ia_leads')
    .select('id, empresa, pais, sector, tamano, director_rrhh_nombre, director_rrhh_email, email_redactado, estado, agente_origen, abierto, clicado, respondido, reunion_agendada, created_at, updated_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(parseError(error));
  return (data || []) as IaLead[];
}

export async function fetchIaPress(): Promise<IaPress[]> {
  const { data, error } = await supabase
    .from('ia_press')
    .select('id, medio, tipo_medio, periodista_nombre, periodista_email, enfoque_articulo, email_propuesta, estado, agente_origen, abierto, clicado, mencion_conseguida, created_at, updated_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(parseError(error));
  return (data || []) as IaPress[];
}

export async function updateIaLeadEstado(id: string, estado: string): Promise<void> {
  const { error } = await supabase.from('ia_leads').update({ estado }).eq('id', id);
  if (error) throw new Error(parseError(error));
}

export async function updateIaLeadEmail(id: string, emailRedactado: string): Promise<void> {
  const { error } = await supabase.from('ia_leads').update({ email_redactado: emailRedactado }).eq('id', id);
  if (error) throw new Error(parseError(error));
}

export async function deleteIaLead(id: string): Promise<void> {
  const { error } = await supabase.from('ia_leads').delete().eq('id', id);
  if (error) throw new Error(parseError(error));
}

export async function updateIaPressEstado(id: string, estado: string): Promise<void> {
  const { error } = await supabase.from('ia_press').update({ estado }).eq('id', id);
  if (error) throw new Error(parseError(error));
}

export async function updateIaPressEmail(id: string, emailPropuesta: string): Promise<void> {
  const { error } = await supabase.from('ia_press').update({ email_propuesta: emailPropuesta }).eq('id', id);
  if (error) throw new Error(parseError(error));
}

export async function deleteIaPress(id: string): Promise<void> {
  const { error } = await supabase.from('ia_press').delete().eq('id', id);
  if (error) throw new Error(parseError(error));
}

export async function fetchIaMetricas(): Promise<IaMetricaDiaria[]> {
  const { data, error } = await supabase
    .from('ia_metricas_diarias')
    .select('id, fecha, tipo, enviados, aperturas, clics, respuestas, reuniones, menciones')
    .order('fecha', { ascending: true });
  if (error) throw new Error(parseError(error));
  return (data || []) as IaMetricaDiaria[];
}

export async function fetchIaLogs(limit = 200): Promise<IaLog[]> {
  const { data, error } = await supabase
    .from('ia_logs')
    .select('id, agente, celula, mensaje, nivel, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(parseError(error));
  return (data || []) as IaLog[];
}

export async function triggerIaCentral(): Promise<{ ok: boolean; message: string }> {
  const config = await fetchIaConfig();
  if (!config) return { ok: false, message: 'No hay configuración guardada.' };
  if (!config.webhook_url) return { ok: false, message: 'Falta la URL del Webhook de salida.' };

  const payload = {
    event: 'kulturemetrix.ia.start',
    timestamp: new Date().toISOString(),
    filtros: {
      paises: config.paises,
      sectores: config.sectores,
      tamano_min: config.tamano_min,
      tamano_max: config.tamano_max,
      tipos_medio: config.tipos_medio,
      keywords_rrpp: config.keywords_rrpp,
      limite_diario_empresas: config.limite_diario_empresas,
      limite_diario_medios: config.limite_diario_medios,
    },
    agentes: [1, 2, 3, 4, 5, 6, 7],
  };

  const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ia-webhook`;
  const res = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, message: `Error ${res.status}: ${body}` };
  }
  const json = await res.json();
  return { ok: true, message: json.message || 'Central de Agentes IA iniciada.' };
}

export const AGENT_INFO: { agente: number; celula: number; nombre: string; rol: string }[] = [
  { agente: 1, celula: 1, nombre: 'Investigador / Scraper', rol: 'B2B' },
  { agente: 2, celula: 1, nombre: 'Enriquecedor de Contexto', rol: 'B2B' },
  { agente: 3, celula: 1, nombre: 'Redactor Localizado', rol: 'B2B' },
  { agente: 4, celula: 2, nombre: 'Rastreador de Periodistas', rol: 'RRPP' },
  { agente: 5, celula: 2, nombre: 'Copywriter de Notas', rol: 'RRPP' },
  { agente: 6, celula: 3, nombre: 'Creador de Posts LinkedIn', rol: 'Social' },
  { agente: 7, celula: 3, nombre: 'Guionista de Vídeo', rol: 'Social' },
];
