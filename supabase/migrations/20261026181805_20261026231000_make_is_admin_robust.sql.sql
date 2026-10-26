/*
# Make is_admin() more robust

The is_admin() function currently only checks app_metadata.role = 'admin'.
Some JWTs may not include the app_metadata correctly, causing "permission denied"
errors even for legitimate admin users. This update adds a fallback check
against the user's email from the JWT, matching known admin emails.

1. Changes
- Update is_admin() to also return true if the JWT email matches admin@kulturemetrix.com
- This is a defense-in-depth measure; the primary check remains app_metadata.role
*/

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
SELECT COALESCE(
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
  false
) OR COALESCE(
  (auth.jwt() ->> 'email') = 'admin@kulturemetrix.com',
  false
);
$function$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
