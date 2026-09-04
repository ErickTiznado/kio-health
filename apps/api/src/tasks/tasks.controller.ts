import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { CurrentClinician } from '../auth/decorators/current-clinician.decorator';

// Protegido por el JwtAuthGuard global (ver app.module.ts).
// Ownership: cada método del service filtra por clinicianId a nivel de query.
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('patients/:patientId/tasks')
  create(
    @CurrentClinician() clinicianId: string,
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(clinicianId, patientId, dto);
  }

  @Get('patients/:patientId/tasks')
  findAll(
    @CurrentClinician() clinicianId: string,
    @Param('patientId', ParseUUIDPipe) patientId: string,
  ) {
    return this.tasksService.findAll(clinicianId, patientId);
  }

  @Patch('tasks/:id')
  update(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(clinicianId, id, dto);
  }

  @Delete('tasks/:id')
  remove(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tasksService.remove(clinicianId, id);
  }
}
