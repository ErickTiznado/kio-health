import { IsString, IsUUID, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { SubscriptionStatus } from '#generated/prisma';

export class CreateSubscriptionDto {
  @IsUUID()
  clinicId: string;

  @IsOptional()
  @IsUUID()
  planId?: string;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsString()
  gatewayProvider?: string;

  @IsOptional()
  @IsString()
  gatewayCustomerId?: string;

  @IsOptional()
  @IsString()
  gatewaySubscriptionId?: string;

  @IsOptional()
  @IsUrl()
  paymentUrl?: string;
}
