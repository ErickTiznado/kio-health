import { ExportService } from './export.service';
import { randomUUID } from 'crypto';

/**
 * Tests para ExportService.generateSessionPdf
 *
 * El servicio recibe un appointment completo (con relaciones) y retorna un Buffer PDF.
 * No depende de Prisma — toda la lógica es de generación de documento.
 */
describe('ExportService', () => {
  let service: ExportService;

  const makeAppointmentData = (overrides: Record<string, unknown> = {}) => ({
    id: randomUUID(),
    patientId: randomUUID(),
    clinicianId: randomUUID(),
    startTime: new Date('2026-05-15T10:00:00Z'),
    endTime: new Date('2026-05-15T10:50:00Z'),
    status: 'COMPLETED',
    type: 'CONSULTATION',
    paymentStatus: 'PAID',
    paymentMethod: 'CASH',
    price: 1000,
    reason: 'Seguimiento mensual',
    notes: null,
    googleEventId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: {
      id: randomUUID(),
      fullName: 'Paciente de Prueba',
      dateOfBirth: null,
      diagnosis: null,
      clinicalContext: null,
      contactPhone: null,
      emergencyContact: null,
      status: 'ACTIVE',
    },
    clinician: {
      id: randomUUID(),
      type: 'PSYCHOLOGIST',
      licenseNumber: 'LIC-12345',
      currency: 'MXN',
      sessionDefaultPrice: 1000,
      user: {
        id: randomUUID(),
        email: 'doctor@test.com',
        fullName: 'Dr. Test Profesional',
      },
    },
    psychNote: null,
    ...overrides,
  });

  beforeEach(() => {
    service = new ExportService();
  });

  // ── generateSessionPdf ─────────────────────────────────────────────────────

  describe('generateSessionPdf()', () => {
    it('retorna un Buffer válido (PDF header %PDF)', async () => {
      const appointment = makeAppointmentData();
      const buffer = await service.generateSessionPdf(
        appointment as any,
        false,
      );

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      // Todos los PDFs empiezan con el magic bytes %PDF
      expect(buffer.slice(0, 4).toString()).toBe('%PDF');
    }, 10000);

    it('genera PDF sin nota clínica (appointment sin psychNote)', async () => {
      const appointment = makeAppointmentData({ psychNote: null });
      const buffer = await service.generateSessionPdf(
        appointment as any,
        false,
      );
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.slice(0, 4).toString()).toBe('%PDF');
    }, 10000);

    it('genera PDF con nota SOAP (sin notas privadas cuando includePrivateNotes=false)', async () => {
      const appointment = makeAppointmentData({
        psychNote: {
          id: randomUUID(),
          template: 'SOAP',
          content: {
            s: 'Subjetivo de prueba',
            o: 'Objetivo de prueba',
            a: 'Análisis de prueba',
            p: 'Plan de prueba',
          },
          privateNotes: null, // ya viene nulo (el controller lo omite si includePrivate=false)
          isPinned: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const buffer = await service.generateSessionPdf(
        appointment as any,
        false,
      );
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.slice(0, 4).toString()).toBe('%PDF');
    }, 10000);

    it('genera PDF con tipo EVALUATION correctamente', async () => {
      const appointment = makeAppointmentData({ type: 'EVALUATION' });
      const buffer = await service.generateSessionPdf(
        appointment as any,
        false,
      );
      expect(buffer).toBeInstanceOf(Buffer);
    }, 10000);
  });
});
