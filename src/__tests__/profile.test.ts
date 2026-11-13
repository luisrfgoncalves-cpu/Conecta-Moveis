import { describe, it, expect } from 'vitest';
import {
  generateSlug,
  professionalProfileSchema,
  publishValidationSchema,
  companySchema,
} from '@/lib/profile/schemas';
import {
  validateImageMagicBytes,
  processAvatarImage,
} from '@/lib/storage/upload';

// ─── 1. Geração de Slugs Únicos e Seguros ─────────────────────────────────────

describe('generateSlug', () => {
  it('converte texto em slug limpo sem acentos e sem caracteres especiais', () => {
    const slug = generateSlug('Carlos Silva & Filhos - Montador Jundiaí/SP');
    expect(slug).toBe('carlos-silva-filhos-montador-jundiai-sp');
  });

  it('adiciona sufixo único com segurança quando solicitado', () => {
    const slug = generateSlug('Marcenaria Oliveira', 'x9z1');
    expect(slug).toBe('marcenaria-oliveira-x9z1');
  });

  it('limita o tamanho máximo para evitar slugs gigantescos', () => {
    const longText = 'a'.repeat(200);
    const slug = generateSlug(longText);
    expect(slug.length).toBeLessThanOrEqual(50);
  });
});

// ─── 2. Validação de Assinatura Real (Magic Bytes) e Uploads Disfarçados ──────

describe('validateImageMagicBytes & processAvatarImage (Anti-Malware / Disguised Files)', () => {
  it('aceita assinatura real de JPEG (FF D8 FF)', () => {
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    const res = validateImageMagicBytes(jpegBuffer);
    expect(res.valid).toBe(true);
    expect(res.detectedFormat).toBe('jpeg');
  });

  it('aceita assinatura real de PNG (89 50 4E 47 ...)', () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    const res = validateImageMagicBytes(pngBuffer);
    expect(res.valid).toBe(true);
    expect(res.detectedFormat).toBe('png');
  });

  it('aceita assinatura real de WebP (RIFF .... WEBP)', () => {
    const webpHeader = Buffer.from('RIFF1234WEBP', 'ascii');
    const res = validateImageMagicBytes(webpHeader);
    expect(res.valid).toBe(true);
    expect(res.detectedFormat).toBe('webp');
  });

  it('TESTE NEGATIVO OBRIGATÓRIO: rejeita arquivo executável disfarçado como imagem (.exe / MZ header)', async () => {
    // Windows PE Executable magic bytes: MZ (4D 5A)
    const fakeImageBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00fake executable content');
    const magic = validateImageMagicBytes(fakeImageBuffer);
    expect(magic.valid).toBe(false);

    const processed = await processAvatarImage(fakeImageBuffer);
    expect(processed.valid).toBe(false);
    expect(processed.error).toMatch(/formato real deve ser uma imagem válida/i);
  });

  it('TESTE NEGATIVO OBRIGATÓRIO: rejeita script PHP / Bash / HTML disfarçado como imagem', async () => {
    const scriptBuffer = Buffer.from('<?php echo "malicious code"; ?>');
    const magic = validateImageMagicBytes(scriptBuffer);
    expect(magic.valid).toBe(false);

    const processed = await processAvatarImage(scriptBuffer);
    expect(processed.valid).toBe(false);
  });
});

// ─── 3. Validação do Perfil Profissional (professionalProfileSchema) ──────────

describe('professionalProfileSchema', () => {
  const validData = {
    displayName: 'Carlos Silva',
    bio: 'Mais de 10 anos de experiência em montagem de móveis modulados e cozinhas planejadas.',
    city: 'Jundiaí',
    state: 'SP',
    neighborhoods: ['Centro', 'Vila Arens'],
    specialtyIds: ['aa111111-1111-1111-1111-111111111111'],
    whatsapp: '11999998888',
    isWhatsappPublic: true,
  };

  it('valida dados corretos de perfil profissional', () => {
    const res = professionalProfileSchema.safeParse(validData);
    expect(res.success).toBe(true);
  });

  it('rejeita nome profissional com menos de 3 caracteres', () => {
    const res = professionalProfileSchema.safeParse({ ...validData, displayName: 'Al' });
    expect(res.success).toBe(false);
    expect(res.error?.issues[0].message).toMatch(/3 caracteres/);
  });

  it('rejeita bio curta com menos de 80 caracteres', () => {
    const res = professionalProfileSchema.safeParse({ ...validData, bio: 'Sou montador de móveis em Jundiaí e região.' });
    expect(res.success).toBe(false);
    expect(res.error?.issues[0].message).toMatch(/80 caracteres/);
  });

  it('rejeita perfil sem ao menos 1 especialidade selecionada', () => {
    const res = professionalProfileSchema.safeParse({ ...validData, specialtyIds: [] });
    expect(res.success).toBe(false);
    expect(res.error?.issues[0].message).toMatch(/ao menos 1 especialidade/);
  });

  it('rejeita UF com mais ou menos de 2 letras', () => {
    const res = professionalProfileSchema.safeParse({ ...validData, state: 'SAOPAULO' });
    expect(res.success).toBe(false);
  });
});

// ─── 4. Validação dos Critérios Mínimos de Publicação (publishValidationSchema) 

describe('publishValidationSchema', () => {
  it('aprova publicação quando todos os critérios mínimos e e-mail estão confirmados', () => {
    const res = publishValidationSchema.safeParse({
      displayName: 'Carlos Silva',
      bio: 'Especialista em montagem de móveis com ferramentas profissionais e acabamento fino.',
      city: 'Jundiaí',
      state: 'SP',
      neighborhoods: ['Centro', 'Vila Arens'],
      specialtyIds: ['spec-1'],
      whatsapp: '11999998888',
      avatarUrl: 'https://exemplo.com/avatar.webp',
      emailConfirmed: true,
    });
    expect(res.success).toBe(true);
  });

  it('TESTE NEGATIVO OBRIGATÓRIO: bloqueia publicação se o e-mail NÃO estiver confirmado', () => {
    const res = publishValidationSchema.safeParse({
      displayName: 'Carlos Silva',
      bio: 'Especialista em montagem de móveis com ferramentas profissionais e acabamento fino.',
      city: 'Jundiaí',
      state: 'SP',
      neighborhoods: ['Centro'],
      specialtyIds: ['spec-1'],
      whatsapp: '11999998888',
      avatarUrl: 'https://exemplo.com/avatar.webp',
      emailConfirmed: false,
    });
    expect(res.success).toBe(false);
    expect(res.error?.issues[0].message).toMatch(/e-mail confirmado/i);
  });
});

// ─── 5. Validação de Empresa (companySchema) e CNPJ ───────────────────────────

describe('companySchema & CNPJ Informativo', () => {
  it('valida empresa com dados completos e CNPJ opcional preenchido', () => {
    const res = companySchema.safeParse({
      name: 'Marcenaria Jundiaiense Ltda',
      tradeName: 'Studio Jundiaí',
      cnpj: '12.345.678/0001-90',
      description: 'Oficina completa de marcenaria sob medida.',
    });
    expect(res.success).toBe(true);
  });

  it('permite criação de empresa SEM CNPJ (campo opcional e sem selo)', () => {
    const res = companySchema.safeParse({
      name: 'Marcenaria Jundiaiense Ltda',
      tradeName: 'Studio Jundiaí',
      cnpj: '',
    });
    expect(res.success).toBe(true);
  });

  it('rejeita formato de CNPJ completamente inválido', () => {
    const res = companySchema.safeParse({
      name: 'Marcenaria Jundiaiense Ltda',
      cnpj: 'cnpj-invalido-123',
    });
    expect(res.success).toBe(false);
    expect(res.error?.issues[0].message).toMatch(/CNPJ deve conter 14 dígitos/);
  });
});

// ─── 6. Testes Negativos de Isolamento e Parâmetros Protegidos ────────────────

describe('Isolamento de Perfil e Proteção de Papéis / Status', () => {
  it('TESTE NEGATIVO OBRIGATÓRIO: campos protegidos (is_suspended, is_featured) não existem no schema de entrada', () => {
    // Um atacante tentando passar is_suspended: false ou is_featured: true via JSON
    const maliciousInput = {
      displayName: 'Hacker',
      bio: 'Tentativa de escalada de privilégios para destaque gratuito na vitrine do sistema de forma maliciosa.',
      city: 'Jundiaí',
      state: 'SP',
      specialtyIds: ['spec-1'],
      is_suspended: false,
      is_featured: true, // Não deve ser inferido
      role: 'admin',      // Não deve ser aceito
    };

    const parsed = professionalProfileSchema.parse(maliciousInput);
    const record = parsed as Record<string, unknown>;
    expect(record.is_featured).toBeUndefined();
    expect(record.is_suspended).toBeUndefined();
    expect(record.role).toBeUndefined();
  });
});
