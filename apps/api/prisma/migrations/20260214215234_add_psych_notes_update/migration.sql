/*
  Warnings:

  - Changed the type of `template_type` on the `psych_notes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NoteTemplateType" AS ENUM ('SOAP', 'FREE', 'INITIAL', 'CBT');

-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "clinical_context" TEXT,
ADD COLUMN     "date_of_birth" DATE,
ADD COLUMN     "diagnosis" TEXT;

-- AlterTable
ALTER TABLE "psych_notes" ADD COLUMN     "private_notes" TEXT,
DROP COLUMN "template_type",
ADD COLUMN     "template_type" "NoteTemplateType" NOT NULL;

-- CreateIndex
CREATE INDEX "patients_full_name_idx" ON "patients"("full_name");
