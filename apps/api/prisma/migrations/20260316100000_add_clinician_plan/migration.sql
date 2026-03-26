-- CreateEnum (idempotent)
DO $$ BEGIN
  CREATE TYPE "ClinicianPlan" AS ENUM ('INDIVIDUAL', 'CLINIC');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable (idempotent)
ALTER TABLE "clinician_profiles"
  ADD COLUMN IF NOT EXISTS "plan" "ClinicianPlan" NOT NULL DEFAULT 'INDIVIDUAL';

-- Backfill: clinicians with existing clinic memberships → CLINIC
UPDATE "clinician_profiles" cp
SET "plan" = 'CLINIC'
WHERE EXISTS (
  SELECT 1 FROM "clinic_members" cm WHERE cm.clinician_id = cp.id
);
