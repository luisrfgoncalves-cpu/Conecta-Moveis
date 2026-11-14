import { z } from 'zod';

export const SearchFiltersSchema = z.object({
  termo: z.string().max(120).optional(),
  uf: z.string().length(2).toUpperCase().optional(),
  cidade: z.string().max(80).optional(),
  categoria: z.string().max(80).optional(),
  especialidade: z.string().max(80).optional(),
  ordenacao: z
    .enum(['rotativa', 'recentes', 'completos', 'avaliacoes', 'relevancia', 'atividade'])
    .optional(),
  page: z.coerce.number().int().min(1).optional(),
});
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

export const SearchSynonymSchema = z.object({
  id: z.string().uuid(),
  term: z.string(),
  synonyms: z.array(z.string()),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type SearchSynonym = z.infer<typeof SearchSynonymSchema>;

export const AutocompleteItemSchema = z.object({
  name: z.string(),
  slug: z.string(),
  category_name: z.string().optional(),
});
export type AutocompleteItem = z.infer<typeof AutocompleteItemSchema>;

export const CityAutocompleteItemSchema = z.object({
  city: z.string(),
  state: z.string(),
  count: z.number(),
});
export type CityAutocompleteItem = z.infer<typeof CityAutocompleteItemSchema>;

export const NoResultLogSchema = z.object({
  term: z.string(),
  search_date: z.string(),
  count: z.number(),
});
export type NoResultLog = z.infer<typeof NoResultLogSchema>;

