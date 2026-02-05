import { z } from 'zod';

export const settingsSchema = z.object({
  sessionDefaultPrice: z
    .number({ required_error: 'El precio es requerido' })
    .positive('El precio debe ser mayor a 0')
    .max(10000, 'El precio no puede ser mayor a 10,000'),
  sessionDefaultDuration: z
    .number({ required_error: 'La duración es requerida' })
    .int('La duración debe ser un número entero')
    .min(15, 'La duración mínima es 15 minutos')
    .max(180, 'La duración máxima es 180 minutos'),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
