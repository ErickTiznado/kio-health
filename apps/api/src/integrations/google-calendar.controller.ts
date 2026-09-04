import { Controller, Get, Delete, Logger, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { GoogleCalendarService } from './google-calendar.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('integrations/google')
export class GoogleCalendarController {
  private readonly logger = new Logger(GoogleCalendarController.name);

  constructor(private readonly googleService: GoogleCalendarService) {}

  @Get('auth')
  getAuthUrl(
    @CurrentUser() user: { clinicianId?: string },
    @Res() res: Response,
  ) {
    if (!user.clinicianId) {
      return res.status(400).json({ error: 'Usuario no es un clínico' });
    }
    const url = this.googleService.getAuthUrl(user.clinicianId);
    return res.json({ url });
  }

  // Público a la fuerza: lo invoca Google, sin JWT. El clinicianId viaja en `state`.
  @Public()
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string, // state contains clinicianId
    @Res() res: Response,
  ) {
    if (!code || !state) {
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings?error=google_auth_failed`,
      );
    }

    try {
      await this.googleService.handleCallback(code, state);
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings?success=google_connected`,
      );
    } catch (error) {
      this.logger.error(
        `Google Callback Error: ${(error as Error).message}`,
        (error as Error).stack,
      );
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings?error=google_auth_failed`,
      );
    }
  }

  @Delete('disconnect')
  async disconnect(@CurrentUser() user: { clinicianId?: string }) {
    if (!user.clinicianId) return { ok: false };

    await this.googleService.disconnect(user.clinicianId);
    return { ok: true };
  }
}
