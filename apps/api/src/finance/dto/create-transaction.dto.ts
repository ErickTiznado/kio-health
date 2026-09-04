import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { TransactionType } from '#generated/prisma';

/** Forma de un día civil: `YYYY-MM-DD`, sin hora y sin zona. */
export const CIVIL_DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Cuerpo de `POST /finance`: da de alta un movimiento MANUAL, y solo eso.
 *
 * NO lleva `appointmentId`, y no es cosmético. `FinanceTransaction.appointmentId`
 * es `@unique`, así que mientras se aceptó por HTTP —y `create()` lo escribía
 * verbatim, sin comprobar de quién era la cita— cualquier clínico autenticado
 * podía colgar una fila suya de la cita de OTRO y ocupar ese hueco único. Cuando
 * la víctima cobraba la cita, `createFromListener` encontraba la fila del
 * ocupante por `appointmentId` y la ACTUALIZABA con el importe de la víctima: su
 * ingreso nunca aparecía en su propio libro y su precio de sesión quedaba
 * escrito en una fila ajena. De propina, esa fila quedaba inmutable para
 * siempre, porque `assertManual` usa justo ese campo para separar lo manual de
 * lo automático.
 *
 * El vínculo con una cita lo escribe ahora solo el servidor, por dos caminos que
 * no pasan por aquí: `AppointmentsService.completeCheckout` (escribe la fila
 * directamente con Prisma) y `FinanceService.createFromListener`, que recibe un
 * `AppointmentTransactionInput` — un tipo interno, sin ruta HTTP detrás.
 */
export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  /**
   * Día CIVIL del movimiento, `YYYY-MM-DD`, tal y como lo afirma el clínico.
   * No lleva hora ni zona a propósito: se ancla al inicio de ese día en la zona
   * del clínico (`ClinicianProfile.timezone`) al guardarlo.
   *
   * Antes era `@IsString` libre y el servicio hacía `new Date(dto.date)`: un
   * `2026-08-01` se parseaba como medianoche UTC y al oeste de Greenwich se
   * listaba —y se exportaba al contador— como "31 jul". Aceptar solo la forma
   * civil cierra la puerta a mezclar instantes y días en la misma columna desde
   * la API pública.
   *
   * El `@Transform` normaliza la cadena vacía a `undefined` ANTES de validar:
   * `@IsOptional()` salta `null` y `undefined`, pero NO `''`, y `''` es
   * exactamente lo que manda el formulario cuando el usuario limpia la fecha
   * (el botón de limpiar del `DatePicker` y el borrado a mano de los dígitos
   * emiten `onChange(undefined)` → `field.onChange('')`). Sin esto, el alta
   * entera moría con un 400 que en pantalla solo se ve como un toast genérico,
   * sin señalar qué campo falla. Vacío significa "no afirmo ninguna fecha".
   *
   * Si se omite, el movimiento se sella con el instante actual.
   */
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  )
  @IsString()
  @Matches(CIVIL_DAY, {
    message: 'date must be in YYYY-MM-DD format',
  })
  @IsOptional()
  date?: string;
}
