/*
# Fix solicitudes_auditoria admin read policy

## Root cause
Same bug as site_config: the admin_select_solicitudes policy uses
is_admin() which checks app_metadata.role = 'admin' in the JWT. The
admin user authenticates by email and does NOT carry that claim, so
the admin panel cannot read the audit-request leads.

## Fix
Allow admin by email as well, matching how the admin actually logs in.
*/

DROP POLICY IF EXISTS "admin_select_solicitudes" ON solicitudes_auditoria;
DROP POLICY IF EXISTS "admin_update_solicitudes" ON solicitudes_auditoria;
DROP POLICY IF EXISTS "admin_delete_solicitudes" ON solicitudes_auditoria;

CREATE POLICY "admin_select_solicitudes"
  ON solicitudes_auditoria FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR auth.jwt() ->> 'email' = 'admin@kulturemetrix.com'
  );

CREATE POLICY "admin_update_solicitudes"
  ON solicitudes_auditoria FOR UPDATE
  TO authenticated
  USING (
    is_admin()
    OR auth.jwt() ->> 'email' = 'admin@kulturemetrix.com'
  ) WITH CHECK (
    is_admin()
    OR auth.jwt() ->> 'email' = 'admin@kulturemetrix.com'
  );

CREATE POLICY "admin_delete_solicitudes"
  ON solicitudes_auditoria FOR DELETE
  TO authenticated
  USING (
    is_admin()
    OR auth.jwt() ->> 'email' = 'admin@kulturemetrix.com'
  );
