/*
# Extend site_config with Resend email settings

## Summary
Adds resend_api_key, from_email, from_name columns to site_config.
Secures resend_api_key so anon (public browser) can never read it.

## Security
- REVOKE full table SELECT from anon; grant only notif_email_destino column.
- authenticated (admin) keeps full SELECT/INSERT/UPDATE/DELETE.
- Edge functions use service_role which bypasses RLS.
*/

ALTER TABLE site_config
  ADD COLUMN IF NOT EXISTS resend_api_key text,
  ADD COLUMN IF NOT EXISTS from_email text,
  ADD COLUMN IF NOT EXISTS from_name text;

UPDATE site_config
  SET from_email = 'info@kulturemetrix.com',
      from_name = 'Kulturemetrix'
  WHERE id = 1 AND from_email IS NULL;

REVOKE SELECT ON site_config FROM anon;
GRANT SELECT (notif_email_destino) ON site_config TO anon;
