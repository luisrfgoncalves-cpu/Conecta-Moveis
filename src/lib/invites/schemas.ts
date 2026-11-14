import { z } from 'zod';

export const CreateInviteSchema = z.object({
  type: z.enum(['convite', 'teste', 'campanha']),
  plan_code: z.enum(['gratuito', 'pro', 'destaque']).default('pro'),
  trial_days: z.number().int().min(0).max(365).default(30), // Totalmente configurável pelo dono
  max_uses: z.number().int().positive().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  campaign_label: z.string().max(80).nullable().optional(),
  notes: z.string().max(250).nullable().optional(),
});

export type CreateInviteInput = z.infer<typeof CreateInviteSchema>;

export interface InviteLinkRecord {
  id: string;
  token_preview: string;
  type: 'convite' | 'teste' | 'campanha';
  plan_code: string;
  trial_days: number;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  campaign_label: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

