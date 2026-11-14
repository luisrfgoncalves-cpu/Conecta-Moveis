export interface EmailMessage {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface EmailAdapter {
  send(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }>;
  isReady(): boolean;
}

/**
 * Implementação Gratuita Atual (Console / Supabase Auth nativo)
 * 
 * UPGRADE PATH:
 * Para conectar o Resend ou SMTP próprio:
 * 1. Definir RESEND_API_KEY no ambiente ou configurar SMTP no Supabase Dashboard.
 * 2. Criar a classe ResendEmailAdapter implementando EmailAdapter e instanciá-la na fábrica.
 */
export class FreeEmailAdapter implements EmailAdapter {
  isReady(): boolean {
    return true;
  }

  async send(_message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Em desenvolvimento ou plano gratuito sem SMTP externo, registra simulação segura
    const simulatedId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      success: true,
      messageId: simulatedId,
    };
  }
}
