import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { UploadDocumentDto } from './dto/upload-document.dto';

const SIGNED_URL_EXPIRY = 60 * 60; // 1 hour

@Injectable()
export class PatientDocumentsService {
  private readonly s3Client: S3Client | undefined;
  private readonly bucketName: string | undefined;

  constructor(private readonly prisma: PrismaService) {
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (region && accessKeyId && secretAccessKey && this.bucketName) {
      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
  }

  private getClient(): S3Client {
    if (!this.s3Client || !this.bucketName) {
      throw new InternalServerErrorException(
        'AWS S3 is not configured properly (missing region, credentials, or bucket name)',
      );
    }
    return this.s3Client;
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

    const client = this.getClient();

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: storagePath,
        Body: file.buffer,
        ContentType: file.mimetype,
      });
      await client.send(command);
    } catch (error: any) {
      throw new InternalServerErrorException(`Error al subir archivo a S3: ${error.message}`);
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

    const client = this.getClient();

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: doc.fileName,
      });

      const signedUrl = await getSignedUrl(client, command, { expiresIn: SIGNED_URL_EXPIRY });

      return { signedUrl, mimeType: doc.mimeType, originalName: doc.originalName };
    } catch (error: any) {
      throw new InternalServerErrorException('No se pudo generar el link de descarga de S3');
    }
  }

  async downloadDocument(
    patientId: string,
    docId: string,
    clinicianId: string,
  ): Promise<{ buffer: Buffer; mimeType: string; originalName: string }> {
    await this.assertPatientOwnership(patientId, clinicianId);

    const doc = await this.prisma.patientDocument.findFirst({
      where: { id: docId, patientId, clinicianId },
    });

    if (!doc) throw new NotFoundException('Documento no encontrado');

    const client = this.getClient();

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: doc.fileName,
      });
      const response = await client.send(command);
      const byteArray = await response.Body?.transformToByteArray();

      if (!byteArray) {
        throw new Error('Cuerpo de archivo vacío');
      }

      return {
        buffer: Buffer.from(byteArray),
        mimeType: doc.mimeType,
        originalName: doc.originalName,
      };
    } catch (error: any) {
      throw new InternalServerErrorException('No se pudo descargar el archivo desde S3');
    }
  }

  async deleteDocument(patientId: string, docId: string, clinicianId: string) {
    await this.assertPatientOwnership(patientId, clinicianId);

    const doc = await this.prisma.patientDocument.findFirst({
      where: { id: docId, patientId, clinicianId },
    });

    if (!doc) throw new NotFoundException('Documento no encontrado');

    const client = this.getClient();

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: doc.fileName,
      });
      await client.send(command);
    } catch (error: any) {
      throw new InternalServerErrorException('Error al intentar eliminar el archivo de S3');
    }

    await this.prisma.patientDocument.delete({ where: { id: docId } });
  }

  private async assertPatientOwnership(patientId: string, clinicianId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, clinicianId },
      select: { id: true },
    });

    if (!patient) throw new ForbiddenException('No tienes acceso a este paciente');
  }
}
