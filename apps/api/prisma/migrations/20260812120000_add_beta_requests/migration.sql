-- Solicitudes de acceso a la beta enviadas desde la landing pública.
--
-- Es una tabla distinta de `beta_invitations` a propósito: una invitación
-- concede acceso y lleva token y caducidad; una solicitud solo registra que
-- alguien pidió entrar. Mezclarlas obligaría a inventar un token para gente
-- que todavía no ha sido invitada.
--
-- Idempotente porque el contenedor ejecuta `prisma migrate deploy` en cada
-- arranque, siguiendo la convención de las migraciones anteriores.

CREATE TABLE IF NOT EXISTS "beta_requests" (
  "id"            UUID         NOT NULL DEFAULT gen_random_uuid(),
  "email"         TEXT         NOT NULL,
  "full_name"     TEXT,
  "practice_kind" TEXT,
  "invited_at"    TIMESTAMP(3),
  "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "beta_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "beta_requests_email_key"
  ON "beta_requests" ("email");

-- La escritura llega por un endpoint público, así que la tabla queda con RLS
-- activo y sin políticas: solo el rol de servicio de la API (que la evita)
-- puede leerla o escribirla. Ningún cliente anónimo la alcanza directamente.
ALTER TABLE "beta_requests" ENABLE ROW LEVEL SECURITY;
