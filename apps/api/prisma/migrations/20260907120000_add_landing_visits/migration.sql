-- Analítica propia de la landing pública: una fila por visita.
--
-- No es una tabla de eventos a propósito. La landing tiene cinco secciones y
-- una conversión; agregar en el cliente y guardar una fila por visita responde
-- lo mismo que un log de eventos y no crece sin control.
--
-- No hay IP ni user-agent: `device` e `in_app_browser` llegan ya derivados. El
-- identificador de visita vive en `sessionStorage` del navegador, así que no es
-- una cookie y no permite seguir a nadie entre sesiones.
--
-- Idempotente porque el contenedor ejecuta `prisma migrate deploy` en cada
-- arranque, siguiendo la convención de las migraciones anteriores.

CREATE TABLE IF NOT EXISTS "landing_visits" (
  "id"             UUID         NOT NULL DEFAULT gen_random_uuid(),
  "visit_id"       TEXT         NOT NULL,
  "source"         TEXT         NOT NULL,
  "utm_source"     TEXT,
  "utm_medium"     TEXT,
  "utm_campaign"   TEXT,
  "referrer_host"  TEXT,
  "device"         TEXT         NOT NULL,
  "in_app_browser" BOOLEAN      NOT NULL DEFAULT false,
  "sections_seen"  TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],
  "max_scroll_pct" INTEGER      NOT NULL DEFAULT 0,
  "dwell_ms"       INTEGER      NOT NULL DEFAULT 0,
  "waitlist"       BOOLEAN      NOT NULL DEFAULT false,
  "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "landing_visits_pkey" PRIMARY KEY ("id")
);

-- Clave del upsert: cada beacon de la misma pestaña actualiza su propia fila.
CREATE UNIQUE INDEX IF NOT EXISTS "landing_visits_visit_id_key"
  ON "landing_visits" ("visit_id");

CREATE INDEX IF NOT EXISTS "landing_visits_created_at_idx"
  ON "landing_visits" ("created_at");

CREATE INDEX IF NOT EXISTS "landing_visits_source_created_at_idx"
  ON "landing_visits" ("source", "created_at");

-- La escritura llega por un endpoint público, así que la tabla queda con RLS
-- activo y sin políticas: solo el rol de servicio de la API (que lo evita)
-- puede leerla o escribirla.
ALTER TABLE "landing_visits" ENABLE ROW LEVEL SECURITY;
