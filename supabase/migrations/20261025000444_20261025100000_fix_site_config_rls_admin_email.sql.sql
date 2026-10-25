/*
# Fix site_config RLS — allow admin by email, not just app_metadata

## Root cause
The admin user logs in via Supabase Auth (email/password). The panel checks
the email client-side, but the JWT does NOT carry app_metadata.role = 'admin'.
So is_admin() returns false and RLS blocks all INSERT/UPDATE/DELETE on
site_config, producing the generic "Error al guardar la configuración".

## Fix
Replace the is_admin()-only write policies with ones that ALSO accept
the known admin email via auth.jwt() ->> 'email'. This matches how the
admin actually authenticates today.
*/

DROP POLICY IF EXISTS "admin_insert_site_config" ON site_config;
DROP POLICY IF EXISTS "admin_update_site_config" ON site_config;
DROP POLICY IF EXISTS "admin_delete_site_config" ON site_config;

CREATE POLICY "admin_insert_site_config"
  ON site_config FOR INSERT
  TO authenticated WITH CHECK (
    is_admin()
    OR auth.jwt() ->> 'email' = 'admin@kulturemetrix.com'
  );

CREATE POLICY "admin_update_site_config"
  ON site_config FOR UPDATE
  TO authenticated USING (
    is_admin()
    OR auth.jwt() ->> 'email' = 'admin@kulturemetrix.com'
  ) WITH CHECK (
    is_admin()
    OR auth.jwt() ->> 'email' = 'admin@kulturemetrix.com'
  );

CREATE POLICY "admin_delete_site_config"
  ON site_config FOR DELETE
  TO authenticated USING (
    is_admin()
    OR auth.jwt() ->> 'email' = 'admin@kulturemetrix.com'
  );
