import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType } from '#generated/prisma';
import { endOfMonth } from 'date-fns';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) { }

  private async findAllByClinicianId(clinicianId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = endOfMonth(startDate);

    return this.prisma.financeTransaction.findMany({
      where: {
        clinicianId,
        date: { gte: startDate, lte: endDate },
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

  async create(clinicianId: string, dto: CreateTransactionDto) {
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

  async createFromListener(clinicianId: string, dto: CreateTransactionDto) {
    return this.prisma.$transaction(async (tx) => {
      if (dto.appointmentId) {
        const existing = await tx.financeTransaction.findUnique({
          where: { appointmentId: dto.appointmentId },
        });

        if (existing) {
          return tx.financeTransaction.update({
            where: { id: existing.id },
            data: {
              amount: dto.amount,
              type: dto.type,
              date: dto.date ? new Date(dto.date) : new Date(),
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
          date: dto.date ? new Date(dto.date) : new Date(),
        },
      });
    });
  }

  async findAll(clinicianId: string, month: number, year: number) {
    return this.findAllByClinicianId(clinicianId, month, year);
  }

  async findAllPaginated(
    clinicianId: string,
    month: number,
    year: number,
    type?: 'INCOME' | 'EXPENSE',
    page = 1,
    limit = 15,
  ) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = endOfMonth(startDate);
    const skip = (page - 1) * limit;

    const where: any = {
      clinicianId,
      date: { gte: startDate, lte: endDate },
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

  async getSummary(clinicianId: string, month: number, year: number) {
    const transactions = await this.findAllByClinicianId(clinicianId, month, year);

    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Previous month comparison
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevTransactions = await this.findAllByClinicianId(clinicianId, prevMonth, prevYear);
    const prevIncome = prevTransactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const prevExpense = prevTransactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Projection from scheduled appointments this month
    const startDate = new Date(year, month - 1, 1);
    const endDate = endOfMonth(startDate);
    const scheduledAppointments = await this.prisma.appointment.findMany({
      where: {
        clinicianId,
        status: 'SCHEDULED',
        startTime: { gte: startDate, lte: endDate },
      },
      select: { price: true },
    });
    const projection = scheduledAppointments.reduce((sum, a) => sum + Number(a.price), 0);

    // Payment method breakdown (INCOME only)
    const paymentMethodBreakdown = { CASH: 0, CARD: 0, TRANSFER: 0 };
    for (const t of transactions) {
      if (t.type !== TransactionType.INCOME) continue;
      const method = (t.appointment as any)?.paymentMethod;
      if (method === 'CASH') paymentMethodBreakdown.CASH += Number(t.amount);
      else if (method === 'CARD') paymentMethodBreakdown.CARD += Number(t.amount);
      else if (method === 'TRANSFER') paymentMethodBreakdown.TRANSFER += Number(t.amount);
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
