import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionsService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
      // @ts-expect-error Types mismatch due to strict Stripe versions
      apiVersion: '2025-01-27.acacia',
    });
  }

  async createCheckoutSession(clinicId: string, priceId: string, successUrl: string, cancelUrl: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: clinicId },
      include: { subscription: true }
    });

    if (!clinic) {
      throw new NotFoundException('Clínica no encontrada');
    }

    let customerId = clinic.subscription?.stripeCustomerId;

    if (!customerId) {
      // Find the owner to get an email
      const members = await this.prisma.clinicMember.findMany({
        where: { clinicId, role: 'OWNER' },
        include: { clinician: { include: { user: true } } }
      });
      const ownerEmail = members[0]?.clinician?.user?.email;

      const customer = await this.stripe.customers.create({
        email: ownerEmail,
        metadata: {
          clinicId: clinic.id
        }
      });
      customerId = customer.id;

      // Update subscription record with customer ID
      await this.prisma.clinicSubscription.update({
        where: { clinicId },
        data: { stripeCustomerId: customerId }
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        clinicId: clinic.id
      }
    });

    return { url: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_mock';
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch (err: any) {
      this.logger.error(`Webhook Error: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription') {
          await this.prisma.clinicSubscription.update({
            where: { stripeCustomerId: session.customer as string },
            data: {
              stripeSubscriptionId: session.subscription as string,
              status: 'ACTIVE',
            }
          });
          this.logger.log(`Subscription activated for customer: ${session.customer}`);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.prisma.clinicSubscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status === 'active' ? 'ACTIVE' : 
                    subscription.status === 'past_due' ? 'PAST_DUE' : 'CANCELED',
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
          }
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.prisma.clinicSubscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'CANCELED',
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
          }
        });
        break;
      }
      default:
        this.logger.warn(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  async getSubscriptionStatus(clinicId: string) {
    const sub = await this.prisma.clinicSubscription.findUnique({
      where: { clinicId },
      include: { plan: true }
    });
    return sub;
  }
}
