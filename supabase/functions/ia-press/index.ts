import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, x-api-key",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // --- Auth: verify x-api-key header against PROCESS_IA_SECRET_KEY ---
    const apiKey = req.headers.get("x-api-key");
    const expectedKey = Deno.env.get("PROCESS_IA_SECRET_KEY");

    if (!expectedKey) {
      return new Response(JSON.stringify({ error: "Servidor no configurado: falta PROCESS_IA_SECRET_KEY." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!apiKey || apiKey !== expectedKey) {
      return new Response(JSON.stringify({ error: "Unauthorized: API key inválida." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    const pressItems = Array.isArray(body) ? body : body.press ? body.press : [body];

    if (pressItems.length === 0) {
      return new Response(JSON.stringify({ error: "No se recibieron notas de prensa." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const rows = pressItems.map((p: any) => ({
      medio: p.medio || null,
      tipo_medio: p.tipo_medio || null,
      periodista_nombre: p.periodista_nombre || null,
      periodista_email: p.periodista_email || null,
      enfoque_articulo: p.enfoque_articulo || null,
      email_propuesta: p.email_propuesta || p.email || null,
      estado: p.estado || "pendiente",
      agente_origen: p.agente_origen || "Agente 4-5",
      abierto: p.abierto || false,
      clicado: p.clicado || false,
      mencion_conseguida: p.mencion_conseguida || false,
    }));

    const { data, error } = await admin
      .from("ia_press")
      .insert(rows)
      .select("id, medio, estado");

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("ia_logs").insert({
      agente: 5,
      celula: 2,
      mensaje: `${rows.length} nota(s) de prensa recibida(s) desde Make.com y guardadas en bandeja.`,
      nivel: "ok",
    });

    return new Response(JSON.stringify({ inserted: data.length, press: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
