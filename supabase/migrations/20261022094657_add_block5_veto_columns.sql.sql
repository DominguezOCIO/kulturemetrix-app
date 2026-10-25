/*
# Add Block 5 support: veto tracking column

## Changes

1. `respuestas_agregadas` table:
   - New column `veto_count` (integer, default 0): tracks how many employees in a
     departamento+empresa responded "trigger_veto_alert" on the closing question.
     Only stored on bloque=5 rows.

## Notes
- No data is lost; the new column defaults to 0 for all existing rows.
- RLS already enabled; existing policies cover the new column automatically.
*/

ALTER TABLE respuestas_agregadas
  ADD COLUMN IF NOT EXISTS veto_count integer NOT NULL DEFAULT 0;