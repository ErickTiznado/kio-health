import { TransactionType } from '#generated/prisma';

/**
 * Alta de un ingreso ligado a una cita.
 *
 * NO es un DTO de HTTP: ninguna ruta lo acepta y por eso no lleva validadores.
 * Existe para que `appointmentId` tenga exactamente UN origen —el servidor— en
 * vez de compartir `CreateTransactionDto` con `POST /finance`, que es lo que
 * dejaba entrar el id de una cita ajena por el cuerpo de la petición (ver la
 * cabecera de `CreateTransactionDto`).
 *
 * Único emisor hoy: `AppointmentPaidListener`, que lo construye a partir de la
 * cita ya cargada por `AppointmentsService`, es decir ya comprobada contra su
 * `clinicianId`.
 */
export interface AppointmentTransactionInput {
  type: TransactionType;
  /** Si se omite, cae al `@default("General")` del schema. */
  category?: string;
  amount: number;
  description?: string;
  /** Cita a la que se cuelga el ingreso. La resuelve el servidor, nunca el cliente. */
  appointmentId: string;
  /**
   * Instante del cobro. El listener lo omite a propósito para que el servicio
   * selle `new Date()`; ver el comentario allí.
   */
  date?: string;
}
