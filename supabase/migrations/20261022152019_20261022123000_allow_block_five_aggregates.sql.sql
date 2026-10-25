/*
# Allow all five existing survey blocks

1. Modified Tables
- `respuestas_agregadas`: updates the block validation from 1-4 to 1-5.

2. Reason
- The current questionnaire already includes block 5, including randomized questions and the coercion check. The old constraint prevented those results from being persisted.

3. Safety
- No rows are deleted or rewritten. The change only permits the already-supported block 5 value.
- Existing row-level security and grants remain unchanged.
*/

ALTER TABLE respuestas_agregadas DROP CONSTRAINT IF EXISTS respuestas_agregadas_bloque_check;
ALTER TABLE respuestas_agregadas ADD CONSTRAINT respuestas_agregadas_bloque_check CHECK (bloque BETWEEN 1 AND 5);
