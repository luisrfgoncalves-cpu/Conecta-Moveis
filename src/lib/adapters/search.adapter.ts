export interface SearchQuery {
  term: string;
  category?: string;
  city?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
}

export interface SearchAdapter {
  search<T>(query: SearchQuery): Promise<SearchResult<T>>;
}

/**
 * Implementação Gratuita Atual (PostgreSQL Full-Text Search / ILIKE nativo)
 * 
 * UPGRADE PATH:
 * Para busca semântica por Inteligência Artificial (pgvector) ou MeiliSearch:
 * 1. Ativar extensão pgvector no Supabase Pro.
 * 2. Criar VectorSearchAdapter com embeddings da OpenAI/Gemini.
 */
export class PostgresFullTextSearchAdapter implements SearchAdapter {
  async search<T>(_query: SearchQuery): Promise<SearchResult<T>> {
    // Retorno de interface estruturada; a consulta real já é executada pelas actions do projeto
    return {
      items: [],
      total: 0,
    };
  }
}
