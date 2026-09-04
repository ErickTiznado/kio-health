import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CurrentClinician } from '../auth/decorators/current-clinician.decorator';

// Protegido por el JwtAuthGuard global (ver app.module.ts).
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post()
  async create(
    @CurrentClinician() clinicianId: string,
    @Body() dto: CreateTransactionDto,
  ) {
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

  /** Saldos por cobrar: sesiones COMPLETED con pago PENDING, por paciente. */
  @Get('outstanding')
  async getOutstanding(@CurrentClinician() clinicianId: string) {
    return this.financeService.getOutstanding(clinicianId);
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

  /**
   * Corregir un movimiento MANUAL. Los generados por el cobro de una cita se
   * rechazan con 400: los gobierna el ciclo de la cita.
   *
   * Declarado después de las rutas literales (`summary`, `outstanding`,
   * `transactions`) por costumbre, aunque aquí no puede ensombrecerlas: son GET
   * y esto es PATCH.
   */
  @Patch(':id')
  async update(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.financeService.update(clinicianId, id, dto);
  }

  /** Borrar un movimiento MANUAL. Mismo criterio que `update`. */
  @Delete(':id')
  async remove(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.financeService.remove(clinicianId, id);
  }
}
