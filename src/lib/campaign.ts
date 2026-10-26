import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface CampaignResult {
  success: boolean;
  count?: number;
  sent?: number;
  failed?: number;
  email_sent?: boolean;
  from_email?: string;
  errors?: string[];
  tokens?: { email: string; token: string }[];
  message?: string;
  error?: string;
}

export async function launchCampaign(
  empresaId: string,
  empresaNombre: string,
  emails: string[],
): Promise<CampaignResult> {
  const appUrl = window.location.origin;
  const functionUrl = `${SUPABASE_URL}/functions/v1/send-campaign`;

  // Get the current session token for authorization
  const { data: sessionData } = await supabase.auth.getSession();
  const authToken = sessionData?.session?.access_token || SUPABASE_ANON_KEY;

  const res = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      empresa_id: empresaId,
      empresa_nombre: empresaNombre,
      emails,
      app_url: appUrl,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { success: false, error: body.error || `Error ${res.status}` };
  }

  const data = await res.json();
  return data as CampaignResult;
}

export interface TokenValidation {
  valid: boolean;
  used?: boolean;
  error?: string;
  empresa?: {
    id: string;
    nombre: string;
    api_key: string;
    estado_suscripcion: string;
    nota_global: number;
  };
  departamento?: string;
  departamento_id?: string;
}

export async function validateToken(token: string): Promise<TokenValidation> {
  const functionUrl = `${SUPABASE_URL}/functions/v1/validate-token`;

  try {
    const res = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      return { valid: false, error: 'Error de conexión al validar el token.' };
    }

    const data: unknown = await res.json();
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Respuesta no válida al validar el código.' };
    }

    return data as TokenValidation;
  } catch {
    return { valid: false, error: 'No se pudo conectar para validar el código. Inténtalo de nuevo.' };
  }
}

export async function getCampaignStats(empresaId: string): Promise<{ total: number; used: number; pending: number }> {
  const { data, error } = await supabase
    .from('invitaciones')
    .select('has_completed')
    .eq('empresa_id', empresaId);

  if (error) throw error;
  if (!data) return { total: 0, used: 0, pending: 0 };

  const total = data.length;
  const used = data.filter((t) => t.has_completed).length;
  return { total, used, pending: total - used };
}
