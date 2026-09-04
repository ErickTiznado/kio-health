/**
 * Textos e ítems de las escalas clínicas (español). Fuente única compartida
 * por la vista del clínico (ScalesTab) y el portal del paciente.
 */
export const PHQ9_QUESTIONS = [
  'Poco interés o placer en hacer las cosas',
  'Sentirse triste, deprimido/a o sin esperanza',
  'Dificultad para quedarse dormido/a, o dormir demasiado',
  'Sentirse cansado/a o con poca energía',
  'Poco apetito o comer en exceso',
  'Sentirse mal consigo mismo/a o como un fracasado/a',
  'Dificultad para concentrarse en las cosas',
  'Moverse o hablar lentamente, o estar muy inquieto/a',
  'Pensar que estaría mejor muerto/a o en hacerse daño',
];

export const GAD7_QUESTIONS = [
  'Sentirse nervioso/a, ansioso/a o al límite',
  'No poder dejar de preocuparse',
  'Preocuparse demasiado por diferentes cosas',
  'Dificultad para relajarse',
  'Tan inquieto/a que es difícil permanecer sentado/a',
  'Molestarse o irritarse fácilmente',
  'Sentir miedo, como si algo terrible fuera a ocurrir',
];

export const ANSWER_LABELS = ['Nunca', 'Varios días', 'Más de la mitad', 'Casi siempre'];

export const SCALE_TITLES: Record<'PHQ9' | 'GAD7', string> = {
  PHQ9: 'Cuestionario de estado de ánimo (PHQ-9)',
  GAD7: 'Cuestionario de ansiedad (GAD-7)',
};

export const SCALE_INTRO =
  'Durante las últimas 2 semanas, ¿con qué frecuencia te han molestado los siguientes problemas?';

export function questionsFor(scaleType: 'PHQ9' | 'GAD7'): string[] {
  return scaleType === 'PHQ9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
}
