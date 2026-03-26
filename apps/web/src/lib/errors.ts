const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'La solicitud contiene datos inválidos.',
  401: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'El recurso solicitado no existe.',
  409: 'Ya existe un registro con esos datos.',
  422: 'Los datos enviados no son válidos.',
  429: 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.',
  500: 'Ocurrió un error en el servidor. Intenta más tarde.',
  503: 'El servicio no está disponible en este momento.',
};

/**
 * Extracts a user-friendly Spanish error message from any error object.
 * Priority: backend message → HTTP status mapping → fallback.
 */
export function getErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: { status?: number; data?: { message?: string | string[] } };
    };
    const msg = axiosError.response?.data?.message;
    if (msg) {
      return Array.isArray(msg) ? msg[0] : msg;
    }
    const status = axiosError.response?.status;
    if (status && HTTP_ERROR_MESSAGES[status]) {
      return HTTP_ERROR_MESSAGES[status];
    }
  }
  if (error instanceof Error && error.message === 'Network Error') {
    return 'Sin conexión al servidor. Verifica tu internet e intenta de nuevo.';
  }
  return fallback;
}
