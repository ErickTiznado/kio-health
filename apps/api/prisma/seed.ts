import 'dotenv/config';
import { PrismaClient } from '../prisma/generated/client/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

// ============================================
// PRISMA 7.x CONFIGURATION
// ============================================

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// ============================================
// CONFIGURATION
// ============================================

const FIXED_PASSWORD = '123456';
const SALT_ROUNDS = 10;

const CLINICIANS_CONFIG = [
  {
    email: 'psych@kio.com',
    type: 'PSYCHOLOGIST' as const,
    licenseNumber: 'PSY-2024-001',
    sessionDefaultPrice: 150.0,
    currency: 'USD',
  },
  {
    email: 'nutri@kio.com',
    type: 'NUTRITIONIST' as const,
    licenseNumber: 'NUT-2024-001',
    sessionDefaultPrice: 100.0,
    currency: 'USD',
  },
];

const PATIENTS_PER_CLINICIAN = 20;
const PAST_APPOINTMENTS = 10;
const TODAY_APPOINTMENTS = 5;
const FUTURE_APPOINTMENTS = 15;

// ============================================
// HELPER FUNCTIONS
// ============================================

function randomStatus(): 'ACTIVE' | 'WAITLIST' {
  return Math.random() > 0.3 ? 'ACTIVE' : 'WAITLIST';
}

function generateEmergencyContact(): object {
  return {
    name: faker.person.fullName(),
    relationship: faker.helpers.arrayElement([
      'Spouse',
      'Parent',
      'Sibling',
      'Friend',
      'Child',
    ]),
    phone: faker.phone.number(),
    email: faker.internet.email(),
  };
}

function getRandomTimeSlot(
  baseDate: Date,
  slotIndex: number,
): { start: Date; end: Date } {
  const startHour = 9 + slotIndex; // Appointments from 9 AM onwards
  const start = new Date(baseDate);
  start.setHours(startHour, 0, 0, 0);

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 50); // 50 min default session

  return { start, end };
}

// ============================================
// SEED FUNCTIONS
// ============================================

async function clearDatabase(): Promise<void> {
  console.log('🗑️  Clearing existing data...');

  // Order matters due to foreign key constraints
  await prisma.financeTransaction.deleteMany();
  await prisma.psychNote.deleteMany();
  await prisma.nutriRecord.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.clinicianProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Database cleared');
}

async function createClinicians(
  passwordHash: string,
): Promise<{ id: string; type: 'PSYCHOLOGIST' | 'NUTRITIONIST' }[]> {
  console.log('👨‍⚕️  Creating clinicians...');

  const clinicians: { id: string; type: 'PSYCHOLOGIST' | 'NUTRITIONIST' }[] =
    [];

  for (const config of CLINICIANS_CONFIG) {
    const user = await prisma.user.create({
      data: {
        email: config.email,
        passwordHash,
        role: 'CLINICIAN',
        profile: {
          create: {
            type: config.type,
            licenseNumber: config.licenseNumber,
            currency: config.currency,
            sessionDefaultPrice: config.sessionDefaultPrice,
            sessionDefaultDuration: 50,
          },
        },
      },
      include: { profile: true },
    });

    if (user.profile) {
      clinicians.push({ id: user.profile.id, type: config.type });
      console.log(`  ✓ Created ${config.type}: ${config.email}`);
    }
  }

  return clinicians;
}

async function createPatientsForClinician(
  clinicianId: string,
): Promise<string[]> {
  const patientIds: string[] = [];

  for (let i = 0; i < PATIENTS_PER_CLINICIAN; i++) {
    const patient = await prisma.patient.create({
      data: {
        clinicianId,
        fullName: faker.person.fullName(),
        status: randomStatus(),
        contactPhone: faker.phone.number(),
        emergencyContact: generateEmergencyContact(),
      },
    });
    patientIds.push(patient.id);
  }

  return patientIds;
}

async function createAppointmentsForClinician(
  clinicianId: string,
  clinicianType: 'PSYCHOLOGIST' | 'NUTRITIONIST',
  patientIds: string[],
  defaultPrice: number,
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Past appointments (last month, COMPLETED/PAID)
  for (let i = 0; i < PAST_APPOINTMENTS; i++) {
    const appointmentDate = new Date(today);
    appointmentDate.setDate(
      appointmentDate.getDate() - faker.number.int({ min: 1, max: 30 }),
    );

    const { start, end } = getRandomTimeSlot(
      appointmentDate,
      faker.number.int({ min: 0, max: 8 }),
    );
    const patientId = faker.helpers.arrayElement(patientIds);

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        clinicianId,
        startTime: start,
        endTime: end,
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        price: defaultPrice,
        notes: faker.lorem.sentence(),
      },
    });

    // Create PsychNote for psychologist appointments
    if (clinicianType === 'PSYCHOLOGIST') {
      await prisma.psychNote.create({
        data: {
          appointmentId: appointment.id,
          patientId,
          templateType: faker.helpers.arrayElement([
            'SOAP',
            'DAP',
            'BIRP',
            'NARRATIVE',
          ]),
          content: {
            subjective: faker.lorem.paragraph(),
            objective: faker.lorem.paragraph(),
            assessment: faker.lorem.paragraph(),
            plan: faker.lorem.paragraph(),
            notes: faker.lorem.sentences(2),
          },
          moodRating: faker.number.int({ min: 1, max: 10 }),
        },
      });
    }

    // Create NutriRecord for nutritionist appointments
    if (clinicianType === 'NUTRITIONIST') {
      await prisma.nutriRecord.create({
        data: {
          patientId,
          anthropometry: {
            weight: faker.number.float({ min: 50, max: 120, fractionDigits: 1 }),
            height: faker.number.float({
              min: 1.5,
              max: 2.0,
              fractionDigits: 2,
            }),
            waist: faker.number.float({ min: 60, max: 120, fractionDigits: 1 }),
            hip: faker.number.float({ min: 80, max: 130, fractionDigits: 1 }),
            bodyFatPercentage: faker.number.float({
              min: 10,
              max: 40,
              fractionDigits: 1,
            }),
          },
          calculations: {
            bmi: faker.number.float({ min: 18, max: 35, fractionDigits: 1 }),
            bmr: faker.number.int({ min: 1200, max: 2500 }),
            tdee: faker.number.int({ min: 1500, max: 3500 }),
            recommendedCalories: faker.number.int({ min: 1400, max: 3000 }),
          },
          date: start,
        },
      });
    }

    // Create FinanceTransaction for completed appointments
    await prisma.financeTransaction.create({
      data: {
        clinicianId,
        appointmentId: appointment.id,
        type: 'INCOME',
        amount: defaultPrice,
        description: `Session payment - ${appointment.id.slice(0, 8)}`,
        date: start,
      },
    });
  }

  // Today's appointments (SCHEDULED/PENDING) - CRITICAL for Dashboard testing
  for (let i = 0; i < TODAY_APPOINTMENTS; i++) {
    const { start, end } = getRandomTimeSlot(today, i + 1); // Start from 10 AM
    const patientId = faker.helpers.arrayElement(patientIds);

    await prisma.appointment.create({
      data: {
        patientId,
        clinicianId,
        startTime: start,
        endTime: end,
        status: 'SCHEDULED',
        paymentStatus: 'PENDING',
        price: defaultPrice,
        notes: null,
      },
    });
  }

  // Future appointments (next month)
  for (let i = 0; i < FUTURE_APPOINTMENTS; i++) {
    const appointmentDate = new Date(today);
    appointmentDate.setDate(
      appointmentDate.getDate() + faker.number.int({ min: 1, max: 30 }),
    );

    const { start, end } = getRandomTimeSlot(
      appointmentDate,
      faker.number.int({ min: 0, max: 8 }),
    );
    const patientId = faker.helpers.arrayElement(patientIds);

    await prisma.appointment.create({
      data: {
        patientId,
        clinicianId,
        startTime: start,
        endTime: end,
        status: 'SCHEDULED',
        paymentStatus: 'PENDING',
        price: defaultPrice,
        notes: null,
      },
    });
  }
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main(): Promise<void> {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (idempotent)
  await clearDatabase();

  // Hash the fixed password once
  const passwordHash = await bcrypt.hash(FIXED_PASSWORD, SALT_ROUNDS);

  // Create clinicians
  const clinicians = await createClinicians(passwordHash);

  // Create patients and appointments for each clinician
  console.log('\n👥 Creating patients and appointments...');

  for (const clinician of clinicians) {
    const patientIds = await createPatientsForClinician(clinician.id);
    console.log(`  ✓ Created ${patientIds.length} patients for ${clinician.type}`);

    const config = CLINICIANS_CONFIG.find((c) => c.type === clinician.type);
    const defaultPrice = config?.sessionDefaultPrice ?? 100;

    await createAppointmentsForClinician(
      clinician.id,
      clinician.type,
      patientIds,
      defaultPrice,
    );

    const totalAppointments =
      PAST_APPOINTMENTS + TODAY_APPOINTMENTS + FUTURE_APPOINTMENTS;
    console.log(`  ✓ Created ${totalAppointments} appointments for ${clinician.type}`);
  }

  // Summary
  console.log('\n📊 Seed Summary:');
  console.log(`  • Users: ${await prisma.user.count()}`);
  console.log(`  • Clinician Profiles: ${await prisma.clinicianProfile.count()}`);
  console.log(`  • Patients: ${await prisma.patient.count()}`);
  console.log(`  • Appointments: ${await prisma.appointment.count()}`);
  console.log(`  • Psych Notes: ${await prisma.psychNote.count()}`);
  console.log(`  • Nutri Records: ${await prisma.nutriRecord.count()}`);
  console.log(`  • Finance Transactions: ${await prisma.financeTransaction.count()}`);

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📌 Test Credentials:');
  console.log('  • Psychologist: psych@kio.com / 123456');
  console.log('  • Nutritionist: nutri@kio.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
