import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '#generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Update clinician profile settings (price, duration)
   */
  async updateProfile(userId: string, data: UpdateProfileDto) {
    // Find the profile by userId
    const profile = await this.prisma.clinicianProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Perfil de clínico no encontrado');
    }

    // Build update data with proper Decimal conversion
    const updateData: Record<string, unknown> = {};

    if (data.sessionDefaultPrice !== undefined) {
      // Convert to Decimal for Prisma
      updateData.sessionDefaultPrice = new Prisma.Decimal(
        data.sessionDefaultPrice,
      );
    }

    if (data.sessionDefaultDuration !== undefined) {
      updateData.sessionDefaultDuration = data.sessionDefaultDuration;
    }

    if (data.currency !== undefined) {
      updateData.currency = data.currency;
    }

    if (data.remindersEnabled !== undefined) {
      updateData.remindersEnabled = data.remindersEnabled;
    }

    if (data.reminderLeadHours !== undefined) {
      updateData.reminderLeadHours = data.reminderLeadHours;
    }

    if (data.reminderSecondLeadHours !== undefined) {
      // null = desactivar el segundo toque
      updateData.reminderSecondLeadHours = data.reminderSecondLeadHours;
    }

    // Coherencia: el segundo toque debe ser menor que el principal.
    const nextLead =
      (updateData.reminderLeadHours as number | undefined) ??
      profile.reminderLeadHours;
    const nextSecond =
      updateData.reminderSecondLeadHours !== undefined
        ? (updateData.reminderSecondLeadHours as number | null)
        : profile.reminderSecondLeadHours;
    if (nextSecond !== null && nextSecond >= nextLead) {
      updateData.reminderSecondLeadHours = null;
    }

    // Update the profile
    const updatedProfile = await this.prisma.clinicianProfile.update({
      where: { id: profile.id },
      data: updateData,
    });

    return updatedProfile;
  }

  /**
   * Get user with profile
   */
  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }
}
