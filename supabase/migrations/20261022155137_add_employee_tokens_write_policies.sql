-- Add missing RLS policies for employee_tokens write operations
-- (admin panel manages campaign tokens from the client with anon key)
CREATE POLICY "anon_insert_employee_tokens" ON employee_tokens
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "anon_update_employee_tokens" ON employee_tokens
  FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete_employee_tokens" ON employee_tokens
  FOR DELETE TO anon, authenticated
  USING (true);
