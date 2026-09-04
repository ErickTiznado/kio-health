-- AlterTable: permitir auditar eventos sin usuario identificado
-- (p. ej. intentos de login con email desconocido)
ALTER TABLE "access_logs" DROP CONSTRAINT "access_logs_user_id_fkey";

ALTER TABLE "access_logs" ALTER COLUMN "user_id" DROP NOT NULL;

ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex: paginación del visor de accesos
CREATE INDEX "access_logs_patient_id_created_at_idx" ON "access_logs"("patient_id", "created_at");

CREATE INDEX "access_logs_user_id_created_at_idx" ON "access_logs"("user_id", "created_at");
