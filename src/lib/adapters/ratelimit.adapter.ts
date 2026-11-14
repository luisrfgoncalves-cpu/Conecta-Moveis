export interface RateLimitAdapter {
  check(identifier: string, limit: number, windowSeconds: number): Promise<{ success: boolean; remaining: number; resetInSeconds: number }>;
}

/**
 * Implementação Gratuita Atual (Em memória / Token Bucket local)
 * 
 * UPGRADE PATH:
 * Para ambientes distribuídos com múltiplas instâncias da Vercel:
 * 1. Conectar Upstash Redis (@upstash/ratelimit).
 * 2. Criar UpstashRedisRateLimitAdapter para contagem atômica global.
 */
export class MemoryRateLimitAdapter implements RateLimitAdapter {
  private store: Map<string, { count: number; expiresAt: number }> = new Map();

  async check(identifier: string, limit: number, windowSeconds: number): Promise<{
    success: boolean;
    remaining: number;
    resetInSeconds: number;
  }> {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const entry = this.store.get(identifier);

    if (!entry || now > entry.expiresAt) {
      this.store.set(identifier, { count: 1, expiresAt: now + windowMs });
      return {
        success: true,
        remaining: limit - 1,
        resetInSeconds: windowSeconds,
      };
    }

    if (entry.count >= limit) {
      const resetInSeconds = Math.max(1, Math.ceil((entry.expiresAt - now) / 1000));
      return {
        success: false,
        remaining: 0,
        resetInSeconds,
      };
    }

    entry.count += 1;
    const resetInSeconds = Math.max(1, Math.ceil((entry.expiresAt - now) / 1000));
    return {
      success: true,
      remaining: limit - entry.count,
      resetInSeconds,
    };
  }
}
