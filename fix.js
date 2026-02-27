const fs = require('fs');

function fixAppointmentsController() {
    let content = fs.readFileSync('apps/api/src/appointments/appointments.controller.ts', 'utf8');
    content = content.replace(/@CurrentUser\(\) user: \{ userId: string; email: string; role: string \},/g, '@CurrentUser() user: any,\n    @CurrentClinician() clinicianId: string,');
    content = content.replace(/user\.userId/g, 'clinicianId');
    content = content.replace(/import \{ CurrentUser \} from '\.\.\/auth\/decorators\/current-user\.decorator';/, "import { CurrentUser } from '../auth/decorators/current-user.decorator';\nimport { CurrentClinician } from '../auth/decorators/current-clinician.decorator';");
    fs.writeFileSync('apps/api/src/appointments/appointments.controller.ts', content);
}

function fixAppointmentsService() {
    let content = fs.readFileSync('apps/api/src/appointments/appointments.service.ts', 'utf8');
    content = content.replace(/userId: string/g, 'clinicianId: string');
    content = content.replace(/const profile = await this\.resolveClinicianProfile\(clinicianId\);\s*/g, '');
    content = content.replace(/profile\.id/g, 'clinicianId');
    content = content.replace(/\s*private async resolveClinicianProfile[\s\S]*?throw new UnauthorizedException\('Clinician profile not found'\);[\s\S]*?\}[\s\S]*?\}/, '}');
    fs.writeFileSync('apps/api/src/appointments/appointments.service.ts', content);
}

function fixFinanceService() {
    let content = fs.readFileSync('apps/api/src/finance/finance.service.ts', 'utf8');
    content = content.replace(/\s*private async resolveClinicianProfile[\s\S]*?throw new UnauthorizedException\('Clinician profile not found'\);[\s\S]*?\}[\s\S]*?\}/, '}');
    fs.writeFileSync('apps/api/src/finance/finance.service.ts', content);
}

fixAppointmentsController();
fixAppointmentsService();
fixFinanceService();

console.log('Fixed appointments and finance files');
