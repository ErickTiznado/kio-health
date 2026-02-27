import { IsArray, IsEnum, IsInt, Max, Min, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ScaleType } from '#generated/prisma';

export class CreateClinicalScaleDto {
  @IsEnum(ScaleType)
  scaleType: ScaleType;

  @IsArray()
  @ArrayMinSize(7)
  @ArrayMaxSize(9)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(3, { each: true })
  scores: number[];
}
