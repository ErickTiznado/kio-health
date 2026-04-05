import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RemindersService } from '../reminders.service';

@Injectable()
export class AppointmentScheduledListener {
  constructor(private readonly remindersService: RemindersService) {}

  @OnEvent('appointment.scheduled')
  async handle(payload: { appointment: { id: string } }) {
    await this.remindersService.scheduleReminder(payload.appointment.id);
  }
}
