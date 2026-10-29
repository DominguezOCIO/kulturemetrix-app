import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const webhookUrl = (body.webhook_url as string | undefined)?.trim();

    if (!webhookUrl) {
      return new Response(JSON.stringify({ error: "Falta la URL del webhook de salida en el cuerpo." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Mark config as active and log the activation
    const { data: configRows } = await admin
      .from("ia_config")
      .select("id")
      .maybeSingle();

    if (configRows?.id) {
      await admin
        .from("ia_config")
        .update({ activo: true, ultima_activacion: new Date().toISOString() })
        .eq("id", configRows.id);
    }

    const logPromises = [
      { agente: 1, celula: 1, mensaje: "Central de Agentes IA iniciada. Extrayendo directores de RR.HH. según filtros activos...", nivel: "info" },
      { agente: 4, celula: 2, mensaje: "Rastreando periodistas y newsletters según keywords...", nivel: "info" },
      { agente: 6, celula: 3, mensaje: "Preparando cola de contenido para LinkedIn y vídeo...", nivel: "info" },
    ].map((l) => admin.from("ia_logs").insert(l));

    await Promise.all(logPromises);

    // Forward the full payload to the external Make.com webhook
    const externalRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!externalRes.ok) {
      const errText = await externalRes.text();
      await admin.from("ia_logs").insert({
        agente: 1,
        celula: 1,
        mensaje: `Error al contactar Make.com (${externalRes.status}): ${errText.slice(0, 200)}`,
        nivel: "error",
      });
      return new Response(JSON.stringify({ error: `Webhook externo falló: ${externalRes.status}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("ia_logs").insert({
      agente: 1,
      celula: 1,
      mensaje: "Evento enviado a Make.com correctamente. Procesamiento de 24h en marcha.",
      nivel: "ok",
    });

    return new Response(JSON.stringify({ message: "Central de Agentes IA iniciada. Evento enviado a Make.com." }), {
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
