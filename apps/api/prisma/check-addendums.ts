import { PrismaClient } from './generated/client';
const prisma = new PrismaClient();

prisma.psychNoteAddendum.findMany()
  .then(res => console.log(JSON.stringify(res, null, 2)))
  .catch(console.error)
  .finally(() => prisma.$disconnect());