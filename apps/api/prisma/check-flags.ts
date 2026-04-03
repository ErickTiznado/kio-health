import { PrismaClient } from './generated/client';

const prisma = new PrismaClient();

async function main() {
  const c = await prisma.riskFlag.count();
  console.log('Count of risk flags:', c);
  const flags = await prisma.riskFlag.findMany({ take: 5, include: { patient: { select: { fullName: true } } } });
  console.log('Sample flags:', JSON.stringify(flags, null, 2));
}
main().finally(() => prisma.$disconnect());