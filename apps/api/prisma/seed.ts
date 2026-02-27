import 'dotenv/config';
import { PrismaClient, AppointmentStatus, PaymentStatus, AppointmentType, NoteTemplateType, TransactionType } from '../prisma/generated/client/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { EncryptionService } from '../src/lib/encryption.service';

// ============================================
// PRISMA 7.x CONFIGURATION
// ============================================

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });
const encryptionService = new EncryptionService();

// ============================================
// CONFIGURATION
// ============================================

const FIXED_PASSWORD = process.env.SEED_PASSWORD;
if (!FIXED_PASSWORD) {
  throw new Error('SEED_PASSWORD environment variable is required to run the seed.');
}
const SEED_PASSWORD: string = FIXED_PASSWORD;
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
const FUTURE_DAYS_WINDOW = 14;   // 2 weeks forward
const PAST_WEEKS = 8;            // 8 weeks of clinical history

// ============================================
// REALISTIC CLINICAL DATA
// ============================================

const DIAGNOSES = [
  'Trastorno de Ansiedad Generalizada',
  'Depresión Mayor',
  'TDAH',
  'Estrés Laboral',
  'Trastorno de Adaptación',
  'Trastorno de Pánico',
  'Fobia Social',
  'Duelo Patológico',
  null,
];

const SOAP_SUBJECTIVE = [
  'Paciente reporta mejoría en la calidad del sueño. Refiere haber dormido entre 6-7 horas las últimas noches sin despertares nocturnos.',
  'Manifiesta sentirse "abrumado/a" por la carga laboral. Reporta peleas frecuentes con su pareja por irritabilidad.',
  'Indica que pudo aplicar las técnicas de respiración durante un episodio de ansiedad. Refiere sentirse más en control.',
  'Paciente llega con afecto aplanado. Menciona que no tiene motivación para actividades que antes disfrutaba.',
  'Reporta una semana difícil. Tuvo un conflicto con un compañero de trabajo que detonó pensamientos negativos recurrentes.',
  'Se muestra optimista. Menciona que empezó a hacer ejercicio 3 veces por semana como se acordó.',
  'Refiere episodio de pánico el miércoles pasado en el supermercado. Duración aproximada: 20 minutos.',
  'Paciente indica que la relación con sus padres ha mejorado desde que estableció límites claros.',
  'Menciona dificultad para concentrarse en el trabajo. Se distrae con facilidad y olvida tareas importantes.',
  'Reporta que los pensamientos intrusivos han disminuido en frecuencia desde la última sesión.',
];

const SOAP_OBJECTIVE = [
  'Paciente llega puntual, vestimenta apropiada. Contacto visual adecuado. Afecto congruente.',
  'Apariencia cuidada. Se observa inquietud psicomotriz. Habla rápida. Llanto contenido al hablar de su infancia.',
  'Paciente alerta, orientado en tiempo, lugar y persona. Afecto reactivo. No se observan signos de ideación suicida.',
  'Postura encorvada, mirada baja. Respuestas monosilábicas al inicio. Se fue abriendo durante la sesión.',
  'Se presenta con energía notablemente más alta que en sesiones anteriores. Sonrisa espontánea.',
  'Signos vitales estables. Paciente refiere estar durmiendo 8 horas. Ánimo mejorado respecto a las últimas 3 sesiones.',
  'Se observa tensión muscular en hombros y mandíbula. Manos inquietas durante toda la sesión.',
  'Lenguaje coherente y fluido. Capacidad de introspección adecuada. Expresa emociones sin dificultad.',
];

const SOAP_ASSESSMENT = [
  'Se observa progreso en el manejo de la ansiedad. PCL-5 score disminuyó de 42 a 35.',
  'Continúa con sintomatología depresiva moderada. PHQ-9: 14 (descenso de 2 puntos).',
  'Adherencia parcial al plan terapéutico. Necesita reforzar técnicas de regulación emocional.',
  'Mejoría significativa en habilidades sociales. Paciente reporta menos evitación.',
  'Cogniciones distorsionadas persisten: catastrofización y pensamiento dicotómico.',
  'Buen avance en reestructuración cognitiva. Paciente identifica pensamientos automáticos.',
  'Estancamiento terapéutico. Evaluar ajuste de estrategia para próxima sesión.',
  'Se alcanzaron dos de los tres objetivos terapéuticos planteados esta semana.',
];

const SOAP_PLAN = [
  'Continuar con TCC. Tarea: Registro de pensamientos automáticos 3x/semana. Próxima sesión en 1 semana.',
  'Mantener ejercicio de respiración diafragmática 2x/día. Iniciar diario de gratitud. Evaluar referencia a psiquiatría.',
  'Ejercicio de exposición gradual: visitar centro comercial 15 min esta semana. Registro de ansiedad (SUDS).',
  'Asignar técnica de activación conductual. Programar 3 actividades placenteras esta semana.',
  'Practicar comunicación asertiva con ejercicio de role-play. Registrar situaciones de conflicto.',
  'Incrementar frecuencia de mindfulness a 10 min/día. Revisar patrón de sueño con app de tracking.',
  'Referir a evaluación psiquiátrica para valorar medicación co-adyuvante. Mantener sesiones semanales.',
  'Tarea de reestructuración: Completar hoja de registro A-B-C para 5 situaciones. Próxima sesión: jueves.',
];

const FREE_NOTE_BODIES = [
  'Primera sesión. Paciente acude por derivación médica. Presenta sintomatología ansiosa de aproximadamente 6 meses de evolución. Se establece el rapport inicial y se realiza la historia clínica. Se acuerda formato de sesiones semanales de 50 minutos. Objetivos iniciales: reducir frecuencia de ataques de pánico, mejorar calidad de sueño, desarrollar herramientas de afrontamiento.',
  'Sesión enfocada en psicoeducación sobre el modelo cognitivo-conductual. Se explicó la relación pensamiento-emoción-conducta. Paciente se mostró receptivo/a y participativo/a. Se asignó como tarea completar el inventario de Beck (BDI-II) para la próxima sesión.',
  'Se trabajó restructuración cognitiva sobre la creencia "si no soy perfecto/a, soy un fracaso". Paciente identificó varias situaciones donde este patrón se activa. Se utilizó la técnica de flecha descendente para llegar a la creencia nuclear. Avance notable en insight.',
  'Sesión de seguimiento. Paciente reporta haber completado el registro de pensamientos durante la semana. Se revisaron 4 entradas y se modeló el proceso de disputa. Ánimo general mejorado. Se refuerza el compromiso terapéutico.',
  'Se realizó ejercicio de relajación muscular progresiva de Jacobson (versión abreviada, 7 grupos musculares). Paciente logró alcanzar niveles de relajación satisfactorios. Se le proporcionó audio guiado para práctica en casa.',
];

const CLINICAL_CONTEXTS = [
  'Paciente con antecedentes de ansiedad desde la adolescencia. Actualmente en tratamiento TCC. Ha mostrado buena respuesta a técnicas de reestructuración cognitiva. Sin medicación actual.',
  'Paciente referido por médico de cabecera por sintomatología depresiva de 3 meses de evolución. Antecedentes familiares de depresión (madre). Primera vez en terapia psicológica.',
  'Paciente con diagnóstico previo de TDAH. Busca apoyo para manejo de organización y productividad laboral. Utiliza medicación prescrita por psiquiatra (metilfenidato 20mg).',
  'Paciente en proceso de duelo por fallecimiento de padre hace 4 meses. Presenta dificultades para retomar rutina diaria. Red de apoyo limitada.',
  'Paciente con historial de relaciones interpersonales conflictivas. Patrón de dependencia emocional identificado. En proceso de establecer límites saludables.',
  'Paciente con estrés laboral crónico. Trabaja más de 60 horas semanales. Presenta insomnio de conciliación y bruxismo nocturno. Sin antecedentes psiquiátricos.',
  'Paciente con fobia social que interfiere con su desarrollo profesional. Evita presentaciones y reuniones. Inicio de exposición gradual en curso.',
  'Paciente con trauma infantil no resuelto. Se trabaja con enfoque integrativo (TCC + EMDR). Progreso lento pero sostenido. Maneja bien la regulación emocional.',
  'Paciente con crisis de identidad post-divorcio. Presenta ansiedad situacional y baja autoestima. Ha respondido bien a técnicas de activación conductual.',
  'Paciente adolescente (17 años) con dificultades académicas y conflictos familiares. Padres divorciados. Se trabaja con enfoque sistémico. Sesiones alternas con padres.',
];

const APPOINTMENT_REASONS = [
  'Sesión de seguimiento semanal — continuar trabajo de reestructuración cognitiva',
  'Revisión de tareas terapéuticas y ajuste de plan de tratamiento',
  'Sesión de crisis — episodio de ansiedad aguda reportado por teléfono',
  'Evaluación inicial — primera consulta, historia clínica completa',
  'Sesión de seguimiento — revisar progreso en exposición gradual',
  'Aplicación de pruebas psicométricas (BDI-II, BAI)',
  'Sesión de cierre de fase terapéutica — evaluación de objetivos alcanzados',
  'Sesión familiar — trabajo con dinámica familiar y comunicación',
  'Revisión de medicación con informe para psiquiatra tratante',
  'Sesión de seguimiento — técnicas de manejo de estrés laboral',
  'Sesión de psicoeducación — modelo cognitivo-conductual',
  'Trabajo de procesamiento emocional — duelo y pérdida',
];

const ACCESS_LOG_DETAILS = [
  'Consulta de expediente clínico para preparar sesión programada',
  'Revisión de historial de notas clínicas del paciente',
  'Actualización de datos de contacto del paciente',
  'Registro de nueva cita desde el calendario de agenda',
  'Consulta de línea de tiempo para evaluar progreso terapéutico',
  'Creación de nota clínica post-sesión',
  'Revisión de estado de pagos pendientes del paciente',
  'Actualización de diagnóstico en el expediente',
  'Descarga de resumen clínico para referencia externa',
  'Verificación de disponibilidad para reprogramar cita',
];

const PRIVATE_NOTES = [
  'Monitorear posible ideación suicida pasiva. No hay plan ni intención, pero menciona "a veces no le ve sentido a nada." Mantener vigilancia.',
  'Nota: Posible conflicto con la madre no resuelto que interfiere con el proceso. Explorar con cuidado en próximas sesiones.',
  'El paciente mostró resistencia al hablar del abuso reportado. No forzar. Respetar el ritmo.',
  'Considerar derivación a psiquiatría si no hay mejoría en las próximas 2 sesiones. Sintomatología no cede con TCC sola.',
  'Dinámica familiar compleja. El padre parece ser un factor de mantenimiento del cuadro ansioso.',
  null,
  null,
  null,
];

const NOTE_TAGS = [
  ['ansiedad', 'sueño', 'respiración'],
  ['depresión', 'motivación', 'activación-conductual'],
  ['TDAH', 'concentración', 'productividad'],
  ['estrés', 'trabajo', 'límites'],
  ['pánico', 'exposición', 'SUDS'],
  ['autoestima', 'reestructuración', 'creencias-nucleares'],
  ['duelo', 'procesamiento', 'pérdida'],
  ['relaciones', 'asertividad', 'comunicación'],
  ['sueño', 'higiene-del-sueño', 'relajación'],
  ['trauma', 'procesamiento', 'EMDR'],
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function randomStatus(): 'ACTIVE' | 'WAITLIST' {
  return Math.random() > 0.2 ? 'ACTIVE' : 'WAITLIST';
}

function generateMexicanPhone(): string {
  const areaCodes = ['55', '33', '81', '442', '222', '614', '656', '664', '998', '999'];
  const areaCode = faker.helpers.arrayElement(areaCodes);
  const remaining = 10 - areaCode.length;
  const digits = Array.from({ length: remaining }, () => faker.number.int({ min: 0, max: 9 })).join('');
  return `+52 ${areaCode} ${digits.slice(0, 4)} ${digits.slice(4)}`;
}

function generateEmergencyContact(): object {
  return {
    name: faker.person.fullName(),
    relationship: faker.helpers.arrayElement([
      'Esposo/a',
      'Padre/Madre',
      'Hermano/a',
      'Amigo/a',
      'Hijo/a',
    ]),
    phone: generateMexicanPhone(),
  };
}

function getRandomTimeSlot(
  baseDate: Date,
  slotIndex: number,
): { start: Date; end: Date } {
  const startHour = 9 + slotIndex;
  const start = new Date(baseDate);
  start.setHours(startHour, 0, 0, 0);

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 50);

  return { start, end };
}

function generateSOAPContent() {
  return {
    s: faker.helpers.arrayElement(SOAP_SUBJECTIVE),
    o: faker.helpers.arrayElement(SOAP_OBJECTIVE),
    a: faker.helpers.arrayElement(SOAP_ASSESSMENT),
    p: faker.helpers.arrayElement(SOAP_PLAN),
  };
}

function generateFreeContent() {
  return {
    body: faker.helpers.arrayElement(FREE_NOTE_BODIES),
  };
}

// ============================================
// SEED FUNCTIONS
// ============================================

async function clearDatabase(): Promise<void> {
  console.log('🗑️  Clearing existing data...');

  await prisma.refreshToken.deleteMany();
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

  const clinicians: { id: string; userId: string; type: 'PSYCHOLOGIST' }[] = [];

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
        contactPhone: encryptionService.encrypt(generateMexicanPhone()),
        emergencyContact: encryptionService.encrypt(JSON.stringify(generateEmergencyContact())),
        diagnosis: (() => { const d = faker.helpers.arrayElement(DIAGNOSES); return d ? encryptionService.encrypt(d) : null; })(),
        clinicalContext: encryptionService.encrypt(faker.helpers.arrayElement(CLINICAL_CONTEXTS)),
        dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      },
    });
    patientIds.push(patient.id);
  }

  return patientIds;
}

// ============================================
// PAST APPOINTMENTS + PSYCH NOTES (Clinical History)
// ============================================

async function createClinicalHistory(
  clinicianId: string,
  patientIds: string[],
  defaultPrice: number,
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let notesCreated = 0;
  let pastAppointments = 0;

  console.log(`📜 Creating clinical history (${PAST_WEEKS} weeks of past sessions)...`);

  for (let week = 1; week <= PAST_WEEKS; week++) {
    // Each patient has ~1 session per week (realistic for therapy)
    for (const patientId of patientIds) {
      // Not every patient has a session every single week (70% chance)
      if (Math.random() > 0.7) continue;

      // Pick a random weekday in that week
      const dayOffset = -(week * 7) + faker.number.int({ min: 0, max: 4 }); // Mon-Fri
      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() + dayOffset);

      // Skip weekends
      if (sessionDate.getDay() === 0 || sessionDate.getDay() === 6) continue;

      const slotIndex = faker.number.int({ min: 0, max: 5 });
      const { start, end } = getRandomTimeSlot(sessionDate, slotIndex);

      // Most past appointments are COMPLETED, some NO_SHOW or CANCELLED
      const status = faker.helpers.weightedArrayElement([
        { weight: 0.80, value: AppointmentStatus.COMPLETED },
        { weight: 0.10, value: AppointmentStatus.CANCELLED },
        { weight: 0.10, value: AppointmentStatus.NO_SHOW },
      ]);

      // Payment: completed sessions are mostly paid
      const paymentStatus = status === AppointmentStatus.COMPLETED
        ? faker.helpers.weightedArrayElement([
          { weight: 0.75, value: PaymentStatus.PAID },
          { weight: 0.25, value: PaymentStatus.PENDING }, // Some have debt
        ])
        : PaymentStatus.PENDING;

      const paymentMethod = paymentStatus === PaymentStatus.PAID
        ? faker.helpers.arrayElement(['CASH', 'CARD', 'TRANSFER'] as const)
        : null;

      const appointment = await prisma.appointment.create({
        data: {
          patientId,
          clinicianId,
          startTime: start,
          endTime: end,
          type: faker.helpers.arrayElement(Object.values(AppointmentType)),
          status,
          paymentStatus,
          paymentMethod,
          price: defaultPrice,
          reason: faker.helpers.arrayElement(APPOINTMENT_REASONS),
          notes: status === AppointmentStatus.COMPLETED
            ? faker.helpers.maybe(() => faker.helpers.arrayElement(APPOINTMENT_REASONS), { probability: 0.3 }) ?? null
            : null,
        },
      });

      pastAppointments++;

      // Create PsychNote only for COMPLETED appointments (clinical notes)
      if (status === AppointmentStatus.COMPLETED) {
        const templateType = faker.helpers.weightedArrayElement([
          { weight: 0.55, value: NoteTemplateType.SOAP },
          { weight: 0.25, value: NoteTemplateType.FREE },
          { weight: 0.10, value: NoteTemplateType.INITIAL },
          { weight: 0.10, value: NoteTemplateType.CBT },
        ]);

        // Build content based on the template type
        const content = templateType === NoteTemplateType.SOAP
          ? generateSOAPContent()
          : generateFreeContent();

        // Mood rating (1-10, some sessions might not have it)
        const moodRating = faker.helpers.maybe(
          () => faker.number.int({ min: 2, max: 9 }),
          { probability: 0.75 },
        ) ?? null;

        // Private notes (encrypted) — ~30% of sessions
        const rawPrivateNote = faker.helpers.arrayElement(PRIVATE_NOTES);
        const encryptedPrivateNote = rawPrivateNote
          ? encryptionService.encrypt(rawPrivateNote)
          : null;

        // Tags — ~60% of sessions have tags
        const tags = faker.helpers.maybe(
          () => faker.helpers.arrayElement(NOTE_TAGS),
          { probability: 0.6 },
        ) ?? [];

        // Pin some important notes (~10%)
        const isPinned = Math.random() < 0.1;

        await prisma.psychNote.create({
          data: {
            appointmentId: appointment.id,
            patientId,
            templateType,
            content,
            moodRating,
            privateNotes: encryptedPrivateNote,
            isPinned,
            tags,
          },
        });

        notesCreated++;
      }

      // Finance transaction for paid appointments
      if (paymentStatus === PaymentStatus.PAID) {
        await prisma.financeTransaction.create({
          data: {
            clinicianId,
            appointmentId: appointment.id,
            type: TransactionType.INCOME,
            category: 'Consulta',
            amount: defaultPrice,
            description: `Pago por sesión del ${start.toLocaleDateString('es-MX')}`,
            date: start,
          },
        });
      }
    }
  }

  console.log(`  ✓ ${pastAppointments} past appointments created`);
  console.log(`  ✓ ${notesCreated} clinical notes (PsychNotes) created`);
}

// ============================================
// FUTURE APPOINTMENTS (Agenda)
// ============================================

async function createFutureAppointments(
  clinicianId: string,
  patientIds: string[],
  defaultPrice: number,
): Promise<void> {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);

  console.log(`📅 Scheduling future appointments (${FUTURE_DAYS_WINDOW} days)...`);

  for (let d = 0; d < FUTURE_DAYS_WINDOW; d++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + d);

    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;

    for (let i = 0; i < APPOINTMENTS_PER_DAY; i++) {
      const { start, end } = getRandomTimeSlot(currentDate, i);
      const patientId = faker.helpers.arrayElement(patientIds);

      const type = faker.helpers.arrayElement(Object.values(AppointmentType));
      const status = faker.helpers.weightedArrayElement([
        { weight: 0.85, value: AppointmentStatus.SCHEDULED },
        { weight: 0.15, value: AppointmentStatus.CANCELLED },
      ]);

      const paymentStatus = faker.helpers.weightedArrayElement([
        { weight: 0.9, value: PaymentStatus.PENDING },
        { weight: 0.1, value: PaymentStatus.PAID },
      ]);

      const appointment = await prisma.appointment.create({
        data: {
          patientId,
          clinicianId,
          startTime: start,
          endTime: end,
          type,
          status,
          paymentStatus,
          price: defaultPrice,
          reason: faker.helpers.arrayElement(APPOINTMENT_REASONS),
          notes: null,
        },
      });

      if (paymentStatus === PaymentStatus.PAID) {
        await prisma.financeTransaction.create({
          data: {
            clinicianId,
            appointmentId: appointment.id,
            type: TransactionType.INCOME,
            category: 'Consulta',
            amount: defaultPrice,
            description: `Pre-pago para sesión del ${start.toLocaleDateString('es-MX')}`,
            date: start,
          },
        });
      }
    }
  }
}

async function createTasksForPatients(patientIds: string[]): Promise<void> {
  console.log('✅ Creating tasks...');
  const today = new Date();

  for (const patientId of patientIds) {
    const taskCount = faker.number.int({ min: 1, max: 4 });
    for (let i = 0; i < taskCount; i++) {
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + faker.number.int({ min: -3, max: 14 }));

      await prisma.task.create({
        data: {
          patientId,
          description: faker.helpers.arrayElement([
            'Completar registro de pensamientos automáticos',
            'Practicar respiración diafragmática 2x/día',
            'Escribir 3 entradas en el diario de gratitud',
            'Ejercicio de exposición gradual: 15 min en lugar concurrido',
            'Practicar relajación muscular progresiva antes de dormir',
            'Completar hoja de registro A-B-C para 5 situaciones',
            'Realizar 30 min de ejercicio aeróbico 3x esta semana',
            'Leer capítulo asignado del libro de autoayuda',
            'Registrar horas de sueño y calidad cada mañana',
            'Practicar técnica de mindfulness 10 min/día',
          ]),
          isCompleted: faker.datatype.boolean(0.3),
          dueDate,
        },
      });
    }
  }
}

async function createAccessLogs(userId: string, patientIds: string[]): Promise<void> {
  console.log('🔒 Creating access logs...');
  for (let i = 0; i < 30; i++) {
    const daysAgo = faker.number.int({ min: 0, max: 14 });
    const logDate = new Date();
    logDate.setDate(logDate.getDate() - daysAgo);

    await prisma.accessLog.create({
      data: {
        userId,
        patientId: faker.helpers.arrayElement(patientIds),
        action: faker.helpers.arrayElement([
          'VIEW_PROFILE',
          'VIEW_TIMELINE',
          'CREATE_APPOINTMENT',
          'UPDATE_NOTE',
          'VIEW_PATIENT',
        ]),
        resource: 'patient',
        details: faker.helpers.arrayElement(ACCESS_LOG_DETAILS),
        ipAddress: faker.internet.ipv4(),
        userAgent: faker.internet.userAgent(),
        createdAt: logDate,
      },
    });
  }
}

async function createExpenses(clinicianId: string): Promise<void> {
  console.log('💸 Creating expenses...');

  for (let i = 0; i < 8; i++) {
    const daysAgo = faker.number.int({ min: 1, max: 56 }); // up to 8 weeks back
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    await prisma.financeTransaction.create({
      data: {
        clinicianId,
        type: TransactionType.EXPENSE,
        category: faker.helpers.arrayElement([
          'Renta de consultorio',
          'Suscripción de software',
          'Material de oficina',
          'Capacitación profesional',
          'Seguro profesional',
        ]),
        amount: faker.number.float({ min: 30, max: 500, fractionDigits: 2 }),
        description: faker.helpers.arrayElement([
          'Pago mensual de renta',
          'Licencia anual de plataforma clínica',
          'Compra de papelería y materiales',
          'Taller de actualización en TCC',
          'Póliza de responsabilidad civil',
          'Pago de servicios (luz, internet)',
        ]),
        date,
      },
    });
  }
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main(): Promise<void> {
  console.log('🌱 Starting database seed (8 weeks past + 2 weeks future)...\n');

  await clearDatabase();

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);
  const clinicians = await createClinicians(passwordHash);

  console.log('\n👥 Creating patients, clinical history, and agenda...');

  for (const clinician of clinicians) {
    const patientIds = await createPatientsForClinician(clinician.id);
    console.log(`  ✓ Created ${patientIds.length} patients for ${clinician.type}`);

    const config = CLINICIANS_CONFIG.find((c) => c.type === clinician.type);
    const defaultPrice = config?.sessionDefaultPrice ?? 100;

    // Past: Clinical history with notes
    await createClinicalHistory(clinician.id, patientIds, defaultPrice);

    // Future: Upcoming agenda
    await createFutureAppointments(clinician.id, patientIds, defaultPrice);

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
  console.log(`  • PsychNotes: ${await prisma.psychNote.count()}`);
  console.log(`  • Tasks: ${await prisma.task.count()}`);
  console.log(`  • Access Logs: ${await prisma.accessLog.count()}`);
  console.log(`  • Finance Transactions: ${await prisma.financeTransaction.count()}`);

  console.log('\n✅ Seed completed successfully!');
  console.log('  • Psychologist: psych@kio.com (password from SEED_PASSWORD env var)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
