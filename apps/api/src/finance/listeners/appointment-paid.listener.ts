import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FinanceService } from '../finance.service';
import { TransactionType } from '#generated/prisma';

@Injectable()
export class AppointmentPaidListener {
  constructor(private readonly financeService: FinanceService) { }

  @OnEvent('appointment.paid')
  async handleAppointmentPaidEvent(payload: any) {
    const { appointment } = payload;

    // Create transaction via service
    // Ensure createFromListener exists on service
    await this.financeService.createFromListener(appointment.clinicianId, {
      type: TransactionType.INCOME,
      category: 'Consultation',
      amount: Number(appointment.price),
      description: `Pago de cita: ${appointment.patient.fullName}`,
      appointmentId: appointment.id,
      date: new Date().toISOString(), // Use string for DTO compatibility or date object if service expects it
      // The DTO expects string for date? DTO says `date?: string`.
      // The service converts string to Date.
    });
  }
}
