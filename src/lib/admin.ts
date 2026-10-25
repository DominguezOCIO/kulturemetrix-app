import { supabase } from './supabase';

export interface AdminEmpresa {
  id: string;
  nombre: string;
  api_key: string;
  estado_suscripcion: string;
  nota_global: number;
  plan_suscripcion: string;
  precio_mensual: number;
  fecha_alta: string | null;
  fecha_renovacion: string | null;
  contacto_email: string | null;
  contacto_nombre: string | null;
  captacion_activa: boolean;
  auth_user_id: string | null;
  created_at: string;
}

export interface AdminEmpresaInput {
  nombre: string;
  api_key: string;
  estado_suscripcion: string;
  plan_suscripcion: string;
  precio_mensual: number;
  fecha_alta: string | null;
  fecha_renovacion: string | null;
  contacto_email: string | null;
  contacto_nombre: string | null;
}

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segment = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `WBIX-${segment(4)}-${segment(4)}`;
}

function parseSupabaseError(err: any): string {
  if (!err) return 'Error desconocido.';
  const msg = err.message || String(err);
  if (msg.includes('Load failed') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.';
  }
  if (msg.includes('duplicate key') && msg.includes('api_key')) {
    return 'La API Key introducida ya existe. Usa otra o déjala vacía para generarla automáticamente.';
  }
  return msg;
}

export async function fetchAllEmpresas(): Promise<AdminEmpresa[]> {
  const { data, error } = await supabase
    .from('empresas')
    .select('id, nombre, api_key, estado_suscripcion, nota_global, plan_suscripcion, precio_mensual, fecha_alta, fecha_renovacion, contacto_email, contacto_nombre, captacion_activa, auth_user_id, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(parseSupabaseError(error));
  return (data || []) as AdminEmpresa[];
}

export async function createEmpresa(input: AdminEmpresaInput): Promise<AdminEmpresa> {
  const apiKey = input.api_key.trim() || generateApiKey();
  const { data, error } = await supabase
    .from('empresas')
    .insert({
      nombre: input.nombre,
      api_key: apiKey,
      estado_suscripcion: input.estado_suscripcion,
      plan_suscripcion: input.plan_suscripcion,
      precio_mensual: input.precio_mensual,
      fecha_alta: input.fecha_alta || null,
      fecha_renovacion: input.fecha_renovacion || null,
      contacto_email: input.contacto_email || null,
      contacto_nombre: input.contacto_nombre || null,
    })
    .select('id, nombre, api_key, estado_suscripcion, nota_global, plan_suscripcion, precio_mensual, fecha_alta, fecha_renovacion, contacto_email, contacto_nombre, captacion_activa, auth_user_id, created_at')
    .single();
  if (error) {
    throw new Error(parseSupabaseError(error));
  }
  return data as AdminEmpresa;
}

export async function updateEmpresa(id: string, input: Partial<AdminEmpresaInput>): Promise<void> {
  const { error } = await supabase
    .from('empresas')
    .update(input)
    .eq('id', id);
  if (error) throw new Error(parseSupabaseError(error));
}

export async function toggleCaptacion(id: string, activa: boolean): Promise<void> {
  const { error } = await supabase
    .from('empresas')
    .update({ captacion_activa: activa })
    .eq('id', id);
  if (error) throw new Error(parseSupabaseError(error));
}

export async function deleteEmpresa(id: string): Promise<void> {
  const { error } = await supabase
    .from('empresas')
    .delete()
    .eq('id', id);
  if (error) throw new Error(parseSupabaseError(error));
}

export async function fetchEmpresaStats(empresaId: string): Promise<{ encuestas: number; tokens: number; tokensUsados: number }> {
  const [respRes, tokenRes] = await Promise.all([
    supabase
      .from('respuestas_agregadas')
      .select('contador_respuestas')
      .eq('empresa_id', empresaId),
    supabase
      .from('invitaciones')
      .select('has_completed')
      .eq('empresa_id', empresaId),
  ]);

  if (respRes.error) throw respRes.error;
  if (tokenRes.error) throw tokenRes.error;

  const encuestas = (respRes.data || []).reduce((acc, r) => acc + r.contador_respuestas, 0) / 4;
  const tokens = tokenRes.data?.length || 0;
  const tokensUsados = tokenRes.data?.filter((t) => t.has_completed).length || 0;

  return {
    encuestas: Math.round(encuestas),
    tokens,
    tokensUsados,
  };
}

export interface SolicitudAuditoria {
  id: string;
  empresa: string;
  num_trabajadores: number;
  pais: string;
  persona_contacto: string;
  cargo: string;
  telefono: string;
  email: string;
  estado: string;
  created_at: string;
}

export async function fetchSolicitudesAuditoria(): Promise<SolicitudAuditoria[]> {
  const { data, error } = await supabase
    .from('solicitudes_auditoria')
    .select('id, empresa, num_trabajadores, pais, persona_contacto, cargo, telefono, email, estado, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(parseSupabaseError(error));
  return (data || []) as SolicitudAuditoria[];
}

export async function deleteSolicitudAuditoria(id: string): Promise<void> {
  const { error } = await supabase.from('solicitudes_auditoria').delete().eq('id', id);
  if (error) throw new Error(parseSupabaseError(error));
}

export async function updateSolicitudEstado(id: string, estado: string): Promise<void> {
  const { error } = await supabase.from('solicitudes_auditoria').update({ estado }).eq('id', id);
  if (error) throw new Error(parseSupabaseError(error));
}
