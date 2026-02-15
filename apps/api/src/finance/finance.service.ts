import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType } from '@prisma/client';
import { endOfMonth } from 'date-fns';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  private async resolveClinicianProfile(userId: string) {
    const profile = await this.prisma.clinicianProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Clinician profile not found');
    }
    return profile;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    const profile = await this.resolveClinicianProfile(userId);
    
    return this.prisma.financeTransaction.create({
      data: {
        clinicianId: profile.id,
        type: dto.type,
        category: dto.category,
        amount: dto.amount,
        description: dto.description,
        appointmentId: dto.appointmentId,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });
  }

  async createFromListener(clinicianId: string, dto: CreateTransactionDto) {
     if (dto.appointmentId) {
        const existing = await this.prisma.financeTransaction.findUnique({
          where: { appointmentId: dto.appointmentId },
        });

        if (existing) {
          return this.prisma.financeTransaction.update({
            where: { id: existing.id },
            data: {
              amount: dto.amount,
              type: dto.type,
              date: dto.date ? new Date(dto.date) : new Date(),
            },
          });
        }
     }

     return this.prisma.financeTransaction.create({
      data: {
        clinicianId,
        type: dto.type,
        category: dto.category,
        amount: dto.amount,
        description: dto.description,
        appointmentId: dto.appointmentId,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });
  }

  async findAll(userId: string, month: number, year: number) {
    const profile = await this.resolveClinicianProfile(userId);
    const startDate = new Date(year, month - 1, 1);
    const endDate = endOfMonth(startDate);

    return this.prisma.financeTransaction.findMany({
      where: {
        clinicianId: profile.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        appointment: {
          select: {
            patient: { select: { fullName: true } },
          },
        },
      },
    });
  }

  async getSummary(userId: string, month: number, year: number) {
    const transactions = await this.findAll(userId, month, year);

    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactions,
    };
  }
}
