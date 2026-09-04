import { Controller, Get, NotFoundException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '../auth/interfaces/request-user.interface';

// NOTE: Stripe integration removed.
// POST /checkout and POST /webhook endpoints have been removed.
// Only the status read endpoint remains.
// Protegido por el JwtAuthGuard global (ver app.module.ts).

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('status')
  async getSubscriptionStatus(@CurrentUser() user: RequestUser) {
    if (!user.clinicId) {
      throw new NotFoundException('El usuario no pertenece a ninguna clínica');
    }
    return this.subscriptionsService.getSubscriptionStatus(user.clinicId);
  }
}
