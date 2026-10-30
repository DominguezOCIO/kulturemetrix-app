/*
# Add pais column to empresas

## Purpose
Adds a `pais` column to the `empresas` table so each company can be tagged
with its country (España or a LATAM country). This enables the admin dashboard
to filter analytics by region (Global / España / LATAM).

## Changes
- New column: `empresas.pais` (text, nullable). Stores the country name.
- No security changes needed (RLS already enabled on empresas).
*/

ALTER TABLE empresas ADD COLUMN IF NOT EXISTS pais text;

-- Backfill existing companies with a default
UPDATE empresas SET pais = 'España' WHERE pais IS NULL;
