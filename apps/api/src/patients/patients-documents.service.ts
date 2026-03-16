import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UPLOADS_BASE_DIR } from './document-upload.config';
import { join } from 'path';
import { mkdir, rename, unlink } from 'fs/promises';

@Injectable()
export class PatientDocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadDocument(
    patientId: string,
    clinicianId: string,
    file: Express.Multer.File,
    dto: UploadDocumentDto,
  ) {
    await this.assertPatientOwnership(patientId, clinicianId);

    const targetDir = join(UPLOADS_BASE_DIR, patientId);
    await mkdir(targetDir, { recursive: true });

    const targetPath = join(targetDir, file.filename);
    await rename(file.path, targetPath);

    return this.prisma.patientDocument.create({
      data: {
        patientId,
        clinicianId,
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        category: dto.category,
      },
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        fileSize: true,
        category: true,
        createdAt: true,
      },
    });
  }

  async listDocuments(patientId: string, clinicianId: string) {
    await this.assertPatientOwnership(patientId, clinicianId);

    return this.prisma.patientDocument.findMany({
      where: { patientId, clinicianId },
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        fileSize: true,
        category: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDocumentFilePath(
    patientId: string,
    docId: string,
    clinicianId: string,
  ) {
    await this.assertPatientOwnership(patientId, clinicianId);

    const doc = await this.prisma.patientDocument.findFirst({
      where: { id: docId, patientId, clinicianId },
    });

    if (!doc) {
      throw new NotFoundException('Documento no encontrado');
    }

    const filePath = join(UPLOADS_BASE_DIR, patientId, doc.fileName);
    return { filePath, mimeType: doc.mimeType, originalName: doc.originalName };
  }

  async deleteDocument(patientId: string, docId: string, clinicianId: string) {
    await this.assertPatientOwnership(patientId, clinicianId);

    const doc = await this.prisma.patientDocument.findFirst({
      where: { id: docId, patientId, clinicianId },
    });

    if (!doc) {
      throw new NotFoundException('Documento no encontrado');
    }

    await this.prisma.patientDocument.delete({ where: { id: docId } });

    const filePath = join(UPLOADS_BASE_DIR, patientId, doc.fileName);
    try {
      await unlink(filePath);
    } catch {
      // Non-critical: file may already be missing
    }
  }

  private async assertPatientOwnership(patientId: string, clinicianId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, clinicianId },
      select: { id: true },
    });

    if (!patient) {
      throw new ForbiddenException('No tienes acceso a este paciente');
    }
  }
}
