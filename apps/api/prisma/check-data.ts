import { PrismaClient } from './generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
  try {
    const userCount = await prisma.user.count();
    const patientCount = await prisma.patient.count();
    const appointmentCount = await prisma.appointment.count();
    
    console.log(`Users: ${userCount}`);
    console.log(`Patients: ${patientCount}`);
    console.log(`Appointments: ${appointmentCount}`);
  } catch (error) {
    console.error('Error fetching counts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();