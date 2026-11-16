'use server';

import { createClient } from '@/lib/supabase/server';

export interface AlertRequestData {
  email: string;
  cidade?: string;
  categoria?: string;
  consentimento: boolean;
}

export interface AlertRequestResult {
  success: boolean;
  error?: string;
}

/**
 * Registra uma solicitação de alerta para quando houver profissional na região.
 * Tabela alert_requests (migration 20261116000001).
 */
export async function registerAlertRequest(
  data: AlertRequestData
): Promise<AlertRequestResult> {
  if (!data.email || !data.email.includes('@')) {
    return { success: false, error: 'E-mail inválido.' };
  }
  if (!data.consentimento) {
    return { success: false, error: 'É necessário aceitar o uso do e-mail.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.from('alert_requests').insert({
    email: data.email.trim().toLowerCase(),
    cidade: data.cidade?.trim() || null,
    categoria: data.categoria?.trim() || null,
    consentimento: true,
  });

  if (error) {
    // Duplicata silenciosa — não revelar ao usuário se e-mail já existe
    if (error.code === '23505') {
      return { success: true };
    }
    return { success: false, error: 'Não foi possível registrar. Tente novamente.' };
  }

  return { success: true };
}
