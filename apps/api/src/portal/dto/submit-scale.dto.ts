import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  Max,
  Min,
} from 'class-validator';

export class SubmitScaleDto {
  @IsArray()
  @ArrayMinSize(7)
  @ArrayMaxSize(9)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(3, { each: true })
  scores: number[];
}
