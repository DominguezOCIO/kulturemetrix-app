-- The admin form now stores the annual price directly in precio_mensual.
-- Previously it stored the monthly value (annual / 12). Convert existing rows.
UPDATE empresas
SET precio_mensual = ROUND(CAST(precio_mensual AS numeric) * 12, 2)
WHERE precio_mensual IS NOT NULL AND precio_mensual > 0;
