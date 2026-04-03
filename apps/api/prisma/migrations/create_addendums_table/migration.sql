-- Create psych_note_addendums table
CREATE TABLE "psych_note_addendums" (
  "id" UUID NOT NULL,
  "appointment_id" UUID NOT NULL,
  "patient_id" UUID NOT NULL,
  "content" TEXT NOT NULL,
  "private_notes" TEXT,
  "created_by" UUID NOT NULL,
  "type" VARCHAR(50) NOT NULL DEFAULT 'ADDENDUM',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "psych_note_addendums_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys
ALTER TABLE "psych_note_addendums" ADD CONSTRAINT "psych_note_addendums_appointment_id_fkey"
  FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "psych_note_addendums" ADD CONSTRAINT "psych_note_addendums_patient_id_fkey"
  FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "psych_note_addendums" ADD CONSTRAINT "psych_note_addendums_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create indexes for efficient queries
CREATE INDEX "idx_psych_note_addendums_appointment_id" ON "psych_note_addendums"("appointment_id");
CREATE INDEX "idx_psych_note_addendums_patient_id" ON "psych_note_addendums"("patient_id");
CREATE INDEX "idx_psych_note_addendums_created_by" ON "psych_note_addendums"("created_by");
CREATE INDEX "idx_psych_note_addendums_created_at" ON "psych_note_addendums"("created_at");
