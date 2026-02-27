const fs = require('fs');

function fixFile(path) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(/import\s+\{\s*EncryptionService\s*\}\s+from\s+'[^']+encryption';/g, "import { EncryptionService } from '../lib/encryption.service';");
    content = content.replace(/constructor\(\s*private\s+readonly\s+prisma:\s+PrismaService\s*\)\s*\{[^\}]*\}/g, 'constructor(private readonly prisma: PrismaService, private readonly encryptionService: EncryptionService) {}');
    content = content.replace(/EncryptionService\.encrypt/g, 'this.encryptionService.encrypt');
    content = content.replace(/EncryptionService\.decrypt/g, 'this.encryptionService.decrypt');
    fs.writeFileSync(path, content);
}

fixFile('apps/api/src/patients/patients.service.ts');
fixFile('apps/api/src/appointments/appointments.service.ts');

console.log('Fixed DI');
