-- Create RiskFlagType enum
CREATE TYPE "RiskFlagType" AS ENUM (
  'SEVERE_DEPRESSION',
  'SEVERE_ANXIETY',
  'AUTOLESION',
  'SUICIDAL_IDEATION',
  'URGENT',
  'SUDDEN_DETERIORATION'
);

-- Create risk_flags table
CREATE TABLE "risk_flags" (
  "id" UUID NOT NULL,
  "patient_id" UUID NOT NULL,
  "flag_types" "RiskFlagType"[] NOT NULL DEFAULT '{}',
  "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolved_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "risk_flags_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint (1:1 per patient)
CREATE UNIQUE INDEX "risk_flags_patient_id_unique" ON "risk_flags"("patient_id");

-- Add foreign key
ALTER TABLE "risk_flags" ADD CONSTRAINT "risk_flags_patient_id_fkey"
  FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create index for faster queries
CREATE INDEX "idx_risk_flags_resolved" ON "risk_flags"("resolved_at");
