import { z } from 'zod';

export const emergencyContactSchema = z.object({
  name: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val.replace(/\s/g, '')), {
      message: 'Formato de teléfono inválido',
    }),
  relation: z.string().optional(),
});

export const patientSchema = z.object({
  fullName: z.string().min(1, 'El nombre es requerido'),
  contactPhone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val.replace(/\s/g, '')), {
      message: 'Formato de teléfono inválido',
    }),
  dateOfBirth: z.string().optional(),
  diagnosis: z.string().optional(),
  clinicalContext: z.string().optional(),
  emergencyContact: emergencyContactSchema.optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
