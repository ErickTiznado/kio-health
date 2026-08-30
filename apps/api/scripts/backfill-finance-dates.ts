/**
 * Backfill de la fecha civil de los movimientos MANUALES de finanzas.
 *
 * Uso (dry-run por defecto — no escribe nada):
 *   cd apps/api
 *   npx ts-node scripts/backfill-finance-dates.ts
 *   npx ts-node scripts/backfill-finance-dates.ts --apply
 *
 * CONTEXTO
 * --------
 * `FinanceTransaction.date` guarda dos cosas distintas según el origen:
 *   - movimiento MANUAL (`appointmentId === null`) → una FECHA CIVIL,
 *   - ingreso de CITA   (`appointmentId !== null`) → un INSTANTE REAL de cobro.
 *
 * Las filas manuales creadas antes de anclar la fecha a la zona del clínico
 * quedaron en medianoche UTC. Como la ventana de mes ya se calcula en la zona
 * del clínico, en `America/Mexico_City` agosto es
 * `2026-08-01T06:00Z .. 2026-09-01T06:00Z`, así que una fila guardada como
 * `2026-08-01T00:00:00Z` se contabiliza en JULIO. Este script la re-ancla al
 * inicio de su día civil en la zona del clínico.
 *
 * QUÉ NO SE TOCA (y por qué)
 * --------------------------
 *  1. Filas con `appointmentId` distinto de null: ahí `date` es el instante en
 *     que entró el dinero, no un día civil. Re-anclarlo sí sería corromper.
 *  2. Filas cuyo `date` NO es medianoche UTC exacta. Ese es el discriminante
 *     seguro: solo las filas heredadas están a las 00:00:00.000Z. Una fila ya
 *     anclada por el código nuevo está en el arranque del día EN SU ZONA, que
 *     coincide con medianoche UTC únicamente si el offset es 0 — y en ese caso
 *     re-anclarla es un no-op. Sin este filtro, una segunda pasada correría las
 *     filas de zonas al este de Greenwich un día hacia atrás.
 */

import { PrismaClient } from '#generated/prisma';
import { isValidTimeZone, zonedDayKey, zonedDayStart } from '../src/lib/timezone.util';

const prisma = new PrismaClient();

/** Mismo default que `ClinicianProfile.timezone` en el schema. */
const FALLBACK_TZ = 'America/Mexico_City';

const APPLY = process.argv.includes('--apply');

/** True si el instante es medianoche UTC exacta. */
function isUtcMidnight(d: Date): boolean {
  return (
    d.getUTCHours() === 0 &&
    d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 &&
    d.getUTCMilliseconds() === 0
  );
}

function monthKey(d: Date, tz: string): string {
  return zonedDayKey(d, tz).slice(0, 7);
}

async function main() {
  const rows = await prisma.financeTransaction.findMany({
    where: { appointmentId: null },
    select: {
      id: true,
      clinicianId: true,
      date: true,
      amount: true,
      type: true,
      description: true,
      clinician: { select: { timezone: true } },
    },
    orderBy: { date: 'asc' },
  });

  console.log(
    `\n${APPLY ? '⚠️  MODO APPLY — se van a escribir cambios' : '🔍 DRY-RUN — no se escribe nada'}`,
  );
  console.log(`Movimientos manuales (appointment_id IS NULL): ${rows.length}\n`);

  const moves: {
    id: string;
    tz: string;
    from: Date;
    to: Date;
    fromMonth: string;
    toMonth: string;
    amount: number;
    type: string;
    description: string | null;
  }[] = [];

  let skippedNotMidnight = 0;
  let alreadyCorrect = 0;
  const badTz = new Set<string>();

  for (const row of rows) {
    const rawTz = row.clinician?.timezone;
    let tz = FALLBACK_TZ;
    if (rawTz) {
      if (isValidTimeZone(rawTz)) tz = rawTz;
      else badTz.add(rawTz);
    }

    if (!isUtcMidnight(row.date)) {
      skippedNotMidnight++;
      continue;
    }

    // El día civil que el clínico quiso decir: la fila se guardó como
    // medianoche UTC de ESE día, así que se lee en UTC, no en su zona.
    const civilDay = zonedDayKey(row.date, 'UTC');
    const anchored = zonedDayStart(civilDay, tz);

    if (anchored.getTime() === row.date.getTime()) {
      alreadyCorrect++;
      continue;
    }

    moves.push({
      id: row.id,
      tz,
      from: row.date,
      to: anchored,
      fromMonth: monthKey(row.date, tz),
      toMonth: monthKey(anchored, tz),
      amount: Number(row.amount),
      type: row.type,
      description: row.description,
    });
  }

  console.log(`  Ya correctas (offset 0):        ${alreadyCorrect}`);
  console.log(`  Omitidas (date no es 00:00Z):   ${skippedNotMidnight}`);
  console.log(`  A re-anclar:                    ${moves.length}\n`);

  if (badTz.size > 0) {
    console.log(
      `⚠️  Zonas inválidas en perfiles, se usó ${FALLBACK_TZ}: ${[...badTz].join(', ')}\n`,
    );
  }

  // ── Impacto en los totales mensuales ──────────────────────────────────────
  // Es lo único que el clínico nota: un mes que ya vio y ya pudo exportar
  // cambia de total. Se reporta por (clínico, mes) y solo los cruces de mes.
  const crossings = moves.filter((m) => m.fromMonth !== m.toMonth);
  console.log(`Filas que CAMBIAN DE MES: ${crossings.length}\n`);

  if (crossings.length > 0) {
    const delta = new Map<string, { income: number; expense: number; rows: number }>();
    const bump = (key: string, m: (typeof crossings)[number], sign: 1 | -1) => {
      const cur = delta.get(key) ?? { income: 0, expense: 0, rows: 0 };
      if (m.type === 'INCOME') cur.income += sign * m.amount;
      else cur.expense += sign * m.amount;
      cur.rows += sign;
      delta.set(key, cur);
    };

    for (const m of crossings) {
      bump(m.fromMonth, m, -1);
      bump(m.toMonth, m, 1);
    }

    console.log('Impacto por mes (en la zona del clínico):');
    for (const [month, d] of [...delta.entries()].sort()) {
      const fmt = (n: number) => (n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2));
      console.log(
        `  ${month}  filas ${d.rows >= 0 ? '+' : ''}${d.rows}` +
          `  ingresos ${fmt(d.income)}  gastos ${fmt(d.expense)}`,
      );
    }
    console.log('');

    console.log('Detalle de los cruces de mes:');
    for (const m of crossings) {
      console.log(
        `  ${m.id}  ${m.tz}\n` +
          `    ${m.from.toISOString()} (${m.fromMonth}) → ${m.to.toISOString()} (${m.toMonth})\n` +
          `    ${m.type} ${m.amount.toFixed(2)}  ${m.description ?? '(sin descripción)'}`,
      );
    }
    console.log('');
  }

  if (!APPLY) {
    console.log('Dry-run terminado. Nada escrito. Repite con --apply para aplicar.\n');
    return;
  }

  let written = 0;
  for (const batch of chunk(moves, 100)) {
    await prisma.$transaction(
      batch.map((m) =>
        prisma.financeTransaction.update({
          where: { id: m.id },
          data: { date: m.to },
        }),
      ),
    );
    written += batch.length;
    console.log(`  ...${written}/${moves.length}`);
  }
  console.log(`\n✅ ${written} movimientos re-anclados.\n`);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
