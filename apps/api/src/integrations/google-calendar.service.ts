import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { google } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  
  // These should ideally come from ConfigService
  private readonly clientId = process.env.GOOGLE_CLIENT_ID || '';
  private readonly clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  private readonly redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/integrations/google/callback';

  constructor(private readonly prisma: PrismaService) {}

  private getOAuthClient() {
    return new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );
  }

  getAuthUrl(clinicianId: string): string {
    const oauth2Client = this.getOAuthClient();
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: clinicianId,
    });
  }

  async handleCallback(code: string, clinicianId: string): Promise<void> {
    const oauth2Client = this.getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    
    await this.prisma.googleIntegration.upsert({
      where: { clinicianId },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || null,
        expiryDate: tokens.expiry_date || 0,
      },
      create: {
        clinicianId,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || null,
        expiryDate: tokens.expiry_date || 0,
      },
    });
  }

  async disconnect(clinicianId: string): Promise<void> {
    const integration = await this.prisma.googleIntegration.findUnique({
      where: { clinicianId },
    });
    
    if (!integration) return;
    
    const oauth2Client = this.getOAuthClient();
    oauth2Client.setCredentials({ access_token: integration.accessToken });
    
    try {
      await oauth2Client.revokeToken(integration.accessToken);
    } catch (e) {
      this.logger.warn(`Failed to revoke token for clinician ${clinicianId}:`, e);
    }
    
    await this.prisma.googleIntegration.delete({
      where: { clinicianId },
    });
  }

  private async getAuthorizedClient(clinicianId: string) {
    const integration = await this.prisma.googleIntegration.findUnique({
      where: { clinicianId },
    });

    if (!integration) return null;

    const oauth2Client = this.getOAuthClient();
    oauth2Client.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken,
      expiry_date: Number(integration.expiryDate),
    });

    // Auto-refresh token if expired (handled by googleapis automatically if refresh_token is present)
    // We should ideally listen to 'tokens' event to save new tokens, but for MVP let's assume it works
    oauth2Client.on('tokens', async (tokens) => {
      await this.prisma.googleIntegration.update({
        where: { clinicianId },
        data: {
          accessToken: tokens.access_token!,
          ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
          ...(tokens.expiry_date && { expiryDate: tokens.expiry_date }),
        },
      });
    });

    return { auth: oauth2Client, calendarId: integration.calendarId || 'primary' };
  }

  async syncAppointment(
    clinicianId: string, 
    appointment: any,
    patientName: string
  ): Promise<string | null> {
    const clientData = await this.getAuthorizedClient(clinicianId);
    if (!clientData) return null;

    const calendar = google.calendar({ version: 'v3', auth: clientData.auth });
    const event = {
      summary: `Consulta: ${patientName}`,
      description: `Tipo: ${appointment.type}\nNotas: ${appointment.notes || ''}`,
      start: { dateTime: appointment.startTime.toISOString() },
      end: { dateTime: appointment.endTime.toISOString() },
    };

    try {
      if (appointment.googleEventId) {
        await calendar.events.patch({
          calendarId: clientData.calendarId,
          eventId: appointment.googleEventId,
          requestBody: event,
        });
        return appointment.googleEventId;
      } else {
        const res = await calendar.events.insert({
          calendarId: clientData.calendarId,
          requestBody: event,
        });
        return res.data.id || null;
      }
    } catch (error) {
      this.logger.error(`Failed to sync appointment ${appointment.id} to Google Calendar`, error);
      return null;
    }
  }

  async deleteAppointment(clinicianId: string, googleEventId: string): Promise<void> {
    if (!googleEventId) return;
    
    const clientData = await this.getAuthorizedClient(clinicianId);
    if (!clientData) return;

    const calendar = google.calendar({ version: 'v3', auth: clientData.auth });
    
    try {
      await calendar.events.delete({
        calendarId: clientData.calendarId,
        eventId: googleEventId,
      });
    } catch (error) {
      this.logger.error(`Failed to delete appointment ${googleEventId} from Google Calendar`, error);
    }
  }
}
