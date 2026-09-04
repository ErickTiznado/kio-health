import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientsSort, QueryPatientsDto } from './dto/query-patients.dto';
import { QueryTimelineDto } from './dto/query-timeline.dto';
import { Patient, Prisma } from '#generated/prisma';
import { EncryptionService } from '../lib/encryption.service';

/**
 * Definición canónica de "bandera de riesgo activa".
 *
 * Son dos condiciones INDEPENDIENTES, no una redundante: `resolveRiskFlags()`
 * sólo fija `resolvedAt` cuando el array de tipos queda vacío, así que una fila
 * resuelta parcialmente conserva `resolvedAt: null` con tipos dentro, y una
 * fila puede tener `resolvedAt: null` con `flagTypes: []` si nunca se calculó
 * ninguna bandera. Comprobar sólo una de las dos cuenta pacientes de más.
 */
const ACTIVE_RISK_FLAG_FILTER: Prisma.RiskFlagWhereInput = {
  resolvedAt: null,
  flagTypes: { isEmpty: false },
};

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async getClinicianId(userId: string): Promise<string> {
    const profile = await this.prisma.clinicianProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException(
        'Perfil de clínico no encontrado para este usuario',
      );
    }

    return profile.id;
  }

  async create(clinicianId: string, createPatientDto: CreatePatientDto) {
    const {
      emergencyContact,
      diagnosis,
      clinicalContext,
      contactPhone,
      medicacionActual,
      alergias,
      ...data
    } = createPatientDto;

    const encryptedDiagnosis = diagnosis
      ? this.encryptionService.encrypt(diagnosis)
      : undefined;
    const encryptedClinicalContext = clinicalContext
      ? this.encryptionService.encrypt(clinicalContext)
      : undefined;
    const encryptedContactPhone = contactPhone
      ? this.encryptionService.encrypt(contactPhone)
      : undefined;
    const encryptedEmergencyContact = emergencyContact
      ? this.encryptionService.encrypt(JSON.stringify(emergencyContact))
      : undefined;
    const encryptedMedicacionActual = medicacionActual
      ? this.encryptionService.encrypt(medicacionActual)
      : undefined;
    const encryptedAlergias = alergias
      ? this.encryptionService.encrypt(alergias)
      : undefined;

    const createdPatient = await this.prisma.patient.create({
      data: {
        ...data,
        diagnosis: encryptedDiagnosis,
        clinicalContext: encryptedClinicalContext,
        contactPhone: encryptedContactPhone,
        emergencyContact: encryptedEmergencyContact,
        medicacionActual: encryptedMedicacionActual,
        alergias: encryptedAlergias,
        clinician: { connect: { id: clinicianId } },
      },
    });

    return this.decryptPatient(createdPatient);
  }

  async findAll(
    clinicianId: string,
    query: QueryPatientsDto,
  ): Promise<{
    data: any[];
    meta: { total: number; page: number; lastPage: number };
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      riskFlag,
      hasBalance,
      sort,
    } = query;
    const skip = (page - 1) * limit;

    if (sort === PatientsSort.BALANCE && hasBalance !== true) {
      throw new BadRequestException(
        'sort=balance sólo está disponible junto con hasBalance=true: el saldo pendiente es un agregado de citas, no una columna ordenable de pacientes.',
      );
    }

    const where: Prisma.PatientWhereInput = { clinicianId };

    if (status) {
      where.status = status;
    } else {
      where.status = { not: 'ARCHIVED' };
    }

    // Note: contactPhone is now encrypted — DB-level phone search is not possible.
    // Search is restricted to fullName only.
    if (search) {
      where.OR = [{ fullName: { contains: search, mode: 'insensitive' } }];
    }

    // Bandera de riesgo: relación en texto plano, filtrable en SQL. Misma
    // definición que `getActiveRiskFlagsCount()`. El caso `false` va por `NOT`
    // (y no por `OR`) porque `OR` ya lo ocupa la búsqueda por nombre: escribir
    // ahí lo pisaría y convertiría el filtro en una búsqueda distinta.
    if (riskFlag === true) {
      where.riskFlag = ACTIVE_RISK_FLAG_FILTER;
    } else if (riskFlag === false) {
      where.NOT = { riskFlag: ACTIVE_RISK_FLAG_FILTER };
    }

    // Saldo pendiente: NO es una columna, se agrega desde `appointments`. En el
    // camino sin filtro el agregado corre DESPUÉS del `findMany` y sólo sobre
    // los ids de la página, que es lo barato. Pero filtrar con eso dejaría
    // mintiendo a `count()` y a `meta.lastPage`, porque contarían pacientes que
    // el filtro descarta. Cuando hay filtro de saldo se INVIERTE el orden:
    // primero el agregado sobre todas las citas del clínico, y los patientId
    // resultantes entran en el `where` para que conteo y paginación cuadren.
    let balances: Map<string, number> | null = null;
    if (hasBalance !== undefined) {
      balances = await this.getPendingBalances(clinicianId);
      const owingIds = [...balances.keys()];
      where.id = hasBalance ? { in: owingIds } : { notIn: owingIds };

      if (hasBalance && sort === PatientsSort.BALANCE) {
        return this.findAllByBalanceDesc(where, balances, page, limit, skip);
      }
    }

    const orderBy: Prisma.PatientOrderByWithRelationInput = {
      createdAt: 'desc',
    };

    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { riskFlag: true },
      }),
      this.prisma.patient.count({ where }),
    ]);

    // Sin filtro de saldo el agregado se acota a la página (no encarecer la
    // ruta normal); con filtro ya se calculó entero arriba y se reutiliza.
    const balanceByPatient =
      balances ??
      (await this.getPendingBalances(
        clinicianId,
        data.map((p) => p.id),
      ));

    return {
      data: data.map((p) => ({
        ...this.decryptPatient(p),
        pendingBalance: balanceByPatient.get(p.id) ?? 0,
      })),
      meta: { total, page, lastPage: Math.ceil(total / limit) },
    };
  }

  /**
   * Suma de citas COMPLETED con pago PENDING, por paciente.
   *
   * Sin `patientIds` cubre toda la cartera del clínico; con ellos se acota al
   * subconjunto pedido. Sólo devuelve importes > 0: una sesión completada de
   * precio 0 no es saldo pendiente, y el listado ya representa la ausencia de
   * saldo como `pendingBalance: 0`.
   */
  private async getPendingBalances(
    clinicianId: string,
    patientIds?: string[],
  ): Promise<Map<string, number>> {
    const balances = new Map<string, number>();
    if (patientIds && patientIds.length === 0) return balances;

    const grouped = await this.prisma.appointment.groupBy({
      by: ['patientId'],
      where: {
        clinicianId,
        ...(patientIds ? { patientId: { in: patientIds } } : {}),
        status: 'COMPLETED',
        paymentStatus: 'PENDING',
      },
      _sum: { price: true },
    });

    for (const row of grouped) {
      const amount = Number(row._sum.price ?? 0);
      if (amount > 0) balances.set(row.patientId, amount);
    }

    return balances;
  }

  /**
   * Listado ordenado por saldo pendiente descendente.
   *
   * Prisma no puede expresar este orden (`pendingBalance` es un agregado de
   * otra tabla), así que se ordena en el servicio. Es exacto — no "ordena la
   * página" — porque el conjunto ya está acotado por `hasBalance=true` a los
   * pacientes que deben algo: se materializan sus ids, se ordenan enteros y
   * sólo después se pagina. `total` sale de ese mismo conjunto, no de un
   * `count()` aparte, así que `lastPage` sigue cuadrando.
   *
   * Desempate por id ascendente: sin él, dos saldos iguales podrían caer en
   * distinto orden entre peticiones y una fila se repetiría o se perdería al
   * pasar de página.
   */
  private async findAllByBalanceDesc(
    where: Prisma.PatientWhereInput,
    balances: Map<string, number>,
    page: number,
    limit: number,
    skip: number,
  ): Promise<{
    data: any[];
    meta: { total: number; page: number; lastPage: number };
  }> {
    const matching = await this.prisma.patient.findMany({
      where,
      select: { id: true },
    });
    const total = matching.length;
    const matchingIds = new Set(matching.map((p) => p.id));

    const pageIds = [...balances.entries()]
      .filter(([id]) => matchingIds.has(id))
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([id]) => id)
      .slice(skip, skip + limit);

    // El `where` completo se conserva (incluido `clinicianId`): acotar por ids
    // no debe ser lo único que separa a un clínico de la cartera de otro.
    const rows = pageIds.length
      ? await this.prisma.patient.findMany({
          where: { ...where, id: { in: pageIds } },
          include: { riskFlag: true },
        })
      : [];
    const byId = new Map(rows.map((row) => [row.id, row]));

    const data = pageIds
      .map((id) => byId.get(id))
      .filter((row): row is (typeof rows)[number] => row !== undefined)
      .map((row) => ({
        ...this.decryptPatient(row),
        pendingBalance: balances.get(row.id) ?? 0,
      }));

    return {
      data,
      meta: { total, page, lastPage: Math.ceil(total / limit) },
    };
  }

  /**
   * Métricas de asistencia del paciente (agregado de estados de citas).
   */
  async getAttendance(patientId: string, clinicianId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, clinicianId },
      select: { id: true },
    });
    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    const [byStatus, cancelledByPatient, lastCompleted] = await Promise.all([
      this.prisma.appointment.groupBy({
        by: ['status'],
        where: { patientId, clinicianId },
        _count: { _all: true },
      }),
      this.prisma.appointment.count({
        where: {
          patientId,
          clinicianId,
          status: 'CANCELLED',
          cancelledBy: 'PATIENT',
        },
      }),
      this.prisma.appointment.findFirst({
        where: { patientId, clinicianId, status: 'COMPLETED' },
        orderBy: { startTime: 'desc' },
        select: { startTime: true },
      }),
    ]);

    const count = (status: string) =>
      byStatus.find((g) => g.status === status)?._count._all ?? 0;
    const completed = count('COMPLETED');
    const noShow = count('NO_SHOW');

    return {
      completed,
      noShow,
      cancelled: count('CANCELLED'),
      cancelledByPatient,
      attendanceRate:
        completed + noShow > 0 ? completed / (completed + noShow) : null,
      lastCompletedAt: lastCompleted?.startTime ?? null,
    };
  }

  /**
   * Señal de retención: pacientes ACTIVE sin sesión completada reciente y
   * sin cita próxima agendada.
   */
  async findInactive(clinicianId: string, days: number) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const patients = await this.prisma.patient.findMany({
      where: {
        clinicianId,
        status: 'ACTIVE',
        appointments: {
          none: {
            status: { in: ['COMPLETED', 'SCHEDULED', 'IN_PROGRESS'] },
            startTime: { gt: cutoff },
          },
        },
      },
      select: { id: true, fullName: true, createdAt: true },
      orderBy: { fullName: 'asc' },
    });

    if (patients.length === 0) return [];

    const lastVisits = await this.prisma.appointment.groupBy({
      by: ['patientId'],
      where: {
        clinicianId,
        patientId: { in: patients.map((p) => p.id) },
        status: 'COMPLETED',
      },
      _max: { startTime: true },
    });
    const lastByPatient = new Map(
      lastVisits.map((v) => [v.patientId, v._max.startTime]),
    );

    return patients.map((p) => ({
      ...p,
      lastCompletedAt: lastByPatient.get(p.id) ?? null,
    }));
  }

  async findOne(id: string, clinicianId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, clinicianId },
      include: {
        appointments: {
          select: {
            id: true,
            startTime: true,
            status: true,
            paymentStatus: true,
            paymentMethod: true,
            price: true,
          },
          orderBy: { startTime: 'desc' },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    }

    return this.decryptPatient(patient);
  }

  async getActiveRiskFlagsCount(clinicianId: string): Promise<number> {
    // El conteo se resuelve entero en SQL. Antes se traían todos los pacientes
    // con su riskFlag y se filtraba en memoria, lo que crecía con la cartera
    // del clínico para devolver un solo número.
    return this.prisma.patient.count({
      where: {
        clinicianId,
        status: { not: 'ARCHIVED' },
        riskFlag: ACTIVE_RISK_FLAG_FILTER,
      },
    });
  }

  async getTimeline(id: string, clinicianId: string, query: QueryTimelineDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    await this.findOne(id, clinicianId);

    const where: Prisma.AppointmentWhereInput = {
      patientId: id,
      clinicianId,
      status: 'COMPLETED',
    };

    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'desc' },
        include: { psychNote: true },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    const data = appointments.map((apt) => {
      if (!apt.psychNote) return apt;

      const decryptedPrivateNotes = apt.psychNote.privateNotes
        ? this.encryptionService.decrypt(apt.psychNote.privateNotes)
        : apt.psychNote.privateNotes;

      let decryptedContent = apt.psychNote.content;
      if (typeof decryptedContent === 'string') {
        const raw = this.encryptionService.decrypt(decryptedContent);
        decryptedContent = JSON.parse(raw) as typeof decryptedContent;
      }

      return {
        ...apt,
        psychNote: {
          ...apt.psychNote,
          privateNotes: decryptedPrivateNotes,
          content: decryptedContent,
        },
      };
    });

    return { data, meta: { total, page, lastPage: Math.ceil(total / limit) } };
  }

  async getMoodHistory(id: string, clinicianId: string) {
    await this.findOne(id, clinicianId);

    const notes = await this.prisma.psychNote.findMany({
      where: {
        patientId: id,
        appointment: { clinicianId },
        moodRating: { not: null },
      },
      select: {
        moodRating: true,
        appointment: { select: { startTime: true } },
      },
      orderBy: { appointment: { startTime: 'asc' } },
    });

    return notes.map((n) => ({
      date: n.appointment.startTime,
      mood: n.moodRating,
    }));
  }

  async getLastNote(id: string, clinicianId: string) {
    await this.findOne(id, clinicianId);

    const lastNote = await this.prisma.psychNote.findFirst({
      where: { patientId: id, appointment: { clinicianId } },
      orderBy: { createdAt: 'desc' },
    });

    if (lastNote?.privateNotes) {
      lastNote.privateNotes = this.encryptionService.decrypt(
        lastNote.privateNotes,
      );
    }

    return lastNote;
  }

  async update(
    id: string,
    clinicianId: string,
    updatePatientDto: UpdatePatientDto,
  ) {
    await this.findOne(id, clinicianId);

    const {
      emergencyContact,
      diagnosis,
      clinicalContext,
      contactPhone,
      medicacionActual,
      alergias,
      ...data
    } = updatePatientDto;

    const encryptedDiagnosis =
      diagnosis !== undefined
        ? diagnosis
          ? this.encryptionService.encrypt(diagnosis)
          : null
        : undefined;
    const encryptedClinicalContext =
      clinicalContext !== undefined
        ? clinicalContext
          ? this.encryptionService.encrypt(clinicalContext)
          : null
        : undefined;
    const encryptedContactPhone =
      contactPhone !== undefined
        ? contactPhone
          ? this.encryptionService.encrypt(contactPhone)
          : null
        : undefined;
    const encryptedEmergencyContact =
      emergencyContact !== undefined
        ? emergencyContact
          ? this.encryptionService.encrypt(JSON.stringify(emergencyContact))
          : null
        : undefined;
    const encryptedMedicacionActual =
      medicacionActual !== undefined
        ? medicacionActual
          ? this.encryptionService.encrypt(medicacionActual)
          : null
        : undefined;
    const encryptedAlergias =
      alergias !== undefined
        ? alergias
          ? this.encryptionService.encrypt(alergias)
          : null
        : undefined;

    const updatedPatient = await this.prisma.patient.update({
      where: { id },
      data: {
        ...data,
        ...(encryptedDiagnosis !== undefined && {
          diagnosis: encryptedDiagnosis,
        }),
        ...(encryptedClinicalContext !== undefined && {
          clinicalContext: encryptedClinicalContext,
        }),
        ...(encryptedContactPhone !== undefined && {
          contactPhone: encryptedContactPhone,
        }),
        ...(encryptedEmergencyContact !== undefined && {
          emergencyContact: encryptedEmergencyContact,
        }),
        ...(encryptedMedicacionActual !== undefined && {
          medicacionActual: encryptedMedicacionActual,
        }),
        ...(encryptedAlergias !== undefined && {
          alergias: encryptedAlergias,
        }),
      },
    });

    return this.decryptPatient(updatedPatient);
  }

  async archive(id: string, clinicianId: string) {
    await this.findOne(id, clinicianId);
    return this.prisma.patient.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  async unarchive(id: string, clinicianId: string) {
    await this.findOne(id, clinicianId);
    return this.prisma.patient.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
  }

  async getScalesHistory(patientId: string, clinicianId: string) {
    await this.findOne(patientId, clinicianId);
    return this.prisma.clinicalScale.findMany({
      where: { patientId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        scaleType: true,
        totalScore: true,
        riskLevel: true,
        createdAt: true,
        appointment: { select: { startTime: true } },
      },
    });
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private decryptPatient(
    patient: Patient & { appointments?: unknown[] },
  ): typeof patient {
    const result = { ...patient } as Omit<
      typeof patient,
      'emergencyContact'
    > & {
      emergencyContact: unknown;
    };

    if (result.diagnosis) {
      result.diagnosis = this.encryptionService.decrypt(result.diagnosis);
    }
    if (result.clinicalContext) {
      result.clinicalContext = this.encryptionService.decrypt(
        result.clinicalContext,
      );
    }
    if (result.contactPhone) {
      result.contactPhone = this.encryptionService.decrypt(result.contactPhone);
    }
    if (result.emergencyContact) {
      const raw = this.encryptionService.decrypt(
        result.emergencyContact as string,
      );
      result.emergencyContact = JSON.parse(raw) as unknown;
    }
    if (result.medicacionActual) {
      result.medicacionActual = this.encryptionService.decrypt(
        result.medicacionActual,
      );
    }
    if (result.alergias) {
      result.alergias = this.encryptionService.decrypt(result.alergias);
    }

    return result as typeof patient;
  }
}
