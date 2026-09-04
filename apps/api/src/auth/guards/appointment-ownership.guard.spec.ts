import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AppointmentOwnershipGuard } from './appointment-ownership.guard';
import { createPrismaMock } from '../../test/prisma-mock';

function makeContext(
  params: Record<string, string>,
  user?: Record<string, string>,
) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ params, user }),
    }),
  };
}

describe('AppointmentOwnershipGuard', () => {
  let guard: AppointmentOwnershipGuard;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    guard = new AppointmentOwnershipGuard(prisma as any);
  });

  it('returns false when appointmentId is missing from params', async () => {
    const ctx = makeContext({}, { clinicianId: 'clinician-1' });
    const result = await guard.canActivate(ctx as any);
    expect(result).toBe(false);
  });

  it('returns false when clinicianId is missing from user', async () => {
    const ctx = makeContext({ id: 'apt-1' }, { clinicianId: '' });
    // clinicianId is falsy
    prisma.appointment.findUnique.mockResolvedValue(null);
    const ctx2 = makeContext({ id: 'apt-1' }, undefined);
    const result = await guard.canActivate(ctx2 as any);
    expect(result).toBe(false);
  });

  it('throws NotFoundException when appointment does not exist', async () => {
    prisma.appointment.findUnique.mockResolvedValue(null);
    const ctx = makeContext(
      { id: 'nonexistent' },
      { clinicianId: 'clinician-1' },
    );

    await expect(guard.canActivate(ctx as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws ForbiddenException when appointment belongs to different clinician', async () => {
    prisma.appointment.findUnique.mockResolvedValue({
      clinicianId: 'other-clinician',
    });
    const ctx = makeContext({ id: 'apt-1' }, { clinicianId: 'clinician-1' });

    await expect(guard.canActivate(ctx as any)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('returns true when ownership is valid', async () => {
    prisma.appointment.findUnique.mockResolvedValue({
      clinicianId: 'clinician-1',
    });
    const ctx = makeContext({ id: 'apt-1' }, { clinicianId: 'clinician-1' });

    const result = await guard.canActivate(ctx as any);
    expect(result).toBe(true);
  });
});
