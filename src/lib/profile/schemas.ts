import { z } from 'zod';

export const CATEGORIES_CATALOG = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Montador de Móveis',
    slug: 'montador-de-moveis',
    description: 'Montagem e desmontagem de móveis modulados e convencionais.',
    icon: 'Wrench',
    specialties: [
      { id: 's1111111-1111-1111-1111-111111111111', name: 'Móveis Modulados', slug: 'moveis-modulados' },
      { id: 's2222222-2222-2222-2222-222222222222', name: 'Montagem de Guarda-Roupas', slug: 'montagem-guarda-roupas' },
      { id: 's101', name: 'Cozinhas Planejadas', slug: 'cozinhas-planejadas' },
      { id: 's102', name: 'Desmontagem e Mudança', slug: 'desmontagem-mudanca' },
      { id: 's103', name: 'Regulagem de Portas e Gavetas', slug: 'regulagem-portas' },
    ],
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Marceneiro',
    slug: 'marceneiro',
    description: 'Marcenaria fina, sob medida e restauração.',
    icon: 'Sparkles',
    specialties: [
      { id: 's3333333-3333-3333-3333-333333333333', name: 'Cozinhas Sob Medida', slug: 'cozinhas-sob-medida' },
      { id: 's4444444-4444-4444-4444-444444444444', name: 'Painéis Ripados', slug: 'paineis-ripados' },
      { id: 's201', name: 'Closets e Dormitórios', slug: 'closets-dormitorios' },
      { id: 's202', name: 'Móveis para Banheiro', slug: 'moveis-banheiro' },
      { id: 's203', name: 'Restauração de Madeira', slug: 'restauracao-madeira' },
    ],
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Loja de Planejados',
    slug: 'loja-de-planejados',
    description: 'Showrooms e comércio de mobiliário planejado.',
    icon: 'Box',
    specialties: [
      { id: 's301', name: 'Ambientes Completos', slug: 'ambientes-completos' },
      { id: 's302', name: 'Planejados Residenciais', slug: 'planejados-residenciais' },
      { id: 's303', name: 'Planejados Corporativos', slug: 'planejados-corporativos' },
    ],
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Marcenaria',
    slug: 'marcenaria',
    description: 'Fábricas e oficinas de médio e grande porte.',
    icon: 'Hammer',
    specialties: [
      { id: 's401', name: 'Usinagem CNC', slug: 'usinagem-cnc' },
      { id: 's402', name: 'Grandes Lotes e Franquias', slug: 'grandes-lotes' },
      { id: 's403', name: 'Corte e Fita de Borda', slug: 'corte-borda' },
    ],
  },
  {
    id: 'c5555555-5555-5555-5555-555555555555',
    name: 'Projetista',
    slug: 'projetista',
    description: 'Projetos 3D, paginação de ambientes e renderização.',
    icon: 'Ruler',
    specialties: [
      { id: 's501', name: 'Projeto 3D / Promob', slug: 'projeto-promob' },
      { id: 's502', name: 'Renderização Fotorrealista', slug: 'render-fotorrealista' },
      { id: 's503', name: 'Planta Técnica de Fabricação', slug: 'planta-tecnica' },
    ],
  },
  {
    id: 'c6666666-6666-6666-6666-666666666666',
    name: 'Parceiros Complementares',
    slug: 'parceiros-complementares',
    description: 'Iluminação LED, serralheria, vidraçaria e serviços de apoio.',
    icon: 'Lightbulb',
    specialties: [
      { id: 's5555555-5555-5555-5555-555555555555', name: 'LED em Móveis', slug: 'led-em-moveis' },
      { id: 's601', name: 'Vidraçaria / Portas de Alumínio', slug: 'vidracaria-portas' },
      { id: 's602', name: 'Serralheria para Móveis', slug: 'serralheria-moveis' },
      { id: 's603', name: 'Transporte e Frete Dedicado', slug: 'transporte-moveis' },
    ],
  },
];

// Helper para gerar slug seguro e amigável
export function generateSlug(text: string, suffix?: string): string {
  const clean = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 50);

  const cleanSuffix = suffix ? `-${suffix.toLowerCase().replace(/[^a-z0-9]+/g, '')}` : '';
  return `${clean}${cleanSuffix}`;
}

// Schema do perfil profissional completo
export const professionalProfileSchema = z.object({
  id: z.string().uuid().optional(),
  displayName: z
    .string()
    .min(3, 'Nome profissional deve ter ao menos 3 caracteres')
    .max(80, 'Nome profissional muito longo'),
  bio: z
    .string()
    .min(20, 'Descrição profissional deve ter pelo menos 20 caracteres')
    .max(600, 'Descrição profissional pode ter no máximo 600 caracteres'),
  city: z
    .string()
    .min(2, 'Informe a cidade de atuação')
    .max(60, 'Nome de cidade inválido'),
  state: z
    .string()
    .length(2, 'Informe a UF com 2 letras (ex: SP)')
    .toUpperCase(),
  neighborhoods: z
    .array(z.string().min(2))
    .max(20, 'Máximo de 20 bairros')
    .default([]),
  specialtyIds: z
    .array(z.string())
    .min(1, 'Selecione ao menos 1 especialidade de atuação'),
  whatsapp: z
    .string()
    .regex(/^$|^\(?[1-9]{2}\)? ?9?[0-9]{4}-?[0-9]{4}$/, 'Formato de WhatsApp inválido (ex: 11999998888)')
    .optional()
    .or(z.literal('')),
  isWhatsappPublic: z.boolean().default(false),
  phone: z
    .string()
    .regex(/^$|^\(?[1-9]{2}\)? ?[0-9]{4}-?[0-9]{4}$/, 'Formato de telefone fixo/celular inválido')
    .optional()
    .or(z.literal('')),
  isPhonePublic: z.boolean().default(false),
  avatarUrl: z.string().url('URL de avatar inválida').optional().or(z.literal('')),
  companyId: z.string().uuid().optional().nullable(),
});

// Schema de publicação do perfil (critérios mínimos obrigatórios)
export const publishValidationSchema = z.object({
  displayName: z.string().min(3, 'Nome profissional obrigatório'),
  bio: z.string().min(20, 'Descrição com no mínimo 20 caracteres obrigatória'),
  city: z.string().min(2, 'Cidade de atuação obrigatória'),
  state: z.string().length(2, 'Estado (UF) obrigatório'),
  specialtyIds: z.array(z.string()).min(1, 'Ao menos uma especialidade é obrigatória para publicar'),
  emailConfirmed: z.boolean().refine((val) => val === true, {
    message: 'É obrigatório ter o e-mail confirmado para publicar o perfil',
  }),
});

// Schema de Empresa
export const companySchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .min(3, 'Razão social ou nome da empresa deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo'),
  tradeName: z
    .string()
    .max(80, 'Nome fantasia muito longo')
    .optional()
    .or(z.literal('')),
  cnpj: z
    .string()
    .regex(/^$|^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/, 'CNPJ deve conter 14 dígitos válidos')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(800, 'Descrição muito longa')
    .optional()
    .or(z.literal('')),
  logoUrl: z
    .string()
    .url('URL do logotipo inválida')
    .optional()
    .or(z.literal('')),
  slug: z.string().optional(),
});

export type ProfessionalProfileInput = z.infer<typeof professionalProfileSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
