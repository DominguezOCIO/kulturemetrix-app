/*
# Grant server-side campaign access

1. Security
- Grants the deployed campaign and validation functions the minimum access needed to read companies/departments and create employee tokens.
- Browser roles remain unable to insert, update, or delete employee tokens directly.

2. Safety
- No data is changed or removed.
*/

GRANT SELECT ON empresas TO service_role;
GRANT SELECT ON departamentos TO service_role;
GRANT SELECT, INSERT, UPDATE ON employee_tokens TO service_role;
