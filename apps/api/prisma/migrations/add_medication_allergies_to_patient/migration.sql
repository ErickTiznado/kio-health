-- Add medication and allergies fields to Patient
ALTER TABLE "patients" ADD COLUMN "medicacion_actual" TEXT;
ALTER TABLE "patients" ADD COLUMN "alergias" TEXT;

-- Create index for faster queries
CREATE INDEX "idx_patients_medicacion" ON "patients"("medicacion_actual");
