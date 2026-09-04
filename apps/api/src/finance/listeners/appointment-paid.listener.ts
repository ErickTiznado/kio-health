import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FinanceService } from '../finance.service';
import { AppointmentTransactionInput } from '../dto/appointment-transaction.input';
import { TransactionType, Appointment, Patient } from '#generated/prisma';

export interface AppointmentPaidEvent {
  appointment: Appointment & { patient: Pick<Patient, 'fullName'> };
}

@Injectable()
export class AppointmentPaidListener {
  constructor(private readonly financeService: FinanceService) {}

  @OnEvent('appointment.paid')
  async handleAppointmentPaidEvent(payload: AppointmentPaidEvent) {
    const { appointment } = payload;

    // Sin `date` a propósito.
    //
    // Antes se mandaba `new Date().toISOString()`, que es el instante del cobro
    // —no el día de la sesión— y además ya no encaja con la forma que espera el
    // servicio, donde `date` pasó a significar un día civil `YYYY-MM-DD`.
    //
    // Se mantiene el instante del cobro, y omitirlo hace que el servicio lo
    // selle igual (`new Date()`). El libro de finanzas es de caja: una fila
    // registra cuándo ENTRÓ el dinero, no cuándo se prestó el servicio. Es
    // también lo que ya hace la otra vía de creación, `completeCheckout`, que
    // no pasa fecha y deja el `now()` del schema; si esta mandara el día de la
    // sesión, dos filas equivalentes tendrían fechas distintas según por dónde
    // se cobrara. El día de la sesión no se pierde: la fila apunta a la cita y
    // `appointment.startTime` lo conserva.
    //
    // `appointmentId` sale de la cita que emitió el evento —ya resuelta contra
    // su `clinicianId` en `AppointmentsService`—, nunca del cuerpo de una
    // petición: por eso el input es un tipo interno y no el DTO de `POST
    // /finance`.
    const input: AppointmentTransactionInput = {
      type: TransactionType.INCOME,
      category: 'Consultation',
      amount: Number(appointment.price),
      description: `Pago de cita: ${appointment.patient.fullName}`,
      appointmentId: appointment.id,
    };

    await this.financeService.createFromListener(
      appointment.clinicianId,
      input,
    );
  }
}
