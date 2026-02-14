-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('CONSULTATION', 'EVALUATION', 'FOLLOW_UP');

-- AlterEnum
CREATE TYPE "ClinicianType_new" AS ENUM ('PSYCHOLOGIST');
ALTER TABLE "clinician_profiles" ALTER COLUMN "type" TYPE "ClinicianType_new" USING ("type"::text::"ClinicianType_new");
ALTER TYPE "ClinicianType" RENAME TO "ClinicianType_old";
ALTER TYPE "ClinicianType_new" RENAME TO "ClinicianType";
DROP TYPE "public"."ClinicianType_old";

-- DropForeignKey
ALTER TABLE "nutri_records" DROP CONSTRAINT "nutri_records_patient_id_fkey";

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "reason" TEXT,
ADD COLUMN     "type" "AppointmentType" NOT NULL DEFAULT 'CONSULTATION';

-- DropTable
DROP TABLE "nutri_records";
