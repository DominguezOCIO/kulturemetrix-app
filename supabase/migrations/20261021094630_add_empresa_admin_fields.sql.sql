/*
# WE BURNOUT IX - Campos de gestión administrativa

Añade campos para gestión de facturación y seguimiento de empresas:
- plan_suscripcion: tipo de plan (starter, pro, enterprise)
- precio_mensual: importe que paga la empresa mensualmente
- fecha_alta: fecha de inicio de suscripción
- fecha_renovacion: próxima fecha de renovación
- contacto_email: email del contacto principal en la empresa
- contacto_nombre: nombre del contacto principal
*/

ALTER TABLE empresas
  ADD COLUMN IF NOT EXISTS plan_suscripcion text NOT NULL DEFAULT 'starter',
  ADD COLUMN IF NOT EXISTS precio_mensual numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fecha_alta date,
  ADD COLUMN IF NOT EXISTS fecha_renovacion date,
  ADD COLUMN IF NOT EXISTS contacto_email text,
  ADD COLUMN IF NOT EXISTS contacto_nombre text;