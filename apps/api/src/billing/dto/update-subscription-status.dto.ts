import { IsEnum, IsNotEmpty } from 'class-validator';
import { SubscriptionStatus } from '#generated/prisma';

export class UpdateSubscriptionStatusDto {
  @IsEnum(SubscriptionStatus)
  @IsNotEmpty()
  status: SubscriptionStatus;
}
