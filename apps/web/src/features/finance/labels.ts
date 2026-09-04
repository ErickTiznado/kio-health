/**
 * Etiquetas del módulo de finanzas.
 *
 * Las categorías se persisten en inglés desde el primer movimiento que se
 * registró (`Rent`, `Services`, `Consultation`…) y así se quedan: cambiar el
 * valor almacenado dejaría sin traducir todo lo que ya está en la base. Lo que
 * se traduce es la presentación, nunca el dato.
 */

export interface CategoryOption {
  /** Valor que viaja al servidor y se guarda en `finance_transactions.category`. */
  value: string;
  label: string;
}

export const EXPENSE_CATEGORIES: CategoryOption[] = [
  { value: 'Rent', label: 'Renta' },
  { value: 'Services', label: 'Servicios (luz, agua, internet)' },
  { value: 'Materials', label: 'Materiales o insumos' },
  { value: 'Equipment', label: 'Equipo' },
  { value: 'Software', label: 'Software y suscripciones' },
  { value: 'Other', label: 'Otro' },
];

export const INCOME_CATEGORIES: CategoryOption[] = [
  { value: 'Consultation', label: 'Consulta' },
  { value: 'Package', label: 'Paquete de sesiones' },
  { value: 'Report', label: 'Informe o peritaje' },
  { value: 'Workshop', label: 'Taller o grupo' },
  { value: 'Other', label: 'Otro' },
];

const LABEL_BY_VALUE: Record<string, string> = {};
for (const { value, label } of [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]) {
  // El primero gana: `Other` se traduce igual en las dos listas.
  if (!(value in LABEL_BY_VALUE)) LABEL_BY_VALUE[value] = label;
}

/**
 * Etiqueta en español de una categoría almacenada. Si es una categoría que no
 * conocemos (movimiento antiguo, o creado por otra versión) devuelve el valor
 * crudo en vez de inventarse una traducción.
 */
export function categoryLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return LABEL_BY_VALUE[value] ?? value;
}

export type PaymentMethodValue = 'CASH' | 'CARD' | 'TRANSFER';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodValue, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
};

export function paymentMethodLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return PAYMENT_METHOD_LABELS[value as PaymentMethodValue] ?? value;
}
