
-- CreateEnum
CREATE TYPE "ScaleAssignmentStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ScaleSource" AS ENUM ('CLINICIAN', 'PATIENT');

-- AlterTable
ALTER TABLE "clinical_scales" ADD COLUMN     "source" "ScaleSource" NOT NULL DEFAULT 'CLINICIAN';

-- CreateTable
CREATE TABLE "scale_assignments" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "appointment_id" UUID NOT NULL,
    "scale_type" "ScaleType" NOT NULL,
    "status" "ScaleAssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scale_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scale_assignments_patient_id_status_idx" ON "scale_assignments"("patient_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "scale_assignments_appointment_id_scale_type_key" ON "scale_assignments"("appointment_id", "scale_type");

-- AddForeignKey
ALTER TABLE "scale_assignments" ADD CONSTRAINT "scale_assignments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scale_assignments" ADD CONSTRAINT "scale_assignments_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

