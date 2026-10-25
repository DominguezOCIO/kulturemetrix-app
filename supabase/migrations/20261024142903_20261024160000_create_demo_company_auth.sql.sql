/*
# Create demo company auth user

## Summary
Creates a demo auth user for DemoCorp S.L. so the company login form
can be pre-filled with working credentials. Also links the auth user
to the existing empresa record via auth_user_id.

## Changes
- Inserts a new user into auth.users with email demo@kulturemetrix.com
  and password DemoCorp2026!
- Sets email_confirmed_at so login works without email confirmation
- Updates empresas.auth_user_id for DemoCorp S.L. to point to this user
*/

-- Create the demo auth user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  email_confirmed_at,
  encrypted_password,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  email_change_token_current
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo@kulturemetrix.com',
  now(),
  crypt('DemoCorp2026!', gen_salt('bf')),
  '{"role": "company"}'::jsonb,
  '{}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'demo@kulturemetrix.com'
);

-- Link the auth user to DemoCorp S.L.
UPDATE empresas
SET auth_user_id = (
  SELECT id FROM auth.users WHERE email = 'demo@kulturemetrix.com'
)
WHERE nombre = 'DemoCorp S.L.'
  AND auth_user_id IS NULL;
