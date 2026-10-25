/*
# Create solicitudes_auditoria table

## Summary
Stores audit requests submitted from the landing page pricing CTA buttons
and the "Iniciar Certificación" button. Each row captures a company's
contact info so the KultureMetrix team can follow up within 24 hours.

## New Tables
- `solicitudes_auditoria`
  - `id` (uuid, primary key)
  - `empresa` (text, company name)
  - `num_trabajadores` (integer, number of employees)
  - `pais` (text, country of HQ, defaults to 'España')
  - `persona_contacto` (text, contact person full name)
  - `cargo` (text, job title)
  - `telefono` (text, phone number)
  - `estado` (text, request status, defaults to 'pendiente')
  - `created_at` (timestamptz, submission time)

## Security
- Enable RLS on `solicitudes_auditoria`.
- This is a public form on the landing page (no sign-in required), so
  INSERT is granted to `anon, authenticated` with `WITH CHECK (true)`.
- SELECT is granted only to `authenticated` with an admin check, so
  regular company users cannot read other companies' requests.
- The admin user (role: 'admin' in app_metadata) can read all requests.
- No UPDATE or DELETE via the Data API; only service_role manages rows.
*/

CREATE TABLE IF NOT EXISTS solicitudes_auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa text NOT NULL,
  num_trabajadores integer NOT NULL CHECK (num_trabajadores > 0),
  pais text NOT NULL DEFAULT 'España',
  persona_contacto text NOT NULL,
  cargo text NOT NULL,
  telefono text NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE solicitudes_auditoria ENABLE ROW LEVEL SECURITY;

-- INSERT: anyone can submit a request (public form)
GRANT INSERT ON solicitudes_auditoria TO anon, authenticated;

DROP POLICY IF EXISTS "anon_insert_solicitudes" ON solicitudes_auditoria;
CREATE POLICY "anon_insert_solicitudes"
  ON solicitudes_auditoria FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- SELECT: only admin users can view requests
GRANT SELECT ON solicitudes_auditoria TO authenticated;
GRANT SELECT, UPDATE, DELETE ON solicitudes_auditoria TO service_role;

DROP POLICY IF EXISTS "admin_select_solicitudes" ON solicitudes_auditoria;
CREATE POLICY "admin_select_solicitudes"
  ON solicitudes_auditoria FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admin can update (e.g. change estado)
DROP POLICY IF EXISTS "admin_update_solicitudes" ON solicitudes_auditoria;
CREATE POLICY "admin_update_solicitudes"
  ON solicitudes_auditoria FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admin can delete
DROP POLICY IF EXISTS "admin_delete_solicitudes" ON solicitudes_auditoria;
CREATE POLICY "admin_delete_solicitudes"
  ON solicitudes_auditoria FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_solicitudes_created_at ON solicitudes_auditoria(created_at DESC);
