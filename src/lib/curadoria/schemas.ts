import { z } from 'zod';

export const ComplianceSeveritySchema = z.enum(['gravissimo', 'alto', 'normal']);
export type ComplianceSeverity = z.infer<typeof ComplianceSeveritySchema>;

export const ComplianceItemTypeSchema = z.enum([
  'foto',
  'denuncia',
  'avaliacao',
  'perfil_pago',
  'destaque',
]);
export type ComplianceItemType = z.infer<typeof ComplianceItemTypeSchema>;

export const ComplianceActionSchema = z.enum([
  'liberado',
  'rejeitado',
  'ocultado_preservado',
  'solicitado_correcao',
]);
export type ComplianceAction = z.infer<typeof ComplianceActionSchema>;

export const ComplianceReasonSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  policy_source: z.enum([
    'politica_anuncios',
    'politica_portfolio',
    'politica_avaliacoes',
    'termos_uso',
    'regras_denuncia',
  ]),
  title: z.string(),
  description: z.string(),
  advertiser_message_template: z.string(),
  notifier_message_template: z.string(),
  severity: ComplianceSeveritySchema,
  created_at: z.string(),
});
export type ComplianceReason = z.infer<typeof ComplianceReasonSchema>;

export const UnifiedQueueItemSchema = z.object({
  id: z.string(),
  item_type: ComplianceItemTypeSchema,
  title: z.string(),
  summary: z.string(),
  submitted_by_name: z.string().optional(),
  target_user_id: z.string(),
  target_user_name: z.string(),
  target_user_email: z.string(),
  target_plan_code: z.string(),
  severity: ComplianceSeveritySchema,
  created_at: z.string(),
  sla_hours: z.number(),
  hours_elapsed: z.number(),
  is_delayed: z.boolean(),
  metadata: z.record(z.unknown()).optional(),
});
export type UnifiedQueueItem = z.infer<typeof UnifiedQueueItemSchema>;

export const PlanEqualityMetricSchema = z.object({
  plan_code: z.string(),
  total_actions: z.number(),
  removals_count: z.number(),
  approvals_count: z.number(),
  removal_rate: z.number(),
  avg_resolution_hours: z.number(),
});
export type PlanEqualityMetric = z.infer<typeof PlanEqualityMetricSchema>;

export const TransparencyReportSchema = z.object({
  year: z.number(),
  total_received: z.number(),
  total_accepted: z.number(),
  total_rejected: z.number(),
  avg_response_hours: z.number(),
  category_breakdown: z.record(z.number()),
  generated_at: z.string(),
});
export type TransparencyReport = z.infer<typeof TransparencyReportSchema>;
