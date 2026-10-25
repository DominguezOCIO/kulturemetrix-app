/*
# Fix demo company password

## Summary
The demo auth user was created with a direct insert into auth.users,
but the encrypted_password may not have been set correctly for
Supabase Auth's password verification. This migration resets the
password using the same crypt() approach to ensure it works.

## Changes
- Updates the encrypted_password for demo@kulturemetrix.com
  using crypt() with a fresh bcrypt salt
*/

UPDATE auth.users
SET encrypted_password = crypt('DemoCorp2026!', gen_salt('bf')),
    updated_at = now()
WHERE email = 'demo@kulturemetrix.com';
