import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(patientId: string, dto: CreateTaskDto) {
    // Verify patient exists? Prisma will throw if FK invalid, but good to be explicit or handle error.
    // Assuming patientId comes from verified param.
    return this.prisma.task.create({
      data: {
        patientId,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async findAll(patientId: string) {
    return this.prisma.task.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}
