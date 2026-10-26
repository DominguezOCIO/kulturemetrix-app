/*
# Auto-create invitacion on trabajador insert

## Summary
When a worker registers their email on the public form (insert into `trabajadores`),
a corresponding row in `invitaciones` is now created automatically by a database trigger.
This removes the need for the admin to click "CREAR ACCESOS" — the per-worker survey
access code appears immediately in the admin table, ready to copy and send externally.

## Changes
1. New function `generate_access_code()` — produces a unique 4-group x 8-char
   alphanumeric code (same format as existing access_codes: `XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX`).
2. New function `auto_create_invitacion()` — SECURITY DEFINER trigger function that
   inserts a row into `invitaciones` using the NEW trabajador's empresa_id, departamento_id
   and email, with has_completed=false. Called AFTER INSERT ON trabajadores.
   If a conflicting row already exists (same empresa_id + email), it silently skips.
3. New trigger `trabajadores_auto_invitacion` — fires AFTER INSERT ON trabajadores
   for each row, calling `auto_create_invitacion()`.
4. Security
   - `auto_create_invitacion` is SECURITY DEFINER and owned by the postgres role so it
     can insert into `invitaciones` (which has no client INSERT grant).
   - EXECUTE on both functions is revoked from PUBLIC/anon and granted only to
     `authenticated` (the trigger runs with owner privileges, not caller).
   - `generate_access_code` is a pure helper; same EXECUTE restriction.
5. No new tables. No columns changed. No data lost.
*/

-- Helper: generate a unique 4x8 alphanumeric access code
CREATE OR REPLACE FUNCTION public.generate_access_code()
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  code text;
  seg text;
  i int;
  j int;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..4 LOOP
      seg := '';
      FOR j IN 1..8 LOOP
        seg := seg || substr(chars, 1 + floor(random() * length(chars))::int, 1);
      END LOOP;
      code := code || seg;
      IF i < 4 THEN
        code := code || '-';
      END IF;
    END LOOP;
    -- ensure uniqueness against invitaciones.access_code
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.invitaciones WHERE access_code = code);
  END LOOP;
  RETURN code;
END;
$$;

-- Trigger function: auto-create an invitacion row for the new trabajador
CREATE OR REPLACE FUNCTION public.auto_create_invitacion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Skip if an invitacion already exists for this empresa + email (idempotent)
  IF EXISTS (
    SELECT 1 FROM public.invitaciones
    WHERE empresa_id = NEW.empresa_id AND email = lower(NEW.email)
  ) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.invitaciones (empresa_id, departamento_id, email, access_code, has_completed)
  VALUES (NEW.empresa_id, NEW.departamento_id, lower(NEW.email), public.generate_access_code(), false);

  RETURN NEW;
END;
$$;

-- Trigger: AFTER INSERT on trabajadores
DROP TRIGGER IF EXISTS trabajadores_auto_invitacion ON public.trabajadores;
CREATE TRIGGER trabajadores_auto_invitacion
AFTER INSERT ON public.trabajadores
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_invitacion();

-- Lock down EXECUTE on both functions: trigger runs with owner privileges, not caller's
REVOKE EXECUTE ON FUNCTION public.generate_access_code() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.auto_create_invitacion() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.auto_create_invitacion() TO authenticated;
