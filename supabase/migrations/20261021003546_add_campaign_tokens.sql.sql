/*
# WE BURNOUT IX - Tabla de tokens de campaña

1. New Tables
- `campaign_tokens`: almacena tokens de un solo uso para campañas de encuesta.
  - `id` (uuid, pk)
  - `empresa_id` (uuid, fk a empresas, ON DELETE CASCADE)
  - `token` (text, unique, not null) - token aleatorio de un solo uso, completamente desvinculado del email
  - `usado` (boolean, default false) - marca si el token ya fue utilizado
  - `created_at` (timestamptz, default now())
  - `used_at` (timestamptz, nullable) - momento en que se utilizó

2. Security
- RLS habilitado en campaign_tokens.
- Sin pantalla de login: politicas TO anon, authenticated.
- SELECT/INSERT/UPDATE abiertos para anon porque los tokens se validan desde el frontend anonimo.

3. Notas - PRIVACIDAD CRÍTICA
- Esta tabla NO almacena correos electrónicos. Los emails se pasan directamente a la
  edge function que envía los correos, y nunca se persisten en la base de datos.
- No existe ninguna relación entre el email del empleado y las respuestas enviadas.
- El token es la única forma de acceder a la encuesta, y una vez usado se marca como
  utilizado para evitar respuestas duplicadas.
*/

CREATE TABLE IF NOT EXISTS campaign_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  usado boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz
);

ALTER TABLE campaign_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tokens" ON campaign_tokens;
CREATE POLICY "anon_select_tokens" ON campaign_tokens FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tokens" ON campaign_tokens;
CREATE POLICY "anon_insert_tokens" ON campaign_tokens FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tokens" ON campaign_tokens;
CREATE POLICY "anon_update_tokens" ON campaign_tokens FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tokens" ON campaign_tokens;
CREATE POLICY "anon_delete_tokens" ON campaign_tokens FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_tokens_empresa ON campaign_tokens(empresa_id);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON campaign_tokens(token);