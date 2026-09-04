import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '#generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(clinicianId: string, patientId: string, dto: CreateTaskDto) {
    // Ownership a nivel de query: el paciente debe pertenecer al clínico.
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, clinicianId },
      select: { id: true },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    return this.prisma.task.create({
      data: {
        patientId,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async findAll(clinicianId: string, patientId: string) {
    return this.prisma.task.findMany({
      where: { patientId, patient: { clinicianId } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(clinicianId: string, id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findFirst({
      where: { id, patient: { clinicianId } },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Campo por campo, no `...dto`: el ValidationPipe global de main.ts no
    // lleva `whitelist: true`, así que un body con campos extra llegaría a
    // Prisma tal cual.
    const data: Prisma.TaskUpdateInput = {};
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.isCompleted !== undefined) data.isCompleted = dto.isCompleted;
    if (dto.dueDate !== undefined) data.dueDate = new Date(dto.dueDate);

    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async remove(clinicianId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, patient: { clinicianId } },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    return this.prisma.task.delete({
      where: { id },
    });
  }
}
