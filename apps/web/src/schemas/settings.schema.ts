import { z } from 'zod';

export const settingsSchema = z.object({
  currency: z
    .string({ required_error: 'La moneda es requerida' })
    .min(1, 'La moneda es requerida')
    .max(5, 'La moneda no puede ser mayor a 5 caracteres'),
  sessionDefaultPrice: z
    .number({ required_error: 'El precio es requerido' })
    .nonnegative('El precio debe ser mayor o igual a 0')
    .max(10000, 'El precio no puede ser mayor a 10,000'),
  sessionDefaultDuration: z
    .number({ required_error: 'La duración es requerida' })
    .int('La duración debe ser un número entero')
    .min(15, 'La duración mínima es 15 minutos')
    .max(180, 'La duración máxima es 180 minutos'),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
