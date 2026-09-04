import { PrismaClient } from './generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Cleaning up clinical_scales orphaned records...');
    await prisma.$executeRawUnsafe(`DELETE FROM "clinical_scales" WHERE "patient_id" NOT IN (SELECT id FROM "patients");`);
    await prisma.$executeRawUnsafe(`DELETE FROM "clinical_scales" WHERE "appointment_id" NOT IN (SELECT id FROM "appointments");`);
    console.log('Cleanup completed.');
  } catch (error) {
    console.error('Error cleaning up:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();