import { IsNumber, IsOptional, IsPositive, Min, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @Transform(({ value }) => {
    // Handle decimal/number conversion for Prisma Decimal type
    if (typeof value === 'string') {
      return parseFloat(value);
    }
    return value;
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  sessionDefaultPrice?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseInt(value, 10);
    }
    return value;
  })
  @IsNumber()
  @IsPositive()
  @Min(15)
  sessionDefaultDuration?: number;
}
