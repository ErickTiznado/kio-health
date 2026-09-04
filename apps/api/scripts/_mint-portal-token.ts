import { PrismaClient } from '#generated/prisma';
import { createHash, randomBytes } from 'node:crypto';

const prisma = new PrismaClient();

async function main() {
  // Un paciente que tenga cita futura: el portal sin cita que confirmar
  // enseña su estado vacío, que no es lo que queremos retratar.
  const appt = await prisma.appointment.findFirst({
    where: { startTime: { gte: new Date() } },
    orderBy: { startTime: 'asc' },
    select: { patientId: true, startTime: true },
  });
  const patientId =
    appt?.patientId ??
    (await prisma.patient.findFirst({ select: { id: true } }))?.id;

  if (!patientId) throw new Error('No hay pacientes en la BD de desarrollo.');

  const raw = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(raw).digest('hex');
  const row = await prisma.patientPortalToken.create({
    data: {
      patientId,
      tokenHash,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 h, no 30 días
    },
    select: { id: true },
  });

  console.log(JSON.stringify({ tokenId: row.id, patientId, raw, nextAppointment: appt?.startTime }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
