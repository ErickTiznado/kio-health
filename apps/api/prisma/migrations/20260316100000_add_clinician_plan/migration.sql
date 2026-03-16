-- CreateEnum
CREATE TYPE "ClinicianPlan" AS ENUM ('INDIVIDUAL', 'CLINIC');

-- AlterTable
ALTER TABLE "clinician_profiles"
  ADD COLUMN "plan" "ClinicianPlan" NOT NULL DEFAULT 'INDIVIDUAL';

-- Backfill: clinicians with existing clinic memberships → CLINIC
UPDATE "clinician_profiles" cp
SET "plan" = 'CLINIC'
WHERE EXISTS (
  SELECT 1 FROM "clinic_members" cm WHERE cm.clinician_id = cp.id
);
