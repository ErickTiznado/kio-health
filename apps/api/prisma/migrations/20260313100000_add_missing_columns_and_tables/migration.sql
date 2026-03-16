-- Add google_event_id to appointments
ALTER TABLE "public"."appointments"
    ADD COLUMN IF NOT EXISTS "google_event_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "appointments_google_event_id_key"
    ON "public"."appointments"("google_event_id");

-- CreateEnum: SubscriptionStatus
DO $$ BEGIN
    CREATE TYPE "public"."SubscriptionStatus" AS ENUM (
        'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: subscription_plans
CREATE TABLE IF NOT EXISTS "public"."subscription_plans" (
    "id"              UUID          NOT NULL DEFAULT gen_random_uuid(),
    "name"            TEXT          NOT NULL,
    "price"           DECIMAL(10,2) NOT NULL,
    "stripe_price_id" TEXT,
    "features"        TEXT[]        NOT NULL DEFAULT ARRAY[]::TEXT[],
    "created_at"      TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMPTZ   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "subscription_plans_stripe_price_id_key"
    ON "public"."subscription_plans"("stripe_price_id");

-- CreateTable: clinic_subscriptions
CREATE TABLE IF NOT EXISTS "public"."clinic_subscriptions" (
    "id"                      UUID                          NOT NULL DEFAULT gen_random_uuid(),
    "clinic_id"               UUID                          NOT NULL,
    "plan_id"                 UUID,
    "status"                  "public"."SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "stripe_customer_id"      TEXT,
    "stripe_subscription_id"  TEXT,
    "current_period_end"      TIMESTAMPTZ,
    "created_at"              TIMESTAMPTZ                   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"              TIMESTAMPTZ                   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "clinic_subscriptions_clinic_id_key"
    ON "public"."clinic_subscriptions"("clinic_id");

CREATE UNIQUE INDEX IF NOT EXISTS "clinic_subscriptions_stripe_customer_id_key"
    ON "public"."clinic_subscriptions"("stripe_customer_id");

CREATE UNIQUE INDEX IF NOT EXISTS "clinic_subscriptions_stripe_subscription_id_key"
    ON "public"."clinic_subscriptions"("stripe_subscription_id");

ALTER TABLE "public"."clinic_subscriptions"
    ADD CONSTRAINT "clinic_subscriptions_clinic_id_fkey"
    FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;

ALTER TABLE "public"."clinic_subscriptions"
    ADD CONSTRAINT "clinic_subscriptions_plan_id_fkey"
    FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE RESTRICT;
