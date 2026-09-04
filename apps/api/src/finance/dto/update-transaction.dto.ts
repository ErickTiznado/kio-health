import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';

/**
 * Cuerpo de `PATCH /finance/:id`. Todo es opcional (semántica PATCH: lo que no
 * viene no se toca).
 *
 * Ya no hace falta omitir `appointmentId`: `CreateTransactionDto` tampoco lo
 * tiene. El vínculo con una cita es lo que distingue un movimiento manual de uno
 * generado por el ciclo de la cita, y lo escribe solo el servidor —
 * `completeCheckout` y `createFromListener`, este último con su propio tipo
 * interno `AppointmentTransactionInput`. Ver la cabecera de
 * `CreateTransactionDto` para lo que pasaba cuando el campo sí entraba por HTTP.
 *
 * El `ValidationPipe` global no usa `whitelist`, así que un `appointmentId`
 * enviado de más no se rechaza — simplemente no existe en este DTO y
 * `FinanceService.update()` construye el `data` campo a campo, nunca por
 * spread, de modo que jamás llega a Prisma.
 *
 * Sobre los `null`: `PartialType` aplica `@IsOptional()` a cada campo, y
 * `@IsOptional()` salta tanto `undefined` como `null`, así que un `null`
 * explícito atraviesa la validación. En `description` es legítimo (columna
 * nulable) y borra el texto; en `type`, `category` y `amount` llegaría a
 * columnas NOT NULL, por eso `FinanceService.update()` los rechaza con un 400 en
 * vez de dejar que Prisma reviente con un 500.
 */
export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
