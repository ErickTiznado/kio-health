-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "treatment_goals" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "anthropometries" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "appointment_id" UUID NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL,
    "height" DECIMAL(3,2) NOT NULL,
    "body_fat" DECIMAL(5,2),
    "waist" DECIMAL(5,2),
    "hip" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anthropometries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_plans" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "appointment_id" UUID NOT NULL,
    "content" TEXT,
    "file_url" TEXT,
    "file_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "anthropometries_appointment_id_key" ON "anthropometries"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "meal_plans_appointment_id_key" ON "meal_plans"("appointment_id");

-- AddForeignKey
ALTER TABLE "anthropometries" ADD CONSTRAINT "anthropometries_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anthropometries" ADD CONSTRAINT "anthropometries_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
