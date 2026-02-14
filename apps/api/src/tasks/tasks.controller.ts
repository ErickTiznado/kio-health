import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('patients/:patientId/tasks')
  create(@Param('patientId') patientId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(patientId, dto);
  }

  @Get('patients/:patientId/tasks')
  findAll(@Param('patientId') patientId: string) {
    return this.tasksService.findAll(patientId);
  }

  @Patch('tasks/:id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete('tasks/:id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
