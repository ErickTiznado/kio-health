import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CIVIL_DAY, CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AppointmentTransactionInput } from './dto/appointment-transaction.input';
import { Prisma, TransactionType } from '#generated/prisma';
import {
  isValidTimeZone,
  zonedDayKey,
  zonedDayStart,
} from '../lib/timezone.util';

/**
 * Zona de reserva cuando el perfil no resuelve. Es el mismo default que
 * `ClinicianProfile.timezone` en el schema (columna NOT NULL con default), así
 * que en la práctica solo se usaría si el perfil no existiera. No se cae a UTC:
 * eso reintroduciría justo el desfase que este módulo arregla.
 */
const FALLBACK_TZ = 'America/Mexico_City';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // ── Fechas ────────────────────────────────────────────────────────────────
  //
  // `FinanceTransaction.date` es un `DateTime` y guarda DOS cosas distintas
  // según el origen del movimiento:
  //
  //  - Movimiento MANUAL → una FECHA CIVIL: el día que el clínico afirma. Lo
  //    que hay que preservar es "1 de agosto", no un instante concreto.
  //  - Ingreso de CITA   → un INSTANTE REAL: el momento en que entró el dinero.
  //
  // Se almacenan en la misma columna, así que la fecha civil se ancla al inicio
  // de ese día EN LA ZONA DEL CLÍNICO. Los bordes de los filtros de mes se
  // calculan en esa misma zona; ver `monthRange`.

  /** Zona horaria del clínico, validada. */
  private async getClinicianTimezone(clinicianId: string): Promise<string> {
    const profile = await this.prisma.clinicianProfile.findUnique({
      where: { id: clinicianId },
      select: { timezone: true },
    });

    const tz = profile?.timezone;
    return tz && isValidTimeZone(tz) ? tz : FALLBACK_TZ;
  }

  /**
   * Instante que se guarda en `FinanceTransaction.date`.
   *
   * Con `dateString` en forma civil (`YYYY-MM-DD`) devuelve el instante en que
   * ese día EMPIEZA en la zona del clínico. Antes se hacía
   * `new Date('2026-08-01')`, que JS parsea como medianoche UTC: al oeste de
   * Greenwich eso son las 18:00 del 31 de julio, y por eso un gasto del 1 de
   * agosto se listaba —y se exportaba al contador— como "31 jul".
   *
   * Sin `dateString` devuelve el instante actual: es el caso del ingreso de una
   * cita, que no es un día civil sino el momento del cobro.
   *
   * Un `dateString` que no sea civil (un ISO completo) ya ES un instante y se
   * respeta tal cual: no hay día que anclar y `zonedDayStart` lo leería mal.
   */
  private async resolveDate(
    clinicianId: string,
    dateString?: string,
  ): Promise<Date> {
    if (!dateString) return new Date();
    if (!CIVIL_DAY.test(dateString)) return new Date(dateString);

    const tz = await this.getClinicianTimezone(clinicianId);
    const anchored = zonedDayStart(dateString, tz);

    // `2026-02-31` casa con la forma civil pero no es un día: `Date.UTC` lo
    // desborda en silencio al 3 de marzo y el movimiento acabaría contado en
    // otro mes sin que nadie lo note. Si el día no sobrevive el viaje de ida y
    // vuelta, no era un día. (Un cambio de horario de verano NO dispara esto:
    // `zonedDayStart` corrige dentro del día pretendido.)
    if (zonedDayKey(anchored, tz) !== dateString) {
      throw new BadRequestException(`La fecha ${dateString} no existe.`);
    }

    return anchored;
  }

  /**
   * Bordes del mes, medio abiertos `[start, end)`, en la zona DEL CLÍNICO.
   *
   * OJO: esto tiene que ir a la par con `resolveDate`. Antes los bordes salían
   * de `new Date(year, month - 1, 1)`, es decir la zona DEL PROCESO (UTC en el
   * contenedor). Normalizar solo la fecha guardada y dejar los bordes en la
   * zona del proceso saca al movimiento de su propio mes: en una zona al este
   * de Greenwich el día 1 se guarda a las 22:00 UTC del último día del mes
   * anterior y caería en el mes anterior; en una al oeste, el ingreso de una
   * cita cobrada la tarde del día 31 se sella pasada la medianoche UTC y caería
   * en el mes siguiente. Los dos lados usan ahora el mismo huso.
   *
   * Medio abierto (`lt`, no `lte`) por lo mismo que `zonedRange`: evita el hueco
   * de milisegundo de `23:59:59.999`.
   */
  private monthRange(month: number, year: number, tz: string) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    return {
      start: zonedDayStart(`${year}-${pad(month)}-01`, tz),
      end: zonedDayStart(`${nextYear}-${pad(nextMonth)}-01`, tz),
    };
  }

  // ── Lecturas ──────────────────────────────────────────────────────────────

  private async findAllByClinicianId(
    clinicianId: string,
    month: number,
    year: number,
    tz: string,
  ) {
    const { start, end } = this.monthRange(month, year, tz);

    return this.prisma.financeTransaction.findMany({
      where: {
        clinicianId,
        date: { gte: start, lt: end },
      },
      orderBy: { date: 'desc' },
      include: {
        appointment: {
          select: {
            patient: { select: { fullName: true } },
            paymentMethod: true,
          },
        },
      },
    });
  }

  /**
   * Alta de un movimiento MANUAL, el único camino público de creación.
   *
   * No escribe `appointmentId` ni puede hacerlo: el DTO ya no lo tiene. Antes sí
   * lo copiaba del cuerpo sin comprobar de quién era la cita, y como la columna
   * es `@unique` eso permitía ocupar el hueco de una cita ajena; el detalle está
   * en la cabecera de `CreateTransactionDto`. Un movimiento nacido aquí es
   * manual por construcción, que es justo lo que `assertManual` da por hecho al
   * decidir si `update`/`remove` pueden tocarlo.
   */
  async create(clinicianId: string, dto: CreateTransactionDto) {
    return this.prisma.financeTransaction.create({
      data: {
        clinicianId,
        type: dto.type,
        category: dto.category,
        amount: dto.amount,
        description: dto.description,
        date: await this.resolveDate(clinicianId, dto.date),
      },
    });
  }

  /**
   * Alta (o actualización idempotente) del ingreso de una cita. Interna: el
   * `AppointmentTransactionInput` no tiene ruta HTTP detrás, y `appointmentId`
   * llega de una cita que `AppointmentsService` ya resolvió contra su
   * `clinicianId`.
   */
  async createFromListener(
    clinicianId: string,
    dto: AppointmentTransactionInput,
  ) {
    // Fuera de la transacción: `resolveDate` puede consultar el perfil y no
    // queremos una lectura extra dentro del bloque transaccional.
    const date = await this.resolveDate(clinicianId, dto.date);

    return this.prisma.$transaction(async (tx) => {
      if (dto.appointmentId) {
        const existing = await tx.financeTransaction.findUnique({
          where: { appointmentId: dto.appointmentId },
        });

        if (existing && existing.clinicianId !== clinicianId) {
          // Con el DTO actual esto ya no puede originarse: `appointmentId` no
          // entra por HTTP y los dos escritores del vínculo —`completeCheckout`
          // y este— lo toman de una cita ya resuelta contra su clínico. Queda
          // por las filas HEREDADAS del periodo en que `POST /finance` sí lo
          // aceptaba: como la columna es `@unique`, un ocupante podía reservar
          // la cita de otro. Sin esta comprobación el importe de ESTE clínico se
          // escribiría encima de la fila ajena y su ingreso no aparecería nunca
          // en su propio libro. Preferimos no registrarlo a registrarlo en el
          // libro de otro.
          throw new ForbiddenException(
            'La cita ya tiene un movimiento de finanzas que no es de este clínico',
          );
        }

        if (existing) {
          return tx.financeTransaction.update({
            where: { id: existing.id },
            data: {
              amount: dto.amount,
              type: dto.type,
              date,
            },
          });
        }
      }

      return tx.financeTransaction.create({
        data: {
          clinicianId,
          type: dto.type,
          category: dto.category,
          amount: dto.amount,
          description: dto.description,
          appointmentId: dto.appointmentId,
          date,
        },
      });
    });
  }

  // ── Edición y borrado de un movimiento ────────────────────────────────────

  /**
   * Propiedad a nivel de consulta: el `clinicianId` va en el `where`, así que
   * una fila ajena sencillamente no se encuentra. Nunca `findUnique` + comprobar
   * después. Calcado de `findAppointmentOrFail` en `appointments.service.ts`.
   */
  private async findTransactionOrFail(id: string, clinicianId: string) {
    const transaction = await this.prisma.financeTransaction.findFirst({
      where: { id, clinicianId },
    });

    if (!transaction) {
      throw new ForbiddenException(
        'Movimiento no encontrado o acceso denegado',
      );
    }

    return transaction;
  }

  /**
   * Un movimiento con `appointmentId` lo gobierna el ciclo de la cita: se crea
   * en `completeCheckout`, se actualiza desde el evento `appointment.paid` y se
   * borra al devolver el pago a PENDING. Editarlo por aquí crearía dos fuentes
   * de verdad para el mismo importe y el siguiente cambio de estado de la cita
   * pisaría la corrección sin avisar.
   */
  private assertManual(transaction: { appointmentId: string | null }) {
    if (transaction.appointmentId) {
      throw new BadRequestException(
        'Este movimiento viene del cobro de una cita: corrígelo desde la cita, no desde finanzas.',
      );
    }
  }

  /**
   * Columnas NOT NULL: un `null` explícito en el cuerpo no puede llegar a
   * Prisma. `PartialType` marca todo `@IsOptional()` y ese decorador salta
   * `null` igual que `undefined`, así que la validación ni lo mira; sin esta
   * comprobación, `PATCH /finance/:id` con `{"category": null}` sale por un
   * `PrismaClientValidationError` sin capturar, es decir un 500 donde el cliente
   * merece un 400.
   *
   * `description` NO entra en la lista: su columna sí es nulable y `null` es la
   * forma legítima de borrar el texto. `date` tampoco: su columna es NOT NULL
   * pero `null` es falsy, así que el `dto.date ? … : undefined` de abajo lo
   * convierte en "no la toques" sin que Prisma llegue a verlo.
   */
  private assertNoNulls(dto: UpdateTransactionDto) {
    const body = dto as Record<string, unknown>;
    const offenders = (['type', 'category', 'amount'] as const).filter(
      (field) => body[field] === null,
    );

    if (offenders.length > 0) {
      throw new BadRequestException(
        `Estos campos no admiten un valor vacío: ${offenders.join(', ')}.`,
      );
    }
  }

  async update(clinicianId: string, id: string, dto: UpdateTransactionDto) {
    const transaction = await this.findTransactionOrFail(id, clinicianId);
    this.assertManual(transaction);
    this.assertNoNulls(dto);

    // Campo a campo, nunca por spread del DTO: `undefined` deja el valor como
    // está (semántica PATCH) y ninguna propiedad de más del cuerpo —
    // `appointmentId`, `clinicianId`— puede colarse hasta Prisma.
    return this.prisma.financeTransaction.update({
      where: { id: transaction.id },
      data: {
        type: dto.type,
        category: dto.category,
        amount: dto.amount,
        description: dto.description,
        date: dto.date
          ? await this.resolveDate(clinicianId, dto.date)
          : undefined,
      },
    });
  }

  async remove(clinicianId: string, id: string) {
    const transaction = await this.findTransactionOrFail(id, clinicianId);
    this.assertManual(transaction);

    await this.prisma.financeTransaction.delete({
      where: { id: transaction.id },
    });

    return { id: transaction.id, deleted: true };
  }

  // ── Listados y agregados ──────────────────────────────────────────────────

  async findAll(clinicianId: string, month: number, year: number) {
    const tz = await this.getClinicianTimezone(clinicianId);
    return this.findAllByClinicianId(clinicianId, month, year, tz);
  }

  async findAllPaginated(
    clinicianId: string,
    month: number,
    year: number,
    type?: 'INCOME' | 'EXPENSE',
    page = 1,
    limit = 15,
  ) {
    const tz = await this.getClinicianTimezone(clinicianId);
    const { start, end } = this.monthRange(month, year, tz);
    const skip = (page - 1) * limit;

    const where: Prisma.FinanceTransactionWhereInput = {
      clinicianId,
      date: { gte: start, lt: end },
    };
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      this.prisma.financeTransaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        include: {
          appointment: {
            select: {
              patient: { select: { fullName: true } },
              paymentMethod: true,
            },
          },
        },
      }),
      this.prisma.financeTransaction.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, lastPage: Math.ceil(total / limit) },
    };
  }

  /**
   * Saldos por cobrar por paciente. Definición v1: solo sesiones COMPLETED
   * con paymentStatus PENDING cuentan como deuda (NO_SHOW no genera cobro;
   * SCHEDULED aún no se debe). Solo campos en texto plano del paciente.
   */
  async getOutstanding(clinicianId: string) {
    const groups = await this.prisma.appointment.groupBy({
      by: ['patientId'],
      where: { clinicianId, status: 'COMPLETED', paymentStatus: 'PENDING' },
      _sum: { price: true },
      _count: { _all: true },
      _min: { startTime: true },
    });

    if (groups.length === 0) {
      return { data: [], total: 0 };
    }

    const patients = await this.prisma.patient.findMany({
      where: { id: { in: groups.map((g) => g.patientId) } },
      select: { id: true, fullName: true, status: true },
    });
    const patientById = new Map(patients.map((p) => [p.id, p]));

    const data = groups
      .map((g) => ({
        patientId: g.patientId,
        fullName: patientById.get(g.patientId)?.fullName ?? '—',
        patientStatus: patientById.get(g.patientId)?.status ?? 'ACTIVE',
        total: Number(g._sum.price ?? 0),
        sessions: g._count._all,
        oldestDate: g._min.startTime,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      data,
      total: data.reduce((sum, d) => sum + d.total, 0),
    };
  }

  async getSummary(clinicianId: string, month: number, year: number) {
    // Una sola resolución de zona para todo el resumen: mes actual, mes
    // anterior y proyección tienen que estar en el MISMO huso o los totales no
    // cuadran entre sí.
    const tz = await this.getClinicianTimezone(clinicianId);

    const transactions = await this.findAllByClinicianId(
      clinicianId,
      month,
      year,
      tz,
    );

    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Previous month comparison
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevTransactions = await this.findAllByClinicianId(
      clinicianId,
      prevMonth,
      prevYear,
      tz,
    );
    const prevIncome = prevTransactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const prevExpense = prevTransactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Projection from scheduled appointments this month
    const { start, end } = this.monthRange(month, year, tz);
    const scheduledAppointments = await this.prisma.appointment.findMany({
      where: {
        clinicianId,
        status: 'SCHEDULED',
        startTime: { gte: start, lt: end },
      },
      select: { price: true },
    });
    const projection = scheduledAppointments.reduce(
      (sum, a) => sum + Number(a.price),
      0,
    );

    // Payment method breakdown (INCOME only)
    const paymentMethodBreakdown = { CASH: 0, CARD: 0, TRANSFER: 0 };
    for (const t of transactions) {
      if (t.type !== TransactionType.INCOME) continue;
      const method = t.appointment?.paymentMethod;
      if (method === 'CASH') paymentMethodBreakdown.CASH += Number(t.amount);
      else if (method === 'CARD')
        paymentMethodBreakdown.CARD += Number(t.amount);
      else if (method === 'TRANSFER')
        paymentMethodBreakdown.TRANSFER += Number(t.amount);
    }

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      projection,
      previousMonth: {
        totalIncome: prevIncome,
        totalExpense: prevExpense,
        balance: prevIncome - prevExpense,
      },
      paymentMethodBreakdown,
      transactions,
    };
  }
}
