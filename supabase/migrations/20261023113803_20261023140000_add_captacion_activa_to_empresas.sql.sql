/*
# Add captacion_activa column to empresas

## Purpose
Replaces the previous date-based activation system with a simple manual ON/OFF switch
controlled by the admin. When ON, the company appears in the public "ContactoTrabajador"
form on the Home page. When OFF, it is completely hidden from the public.

## Changes
- Add `captacion_activa` boolean column to `empresas`, defaulting to `false`.
  All new and existing companies default to OFF.
- No RLS changes needed — the column is accessible through existing policies.

## Important notes
1. The admin toggles this switch per-company from the admin panel.
2. The public form on the Home page only queries companies where captacion_activa = true.
3. Default is false so no company is accidentally exposed to public registration.
*/

ALTER TABLE empresas ADD COLUMN IF NOT EXISTS captacion_activa boolean NOT NULL DEFAULT false;
