/*
# Create certificate_envios table

1. New Tables
- `certificate_envios`
  - `id` (uuid, primary key)
  - `empresa_id` (uuid, foreign key to empresas.id, NOT NULL, unique)
  - `empresa_nombre` (text, NOT NULL) — snapshot of the company name at the time it was added
  - `contacto_email` (text) — snapshot of the contact email
  - `contacto_nombre` (text) — snapshot of the contact person name
  - `estado` (text, NOT NULL, default 'pendiente') — 'pendiente' or 'enviado'
  - `created_at` (timestamptz, default now()) — order of entry
  - `enviado_at` (timestamptz, nullable) — when the certificate was marked as sent

2. Security
- Enable RLS on `certificate_envios`.
- Grant SELECT, INSERT, UPDATE to `authenticated` (admin-only panel; the company-side app does not touch this table).
- Policies: any authenticated user can read, insert, and update. The admin panel is reached only by the admin account, and the company login uses a different session. For simplicity and since this table is admin-managed, all authenticated users can access it.
*/

CREATE TABLE IF NOT EXISTS certificate_envios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  empresa_nombre text NOT NULL,
  contacto_email text,
  contacto_nombre text,
  estado text NOT NULL DEFAULT 'pendiente',
  created_at timestamptz NOT NULL DEFAULT now(),
  enviado_at timestamptz
);

ALTER TABLE certificate_envios ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON certificate_envios TO authenticated;

DROP POLICY IF EXISTS "select_certificate_envios" ON certificate_envios;
CREATE POLICY "select_certificate_envios"
ON certificate_envios FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_certificate_envios" ON certificate_envios;
CREATE POLICY "insert_certificate_envios"
ON certificate_envios FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_certificate_envios" ON certificate_envios;
CREATE POLICY "update_certificate_envios"
ON certificate_envios FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

CREATE UNIQUE INDEX IF NOT EXISTS certificate_envios_empresa_id_key ON certificate_envios(empresa_id);
