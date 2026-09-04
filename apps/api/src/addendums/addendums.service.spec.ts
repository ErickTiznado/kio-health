import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AddendumService } from './addendums.service';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../lib/encryption.service';
import { createPrismaMock, type PrismaMock } from '../test/prisma-mock';

const CLINICIAN_A = 'clinician-a-uuid';
const CLINICIAN_B = 'clinician-b-uuid';
const APPOINTMENT_OF_B = 'appointment-of-b-uuid';
const USER_A = 'user-a-uuid';

describe('AddendumService (ownership)', () => {
  let service: AddendumService;
  let prisma: PrismaMock;

  const encryptionMock = {
    encrypt: jest.fn((v: string) => `enc(${v})`),
    decrypt: jest.fn((v: string) => `dec(${v})`),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddendumService,
        { provide: PrismaService, useValue: prisma },
        { provide: EncryptionService, useValue: encryptionMock },
      ],
    }).compile();

    service = module.get<AddendumService>(AddendumService);
  });

  describe('createAddendum', () => {
    it('rechaza crear un anexo en la cita de otro clínico', async () => {
      prisma.appointment.findFirst.mockResolvedValue(null);

      await expect(
        service.createAddendum(CLINICIAN_A, APPOINTMENT_OF_B, USER_A, {
          content: 'contenido',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.appointment.findFirst).toHaveBeenCalledWith({
        where: { id: APPOINTMENT_OF_B, clinicianId: CLINICIAN_A },
      });
      expect(prisma.psychNoteAddendum.create).not.toHaveBeenCalled();
    });

    it('rechaza anexos fuera de la ventana de 30 días', async () => {
      const oldEnd = new Date();
      oldEnd.setDate(oldEnd.getDate() - 31);
      prisma.appointment.findFirst.mockResolvedValue({
        id: 'appt-1',
        patientId: 'patient-1',
        endTime: oldEnd,
      });

      await expect(
        service.createAddendum(CLINICIAN_B, 'appt-1', USER_A, {
          content: 'tarde',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(prisma.psychNoteAddendum.create).not.toHaveBeenCalled();
    });

    it('crea el anexo cifrado en una cita propia dentro de la ventana', async () => {
      const recentEnd = new Date();
      recentEnd.setDate(recentEnd.getDate() - 2);
      prisma.appointment.findFirst.mockResolvedValue({
        id: 'appt-1',
        patientId: 'patient-1',
        endTime: recentEnd,
      });
      prisma.psychNoteAddendum.create.mockResolvedValue({ id: 'add-1' });

      await service.createAddendum(CLINICIAN_B, 'appt-1', USER_A, {
        content: 'contenido',
        privateNotes: 'privado',
      });

      expect(prisma.psychNoteAddendum.create).toHaveBeenCalledWith({
        data: {
          appointmentId: 'appt-1',
          patientId: 'patient-1',
          content: 'enc(contenido)',
          privateNotes: 'enc(privado)',
          createdBy: USER_A,
          type: 'ADDENDUM',
        },
      });
    });
  });

  describe('getAddendums', () => {
    it('filtra por clinicianId a nivel de query', async () => {
      prisma.psychNoteAddendum.findMany.mockResolvedValue([]);

      await service.getAddendums(CLINICIAN_A, APPOINTMENT_OF_B);

      expect(prisma.psychNoteAddendum.findMany).toHaveBeenCalledWith({
        where: {
          appointmentId: APPOINTMENT_OF_B,
          patient: { clinicianId: CLINICIAN_A },
        },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('getAddendum', () => {
    it('un anexo ajeno simplemente no se encuentra', async () => {
      prisma.psychNoteAddendum.findFirst.mockResolvedValue(null);

      await expect(
        service.getAddendum(CLINICIAN_A, 'addendum-of-b'),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.psychNoteAddendum.findFirst).toHaveBeenCalledWith({
        where: { id: 'addendum-of-b', patient: { clinicianId: CLINICIAN_A } },
      });
    });

    it('descifra content y privateNotes de un anexo propio', async () => {
      prisma.psychNoteAddendum.findFirst.mockResolvedValue({
        id: 'add-1',
        content: 'ciphertext',
        privateNotes: 'ciphertext2',
      });

      const result = (await service.getAddendum(CLINICIAN_B, 'add-1')) as {
        content: string;
        privateNotes: string | null;
      };

      expect(result.content).toBe('dec(ciphertext)');
      expect(result.privateNotes).toBe('dec(ciphertext2)');
    });
  });
});
