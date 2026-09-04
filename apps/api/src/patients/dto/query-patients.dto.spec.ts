// Los decoradores de class-validator/class-transformer necesitan el polyfill de
// metadatos. En runtime lo carga NestFactory; aquí el DTO se instancia suelto.
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PatientsSort, QueryPatientsDto } from './query-patients.dto';

/**
 * Reproduce lo que hace el `ValidationPipe` global (`transform: true`, sin
 * `enableImplicitConversion`) sobre un query string ya parseado por Express:
 * todos los valores llegan como string.
 */
const parse = (query: Record<string, unknown>) => {
  const dto = plainToInstance(QueryPatientsDto, query);
  const errors = validateSync(dto, { whitelist: false });
  return { dto, errors, fields: errors.map((e) => e.property) };
};

describe('QueryPatientsDto', () => {
  describe('coerción de booleanos', () => {
    it.each([
      ['true', true],
      ['1', true],
      ['false', false],
      ['0', false],
    ])('convierte riskFlag=%s en %s', (raw, expected) => {
      const { dto, errors } = parse({ riskFlag: raw });
      expect(errors).toHaveLength(0);
      expect(dto.riskFlag).toBe(expected);
    });

    it('convierte hasBalance igual que riskFlag', () => {
      const { dto, errors } = parse({ hasBalance: 'true' });
      expect(errors).toHaveLength(0);
      expect(dto.hasBalance).toBe(true);
    });

    it('deja los filtros sin definir cuando no vienen', () => {
      const { dto, errors } = parse({});
      expect(errors).toHaveLength(0);
      expect(dto.riskFlag).toBeUndefined();
      expect(dto.hasBalance).toBeUndefined();
    });

    it('trata `?riskFlag=` (vacío) como ausencia de filtro', () => {
      const { dto, errors } = parse({ riskFlag: '' });
      expect(errors).toHaveLength(0);
      expect(dto.riskFlag).toBeUndefined();
    });

    it('rechaza un valor no booleano en vez de desactivar el filtro en silencio', () => {
      const { fields } = parse({ riskFlag: 'quizas' });
      expect(fields).toContain('riskFlag');
    });

    it('acepta booleanos ya tipados', () => {
      const { dto, errors } = parse({ hasBalance: false });
      expect(errors).toHaveLength(0);
      expect(dto.hasBalance).toBe(false);
    });
  });

  describe('limit', () => {
    it('mantiene el valor por defecto', () => {
      const { dto } = parse({});
      expect(dto.limit).toBe(10);
      expect(dto.page).toBe(1);
    });

    // `PatientsPage.tsx` pide 500 de golpe mientras filtra en cliente: el techo
    // no puede bajar de ahí sin romper esa pantalla primero.
    it('acepta 500, que es lo que pide hoy el front', () => {
      const { dto, errors } = parse({ limit: '500' });
      expect(errors).toHaveLength(0);
      expect(dto.limit).toBe(500);
    });

    it('rechaza por encima de 500', () => {
      expect(parse({ limit: '501' }).fields).toContain('limit');
    });

    it('rechaza 0 y negativos', () => {
      expect(parse({ limit: '0' }).fields).toContain('limit');
      expect(parse({ page: '0' }).fields).toContain('page');
    });
  });

  describe('sort', () => {
    it('acepta los valores del enum', () => {
      const { dto, errors } = parse({ sort: 'balance' });
      expect(errors).toHaveLength(0);
      expect(dto.sort).toBe(PatientsSort.BALANCE);
    });

    it('rechaza cualquier otro orden', () => {
      expect(parse({ sort: 'saldo' }).fields).toContain('sort');
    });
  });
});
