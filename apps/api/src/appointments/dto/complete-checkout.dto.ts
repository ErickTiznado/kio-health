import {
  IsNumber,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsISO8601,
  Min,
} from 'class-validator';

enum PaymentStatusEnum {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

enum PaymentMethodEnum {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
}

export class CompleteCheckoutDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(PaymentStatusEnum)
  paymentStatus: 'PENDING' | 'PAID';

  @IsEnum(PaymentMethodEnum)
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER';

  @IsOptional()
  @IsISO8601()
  nextAppointmentDate?: string;

  @IsBoolean()
  shouldSendEmail: boolean;
}
