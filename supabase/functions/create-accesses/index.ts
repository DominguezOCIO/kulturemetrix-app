import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function generateAccessCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const segments: string[] = [];
  for (let s = 0; s < 4; s++) {
    let seg = "";
    for (let i = 0; i < 8; i++) {
      seg += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(seg);
  }
  return segments.join("-");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { empresa_id } = await req.json();

    if (!empresa_id) {
      return new Response(
        JSON.stringify({ error: "Falta el parámetro: empresa_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const callerClient = createClient(supabaseUrl, anonKey);

    let isAuthorized = false;

    const { data: userData } = await callerClient.auth.getUser(token);

    if (userData.user) {
      const { data: empresa } = await adminClient
        .from("empresas")
        .select("auth_user_id")
        .eq("id", empresa_id)
        .maybeSingle();

      if (empresa?.auth_user_id === userData.user.id) {
        isAuthorized = true;
      }
    }

    const ADMIN_EMAILS = ["admin@kulturemetrix.com"];
    if (userData.user?.email && ADMIN_EMAILS.includes(userData.user.email.toLowerCase())) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      const { data: empresa } = await adminClient
        .from("empresas")
        .select("auth_user_id")
        .eq("id", empresa_id)
        .maybeSingle();

      if (empresa && !empresa.auth_user_id) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: "No autorizado para crear accesos en esta empresa." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch all registered workers for this empresa
    const { data: trabajadores, error: fetchError } = await adminClient
      .from("trabajadores")
      .select("email, departamento_id")
      .eq("empresa_id", empresa_id);

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: "Error al obtener trabajadores." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!trabajadores || trabajadores.length === 0) {
      return new Response(
        JSON.stringify({ error: "No hay trabajadores registrados para esta empresa." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch existing invitaciones for this empresa to avoid duplicates
    const { data: existingInv } = await adminClient
      .from("invitaciones")
      .select("email")
      .eq("empresa_id", empresa_id);

    const existingEmails = new Set((existingInv || []).map((i) => String(i.email).toLowerCase()));

    const rowsToInsert: { empresa_id: string; departamento_id: string; email: string; access_code: string }[] = [];
    const created: { email: string; access_code: string; departamento_id: string }[] = [];

    for (const t of trabajadores) {
      const cleanEmail = String(t.email).trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) continue;
      if (existingEmails.has(cleanEmail)) continue;
      const accessCode = generateAccessCode();
      rowsToInsert.push({ empresa_id, departamento_id: t.departamento_id, email: cleanEmail, access_code: accessCode });
      created.push({ email: cleanEmail, access_code: accessCode, departamento_id: t.departamento_id });
    }

    if (rowsToInsert.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          created: 0,
          skipped: trabajadores.length,
          message: "Todos los trabajadores ya tienen un código de acceso.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { error: insertError } = await adminClient
      .from("invitaciones")
      .insert(rowsToInsert);

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Error al generar los códigos de acceso." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        created: created.length,
        skipped: trabajadores.length - created.length,
        accesses: created,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Error en create-accesses:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
