import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email y contraseña son obligatorios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Hash the IP for privacy (don't store raw IPs)
    const ipRaw = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const ipHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ipRaw));
    const ipHashStr = Array.from(new Uint8Array(ipHash)).map(b => b.toString(16).padStart(2, "0")).join("");

    // Check brute-force: count recent failed attempts
    const fifteenMinutesAgo = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000).toISOString();
    const { data: recentFailures } = await adminClient
      .from("login_attempts")
      .select("id")
      .eq("email", cleanEmail)
      .eq("success", false)
      .gte("attempted_at", fifteenMinutesAgo);

    const failCount = recentFailures?.length || 0;

    if (failCount >= MAX_ATTEMPTS) {
      // Log this attempt too
      await adminClient.from("login_attempts").insert({
        email: cleanEmail,
        ip_hash: ipHashStr,
        success: false,
      });

      return new Response(
        JSON.stringify({
          error: `Demasiados intentos fallidos. El acceso está bloqueado durante ${LOCKOUT_MINUTES} minutos. Inténtalo más tarde.`,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Attempt login using the anon key (not service role) to respect RLS
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, anonKey);

    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError || !authData.user) {
      // Log failed attempt
      await adminClient.from("login_attempts").insert({
        email: cleanEmail,
        ip_hash: ipHashStr,
        success: false,
      });

      const remaining = MAX_ATTEMPTS - failCount - 1;
      const msg = remaining > 0
        ? `Correo o contraseña incorrectos. Te quedan ${remaining} intentos.`
        : `Correo o contraseña incorrectos. El acceso se bloqueará tras el siguiente intento fallido.`;

      return new Response(
        JSON.stringify({ error: msg }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Verify this user is linked to a company
    const { data: empresa } = await adminClient
      .from("empresas")
      .select("id, nombre, api_key, estado_suscripcion, nota_global, auth_user_id")
      .eq("auth_user_id", authData.user.id)
      .maybeSingle();

    if (!empresa) {
      // Log failed attempt — user exists but not linked to a company
      await adminClient.from("login_attempts").insert({
        email: cleanEmail,
        ip_hash: ipHashStr,
        success: false,
      });

      // Sign out the orphaned user
      await authClient.auth.signOut();

      return new Response(
        JSON.stringify({ error: "Esta cuenta no está vinculada a ninguna empresa." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Check subscription status
    if (empresa.estado_suscripcion === "cancelada") {
      await authClient.auth.signOut();
      return new Response(
        JSON.stringify({ error: "La suscripción de tu empresa está cancelada. Contacta con el administrador." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Log successful attempt
    await adminClient.from("login_attempts").insert({
      email: cleanEmail,
      ip_hash: ipHashStr,
      success: true,
    });

    // Return session + company info
    return new Response(
      JSON.stringify({
        success: true,
        session: authData.session,
        empresa: {
          id: empresa.id,
          nombre: empresa.nombre,
          api_key: empresa.api_key,
          estado_suscripcion: empresa.estado_suscripcion,
          nota_global: empresa.nota_global,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Error interno del servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
