import { z } from 'zod';

export const MunicipioSchema = z.object({
  id: z.string().uuid(),
  ibge_code: z.string().length(7),
  nome: z.string(),
  uf: z.string().length(2),
  slug: z.string(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  created_at: z.string().optional(),
});
export type Municipio = z.infer<typeof MunicipioSchema>;

export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type Coordinates = z.infer<typeof CoordinatesSchema>;

export const GeoDistanceFilterSchema = z.object({
  origin_ibge: z.string().length(7),
  max_radius_km: z.coerce.number().min(1).max(200).default(50),
  category_slug: z.string().optional(),
  termo: z.string().optional(),
  ordenacao: z.enum(['proximidade', 'rotativa', 'recentes']).default('proximidade'),
  page: z.coerce.number().int().min(1).default(1),
});
export type GeoDistanceFilter = z.infer<typeof GeoDistanceFilterSchema>;

export const ProfessionalWithDistanceSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  slug: z.string(),
  bio: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  municipio_nome: z.string(),
  distance_km: z.number(),
  service_radius_km: z.number(),
  is_featured: z.boolean(),
  created_at: z.string(),
  avatar_url: z.string().nullable(),
});
export type ProfessionalWithDistance = z.infer<typeof ProfessionalWithDistanceSchema>;
