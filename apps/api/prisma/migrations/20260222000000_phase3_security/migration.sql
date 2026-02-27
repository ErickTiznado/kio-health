-- ============================================================
-- Phase 3 Security Migration
-- 1. Refresh token table (C3 / H3)
-- 2. emergencyContact column type JSONB → TEXT (H2 encryption)
-- 3. Row-Level Security policies (M5)
-- ============================================================

-- ── 1. Refresh tokens ──────────────────────────────────────

CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid (),
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now (),
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "refresh_tokens_token_hash_key" UNIQUE ("token_hash"),
    CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens" ("user_id");

-- ── 2. emergencyContact: JSONB → TEXT (for encrypted storage) ──

ALTER TABLE "patients"
    ALTER COLUMN "emergency_contact" TYPE TEXT USING
        CASE
            WHEN "emergency_contact" IS NULL THEN NULL
            ELSE "emergency_contact"::text
        END;

-- ── 3. Row-Level Security ───────────────────────────────────
-- Pattern: application sets session variable app.current_clinician_id
-- before each query. Policies use current_setting() to enforce ownership.
-- The API service role bypasses RLS (set on connection pool).
-- Direct DB access without setting the variable gets NULL → no rows returned.

-- patients
ALTER TABLE "patients" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_clinician_isolation" ON "patients"
    USING (
        "clinician_id"::text = current_setting('app.current_clinician_id', true)
        OR current_setting('app.bypass_rls', true) = 'on'
    );

-- appointments
ALTER TABLE "appointments" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_clinician_isolation" ON "appointments"
    USING (
        "clinician_id"::text = current_setting('app.current_clinician_id', true)
        OR current_setting('app.bypass_rls', true) = 'on'
    );

-- psych_notes (owned via appointment → clinician)
ALTER TABLE "psych_notes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "psych_notes_clinician_isolation" ON "psych_notes"
    USING (
        EXISTS (
            SELECT 1 FROM "appointments" a
            WHERE a."id" = "psych_notes"."appointment_id"
              AND (
                  a."clinician_id"::text = current_setting('app.current_clinician_id', true)
                  OR current_setting('app.bypass_rls', true) = 'on'
              )
        )
    );

-- finance_transactions
ALTER TABLE "finance_transactions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "finance_clinician_isolation" ON "finance_transactions"
    USING (
        "clinician_id"::text = current_setting('app.current_clinician_id', true)
        OR current_setting('app.bypass_rls', true) = 'on'
    );

-- access_logs  (read-only by owner)
ALTER TABLE "access_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "access_logs_user_isolation" ON "access_logs"
    USING (
        "user_id"::text = current_setting('app.current_user_id', true)
        OR current_setting('app.bypass_rls', true) = 'on'
    );

-- refresh_tokens (users can only see their own)
ALTER TABLE "refresh_tokens" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "refresh_tokens_user_isolation" ON "refresh_tokens"
    USING (
        "user_id"::text = current_setting('app.current_user_id', true)
        OR current_setting('app.bypass_rls', true) = 'on'
    );