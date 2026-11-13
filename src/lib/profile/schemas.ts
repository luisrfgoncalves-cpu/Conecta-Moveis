import { z } from 'zod';

export const CATEGORIES_CATALOG = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Montador de Móveis',
    slug: 'montador-de-moveis',
    description: 'Montagem e desmontagem de móveis modulados e convencionais.',
    icon: 'Wrench',
    specialties: [
      { id: '0d10eb12-81c5-409e-b488-d0735fe9af83', name: 'Móveis Modulados', slug: 'moveis-modulados' },
      { id: 'dcdcd206-af20-401d-89bb-de17dd342e1c', name: 'Montagem de Guarda-Roupas', slug: 'montagem-guarda-roupas' },
      { id: '1125e317-29ab-4e3d-b648-27e5e9a75376', name: 'Cozinhas Planejadas', slug: 'cozinhas-planejadas' },
      { id: 'a241bc0b-a32f-4c40-aed6-21c275f6a633', name: 'Desmontagem e Mudança', slug: 'desmontagem-mudanca' },
      { id: '91c63f10-87ae-4b76-bce5-9fce8b615cee', name: 'Regulagem de Portas e Gavetas', slug: 'regulagem-portas' },
    ],
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Marceneiro',
    slug: 'marceneiro',
    description: 'Marcenaria fina, sob medida e restauração.',
    icon: 'Sparkles',
    specialties: [
      { id: '1d630c2f-5d2b-4ed1-a0ae-36f7d26aa527', name: 'Cozinhas Sob Medida', slug: 'cozinhas-sob-medida' },
      { id: '7638d817-e79c-46b6-9ad1-4344affc75b6', name: 'Painéis Ripados', slug: 'paineis-ripados' },
      { id: '7670f515-ee71-41ca-be5f-de2fa7309499', name: 'Closets e Dormitórios', slug: 'closets-dormitorios' },
      { id: 'cbc95b7d-a99b-4961-94ef-3c3dba509299', name: 'Móveis para Banheiro', slug: 'moveis-banheiro' },
      { id: '32511e04-ca00-4a4d-9dc2-c46dfc73e3f6', name: 'Restauração de Madeira', slug: 'restauracao-madeira' },
    ],
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Loja de Planejados',
    slug: 'loja-de-planejados',
    description: 'Showrooms e comércio de mobiliário planejado.',
    icon: 'Box',
    specialties: [
      { id: 'c952d1c0-9e81-4e0e-b2e1-2a05155dfc10', name: 'Ambientes Completos', slug: 'ambientes-completos' },
      { id: 'ea5309bd-8353-4035-a89b-e8cca0d92244', name: 'Planejados Residenciais', slug: 'planejados-residenciais' },
      { id: 'a4e2e1e9-1d11-4ac8-927d-77472392de15', name: 'Planejados Corporativos', slug: 'planejados-corporativos' },
    ],
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Marcenaria',
    slug: 'marcenaria',
    description: 'Fábricas e oficinas de médio e grande porte.',
    icon: 'Hammer',
    specialties: [
      { id: '5a6bf4d7-7f11-4152-9749-e4d6ff193b9f', name: 'Usinagem CNC', slug: 'usinagem-cnc' },
      { id: 'e819f860-a376-4634-a757-4f0760f38b50', name: 'Grandes Lotes e Franquias', slug: 'grandes-lotes' },
      { id: 'e9c38eb3-2d2e-4787-8d6c-1b7cfbd975eb', name: 'Corte e Fita de Borda', slug: 'corte-borda' },
    ],
  },
  {
    id: 'c5555555-5555-5555-5555-555555555555',
    name: 'Projetista',
    slug: 'projetista',
    description: 'Projetos 3D, paginação de ambientes e renderização.',
    icon: 'Ruler',
    specialties: [
      { id: 'fd4dcb30-5e4f-4fd1-9eee-141d370615a2', name: 'Projeto 3D / Promob', slug: 'projeto-promob' },
      { id: '251ff6c0-fa2b-40c2-a354-795e54a43389', name: 'Renderização Fotorrealista', slug: 'render-fotorrealista' },
      { id: 'fcb855df-6539-43e8-8088-262fcb95e6fb', name: 'Planta Técnica de Fabricação', slug: 'planta-tecnica' },
    ],
  },
  {
    id: 'c6666666-6666-6666-6666-666666666666',
    name: 'Parceiros Complementares',
    slug: 'parceiros-complementares',
    description: 'Eletricistas para LED, serralheiros, vidraceiros, medidores, reparadores e transportadores.',
    icon: 'Lightbulb',
    specialties: [
      { id: 'ed807f96-cd40-4ca3-9f52-e2482211d982', name: 'Eletricista para LED', slug: 'eletricista-led' },
      { id: 'ab2a9654-fdc9-4358-b716-62a670053b00', name: 'Instalador de Esquadrias', slug: 'instalador-esquadrias' },
      { id: '09941c25-602b-4e90-854e-c4d1ba408a36', name: 'Vidraceiro', slug: 'vidraceiro' },
      { id: 'e7307580-4304-462d-8d5c-92da9f671ff3', name: 'Serralheiro', slug: 'serralheiro' },
      { id: 'af126936-bcae-4cd9-ba02-1d380a4d0ad4', name: 'Transportador', slug: 'transportador' },
      { id: 'dcbbb0cc-1782-4bde-9266-3859315d11cd', name: 'Medidor', slug: 'medidor-tecnico' },
      { id: '55cf52f5-2601-4405-9474-43eb85bd0856', name: 'Reparador', slug: 'reparador' },
      { id: '21e48041-db66-47f2-b7c4-4b6b3a8f3a11', name: 'Instalador de Acessórios', slug: 'instalador-acessorios' },
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

