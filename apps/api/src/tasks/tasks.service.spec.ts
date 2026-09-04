import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, type PrismaMock } from '../test/prisma-mock';

const CLINICIAN_A = 'clinician-a-uuid';
const CLINICIAN_B = 'clinician-b-uuid';
const PATIENT_OF_B = 'patient-of-b-uuid';
const TASK_OF_B = 'task-of-b-uuid';

describe('TasksService (ownership)', () => {
  let service: TasksService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  describe('create', () => {
    it('rechaza crear una tarea para un paciente de otro clínico', async () => {
      prisma.patient.findFirst.mockResolvedValue(null);

      await expect(
        service.create(CLINICIAN_A, PATIENT_OF_B, { description: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.patient.findFirst).toHaveBeenCalledWith({
        where: { id: PATIENT_OF_B, clinicianId: CLINICIAN_A },
        select: { id: true },
      });
      expect(prisma.task.create).not.toHaveBeenCalled();
    });

    it('crea la tarea cuando el paciente es del clínico', async () => {
      prisma.patient.findFirst.mockResolvedValue({ id: 'own-patient' });
      prisma.task.create.mockResolvedValue({ id: 'task-1' });

      await service.create(CLINICIAN_B, 'own-patient', {
        description: 'Registro de pensamientos',
        dueDate: '2026-08-15',
      });

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          patientId: 'own-patient',
          description: 'Registro de pensamientos',
          dueDate: new Date('2026-08-15'),
        },
      });
    });
  });

  describe('findAll', () => {
    it('filtra por clinicianId a nivel de query', async () => {
      prisma.task.findMany.mockResolvedValue([]);

      await service.findAll(CLINICIAN_A, PATIENT_OF_B);

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {
          patientId: PATIENT_OF_B,
          patient: { clinicianId: CLINICIAN_A },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('update', () => {
    it('rechaza editar la tarea de un paciente ajeno', async () => {
      prisma.task.findFirst.mockResolvedValue(null);

      await expect(
        service.update(CLINICIAN_A, TASK_OF_B, { isCompleted: true }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: TASK_OF_B, patient: { clinicianId: CLINICIAN_A } },
        select: { id: true },
      });
      expect(prisma.task.update).not.toHaveBeenCalled();
    });

    it('edita cuando la tarea pertenece a un paciente propio', async () => {
      prisma.task.findFirst.mockResolvedValue({ id: 'task-1' });
      prisma.task.update.mockResolvedValue({ id: 'task-1' });

      await service.update(CLINICIAN_B, 'task-1', { isCompleted: true });

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: { isCompleted: true },
      });
    });

    it('ignora campos no declarados en el DTO', async () => {
      prisma.task.findFirst.mockResolvedValue({ id: 'task-1' });
      prisma.task.update.mockResolvedValue({ id: 'task-1' });

      // El ValidationPipe global no lleva `whitelist: true`, así que un body
      // con campos extra llega hasta aquí: el service los descarta.
      await service.update(CLINICIAN_B, 'task-1', {
        isCompleted: true,
        patientId: 'patient-of-someone-else',
        id: 'otro-id',
      } as never);

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: { isCompleted: true },
      });
    });
  });

  describe('remove', () => {
    it('rechaza borrar la tarea de un paciente ajeno', async () => {
      prisma.task.findFirst.mockResolvedValue(null);

      await expect(
        service.remove(CLINICIAN_A, TASK_OF_B),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.task.delete).not.toHaveBeenCalled();
    });
  });
});
