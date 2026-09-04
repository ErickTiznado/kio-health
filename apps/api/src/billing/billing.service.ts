import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionStatus } from '#generated/prisma';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async getClinicSubscription(clinicId: string) {
    const subscription = await this.prisma.clinicSubscription.findUnique({
      where: { clinicId },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException(
        `Subscription for clinic ${clinicId} not found`,
      );
    }

    return subscription;
  }

  async hasActivePlan(clinicId: string): Promise<boolean> {
    const subscription = await this.prisma.clinicSubscription.findUnique({
      where: { clinicId },
    });

    if (!subscription) {
      return false;
    }

    return (
      subscription.status === SubscriptionStatus.ACTIVE ||
      subscription.status === SubscriptionStatus.ACTIVE_MANUAL
    );
  }

  async initializeSubscription(dto: CreateSubscriptionDto) {
    const existingSubscription =
      await this.prisma.clinicSubscription.findUnique({
        where: { clinicId: dto.clinicId },
      });

    if (
      existingSubscription &&
      existingSubscription.status !== SubscriptionStatus.CANCELED
    ) {
      throw new BadRequestException(
        `Clinic ${dto.clinicId} already has an active or pending subscription`,
      );
    }

    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with id ${dto.planId} not found`);
    }

    // TODO: Llamar a pasarela N1co aquí y actualizar gateway_ids

    if (existingSubscription) {
      return this.prisma.clinicSubscription.update({
        where: { id: existingSubscription.id },
        data: {
          planId: dto.planId,
          status: SubscriptionStatus.TRIALING,
        },
      });
    }

    return this.prisma.clinicSubscription.create({
      data: {
        clinicId: dto.clinicId,
        planId: dto.planId,
        status: SubscriptionStatus.TRIALING,
      },
    });
  }

  async cancelSubscription(clinicId: string) {
    const subscription = await this.prisma.clinicSubscription.findUnique({
      where: { clinicId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `Subscription for clinic ${clinicId} not found`,
      );
    }

    return this.prisma.clinicSubscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.CANCELED,
      },
    });
  }
}
