-- AlterTable (idempotent)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "full_name" TEXT;

-- Backfill from email prefix for existing users
UPDATE "users" SET "full_name" = split_part(email, '@', 1) WHERE "full_name" IS NULL;
