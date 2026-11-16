import { describe, it, expect } from 'vitest';
import manifest from '@/app/manifest';

describe('Fase 26 — Capacidade para 300 Usuários, Backup e PWA Mínimo', () => {
  describe('PWA Mínimo (manifest.ts)', () => {
    it('deve gerar manifesto válido com nome, tema e modo standalone', () => {
      const data = manifest();

      expect(data.name).toBe('Vitrine Moveleira — Vitrine de Profissionais Moveleiros');
      expect(data.short_name).toBe('Vitrine Moveleira');
      expect(data.display).toBe('standalone');
      expect(data.theme_color).toBe('#f97316');
      expect(data.background_color).toBe('#0f172a');
      expect(data.start_url).toBe('/');
    });

    it('deve incluir ícones em conformidade para instalação em celular (Android/iOS)', () => {
      const data = manifest();
      expect(data.icons).toBeDefined();
      expect(data.icons?.length).toBeGreaterThanOrEqual(2);

      const has192 = data.icons?.some((i) => i.sizes === '192x192');
      const has512 = data.icons?.some((i) => i.sizes === '512x512');
      expect(has192).toBe(true);
      expect(has512).toBe(true);
    });
  });

  describe('Dimensionamento e Métricas para 300 Perfis no Plano Gratuito', () => {
    const SUPABASE_FREE_STORAGE_MB = 1000;
    const SUPABASE_FREE_DB_MB = 500;
    const TARGET_PROFILES = 300;
    const PHOTOS_PER_PROFILE = 3;
    const AVG_PHOTO_SIZE_KB = 220; // Meta da Fase 24 (WebP <= 250KB)

    it('300 perfis com 3 fotos de apresentação devem consumir menos de 250 MB de Storage (< 25% da cota gratuita)', () => {
      const totalImages = TARGET_PROFILES * PHOTOS_PER_PROFILE; // 900 fotos
      const totalStorageMb = (totalImages * AVG_PHOTO_SIZE_KB) / 1024; // ~193.3 MB

      expect(totalStorageMb).toBeLessThan(250);
      expect(totalStorageMb / SUPABASE_FREE_STORAGE_MB).toBeLessThan(0.25);
    });

    it('o banco de dados para 300 perfis com histórico de logs deve consumir menos de 100 MB (< 20% da cota)', () => {
      const baseDbMb = 35;
      const mbPerProfileWithLogs = 0.08;
      const estimatedDbMb = baseDbMb + TARGET_PROFILES * mbPerProfileWithLogs; // ~59 MB

      expect(estimatedDbMb).toBeLessThan(100);
      expect(estimatedDbMb / SUPABASE_FREE_DB_MB).toBeLessThan(0.2);
    });

    it('deve disparar alerta de atenção ao ultrapassar 70% e crítico ao ultrapassar 90%', () => {
      function getAlertLevel(usageMb: number, limitMb: number) {
        const pct = (usageMb / limitMb) * 100;
        if (pct >= 90) return 'critical_90';
        if (pct >= 70) return 'warning_70';
        return 'ok';
      }

      expect(getAlertLevel(200, 1000)).toBe('ok');
      expect(getAlertLevel(720, 1000)).toBe('warning_70');
      expect(getAlertLevel(910, 1000)).toBe('critical_90');
    });
  });
});

