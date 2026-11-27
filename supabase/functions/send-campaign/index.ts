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
    const { empresa_id, empresa_nombre, app_url, only_emails } = await req.json();

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
        JSON.stringify({ error: "No autorizado para lanzar campañas en esta empresa." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: configData } = await adminClient
      .from("site_config")
      .select("resend_api_key, from_email, from_name")
      .eq("id", 1)
      .maybeSingle();

    const resendApiKey = configData?.resend_api_key || null;
    const fromEmail = configData?.from_email || "noreply@kulturemetrix.com";
    const fromName = configData?.from_name || "Kulturemetrix";

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          error: "No hay API Key de Resend configurada. Configúrala en el Panel de Administración > Configuración de Notificaciones.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let query = adminClient
      .from("trabajadores")
      .select("email, departamento_id, departamentos!inner(nombre)")
      .eq("empresa_id", empresa_id);

    const onlyEmailsLower = only_emails && Array.isArray(only_emails) && only_emails.length > 0
      ? only_emails.map((e: string) => e.trim().toLowerCase())
      : null;

    if (onlyEmailsLower) {
      query = query.in("email", onlyEmailsLower);
    }

    const { data: trabajadores, error: fetchError } = await query;

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

    const tokens: { email: string; token: string; departamento: string }[] = [];
    const rowsToInsert: { empresa_id: string; departamento_id: string; email: string; access_code: string }[] = [];

    for (const t of trabajadores) {
      const cleanEmail = String(t.email).trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) continue;
      const deptName = Array.isArray(t.departamentos) ? t.departamentos[0]?.nombre : t.departamentos?.nombre;

      const { data: existingInv } = await adminClient
        .from("invitaciones")
        .select("access_code, has_completed")
        .eq("empresa_id", empresa_id)
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existingInv) {
        if (existingInv.has_completed) continue;
        tokens.push({ email: cleanEmail, token: existingInv.access_code, departamento: deptName || "Sin departamento" });
      } else {
        const accessCode = generateAccessCode();
        tokens.push({ email: cleanEmail, token: accessCode, departamento: deptName || "Sin departamento" });
        rowsToInsert.push({ empresa_id, departamento_id: t.departamento_id, email: cleanEmail, access_code: accessCode });
      }
    }

    if (rowsToInsert.length > 0) {
      const { error: insertError } = await adminClient
        .from("invitaciones")
        .insert(rowsToInsert);

      if (insertError) {
        return new Response(
          JSON.stringify({ error: "Error al generar invitaciones." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    if (tokens.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          count: 0,
          sent: 0,
          failed: 0,
          email_sent: false,
          message: "Todos los trabajadores ya han completado la encuesta.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const buildEmailHtml = (surveyUrl: string) => `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px;">
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #205072, #43B59C); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 20px; font-weight: 800; color: white;">K</span>
          </div>
          <div>
            <h1 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0;">KULTUREMETRIX</h1>
            <p style="font-size: 12px; color: #64748b; margin: 0;">Auditoría de Bienestar Corporativo</p>
          </div>
        </div>

        <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">
          Has sido invitado a participar en la encuesta de bienestar laboral
        </h2>

        <p style="font-size: 15px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
          <strong>${empresa_nombre}</strong> ha lanzado una campaña de medición del bienestar laboral y te invitamos a participar.
          Tus respuestas son <strong>100% anónimas</strong>. No existe ninguna relación entre tu correo electrónico y las respuestas que envíes.
        </p>

        <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 24px;">
          La encuesta te tomará aproximadamente 5-10 minutos. Tu participación es fundamental para mejorar el entorno de trabajo.
        </p>

        <a href="${surveyUrl}"
           style="display: inline-block; background: linear-gradient(to right, #205072, #43B59C); color: #ffffff; font-weight: 600; font-size: 16px; padding: 16px 32px; border-radius: 12px; text-decoration: none; margin-bottom: 24px;">
          Comenzar encuesta
        </a>

        <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
          Este enlace es de un solo uso. Una vez que completes la encuesta, el enlace quedará invalidado.<br/>
          Si no puedes ver el botón, copia y pega este enlace en tu navegador:<br/>
          <a href="${surveyUrl}" style="color: #43B59C; word-break: break-all;">${surveyUrl}</a>
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">
          KULTUREMETRIX — Privacidad desde el diseño (RGPD).
        </p>
      </div>
    `;

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const { email, token } of tokens) {
      const surveyUrl = `${app_url}/#/encuesta?token=${token}&empresa=${empresa_id}`;
      const emailHtml = buildEmailHtml(surveyUrl);

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `${fromName} <${fromEmail}>`,
            to: [email],
            subject: `${empresa_nombre} te invita a la encuesta de bienestar laboral`,
            html: emailHtml,
          }),
        });

        if (res.ok) {
          sentCount++;
        } else {
          const errText = await res.text();
          console.error(`Resend API error for ${email} (${res.status}):`, errText);
          errors.push(`${email}: ${res.status} - ${errText}`);
          failedCount++;
        }
      } catch (err) {
        console.error(`Fetch error sending to ${email}:`, err);
        failedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: tokens.length,
        sent: sentCount,
        failed: failedCount,
        email_sent: sentCount > 0,
        from_email: fromEmail,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Error en send-campaign:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
