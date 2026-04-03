import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AddendumService } from './addendums.service';
import { CreateAddendumDto } from './dto/create-addendum.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('appointments/:appointmentId')
@UseGuards(JwtAuthGuard)
export class AddendumsController {
  constructor(private readonly addendumService: AddendumService) {}

  @Post('addendum')
  async createAddendum(
    @Param('appointmentId') appointmentId: string,
    @Body() createAddendumDto: CreateAddendumDto,
    @Request() req: any,
  ) {
    return this.addendumService.createAddendum(
      appointmentId,
      req.user.userId,
      createAddendumDto,
      req,
    );
  }

  @Get('addendums')
  async getAddendums(@Param('appointmentId') appointmentId: string) {
    return this.addendumService.getAddendums(appointmentId);
  }
}
