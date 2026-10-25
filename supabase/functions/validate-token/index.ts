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
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ valid: false, error: "Código no proporcionado." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Look up the access_code in invitaciones — do NOT mark as used here.
    // The submit_survey_anonymous function handles the atomic claim during submission.
    const { data: invitacion, error: queryError } = await supabase
      .from("invitaciones")
      .select(`
        id,
        empresa_id,
        departamento_id,
        has_completed,
        empresas!inner(id, nombre, api_key, estado_suscripcion, nota_global),
        departamentos!left(id, nombre)
      `)
      .eq("access_code", token)
      .maybeSingle();

    if (queryError || !invitacion) {
      return new Response(
        JSON.stringify({ valid: false, error: "Código no válido." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (invitacion.has_completed) {
      return new Response(
        JSON.stringify({ valid: false, used: true, error: "Este enlace ya ha sido utilizado. Cada encuesta solo puede completarse una vez." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const empresa = Array.isArray(invitacion.empresas) ? invitacion.empresas[0] : invitacion.empresas;
    const departamento = Array.isArray(invitacion.departamentos) ? invitacion.departamentos[0] : invitacion.departamentos;

    return new Response(
      JSON.stringify({
        valid: true,
        empresa: {
          id: empresa.id,
          nombre: empresa.nombre,
          api_key: empresa.api_key,
          estado_suscripcion: empresa.estado_suscripcion,
          nota_global: empresa.nota_global,
        },
        departamento: departamento?.nombre || null,
        departamento_id: invitacion.departamento_id || null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Error al validar el código." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
