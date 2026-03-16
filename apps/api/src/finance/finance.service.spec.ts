import { FinanceService } from './finance.service';
import { createPrismaMock } from '../test/prisma-mock';
import { makeFinanceTransaction, makeAppointment } from '../test/factories';

describe('FinanceService', () => {
  let service: FinanceService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new FinanceService(prisma as any);
  });

  // ── getSummary() ──────────────────────────────────────────────────────────

  describe('getSummary()', () => {
    function buildTransactions(income: number[], expenses: number[]) {
      return [
        ...income.map((amount) => makeFinanceTransaction({ type: 'INCOME', amount })),
        ...expenses.map((amount) => makeFinanceTransaction({ type: 'EXPENSE', amount })),
      ];
    }

    it('totalIncome sums only INCOME transactions', async () => {
      const txs = buildTransactions([100, 200, 300], [50]);
      prisma.financeTransaction.findMany
        .mockResolvedValueOnce(txs)   // current month
        .mockResolvedValueOnce([]);   // prev month
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
        { ...makeFinanceTransaction({ type: 'INCOME', amount: 200 }), appointment: { paymentMethod: 'CASH' } },
        { ...makeFinanceTransaction({ type: 'INCOME', amount: 300 }), appointment: { paymentMethod: 'CARD' } },
        { ...makeFinanceTransaction({ type: 'EXPENSE', amount: 100 }), appointment: { paymentMethod: 'CASH' } }, // should be ignored
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
      expect(secondCall.where.date.gte).toEqual(new Date(2025, 11, 1)); // December 2025
    });
  });

  // ── createFromListener() ──────────────────────────────────────────────────

  describe('createFromListener()', () => {
    it('is idempotent: updates existing transaction when appointmentId matches', async () => {
      const existing = makeFinanceTransaction({ appointmentId: 'apt-1' });
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

    it('creates a new transaction when none exists for appointmentId', async () => {
      prisma.financeTransaction.findUnique.mockResolvedValue(null);
      prisma.financeTransaction.create.mockResolvedValue(makeFinanceTransaction());

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
      prisma.financeTransaction.create.mockResolvedValue(makeFinanceTransaction());

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

      const whereArg = prisma.financeTransaction.findMany.mock.calls[0][0].where;
      expect(whereArg.type).toBe('INCOME');
    });

    it('does not apply type filter when not provided', async () => {
      prisma.financeTransaction.findMany.mockResolvedValue([]);
      prisma.financeTransaction.count.mockResolvedValue(0);

      await service.findAllPaginated('clinician-1', 3, 2026);

      const whereArg = prisma.financeTransaction.findMany.mock.calls[0][0].where;
      expect(whereArg.type).toBeUndefined();
    });

    it('calculates lastPage as Math.ceil(total / limit)', async () => {
      prisma.financeTransaction.findMany.mockResolvedValue([]);
      prisma.financeTransaction.count.mockResolvedValue(31);

      const result = await service.findAllPaginated('clinician-1', 3, 2026, undefined, 1, 15);

      expect(result.meta.lastPage).toBe(3); // ceil(31/15) = 3
    });
  });
});
