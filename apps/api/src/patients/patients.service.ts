import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientsDto } from './dto/query-patients.dto';
import { QueryTimelineDto } from './dto/query-timeline.dto';
import { Patient, Prisma } from '../../prisma/generated/client';
import { EncryptionService } from '../lib/encryption';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) { }

  async getClinicianId(userId: string): Promise<string> {
    const profile = await this.prisma.clinicianProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Clinician profile not found for this user');
    }

    return profile.id;
  }

  async create(clinicianId: string, createPatientDto: CreatePatientDto) {
    const { emergencyContact, ...data } = createPatientDto;

    // Convert DTO to Prisma input format
    const emergencyContactJson = emergencyContact ? (emergencyContact as any) : undefined;

    return this.prisma.patient.create({
      data: {
        ...data,
        emergencyContact: emergencyContactJson,
        clinician: { connect: { id: clinicianId } }, // Assuming clinician profile exists
      },
    });
  }

  async findAll(
    clinicianId: string,
    query: QueryPatientsDto,
  ): Promise<{ data: Patient[]; meta: { total: number; page: number; lastPage: number } }> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PatientWhereInput = {
      clinicianId, // Ensure only patients belonging to the clinician are returned
      status: { not: 'ARCHIVED' }, // Default to active patients unless specified otherwise? Or should archived be filterable?
      // For now, let's assume archived are hidden by default or we can add a filter later.
      // The prompt says "No borramos datos clínicos, solo cambiamos status: ARCHIVED."
      // It implies a soft delete behavior, so standard findAll should probably exclude them or allow filtering.
      // Let's exclude ARCHIVED by default for the main list, but maybe allow an option later.
      // For now, let's just stick to the search requirement.
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        // Could also search by phone number if needed
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          appointments: {
            where: {
              paymentStatus: 'PENDING',
              status: { notIn: ['CANCELLED', 'NO_SHOW'] }
            },
            select: { price: true },
          },
        },
      }),
      this.prisma.patient.count({ where }),
    ]);

    // Calculate totalDebt and clean up result
    const patientsWithDebt = data.map(patient => {
      const totalDebt = patient.appointments.reduce((sum, app) => sum + Number(app.price), 0);
      const { appointments, ...rest } = patient; // Remove appointments from response to keep it clean
      return { ...rest, totalDebt };
    });

    return {
      data: patientsWithDebt as any, // Cast to avoid strict type issues for now, or update return type
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
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
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    const totalDebt = patient.appointments
      .filter(app => app.paymentStatus === 'PENDING' && !['CANCELLED', 'NO_SHOW'].includes(app.status))
      .reduce((sum, app) => sum + Number(app.price), 0);

    return { ...patient, totalDebt };
  }

  async getTimeline(
    id: string,
    clinicianId: string,
    query: QueryTimelineDto,
  ) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    // Check patient existence/access
    await this.findOne(id, clinicianId);

    const where: Prisma.AppointmentWhereInput = {
      patientId: id,
      clinicianId,
      status: 'COMPLETED', // Only completed appointments have history? Or maybe all? "Citas pasadas" implies completed or past.
      // Usually timeline is about clinical history, so COMPLETED.
      // But maybe we want to see future ones too? "Trae todas las notas + citas pasadas".
      // Let's assume past/completed for now.
    };

    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        // Searching inside PsychNote content JSON is complex via Prisma API directly without Raw.
        // We'll skip deep JSON search for this MVP iteration or rely on client filtering for loaded items.
      ];
    }

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'desc' },
        include: {
          psychNote: true,
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    // Process appointments to decrypt private notes
    const data = appointments.map((apt) => {
      if (apt.psychNote && apt.psychNote.privateNotes) {
        try {
          const decrypted = EncryptionService.decrypt(apt.psychNote.privateNotes);
          return {
            ...apt,
            psychNote: { ...apt.psychNote, privateNotes: decrypted },
          };
        } catch (e) {
          console.error(`Failed to decrypt note for appointment ${apt.id}`, e);
          return apt;
        }
      }
      return apt;
    });

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async getMoodHistory(id: string, clinicianId: string) {
    await this.findOne(id, clinicianId);

    const notes = await this.prisma.psychNote.findMany({
      where: {
        patientId: id,
        appointment: { clinicianId }, // Redundant but safe
        moodRating: { not: null },
      },
      select: {
        moodRating: true,
        appointment: {
          select: { startTime: true },
        },
      },
      orderBy: { appointment: { startTime: 'asc' } },
    });

    return notes.map(n => ({
      date: n.appointment.startTime,
      mood: n.moodRating,
    }));
  }

  async getLastNote(id: string, clinicianId: string) {
    await this.findOne(id, clinicianId);

    const lastNote = await this.prisma.psychNote.findFirst({
      where: {
        patientId: id,
        appointment: { clinicianId },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (lastNote && lastNote.privateNotes) {
      try {
        lastNote.privateNotes = EncryptionService.decrypt(lastNote.privateNotes);
      } catch (e) {
        lastNote.privateNotes = null;
      }
    }

    return lastNote;
  }

  async update(id: string, clinicianId: string, updatePatientDto: UpdatePatientDto) {
    await this.findOne(id, clinicianId); // Ensure existence and ownership

    const { emergencyContact, ...data } = updatePatientDto;
    const emergencyContactJson = emergencyContact ? (emergencyContact as any) : undefined;

    return this.prisma.patient.update({
      where: { id },
      data: {
        ...data,
        ...(emergencyContactJson !== undefined && { emergencyContact: emergencyContactJson }),
      },
    });
  }

  async archive(id: string, clinicianId: string) {
    await this.findOne(id, clinicianId);

    return this.prisma.patient.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }
}
