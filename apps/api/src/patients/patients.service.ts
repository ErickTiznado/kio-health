import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientsDto } from './dto/query-patients.dto';
import { QueryTimelineDto } from './dto/query-timeline.dto';
import { Patient, Prisma } from '#generated/prisma';
import { EncryptionService } from '../lib/encryption.service';

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
      throw new NotFoundException('Perfil de clínico no encontrado para este usuario');
    }

    return profile.id;
  }

  async create(clinicianId: string, createPatientDto: CreatePatientDto) {
    const { emergencyContact, diagnosis, clinicalContext, contactPhone, ...data } =
      createPatientDto;

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

    const createdPatient = await this.prisma.patient.create({
      data: {
        ...data,
        diagnosis: encryptedDiagnosis,
        clinicalContext: encryptedClinicalContext,
        contactPhone: encryptedContactPhone,
        emergencyContact: encryptedEmergencyContact,
        clinician: { connect: { id: clinicianId } },
      },
    });

    return this.decryptPatient(createdPatient);
  }

  async findAll(
    clinicianId: string,
    query: QueryPatientsDto,
  ): Promise<{ data: any[]; meta: { total: number; page: number; lastPage: number } }> {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

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

    const orderBy: Prisma.PatientOrderByWithRelationInput =
      status === 'WAITLIST' ? { updatedAt: 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data: data.map((p) => this.decryptPatient(p)),
      meta: { total, page, lastPage: Math.ceil(total / limit) },
    };
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
        decryptedContent = JSON.parse(raw);
      }

      return {
        ...apt,
        psychNote: { ...apt.psychNote, privateNotes: decryptedPrivateNotes, content: decryptedContent },
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
      select: { moodRating: true, appointment: { select: { startTime: true } } },
      orderBy: { appointment: { startTime: 'asc' } },
    });

    return notes.map((n) => ({ date: n.appointment.startTime, mood: n.moodRating }));
  }

  async getLastNote(id: string, clinicianId: string) {
    await this.findOne(id, clinicianId);

    const lastNote = await this.prisma.psychNote.findFirst({
      where: { patientId: id, appointment: { clinicianId } },
      orderBy: { createdAt: 'desc' },
    });

    if (lastNote?.privateNotes) {
      lastNote.privateNotes = this.encryptionService.decrypt(lastNote.privateNotes);
    }

    return lastNote;
  }

  async update(id: string, clinicianId: string, updatePatientDto: UpdatePatientDto) {
    await this.findOne(id, clinicianId);

    const { emergencyContact, diagnosis, clinicalContext, contactPhone, ...data } =
      updatePatientDto;

    const encryptedDiagnosis =
      diagnosis !== undefined ? (diagnosis ? this.encryptionService.encrypt(diagnosis) : null) : undefined;
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

    const updatedPatient = await this.prisma.patient.update({
      where: { id },
      data: {
        ...data,
        ...(encryptedDiagnosis !== undefined && { diagnosis: encryptedDiagnosis }),
        ...(encryptedClinicalContext !== undefined && { clinicalContext: encryptedClinicalContext }),
        ...(encryptedContactPhone !== undefined && { contactPhone: encryptedContactPhone }),
        ...(encryptedEmergencyContact !== undefined && { emergencyContact: encryptedEmergencyContact }),
      },
    });

    return this.decryptPatient(updatedPatient);
  }

  async archive(id: string, clinicianId: string) {
    await this.findOne(id, clinicianId);
    return this.prisma.patient.update({ where: { id }, data: { status: 'ARCHIVED' } });
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

  private decryptPatient(patient: Patient & { appointments?: unknown[] }): typeof patient {
    const result = { ...patient } as any;

    if (result.diagnosis) {
      result.diagnosis = this.encryptionService.decrypt(result.diagnosis);
    }
    if (result.clinicalContext) {
      result.clinicalContext = this.encryptionService.decrypt(result.clinicalContext);
    }
    if (result.contactPhone) {
      result.contactPhone = this.encryptionService.decrypt(result.contactPhone);
    }
    if (result.emergencyContact) {
      const raw = this.encryptionService.decrypt(result.emergencyContact as string);
      result.emergencyContact = JSON.parse(raw);
    }

    return result;
  }
}
