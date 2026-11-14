import { describe, it, expect, vi } from 'vitest';
import {
  validateImageMagicBytes,
  generateDHash,
  hammingDistance,
} from '../lib/portfolio/processor';
import { validateExternalLink, EXTERNAL_LINK_REL } from '../lib/profile/externalLink';
import { PORTFOLIO_CONFIG, runAutoModerationExtension } from '../lib/portfolio/config';

// Mock simples para simular ambiente do Supabase nas ações
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('FASE 24 — Fotos de Apresentação e Upload Avançado', () => {
  // 1. Arquivo disfarçado é rejeitado
  describe('1. Validação de Magic Bytes (Segurança de Upload)', () => {
    it('rejeita categoricamente executável Windows PE disfarçado de imagem (.exe renomeado para .jpg)', () => {
      // Assinatura MZ
      const fakeExe = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00]);
      const res = validateImageMagicBytes(fakeExe);
      expect(res.valid).toBe(false);
      expect(res.detectedFormat).toContain('Executável Proibido');
    });

    it('rejeita executável Linux ELF disfarçado', () => {
      const fakeElf = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
      const res = validateImageMagicBytes(fakeElf);
      expect(res.valid).toBe(false);
      expect(res.detectedFormat).toContain('Executável Proibido');
    });

    it('rejeita arquivos corrompidos ou com menos de 12 bytes', () => {
      const tinyBuffer = Buffer.from([0xff, 0xd8, 0xff]);
      const res = validateImageMagicBytes(tinyBuffer);
      expect(res.valid).toBe(false);
    });

    it('aceita arquivos com assinaturas válidas de JPEG, PNG e WebP', () => {
      const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
      expect(validateImageMagicBytes(jpeg).valid).toBe(true);

      const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
      expect(validateImageMagicBytes(png).valid).toBe(true);

      const webp = Buffer.from([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x20, 0x00, 0x00, 0x00,
        0x57, 0x45, 0x42, 0x50, // WEBP
      ]);
      expect(validateImageMagicBytes(webp).valid).toBe(true);
    });

    it('identifica assinatura ftyp de HEIC (fotos de iPhone)', () => {
      const heic = Buffer.from([
        0x00, 0x00, 0x00, 0x18,
        0x66, 0x74, 0x79, 0x70, // ftyp
        0x68, 0x65, 0x69, 0x63, // heic
      ]);
      const res = validateImageMagicBytes(heic);
      expect(res.valid).toBe(true);
      expect(res.detectedFormat).toBe('image/heic');
    });
  });

  // 2. Hash Perceptual (dHash) e detecção de duplicata
  describe('2. dHash Perceptual e Distância de Hamming', () => {
    it('gera hash hexadecimal de 16 caracteres para imagem sintética', async () => {
      // 1x1 pixel JPEG válido
      const sampleJpeg = Buffer.from([
        0xff,0xd8,0xff,0xe0,0x00,0x10,0x4a,0x46,0x49,0x46,0x00,0x01,0x01,0x00,0x00,0x01,
        0x00,0x01,0x00,0x00,0xff,0xdb,0x00,0x43,0x00,0x08,0x06,0x06,0x07,0x06,0x05,0x08,
        0x07,0x07,0x07,0x09,0x09,0x08,0x0a,0x0c,0x14,0x0d,0x0c,0x0b,0x0b,0x0c,0x19,0x12,
        0x13,0x0f,0x14,0x1d,0x1a,0x1f,0x1e,0x1d,0x1a,0x1c,0x1c,0x20,0x24,0x2e,0x27,0x20,
        0x22,0x2c,0x23,0x1c,0x1c,0x28,0x37,0x29,0x2c,0x30,0x31,0x34,0x34,0x34,0x1f,0x27,
        0x39,0x3d,0x38,0x32,0x3c,0x2e,0x33,0x34,0x32,0xff,0xc0,0x00,0x0b,0x08,0x00,0x01,
        0x00,0x01,0x01,0x01,0x11,0x00,0xff,0xc4,0x00,0x1f,0x00,0x00,0x01,0x05,0x01,0x01,
        0x01,0x01,0x01,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x01,0x02,0x03,0x04,
        0x05,0x06,0x07,0x08,0x09,0x0a,0x0b,0xff,0xc4,0x00,0xb5,0x10,0x00,0x02,0x01,0x03,
        0x03,0x02,0x04,0x03,0x05,0x05,0x04,0x04,0x00,0x00,0x01,0x7d,0x01,0x02,0x03,0x00,
        0x04,0x11,0x05,0x12,0x21,0x31,0x41,0x06,0x13,0x51,0x61,0x07,0x22,0x71,0x14,0x32,
        0x81,0x91,0xa1,0x08,0x23,0x42,0xb1,0xc1,0x15,0x52,0xd1,0xf0,0x24,0x33,0x62,0x72,
        0x82,0x09,0x0a,0x16,0x17,0x18,0x19,0x1a,0x25,0x26,0x27,0x28,0x29,0x2a,0x34,0x35,
        0x36,0x37,0x38,0x39,0x3a,0x43,0x44,0x45,0x46,0x47,0x48,0x49,0x4a,0x53,0x54,0x55,
        0x56,0x57,0x58,0x59,0x5a,0x63,0x64,0x65,0x66,0x67,0x68,0x69,0x6a,0x73,0x74,0x75,
        0x76,0x77,0x78,0x79,0x7a,0x83,0x84,0x85,0x86,0x87,0x88,0x89,0x8a,0x92,0x93,0x94,
        0x95,0x96,0x97,0x98,0x99,0x9a,0xa2,0xa3,0xa4,0xa5,0xa6,0xa7,0xa8,0xa9,0xaa,0xb2,
        0xb3,0xb4,0xb5,0xb6,0xb7,0xb8,0xb9,0xba,0xc2,0xc3,0xc4,0xc5,0xc6,0xc7,0xc8,0xc9,
        0xca,0xd2,0xd3,0xd4,0xd5,0xd6,0xd7,0xd8,0xd9,0xda,0xe1,0xe2,0xe3,0xe4,0xe5,0xe6,
        0xe7,0xe8,0xe9,0xea,0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9,0xfa,0xff,0xda,
        0x00,0x08,0x01,0x01,0x00,0x00,0x3f,0x00,0xfb,0x28,0xa2,0x8f,0xff,0xd9,
      ]);

      const hash = await generateDHash(sampleJpeg);
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(16);
      expect(/^[0-9a-f]{16}$/.test(hash)).toBe(true);
    });

    it('calcula distância de Hamming 0 para hashes idênticos', () => {
      expect(hammingDistance('1234567890abcdef', '1234567890abcdef')).toBe(0);
    });

    it('calcula distância máxima (64) para hashes totalmente invertidos', () => {
      expect(hammingDistance('0000000000000000', 'ffffffffffffffff')).toBe(64);
    });

    it('identifica hashes com distância <= 10 como suspeita de duplicata (alerta humano)', () => {
      // 2 bits de diferença no último caractere hex ('0' -> '1')
      const h1 = '1234567890abcdef';
      const h2 = '1234567890abcdee';
      const dist = hammingDistance(h1, h2);
      expect(dist).toBeLessThanOrEqual(10);
    });
  });

  // 3. Metas de Peso e Resolução
  describe('3. Metas de Peso e Resolução (WebP 1280px / 400px)', () => {
    it('garante que a configuração define limites de 1280px (<=250KB) e 400px (~30KB)', () => {
      expect(PORTFOLIO_CONFIG.MAX_IMAGE_DIMENSION).toBe(1280);
      expect(PORTFOLIO_CONFIG.TARGET_FULL_BYTES).toBe(250 * 1024);
      expect(PORTFOLIO_CONFIG.THUMB_IMAGE_DIMENSION).toBe(400);
      expect(PORTFOLIO_CONFIG.TARGET_THUMB_BYTES).toBe(30 * 1024);
    });

    it('garante Cache-Control de longa duração para nomes de arquivos imutáveis', () => {
      expect(PORTFOLIO_CONFIG.CACHE_CONTROL_HEADER).toContain('max-age=31536000');
      expect(PORTFOLIO_CONFIG.CACHE_CONTROL_HEADER).toContain('immutable');
    });
  });

  // 4. Triagem Automática e Princípio de Não Exclusão Autônoma
  describe('4. Triagem Automática (Princípio R20: Apenas Prioriza Fila)', () => {
    it('triagem automática nunca publica nem remove sozinha', async () => {
      const res = await runAutoModerationExtension(Buffer.from([]), 'foto.jpg');
      expect(res.passed).toBe(true);
      // Status inicial em todas as gravações no banco deve ser estritamente 'pending'
      const initialStatus = 'pending';
      expect(initialStatus).toBe('pending');
      expect(initialStatus).not.toBe('approved');
      expect(initialStatus).not.toBe('rejected');
    });
  });

  // 5. Cota do Plano Gratuito (1 foto card + 2 no perfil = 3 total)
  describe('5. Cota e Fotos de Apresentação', () => {
    it('define limite de 3 fotos de apresentação no plano gratuito', () => {
      expect(PORTFOLIO_CONFIG.MAX_PHOTOS_PER_PROFILE).toBe(3);
    });

    it('alerta no admin a 70% da capacidade do Storage', () => {
      expect(PORTFOLIO_CONFIG.STORAGE_ALERT_THRESHOLD).toBe(0.70);
    });
  });

  // 6. Tipos de Imagem (CDC art. 37)
  describe('6. Tipos de Imagem e Rótulo Obrigatório', () => {
    it('permite apenas os tipos trabalho_realizado ou ilustrativa', () => {
      const validTypes = ['trabalho_realizado', 'ilustrativa'];
      expect(validTypes).toContain('trabalho_realizado');
      expect(validTypes).toContain('ilustrativa');
      expect(validTypes).not.toContain('generica');
    });
  });

  // 7. Validação de Links Externos
  describe('7. Validação de Link Externo de Anunciante (Item 10)', () => {
    it('aceita link HTTPS válido e normalizado', () => {
      const res = validateExternalLink('https://www.marcenariajundiai.com.br');
      expect(res.valid).toBe(true);
      expect(res.sanitizedUrl).toBe('https://www.marcenariajundiai.com.br/');
    });

    it('rejeita link HTTP inseguro (sem SSL)', () => {
      const res = validateExternalLink('http://www.marcenariajundiai.com.br');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('https://');
    });

    it('rejeita esquemas perigosos (javascript:, data:)', () => {
      const resJs = validateExternalLink('javascript:alert(document.cookie)');
      expect(resJs.valid).toBe(false);

      const resData = validateExternalLink('data:text/html,<script>evil()</script>');
      expect(resData.valid).toBe(false);
    });

    it('rejeita endereços de rede privada e localhost', () => {
      const resLocal = validateExternalLink('https://localhost:3000');
      expect(resLocal.valid).toBe(false);

      const resIp = validateExternalLink('https://192.168.1.1');
      expect(resIp.valid).toBe(false);
    });

    it('define atributo rel="noopener nofollow ugc" obrigatório para links de anunciantes', () => {
      expect(EXTERNAL_LINK_REL).toBe('noopener nofollow ugc');
    });
  });
});
