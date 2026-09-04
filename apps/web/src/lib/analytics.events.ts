/**
 * Catálogo de eventos de producto.
 *
 * REGLA DE ORO — ningún dato clínico sale de aquí.
 * Kio maneja PII de paciente bajo RGPD / habeas data. Las propiedades de un
 * evento solo pueden ser: contadores, booleanos, enums cerrados y rutas ya
 * saneadas. Nunca nombres, correos de paciente, diagnósticos, contenido de
 * notas, importes ni identificadores de fila. Si dudas de una propiedad, no la
 * mandes: el evento sin ella sigue sirviendo, la filtración no se deshace.
 *
 * El catálogo está tipado a propósito. Un `capture('evento_nuevo')` suelto no
 * compila, y eso es deliberado: los embudos se rompen en silencio cuando cada
 * llamada inventa su propio nombre.
 *
 * Está organizado en tres bloques, y cada bloque existe para responder una
 * pregunta concreta que hoy no tiene respuesta:
 *
 *   1. EMBUDO DE ACTIVACIÓN — ¿dónde se cae la gente entre registrarse y
 *      cerrar su primera sesión completa?
 *   2. SONDAS — ¿el espacio de sesión aprieta demasiado? ¿los roles de clínica
 *      se entienden?
 *   3. FEEDBACK — qué nos dicen y desde dónde nos lo dicen.
 */

/* ── 1. Embudo de activación ─────────────────────────────────────────────── */

interface ActivationEvents {
  /** Alta consumada. El registro es por invitación, así que siempre hay token. */
  signup_completed: { via_invite: boolean };

  /**
   * Un paso del onboarding entra en pantalla. El abandono se deriva restando:
   * quien vio el paso 3 y nunca disparó `onboarding_completed` se cayó ahí.
   */
  onboarding_step_viewed: { step: number; step_name: OnboardingStepName };

  onboarding_completed: {
    currency: string;
    has_license: boolean;
    session_duration_minutes: number;
    /** Si el precio quedó en 0 el paso 4 no convenció; es el default del form. */
    price_left_at_zero: boolean;
  };

  /**
   * Los booleanos dicen qué campos del formulario de paciente se rellenan de
   * verdad. Si nadie toca `diagnosis`, el formulario pide demasiado y hay que
   * plegar esos campos, no insistir.
   */
  patient_created: {
    has_diagnosis: boolean;
    has_clinical_context: boolean;
    has_emergency_contact: boolean;
    has_phone: boolean;
  };

  appointment_created: { is_series: boolean; series_count: number };

  session_started: Record<string, never>;

  session_note_saved: {
    template_type: string;
    has_private_notes: boolean;
    has_tags: boolean;
    /** Longitud en tramos. Nunca el texto — es contenido clínico cifrado. */
    length_bucket: LengthBucket;
  };

  /** Cierre del ciclo completo: agenda -> sesión -> nota -> cobro. */
  checkout_completed: {
    payment_status: 'PENDING' | 'PAID';
    payment_method: string;
    scheduled_next: boolean;
    schedule_option: string | null;
    sent_email: boolean;
  };
}

export type OnboardingStepName = 'especialidad' | 'practica' | 'sesiones';

export type LengthBucket = '0' | '1-200' | '201-1000' | '1001-3000' | '3000+';

/* ── 2. Sondas ───────────────────────────────────────────────────────────── */

interface ProbeEvents {
  /**
   * SONDA — "el espacio de sesión es muy cerrado".
   *
   * La sesión hoy es una habitación con la puerta trabada: hay guard de salida
   * con cambios sin guardar, `beforeunload`, y la nota se vuelve inmutable 24h
   * después del fin de la cita. Puede que eso proteja el dato, o puede que el
   * clínico lo viva como una trampa. Estos tres eventos son la diferencia entre
   * saberlo y opinarlo.
   */

  /** El clínico intentó salir con cambios en vuelo y le salió el aviso. */
  session_exit_guard_shown: Record<string, never>;

  /** Cómo resolvió el aviso. `left: false` = se sintió atrapado y se quedó. */
  session_exit_guard_resolved: { left: boolean };

  /**
   * Abrió una nota que ya no puede editar. `deadline` es el candado de 24h;
   * si este evento es frecuente, la ventana es demasiado corta para cómo
   * trabaja la gente de verdad.
   */
  session_note_locked_viewed: { reason: 'status' | 'deadline' };

  session_no_show_marked: Record<string, never>;

  /**
   * SONDA — "no tenemos bien definidos los roles de la clínica".
   *
   * `clinic_member_role_changed` es el indicador honesto: cambiar el rol de
   * alguien poco después de invitarlo significa que el rol no se entendió al
   * asignarlo. Y `permission_denied` captura, desde el interceptor de la API,
   * cada vez que alguien intenta algo que su rol no permite — es el mapa de
   * dónde el modelo de permisos contradice la expectativa del usuario.
   */
  clinic_created: { role: string };
  clinic_invitation_created: { role: string };
  clinic_member_role_changed: { to_role: string };
  clinic_member_removed: Record<string, never>;
  clinic_left: Record<string, never>;

  /** Un 403 de la API, con la ruta ya saneada. Sin cuerpo ni identificadores. */
  permission_denied: { route: string; method: string };
}

/* ── 2b. Prueba gratuita ─────────────────────────────────────────────────── */

interface TrialEvents {
  /**
   * Alguien pide plan al terminar la prueba. Es la única conversión que existe
   * hoy, y `track` dice qué modalidad pide de verdad — que es la pregunta que
   * el paso "Plan" del onboarding intentaba responder antes de que la persona
   * hubiera visto el producto, y por eso respondía mal.
   */
  trial_plan_requested: {
    track: 'INDIVIDUAL' | 'CLINIC';
    had_note: boolean;
    days_since_expiry: number | null;
  };

  /** Una escritura rechazada por prueba caducada. Mide el roce del bloqueo. */
  trial_write_blocked: { route: string; mode: string };
}

/* ── 3. Feedback ─────────────────────────────────────────────────────────── */

interface FeedbackEvents {
  feedback_opened: { route: string };
  feedback_submitted: {
    sentiment: FeedbackSentiment;
    route: string;
    message_length: number;
  };
}

export type FeedbackSentiment = 'confuso' | 'error' | 'idea' | 'gusta';

/* ── Unión ───────────────────────────────────────────────────────────────── */

export type EventProperties = ActivationEvents &
  ProbeEvents &
  TrialEvents &
  FeedbackEvents;

export type AnalyticsEvent = keyof EventProperties;

/** Tramos de longitud. Sustituye al texto: informa sin transportar contenido. */
export function toLengthBucket(length: number): LengthBucket {
  if (length <= 0) return '0';
  if (length <= 200) return '1-200';
  if (length <= 1000) return '201-1000';
  if (length <= 3000) return '1001-3000';
  return '3000+';
}
