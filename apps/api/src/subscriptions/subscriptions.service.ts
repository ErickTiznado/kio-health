import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// NOTE: Stripe integration removed. This module is a stub.
// Subscription status is still readable from the DB, but
// checkout and webhook handling require a new payment provider.

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getSubscriptionStatus(clinicId: string) {
    const sub = await this.prisma.clinicSubscription.findUnique({
      where: { clinicId },
      include: { plan: true },
    });
    return sub;
  }
}
