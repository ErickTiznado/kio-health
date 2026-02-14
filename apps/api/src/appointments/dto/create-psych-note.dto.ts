import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum NoteTemplateType {
  SOAP = 'SOAP',
  FREE = 'FREE',
  INITIAL = 'INITIAL',
  CBT = 'CBT',
}

export class SoapContentDto {
  @IsString()
  @IsNotEmpty()
  s: string;

  @IsString()
  @IsNotEmpty()
  o: string;

  @IsString()
  @IsNotEmpty()
  a: string;

  @IsString()
  @IsNotEmpty()
  p: string;
}

export class FreeContentDto {
  @IsString()
  @IsNotEmpty()
  body: string;
}

export class CreatePsychNoteDto {
  @IsEnum(NoteTemplateType)
  templateType: NoteTemplateType;

  @IsNotEmpty()
  @IsObject()
  content: Record<string, any>;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  moodRating?: number;

  @IsString()
  @IsOptional()
  privateNotes?: string;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}
