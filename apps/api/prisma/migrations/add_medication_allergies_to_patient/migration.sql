-- Add medication and allergies fields to Patient
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "medicacion_actual" TEXT;
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "alergias" TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "idx_patients_medicacion" ON "patients"("medicacion_actual");
