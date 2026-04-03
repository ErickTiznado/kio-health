import { PrismaClient } from './generated/client';
import { RiskFlagsService } from '../src/risk-flags/risk-flags.service';

const prisma = new PrismaClient();

// A lightweight mock of RiskFlagsService just to use its calculation logic without full NestJS DI
class StandaloneRiskFlagsService extends RiskFlagsService {
  constructor() {
    super(prisma as any);
  }
}

async function main() {
  console.log('Starting risk flags backfill...');
  const riskFlagsService = new StandaloneRiskFlagsService();

  const patients = await prisma.patient.findMany({
    select: { id: true },
  });

  console.log(`Found ${patients.length} patients to process.`);

  let processed = 0;
  let updated = 0;

  for (const patient of patients) {
    // Get all completed appointments for this patient with their notes and scales
    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        status: 'COMPLETED',
      },
      include: {
        psychNote: true,
        clinicalScales: true,
      },
      orderBy: { startTime: 'asc' },
    });

    if (appointments.length === 0) {
      processed++;
      continue;
    }

    // Since we want the latest state, we should calculate risk flags iteratively
    // to catch things like SUDDEN_DETERIORATION, but for backfill it's usually 
    // enough to just look at the most recent note and scales.
    
    // We will simulate the chronological evaluation
    let previousPhq9Score: number | undefined;
    let finalFlags: any[] = [];

    for (const apt of appointments) {
      const phq9Score = apt.clinicalScales.find((s) => s.scaleType === 'PHQ9')?.totalScore;
      const gad7Score = apt.clinicalScales.find((s) => s.scaleType === 'GAD7')?.totalScore;
      const tags = apt.psychNote?.tags || [];

      finalFlags = await riskFlagsService.calculateRiskFlags({
        patientId: patient.id,
        phq9Score,
        gad7Score,
        tags,
        previousPhq9Score,
      });

      if (phq9Score !== undefined) {
        previousPhq9Score = phq9Score;
      }
    }

    if (finalFlags.length > 0) {
      await riskFlagsService.updateRiskFlags(patient.id, finalFlags);
      updated++;
    }

    processed++;
    if (processed % 10 === 0) {
      console.log(`Processed ${processed}/${patients.length}...`);
    }
  }

  console.log(`Backfill complete. Updated ${updated} patients with risk flags.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
