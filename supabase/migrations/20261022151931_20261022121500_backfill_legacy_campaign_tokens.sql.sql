/*
# Preserve existing campaign access codes

1. Data preservation
- Creates a GENERAL department for each existing company that has legacy campaign tokens.
- Copies legacy unused campaign tokens into `employee_tokens` so existing links continue through the new atomic submission flow.

2. Safety
- No existing rows are deleted or modified.
- Duplicate token codes are ignored.
*/

INSERT INTO departamentos (empresa_id, nombre)
SELECT DISTINCT empresa_id, 'GENERAL'
FROM campaign_tokens
ON CONFLICT (empresa_id, nombre) DO NOTHING;

INSERT INTO employee_tokens (token_code, company_id, department_id, is_used, sent_at, used_at, created_at)
SELECT c.token, c.empresa_id, d.id, c.usado, c.created_at, c.used_at, c.created_at
FROM campaign_tokens c
JOIN departamentos d ON d.empresa_id = c.empresa_id AND d.nombre = 'GENERAL'
ON CONFLICT (token_code) DO NOTHING;
