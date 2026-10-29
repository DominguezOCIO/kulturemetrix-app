/*
# Add daily limit fields to ia_config

## Purpose
Adds two new columns to `ia_config` to control the speed and safety of
automated searches performed by the AI agents.

## Changes
- New column: `ia_config.limite_diario_empresas` (integer, default 50)
  Controls the maximum number of companies to search per day.
- New column: `ia_config.limite_diario_medios` (integer, default 7)
  Controls the maximum number of media outlets / blogs to track per day.
- Existing config row is updated with defaults if columns are new.
*/

ALTER TABLE ia_config ADD COLUMN IF NOT EXISTS limite_diario_empresas integer NOT NULL DEFAULT 50;
ALTER TABLE ia_config ADD COLUMN IF NOT EXISTS limite_diario_medios integer NOT NULL DEFAULT 7;
