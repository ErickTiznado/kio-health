-- DropForeignKey
ALTER TABLE "anthropometries" DROP CONSTRAINT "anthropometries_appointment_id_fkey";
ALTER TABLE "anthropometries" DROP CONSTRAINT "anthropometries_patient_id_fkey";
ALTER TABLE "meal_plans" DROP CONSTRAINT "meal_plans_appointment_id_fkey";
ALTER TABLE "meal_plans" DROP CONSTRAINT "meal_plans_patient_id_fkey";

-- DropTable
DROP TABLE "anthropometries";
DROP TABLE "meal_plans";
