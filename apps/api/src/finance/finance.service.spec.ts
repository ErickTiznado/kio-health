import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { createPrismaMock } from '../test/prisma-mock';
import { makeFinanceTransaction, makeAppointment } from '../test/factories';
import { zonedDayKey, zonedDayStart } from '../lib/timezone.util';

/** Zona por defecto del schema; al oeste de Greenwich, que es donde dolía. */
const TZ = 'America/Mexico_City';

describe('FinanceService', () => {
  let service: FinanceService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new FinanceService(prisma as any);
    // Toda fecha del módulo se ancla a la zona del clínico, así que casi cada
    // caso necesita el perfil resuelto.
    prisma.clinicianProfile.findUnique.mockResolvedValue({ timezone: TZ });
  });

  // ── getSummary() ──────────────────────────────────────────────────────────

  describe('getSummary()', () => {
    function buildTransactions(income: number[], expenses: number[]) {
      return [
        ...income.map((amount) =>
          makeFinanceTransaction({ type: 'INCOME', amount }),
        ),
        ...expenses.map((amount) =>
          makeFinanceTransaction({ type: 'EXPENSE', amount }),
        ),
      ];
    }

    it('totalIncome sums only INCOME transactions', async () => {
      const txs = buildTransactions([100, 200, 300], [50]);
      prisma.financeTransaction.findMany
        .mockResolvedValueOnce(txs) // current month
        .mockResolvedValueOnce([]); // prev month
      prisma.appointment.findMany.mockResolvedValue([]);

      const result = await service.getSummary('clinician-1', 3, 2026);
      expect(result.totalIncome).toBe(600);
    });

    it('totalExpense sums only EXPENSE transactions', async () => {
      const txs = buildTransactions([500], [80, 120]);
      prisma.financeTransaction.findMany
        .mockResolvedValueOnce(txs)
        .mockResolvedValueOnce([]);
      prisma.appointment.findMany.mockResolvedValue([]);

      const result = await service.getSummary('clinician-1', 3, 2026);
      expect(result.totalExpense).toBe(200);
    });

    it('balance = income - expense', async () => {
      const txs = buildTransactions([1000], [300]);
      prisma.financeTransaction.findMany
        .mockResolvedValueOnce(txs)
        .mockResolvedValueOnce([]);
      prisma.appointment.findMany.mockResolvedValue([]);

      const result = await service.getSummary('clinician-1', 3, 2026);
      expect(result.balance).toBe(700);
    });

    it('projection is sum of SCHEDULED appointment prices', async () => {
      prisma.financeTransaction.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      prisma.appointment.findMany.mockResolvedValue([
        makeAppointment({ price: 500 }),
        makeAppointment({ price: 500 }),
        makeAppointment({ price: 300 }),
      ]);

      const result = await service.getSummary('clinician-1', 3, 2026);
      expect(result.projection).toBe(1300);
    });

    it('paymentMethodBreakdown counts only INCOME transactions', async () => {
      const txs = [
        {
          ...makeFinanceTransaction({ type: 'INCOME', amount: 200 }),
          appointment: { paymentMethod: 'CASH' },
        },
        {
          ...makeFinanceTransaction({ type: 'INCOME', amount: 300 }),
          appointment: { paymentMethod: 'CARD' },
        },
        {
          ...makeFinanceTransaction({ type: 'EXPENSE', amount: 100 }),
          appointment: { paymentMethod: 'CASH' },
        }, // should be ignored
      ];
      prisma.financeTransaction.findMany
        .mockResolvedValueOnce(txs)
        .mockResolvedValueOnce([]);
      prisma.appointment.findMany.mockResolvedValue([]);

      const result = await service.getSummary('clinician-1', 3, 2026);
      expect(result.paymentMethodBreakdown.CASH).toBe(200);
      expect(result.paymentMethodBreakdown.CARD).toBe(300);
    });

    it('when month=1, previous month is 12 of the previous year', async () => {
      prisma.financeTransaction.findMany.mockResolvedValue([]);
      prisma.appointment.findMany.mockResolvedValue([]);

      await service.getSummary('clinician-1', 1, 2026);

      // Second findMany call should use month=12, year=2025
      const secondCall = prisma.financeTransaction.findMany.mock.calls[1][0];
      // Borde en la zona del clínico, no en la del proceso.
      expect(secondCall.where.date.gte).toEqual(
        zonedDayStart('2025-12-01', TZ),
      );
      expect(secondCall.where.date.lt).toEqual(zonedDayStart('2026-01-01', TZ));
    });

    it('proyección y movimientos usan los mismos bordes de mes', async () => {
      prisma.financeTransaction.findMany.mockResolvedValue([]);
      prisma.appointment.findMany.mockResolvedValue([]);

      await service.getSummary('clinician-1', 8, 2026);

      const txWhere = prisma.financeTransaction.findMany.mock.calls[0][0].where;
      const aptWhere = prisma.appointment.findMany.mock.calls[0][0].where;
      expect(aptWhere.startTime.gte).toEqual(txWhere.date.gte);
      expect(aptWhere.startTime.lt).toEqual(txWhere.date.lt);
    });
  });

  // ── createFromListener() ──────────────────────────────────────────────────

  describe('createFromListener()', () => {
    it('is idempotent: updates existing transaction when appointmentId matches', async () => {
      const existing = makeFinanceTransaction({
        appointmentId: 'apt-1',
        clinicianId: 'clinician-1',
      });
      prisma.financeTransaction.findUnique.mockResolvedValue(existing);
      prisma.financeTransaction.update.mockResolvedValue(existing);

      await service.createFromListener('clinician-1', {
        type: 'INCOME',
        amount: 999,
        appointmentId: 'apt-1',
      } as any);

      expect(prisma.financeTransaction.update).toHaveBeenCalledTimes(1);
      expect(prisma.financeTransaction.create).not.toHaveBeenCalled();
    });

    it('no pisa una fila que es de otro clínico', async () => {
      // Solo alcanzable con filas heredadas: hubo un tiempo en que
      // `POST /finance` aceptaba `appointmentId` y, siendo `@unique`, permitía
      // ocupar la cita de otro. Escribir ahí metería el importe de este clínico
      // en el libro ajeno.
      prisma.financeTransaction.findUnique.mockResolvedValue(
        makeFinanceTransaction({
          appointmentId: 'apt-1',
          clinicianId: 'otro-clinico',
        }),
      );

      await expect(
        service.createFromListener('clinician-1', {
          type: 'INCOME',
          amount: 999,
          appointmentId: 'apt-1',
        } as any),
      ).rejects.toThrow(ForbiddenException);

      expect(prisma.financeTransaction.update).not.toHaveBeenCalled();
      expect(prisma.financeTransaction.create).not.toHaveBeenCalled();
    });

    it('creates a new transaction when none exists for appointmentId', async () => {
      prisma.financeTransaction.findUnique.mockResolvedValue(null);
      prisma.financeTransaction.create.mockResolvedValue(
        makeFinanceTransaction(),
      );

      await service.createFromListener('clinician-1', {
        type: 'INCOME',
        amount: 500,
        appointmentId: 'apt-new',
      } as any);

      expect(prisma.financeTransaction.create).toHaveBeenCalledTimes(1);
      expect(prisma.financeTransaction.update).not.toHaveBeenCalled();
    });

    it('runs inside a $transaction', async () => {
      prisma.financeTransaction.findUnique.mockResolvedValue(null);
      prisma.financeTransaction.create.mockResolvedValue(
        makeFinanceTransaction(),
      );

      await service.createFromListener('clinician-1', {
        type: 'INCOME',
        amount: 500,
      } as any);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  // ── findAllPaginated() ────────────────────────────────────────────────────

  describe('findAllPaginated()', () => {
    it('applies type filter when provided', async () => {
      prisma.financeTransaction.findMany.mockResolvedValue([]);
      prisma.financeTransaction.count.mockResolvedValue(0);

      await service.findAllPaginated('clinician-1', 3, 2026, 'INCOME');

      const whereArg =
        prisma.financeTransaction.findMany.mock.calls[0][0].where;
      expect(whereArg.type).toBe('INCOME');
    });

    it('does not apply type filter when not provided', async () => {
      prisma.financeTransaction.findMany.mockResolvedValue([]);
      prisma.financeTransaction.count.mockResolvedValue(0);

      await service.findAllPaginated('clinician-1', 3, 2026);

      const whereArg =
        prisma.financeTransaction.findMany.mock.calls[0][0].where;
      expect(whereArg.type).toBeUndefined();
    });

    it('calculates lastPage as Math.ceil(total / limit)', async () => {
      prisma.financeTransaction.findMany.mockResolvedValue([]);
      prisma.financeTransaction.count.mockResolvedValue(31);

      const result = await service.findAllPaginated(
        'clinician-1',
        3,
        2026,
        undefined,
        1,
        15,
      );

      expect(result.meta.lastPage).toBe(3); // ceil(31/15) = 3
    });
  });

  // ── Fecha civil ───────────────────────────────────────────────────────────

  describe('fecha civil del movimiento manual', () => {
    const manual = (date?: string) =>
      ({
        type: 'EXPENSE',
        category: 'Renta',
        amount: 100,
        date,
      }) as any;

    function createdDate(callIndex = 0): Date {
      return prisma.financeTransaction.create.mock.calls[callIndex][0].data
        .date;
    }

    beforeEach(() => {
      prisma.financeTransaction.create.mockResolvedValue(
        makeFinanceTransaction(),
      );
    });

    it('ancla el día al inicio en la zona del clínico, no a medianoche UTC', async () => {
      await service.create('clinician-1', manual('2026-08-01'));

      const date = createdDate();
      expect(date).toEqual(zonedDayStart('2026-08-01', TZ));
      // El bug original: `new Date('2026-08-01')` es medianoche UTC, que en
      // México son las 18:00 del 31 de julio.
      expect(date).not.toEqual(new Date('2026-08-01'));
    });

    it('el día civil sobrevive el viaje de ida y vuelta', async () => {
      await service.create('clinician-1', manual('2026-08-01'));

      expect(zonedDayKey(createdDate(), TZ)).toBe('2026-08-01');
    });

    it('sin fecha sella el instante actual y no consulta la zona', async () => {
      const before = Date.now();
      await service.create('clinician-1', manual(undefined));

      const date = createdDate();
      expect(date.getTime()).toBeGreaterThanOrEqual(before);
      expect(date.getTime()).toBeLessThanOrEqual(Date.now());
      expect(prisma.clinicianProfile.findUnique).not.toHaveBeenCalled();
    });

    it('rechaza un día que no existe en vez de desbordarlo al mes siguiente', async () => {
      // `2026-02-31` casa con `YYYY-MM-DD` pero `Date.UTC` lo convierte en
      // marzo: guardarlo movería el gasto de mes en silencio.
      await expect(
        service.create('clinician-1', manual('2026-02-31')),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.financeTransaction.create).not.toHaveBeenCalled();
    });

    it('un día de cambio de horario sigue siendo válido', async () => {
      prisma.clinicianProfile.findUnique.mockResolvedValue({
        timezone: 'Europe/Madrid',
      });

      await service.create('clinician-1', manual('2026-03-29'));

      expect(zonedDayKey(createdDate(), 'Europe/Madrid')).toBe('2026-03-29');
    });

    it('el alta manual nunca cuelga el movimiento de una cita', async () => {
      // `appointmentId` ya no existe en `CreateTransactionDto`, pero el
      // `ValidationPipe` global no usa `whitelist`: un cuerpo con el campo de
      // más llega igual al servicio. Como la columna es `@unique`, escribirlo
      // permitiría ocupar la cita de otro clínico y secuestrar su ingreso.
      await service.create('clinician-1', {
        type: 'EXPENSE',
        category: 'Renta',
        amount: 100,
        appointmentId: 'apt-de-otro',
      } as any);

      expect(
        prisma.financeTransaction.create.mock.calls[0][0].data,
      ).not.toHaveProperty('appointmentId');
    });

    it('el ingreso de una cita guarda un instante real, no un día civil', async () => {
      prisma.financeTransaction.findUnique.mockResolvedValue(null);

      const before = Date.now();
      await service.createFromListener('clinician-1', {
        type: 'INCOME',
        category: 'Consultation',
        amount: 500,
        appointmentId: 'apt-1',
      } as any);

      const date = createdDate();
      expect(date.getTime()).toBeGreaterThanOrEqual(before);
      expect(date.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  // ── Coherencia entre la fecha guardada y los bordes del mes ───────────────
  //
  // La trampa: normalizar solo un lado. Si la fecha se ancla en la zona del
  // clínico y los bordes se calculan en la del proceso, el movimiento del día 1
  // (zonas al este de Greenwich) o el del último día (zonas al oeste) se cae de
  // su propio mes.

  describe('bordes del mes', () => {
    const manual = (date: string) =>
      ({ type: 'EXPENSE', category: 'Renta', amount: 100, date }) as any;

    async function storedDate(tz: string, day: string): Promise<Date> {
      prisma.clinicianProfile.findUnique.mockResolvedValue({ timezone: tz });
      prisma.financeTransaction.create.mockResolvedValue(
        makeFinanceTransaction(),
      );
      await service.create('clinician-1', manual(day));
      const calls = prisma.financeTransaction.create.mock.calls;
      return calls[calls.length - 1][0].data.date;
    }

    async function monthWindow(tz: string, month: number, year: number) {
      prisma.clinicianProfile.findUnique.mockResolvedValue({ timezone: tz });
      prisma.financeTransaction.findMany.mockResolvedValue([]);
      prisma.financeTransaction.count.mockResolvedValue(0);
      await service.findAllPaginated('clinician-1', month, year);
      const calls = prisma.financeTransaction.findMany.mock.calls;
      return calls[calls.length - 1][0].where.date as { gte: Date; lt: Date };
    }

    it.each([
      ['America/Mexico_City'], // al oeste de Greenwich
      ['Europe/Madrid'], // al este: aquí fallaba el borde del día 1
      ['Pacific/Auckland'], // +12: el caso extremo
    ])('el día 1 y el último día caen dentro de su mes (%s)', async (tz) => {
      const first = await storedDate(tz, '2026-08-01');
      const last = await storedDate(tz, '2026-08-31');
      const { gte, lt } = await monthWindow(tz, 8, 2026);

      for (const d of [first, last]) {
        expect(d.getTime()).toBeGreaterThanOrEqual(gte.getTime());
        expect(d.getTime()).toBeLessThan(lt.getTime());
      }
    });

    it('los bordes salen de la zona del clínico, no de la del proceso', async () => {
      const { gte, lt } = await monthWindow('Europe/Madrid', 8, 2026);

      expect(gte).toEqual(zonedDayStart('2026-08-01', 'Europe/Madrid'));
      expect(lt).toEqual(zonedDayStart('2026-09-01', 'Europe/Madrid'));
      // En agosto Madrid es UTC+2: el mes empieza a las 22:00 del 31 de julio.
      expect(gte).not.toEqual(new Date('2026-08-01'));
    });

    it('el filtro es medio abierto: sin hueco de milisegundo a fin de mes', async () => {
      const window = await monthWindow(TZ, 12, 2026);

      expect(window.lt).toEqual(zonedDayStart('2027-01-01', TZ));
      expect(window).not.toHaveProperty('lte');
    });
  });

  // ── update() / remove() ───────────────────────────────────────────────────

  describe('update()', () => {
    const patch = { amount: 250 } as any;

    it('un clínico ajeno no encuentra la fila (propiedad en el where)', async () => {
      prisma.financeTransaction.findFirst.mockResolvedValue(null);

      await expect(
        service.update('clinician-2', 'tx-1', patch),
      ).rejects.toThrow(ForbiddenException);

      expect(prisma.financeTransaction.findFirst).toHaveBeenCalledWith({
        where: { id: 'tx-1', clinicianId: 'clinician-2' },
      });
      expect(prisma.financeTransaction.update).not.toHaveBeenCalled();
    });

    it('rechaza un movimiento ligado a una cita', async () => {
      prisma.financeTransaction.findFirst.mockResolvedValue(
        makeFinanceTransaction({ id: 'tx-1', appointmentId: 'apt-1' }),
      );

      await expect(
        service.update('clinician-1', 'tx-1', patch),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.financeTransaction.update).not.toHaveBeenCalled();
    });

    it('normaliza la fecha y deja intactos los campos ausentes', async () => {
      const tx = makeFinanceTransaction({ id: 'tx-1', appointmentId: null });
      prisma.financeTransaction.findFirst.mockResolvedValue(tx);
      prisma.financeTransaction.update.mockResolvedValue(tx);

      await service.update('clinician-1', 'tx-1', {
        amount: 250,
        date: '2026-08-01',
      } as any);

      const call = prisma.financeTransaction.update.mock.calls[0][0];
      expect(call.where).toEqual({ id: 'tx-1' });
      expect(call.data.amount).toBe(250);
      expect(call.data.date).toEqual(zonedDayStart('2026-08-01', TZ));
      expect(call.data.type).toBeUndefined();
      expect(call.data.category).toBeUndefined();
    });

    it('sin fecha en el cuerpo no toca la fecha guardada', async () => {
      const tx = makeFinanceTransaction({ id: 'tx-1', appointmentId: null });
      prisma.financeTransaction.findFirst.mockResolvedValue(tx);
      prisma.financeTransaction.update.mockResolvedValue(tx);

      await service.update('clinician-1', 'tx-1', patch);

      expect(
        prisma.financeTransaction.update.mock.calls[0][0].data.date,
      ).toBeUndefined();
    });

    it.each([['type'], ['category'], ['amount']])(
      'rechaza %s: null con 400 en vez de reventar en Prisma',
      async (field) => {
        const tx = makeFinanceTransaction({ id: 'tx-1', appointmentId: null });
        prisma.financeTransaction.findFirst.mockResolvedValue(tx);

        // `PartialType` pone `@IsOptional()` en todo y ese decorador salta
        // `null` igual que `undefined`, así que la validación no lo ve. Estas
        // columnas son NOT NULL.
        await expect(
          service.update('clinician-1', 'tx-1', { [field]: null } as any),
        ).rejects.toThrow(BadRequestException);

        expect(prisma.financeTransaction.update).not.toHaveBeenCalled();
      },
    );

    it('description: null sí es legítimo — la columna es nulable', async () => {
      const tx = makeFinanceTransaction({ id: 'tx-1', appointmentId: null });
      prisma.financeTransaction.findFirst.mockResolvedValue(tx);
      prisma.financeTransaction.update.mockResolvedValue(tx);

      await service.update('clinician-1', 'tx-1', {
        description: null,
      } as any);

      expect(
        prisma.financeTransaction.update.mock.calls[0][0].data.description,
      ).toBeNull();
    });

    it('date: null no toca la fecha guardada', async () => {
      const tx = makeFinanceTransaction({ id: 'tx-1', appointmentId: null });
      prisma.financeTransaction.findFirst.mockResolvedValue(tx);
      prisma.financeTransaction.update.mockResolvedValue(tx);

      await service.update('clinician-1', 'tx-1', { date: null } as any);

      expect(
        prisma.financeTransaction.update.mock.calls[0][0].data.date,
      ).toBeUndefined();
    });

    it('nunca reasigna appointmentId aunque venga en el cuerpo', async () => {
      const tx = makeFinanceTransaction({ id: 'tx-1', appointmentId: null });
      prisma.financeTransaction.findFirst.mockResolvedValue(tx);
      prisma.financeTransaction.update.mockResolvedValue(tx);

      await service.update('clinician-1', 'tx-1', {
        amount: 250,
        appointmentId: 'apt-de-otro',
      } as any);

      expect(
        prisma.financeTransaction.update.mock.calls[0][0].data,
      ).not.toHaveProperty('appointmentId');
    });
  });

  describe('remove()', () => {
    it('un clínico ajeno no encuentra la fila (propiedad en el where)', async () => {
      prisma.financeTransaction.findFirst.mockResolvedValue(null);

      await expect(service.remove('clinician-2', 'tx-1')).rejects.toThrow(
        ForbiddenException,
      );

      expect(prisma.financeTransaction.findFirst).toHaveBeenCalledWith({
        where: { id: 'tx-1', clinicianId: 'clinician-2' },
      });
      expect(prisma.financeTransaction.delete).not.toHaveBeenCalled();
    });

    it('rechaza un movimiento ligado a una cita', async () => {
      prisma.financeTransaction.findFirst.mockResolvedValue(
        makeFinanceTransaction({ id: 'tx-1', appointmentId: 'apt-1' }),
      );

      await expect(service.remove('clinician-1', 'tx-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.financeTransaction.delete).not.toHaveBeenCalled();
    });

    it('borra el movimiento manual y devuelve su id', async () => {
      const tx = makeFinanceTransaction({ id: 'tx-1', appointmentId: null });
      prisma.financeTransaction.findFirst.mockResolvedValue(tx);
      prisma.financeTransaction.delete.mockResolvedValue(tx);

      const result = await service.remove('clinician-1', 'tx-1');

      expect(prisma.financeTransaction.delete).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
      });
      expect(result).toEqual({ id: 'tx-1', deleted: true });
    });
  });
});
