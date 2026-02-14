import 'dotenv/config';
import { PrismaClient } from '../prisma/generated/client/index.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding appointment for TODAY...');

  const psychologistEmail = 'psych@kio.com';
  
  // Find the clinician

  const user = await prisma.user.findUnique({
    where: { email: psychologistEmail },
    include: { profile: true },
  });

  if (!user || !user.profile) {
    console.error('Psychologist user not found!');
    process.exit(1);
  }

  // Find a patient
  const patient = await prisma.patient.findFirst({
    where: { clinicianId: user.profile.id },
  });

  if (!patient) {
    console.error('No patient found for this clinician!');
    process.exit(1);
  }

  // Create appointment for TODAY at 10:00 AM local time
  const today = new Date();
  today.setHours(10, 0, 0, 0);

  const end = new Date(today);
  end.setHours(10, 50, 0, 0);

  const appointment = await prisma.appointment.create({
    data: {
      clinicianId: user.profile.id,
      patientId: patient.id,
      startTime: today,
      endTime: end,
      status: 'SCHEDULED',
      notes: 'Sesión de seguimiento (Generada automáticamente)',
      price: 150.00,
    },
  });

  console.log(`Created appointment with ID: ${appointment.id}`);
  console.log(`Date: ${appointment.startTime}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
