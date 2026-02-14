import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Appointment, Patient, PsychNote, ClinicianProfile, User } from '../../prisma/generated/client';

@Injectable()
export class ExportService {
  async generateSessionPdf(
    appointment: Appointment & { patient: Patient; psychNote: PsychNote | null; clinician: ClinicianProfile & { user: User } },
    includePrivateNotes: boolean,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Header
      doc.fontSize(20).text('Reporte de Sesión Clínica', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Fecha de Generación: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.moveDown();

      // Patient Info
      doc.fontSize(14).text('Información del Paciente');
      doc.fontSize(12).text(`Nombre: ${appointment.patient.fullName}`);
      if (appointment.patient.dateOfBirth) {
        doc.text(`Fecha de Nacimiento: ${appointment.patient.dateOfBirth.toLocaleDateString()}`);
      }
      doc.moveDown();

      // Session Info
      doc.fontSize(14).text('Detalles de la Sesión');
      doc.text(`Fecha: ${appointment.startTime.toLocaleDateString()} ${appointment.startTime.toLocaleTimeString()}`);
      doc.text(`Tipo: ${appointment.type}`);
      doc.text(`Estado: ${appointment.status}`);
      doc.moveDown();

      // Clinical Note
      if (appointment.psychNote) {
        doc.fontSize(14).text('Nota Clínica');
        const content = appointment.psychNote.content as any;
        const type = appointment.psychNote.templateType;

        doc.fontSize(12).text(`Plantilla: ${type}`);
        doc.moveDown(0.5);

        if (type === 'SOAP') {
          if (content.s) doc.text(`Subjetivo:
${content.s}`).moveDown(0.5);
          if (content.o) doc.text(`Objetivo:
${content.o}`).moveDown(0.5);
          if (content.a) doc.text(`Análisis:
${content.a}`).moveDown(0.5);
          if (content.p) doc.text(`Plan:
${content.p}`).moveDown(0.5);
        } else {
          doc.text(content.body || content.notes || 'Sin contenido estructurado.');
        }
        
        doc.moveDown();

        // Mood
        if (appointment.psychNote.moodRating) {
           doc.text(`Estado de Ánimo: ${appointment.psychNote.moodRating}/10`);
           doc.moveDown();
        }

        // Private Notes (Conditional)
        if (includePrivateNotes && appointment.psychNote.privateNotes) {
           doc.fontSize(14).fillColor('red').text('Notas Privadas (Confidencial)', { underline: true });
           doc.fillColor('black').fontSize(12).text(appointment.psychNote.privateNotes); // Assumes already decrypted passed in
           doc.moveDown();
        }
      } else {
        doc.text('No hay nota clínica registrada para esta sesión.');
        doc.moveDown();
      }

      // Footer (GDPR/HIPAA)
      doc.moveDown(2);
      doc.fontSize(8).fillColor('grey').text(
        'Documento Confidencial. Solo para uso clínico. Contiene información de salud protegida (PHI/GDPR).',
        { align: 'center', width: 500 }
      );

      doc.end();
    });
  }
}
