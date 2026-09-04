import { PrismaClient } from './generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true
      }
    });
    
    console.table(users);
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();