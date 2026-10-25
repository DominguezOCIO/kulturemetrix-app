/*
# Add captacion_activa column to departamentos

## Purpose
Adds a per-department ON/OFF switch so the admin can control which departments
are visible in the public "ContactoTrabajador" form independently.

## Changes
- Add `captacion_activa` boolean column to `departamentos`, defaulting to `false`.
  All new and existing departments default to OFF.
- No RLS changes needed — existing policies already cover the column.

## Important notes
1. The admin toggles this switch per-department from the admin panel.
2. The public form on the Home page only queries departments where captacion_activa = true.
3. Combined with the empresa-level switch, this creates a two-level cascade filter.
*/

ALTER TABLE departamentos ADD COLUMN IF NOT EXISTS captacion_activa boolean NOT NULL DEFAULT false;
