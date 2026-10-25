/*
# Add email column to solicitudes_auditoria

## Summary
Adds an `email` text column to the audit requests table so the
KultureMetrix team can contact the person via email as well as phone.

## Changes
- `solicitudes_auditoria`: adds `email` text NOT NULL column
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'solicitudes_auditoria' AND column_name = 'email'
  ) THEN
    ALTER TABLE solicitudes_auditoria ADD COLUMN email text;
    UPDATE solicitudes_auditoria SET email = '' WHERE email IS NULL;
    ALTER TABLE solicitudes_auditoria ALTER COLUMN email SET NOT NULL;
  END IF;
END $$;
