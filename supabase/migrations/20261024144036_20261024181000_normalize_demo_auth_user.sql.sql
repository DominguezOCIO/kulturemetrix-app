/*
# Normalize demo auth user fields for GoTrue compatibility

## Summary
The demo user was created with a direct INSERT missing some fields that
GoTrue expects. This migration normalizes them to match the admin user's
format.

## Changes
- Sets recovery_token to '' (was null)
- Sets raw_user_meta_data with standard fields (sub, email, email_verified)
*/

UPDATE auth.users
SET recovery_token = '',
    raw_user_meta_data = jsonb_build_object(
      'sub', id::text,
      'email', email,
      'email_verified', true,
      'phone_verified', false
    ),
    updated_at = now()
WHERE email = 'demo@kulturemetrix.com';
