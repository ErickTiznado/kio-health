import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
import { CompleteCheckoutDto } from './dto/complete-checkout.dto';

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

  @Patch(':id/checkout')
  async completeCheckout(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Param('id', ParseUUIDPipe) appointmentId: string,
    @Body() dto: CompleteCheckoutDto,
  ) {
    return this.appointmentsService.completeCheckout(
      user.userId,
      appointmentId,
      dto,
    );
  }
}
