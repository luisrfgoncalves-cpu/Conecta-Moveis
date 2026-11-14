export interface ScheduledJob {
  name: string;
  schedule: string; // Cron expression
  handler: () => Promise<unknown>;
}

export interface JobSchedulerAdapter {
  registerJob(job: ScheduledJob): void;
  runJob(name: string): Promise<{ success: boolean; result?: unknown; error?: string }>;
  listJobs(): Array<{ name: string; schedule: string }>;
}

/**
 * Implementação Gratuita Atual (Acionamento Manual e Invocação via RPC Supabase)
 * 
 * UPGRADE PATH:
 * Para automação via Vercel Cron ou Upstash QStash:
 * 1. Configurar rota de webhook segura `/api/cron/[jobName]` protegida por CRON_SECRET.
 * 2. Criar VercelJobSchedulerAdapter que agenda as chamadas HTTP autenticadas.
 */
export class FreeJobSchedulerAdapter implements JobSchedulerAdapter {
  private jobs: Map<string, ScheduledJob> = new Map();

  registerJob(job: ScheduledJob): void {
    this.jobs.set(job.name, job);
  }

  async runJob(name: string): Promise<{ success: boolean; result?: unknown; error?: string }> {
    const job = this.jobs.get(name);
    if (!job) {
      return { success: false, error: `Tarefa agendada '${name}' não encontrada.` };
    }

    try {
      const result = await job.handler();
      return { success: true, result };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMsg };
    }
  }

  listJobs(): Array<{ name: string; schedule: string }> {
    return Array.from(this.jobs.values()).map((j) => ({
      name: j.name,
      schedule: j.schedule,
    }));
  }
}

