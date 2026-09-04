-- Periodo de prueba de 15 días.
--
-- El paso "Plan" del onboarding pedía elegir modalidad antes de que el clínico
-- hubiera visto el producto, y esa elección era irreversible: INDIVIDUAL dejaba
-- `createClinic` devolviendo 403 para siempre. Se sustituye por una prueba
-- gratuita: nadie decide nada hasta que ha usado la herramienta.

ALTER TABLE "clinician_profiles" ADD COLUMN "trial_ends_at" TIMESTAMP(3);

-- Backfill: los perfiles que ya existen arrancan su prueba desde su propia
-- fecha de alta, no desde hoy. Contarla desde hoy regalaría 15 días nuevos a
-- cuentas que llevan meses abiertas.
UPDATE "clinician_profiles"
SET "trial_ends_at" = "created_at" + INTERVAL '15 days'
WHERE "trial_ends_at" IS NULL;
