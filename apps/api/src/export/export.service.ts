import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as path from 'path';
import * as fs from 'fs';
import {
  Appointment,
  Patient,
  PsychNote,
  ClinicianProfile,
  User,
} from '#generated/prisma';

// ── Brand tokens ─────────────────────────────────────────────────────────────
const C_KANJI = '#8a72d1'; // primary brand purple
const C_KIO = '#ae93fe'; // lighter accent
const C_CRUZ = '#ddd3fa'; // pale accent
const C_DARK = '#1e1b4b'; // near-black
const C_BODY = '#374151'; // body text
const C_SUBTLE = '#9ca3af'; // labels / secondary
const C_WHITE = '#ffffff';
const C_CARD = '#f7f5ff'; // very pale purple card bg
const C_RED = '#e11d48'; // rose for private notes

// ── Page geometry ────────────────────────────────────────────────────────────
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const INNER_W = PAGE_W - MARGIN * 2;
const FOOTER_H = 44;
const CONTENT_BOTTOM = PAGE_H - FOOTER_H - 10;

// ── Localization helpers ──────────────────────────────────────────────────────
function fmtDate(d: Date): string {
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
function fmtTime(d: Date): string {
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}
const TYPE_LABELS: Record<string, string> = {
  CONSULTATION: 'Consulta',
  EVALUATION: 'Evaluación',
  FOLLOW_UP: 'Seguimiento',
};
const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Programada',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No asistió',
};
const TEMPLATE_LABELS: Record<string, string> = {
  SOAP: 'SOAP',
  FREE: 'Libre',
  INITIAL: 'Evaluación Inicial',
  CBT: 'TCC',
};

// ── SOAP section accent colors ────────────────────────────────────────────────
const SOAP_COLORS: Record<string, string> = {
  s: '#6366f1',
  o: '#0ea5e9',
  a: '#8b5cf6',
  p: '#10b981',
};
const SOAP_LABELS: Record<string, string> = {
  s: 'S — Subjetivo',
  o: 'O — Objetivo',
  a: 'A — Análisis',
  p: 'P — Plan',
};

@Injectable()
export class ExportService {
  // ── Watermark ──────────────────────────────────────────────────────────────
  private drawWatermark(doc: InstanceType<typeof PDFDocument>): void {
    doc.save();
    doc.rotate(-45, { origin: [PAGE_W / 2, PAGE_H / 2] });
    doc
      .fillColor(C_KANJI)
      .fillOpacity(0.04)
      .font('Helvetica-Bold')
      .fontSize(88);
    // Draw twice slightly offset for a faint shadow effect
    doc.text('KIO HEALTH', -120, PAGE_H / 2 - 44, {
      width: PAGE_W + 240,
      align: 'center',
      lineBreak: false,
    });
    doc.restore();
  }

  // ── Header band (purple gradient-like using two rects) ────────────────────
  private drawHeader(
    doc: InstanceType<typeof PDFDocument>,
    logoBuffer: Buffer | null,
    clinicianName: string,
  ): void {
    // Main band
    doc.rect(0, 0, PAGE_W, 68).fill(C_KANJI);
    // Subtle bottom accent stripe
    doc.rect(0, 64, PAGE_W, 4).fill(C_KIO);

    // Logo
    const logoX = MARGIN;
    const logoY = 12;
    if (logoBuffer) {
      try {
        doc.image(logoBuffer, logoX, logoY, { height: 44, fit: [44, 44] });
      } catch {
        // logo load failure is non-fatal — skip it
      }
    }

    // Brand name
    const textX = logoBuffer ? logoX + 52 : logoX;
    doc.fillColor(C_WHITE).fillOpacity(1).font('Helvetica-Bold').fontSize(16);
    doc.text('Kio Health', textX, 18, { lineBreak: false });

    doc.fillColor(C_WHITE).fillOpacity(0.6).font('Helvetica').fontSize(8);
    doc.text('Plataforma de Salud Mental', textX, 40, { lineBreak: false });

    // Clinician name — right aligned
    doc.fillColor(C_WHITE).fillOpacity(0.75).font('Helvetica').fontSize(8);
    doc.text(clinicianName, MARGIN, 24, {
      width: INNER_W,
      align: 'right',
      lineBreak: false,
    });

    // Confidential badge
    const badgeW = 96;
    const badgeX = PAGE_W - MARGIN - badgeW;
    doc
      .fillColor(C_WHITE)
      .fillOpacity(0.15)
      .roundedRect(badgeX, 40, badgeW, 17, 4)
      .fill();
    doc.fillColor(C_WHITE).fillOpacity(0.85).font('Helvetica-Bold').fontSize(7);
    doc.text('DOCUMENTO CONFIDENCIAL', badgeX + 5, 47, {
      width: badgeW - 10,
      align: 'center',
      lineBreak: false,
    });

    doc.fillOpacity(1);
  }

  // ── Section header bar ────────────────────────────────────────────────────
  private drawSectionHeader(
    doc: InstanceType<typeof PDFDocument>,
    label: string,
    y: number,
  ): number {
    doc.rect(MARGIN, y, INNER_W, 22).fill(C_KANJI);
    doc.fillColor(C_WHITE).fillOpacity(1).font('Helvetica-Bold').fontSize(7.5);
    doc.text(label, MARGIN + 10, y + 7, {
      width: INNER_W - 20,
      lineBreak: false,
    });
    return y + 22;
  }

  // ── Labeled field (label + value stacked) ────────────────────────────────
  private drawField(
    doc: InstanceType<typeof PDFDocument>,
    label: string,
    value: string,
    x: number,
    y: number,
    w: number,
  ): void {
    doc.fillColor(C_SUBTLE).fillOpacity(1).font('Helvetica').fontSize(7);
    doc.text(label.toUpperCase(), x, y, { width: w, lineBreak: false });
    doc.fillColor(C_BODY).fillOpacity(1).font('Helvetica').fontSize(9.5);
    doc.text(value || '—', x, y + 11, { width: w, lineBreak: false });
  }

  // ── SOAP content block with left accent bar ───────────────────────────────
  private drawSoapBlock(
    doc: InstanceType<typeof PDFDocument>,
    label: string,
    accentColor: string,
    content: string,
    y: number,
  ): number {
    const textH = doc.heightOfString(content, { width: INNER_W - 24 });
    const blockH = textH + 28;

    // Card background
    doc.rect(MARGIN, y, INNER_W, blockH).fill(C_CARD);
    // Left accent
    doc.rect(MARGIN, y, 4, blockH).fill(accentColor);

    // Section label
    doc
      .fillColor(accentColor)
      .fillOpacity(1)
      .font('Helvetica-Bold')
      .fontSize(8.5);
    doc.text(label, MARGIN + 12, y + 8, { lineBreak: false });

    // Content
    doc.fillColor(C_BODY).fillOpacity(1).font('Helvetica').fontSize(10);
    doc.text(content, MARGIN + 12, y + 20, { width: INNER_W - 24 });

    return y + blockH + 6;
  }

  // ── Mood bar ──────────────────────────────────────────────────────────────
  private drawMoodBar(
    doc: InstanceType<typeof PDFDocument>,
    mood: number,
    y: number,
  ): number {
    const blockH = 40;
    doc.rect(MARGIN, y, INNER_W, blockH).fill(C_CARD);

    doc.fillColor(C_SUBTLE).fillOpacity(1).font('Helvetica').fontSize(7);
    doc.text('ESTADO DE ÁNIMO', MARGIN + 10, y + 7, { lineBreak: false });

    // Score text
    doc.fillColor(C_KANJI).fillOpacity(1).font('Helvetica-Bold').fontSize(14);
    doc.text(`${mood}/10`, PAGE_W - MARGIN - 42, y + 12, {
      width: 42,
      align: 'right',
      lineBreak: false,
    });

    // Track
    const barX = MARGIN + 10;
    const barY = y + 24;
    const barW = INNER_W - 70;
    const barH = 7;
    doc.rect(barX, barY, barW, barH).fill('#e5e7eb');
    doc.rect(barX, barY, barW * (mood / 10), barH).fill(C_KANJI);

    return y + blockH + 8;
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  private drawFooter(doc: InstanceType<typeof PDFDocument>): void {
    const y = PAGE_H - FOOTER_H;

    // Separator line
    doc.rect(MARGIN, y, INNER_W, 1).fill(C_CRUZ);

    // Logo small
    const logoPath = path.join(__dirname, 'assets', 'logo.png');
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, MARGIN, y + 8, { height: 22 });
      } catch {
        // non-fatal
      }
    }

    // Center text
    doc.fillColor(C_SUBTLE).fillOpacity(1).font('Helvetica').fontSize(7);
    doc.text(
      'Documento Confidencial — Solo para uso clínico autorizado · Kio Health Platform',
      MARGIN + 30,
      y + 8,
      { width: INNER_W - 60, align: 'center', lineBreak: false },
    );
    doc.text(
      'Contiene información de salud protegida (PHI/GDPR/HIPAA). No distribuir sin autorización.',
      MARGIN + 30,
      y + 19,
      { width: INNER_W - 60, align: 'center', lineBreak: false },
    );

    // Right: generation date
    doc.fillColor(C_SUBTLE).fillOpacity(1).font('Helvetica').fontSize(7);
    doc.text(fmtDate(new Date()), MARGIN, y + 13, {
      width: INNER_W,
      align: 'right',
      lineBreak: false,
    });
  }

  // ── Page break check ──────────────────────────────────────────────────────
  private checkBreak(
    doc: InstanceType<typeof PDFDocument>,
    y: number,
    needed: number,
    logoBuffer: Buffer | null,
    clinicianName: string,
  ): number {
    if (y + needed > CONTENT_BOTTOM) {
      doc.addPage();
      this.drawWatermark(doc);
      this.drawFooter(doc);
      return 30; // fresh top margin (no header band on continuation pages)
    }
    return y;
  }

  // ── Main entry point ──────────────────────────────────────────────────────
  async generateSessionPdf(
    appointment: Appointment & {
      patient: Patient;
      psychNote: PsychNote | null;
      clinician: ClinicianProfile & { user: User };
    },
    includePrivateNotes: boolean,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 0,
        size: 'A4',
        info: {
          Title: 'Reporte de Sesión Clínica — Kio Health',
          Author: appointment.clinician.user.fullName ?? 'Kio Health',
          Subject: `Sesión — ${appointment.patient.fullName}`,
          Keywords: 'confidencial,salud mental,kio health',
          Creator: 'Kio Health Platform',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (b: Buffer) => buffers.push(b));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Load logo once
      let logoBuffer: Buffer | null = null;
      const logoPath = path.join(__dirname, 'assets', 'logo.png');
      if (fs.existsSync(logoPath)) {
        try {
          logoBuffer = fs.readFileSync(logoPath);
        } catch {
          // non-fatal
        }
      }

      const { patient, psychNote: note, clinician } = appointment;
      const clinicianName = clinician.user.fullName ?? 'Profesional de Salud';

      // ── LAYER 0: Watermark ────────────────────────────────────────────────
      this.drawWatermark(doc);

      // ── LAYER 1: Header band ──────────────────────────────────────────────
      this.drawHeader(doc, logoBuffer, clinicianName);

      let y = 86;

      // ── Report title ──────────────────────────────────────────────────────
      doc.fillColor(C_DARK).fillOpacity(1).font('Helvetica-Bold').fontSize(20);
      doc.text('Reporte de Sesión Clínica', MARGIN, y, { width: INNER_W });
      y += 28;

      doc.fillColor(C_SUBTLE).fillOpacity(1).font('Helvetica').fontSize(9);
      doc.text(`Generado el ${fmtDate(new Date())}`, MARGIN, y, {
        width: INNER_W,
      });
      y += 14;

      // Decorative divider
      doc.rect(MARGIN, y, INNER_W, 2).fill(C_KIO);
      doc
        .fillColor(C_KIO)
        .fillOpacity(0.3)
        .rect(MARGIN, y + 2, INNER_W, 1)
        .fill();
      y += 16;

      // ── PATIENT SECTION ───────────────────────────────────────────────────
      y = this.drawSectionHeader(doc, 'INFORMACIÓN DEL PACIENTE', y);
      y += 10;

      const patientCardH = patient.dateOfBirth ? 72 : 56;
      doc.rect(MARGIN, y, INNER_W, patientCardH).fill(C_CARD);
      doc.rect(MARGIN, y, 4, patientCardH).fill(C_KANJI);

      // Patient name
      doc.fillColor(C_DARK).fillOpacity(1).font('Helvetica-Bold').fontSize(15);
      doc.text(patient.fullName, MARGIN + 14, y + 10, {
        width: INNER_W - 20,
        lineBreak: false,
      });

      // Status badge
      const statusBadgeX = PAGE_W - MARGIN - 70;
      doc
        .fillColor(C_KIO)
        .fillOpacity(0.25)
        .roundedRect(statusBadgeX, y + 8, 70, 16, 4)
        .fill();
      doc
        .fillColor(C_KANJI)
        .fillOpacity(1)
        .font('Helvetica-Bold')
        .fontSize(7.5);
      doc.text('ACTIVO', statusBadgeX + 4, y + 14, {
        width: 62,
        align: 'center',
        lineBreak: false,
      });

      // Fields row
      const fieldRowY = y + 32;
      const col = INNER_W / 3;

      if (patient.dateOfBirth) {
        this.drawField(
          doc,
          'Fecha de Nacimiento',
          fmtDate(new Date(patient.dateOfBirth)),
          MARGIN + 14,
          fieldRowY,
          col - 14,
        );
      }

      const phone = (patient as unknown as Record<string, string>).contactPhone;
      if (phone) {
        this.drawField(
          doc,
          'Teléfono',
          phone,
          MARGIN + 14 + col,
          fieldRowY,
          col - 14,
        );
      }

      // Session number hint
      y += patientCardH + 16;

      // ── SESSION DETAILS ───────────────────────────────────────────────────
      y = this.checkBreak(doc, y, 100, logoBuffer, clinicianName);
      y = this.drawSectionHeader(doc, 'DETALLES DE LA SESIÓN', y);
      y += 10;

      // 4 mini cards
      const cardW = (INNER_W - 9) / 4;
      const sessionCards = [
        { label: 'Fecha', value: fmtDate(appointment.startTime) },
        { label: 'Hora', value: fmtTime(appointment.startTime) },
        {
          label: 'Tipo',
          value: TYPE_LABELS[appointment.type] ?? appointment.type,
        },
        {
          label: 'Estado',
          value: STATUS_LABELS[appointment.status] ?? appointment.status,
        },
      ];

      sessionCards.forEach((card, i) => {
        const cx = MARGIN + i * (cardW + 3);
        // Card bg
        doc.rect(cx, y, cardW, 50).fill(C_CARD);
        // Top accent
        doc.rect(cx, y, cardW, 3).fill(C_KIO);
        // Label
        doc.fillColor(C_SUBTLE).fillOpacity(1).font('Helvetica').fontSize(7);
        doc.text(card.label.toUpperCase(), cx + 8, y + 10, {
          width: cardW - 16,
          lineBreak: false,
        });
        // Value
        doc
          .fillColor(C_DARK)
          .fillOpacity(1)
          .font('Helvetica-Bold')
          .fontSize(9.5);
        doc.text(card.value, cx + 8, y + 23, {
          width: cardW - 16,
          lineBreak: false,
        });
      });

      // Price if available
      if (
        (appointment as unknown as Record<string, unknown>).price !==
          undefined &&
        (appointment as unknown as Record<string, unknown>).price !== null
      ) {
        const priceStr = `${Number((appointment as unknown as Record<string, unknown>).price).toFixed(2)}`;
        const currency =
          (clinician as unknown as Record<string, string>).currency ?? 'USD';
        doc.rect(MARGIN, y + 56, INNER_W, 28).fill(C_CARD);
        doc.fillColor(C_SUBTLE).fillOpacity(1).font('Helvetica').fontSize(7);
        doc.text('HONORARIOS', MARGIN + 10, y + 62, { lineBreak: false });
        doc
          .fillColor(C_KANJI)
          .fillOpacity(1)
          .font('Helvetica-Bold')
          .fontSize(11);
        doc.text(`${currency} ${priceStr}`, MARGIN + 10, y + 72, {
          lineBreak: false,
        });
        y += 90;
      } else {
        y += 62;
      }

      // ── CLINICAL NOTE ─────────────────────────────────────────────────────
      y = this.checkBreak(doc, y, 80, logoBuffer, clinicianName);
      y = this.drawSectionHeader(doc, 'NOTA CLÍNICA', y);
      y += 10;

      if (!note) {
        doc.rect(MARGIN, y, INNER_W, 48).fill(C_CARD);
        doc.fillColor(C_SUBTLE).fillOpacity(1).font('Helvetica').fontSize(10);
        doc.text(
          'No hay nota clínica registrada para esta sesión.',
          MARGIN + 10,
          y + 18,
          { width: INNER_W - 20, align: 'center', lineBreak: false },
        );
        y += 58;
      } else {
        const content = note.content as Record<string, string>;
        const templateLabel =
          TEMPLATE_LABELS[note.templateType] ?? note.templateType;

        // Template type badge row
        doc.rect(MARGIN, y, INNER_W, 22).fill(C_CRUZ);
        doc
          .fillColor(C_KANJI)
          .fillOpacity(1)
          .font('Helvetica-Bold')
          .fontSize(8);
        doc.text(`Plantilla: ${templateLabel}`, MARGIN + 10, y + 7, {
          lineBreak: false,
        });

        // Tags if present
        const tags: string[] =
          (note as unknown as Record<string, string[]>).tags ?? [];
        if (tags.length > 0) {
          doc
            .fillColor(C_SUBTLE)
            .fillOpacity(1)
            .font('Helvetica')
            .fontSize(7.5);
          doc.text(
            `Etiquetas: ${tags.join(' · ')}`,
            PAGE_W - MARGIN - 200,
            y + 7,
            {
              width: 200,
              align: 'right',
              lineBreak: false,
            },
          );
        }

        y += 28;

        if (note.templateType === 'SOAP') {
          for (const key of ['s', 'o', 'a', 'p']) {
            const val = content[key];
            if (val && String(val).trim()) {
              y = this.checkBreak(doc, y, 60, logoBuffer, clinicianName);
              y = this.drawSoapBlock(
                doc,
                SOAP_LABELS[key],
                SOAP_COLORS[key],
                String(val).trim(),
                y,
              );
            }
          }
        } else {
          // FREE / INITIAL / CBT — render body
          const body = content.body ?? content.notes ?? '';
          if (body.trim()) {
            y = this.checkBreak(doc, y, 60, logoBuffer, clinicianName);
            const textH = doc.heightOfString(body.trim(), {
              width: INNER_W - 24,
            });
            doc.rect(MARGIN, y, INNER_W, textH + 20).fill(C_CARD);
            doc.rect(MARGIN, y, 4, textH + 20).fill(C_KIO);
            doc.fillColor(C_BODY).fillOpacity(1).font('Helvetica').fontSize(10);
            doc.text(body.trim(), MARGIN + 12, y + 10, { width: INNER_W - 24 });
            y += textH + 28;
          }
        }

        // Mood rating
        if (note.moodRating) {
          y = this.checkBreak(doc, y, 50, logoBuffer, clinicianName);
          y = this.drawMoodBar(doc, note.moodRating, y);
        }

        // Private notes
        if (includePrivateNotes && note.privateNotes) {
          y = this.checkBreak(doc, y, 60, logoBuffer, clinicianName);
          y += 6;

          const pvH = doc.heightOfString(note.privateNotes, {
            width: INNER_W - 24,
          });
          const pvBlockH = pvH + 40;
          doc.rect(MARGIN, y, INNER_W, pvBlockH).fill('#fff1f2');
          doc.rect(MARGIN, y, 4, pvBlockH).fill(C_RED);

          doc
            .fillColor(C_RED)
            .fillOpacity(1)
            .font('Helvetica-Bold')
            .fontSize(8);
          doc.text(
            '🔒  NOTAS PRIVADAS — SOLO PARA EL CLÍNICO',
            MARGIN + 12,
            y + 8,
            { lineBreak: false },
          );
          doc
            .fillColor('#7f1d1d')
            .fillOpacity(1)
            .font('Helvetica')
            .fontSize(10);
          doc.text(note.privateNotes, MARGIN + 12, y + 22, {
            width: INNER_W - 24,
          });
          y += pvBlockH + 10;
        }
      }

      // ── SIGNATURE BLOCK ───────────────────────────────────────────────────
      y = this.checkBreak(doc, y, 60, logoBuffer, clinicianName);
      y += 10;
      doc.rect(MARGIN, y, INNER_W, 1).fill(C_CRUZ);
      y += 10;

      doc.fillColor(C_SUBTLE).fillOpacity(1).font('Helvetica').fontSize(8);
      doc.text('Elaborado por', MARGIN, y, { lineBreak: false });
      y += 13;
      doc.fillColor(C_DARK).fillOpacity(1).font('Helvetica-Bold').fontSize(11);
      doc.text(clinicianName, MARGIN, y, { lineBreak: false });
      y += 14;

      const licenseNumber = (clinician as unknown as Record<string, string>)
        .licenseNumber;
      if (licenseNumber) {
        doc.fillColor(C_SUBTLE).fillOpacity(1).font('Helvetica').fontSize(8);
        doc.text(`Cédula / Licencia: ${licenseNumber}`, MARGIN, y, {
          lineBreak: false,
        });
      }

      // ── FOOTER ────────────────────────────────────────────────────────────
      this.drawFooter(doc);

      doc.end();
    });
  }
}
