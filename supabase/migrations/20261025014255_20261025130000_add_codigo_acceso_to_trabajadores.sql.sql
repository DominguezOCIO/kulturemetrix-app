-- Add a unique one-time access code for each trabajador.
ALTER TABLE trabajadores
  ADD COLUMN IF NOT EXISTS codigo_acceso TEXT;

-- Backfill existing rows with a unique code, and set a default for new inserts.
UPDATE trabajadores
  SET codigo_acceso = 'KM-' || upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 6))
  WHERE codigo_acceso IS NULL;

ALTER TABLE trabajadores
  ALTER COLUMN codigo_acceso SET DEFAULT ('KM-' || upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 6)));

ALTER TABLE trabajadores
  ADD CONSTRAINT trabajadores_codigo_acceso_unique UNIQUE (codigo_acceso);

-- Make existing non-null values non-null going forward (existing NULLs are fine
-- until updated). We avoid NOT NULL to keep the backfill safe for any rows that
-- still lack a code.
