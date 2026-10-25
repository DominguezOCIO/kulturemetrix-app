/*
# Create site_config table for notification settings

## Summary
Creates a singleton config table to store site-wide settings, starting with
the email address where audit request notifications are sent.

## New Tables
- `site_config`
  - `id` (int, primary key, always 1 — singleton row)
  - `notif_email_destino` (text, email to receive audit requests)
  - `updated_at` (timestamptz)

## Security
- Enable RLS on `site_config`.
- SELECT granted to `anon, authenticated` (the form needs to read the email).
- INSERT/UPDATE/DELETE granted only to `authenticated` (admin).
- Admin-only write policies using `is_admin()`.
- Anon can read; only admins can write.
*/

CREATE TABLE IF NOT EXISTS site_config (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  notif_email_destino text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON site_config TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON site_config TO authenticated;

DROP POLICY IF EXISTS "anon_select_site_config" ON site_config;
CREATE POLICY "anon_select_site_config"
  ON site_config FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_site_config" ON site_config;
CREATE POLICY "admin_insert_site_config"
  ON site_config FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_site_config" ON site_config;
CREATE POLICY "admin_update_site_config"
  ON site_config FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_site_config" ON site_config;
CREATE POLICY "admin_delete_site_config"
  ON site_config FOR DELETE
  TO authenticated USING (is_admin());

INSERT INTO site_config (id, notif_email_destino)
VALUES (1, 'admin@kulturemetrix.com')
ON CONFLICT (id) DO NOTHING;
