/*
# Add cuenta_activa column to empresas table

1. Changes
- Add `cuenta_activa` boolean column to `empresas`, default `false`.
  When a company's auth credentials are created, this is set to `true`.
  Admins can toggle it from the admin panel to enable/disable company login access.
  The password itself is never changed — toggling off just blocks login, toggling back on restores access with the same credentials.

2. Security
- The existing admin RLS policies on `empresas` (admin_insert_empresas, admin_update_empresas, etc.)
  already cover the `cuenta_activa` column via the table-level INSERT/UPDATE grants to `authenticated`.
- The column is updatable by authenticated admins through the existing table-level grant.
*/

ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS cuenta_activa boolean NOT NULL DEFAULT false;
