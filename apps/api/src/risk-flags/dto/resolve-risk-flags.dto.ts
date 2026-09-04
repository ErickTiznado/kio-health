import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';
import { RiskFlagType } from '#generated/prisma';

export class ResolveRiskFlagsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(RiskFlagType, { each: true })
  flagTypesToResolve: RiskFlagType[];
}
