import { StorageAdapter, SupabaseStorageAdapter } from './storage.adapter';
import { EmailAdapter, FreeEmailAdapter } from './email.adapter';
import { JobSchedulerAdapter, FreeJobSchedulerAdapter } from './job.adapter';
import { RateLimitAdapter, MemoryRateLimitAdapter } from './ratelimit.adapter';
import { SearchAdapter, PostgresFullTextSearchAdapter } from './search.adapter';

export * from './storage.adapter';
export * from './email.adapter';
export * from './job.adapter';
export * from './ratelimit.adapter';
export * from './search.adapter';

export interface AppAdapters {
  storage: StorageAdapter;
  email: EmailAdapter;
  jobs: JobSchedulerAdapter;
  rateLimit: RateLimitAdapter;
  search: SearchAdapter;
}

// Fábrica singleton com implementações padrão do plano gratuito
export const defaultAdapters: AppAdapters = {
  storage: new SupabaseStorageAdapter(),
  email: new FreeEmailAdapter(),
  jobs: new FreeJobSchedulerAdapter(),
  rateLimit: new MemoryRateLimitAdapter(),
  search: new PostgresFullTextSearchAdapter(),
};

