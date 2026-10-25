import { supabase } from './supabase';

export interface Departamento {
  id: string;
  nombre: string;
  captacion_activa: boolean;
}

export interface Trabajador {
  id: string;
  email: string;
  empresa_id: string;
  departamento_id: string;
  created_at: string;
}

export interface TrabajadorConToken extends Trabajador {
  departamento_nombre: string;
  codigo_acceso: string | null;
  token_usado: boolean | null;
  token_existe: boolean;
}

export async function fetchTrabajadoresDetalle(empresaId: string): Promise<TrabajadorConToken[]> {
  const [trabRes, deptRes, invRes] = await Promise.all([
    supabase
      .from('trabajadores')
      .select('id, email, empresa_id, departamento_id, created_at, codigo_acceso')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false }),
    supabase
      .from('departamentos')
      .select('id, nombre')
      .eq('empresa_id', empresaId),
    supabase
      .from('invitaciones')
      .select('email, has_completed')
      .eq('empresa_id', empresaId),
  ]);

  if (trabRes.error) throw trabRes.error;
  if (deptRes.error) throw deptRes.error;
  if (invRes.error) throw invRes.error;

  const deptMap: Record<string, string> = {};
  for (const d of deptRes.data || []) {
    deptMap[d.id] = d.nombre;
  }

  const invMap: Record<string, { has_completed: boolean }> = {};
  for (const inv of invRes.data || []) {
    if (inv.email) invMap[inv.email] = { has_completed: inv.has_completed };
  }

  return (trabRes.data || []).map((t) => {
    const invInfo = invMap[t.email];
    return {
      ...t,
      departamento_nombre: deptMap[t.departamento_id] || 'Sin departamento',
      codigo_acceso: (t as Trabajador & { codigo_acceso?: string | null }).codigo_acceso ?? null,
      token_existe: !!invInfo,
      token_usado: invInfo ? invInfo.has_completed : null,
    };
  });
}

export async function updateTrabajadorEmail(id: string, email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('El correo no es válido.');
  }
  const { error } = await supabase
    .from('trabajadores')
    .update({ email: cleanEmail })
    .eq('id', id);
  if (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      throw new Error('Este correo ya está registrado en esta empresa.');
    }
    throw error;
  }
}

export async function deleteTrabajador(id: string): Promise<void> {
  const { error } = await supabase
    .from('trabajadores')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function fetchDepartamentos(empresaId: string): Promise<Departamento[]> {
  const { data, error } = await supabase
    .from('departamentos')
    .select('id, nombre, captacion_activa')
    .eq('empresa_id', empresaId)
    .order('nombre', { ascending: true });
  if (error) throw error;
  return (data || []) as Departamento[];
}

export async function fetchDepartamentosActivos(empresaId: string): Promise<Departamento[]> {
  const { data, error } = await supabase
    .from('departamentos')
    .select('id, nombre, captacion_activa')
    .eq('empresa_id', empresaId)
    .eq('captacion_activa', true)
    .order('nombre', { ascending: true });
  if (error) throw error;
  return (data || []) as Departamento[];
}

export async function createDepartamento(empresaId: string, nombre: string): Promise<Departamento> {
  const { data, error } = await supabase
    .from('departamentos')
    .insert({ empresa_id: empresaId, nombre })
    .select('id, nombre, captacion_activa')
    .single();
  if (error) throw error;
  return data as Departamento;
}

export async function deleteDepartamento(id: string): Promise<void> {
  const { error } = await supabase.from('departamentos').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleDepartamentoCaptacion(id: string, activa: boolean): Promise<void> {
  const { error } = await supabase
    .from('departamentos')
    .update({ captacion_activa: activa })
    .eq('id', id);
  if (error) throw error;
}

export async function fetchTrabajadores(empresaId: string): Promise<Trabajador[]> {
  const { data, error } = await supabase
    .from('trabajadores')
    .select('id, email, empresa_id, departamento_id, created_at')
    .eq('empresa_id', empresaId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Trabajador[];
}

export async function fetchTrabajadoresAgrupados(empresaId: string): Promise<Record<string, { email: string; departamento_id: string }[]>> {
  const [trabajadores, departamentos] = await Promise.all([
    fetchTrabajadores(empresaId),
    fetchDepartamentos(empresaId),
  ]);

  const deptMap: Record<string, string> = {};
  for (const d of departamentos) {
    deptMap[d.id] = d.nombre;
  }

  const grouped: Record<string, { email: string; departamento_id: string }[]> = {};
  for (const t of trabajadores) {
    const deptName = deptMap[t.departamento_id] || 'Sin departamento';
    if (!grouped[deptName]) grouped[deptName] = [];
    grouped[deptName].push({ email: t.email, departamento_id: t.departamento_id });
  }
  return grouped;
}

function generateCodigoAcceso(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `KM-${segment(6)}`;
}

export interface DepartamentoParticipacion {
  nombre: string;
  total: number;
  completados: number;
  pendientes: number;
  participacion: number;
}

export interface TrabajadoresStats {
  total: number;
  completados: number;
  pendientes: number;
  participacion: number;
  porDepartamento: DepartamentoParticipacion[];
}

export async function getTrabajadoresStats(empresaId: string): Promise<TrabajadoresStats> {
  const [trabRes, deptRes, invRes] = await Promise.all([
    supabase.from('trabajadores').select('email, departamento_id').eq('empresa_id', empresaId),
    supabase.from('departamentos').select('id, nombre').eq('empresa_id', empresaId),
    supabase.from('invitaciones').select('email, has_completed').eq('empresa_id', empresaId),
  ]);

  const deptMap: Record<string, string> = {};
  for (const d of deptRes.data || []) deptMap[d.id] = d.nombre;

  const completedEmails = new Set<string>();
  for (const inv of invRes.data || []) {
    if (inv.has_completed && inv.email) completedEmails.add(inv.email.toLowerCase());
  }

  const trabajadores = trabRes.data || [];
  const total = trabajadores.length;
  const completados = trabajadores.filter((t) => completedEmails.has(t.email.toLowerCase())).length;
  const pendientes = total - completados;
  const participacion = total > 0 ? Math.round((completados / total) * 1000) / 10 : 0;

  const byDept: Record<string, { total: number; completados: number }> = {};
  for (const t of trabajadores) {
    const deptName = deptMap[t.departamento_id] || 'Sin departamento';
    if (!byDept[deptName]) byDept[deptName] = { total: 0, completados: 0 };
    byDept[deptName].total += 1;
    if (completedEmails.has(t.email.toLowerCase())) byDept[deptName].completados += 1;
  }

  const porDepartamento = Object.entries(byDept)
    .map(([nombre, d]) => ({
      nombre,
      total: d.total,
      completados: d.completados,
      pendientes: d.total - d.completados,
      participacion: d.total > 0 ? Math.round((d.completados / d.total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return { total, completados, pendientes, participacion, porDepartamento };
}

export async function getGlobalTrabajadoresStats(): Promise<{ total: number; completados: number; pendientes: number; participacion: number }> {
  const [trabRes, invRes] = await Promise.all([
    supabase.from('trabajadores').select('email'),
    supabase.from('invitaciones').select('email, has_completed'),
  ]);

  const completedEmails = new Set<string>();
  for (const inv of invRes.data || []) {
    if (inv.has_completed && inv.email) completedEmails.add(inv.email.toLowerCase());
  }

  const trabajadores = trabRes.data || [];
  const total = trabajadores.length;
  const completados = trabajadores.filter((t) => completedEmails.has(t.email.toLowerCase())).length;
  const pendientes = total - completados;
  const participacion = total > 0 ? Math.round((completados / total) * 1000) / 10 : 0;

  return { total, completados, pendientes, participacion };
}

export async function registerTrabajador(email: string, empresaId: string, departamentoId: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'El correo no es válido.' };
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    const codigo_acceso = generateCodigoAcceso();
    const { error } = await supabase
      .from('trabajadores')
      .insert({ email: cleanEmail, empresa_id: empresaId, departamento_id: departamentoId, codigo_acceso });
    if (!error) return { success: true };
    if (error.message.includes('trabajadores_codigo_acceso_unique') || error.message.includes('duplicate key')) {
      if (attempt === 2) {
        return { success: false, error: 'No se pudo generar un código único. Inténtalo de nuevo.' };
      }
      continue;
    }
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      return { success: false, error: 'Este correo ya está registrado en esta empresa.' };
    }
    return { success: false, error: 'Error al registrar el trabajador.' };
  }
  return { success: false, error: 'Error al registrar el trabajador.' };
}
