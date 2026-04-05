import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RemindersService } from '../reminders.service';

@Injectable()
export class AppointmentCancelledListener {
  constructor(private readonly remindersService: RemindersService) {}

  @OnEvent('appointment.cancelled')
  async handle(payload: { appointment: { id: string } }) {
    await this.remindersService.cancelReminder(payload.appointment.id);
  }
}
