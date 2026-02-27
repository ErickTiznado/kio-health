import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentClinician } from '../auth/decorators/current-clinician.decorator';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) { }

  @Post()
  async create(@CurrentClinician() clinicianId: string, @Body() dto: CreateTransactionDto) {
    return this.financeService.create(clinicianId, dto);
  }

  @Get('summary')
  async getSummary(
    @CurrentClinician() clinicianId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.financeService.getSummary(
      clinicianId,
      parseInt(month),
      parseInt(year),
    );
  }

  @Get('transactions')
  async getTransactions(
    @CurrentClinician() clinicianId: string,
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('type') type?: 'INCOME' | 'EXPENSE',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.financeService.findAllPaginated(
      clinicianId,
      parseInt(month),
      parseInt(year),
      type,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 15,
    );
  }
}
