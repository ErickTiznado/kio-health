-- Create RiskFlagType enum (if not exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RiskFlagType') THEN
    CREATE TYPE "RiskFlagType" AS ENUM (
      'SEVERE_DEPRESSION',
      'SEVERE_ANXIETY',
      'AUTOLESION',
      'SUICIDAL_IDEATION',
      'URGENT',
      'SUDDEN_DETERIORATION'
    );
  END IF;
END $$;

-- Create risk_flags table
CREATE TABLE IF NOT EXISTS "risk_flags" (
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
CREATE UNIQUE INDEX IF NOT EXISTS "risk_flags_patient_id_unique" ON "risk_flags"("patient_id");

-- Add foreign key (ignore if already exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'risk_flags_patient_id_fkey') THEN
    ALTER TABLE "risk_flags" ADD CONSTRAINT "risk_flags_patient_id_fkey"
      FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "idx_risk_flags_resolved" ON "risk_flags"("resolved_at");
