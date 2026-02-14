import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientsDto } from './dto/query-patients.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() createPatientDto: CreatePatientDto,
  ) {
    const clinicianId = await this.patientsService.getClinicianId(user.userId);
    return this.patientsService.create(clinicianId, createPatientDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query() query: QueryPatientsDto,
  ) {
    const clinicianId = await this.patientsService.getClinicianId(user.userId);
    return this.patientsService.findAll(clinicianId, query);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    const clinicianId = await this.patientsService.getClinicianId(user.userId);
    return this.patientsService.findOne(id, clinicianId);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    const clinicianId = await this.patientsService.getClinicianId(user.userId);
    return this.patientsService.update(id, clinicianId, updatePatientDto);
  }

  @Patch(':id/archive')
  async archive(@CurrentUser() user: any, @Param('id') id: string) {
    const clinicianId = await this.patientsService.getClinicianId(user.userId);
    return this.patientsService.archive(id, clinicianId);
  }
}
