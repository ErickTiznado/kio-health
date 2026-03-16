import { Controller, Post, Body, Headers, Req, UseGuards, Get } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(
    @CurrentUser() user: any,
    @Body() body: { priceId: string; successUrl: string; cancelUrl: string }
  ) {
    const { priceId, successUrl, cancelUrl } = body;
    // user should have clinicId if they are part of a clinic
    // We assume user.clinicId is available from JwtAuthGuard or we find it
    const clinicId = user.clinicId; 
    
    return this.subscriptionsService.createCheckoutSession(clinicId, priceId, successUrl, cancelUrl);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getSubscriptionStatus(@CurrentUser() user: any) {
    return this.subscriptionsService.getSubscriptionStatus(user.clinicId);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>
  ) {
    // Stripe requires the raw body to verify the signature
    return this.subscriptionsService.handleWebhook(signature, request.rawBody as Buffer);
  }
}
