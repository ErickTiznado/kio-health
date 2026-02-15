import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '#generated/prisma';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) { }

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateTransactionDto) {
    return this.financeService.create(user.userId, dto);
  }

  @Get('summary')
  async getSummary(
    @CurrentUser() user: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.financeService.getSummary(
      user.userId,
      parseInt(month),
      parseInt(year),
    );
  }
}
