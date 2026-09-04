import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  clinicId: string;

  @IsUUID()
  @IsNotEmpty()
  planId: string;
}
