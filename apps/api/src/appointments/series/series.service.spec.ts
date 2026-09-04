import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SeriesService } from './series.service';
import { AppointmentsService } from '../appointments.service';
import { GoogleCalendarService } from '../../integrations/google-calendar.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createPrismaMock, type PrismaMock } from '../../test/prisma-mock';

const CLINICIAN_A = 'clinician-a-uuid';
const PATIENT_1 = 'patient-1-uuid';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface CreatedAppointment {
  startTime: Date;
  seriesId: string;
}

describe('SeriesService', () => {
  let service: SeriesService;
  let prisma: PrismaMock;

  const appointmentsServiceMock = {
    hasOverlap: jest.fn().mockResolvedValue(false),
  };
  const googleMock = {
    syncAppointment: jest.fn().mockResolvedValue(null),
    deleteAppointment: jest.fn().mockResolvedValue(undefined),
  };
  const emitterMock = { emit: jest.fn() };

  /** Configura los mocks para un createSeries feliz. */
  function primeCreateMocks(seriesOverrides: Record<string, unknown> = {}) {
    prisma.patient.findFirst.mockResolvedValue({
      id: PATIENT_1,
      fullName: 'Ana Prueba',
    });
    prisma.clinicianProfile.findUnique.mockResolvedValue({
      id: CLINICIAN_A,
      sessionDefaultDuration: 50,
      sessionDefaultPrice: 100,
    });
    prisma.appointmentSeries.create.mockImplementation(
      (args: { data: Record<string, unknown> }) =>
        Promise.resolve({
          id: 'series-1',
          occurrencesCreated: 0,
          status: 'ACTIVE',
          ...args.data,
          ...seriesOverrides,
        }),
    );
    prisma.appointment.create.mockImplementation(
      (args: { data: Record<string, unknown> }) =>
        Promise.resolve({
          id: `appt-${String(Math.trunc((args.data.startTime as Date).getTime() / 1000))}`,
          googleEventId: null,
          ...args.data,
          patient: { id: PATIENT_1, fullName: 'Ana Prueba' },
        }),
    );
    prisma.appointmentSeries.update.mockResolvedValue({ id: 'series-1' });
    prisma.appointmentSeries.findUnique.mockResolvedValue({ id: 'series-1' });
  }

  function createdAppointments(): CreatedAppointment[] {
    const calls = prisma.appointment.create.mock.calls as unknown as Array<
      [{ data: CreatedAppointment }]
    >;
    return calls.map((c) => c[0].data);
  }

  function lastSeriesUpdate(): Record<string, unknown> {
    const calls = prisma.appointmentSeries.update.mock
      .calls as unknown as Array<[{ data: Record<string, unknown> }]>;
    return calls[calls.length - 1][0].data;
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    appointmentsServiceMock.hasOverlap.mockResolvedValue(false);
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeriesService,
        { provide: PrismaService, useValue: prisma },
        { provide: AppointmentsService, useValue: appointmentsServiceMock },
        { provide: GoogleCalendarService, useValue: googleMock },
        { provide: EventEmitter2, useValue: emitterMock },
      ],
    }).compile();

    service = module.get<SeriesService>(SeriesService);
  });

  describe('createSeries — generación de ocurrencias', () => {
    it('rechaza pacientes de otro clínico', async () => {
      prisma.patient.findFirst.mockResolvedValue(null);

      await expect(
        service.createSeries(CLINICIAN_A, {
          patientId: 'patient-of-b',
          startTime: new Date(Date.now() + WEEK_MS).toISOString(),
          frequency: 'WEEKLY',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.appointmentSeries.create).not.toHaveBeenCalled();
    });

    it('WEEKLY con maxOccurrences=5 crea exactamente 5 y termina la serie', async () => {
      primeCreateMocks({ maxOccurrences: 5 });
      const anchor = new Date(Date.now() + WEEK_MS);

      const result = await service.createSeries(CLINICIAN_A, {
        patientId: PATIENT_1,
        startTime: anchor.toISOString(),
        frequency: 'WEEKLY',
        maxOccurrences: 5,
      });

      const created = createdAppointments();
      expect(created).toHaveLength(5);
      // Fechas separadas exactamente 1 semana
      for (let i = 1; i < created.length; i++) {
        expect(
          created[i].startTime.getTime() - created[i - 1].startTime.getTime(),
        ).toBe(WEEK_MS);
      }
      expect(lastSeriesUpdate()).toMatchObject({
        occurrencesCreated: 5,
        status: 'ENDED',
      });
      expect(result.conflicts).toHaveLength(0);
      // Cada cita creada emite appointment.scheduled (reminders enganchan ahí)
      expect(emitterMock.emit).toHaveBeenCalledTimes(5);
    });

    it('WEEKLY sin condición de fin llena la ventana de 12 semanas y queda ACTIVE', async () => {
      primeCreateMocks();
      const anchor = new Date(Date.now() + WEEK_MS);

      await service.createSeries(CLINICIAN_A, {
        patientId: PATIENT_1,
        startTime: anchor.toISOString(),
        frequency: 'WEEKLY',
      });

      expect(createdAppointments()).toHaveLength(12);
      expect(lastSeriesUpdate()).toMatchObject({ status: 'ACTIVE' });
    });

    it('BIWEEKLY separa ocurrencias por 2 semanas', async () => {
      primeCreateMocks();
      const anchor = new Date(Date.now() + WEEK_MS);

      await service.createSeries(CLINICIAN_A, {
        patientId: PATIENT_1,
        startTime: anchor.toISOString(),
        frequency: 'BIWEEKLY',
      });

      const created = createdAppointments();
      expect(created.length).toBeGreaterThanOrEqual(5);
      expect(
        created[1].startTime.getTime() - created[0].startTime.getTime(),
      ).toBe(2 * WEEK_MS);
    });

    it('conflictos se saltan, se reportan y NO cuentan para maxOccurrences', async () => {
      primeCreateMocks({ maxOccurrences: 3 });
      const anchor = new Date(Date.now() + WEEK_MS);
      // La segunda ocurrencia (k=1) choca
      appointmentsServiceMock.hasOverlap
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true)
        .mockResolvedValue(false);

      const result = await service.createSeries(CLINICIAN_A, {
        patientId: PATIENT_1,
        startTime: anchor.toISOString(),
        frequency: 'WEEKLY',
        maxOccurrences: 3,
      });

      // 3 creadas (el conflicto no consumió cupo)
      expect(createdAppointments()).toHaveLength(3);
      expect(result.conflicts).toHaveLength(1);
      expect(new Date(result.conflicts[0]).getTime()).toBe(
        anchor.getTime() + WEEK_MS,
      );
    });

    it('until dentro de la ventana corta la serie y la marca ENDED', async () => {
      const anchor = new Date(Date.now() + WEEK_MS);
      const until = new Date(anchor.getTime() + 3 * WEEK_MS); // 4 ocurrencias
      primeCreateMocks({ until });

      await service.createSeries(CLINICIAN_A, {
        patientId: PATIENT_1,
        startTime: anchor.toISOString(),
        frequency: 'WEEKLY',
        until: until.toISOString(),
      });

      expect(createdAppointments()).toHaveLength(4);
      expect(lastSeriesUpdate()).toMatchObject({ status: 'ENDED' });
    });
  });

  describe('cancelSeries', () => {
    it('cancela solo ocurrencias futuras y marca la serie CANCELLED', async () => {
      prisma.appointmentSeries.findFirst.mockResolvedValue({
        id: 'series-1',
        clinicianId: CLINICIAN_A,
      });
      prisma.appointment.findMany.mockResolvedValue([
        { id: 'a1', googleEventId: null },
        { id: 'a2', googleEventId: 'g2' },
      ]);
      prisma.appointment.update.mockImplementation(
        (args: { where: { id: string } }) =>
          Promise.resolve({
            id: args.where.id,
            googleEventId: args.where.id === 'a2' ? 'g2' : null,
            patient: { id: PATIENT_1, fullName: 'Ana Prueba' },
          }),
      );
      prisma.appointmentSeries.update.mockResolvedValue({ id: 'series-1' });

      const result = await service.cancelSeries(CLINICIAN_A, 'series-1');

      expect(result).toEqual({ cancelled: 2 });
      // Cada cancelación emite el evento (cancela reminders vía listener)
      expect(emitterMock.emit).toHaveBeenCalledTimes(2);
      expect(googleMock.deleteAppointment).toHaveBeenCalledWith(
        CLINICIAN_A,
        'g2',
      );
      expect(lastSeriesUpdate()).toMatchObject({ status: 'CANCELLED' });
    });

    it('serie de otro clínico no se encuentra', async () => {
      prisma.appointmentSeries.findFirst.mockResolvedValue(null);

      await expect(
        service.cancelSeries(CLINICIAN_A, 'series-of-b'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
