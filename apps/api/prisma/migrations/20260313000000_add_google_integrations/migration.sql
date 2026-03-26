-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."google_integrations" (
    "id"                 UUID        NOT NULL DEFAULT gen_random_uuid(),
    "clinician_id"       UUID        NOT NULL,
    "access_token"       TEXT        NOT NULL,
    "refresh_token"      TEXT,
    "expiry_date"        BIGINT      NOT NULL,
    "calendar_id"        TEXT        DEFAULT 'primary',
    "sync_token"         TEXT,
    "channel_id"         TEXT,
    "resource_id"        TEXT,
    "channel_expiration" BIGINT,
    "created_at"         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "google_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "google_integrations_clinician_id_key" ON "public"."google_integrations"("clinician_id");

-- AddForeignKey
ALTER TABLE "public"."google_integrations"
    ADD CONSTRAINT "google_integrations_clinician_id_fkey"
    FOREIGN KEY ("clinician_id")
    REFERENCES "public"."clinician_profiles"("id")
    ON DELETE CASCADE;
