/**
 * Chrome HTML compartido para las páginas públicas orientadas al paciente
 * (confirmación / cancelación / reprogramación desde el email). Extraído del
 * inline HTML que vivía en RemindersController para no duplicar el layout.
 *
 * Nota: sin <script> inline — el CSP de helmet (main.ts) lo bloquearía.
 * Toda mutación va por <form method="POST">, nunca por GET.
 */
export interface PortalPageOptions {
  title: string;
  icon: string;
  iconColor: string;
  bodyHtml: string;
}

export function renderPortalPage(options: PortalPageOptions): string {
  const { title, icon, iconColor, bodyHtml } = options;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — Kio Health</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f7ff; font-family: Inter, Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f7ff; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 60px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width: 480px; background-color: #ffffff; border-radius: 20px;
                      box-shadow: 0 4px 24px rgba(138, 114, 209, 0.10); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #2d2560 100%);
                       padding: 28px 40px; text-align: center;">
              <div style="font-size: 28px; margin-bottom: 8px;">${icon}</div>
              <div style="width: 40px; height: 3px; background: linear-gradient(90deg, #8a72d1, #ae93fe);
                          border-radius: 2px; margin: 0 auto;"></div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 40px 32px;">
              <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: ${iconColor}; line-height: 1.3;">
                ${title}
              </h1>
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #faf9ff; border-top: 1px solid #ede9fe;
                       padding: 20px 40px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600;
                         color: #8a72d1; letter-spacing: 0.05em; text-transform: uppercase;">
                Kio Health
              </p>
              <p style="margin: 0; font-size: 11px; color: #c4b5fd; line-height: 1.5;">
                Tu plataforma clínica de confianza
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/** Botón de acción para formularios POST (sin JS). */
export function portalActionButton(
  actionUrl: string,
  label: string,
  color = '#ae93fe',
): string {
  return `
    <form method="POST" action="${actionUrl}" style="margin: 24px 0 0; text-align: center;">
      <button type="submit"
              style="display: inline-block; padding: 13px 36px; background-color: ${color};
                     color: #ffffff; font-family: Inter, Roboto, sans-serif; font-size: 15px;
                     font-weight: 700; border: none; border-radius: 10px; cursor: pointer;
                     letter-spacing: 0.01em;">
        ${label}
      </button>
    </form>`;
}

/** Tarjeta con los detalles mínimos de la cita (sin PHI clínica). */
export function appointmentDetailsCard(params: {
  formattedDate: string;
  formattedTime: string;
  clinicianName: string;
}): string {
  const { formattedDate, formattedTime, clinicianName } = params;
  const row = (label: string, value: string, last = false) => `
    <tr>
      <td style="padding: 10px 16px; ${last ? '' : 'border-bottom: 1px solid #f0ecff;'}">
        <span style="font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase;
                     letter-spacing: 0.07em;">${label}</span><br/>
        <span style="font-size: 14px; font-weight: 700; color: #1e1b4b;">${value}</span>
      </td>
    </tr>`;

  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="border: 1.5px solid #ddd3fa; border-radius: 14px; margin: 0 0 8px;
                  background-color: #faf9ff;">
      ${row('Fecha', formattedDate)}
      ${row('Hora', formattedTime)}
      ${row('Profesional', clinicianName, true)}
    </table>`;
}
