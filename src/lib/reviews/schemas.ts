import { z } from 'zod';

export const reviewSchema = z.object({
  contactRequestId: z.string().uuid('ID de contato inválido.'),
  ratingQuality: z.number().int().min(1, 'Nota de 1 a 5.').max(5, 'Nota de 1 a 5.'),
  ratingPunctuality: z.number().int().min(1, 'Nota de 1 a 5.').max(5, 'Nota de 1 a 5.'),
  ratingCommunication: z.number().int().min(1, 'Nota de 1 a 5.').max(5, 'Nota de 1 a 5.'),
  ratingOrganization: z.number().int().min(1, 'Nota de 1 a 5.').max(5, 'Nota de 1 a 5.'),
  ratingCommitment: z.number().int().min(1, 'Nota de 1 a 5.').max(5, 'Nota de 1 a 5.'), // cumprimento do combinado
  comment: z
    .string()
    .max(1000, 'O comentário deve ter no máximo 1000 caracteres.')
    .optional()
    .or(z.literal('')),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const reviewReplySchema = z.object({
  reviewId: z.string().uuid('ID da avaliação inválido.'),
  replyText: z
    .string()
    .min(5, 'A resposta deve ter pelo menos 5 caracteres.')
    .max(1000, 'A resposta deve ter no máximo 1000 caracteres.'),
});

export type ReviewReplyInput = z.infer<typeof reviewReplySchema>;

