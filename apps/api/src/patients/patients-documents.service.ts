import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { StorageClient } from '@supabase/storage-js';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { UploadDocumentDto } from './dto/upload-document.dto';

const BUCKET = 'patient-documents';
const SIGNED_URL_EXPIRY = 60 * 60; // 1 hour

@Injectable()
export class PatientDocumentsService {
  private readonly storage: StorageClient | undefined;

  constructor(private readonly prisma: PrismaService) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      this.storage = new StorageClient(`${url}/storage/v1`, {
        apikey: key,
        Authorization: `Bearer ${key}`,
      });
    }
  }

  private getStorage(): StorageClient {
    if (!this.storage) {
      throw new InternalServerErrorException(
        'Document storage is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing)',
      );
    }
    return this.storage;
  }

  async uploadDocument(
    patientId: string,
    clinicianId: string,
    file: Express.Multer.File,
    dto: UploadDocumentDto,
  ) {
    await this.assertPatientOwnership(patientId, clinicianId);

    const ext = extname(file.originalname);
    const storagePath = `${clinicianId}/${patientId}/${uuidv4()}${ext}`;

    const { error } = await this.getStorage()
      .from(BUCKET)
      .upload(storagePath, file.buffer, { contentType: file.mimetype });

    if (error) {
      throw new InternalServerErrorException(`Error al subir archivo: ${error.message}`);
    }

    return this.prisma.patientDocument.create({
      data: {
        patientId,
        clinicianId,
        fileName: storagePath,
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

  async getSignedUrl(
    patientId: string,
    docId: string,
    clinicianId: string,
  ): Promise<{ signedUrl: string; mimeType: string; originalName: string }> {
    await this.assertPatientOwnership(patientId, clinicianId);

    const doc = await this.prisma.patientDocument.findFirst({
      where: { id: docId, patientId, clinicianId },
    });

    if (!doc) throw new NotFoundException('Documento no encontrado');

    const { data, error } = await this.getStorage()
      .from(BUCKET)
      .createSignedUrl(doc.fileName, SIGNED_URL_EXPIRY);

    if (error || !data?.signedUrl) {
      throw new InternalServerErrorException('No se pudo generar el link de descarga');
    }

    return { signedUrl: data.signedUrl, mimeType: doc.mimeType, originalName: doc.originalName };
  }

  async deleteDocument(patientId: string, docId: string, clinicianId: string) {
    await this.assertPatientOwnership(patientId, clinicianId);

    const doc = await this.prisma.patientDocument.findFirst({
      where: { id: docId, patientId, clinicianId },
    });

    if (!doc) throw new NotFoundException('Documento no encontrado');

    await this.prisma.patientDocument.delete({ where: { id: docId } });

    await this.getStorage().from(BUCKET).remove([doc.fileName]);
  }

  private async assertPatientOwnership(patientId: string, clinicianId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, clinicianId },
      select: { id: true },
    });

    if (!patient) throw new ForbiddenException('No tienes acceso a este paciente');
  }
}
