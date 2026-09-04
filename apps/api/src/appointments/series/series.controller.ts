import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { SeriesService } from './series.service';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';
import { CurrentClinician } from '../../auth/decorators/current-clinician.decorator';

// Protegido por el JwtAuthGuard global (ver app.module.ts).
// Ownership a nivel de query: SeriesService filtra por clinicianId.
@Controller('appointment-series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  /** Crea la serie y materializa la ventana. Devuelve conflictos saltados. */
  @Post()
  async create(
    @CurrentClinician() clinicianId: string,
    @Body() dto: CreateSeriesDto,
  ) {
    return this.seriesService.createSeries(clinicianId, dto);
  }

  @Get(':id')
  async findOne(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) seriesId: string,
  ) {
    return this.seriesService.getSeries(clinicianId, seriesId);
  }

  /** Edición "esta y las siguientes" (hora, duración, precio, fin). */
  @Patch(':id')
  async update(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) seriesId: string,
    @Body() dto: UpdateSeriesDto,
  ) {
    return this.seriesService.updateSeriesFuture(clinicianId, seriesId, dto);
  }

  /** Cancela las ocurrencias futuras; las pasadas quedan intactas. */
  @Delete(':id')
  async cancel(
    @CurrentClinician() clinicianId: string,
    @Param('id', ParseUUIDPipe) seriesId: string,
  ) {
    return this.seriesService.cancelSeries(clinicianId, seriesId);
  }
}
