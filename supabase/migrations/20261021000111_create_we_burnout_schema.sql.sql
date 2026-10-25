/*
# WE BURNOUT IX - Schema inicial

1. New Tables
- `empresas`: representa una empresa cliente.
  - `id` (uuid, pk)
  - `nombre` (text, not null)
  - `api_key` (text, unique, not null) - clave de acceso compartida con empleados y dashboard
  - `estado_suscripcion` (text, default 'activa')
  - `nota_global` (numeric, default 0) - nota global corporativa sobre 10
  - `created_at` (timestamptz)
- `respuestas_agregadas`: almacena SOLO sumas y contadores por departamento y bloque (nunca filas individuales). Privacidad desde el diseño.
  - `id` (uuid, pk)
  - `empresa_id` (uuid, fk a empresas)
  - `departamento` (text, not null)
  - `bloque` (int, 1-4)
  - `suma_puntuacion` (int, default 0) - suma de todas las puntuaciones (1-5) recibidas
  - `contador_respuestas` (int, default 0) - numero de encuestas completadas
  - `updated_at` (timestamptz)
  - unique(empresa_id, departamento, bloque)

2. Security
- RLS habilitado en ambas tablas.
- Sin pantalla de login: politicas TO anon, authenticated para CRUD publico/compartido (la app usa api_key para diferenciar empresas, no auth de usuario).

3. Notas
- No se almacenan respuestas individuales: solo agregados por departamento + bloque.
- El filtro minimo de 5 encuestas se aplica en el frontend al renderizar.
- La nota global se actualiza al recibir cada nueva encuesta completa.
*/

CREATE TABLE IF NOT EXISTS empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  api_key text UNIQUE NOT NULL,
  estado_suscripcion text NOT NULL DEFAULT 'activa',
  nota_global numeric(4,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_empresas" ON empresas;
CREATE POLICY "anon_select_empresas" ON empresas FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_empresas" ON empresas;
CREATE POLICY "anon_insert_empresas" ON empresas FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_empresas" ON empresas;
CREATE POLICY "anon_update_empresas" ON empresas FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_empresas" ON empresas;
CREATE POLICY "anon_delete_empresas" ON empresas FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS respuestas_agregadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  departamento text NOT NULL,
  bloque int NOT NULL CHECK (bloque BETWEEN 1 AND 4),
  suma_puntuacion int NOT NULL DEFAULT 0,
  contador_respuestas int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (empresa_id, departamento, bloque)
);

ALTER TABLE respuestas_agregadas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_respuestas" ON respuestas_agregadas;
CREATE POLICY "anon_select_respuestas" ON respuestas_agregadas FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_respuestas" ON respuestas_agregadas;
CREATE POLICY "anon_insert_respuestas" ON respuestas_agregadas FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_respuestas" ON respuestas_agregadas;
CREATE POLICY "anon_update_respuestas" ON respuestas_agregadas FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_respuestas" ON respuestas_agregadas;
CREATE POLICY "anon_delete_respuestas" ON respuestas_agregadas FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_respuestas_empresa ON respuestas_agregadas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresas_api_key ON empresas(api_key);