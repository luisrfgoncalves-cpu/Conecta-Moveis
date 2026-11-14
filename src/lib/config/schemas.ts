import { z } from 'zod';

export const InfraProfileSchema = z.object({
  id: z.enum(['gratuito', 'pro', 'personalizado']),
  name: z.string().min(3),
  storage_mb: z.number().int().positive(),
  db_mb: z.number().int().positive(),
  transfer_gb_month: z.number().int().positive(),
  max_upload_size_mb: z.number().int().positive(),
  is_active: z.boolean(),
});

export type InfraProfile = z.infer<typeof InfraProfileSchema>;

export const SystemSettingSchema = z.object({
  key: z.string().min(3),
  value: z.unknown(),
  value_type: z.enum(['number', 'string', 'boolean', 'json']),
  default_value: z.unknown(),
  min_value: z.number().nullable().optional(),
  max_value: z.number().nullable().optional(),
  scope: z.enum(['global', 'plano', 'usuario']),
  description: z.string().min(5),
  requires_infra_profile: z.enum(['gratuito', 'pro', 'personalizado']).nullable().optional(),
  requires_legal_review: z.boolean().default(false),
});

export type SystemSetting = z.infer<typeof SystemSettingSchema>;

export const UpdateSettingSchema = z.object({
  key: z.string().min(3),
  value: z.unknown(),
  reason: z.string().min(10, 'A justificativa de alteração deve ter pelo menos 10 caracteres.'),
  bypass_infra_check: z.boolean().optional().default(false),
});

export const FeatureFlagSchema = z.object({
  key: z.string().min(3),
  name: z.string().min(3),
  state: z.enum(['desligado', 'teste', 'ligado']),
  scope: z.enum(['global', 'plano', 'usuario', 'campanha']),
  description: z.string(),
  requires_infra_profile: z.enum(['gratuito', 'pro', 'personalizado']).nullable().optional(),
  requires_legal_review: z.boolean().default(false),
  legal_approval_id: z.string().nullable().optional(),
});

export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;

export const CapacitySimulatorInputSchema = z.object({
  total_profiles: z.number().int().min(1).max(50000),
  photos_per_profile: z.number().int().min(1).max(100),
  avg_photo_size_kb: z.number().int().min(100).max(10000).default(600),
  active_monthly_visitors: z.number().int().min(0).max(1000000).default(1000),
  views_per_visitor: z.number().int().min(1).max(50).default(5),
});

export type CapacitySimulatorInput = z.infer<typeof CapacitySimulatorInputSchema>;

export interface CapacitySimulationResult {
  projected_storage_mb: number;
  projected_db_mb: number;
  projected_transfer_gb_month: number;
  storage_usage_percent: number;
  db_usage_percent: number;
  transfer_usage_percent: number;
  storage_alert_level: 'ok' | 'warning_70' | 'critical_90';
  db_alert_level: 'ok' | 'warning_70' | 'critical_90';
  transfer_alert_level: 'ok' | 'warning_70' | 'critical_90';
  max_profiles_sustainable: number;
  recommendation: string;
}

