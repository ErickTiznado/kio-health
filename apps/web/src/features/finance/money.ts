/**
 * Formato de dinero del módulo de finanzas.
 *
 * `currency` sale del perfil del clínico (`user.profile.currency`), así que
 * puede llegar un código que `Intl` no reconozca. En ese caso se degrada a
 * número con el código delante en lugar de tirar la vista entera.
 */
export function formatMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

/**
 * Dinero abreviado para un tick de eje: `$1.2 k`, `$980`.
 *
 * El eje de la gráfica no tiene ancho para `$1,200.00` repetido cinco veces,
 * pero tampoco puede escribir un `$` a mano: la moneda sale del perfil y puede
 * ser euro o peso colombiano. Mismo `Intl` que `formatMoney`, en notación
 * compacta y con la misma degradación cuando el código no se reconoce.
 */
export function formatMoneyCompact(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString('es-MX', {
      notation: 'compact',
      maximumFractionDigits: 1,
    })}`;
  }
}

/**
 * Fecha de hoy en formato `yyyy-MM-dd` calculada en HORA LOCAL.
 *
 * `new Date().toISOString().split('T')[0]` da la fecha en UTC: un gasto
 * registrado a las 22:00 en Bogotá se fechaba mañana. Ver DESIGN.md → nunca
 * derivar una fecha de `toISOString()`.
 */
export function todayLocalDateString(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
