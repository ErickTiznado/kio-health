import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  async findByDate(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Query() query: QueryAppointmentsDto,
  ) {
    return this.appointmentsService.findByDate(user.userId, query.date);
  }
}
