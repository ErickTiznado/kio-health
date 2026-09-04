/**
 * Script para generar links de invitación beta.
 *
 * Uso (los emails van por argumento, NO en el código):
 *   cd apps/api
 *   npx ts-node scripts/create-invites.ts psico1@ejemplo.com psico2@ejemplo.com
 *
 * Pasarlos por argv evita tener que editar el archivo en cada tanda, que era la
 * vía rápida a commitear emails reales de usuarios en el repositorio.
 */

import { PrismaClient } from '#generated/prisma';

const prisma = new PrismaClient();

const BETA_EMAILS: string[] = process.argv.slice(2);

// URL base del frontend (sin slash final).
// El default coincide con el dominio desde el que salen los emails
// transaccionales (ver lib/email.service.ts); si no, los links generados
// apuntarían a un dominio distinto al del resto del sistema.
const BASE_URL = (process.env.FRONTEND_URL ?? 'https://kioind.com').replace(/\/+$/, '');

// Días de validez del link
const EXPIRE_DAYS = 30;
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  if (BETA_EMAILS.length === 0) {
    console.error('❌  Pasa al menos un email como argumento.');
    console.error('    Ejemplo: npx ts-node scripts/create-invites.ts alguien@ejemplo.com');
    process.exit(1);
  }

  const invalid = BETA_EMAILS.filter((e) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e.trim()));
  if (invalid.length > 0) {
    console.error(`❌  Emails con formato inválido: ${invalid.join(', ')}`);
    process.exit(1);
  }

  console.log(`\n🚀  Generando ${BETA_EMAILS.length} invitaciones (válidas por ${EXPIRE_DAYS} días)...`);
  console.log(`    Dominio de los links: ${BASE_URL}\n`);

  const expiresAt = new Date(Date.now() + EXPIRE_DAYS * 24 * 60 * 60 * 1000);

  for (const email of BETA_EMAILS) {
    const normalized = email.toLowerCase().trim();

    // Si ya existe una invitación no usada para este email, reutilizarla
    const existing = await prisma.betaInvitation.findUnique({
      where: { invitedEmail: normalized },
    });

    if (existing && !existing.acceptedAt) {
      const link = `${BASE_URL}/signup?invite=${existing.token}`;
      console.log(`⚠️  Ya existe  ${normalized}`);
      console.log(`   ${link}\n`);
      continue;
    }

    if (existing?.acceptedAt) {
      console.log(`✅  Ya registrado  ${normalized} — omitiendo\n`);
      continue;
    }

    const inv = await prisma.betaInvitation.create({
      data: { invitedEmail: normalized, expiresAt },
    });

    const link = `${BASE_URL}/signup?invite=${inv.token}`;
    console.log(`✉️   ${normalized}`);
    console.log(`   ${link}\n`);
  }

  console.log('🎉  Listo. Comparte los links con tus usuarios beta.');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
