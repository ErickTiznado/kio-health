import { PrismaClient } from './generated/client';
import { PatientsService } from '../src/patients/patients.service';
import { EncryptionService } from '../src/lib/encryption.service';

const prisma = new PrismaClient();
const encryptionService = new EncryptionService();
const patientsService = new PatientsService(prisma as any, encryptionService as any);

async function main() {
  const clinician = await prisma.user.findFirst({
    where: { role: 'CLINICIAN' },
    include: { profile: true },
  });

  if (!clinician?.profile) {
    console.error('No clinician found');
    return;
  }

  const result = await patientsService.findAll(clinician.profile.id, { limit: 50 });
  const withFlags = result.data.filter(p => p.riskFlag);
  
  console.log(`Found ${withFlags.length} patients with risk flags out of ${result.data.length}`);
  
  if (withFlags.length > 0) {
    console.log('Sample risk flag:', JSON.stringify(withFlags[0].riskFlag, null, 2));
  }
}

main().finally(() => prisma.$disconnect());