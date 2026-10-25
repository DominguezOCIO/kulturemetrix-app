-- Fix employee_tokens RLS policies: all policies currently use USING (false) which denies all access.
-- The edge function uses the service role key (bypasses RLS), but the anon client
-- needs SELECT to work if it ever queries directly, and the SECURITY DEFINER function
-- claim_employee_token_and_submit already handles the privileged mutation.
-- Since this is a no-auth app (anon key client), we allow anon/authenticated to SELECT
-- employee_tokens (needed for the validate-token flow if called from client) but
-- restrict INSERT/UPDATE/DELETE to the service role only (edge functions).

DROP POLICY IF EXISTS "anon_select_employee_tokens" ON employee_tokens;
DROP POLICY IF EXISTS "anon_insert_employee_tokens" ON employee_tokens;
DROP POLICY IF EXISTS "anon_update_employee_tokens" ON employee_tokens;
DROP POLICY IF EXISTS "anon_delete_employee_tokens" ON employee_tokens;

-- Allow read access (token validation from client if needed)
CREATE POLICY "anon_select_employee_tokens" ON employee_tokens
  FOR SELECT TO anon, authenticated
  USING (true);

-- Revoke write access from anon/authenticated — only service role (edge functions) should write
REVOKE INSERT, UPDATE, DELETE ON employee_tokens FROM anon, authenticated;
