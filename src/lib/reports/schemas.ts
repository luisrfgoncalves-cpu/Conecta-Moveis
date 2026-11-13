import { z } from 'zod';

export const reportSchema = z.object({
  targetType: z.enum(['profile', 'image', 'review', 'company']),
  targetId: z.string().uuid('ID inválido.'),
  reason: z.string().min(3, 'Selecione um motivo.').max(100),
  description: z
    .string()
    .min(10, 'Descreva o problema em ao menos 10 caracteres.')
    .max(1000),
  reporterEmail: z.string().email().optional().or(z.literal('')),
});

export type ReportInput = z.infer<typeof reportSchema>;

