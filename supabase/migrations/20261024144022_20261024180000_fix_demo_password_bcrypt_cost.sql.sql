/*
# Fix demo user password hash for GoTrue compatibility

## Summary
The demo auth user was created with a direct INSERT using PostgreSQL's
crypt() + gen_salt('bf'), which uses bcrypt cost factor 6 ($2a$06$).
Supabase's GoTrue auth server expects cost factor 10 ($2a$10$).
This migration re-hashes the password with the correct cost factor.

## Changes
- Updates encrypted_password for demo@kulturemetrix.com using
  gen_salt('bf', 10) to match GoTrue's expected bcrypt cost
*/

UPDATE auth.users
SET encrypted_password = crypt('DemoCorp2026!', gen_salt('bf', 10)),
    updated_at = now()
WHERE email = 'demo@kulturemetrix.com';
