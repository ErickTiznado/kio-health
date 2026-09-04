import { plainToInstance } from 'class-transformer';
import { getMetadataStorage, validate } from 'class-validator';
import { CreateTransactionDto } from './create-transaction.dto';
import { UpdateTransactionDto } from './update-transaction.dto';

/** Campos que el DTO declara y valida, según class-validator. */
function declaredFields(cls: new () => object): string[] {
  const metadatas = getMetadataStorage().getTargetValidationMetadatas(
    cls,
    '',
    false,
    false,
  );
  return [...new Set(metadatas.map((m) => m.propertyName))].sort();
}

/**
 * El `ValidationPipe` global corre `plainToInstance` + `validate`, así que esto
 * reproduce exactamente lo que ve la petición.
 */
async function run<T extends object>(
  cls: new () => T,
  raw: Record<string, unknown>,
) {
  const dto = plainToInstance(cls, raw);
  const errors = await validate(dto);
  return { dto, failed: errors.map((e) => e.property) };
}

const gasto = (over: Record<string, unknown> = {}) => ({
  type: 'EXPENSE',
  category: 'Renta',
  amount: 100,
  ...over,
});

describe('CreateTransactionDto', () => {
  describe('date', () => {
    // El formulario manda `''` cuando el usuario limpia la fecha: el botón de
    // limpiar del DatePicker y el borrado a mano de los dígitos acaban los dos
    // en `field.onChange('')`. `@IsOptional()` salta `null`/`undefined` pero NO
    // `''`, así que sin el `@Transform` el alta entera moría con un 400.
    it.each([[''], ['   ']])(
      'la cadena vacía (%p) se normaliza a undefined y no invalida el alta',
      async (value) => {
        const { dto, failed } = await run(
          CreateTransactionDto,
          gasto({ date: value }),
        );

        expect(failed).toEqual([]);
        expect(dto.date).toBeUndefined();
      },
    );

    it('un día civil válido llega intacto', async () => {
      const { dto, failed } = await run(
        CreateTransactionDto,
        gasto({ date: '2026-08-01' }),
      );

      expect(failed).toEqual([]);
      expect(dto.date).toBe('2026-08-01');
    });

    it('omitirla es válido', async () => {
      const { dto, failed } = await run(CreateTransactionDto, gasto());

      expect(failed).toEqual([]);
      expect(dto.date).toBeUndefined();
    });

    it.each([['01/08/2026'], ['2026-8-1'], ['2026-08-01T00:00:00.000Z']])(
      'una fecha que no es un día civil (%p) se rechaza',
      async (value) => {
        const { failed } = await run(
          CreateTransactionDto,
          gasto({ date: value }),
        );

        expect(failed).toContain('date');
      },
    );
  });

  it('no declara appointmentId: el vínculo con la cita no entra por HTTP', () => {
    // La garantía real no es que el campo se ignore, es que no existe. Como la
    // columna es `@unique`, aceptarlo por el cuerpo permitía colgar un
    // movimiento propio de la cita de otro clínico y secuestrar su ingreso.
    // Si alguien lo reintroduce, cae este test junto con el comentario que lo
    // explica en el propio DTO.
    expect(declaredFields(CreateTransactionDto)).toEqual([
      'amount',
      'category',
      'date',
      'description',
      'type',
    ]);
  });
});

describe('UpdateTransactionDto', () => {
  it('hereda la normalización de la cadena vacía', async () => {
    const { dto, failed } = await run(UpdateTransactionDto, { date: '' });

    expect(failed).toEqual([]);
    expect(dto.date).toBeUndefined();
  });

  it('todo es opcional: un cuerpo vacío es válido', async () => {
    const { failed } = await run(UpdateTransactionDto, {});

    expect(failed).toEqual([]);
  });

  it('tampoco declara appointmentId', () => {
    expect(declaredFields(UpdateTransactionDto)).not.toContain('appointmentId');
  });

  it('sigue validando la forma de los campos que sí vienen', async () => {
    const { failed } = await run(UpdateTransactionDto, {
      amount: -5,
      date: 'ayer',
    });

    expect(failed).toEqual(expect.arrayContaining(['amount', 'date']));
  });

  // Documenta el hueco que cubre `FinanceService.update()`: `@IsOptional()`
  // salta `null`, así que la validación lo deja pasar y el servicio tiene que
  // rechazarlo a mano para no llevar un `null` a una columna NOT NULL.
  it('un null explícito NO lo frena la validación (lo frena el servicio)', async () => {
    const { failed } = await run(UpdateTransactionDto, { category: null });

    expect(failed).toEqual([]);
  });
});
