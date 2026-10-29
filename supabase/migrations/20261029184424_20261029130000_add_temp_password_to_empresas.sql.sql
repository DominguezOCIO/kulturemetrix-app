/*
# Add temp_password column to empresas

## Purpose
When a new company is created, the admin panel auto-generates access credentials
(email + temporary password). Previously the password was shown once in a modal
and then lost. This migration adds a `temp_password` column so the admin can
view the credentials later from the company detail page.

## Changes
- New column: `empresas.temp_password` (text, nullable). Stores the auto-generated
  temporary password so it can be displayed in the "Ver credenciales de acceso" modal.
- No security changes needed (RLS already enabled on empresas).
*/

ALTER TABLE empresas ADD COLUMN IF NOT EXISTS temp_password text;
