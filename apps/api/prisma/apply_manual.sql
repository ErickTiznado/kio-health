-- AlterTable
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "alergias" TEXT;
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "medicacion_actual" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "risk_flags" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "flag_types" "RiskFlagType"[],
    "last_updated" TIMESTAMP(3) NOT NULL,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risk_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "psych_note_addendums" (
    "id" UUID NOT NULL,
    "appointment_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "private_notes" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL DEFAULT 'ADDENDUM',

    CONSTRAINT "psych_note_addendums_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "risk_flags_patient_id_key" ON "risk_flags"("patient_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "psych_note_addendums_appointment_id_idx" ON "psych_note_addendums"("appointment_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "psych_note_addendums_patient_id_idx" ON "psych_note_addendums"("patient_id");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'risk_flags_patient_id_fkey') THEN
        ALTER TABLE "risk_flags" ADD CONSTRAINT "risk_flags_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'psych_note_addendums_patient_id_fkey') THEN
        ALTER TABLE "psych_note_addendums" ADD CONSTRAINT "psych_note_addendums_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
