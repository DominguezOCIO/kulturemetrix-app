/*
# Add admin role policy for empresas

## Summary
Allows users with `role: 'admin'` in their app_metadata to read all
empresas, departamentos, trabajadores, campaign_tokens, and
respuestas_agregadas. This is needed for the admin panel which manages
all companies.

## Security
- The admin role is set via `raw_app_meta_data` (user-immutable).
- Only the admin user (admin@kulturemetrix.com) has this role.
- Admin users can SELECT all rows. INSERT/UPDATE/DELETE on empresas
  remains service_role only (admin operations go through edge functions
  or direct DB access with service role).
- For departamentos, trabajadores, the admin user gets full CRUD since
  the admin panel manages these directly.
*/

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

REVOKE EXECUTE ON FUNCTION is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Add admin SELECT policy on empresas
DROP POLICY IF EXISTS "admin_select_all_empresas" ON empresas;
CREATE POLICY "admin_select_all_empresas"
  ON empresas FOR SELECT
  TO authenticated
  USING (is_admin());

-- Add admin CRUD on departamentos
DROP POLICY IF EXISTS "admin_select_all_departamentos" ON departamentos;
CREATE POLICY "admin_select_all_departamentos"
  ON departamentos FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_all_departamentos" ON departamentos;
CREATE POLICY "admin_insert_all_departamentos"
  ON departamentos FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_all_departamentos" ON departamentos;
CREATE POLICY "admin_update_all_departamentos"
  ON departamentos FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_all_departamentos" ON departamentos;
CREATE POLICY "admin_delete_all_departamentos"
  ON departamentos FOR DELETE
  TO authenticated
  USING (is_admin());

-- Add admin CRUD on trabajadores
DROP POLICY IF EXISTS "admin_select_all_trabajadores" ON trabajadores;
CREATE POLICY "admin_select_all_trabajadores"
  ON trabajadores FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_all_trabajadores" ON trabajadores;
CREATE POLICY "admin_insert_all_trabajadores"
  ON trabajadores FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_all_trabajadores" ON trabajadores;
CREATE POLICY "admin_update_all_trabajadores"
  ON trabajadores FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_all_trabajadores" ON trabajadores;
CREATE POLICY "admin_delete_all_trabajadores"
  ON trabajadores FOR DELETE
  TO authenticated
  USING (is_admin());

-- Add admin SELECT on campaign_tokens
DROP POLICY IF EXISTS "admin_select_all_campaign_tokens" ON campaign_tokens;
CREATE POLICY "admin_select_all_campaign_tokens"
  ON campaign_tokens FOR SELECT
  TO authenticated
  USING (is_admin());

-- Add admin SELECT on respuestas_agregadas
DROP POLICY IF EXISTS "admin_select_all_respuestas" ON respuestas_agregadas;
CREATE POLICY "admin_select_all_respuestas"
  ON respuestas_agregadas FOR SELECT
  TO authenticated
  USING (is_admin());
