-- CreateEnum
CREATE TYPE "ReminderKind" AS ENUM ('PRIMARY', 'SECOND_TOUCH');

-- CreateEnum
CREATE TYPE "CancelledBy" AS ENUM ('CLINICIAN', 'PATIENT');

-- DropIndex
DROP INDEX "appointment_reminders_appointment_id_key";

-- AlterTable
ALTER TABLE "clinician_profiles" ADD COLUMN     "reminder_lead_hours" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "reminder_second_lead_hours" INTEGER,
ADD COLUMN     "reminders_enabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "cancelled_by" "CancelledBy",
ADD COLUMN     "reschedule_requested_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "appointment_reminders" ADD COLUMN     "kind" "ReminderKind" NOT NULL DEFAULT 'PRIMARY';

-- CreateTable
CREATE TABLE "patient_portal_tokens" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_portal_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_portal_tokens_token_hash_key" ON "patient_portal_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "patient_portal_tokens_patient_id_idx" ON "patient_portal_tokens"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_reminders_appointment_id_kind_key" ON "appointment_reminders"("appointment_id", "kind");

-- AddForeignKey
ALTER TABLE "patient_portal_tokens" ADD CONSTRAINT "patient_portal_tokens_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
