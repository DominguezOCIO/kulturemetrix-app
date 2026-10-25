import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AuditRequest {
  empresa: string;
  num_trabajadores: number;
  pais: string;
  persona_contacto: string;
  cargo: string;
  telefono: string;
  email: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: AuditRequest = await req.json();

    if (!body.empresa || !body.persona_contacto || !body.email) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch all email config from site_config (service_role bypasses RLS)
    const { data: configData, error: configError } = await supabase
      .from("site_config")
      .select("notif_email_destino, resend_api_key, from_email, from_name")
      .eq("id", 1)
      .maybeSingle();

    if (configError || !configData) {
      console.error("site_config query error:", configError);
      return new Response(
        JSON.stringify({ error: "No hay configuración de notificaciones." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const destEmail = configData.notif_email_destino;
    const resendApiKey = configData.resend_api_key;
    const fromEmail = configData.from_email || "noreply@kulturemetrix.com";
    const fromName = configData.from_name || "Kulturemetrix";

    if (!destEmail) {
      console.error("No destination email configured in site_config.");
      return new Response(
        JSON.stringify({ error: "No hay correo de destino configurado." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const subject = `[Nueva Solicitud de Auditoría] - ${body.empresa}`;

    const emailHtml = `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px;">
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #205072, #43B59C); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 20px; font-weight: 800; color: white;">K</span>
          </div>
          <div>
            <h1 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0;">KULTUREMETRIX</h1>
            <p style="font-size: 12px; color: #64748b; margin: 0;">Nueva Solicitud de Auditoría</p>
          </div>
        </div>

        <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 24px;">
          ${subject}
        </h2>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
          <tr style="background: #f8fafc;">
            <td style="padding: 12px 16px; font-weight: 600; color: #64748b; border: 1px solid #e2e8f0; width: 40%;">Nombre de la empresa</td>
            <td style="padding: 12px 16px; border: 1px solid #e2e8f0; font-weight: 500; color: #0f172a;">${body.empresa}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 600; color: #64748b; border: 1px solid #e2e8f0;">Nº de trabajadores</td>
            <td style="padding: 12px 16px; border: 1px solid #e2e8f0; font-weight: 500; color: #0f172a;">${body.num_trabajadores}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 12px 16px; font-weight: 600; color: #64748b; border: 1px solid #e2e8f0;">País de la sede</td>
            <td style="padding: 12px 16px; border: 1px solid #e2e8f0; font-weight: 500; color: #0f172a;">${body.pais}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 600; color: #64748b; border: 1px solid #e2e8f0;">Persona de contacto</td>
            <td style="padding: 12px 16px; border: 1px solid #e2e8f0; font-weight: 500; color: #0f172a;">${body.persona_contacto}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 12px 16px; font-weight: 600; color: #64748b; border: 1px solid #e2e8f0;">Cargo</td>
            <td style="padding: 12px 16px; border: 1px solid #e2e8f0; font-weight: 500; color: #0f172a;">${body.cargo}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 600; color: #64748b; border: 1px solid #e2e8f0;">Teléfono</td>
            <td style="padding: 12px 16px; border: 1px solid #e2e8f0; font-weight: 500; color: #0f172a;">${body.telefono}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 12px 16px; font-weight: 600; color: #64748b; border: 1px solid #e2e8f0;">Correo electrónico</td>
            <td style="padding: 12px 16px; border: 1px solid #e2e8f0; font-weight: 500; color: #0f172a;">${body.email}</td>
          </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">
          Este mensaje se ha generado automáticamente desde el formulario de solicitud de auditoría de KULTUREMETRIX.
        </p>
      </div>
    `;

    const plainTextBody = [
      `Nombre de la empresa: ${body.empresa}`,
      `Nº de trabajadores: ${body.num_trabajadores}`,
      `País de la sede: ${body.pais}`,
      `Persona de contacto: ${body.persona_contacto}`,
      `Cargo: ${body.cargo}`,
      `Teléfono: ${body.telefono}`,
      `Correo electrónico: ${body.email}`,
    ].join("\n");

    if (!resendApiKey) {
      console.error("RESEND API Key no configurada en site_config. No se pudo enviar el email de auditoría.");
      return new Response(
        JSON.stringify({ error: "No hay API Key de Resend configurada. Configúrala en el Panel de Administración." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [destEmail],
        subject: subject,
        html: emailHtml,
        text: plainTextBody,
      }),
    });

    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      console.error(`Resend API error (${emailResponse.status}):`, errText);
      return new Response(
        JSON.stringify({ error: `Error al enviar el correo (Resend ${emailResponse.status}): ${errText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Mark solicitud as notified
    const { error: logError } = await supabase
      .from("solicitudes_auditoria")
      .update({ estado: "notificada" })
      .eq("email", body.email)
      .eq("empresa", body.empresa);

    if (logError) {
      console.error("Error updating solicitud estado:", logError);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notificación enviada correctamente." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Error en send-audit-notification:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
