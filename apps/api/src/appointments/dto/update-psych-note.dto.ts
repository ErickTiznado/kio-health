import { PartialType } from '@nestjs/mapped-types';
import { CreatePsychNoteDto } from './create-psych-note.dto';

export class UpdatePsychNoteDto extends PartialType(CreatePsychNoteDto) {}
