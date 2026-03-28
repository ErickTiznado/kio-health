import { Controller, Get, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// NOTE: Stripe integration removed.
// POST /checkout and POST /webhook endpoints have been removed.
// Only the status read endpoint remains.

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getSubscriptionStatus(@CurrentUser() user: any) {
    return this.subscriptionsService.getSubscriptionStatus(user.clinicId);
  }
}
