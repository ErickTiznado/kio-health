import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { addWeeks } from 'date-fns';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { AppointmentsService } from '../appointments.service';
import { GoogleCalendarService } from '../../integrations/google-calendar.service';
import {
  AppointmentSeries,
  RecurrenceFrequency,
  SeriesStatus,
} from '#generated/prisma';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';

/**
 * Ventana rodante de materialización: las ocurrencias se crean como filas
 * `Appointment` reales para que reminders, Google sync, proyección financiera
 * y el calendario funcionen sin cambios. El cron diario extiende la ventana.
 */
const MATERIALIZATION_WINDOW_WEEKS = 12;

/**
 * MONTHLY = cada 4 semanas (preserva el día de la semana, que es lo que
 * significa la cadencia terapéutica). Todo el cálculo es addWeeks — sin RRULE.
 * Limitación v1 documentada: aritmética UTC plana; en países con DST la hora
 * de pared se desplaza 1h dos veces al año.
 */
const FREQUENCY_INTERVAL_WEEKS: Record<RecurrenceFrequency, number> = {
  WEEKLY: 1,
  BIWEEKLY: 2,
  MONTHLY: 4,
};

export interface MaterializeResult {
  created: MaterializedAppointment[];
  conflicts: string[];
}

export interface MaterializedAppointment {
  id: string;
  startTime: Date;
  endTime: Date;
  googleEventId: string | null;
  patient: { id: string; fullName: string };
  [key: string]: unknown;
}

@Injectable()
export class SeriesService {
  private readonly logger = new Logger(SeriesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly appointmentsService: AppointmentsService,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createSeries(clinicianId: string, dto: CreateSeriesDto) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, clinicianId },
      select: { id: true, fullName: true },
    });
    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    const profile = await this.prisma.clinicianProfile.findUnique({
      where: { id: clinicianId },
    });
    if (!profile) {
      throw new NotFoundException('Perfil de clínico no encontrado');
    }

    const anchorStart = new Date(dto.startTime);
    if (anchorStart.getTime() <= Date.now()) {
      throw new BadRequestException(
        'La primera sesión de la serie debe ser en el futuro',
      );
    }

    const until = dto.until ? new Date(dto.until) : null;
    if (until && until < anchorStart) {
      throw new BadRequestException(
        'La fecha de fin no puede ser anterior a la primera sesión',
      );
    }

    const series = await this.prisma.appointmentSeries.create({
      data: {
        clinicianId,
        patientId: dto.patientId,
        frequency: dto.frequency,
        anchorStart,
        durationMinutes: dto.duration ?? profile.sessionDefaultDuration,
        type: dto.type ?? 'CONSULTATION',
        price: dto.price ?? profile.sessionDefaultPrice,
        reason: dto.reason,
        until,
        maxOccurrences: dto.maxOccurrences,
        // Un instante antes del anchor para que la primera ocurrencia
        // (k=0) entre en la materialización.
        materializedUntil: new Date(anchorStart.getTime() - 1),
      },
    });

    const { created, conflicts } = await this.materialize(series);
    this.notifyCreated(clinicianId, created, patient.fullName);

    const fresh = await this.prisma.appointmentSeries.findUnique({
      where: { id: series.id },
    });

    return { series: fresh, created, conflicts };
  }

  async getSeries(clinicianId: string, seriesId: string) {
    const series = await this.prisma.appointmentSeries.findFirst({
      where: { id: seriesId, clinicianId },
      include: {
        patient: { select: { id: true, fullName: true } },
        appointments: {
          where: { status: 'SCHEDULED', startTime: { gt: new Date() } },
          orderBy: { startTime: 'asc' },
          select: { id: true, startTime: true, endTime: true, status: true },
        },
      },
    });

    if (!series) {
      throw new NotFoundException('Serie no encontrada');
    }

    return series;
  }

  /**
   * Edición "esta y las siguientes": actualiza la serie y reprograma las
   * ocurrencias futuras SCHEDULED. Conflictos se saltan y reportan.
   */
  async updateSeriesFuture(
    clinicianId: string,
    seriesId: string,
    dto: UpdateSeriesDto,
  ) {
    const series = await this.prisma.appointmentSeries.findFirst({
      where: { id: seriesId, clinicianId },
    });
    if (!series) {
      throw new NotFoundException('Serie no encontrada');
    }
    if (series.status === SeriesStatus.CANCELLED) {
      throw new BadRequestException('La serie ya fue cancelada');
    }

    const newUntil = dto.until ? new Date(dto.until) : series.until;
    const newDuration = dto.duration ?? series.durationMinutes;

    // La hora del anchor define la hora de pared de las ocurrencias nuevas.
    let newAnchor = series.anchorStart;
    let hours: number | null = null;
    let minutes: number | null = null;
    if (dto.timeOfDay) {
      [hours, minutes] = dto.timeOfDay.split(':').map(Number);
      newAnchor = new Date(series.anchorStart);
      newAnchor.setHours(hours, minutes, 0, 0);
    }

    const updatedSeries = await this.prisma.appointmentSeries.update({
      where: { id: series.id },
      data: {
        anchorStart: newAnchor,
        durationMinutes: newDuration,
        price: dto.price,
        reason: dto.reason,
        type: dto.type,
        until: dto.until ? newUntil : undefined,
        // Reabrir una serie ENDED si se extendió el fin.
        status:
          series.status === SeriesStatus.ENDED && dto.until
            ? SeriesStatus.ACTIVE
            : undefined,
      },
    });

    const now = new Date();
    const future = await this.prisma.appointment.findMany({
      where: {
        seriesId: series.id,
        status: 'SCHEDULED',
        startTime: { gt: now },
      },
      include: { patient: { select: { id: true, fullName: true } } },
      orderBy: { startTime: 'asc' },
    });

    const conflicts: string[] = [];
    let cancelled = 0;

    for (const appointment of future) {
      // `until` acortado → cancelar ocurrencias que quedan fuera.
      if (newUntil && appointment.startTime > newUntil) {
        await this.cancelOccurrence(clinicianId, appointment);
        cancelled++;
        continue;
      }

      let newStart = appointment.startTime;
      if (hours !== null && minutes !== null) {
        newStart = new Date(appointment.startTime);
        newStart.setHours(hours, minutes, 0, 0);
      }
      const newEnd = new Date(newStart.getTime() + newDuration * 60_000);

      const changed =
        newStart.getTime() !== appointment.startTime.getTime() ||
        newEnd.getTime() !== appointment.endTime.getTime() ||
        dto.price !== undefined ||
        dto.reason !== undefined ||
        dto.type !== undefined;
      if (!changed) continue;

      if (
        await this.appointmentsService.hasOverlap(
          clinicianId,
          newStart,
          newEnd,
          appointment.id,
        )
      ) {
        conflicts.push(appointment.startTime.toISOString());
        continue;
      }

      const updated = await this.prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          startTime: newStart,
          endTime: newEnd,
          price: dto.price,
          reason: dto.reason,
          type: dto.type,
        },
        include: { patient: { select: { id: true, fullName: true } } },
      });

      // El listener re-agenda el recordatorio con la nueva hora.
      this.eventEmitter.emit('appointment.rescheduled', {
        appointment: updated,
      });
      this.syncToGoogle(clinicianId, updated, updated.patient.fullName);
    }

    // `until` extendido → llenar la ventana con las ocurrencias nuevas.
    const refreshed = await this.prisma.appointmentSeries.findUniqueOrThrow({
      where: { id: series.id },
    });
    const { created, conflicts: extendConflicts } =
      await this.materialize(refreshed);
    if (created.length > 0) {
      this.notifyCreated(clinicianId, created, created[0].patient.fullName);
    }

    return {
      series: updatedSeries,
      rescheduled: future.length - conflicts.length - cancelled,
      cancelled,
      created,
      conflicts: [...conflicts, ...extendConflicts],
    };
  }

  /** Cancela las ocurrencias futuras y marca la serie como CANCELLED. */
  async cancelSeries(clinicianId: string, seriesId: string) {
    const series = await this.prisma.appointmentSeries.findFirst({
      where: { id: seriesId, clinicianId },
    });
    if (!series) {
      throw new NotFoundException('Serie no encontrada');
    }

    const future = await this.prisma.appointment.findMany({
      where: {
        seriesId: series.id,
        status: 'SCHEDULED',
        startTime: { gt: new Date() },
      },
      include: { patient: { select: { id: true, fullName: true } } },
    });

    for (const appointment of future) {
      await this.cancelOccurrence(clinicianId, appointment);
    }

    await this.prisma.appointmentSeries.update({
      where: { id: series.id },
      data: { status: SeriesStatus.CANCELLED },
    });

    return { cancelled: future.length };
  }

  /** Cron diario: extiende todas las series activas con ventana incompleta. */
  async extendAllDue(): Promise<void> {
    const windowEnd = addWeeks(new Date(), MATERIALIZATION_WINDOW_WEEKS);
    const dueSeries = await this.prisma.appointmentSeries.findMany({
      where: {
        status: SeriesStatus.ACTIVE,
        materializedUntil: { lt: windowEnd },
      },
      include: { patient: { select: { fullName: true } } },
    });

    for (const series of dueSeries) {
      try {
        const { created, conflicts } = await this.materialize(series);
        this.notifyCreated(
          series.clinicianId,
          created,
          series.patient.fullName,
        );
        if (conflicts.length > 0) {
          this.logger.warn(
            `Serie ${series.id}: ${conflicts.length} ocurrencias saltadas por conflicto al extender (${conflicts.join(', ')})`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error extendiendo serie ${series.id}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }
  }

  // ── Internos ─────────────────────────────────────────────────────────────

  /**
   * Crea las filas Appointment de las ocurrencias pendientes dentro de la
   * ventana. Conflictos se SALTAN (no cuentan para maxOccurrences) y se
   * devuelven para que la UI avise. Nunca re-sincroniza filas existentes.
   */
  private async materialize(
    series: AppointmentSeries,
  ): Promise<MaterializeResult> {
    const intervalWeeks = FREQUENCY_INTERVAL_WEEKS[series.frequency];
    const windowEnd = addWeeks(new Date(), MATERIALIZATION_WINDOW_WEEKS);
    const durationMs = series.durationMinutes * 60_000;

    const created: MaterializedAppointment[] = [];
    const conflicts: string[] = [];
    let occurrencesCreated = series.occurrencesCreated;
    let materializedUntil = series.materializedUntil;
    let status = series.status;

    for (let k = 0; ; k++) {
      const start = addWeeks(series.anchorStart, k * intervalWeeks);
      if (start.getTime() <= materializedUntil.getTime()) continue;
      if (start > windowEnd) break;
      if (series.until && start > series.until) {
        status = SeriesStatus.ENDED;
        break;
      }
      if (
        series.maxOccurrences !== null &&
        occurrencesCreated >= series.maxOccurrences
      ) {
        status = SeriesStatus.ENDED;
        break;
      }

      const end = new Date(start.getTime() + durationMs);
      const overlap = await this.appointmentsService.hasOverlap(
        series.clinicianId,
        start,
        end,
      );

      if (overlap) {
        conflicts.push(start.toISOString());
      } else {
        const appointment = await this.prisma.appointment.create({
          data: {
            clinicianId: series.clinicianId,
            patientId: series.patientId,
            seriesId: series.id,
            startTime: start,
            endTime: end,
            type: series.type,
            reason: series.reason,
            price: series.price,
            status: 'SCHEDULED',
            paymentStatus: 'PENDING',
          },
          include: { patient: { select: { id: true, fullName: true } } },
        });
        created.push(appointment as unknown as MaterializedAppointment);
        occurrencesCreated++;
      }

      materializedUntil = start;
    }

    await this.prisma.appointmentSeries.update({
      where: { id: series.id },
      data: { occurrencesCreated, materializedUntil, status },
    });

    return { created, conflicts };
  }

  /** Eventos + Google sync (fire-and-forget) para citas recién creadas. */
  private notifyCreated(
    clinicianId: string,
    created: MaterializedAppointment[],
    patientFullName: string,
  ): void {
    for (const appointment of created) {
      this.eventEmitter.emit('appointment.scheduled', { appointment });
      this.syncToGoogle(clinicianId, appointment, patientFullName);
    }
  }

  /** No bloquear la respuesta con N llamadas a la API de Google. */
  private syncToGoogle(
    clinicianId: string,
    appointment: MaterializedAppointment,
    patientFullName: string,
  ): void {
    void this.googleCalendarService
      .syncAppointment(clinicianId, appointment, patientFullName)
      .then((googleEventId) => {
        if (googleEventId && !appointment.googleEventId) {
          return this.prisma.appointment
            .update({
              where: { id: appointment.id },
              data: { googleEventId },
            })
            .then(() => undefined);
        }
      })
      .catch((error: unknown) =>
        this.logger.warn(
          `Google sync falló para cita ${appointment.id}: ${String(error)}`,
        ),
      );
  }

  private async cancelOccurrence(
    clinicianId: string,
    appointment: MaterializedAppointment,
  ): Promise<void> {
    const updated = await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: 'CANCELLED', cancelledBy: 'CLINICIAN' },
      include: { patient: { select: { id: true, fullName: true } } },
    });

    if (updated.googleEventId) {
      void this.googleCalendarService
        .deleteAppointment(clinicianId, updated.googleEventId)
        .catch((error: unknown) =>
          this.logger.warn(
            `Google delete falló para cita ${updated.id}: ${String(error)}`,
          ),
        );
    }

    this.eventEmitter.emit('appointment.cancelled', { appointment: updated });
  }
}
