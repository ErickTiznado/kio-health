import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { PortalService, PortalActionResult } from './portal.service';
import {
  renderPortalPage,
  portalActionButton,
  appointmentDetailsCard,
} from './portal-pages.helper';
import { RescheduleRequestDto } from './dto/reschedule-request.dto';

/**
 * Acciones del paciente desde el email (confirmar / cancelar / reprogramar).
 *
 * Patrón GET+POST deliberado: el GET solo RENDERIZA una página con un
 * <form method="POST"> — nunca muta. Así un prefetch de link (escáner de
 * email, antivirus) no puede confirmar ni cancelar citas por accidente.
 */
@Controller('portal/actions')
@Throttle({ default: { limit: 20, ttl: 60000 } })
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  // ── Confirmar ────────────────────────────────────────────────────────────

  @Public()
  @Get(':token/appointments/:id/confirm')
  async confirmPage(
    @Param('token') token: string,
    @Param('id') appointmentId: string,
    @Res() res: Response,
  ) {
    const context = await this.portalService.getActionContext(
      token,
      appointmentId,
    );
    this.sendHtml(
      res,
      this.renderForContext(context, {
        alreadyDone: context.ok && context.confirmed,
        title: 'Confirma tu asistencia',
        icon: '🗓️',
        body: (c) => `
          ${appointmentDetailsCard(c)}
          <p style="margin: 16px 0 0; font-size: 14px; color: #4b5563; line-height: 1.7;">
            ¿Nos confirmas que asistirás a tu sesión?
          </p>
          ${portalActionButton(this.actionUrl(token, appointmentId, 'confirm'), 'Confirmar asistencia')}`,
      }),
    );
  }

  @Public()
  @Post(':token/appointments/:id/confirm')
  async confirmSubmit(
    @Param('token') token: string,
    @Param('id') appointmentId: string,
    @Res() res: Response,
  ) {
    const result = await this.portalService.confirmAttendance(
      token,
      appointmentId,
    );
    this.sendHtml(
      res,
      this.renderResult(result, {
        title: 'Asistencia confirmada',
        icon: '✅',
        iconColor: '#16a34a',
        body: (c) => `
          <p style="margin: 0 0 16px; font-size: 15px; color: #4b5563; line-height: 1.7;">
            Gracias, tu asistencia ha sido confirmada exitosamente.
          </p>
          <p style="margin: 0; font-size: 14px; color: #6b5ea8; line-height: 1.6;">
            👤 <strong>${c.clinicianName}</strong> te espera el ${c.formattedDate} a las ${c.formattedTime}.
          </p>`,
      }),
    );
  }

  // ── Cancelar ─────────────────────────────────────────────────────────────

  @Public()
  @Get(':token/appointments/:id/cancel')
  async cancelPage(
    @Param('token') token: string,
    @Param('id') appointmentId: string,
    @Res() res: Response,
  ) {
    const context = await this.portalService.getActionContext(
      token,
      appointmentId,
    );
    this.sendHtml(
      res,
      this.renderForContext(context, {
        title: '¿Cancelar tu cita?',
        icon: '⚠️',
        iconColor: '#d97706',
        body: (c) => `
          ${appointmentDetailsCard(c)}
          <p style="margin: 16px 0 0; font-size: 14px; color: #4b5563; line-height: 1.7;">
            Esta acción no se puede deshacer. Tu profesional será notificado.
            Si no deseas cancelar, simplemente cierra esta página.
          </p>
          ${portalActionButton(this.actionUrl(token, appointmentId, 'cancel'), 'Sí, cancelar mi cita', '#dc2626')}`,
      }),
    );
  }

  @Public()
  @Post(':token/appointments/:id/cancel')
  async cancelSubmit(
    @Param('token') token: string,
    @Param('id') appointmentId: string,
    @Res() res: Response,
  ) {
    const result = await this.portalService.cancelAppointment(
      token,
      appointmentId,
    );
    this.sendHtml(
      res,
      this.renderResult(result, {
        title: 'Cita cancelada',
        icon: '🗑️',
        iconColor: '#dc2626',
        body: () => `
          <p style="margin: 0 0 16px; font-size: 15px; color: #4b5563; line-height: 1.7;">
            Tu cita ha sido cancelada y tu profesional ha sido notificado.
          </p>
          <p style="margin: 0; font-size: 14px; color: #6b5ea8; line-height: 1.6;">
            Si deseas agendar una nueva sesión, contacta a tu profesional.
          </p>`,
      }),
    );
  }

  // ── Solicitar reprogramación ─────────────────────────────────────────────

  @Public()
  @Get(':token/appointments/:id/reschedule')
  async reschedulePage(
    @Param('token') token: string,
    @Param('id') appointmentId: string,
    @Res() res: Response,
  ) {
    const context = await this.portalService.getActionContext(
      token,
      appointmentId,
    );
    this.sendHtml(
      res,
      this.renderForContext(context, {
        alreadyDone: context.ok && context.rescheduleRequested,
        alreadyDoneVariant: 'reschedule',
        title: 'Solicitar cambio de horario',
        icon: '🔄',
        body: (c) => `
          ${appointmentDetailsCard(c)}
          <form method="POST" action="${this.actionUrl(token, appointmentId, 'reschedule')}" style="margin: 16px 0 0;">
            <label style="display: block; margin: 0 0 6px; font-size: 12px; font-weight: 600;
                          color: #9ca3af; text-transform: uppercase; letter-spacing: 0.07em;">
              Mensaje para tu profesional (opcional)
            </label>
            <textarea name="message" maxlength="500" rows="3"
                      placeholder="Ej. ¿Podría ser el mismo día pero más tarde?"
                      style="width: 100%; box-sizing: border-box; padding: 10px 12px; font-size: 14px;
                             font-family: Inter, Roboto, sans-serif; color: #1e1b4b;
                             border: 1.5px solid #ddd3fa; border-radius: 10px; resize: vertical;"></textarea>
            <div style="text-align: center; margin-top: 18px;">
              <button type="submit"
                      style="display: inline-block; padding: 13px 36px; background-color: #ae93fe;
                             color: #ffffff; font-family: Inter, Roboto, sans-serif; font-size: 15px;
                             font-weight: 700; border: none; border-radius: 10px; cursor: pointer;">
                Enviar solicitud
              </button>
            </div>
          </form>
          <p style="margin: 14px 0 0; font-size: 12px; color: #9ca3af; line-height: 1.6; text-align: center;">
            Tu cita seguirá vigente hasta que tu profesional coordine el nuevo horario contigo.
          </p>`,
      }),
    );
  }

  @Public()
  @Post(':token/appointments/:id/reschedule')
  async rescheduleSubmit(
    @Param('token') token: string,
    @Param('id') appointmentId: string,
    @Body() dto: RescheduleRequestDto,
    @Res() res: Response,
  ) {
    const result = await this.portalService.requestReschedule(
      token,
      appointmentId,
      dto.message,
    );
    this.sendHtml(
      res,
      this.renderResult(result, {
        title: 'Solicitud enviada',
        icon: '📨',
        iconColor: '#16a34a',
        body: () => `
          <p style="margin: 0 0 16px; font-size: 15px; color: #4b5563; line-height: 1.7;">
            Tu solicitud de cambio de horario fue enviada a tu profesional.
          </p>
          <p style="margin: 0; font-size: 14px; color: #6b5ea8; line-height: 1.6;">
            Te contactará para coordinar la nueva fecha. Mientras tanto, tu cita
            actual sigue vigente.
          </p>`,
      }),
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private actionUrl(
    token: string,
    appointmentId: string,
    action: 'confirm' | 'cancel' | 'reschedule',
  ): string {
    // Relativo al mismo host del API — el <form> postea al propio origen.
    return `/api/portal/actions/${encodeURIComponent(token)}/appointments/${encodeURIComponent(appointmentId)}/${action}`;
  }

  private sendHtml(res: Response, html: string): void {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.send(html);
  }

  /** Página para el GET: formulario si procede, o el estado que corresponda. */
  private renderForContext(
    context: PortalActionResult,
    options: {
      title: string;
      icon: string;
      iconColor?: string;
      body: (c: Extract<PortalActionResult, { ok: true }>) => string;
      alreadyDone?: boolean;
      alreadyDoneVariant?: 'confirm' | 'reschedule';
    },
  ): string {
    if (!context.ok) return this.renderFailure(context.reason);

    if (options.alreadyDone) {
      return options.alreadyDoneVariant === 'reschedule'
        ? this.renderFailure('already_requested')
        : this.renderFailure('already_confirmed');
    }

    return renderPortalPage({
      title: options.title,
      icon: options.icon,
      iconColor: options.iconColor ?? '#8a72d1',
      bodyHtml: options.body(context),
    });
  }

  /** Página para el POST: éxito o el fallo que corresponda. */
  private renderResult(
    result: PortalActionResult,
    success: {
      title: string;
      icon: string;
      iconColor: string;
      body: (c: Extract<PortalActionResult, { ok: true }>) => string;
    },
  ): string {
    if (!result.ok) return this.renderFailure(result.reason);

    return renderPortalPage({
      title: success.title,
      icon: success.icon,
      iconColor: success.iconColor,
      bodyHtml: success.body(result),
    });
  }

  private renderFailure(
    reason:
      | 'invalid_token'
      | 'not_found'
      | 'inactive'
      | 'already_confirmed'
      | 'already_requested',
  ): string {
    switch (reason) {
      case 'already_confirmed':
        return renderPortalPage({
          title: 'Ya confirmaste tu asistencia',
          icon: 'ℹ️',
          iconColor: '#8a72d1',
          bodyHtml: `
            <p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.7;">
              Ya habías confirmado tu asistencia anteriormente. ¡Te esperamos!
            </p>`,
        });
      case 'already_requested':
        return renderPortalPage({
          title: 'Solicitud ya registrada',
          icon: 'ℹ️',
          iconColor: '#8a72d1',
          bodyHtml: `
            <p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.7;">
              Ya solicitaste un cambio de horario para esta cita. Tu profesional
              te contactará pronto.
            </p>`,
        });
      case 'inactive':
        return renderPortalPage({
          title: 'Cita no vigente',
          icon: '⚠️',
          iconColor: '#d97706',
          bodyHtml: `
            <p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.7;">
              Esta cita ya fue completada o cancelada. Si tienes dudas, contacta
              a tu profesional.
            </p>`,
        });
      case 'invalid_token':
      case 'not_found':
      default:
        // No distinguir token inválido de cita ajena — mismo mensaje.
        return renderPortalPage({
          title: 'Enlace no válido',
          icon: '❌',
          iconColor: '#dc2626',
          bodyHtml: `
            <p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.7;">
              Este enlace no es válido o ya expiró. Si lo necesitas, pide a tu
              profesional que te envíe uno nuevo.
            </p>`,
        });
    }
  }
}
