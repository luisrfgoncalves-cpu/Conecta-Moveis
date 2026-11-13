import { z } from 'zod';

export const contactRequestSchema = z.object({
  profileId: z.string().uuid('ID de perfil inválido.'),
  message: z
    .string()
    .min(10, 'Mensagem muito curta (mínimo 10 caracteres).')
    .max(500, 'Mensagem muito longa (máximo 500 caracteres).')
    // Bloquear qualquer menção de preço, orçamento, agenda ou pagamento
    .refine(
      (v) =>
        !/\b(r\$|reais|preço|preco|orçamento|orcamento|pagamento|pix|agenda|disponibilidade|horário|horario)\b/i.test(
          v
        ),
      {
        message:
          'Não inclua preços, orçamentos, agenda ou formas de pagamento nesta mensagem.',
      }
    ),
});

export type ContactRequestInput = z.infer<typeof contactRequestSchema>;

