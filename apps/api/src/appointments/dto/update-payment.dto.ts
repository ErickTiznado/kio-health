import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { PaymentStatus, PaymentMethod } from '@prisma/client';

export class UpdatePaymentDto {
    @IsEnum(PaymentStatus)
    status: PaymentStatus;

    @IsNumber()
    @IsOptional()
    @Min(0)
    amount?: number;

    @IsEnum(PaymentMethod)
    @IsOptional()
    method?: PaymentMethod;
}
