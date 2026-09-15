import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  LANDING_SECTIONS,
  TrackLandingVisitDto,
} from './dto/track-landing-visit.dto';

/** Por debajo de esto la visita no llegó a leer nada: es un rebote. */
const BOUNCE_MS = 5000;

export interface LandingStats {
  rango: { desde: string; hasta: string; dias: number };
  totales: {
    visitas: number;
    waitlist: number;
    conversion: number;
    dwellMedianoSeg: number;
    rebotes: number;
  };
  /**
   * Cuanto se espera antes de ver la pagina. Va separado de `dwellMs` porque
   * responde otra pregunta: no si el mensaje convence, sino si llega a leerse.
   */
  carga: {
    medidas: number;
    loadMedianoMs: number;
    loadP75Ms: number;
    fcpMedianoMs: number;
    lentas: number;
    porRed: Array<{ red: string; visitas: number; loadMedianoMs: number }>;
  };
  porFuente: Array<{
    source: string;
    visitas: number;
    waitlist: number;
    conversion: number;
    dwellMedianoSeg: number;
  }>;
  porDia: Array<{ fecha: string; visitas: number; waitlist: number }>;
  secciones: Array<{ id: string; visitas: number; pct: number }>;
  dispositivo: { movil: number; escritorio: number };
}

@Injectable()
export class LandingAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra o actualiza una visita.
   *
   * El cliente manda varios beacons por visita (al entrar, al ocultar la
   * pestaña, al enviar el formulario) y pueden llegar desordenados. Por eso el
   * update no pisa: toma el máximo de tiempo y scroll, la unión de secciones, y
   * `waitlist` solo sube de false a true. Así un beacon tardío nunca borra lo
   * que ya sabíamos.
   */
  async track(dto: TrackLandingVisitDto): Promise<void> {
    const sections = dedupe(dto.sectionsSeen ?? []);

    const existing = await this.prisma.landingVisit.findUnique({
      where: { visitId: dto.visitId },
      select: {
        sectionsSeen: true,
        maxScrollPct: true,
        dwellMs: true,
        waitlist: true,
        loadMs: true,
      },
    });

    if (!existing) {
      await this.prisma.landingVisit.create({
        data: {
          visitId: dto.visitId,
          source: dto.source,
          utmSource: dto.utmSource ?? null,
          utmMedium: dto.utmMedium ?? null,
          utmCampaign: dto.utmCampaign ?? null,
          referrerHost: dto.referrerHost ?? null,
          device: dto.device,
          inAppBrowser: dto.inAppBrowser ?? false,
          sectionsSeen: sections,
          maxScrollPct: dto.maxScrollPct ?? 0,
          dwellMs: dto.dwellMs ?? 0,
          waitlist: dto.waitlist ?? false,
          loadMs: dto.loadMs ?? null,
          fcpMs: dto.fcpMs ?? null,
          netType: dto.netType ?? null,
        },
      });
      return;
    }

    await this.prisma.landingVisit.update({
      where: { visitId: dto.visitId },
      data: {
        sectionsSeen: dedupe([...existing.sectionsSeen, ...sections]),
        maxScrollPct: Math.max(existing.maxScrollPct, dto.maxScrollPct ?? 0),
        dwellMs: Math.max(existing.dwellMs, dto.dwellMs ?? 0),
        waitlist: existing.waitlist || (dto.waitlist ?? false),
        // La carga ocurre una sola vez por visita: el primer beacon que la
        // trae es el bueno, y los siguientes no deben pisarla.
        ...(existing.loadMs === null && dto.loadMs !== undefined
          ? {
              loadMs: dto.loadMs,
              fcpMs: dto.fcpMs ?? null,
              netType: dto.netType ?? null,
            }
          : {}),
      },
    });
  }

  /**
   * Resumen del periodo. Se lee entero en memoria: son cientos o miles de
   * filas, y calcular medianas y cobertura de secciones en JS es más claro que
   * en SQL para ese volumen. Si algún día no cabe, aquí es donde toca SQL.
   */
  async getStats(days = 30): Promise<LandingStats> {
    const hasta = new Date();
    const desde = new Date(hasta.getTime() - days * 24 * 60 * 60 * 1000);

    const visitas = await this.prisma.landingVisit.findMany({
      where: { createdAt: { gte: desde } },
      select: {
        source: true,
        device: true,
        dwellMs: true,
        waitlist: true,
        sectionsSeen: true,
        createdAt: true,
        loadMs: true,
        fcpMs: true,
        netType: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const total = visitas.length;

    const porFuenteMap = new Map<
      string,
      { visitas: number; waitlist: number; dwells: number[] }
    >();
    const porDiaMap = new Map<string, { visitas: number; waitlist: number }>();
    const seccionesMap = new Map<string, number>();
    let movil = 0;
    let rebotes = 0;

    for (const v of visitas) {
      const fuente = porFuenteMap.get(v.source) ?? {
        visitas: 0,
        waitlist: 0,
        dwells: [],
      };
      fuente.visitas += 1;
      if (v.waitlist) fuente.waitlist += 1;
      fuente.dwells.push(v.dwellMs);
      porFuenteMap.set(v.source, fuente);

      const fecha = v.createdAt.toISOString().slice(0, 10);
      const dia = porDiaMap.get(fecha) ?? { visitas: 0, waitlist: 0 };
      dia.visitas += 1;
      if (v.waitlist) dia.waitlist += 1;
      porDiaMap.set(fecha, dia);

      for (const seccion of new Set(v.sectionsSeen)) {
        seccionesMap.set(seccion, (seccionesMap.get(seccion) ?? 0) + 1);
      }

      if (v.device === 'movil') movil += 1;
      if (v.dwellMs < BOUNCE_MS || v.sectionsSeen.length <= 1) rebotes += 1;
    }

    const waitlist = visitas.filter((v) => v.waitlist).length;

    return {
      rango: {
        desde: desde.toISOString(),
        hasta: hasta.toISOString(),
        dias: days,
      },
      totales: {
        visitas: total,
        waitlist,
        conversion: ratio(waitlist, total),
        dwellMedianoSeg: Math.round(
          median(visitas.map((v) => v.dwellMs)) / 1000,
        ),
        rebotes: ratio(rebotes, total),
      },
      carga: resumenDeCarga(visitas),
      porFuente: [...porFuenteMap.entries()]
        .map(([source, f]) => ({
          source,
          visitas: f.visitas,
          waitlist: f.waitlist,
          conversion: ratio(f.waitlist, f.visitas),
          dwellMedianoSeg: Math.round(median(f.dwells) / 1000),
        }))
        .sort((a, b) => b.visitas - a.visitas),
      porDia: [...porDiaMap.entries()]
        .map(([fecha, d]) => ({ fecha, ...d }))
        .sort((a, b) => a.fecha.localeCompare(b.fecha)),
      // En orden de la página, no por volumen: así el embudo se lee de arriba
      // abajo y el escalón donde la gente abandona salta a la vista.
      secciones: LANDING_SECTIONS.map((id) => {
        const vistas = seccionesMap.get(id) ?? 0;
        return { id, visitas: vistas, pct: ratio(vistas, total) };
      }),
      dispositivo: {
        movil: ratio(movil, total),
        escritorio: ratio(total - movil, total),
      },
    };
  }
}

/** Por encima de esto la pagina llega tarde para alguien que viene de un anuncio. */
const CARGA_LENTA_MS = 2500;

interface FilaDeCarga {
  loadMs: number | null;
  fcpMs: number | null;
  netType: string | null;
}

function resumenDeCarga(visitas: FilaDeCarga[]): LandingStats['carga'] {
  const conCarga = visitas.filter(
    (v): v is FilaDeCarga & { loadMs: number } => v.loadMs !== null,
  );
  const loads = conCarga.map((v) => v.loadMs);

  const porRedMap = new Map<string, number[]>();
  for (const v of conCarga) {
    const red = v.netType ?? 'desconocida';
    porRedMap.set(red, [...(porRedMap.get(red) ?? []), v.loadMs]);
  }

  return {
    medidas: conCarga.length,
    loadMedianoMs: Math.round(median(loads)),
    loadP75Ms: Math.round(percentile(loads, 75)),
    fcpMedianoMs: Math.round(
      median(
        conCarga.filter((v) => v.fcpMs !== null).map((v) => v.fcpMs as number),
      ),
    ),
    lentas: ratio(
      loads.filter((ms) => ms > CARGA_LENTA_MS).length,
      conCarga.length,
    ),
    porRed: [...porRedMap.entries()]
      .map(([red, ms]) => ({
        red,
        visitas: ms.length,
        loadMedianoMs: Math.round(median(ms)),
      }))
      .sort((a, b) => b.visitas - a.visitas),
  };
}

/**
 * El percentil 75 acompana a la mediana a proposito: la mediana dice como le va
 * al visitante tipico, y el p75 a quien tiene el movil o la red peores — que es
 * justo el publico de un anuncio en el navegador de Instagram.
 */
function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.floor((p / 100) * sorted.length),
  );
  return sorted[index];
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}

function ratio(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 1000) / 1000;
}

/**
 * Mediana, no media. Cuatro pestañas olvidadas media hora convierten la media
 * en un número que no describe a nadie.
 */
function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}
