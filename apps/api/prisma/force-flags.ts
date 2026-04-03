import { PrismaClient } from './generated/client';

const prisma = new PrismaClient();

async function main() {
  const patients = await prisma.patient.findMany({
    where: { status: 'ACTIVE' },
    take: 10,
    orderBy: { createdAt: 'desc' }
  });

  for (const patient of patients) {
    await prisma.riskFlag.upsert({
      where: { patientId: patient.id },
      update: {
        flagTypes: ['SEVERE_DEPRESSION', 'URGENT'],
        resolvedAt: null
      },
      create: {
        patientId: patient.id,
        flagTypes: ['SEVERE_DEPRESSION', 'URGENT'],
      }
    });
    console.log(`Added test risk flags to ${patient.fullName}`);
  }
}

main().finally(() => prisma.$disconnect());