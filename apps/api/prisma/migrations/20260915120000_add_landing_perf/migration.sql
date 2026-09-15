-- Tiempo de carga en la analitica de la landing.
--
-- `dwell_ms` solo cuenta desde que React monta, asi que no veia la espera: una
-- persona que aguanta cuatro segundos de pantalla en blanco y se va harta
-- quedaba registrada como una visita de medio segundo. Con la campana de
-- Instagram esa diferencia era justo la pregunta sin responder — si la gente
-- rechazaba la propuesta o nunca llegaba a verla.
--
-- `net_type` separa "la pagina pesa demasiado" de "esta persona esta en una red
-- mala", que piden arreglos distintos.
--
-- Todas nullable: los navegadores viejos no exponen Navigation Timing ni la
-- Network Information API, y una visita sin estos datos sigue siendo valida.
--
-- Idempotente porque el contenedor ejecuta `prisma migrate deploy` en cada
-- arranque, siguiendo la convencion de las migraciones anteriores.

ALTER TABLE "landing_visits" ADD COLUMN IF NOT EXISTS "load_ms"  INTEGER;
ALTER TABLE "landing_visits" ADD COLUMN IF NOT EXISTS "fcp_ms"   INTEGER;
ALTER TABLE "landing_visits" ADD COLUMN IF NOT EXISTS "net_type" TEXT;
