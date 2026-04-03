import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../lib/encryption.service';
import type { CreateAddendumDto } from './dto/create-addendum.dto';
import { AccessLogService } from '../access-log/access-log.service';

const ADDENDUM_WINDOW_DAYS = 30;

@Injectable()
export class AddendumService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
    private accessLogService: AccessLogService,
  ) {}

  /**
   * Create a new addendum for a note (bypass 24h restriction)
   * Rules:
   * - Can be created up to ADDENDUM_WINDOW_DAYS after appointment.endTime
   * - After that window, ForbiddenException
   * - Content and privateNotes are encrypted
   */
  async createAddendum(
    appointmentId: string,
    createdBy: string,
    dto: CreateAddendumDto,
    reqContext?: any
  ): Promise<any> {
    // Find appointment
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
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

    // Create addendum
    const addendum = await this.prisma.psychNoteAddendum.create({
      data: {
        appointmentId,
        patientId: appointment.patientId,
        content: encryptedContent,
        privateNotes: encryptedPrivateNotes,
        createdBy,
        type: 'ADDENDUM',
      },
    });

    // Log the action
    await this.accessLogService.logAccess(
      createdBy,
      'CREATE_ADDENDUM',
      'PsychNoteAddendum',
      appointment.patientId,
      `Created addendum for appointment ${appointmentId}`,
      reqContext?.ip,
      reqContext?.headers?.['user-agent']
    );

    return addendum;
  }

  /**
   * Get all addendums for an appointment (decrypted)
   */
  async getAddendums(appointmentId: string): Promise<any[]> {
    const addendums = await this.prisma.psychNoteAddendum.findMany({
      where: { appointmentId },
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
   * Get single addendum (decrypted)
   */
  async getAddendum(id: string): Promise<any> {
    const addendum = await this.prisma.psychNoteAddendum.findUnique({
      where: { id },
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
