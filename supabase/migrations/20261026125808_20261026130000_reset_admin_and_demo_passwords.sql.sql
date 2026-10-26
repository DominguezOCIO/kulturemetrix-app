-- Reset admin and demo auth user passwords to match the frontend hardcoded credentials.
-- This ensures the admin panel (admin@kulturemetrix.com / KultureAdmin2026!)
-- and the demo company (demo@kulturemetrix.com / DemoCorp2026!) can log in.

UPDATE auth.users
SET encrypted_password = crypt('KultureAdmin2026!', gen_salt('bf')),
    updated_at = now()
WHERE email = 'admin@kulturemetrix.com';

UPDATE auth.users
SET encrypted_password = crypt('DemoCorp2026!', gen_salt('bf')),
    updated_at = now()
WHERE email = 'demo@kulturemetrix.com';
