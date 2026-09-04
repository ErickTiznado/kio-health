-- Añade el flujo de invitación beta y generaliza los campos de pasarela de pago.
--
-- Escrita de forma idempotente a propósito: estos cambios de schema ya se
-- aplicaron a mano (vía `prisma db push`) sobre la base de datos de desarrollo,
-- así que la migración tiene que poder correr tanto sobre una BD que ya los
-- tiene como sobre una limpia. El Dockerfile ejecuta `prisma migrate deploy`
-- en cada arranque, así que este script debe ser seguro de reaplicar.

-- ── 1. Nuevo estado de suscripción para la activación manual de la beta ──────
-- Nota: en Postgres < 12 esto no podía correr dentro de una transacción (y
-- Prisma envuelve cada migración en una). Supabase va en PG 15+, donde sí se
-- permite mientras el valor nuevo no se use en la misma transacción — que es
-- el caso aquí.
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'ACTIVE_MANUAL';

-- ── 2. Invitaciones beta ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "beta_invitations" (
  "id"            UUID         NOT NULL DEFAULT gen_random_uuid(),
  "invited_email" TEXT         NOT NULL,
  "token"         TEXT         NOT NULL,
  "expires_at"    TIMESTAMP(3) NOT NULL,
  "accepted_at"   TIMESTAMP(3),
  "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "beta_invitations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "beta_invitations_invited_email_key"
  ON "beta_invitations" ("invited_email");

CREATE UNIQUE INDEX IF NOT EXISTS "beta_invitations_token_key"
  ON "beta_invitations" ("token");

-- ── 3. Campos de pasarela genéricos (reemplazan a los antiguos de Stripe) ────
ALTER TABLE "subscription_plans"
  ADD COLUMN IF NOT EXISTS "gateway_product_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "subscription_plans_gateway_product_id_key"
  ON "subscription_plans" ("gateway_product_id");

ALTER TABLE "clinic_subscriptions"
  ADD COLUMN IF NOT EXISTS "gateway_provider"        TEXT NOT NULL DEFAULT 'N1CO',
  ADD COLUMN IF NOT EXISTS "gateway_customer_id"     TEXT,
  ADD COLUMN IF NOT EXISTS "gateway_subscription_id" TEXT,
  ADD COLUMN IF NOT EXISTS "payment_url"             TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "clinic_subscriptions_gateway_subscription_id_key"
  ON "clinic_subscriptions" ("gateway_subscription_id");
