import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { CreateMemberAccountDto } from './dto/create-member-account.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { ClinicRole, UserRole } from '#generated/prisma';

@Injectable()
export class ClinicsService {
  constructor(private readonly prisma: PrismaService) {}

  async createClinic(clinicianId: string, dto: CreateClinicDto) {
    const existing = await this.prisma.clinicMember.findFirst({
      where: { clinicianId },
    });
    if (existing) {
      throw new ConflictException('Ya perteneces a una clínica');
    }

    return this.prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({ data: { name: dto.name } });
      await tx.clinicMember.create({
        data: { clinicId: clinic.id, clinicianId, role: ClinicRole.OWNER },
      });
      return clinic;
    });
  }

  async getMyClinic(clinicianId: string) {
    const membership = await this.prisma.clinicMember.findFirst({
      where: { clinicianId },
      include: {
        clinic: {
          include: {
            members: {
              include: {
                clinician: {
                  select: { id: true, user: { select: { email: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('No perteneces a ninguna clínica');
    }

    return membership.clinic;
  }

  async updateClinic(clinicId: string, dto: UpdateClinicDto) {
    return this.prisma.clinic.update({
      where: { id: clinicId },
      data: { name: dto.name },
    });
  }

  async deleteClinic(clinicId: string) {
    await this.prisma.clinic.delete({ where: { id: clinicId } });
  }

  async createInvitation(
    clinicId: string,
    createdById: string,
    dto: InviteMemberDto,
  ) {
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.clinicInvitation.create({
      data: {
        clinicId,
        invitedEmail: dto.email,
        invitedRole: dto.role,
        token,
        expiresAt,
        createdById,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    return { token, link: `${frontendUrl}/join/${token}` };
  }

  async listInvitations(clinicId: string) {
    return this.prisma.clinicInvitation.findMany({
      where: { clinicId, acceptedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeInvitation(clinicId: string, invitationId: string) {
    const invitation = await this.prisma.clinicInvitation.findFirst({
      where: { id: invitationId, clinicId },
    });
    if (!invitation) {
      throw new NotFoundException('Invitación no encontrada');
    }
    await this.prisma.clinicInvitation.delete({ where: { id: invitationId } });
  }

  async validateInvitationToken(token: string) {
    const invitation = await this.prisma.clinicInvitation.findUnique({
      where: { token },
      include: { clinic: { select: { name: true } } },
    });

    if (
      !invitation ||
      invitation.acceptedAt ||
      invitation.expiresAt < new Date()
    ) {
      throw new NotFoundException('Invitación no válida o expirada');
    }

    return {
      clinicName: invitation.clinic.name,
      invitedRole: invitation.invitedRole,
    };
  }

  async acceptInvitation(clinicianId: string, token: string) {
    const invitation = await this.prisma.clinicInvitation.findUnique({
      where: { token },
    });

    if (
      !invitation ||
      invitation.acceptedAt ||
      invitation.expiresAt < new Date()
    ) {
      throw new NotFoundException('Invitación no válida o expirada');
    }

    const existing = await this.prisma.clinicMember.findFirst({
      where: { clinicianId },
    });
    if (existing) {
      throw new ConflictException('Ya perteneces a una clínica');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.clinicMember.create({
        data: {
          clinicId: invitation.clinicId,
          clinicianId,
          role: invitation.invitedRole,
        },
      });
      await tx.clinicInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      });
    });
  }

  async createMemberAccount(clinicId: string, dto: CreateMemberAccountDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          passwordHash,
          role: UserRole.CLINICIAN,
        },
      });
      const profile = await tx.clinicianProfile.create({
        data: { userId: user.id, type: dto.clinicianType },
      });
      await tx.clinicMember.create({
        data: { clinicId, clinicianId: profile.id, role: dto.role },
      });
      return { userId: user.id, clinicianId: profile.id, email: user.email };
    });
  }

  async removeMember(clinicId: string, targetClinicianId: string) {
    const member = await this.prisma.clinicMember.findFirst({
      where: { clinicId, clinicianId: targetClinicianId },
    });
    if (!member) {
      throw new NotFoundException('Miembro no encontrado');
    }
    if (member.role === ClinicRole.OWNER) {
      throw new ForbiddenException(
        'No se puede remover al propietario de la clínica',
      );
    }
    await this.prisma.clinicMember.delete({ where: { id: member.id } });
  }

  async updateMemberRole(
    clinicId: string,
    targetClinicianId: string,
    dto: UpdateMemberRoleDto,
  ) {
    const member = await this.prisma.clinicMember.findFirst({
      where: { clinicId, clinicianId: targetClinicianId },
    });
    if (!member) {
      throw new NotFoundException('Miembro no encontrado');
    }
    if (member.role === ClinicRole.OWNER) {
      throw new ForbiddenException(
        'No se puede cambiar el rol del propietario',
      );
    }
    return this.prisma.clinicMember.update({
      where: { id: member.id },
      data: { role: dto.role },
    });
  }

  async getClinicPatients(clinicId: string) {
    const members = await this.prisma.clinicMember.findMany({
      where: { clinicId },
      select: { clinicianId: true },
    });
    const clinicianIds = members.map((m) => m.clinicianId);

    const patients = await this.prisma.patient.findMany({
      where: { clinicianId: { in: clinicianIds } },
      select: {
        id: true,
        fullName: true,
        status: true,
        createdAt: true,
        clinicianId: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return patients;
  }

  async getClinicFinanceSummary(clinicId: string, month: number, year: number) {
    const members = await this.prisma.clinicMember.findMany({
      where: { clinicId },
      include: {
        clinician: { select: { id: true, user: { select: { email: true } } } },
      },
    });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const results = await Promise.all(
      members.map(async (member) => {
        const transactions = await this.prisma.financeTransaction.findMany({
          where: {
            clinicianId: member.clinicianId,
            date: { gte: startDate, lt: endDate },
          },
          select: { type: true, amount: true },
        });

        const income = transactions
          .filter((t) => t.type === 'INCOME')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        const expense = transactions
          .filter((t) => t.type === 'EXPENSE')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        return {
          clinicianId: member.clinicianId,
          email: member.clinician.user.email,
          role: member.role,
          income,
          expense,
        };
      }),
    );

    return results;
  }

  async leaveClinic(clinicianId: string) {
    const membership = await this.prisma.clinicMember.findFirst({
      where: { clinicianId },
    });
    if (!membership) {
      throw new NotFoundException('No perteneces a ninguna clínica');
    }
    if (membership.role === ClinicRole.OWNER) {
      throw new ForbiddenException(
        'El propietario no puede abandonar la clínica. Elimínala o transfiere la propiedad primero.',
      );
    }
    await this.prisma.clinicMember.delete({ where: { id: membership.id } });
  }
}
