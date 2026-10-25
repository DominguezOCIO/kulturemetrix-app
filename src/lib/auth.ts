const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface CompanySession {
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  empresa: {
    id: string;
    nombre: string;
    api_key: string;
    estado_suscripcion: string;
    nota_global: number;
  };
}

export interface LoginResult {
  success: boolean;
  data?: CompanySession;
  error?: string;
}

export async function companyLogin(email: string, password: string): Promise<LoginResult> {
  const functionUrl = `${SUPABASE_URL}/functions/v1/company-login`;

  try {
    const res = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || 'Error al iniciar sesión.' };
    }

    return {
      success: true,
      data: data as CompanySession,
    };
  } catch {
    return { success: false, error: 'No se pudo conectar con el servidor. Inténtalo de nuevo.' };
  }
}

export interface AuthSetupResult {
  success: boolean;
  error?: string;
}

export async function setupCompanyAuth(
  adminToken: string,
  empresaId: string,
  email: string,
  password: string,
): Promise<AuthSetupResult> {
  const functionUrl = `${SUPABASE_URL}/functions/v1/company-auth-setup`;

  try {
    const res = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ empresa_id: empresaId, email, password, action: 'create' }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || 'Error al crear las credenciales.' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'No se pudo conectar con el servidor.' };
  }
}

export async function deleteCompanyAuth(adminToken: string, empresaId: string): Promise<AuthSetupResult> {
  const functionUrl = `${SUPABASE_URL}/functions/v1/company-auth-setup`;

  try {
    const res = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ empresa_id: empresaId, email: '', password: '', action: 'delete' }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || 'Error al eliminar las credenciales.' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'No se pudo conectar con el servidor.' };
  }
}
