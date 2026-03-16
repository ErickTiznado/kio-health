import { Controller, Get, Delete, Query, Res, UseGuards, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { GoogleCalendarService } from './google-calendar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('integrations/google')
export class GoogleCalendarController {
  constructor(private readonly googleService: GoogleCalendarService) {}

  @UseGuards(JwtAuthGuard)
  @Get('auth')
  getAuthUrl(
    @CurrentUser() user: { clinicianId?: string },
    @Res() res: Response
  ) {
    if (!user.clinicianId) {
      return res.status(400).json({ error: 'Usuario no es un clínico' });
    }
    const url = this.googleService.getAuthUrl(user.clinicianId);
    return res.json({ url });
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string, // state contains clinicianId
    @Res() res: Response
  ) {
    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings?error=google_auth_failed`);
    }

    try {
      await this.googleService.handleCallback(code, state);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings?success=google_connected`);
    } catch (error) {
      console.error('Google Callback Error:', error);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings?error=google_auth_failed`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('disconnect')
  async disconnect(@CurrentUser() user: { clinicianId?: string }) {
    if (!user.clinicianId) return { ok: false };
    
    await this.googleService.disconnect(user.clinicianId);
    return { ok: true };
  }
}
