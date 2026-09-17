import { Injectable } from '@nestjs/common';

/** Instante en que arranco este proceso. Sirve para leer el uptime real. */
const ARRANQUE = new Date();

export interface EstadoDelServicio {
  ok: true;
  /** SHA del commit desplegado. Railway lo inyecta en el contenedor. */
  commit: string;
  entorno: string;
  arrancadoEn: string;
  uptimeSeg: number;
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Que version esta corriendo de verdad.
   *
   * Existe por un fallo concreto: el 15 de septiembre de 2026 se desplego un
   * cambio, Vercel lo publico y Railway se quedo en la version anterior. La
   * API siguio respondiendo 200 a todo, aceptando los campos nuevos y
   * descartandolos en silencio, y hicieron falta dos dias y una consulta a la
   * base de datos para descubrirlo.
   *
   * Lo que lo hizo tan dificil es que no habia forma de preguntarle a la API
   * que codigo llevaba. Ahora la hay, y cuesta una peticion.
   */
  getHealth(): EstadoDelServicio {
    return {
      ok: true,
      commit:
        process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) ??
        process.env.GIT_COMMIT_SHA?.slice(0, 7) ??
        'desconocido',
      entorno: process.env.NODE_ENV ?? 'desconocido',
      arrancadoEn: ARRANQUE.toISOString(),
      uptimeSeg: Math.round((Date.now() - ARRANQUE.getTime()) / 1000),
    };
  }
}
