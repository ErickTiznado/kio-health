import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../lib/encryption.service';
import type { CreateAddendumDto } from './dto/create-addendum.dto';

const ADDENDUM_WINDOW_DAYS = 30;

@Injectable()
export class AddendumService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  /**
   * Create a new addendum for a note (bypass 24h restriction)
   * Rules:
   * - Ownership at query level: the appointment must belong to the clinician
   * - Can be created up to ADDENDUM_WINDOW_DAYS after appointment.endTime
   * - After that window, ForbiddenException
   * - Content and privateNotes are encrypted
   * - Audit logging (CREATE_ADDENDUM) happens in the controller, which has
   *   access to ip/user-agent — do not log here or entries get duplicated.
   */
  async createAddendum(
    clinicianId: string,
    appointmentId: string,
    createdBy: string,
    dto: CreateAddendumDto,
  ): Promise<any> {
    // Ownership: findFirst con clinicianId, nunca findUnique + post-check.
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, clinicianId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check time window (30 days from appointment end)
    const deadlineTime = new Date(appointment.endTime);
    deadlineTime.setDate(deadlineTime.getDate() + ADDENDUM_WINDOW_DAYS);
    const now = new Date();

    if (now > deadlineTime) {
      throw new ForbiddenException(
        `Los anexos solo pueden crearse dentro de ${ADDENDUM_WINDOW_DAYS} días después de la sesión.`,
      );
    }

    // Encrypt content and private notes
    const encryptedContent = this.encryptionService.encrypt(dto.content);
    const encryptedPrivateNotes = dto.privateNotes
      ? this.encryptionService.encrypt(dto.privateNotes)
      : null;

    return this.prisma.psychNoteAddendum.create({
      data: {
        appointmentId,
        patientId: appointment.patientId,
        content: encryptedContent,
        privateNotes: encryptedPrivateNotes,
        createdBy,
        type: 'ADDENDUM',
      },
    });
  }

  /**
   * Get all addendums for an appointment (decrypted).
   * Ownership at query level: only addendums of the clinician's appointments.
   */
  async getAddendums(
    clinicianId: string,
    appointmentId: string,
  ): Promise<any[]> {
    const addendums = await this.prisma.psychNoteAddendum.findMany({
      where: { appointmentId, patient: { clinicianId } },
      orderBy: { createdAt: 'asc' },
    });

    // Decrypt content
    return addendums.map((addendum) => ({
      ...addendum,
      content: this.encryptionService.decrypt(addendum.content),
      privateNotes: addendum.privateNotes
        ? this.encryptionService.decrypt(addendum.privateNotes)
        : null,
    }));
  }

  /**
   * Get single addendum (decrypted).
   * Ownership at query level: a foreign addendum is simply not found.
   */
  async getAddendum(clinicianId: string, id: string): Promise<any> {
    const addendum = await this.prisma.psychNoteAddendum.findFirst({
      where: { id, patient: { clinicianId } },
    });

    if (!addendum) {
      throw new NotFoundException('Addendum not found');
    }

    return {
      ...addendum,
      content: this.encryptionService.decrypt(addendum.content),
      privateNotes: addendum.privateNotes
        ? this.encryptionService.decrypt(addendum.privateNotes)
        : null,
    };
  }

  /**
   * Count addendums for an appointment
   */
  async countAddendums(appointmentId: string): Promise<number> {
    return this.prisma.psychNoteAddendum.count({
      where: { appointmentId },
    });
  }
}
