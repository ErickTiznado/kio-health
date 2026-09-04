import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { N1coPaymentService } from './n1co-payment.service';

@Module({
  providers: [SubscriptionsService, N1coPaymentService],
  controllers: [SubscriptionsController],
  exports: [N1coPaymentService],
})
export class SubscriptionsModule {}
