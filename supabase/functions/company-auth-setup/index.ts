import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_EMAILS = ["admin@kulturemetrix.com"];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "No autorizado. Se requiere autenticación de administrador." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify the caller's identity from their access token.
    // We use the anon key for the client and pass the user's JWT explicitly to
    // getUser(), which is the documented way to resolve a user from a raw JWT.
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const callerClient = createClient(supabaseUrl, anonKey);
    const { data: callerData, error: callerError } = await callerClient.auth.getUser(token);

    if (callerError || !callerData.user) {
      return new Response(
        JSON.stringify({ error: "Token de administrador inválido. Vuelve a iniciar sesión en el panel." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const callerEmail = callerData.user.email || "";
    if (!ADMIN_EMAILS.includes(callerEmail.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: "No tienes permisos de administrador." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const { empresa_id, email, password, action } = body;

    if (!empresa_id || !email) {
      return new Response(
        JSON.stringify({ error: "Faltan parámetros: empresa_id y email son obligatorios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    if (action === "create") {
      if (!password || password.length < 8) {
        return new Response(
          JSON.stringify({ error: "La contraseña debe tener al menos 8 caracteres." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Check if user already exists
      const { data: existingUsers } = await adminClient.auth.admin.listUsers();
      const existing = (existingUsers?.users || []).find(
        (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
      );

      let userId: string;

      if (existing) {
        userId = existing.id;
      } else {
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email: email.trim().toLowerCase(),
          password,
          email_confirm: true,
        });

        if (createError || !newUser.user) {
          return new Response(
            JSON.stringify({ error: "Error al crear el usuario: " + (createError?.message || "desconocido") }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        userId = newUser.user.id;
      }

      // Link the auth user to the empresa
      const { error: linkError } = await adminClient
        .from("empresas")
        .update({ auth_user_id: userId })
        .eq("id", empresa_id);

      if (linkError) {
        return new Response(
          JSON.stringify({ error: "Error al vincular el usuario con la empresa." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ success: true, user_id: userId, email: email.trim().toLowerCase() }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );

    } else if (action === "delete") {
      // Find the auth_user_id for this empresa
      const { data: empresa } = await adminClient
        .from("empresas")
        .select("auth_user_id")
        .eq("id", empresa_id)
        .maybeSingle();

      if (!empresa?.auth_user_id) {
        return new Response(
          JSON.stringify({ error: "Esta empresa no tiene usuario de autenticación vinculado." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const { error: deleteError } = await adminClient.auth.admin.deleteUser(empresa.auth_user_id);

      if (deleteError) {
        return new Response(
          JSON.stringify({ error: "Error al eliminar el usuario." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      await adminClient
        .from("empresas")
        .update({ auth_user_id: null })
        .eq("id", empresa_id);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );

    } else {
      return new Response(
        JSON.stringify({ error: "Acción no válida. Usa 'create' o 'delete'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Error interno del servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
