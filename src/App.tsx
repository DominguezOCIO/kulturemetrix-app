import { useState, useEffect, useLayoutEffect } from 'react';
import { Landing } from '@/components/Landing';
import { PortalSelection } from '@/components/PortalSelection';
import { Survey, SurveyTokenEntry } from '@/components/Survey';
import { Dashboard } from '@/components/Dashboard';
import { AdminPanel } from '@/components/AdminPanel';
import { QuestionnairePreview } from '@/components/QuestionnairePreview';
import { supabase } from '@/lib/supabase';
import { companyLogin } from '@/lib/auth';
import type { Empresa } from '@/lib/scoring';

type View = 'landing' | 'portal' | 'questionnaire' | 'dashboard' | 'token-survey' | 'admin';

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [tokenEmpresa, setTokenEmpresa] = useState<Empresa | null>(null);
  const [tokenDepartamento, setTokenDepartamento] = useState<string | undefined>(undefined);
  const [authReady, setAuthReady] = useState(false);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Fetch the empresa linked to this user
        const { data: empData } = await supabase
          .from('empresas')
          .select('id, nombre, api_key, estado_suscripcion, nota_global')
          .maybeSingle();
        if (empData) {
          setEmpresa(empData as Empresa);
          setView('portal');
        }
      }
      setAuthReady(true);
    })();
  }, []);

  // Only check hash ONCE on mount — for external links (campaign emails, admin URL).
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('encuesta') && hash.includes('token=')) {
      const params = new URLSearchParams(hash.split('?')[1]);
      const t = params.get('token');
      if (t) {
        setToken(t);
        setView('token-survey');
      }
    } else if (hash.includes('admin')) {
      setView('admin');
    }
    if (hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [view, tokenEmpresa]);

  const handleEnter = async (email: string, password: string): Promise<boolean> => {
    setError('');
    try {
      const result = await companyLogin(email, password);
      if (!result.success || !result.data) {
        setError(result.error || 'Error al iniciar sesión.');
        return false;
      }

      // Set the session in the supabase client so RLS-scoped queries work
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: result.data.session.access_token,
        refresh_token: result.data.session.refresh_token,
      });

      if (sessionError) {
        setError('Error al establecer la sesión.');
        return false;
      }

      setEmpresa(result.data.empresa);
      setView('portal');
      return true;
    } catch (err) {
      setError('Error al iniciar sesión. Inténtalo de nuevo.');
      console.error(err);
      return false;
    }
  };

  const handleWorkerToken = async (tokenValue: string): Promise<boolean> => {
    setError('');
    setToken(tokenValue);
    setTokenEmpresa(null);
    setTokenDepartamento(undefined);
    setView('token-survey');
    return true;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setView('landing');
    setEmpresa(null);
    setError('');
    setToken(null);
    setTokenEmpresa(null);
    setTokenDepartamento(undefined);
  };

  const goToAdmin = (e: React.MouseEvent) => {
    e.preventDefault();
    setView('admin');
  };

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-orange-500" />
      </div>
    );
  }

  if (view === 'admin') {
    return <AdminPanel onBack={handleSignOut} />;
  }

  if (view === 'token-survey' && token) {
    if (tokenEmpresa) {
      return <Survey empresa={tokenEmpresa} token={token} onComplete={handleSignOut} onBack={handleSignOut} departamentoPreselected={tokenDepartamento} />;
    }
    return (
      <SurveyTokenEntry
        token={token}
        onValid={(emp, dept) => { setTokenEmpresa(emp); setTokenDepartamento(dept); }}
        onBack={handleSignOut}
      />
    );
  }

  if (view === 'landing') {
    return <Landing onEnter={handleEnter} onWorkerToken={handleWorkerToken} onAdminClick={goToAdmin} externalError={error} />;
  }

  if (!empresa) {
    return <Landing onEnter={handleEnter} onWorkerToken={handleWorkerToken} onAdminClick={goToAdmin} externalError={error} />;
  }

  if (view === 'portal') {
    return (
      <PortalSelection
        empresa={empresa}
        onSelectQuestionnaire={() => setView('questionnaire')}
        onSelectDashboard={() => setView('dashboard')}
        onBack={handleSignOut}
      />
    );
  }

  if (view === 'questionnaire') {
    return <QuestionnairePreview empresa={empresa} onBack={() => setView('portal')} />;
  }

  if (view === 'dashboard') {
    return <Dashboard empresa={empresa} onBack={() => setView('portal')} />;
  }

  return <Landing onEnter={handleEnter} onWorkerToken={handleWorkerToken} onAdminClick={goToAdmin} />;
}
