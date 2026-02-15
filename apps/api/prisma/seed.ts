import 'dotenv/config';
import { PrismaClient, AppointmentStatus, PaymentStatus, AppointmentType, NoteTemplateType, TransactionType } from '../prisma/generated/client/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { EncryptionService } from '../src/lib/encryption';

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
];

const PATIENTS_COUNT = 25;
const APPOINTMENTS_PER_DAY = 6;
const DAYS_WINDOW = 14; // 2 weeks

// ============================================
// HELPER FUNCTIONS
// ============================================

function randomStatus(): 'ACTIVE' | 'WAITLIST' {
  return Math.random() > 0.2 ? 'ACTIVE' : 'WAITLIST';
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
  // Appointments start at 9 AM, 1 hour slots
  const startHour = 9 + slotIndex; 
  const start = new Date(baseDate);
  start.setHours(startHour, 0, 0, 0);

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 50); // 50 min session

  return { start, end };
}

// ============================================
// SEED FUNCTIONS
// ============================================

async function clearDatabase(): Promise<void> {
  console.log('🗑️  Clearing existing data...');

  // Order matters due to foreign key constraints
  await prisma.accessLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.financeTransaction.deleteMany();
  await prisma.psychNote.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.clinicianProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Database cleared');
}

async function createClinicians(
  passwordHash: string,
): Promise<{ id: string; userId: string; type: 'PSYCHOLOGIST' }[]> {
  console.log('👨‍⚕️  Creating clinicians...');

  const clinicians: { id: string; userId: string; type: 'PSYCHOLOGIST' }[] =
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
      clinicians.push({ id: user.profile.id, userId: user.id, type: config.type });
      console.log(`  ✓ Created ${config.type}: ${config.email}`);
    }
  }

  return clinicians;
}

async function createPatientsForClinician(
  clinicianId: string,
): Promise<string[]> {
  const patientIds: string[] = [];

  for (let i = 0; i < PATIENTS_COUNT; i++) {
    const patient = await prisma.patient.create({
      data: {
        clinicianId,
        fullName: faker.person.fullName(),
        status: randomStatus(),
        contactPhone: faker.phone.number(),
        emergencyContact: generateEmergencyContact(),
        diagnosis: faker.helpers.arrayElement([
          'General Anxiety Disorder',
          'Major Depression',
          'ADHD',
          'Work Stress',
          'Adjustment Disorder',
          null,
        ]),
        clinicalContext: faker.lorem.paragraph(),
        dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      },
    });
    patientIds.push(patient.id);
  }

  return patientIds;
}

async function createAppointmentsForClinician(
  clinicianId: string,
  patientIds: string[],
  defaultPrice: number,
): Promise<void> {
  const today = new Date();
  
  // Start from tomorrow
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + 1);
  startDate.setHours(0,0,0,0);

  console.log(`📅 Scheduling appointments from ${startDate.toDateString()} for ${DAYS_WINDOW} days...`);

  for (let d = 0; d < DAYS_WINDOW; d++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + d);

    // Skip weekends (optional, but realistic)
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;

    for (let i = 0; i < APPOINTMENTS_PER_DAY; i++) {
      const { start, end } = getRandomTimeSlot(currentDate, i);
      const patientId = faker.helpers.arrayElement(patientIds);
      
      // Randomize appointment details
      const type = faker.helpers.arrayElement(Object.values(AppointmentType));
      const status = faker.helpers.weightedArrayElement([
        { weight: 0.8, value: AppointmentStatus.SCHEDULED },
        { weight: 0.1, value: AppointmentStatus.CANCELLED },
        { weight: 0.1, value: AppointmentStatus.NO_SHOW }, // Rare for future? Maybe 'No Show' implies past.
      ]); 

      // If status is SCHEDULED, it's future. 
      // If CANCELLED, it can be future.
      // NO_SHOW is strictly past. Let's fix that.
      const finalStatus = (status === AppointmentStatus.NO_SHOW) ? AppointmentStatus.SCHEDULED : status;

      const paymentStatus = faker.helpers.weightedArrayElement([
        { weight: 0.9, value: PaymentStatus.PENDING },
        { weight: 0.1, value: PaymentStatus.PAID }, // Pre-paid
      ]);

      const appointment = await prisma.appointment.create({
        data: {
          patientId,
          clinicianId,
          startTime: start,
          endTime: end,
          type,
          status: finalStatus,
          paymentStatus,
          price: defaultPrice,
          reason: faker.lorem.sentence(), 
          notes: null, // Future appointments usually don't have notes yet
        },
      });

      // If PAID, create transaction (Income)
      if (paymentStatus === PaymentStatus.PAID) {
        await prisma.financeTransaction.create({
          data: {
            clinicianId,
            appointmentId: appointment.id,
            type: TransactionType.INCOME,
            category: 'Consultation',
            amount: defaultPrice,
            description: `Pre-payment for session on ${start.toLocaleDateString()}`,
            date: start, // Transaction date same as appointment date (simplified)
          },
        });
      }
    }
  }
}

async function createTasksForPatients(patientIds: string[]): Promise<void> {
    console.log('✅ Creating tasks...');
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 1);

    for (const patientId of patientIds) {
        // Create 1-3 tasks per patient
        const taskCount = faker.number.int({ min: 1, max: 3 });
        for (let i = 0; i < taskCount; i++) {
            const dueDate = new Date(startDate);
            dueDate.setDate(startDate.getDate() + faker.number.int({ min: 0, max: 14 }));
            
            await prisma.task.create({
                data: {
                    patientId,
                    description: faker.lorem.sentence(),
                    isCompleted: faker.datatype.boolean(0.2), // Mostly incomplete
                    dueDate,
                }
            });
        }
    }
}

async function createAccessLogs(userId: string, patientIds: string[]): Promise<void> {
    console.log('🔒 Creating access logs...');
    // Create some recent logs
    for (let i = 0; i < 20; i++) {
        await prisma.accessLog.create({
            data: {
                userId,
                patientId: faker.helpers.arrayElement(patientIds),
                action: faker.helpers.arrayElement(['VIEW_PATIENT', 'CREATE_APPOINTMENT', 'UPDATE_NOTE']),
                resource: 'patient',
                details: faker.lorem.sentence(),
                ipAddress: faker.internet.ipv4(),
                userAgent: faker.internet.userAgent(),
            }
        });
    }
}

async function createExpenses(clinicianId: string): Promise<void> {
  console.log('💸 Creating expenses...');
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1); // Tomorrow

  for (let i = 0; i < 5; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + faker.number.int({ min: 0, max: 14 }));
    
    await prisma.financeTransaction.create({
      data: {
        clinicianId,
        type: TransactionType.EXPENSE,
        category: faker.helpers.arrayElement(['Rent', 'Software Subscription', 'Office Supplies']),
        amount: faker.number.float({ min: 50, max: 300, fractionDigits: 2 }),
        description: faker.finance.transactionDescription(),
        date,
      }
    });
  }
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main(): Promise<void> {
  console.log('🌱 Starting ROBUST database seed (Tomorrow -> +2 Weeks)...\n');

  // Clear existing data (idempotent)
  await clearDatabase();

  // Hash the fixed password once
  const passwordHash = await bcrypt.hash(FIXED_PASSWORD, SALT_ROUNDS);

  // Create clinicians
  const clinicians = await createClinicians(passwordHash);

  // Create patients and appointments for each clinician
  console.log('\n👥 Creating patients, appointments, tasks...');

  for (const clinician of clinicians) {
    const patientIds = await createPatientsForClinician(clinician.id);
    console.log(`  ✓ Created ${patientIds.length} patients for ${clinician.type}`);

    const config = CLINICIANS_CONFIG.find((c) => c.type === clinician.type);
    const defaultPrice = config?.sessionDefaultPrice ?? 100;

    await createAppointmentsForClinician(
      clinician.id,
      patientIds,
      defaultPrice,
    );

    await createTasksForPatients(patientIds);
    await createAccessLogs(clinician.userId, patientIds);
    await createExpenses(clinician.id);
  }

  // Summary
  console.log('\n📊 Seed Summary:');
  console.log(`  • Users: ${await prisma.user.count()}`);
  console.log(`  • Clinician Profiles: ${await prisma.clinicianProfile.count()}`);
  console.log(`  • Patients: ${await prisma.patient.count()}`);
  console.log(`  • Appointments: ${await prisma.appointment.count()}`);
  console.log(`  • Tasks: ${await prisma.task.count()}`);
  console.log(`  • Access Logs: ${await prisma.accessLog.count()}`);
  console.log(`  • Finance Transactions: ${await prisma.financeTransaction.count()}`);

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📌 Test Credentials:');
  console.log('  • Psychologist: psych@kio.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
