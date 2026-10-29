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

    // Support either a single lead object or an array of leads
    const leads = Array.isArray(body) ? body : body.leads ? body.leads : [body];

    if (leads.length === 0) {
      return new Response(JSON.stringify({ error: "No se recibieron leads." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const rows = leads.map((l: any) => ({
      empresa: l.empresa || null,
      pais: l.pais || null,
      sector: l.sector || null,
      tamano: l.tamano || null,
      director_rrhh_nombre: l.director_rrhh_nombre || l.contacto_nombre || null,
      director_rrhh_email: l.director_rrhh_email || l.contacto_email || null,
      email_redactado: l.email_redactado || l.email || null,
      estado: l.estado || "pendiente",
      agente_origen: l.agente_origen || "Agente 1-3",
      abierto: l.abierto || false,
      clicado: l.clicado || false,
      respondido: l.respondido || false,
      reunion_agendada: l.reunion_agendada || false,
    }));

    const { data, error } = await admin
      .from("ia_leads")
      .insert(rows)
      .select("id, empresa, estado");

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("ia_logs").insert({
      agente: 3,
      celula: 1,
      mensaje: `${rows.length} lead(s) comercial(es) recibido(s) desde Make.com y guardados en bandeja.`,
      nivel: "ok",
    });

    return new Response(JSON.stringify({ inserted: data.length, leads: data }), {
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
