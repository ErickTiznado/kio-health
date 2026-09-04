-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "SeriesStatus" AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "series_id" UUID;

-- CreateTable
CREATE TABLE "appointment_series" (
    "id" UUID NOT NULL,
    "clinician_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "frequency" "RecurrenceFrequency" NOT NULL,
    "anchor_start" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "type" "AppointmentType" NOT NULL DEFAULT 'CONSULTATION',
    "price" DECIMAL(10,2) NOT NULL,
    "reason" TEXT,
    "until" TIMESTAMP(3),
    "max_occurrences" INTEGER,
    "occurrences_created" INTEGER NOT NULL DEFAULT 0,
    "status" "SeriesStatus" NOT NULL DEFAULT 'ACTIVE',
    "materialized_until" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_series_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appointment_series_clinician_id_status_idx" ON "appointment_series"("clinician_id", "status");

-- CreateIndex
CREATE INDEX "appointments_series_id_idx" ON "appointments"("series_id");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "appointment_series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_series" ADD CONSTRAINT "appointment_series_clinician_id_fkey" FOREIGN KEY ("clinician_id") REFERENCES "clinician_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_series" ADD CONSTRAINT "appointment_series_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
