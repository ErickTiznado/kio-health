import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { createPrismaMock } from '../test/prisma-mock';
import { SubscriptionStatus } from '#generated/prisma';

describe('BillingService', () => {
  let service: BillingService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new BillingService(prisma as any);
    jest.clearAllMocks();
  });

  // ── getClinicSubscription ──────────────────────────────────────────────────

  describe('getClinicSubscription()', () => {
    it('retorna la suscripción con el plan incluido', async () => {
      const sub = {
        id: 'sub-1',
        clinicId: 'clinic-1',
        status: SubscriptionStatus.TRIALING,
        plan: { name: 'Pro' },
      };
      prisma.clinicSubscription.findUnique.mockResolvedValue(sub);

      const result = await service.getClinicSubscription('clinic-1');
      expect(result).toEqual(sub);
      expect(prisma.clinicSubscription.findUnique).toHaveBeenCalledWith({
        where: { clinicId: 'clinic-1' },
        include: { plan: true },
      });
    });

    it('lanza NotFoundException si no existe suscripción', async () => {
      prisma.clinicSubscription.findUnique.mockResolvedValue(null);
      await expect(service.getClinicSubscription('clinic-x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── hasActivePlan ──────────────────────────────────────────────────────────

  describe('hasActivePlan()', () => {
    it('retorna true si el status es ACTIVE', async () => {
      prisma.clinicSubscription.findUnique.mockResolvedValue({
        status: SubscriptionStatus.ACTIVE,
      });
      await expect(service.hasActivePlan('clinic-1')).resolves.toBe(true);
    });

    it('retorna true si el status es ACTIVE_MANUAL', async () => {
      prisma.clinicSubscription.findUnique.mockResolvedValue({
        status: SubscriptionStatus.ACTIVE_MANUAL,
      });
      await expect(service.hasActivePlan('clinic-1')).resolves.toBe(true);
    });

    it('retorna false si el status es TRIALING', async () => {
      prisma.clinicSubscription.findUnique.mockResolvedValue({
        status: SubscriptionStatus.TRIALING,
      });
      await expect(service.hasActivePlan('clinic-1')).resolves.toBe(false);
    });

    it('retorna false si no existe suscripción', async () => {
      prisma.clinicSubscription.findUnique.mockResolvedValue(null);
      await expect(service.hasActivePlan('clinic-x')).resolves.toBe(false);
    });
  });

  // ── initializeSubscription ────────────────────────────────────────────────

  describe('initializeSubscription()', () => {
    it('crea suscripción en estado TRIALING cuando no existe', async () => {
      const plan = { id: 'plan-1', name: 'Pro Beta' };
      prisma.clinicSubscription.findUnique.mockResolvedValue(null);
      prisma.subscriptionPlan.findUnique.mockResolvedValue(plan);
      prisma.clinicSubscription.create.mockResolvedValue({
        id: 'sub-new',
        clinicId: 'clinic-1',
        planId: 'plan-1',
        status: SubscriptionStatus.TRIALING,
      });

      const result = await service.initializeSubscription({
        clinicId: 'clinic-1',
        planId: 'plan-1',
      } as any);

      expect(prisma.clinicSubscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: SubscriptionStatus.TRIALING,
          }),
        }),
      );
      expect(result.status).toBe(SubscriptionStatus.TRIALING);
    });

    it('actualiza si la suscripción anterior fue CANCELED', async () => {
      const plan = { id: 'plan-1' };
      const existingSub = {
        id: 'sub-old',
        status: SubscriptionStatus.CANCELED,
      };
      prisma.clinicSubscription.findUnique.mockResolvedValue(existingSub);
      prisma.subscriptionPlan.findUnique.mockResolvedValue(plan);
      prisma.clinicSubscription.update.mockResolvedValue({
        ...existingSub,
        status: SubscriptionStatus.TRIALING,
      });

      await service.initializeSubscription({
        clinicId: 'clinic-1',
        planId: 'plan-1',
      } as any);

      expect(prisma.clinicSubscription.update).toHaveBeenCalled();
      expect(prisma.clinicSubscription.create).not.toHaveBeenCalled();
    });

    it('lanza BadRequestException si ya existe una suscripción activa', async () => {
      prisma.clinicSubscription.findUnique.mockResolvedValue({
        status: SubscriptionStatus.ACTIVE,
      });
      await expect(
        service.initializeSubscription({
          clinicId: 'clinic-1',
          planId: 'plan-1',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza NotFoundException si el plan no existe', async () => {
      prisma.clinicSubscription.findUnique.mockResolvedValue(null);
      prisma.subscriptionPlan.findUnique.mockResolvedValue(null);
      await expect(
        service.initializeSubscription({
          clinicId: 'clinic-1',
          planId: 'plan-inexistente',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── cancelSubscription ────────────────────────────────────────────────────

  describe('cancelSubscription()', () => {
    it('actualiza status a CANCELED', async () => {
      const sub = {
        id: 'sub-1',
        clinicId: 'clinic-1',
        status: SubscriptionStatus.ACTIVE,
      };
      prisma.clinicSubscription.findUnique.mockResolvedValue(sub);
      prisma.clinicSubscription.update.mockResolvedValue({
        ...sub,
        status: SubscriptionStatus.CANCELED,
      });

      await service.cancelSubscription('clinic-1');

      expect(prisma.clinicSubscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: SubscriptionStatus.CANCELED,
          }),
        }),
      );
    });

    it('lanza NotFoundException si no existe suscripción', async () => {
      prisma.clinicSubscription.findUnique.mockResolvedValue(null);
      await expect(service.cancelSubscription('clinic-x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
