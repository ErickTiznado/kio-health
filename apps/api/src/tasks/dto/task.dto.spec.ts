import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TASK_DESCRIPTION_MAX_LENGTH,
} from './task.dto';

const validate = <T extends object>(
  cls: new () => T,
  payload: object,
): { dto: T; errors: ReturnType<typeof validateSync> } => {
  const dto = plainToInstance(cls, payload);
  return { dto, errors: validateSync(dto) };
};

describe('CreateTaskDto', () => {
  it('recorta los espacios de la descripción', () => {
    const { dto, errors } = validate(CreateTaskDto, {
      description: '  Registro de pensamientos  ',
    });

    expect(errors).toHaveLength(0);
    expect(dto.description).toBe('Registro de pensamientos');
  });

  it('rechaza una descripción de solo espacios', () => {
    const { errors } = validate(CreateTaskDto, { description: '   ' });

    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('rechaza una descripción más larga que el máximo', () => {
    const { errors } = validate(CreateTaskDto, {
      description: 'a'.repeat(TASK_DESCRIPTION_MAX_LENGTH + 1),
    });

    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });
});

describe('UpdateTaskDto', () => {
  it('acepta un toggle sin descripción', () => {
    const { errors } = validate(UpdateTaskDto, { isCompleted: true });

    expect(errors).toHaveLength(0);
  });

  it('rechaza vaciar la descripción con espacios', () => {
    const { errors } = validate(UpdateTaskDto, { description: '  ' });

    expect(errors).not.toHaveLength(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});
