/*
# Add admin write policies on empresas

## Summary
Allows admin users (role: 'admin' in app_metadata) to INSERT, UPDATE,
and DELETE on the empresas table, so the admin panel can manage
companies directly through the authenticated client.

## Security
- Only the admin user has role: 'admin' in app_metadata.
- The is_admin() function checks this claim from the JWT.
*/

DROP POLICY IF EXISTS "admin_insert_empresas" ON empresas;
CREATE POLICY "admin_insert_empresas"
  ON empresas FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_empresas" ON empresas;
CREATE POLICY "admin_update_empresas"
  ON empresas FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_empresas" ON empresas;
CREATE POLICY "admin_delete_empresas"
  ON empresas FOR DELETE
  TO authenticated
  USING (is_admin());

-- Re-grant INSERT, UPDATE, DELETE to authenticated (was revoked earlier)
-- Column-restricted: admin can write all columns
GRANT INSERT, UPDATE, DELETE ON empresas TO authenticated;
