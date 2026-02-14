import { z } from 'zod';

export const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required').regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  relation: z.string().optional(),
});

export const patientSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  contactPhone: z.string().optional().refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
    message: 'Invalid phone number format',
  }),
  dateOfBirth: z.string().optional(), // Date input returns string "YYYY-MM-DD"
  diagnosis: z.string().optional(),
  clinicalContext: z.string().optional(),
  emergencyContact: emergencyContactSchema.optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
