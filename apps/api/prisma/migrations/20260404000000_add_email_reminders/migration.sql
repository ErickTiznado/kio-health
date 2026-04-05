-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "clinician_profiles" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'America/Mexico_City';

-- AlterTable
ALTER TABLE "patients" ADD COLUMN "contact_email" TEXT;

-- CreateTable
CREATE TABLE "appointment_reminders" (
    "id" UUID NOT NULL,
    "appointment_id" UUID NOT NULL,
    "patient_email" TEXT NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "confirmation_token" UUID,
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointment_reminders_appointment_id_key" ON "appointment_reminders"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_reminders_confirmation_token_key" ON "appointment_reminders"("confirmation_token");

-- CreateIndex
CREATE INDEX "appointment_reminders_status_scheduled_for_idx" ON "appointment_reminders"("status", "scheduled_for");

-- AddForeignKey
ALTER TABLE "appointment_reminders" ADD CONSTRAINT "appointment_reminders_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
