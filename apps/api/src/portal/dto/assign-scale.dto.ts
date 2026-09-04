import { IsEnum } from 'class-validator';
import { ScaleType } from '#generated/prisma';

export class AssignScaleDto {
  @IsEnum(ScaleType)
  scaleType: ScaleType;
}
