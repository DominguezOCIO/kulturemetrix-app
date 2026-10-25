-- Restore write privileges on employee_tokens for anon/authenticated
-- The admin panel (client-side with anon key) needs to manage employee tokens
-- for campaign creation. RLS policies control access.
GRANT INSERT, UPDATE, DELETE ON employee_tokens TO anon, authenticated;
