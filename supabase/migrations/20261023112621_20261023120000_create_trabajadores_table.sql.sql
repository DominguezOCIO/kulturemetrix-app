/*
# Create trabajadores table for worker email collection

## Purpose
Stores worker emails registered through the public "ContactoTrabajador" form on the Home page.
Each worker is linked to an empresa and a departamento. When the admin launches a campaign,
the system reads from this table to generate tokens with the departamento_id embedded.

## New Tables
- `trabajadores`
  - `id` (uuid, primary key)
  - `email` (text, not null) — the worker's email
  - `empresa_id` (uuid, not null, FK to empresas.id) — the company the worker belongs to
  - `departamento_id` (uuid, not null, FK to departamentos.id) — the department the worker belongs to
  - `created_at` (timestamptz, default now())
  - Unique constraint on (email, empresa_id) to prevent duplicate registrations

## Security
- Enable RLS on `trabajadores`.
- Grant SELECT, INSERT to `anon, authenticated` (no-auth app: the public form submits as anon).
- Grant UPDATE, DELETE to `anon, authenticated` (admin uses anon key too).
- Policies: all CRUD open to anon + authenticated (single-tenant, no sign-in screen).
*/

CREATE TABLE IF NOT EXISTS trabajadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  departamento_id uuid NOT NULL REFERENCES departamentos(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(email, empresa_id)
);

ALTER TABLE trabajadores ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON trabajadores TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_trabajadores" ON trabajadores;
CREATE POLICY "anon_select_trabajadores"
ON trabajadores FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_trabajadores" ON trabajadores;
CREATE POLICY "anon_insert_trabajadores"
ON trabajadores FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_trabajadores" ON trabajadores;
CREATE POLICY "anon_update_trabajadores"
ON trabajadores FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_trabajadores" ON trabajadores;
CREATE POLICY "anon_delete_trabajadores"
ON trabajadores FOR DELETE
TO anon, authenticated USING (true);
