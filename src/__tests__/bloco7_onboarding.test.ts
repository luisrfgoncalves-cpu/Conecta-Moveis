import { describe, it, expect } from 'vitest';
import { ONBOARDING_TRACKS } from '@/components/onboarding/onboardingData';

describe('Bloco 7 — Onboarding (Apresentação em 3 Telas)', () => {
  it('possui as duas trilhas de apresentação configuradas', () => {
    expect(ONBOARDING_TRACKS).toHaveProperty('procurar');
    expect(ONBOARDING_TRACKS).toHaveProperty('divulgar');
  });

  describe('Trilha: Para quem procura profissionais', () => {
    const track = ONBOARDING_TRACKS.procurar;

    it('possui exatamente 3 telas curtas e puláveis', () => {
      expect(track.steps).toHaveLength(3);
      track.steps.forEach((step, index) => {
        expect(step.stepNumber).toBe(index + 1);
        expect(step.totalSteps).toBe(3);
        expect(step.title.trim().length).toBeGreaterThan(0);
        expect(step.leadText.trim().length).toBeGreaterThan(0);
      });
    });

    it('contém os textos oficiais exigidos para quem procura', () => {
      // Tela 1
      expect(track.steps[0].title).toBe('Encontre quem monta e fabrica móveis na sua região.');

      // Tela 2
      expect(track.steps[1].leadText).toContain(
        'Veja os perfis e fale direto: preço, prazo e pagamento são combinados só entre vocês.'
      );

      // Tela 3 (Aviso de Isenção e contrato por escrito)
      expect(track.steps[2].leadText).toContain(
        'A plataforma divulga os profissionais. Não contrata, não cobra comissão e não garante o serviço. Antes de fechar, peça contrato por escrito.'
      );
    });
  });

  describe('Trilha: Para quem anuncia serviços', () => {
    const track = ONBOARDING_TRACKS.divulgar;

    it('possui exatamente 3 telas curtas e puláveis', () => {
      expect(track.steps).toHaveLength(3);
      track.steps.forEach((step, index) => {
        expect(step.stepNumber).toBe(index + 1);
        expect(step.totalSteps).toBe(3);
        expect(step.title.trim().length).toBeGreaterThan(0);
        expect(step.leadText.trim().length).toBeGreaterThan(0);
      });
    });

    it('contém os textos oficiais exigidos para quem anuncia', () => {
      // Tela 1
      expect(track.steps[0].title).toBe(
        'Seja encontrado por quem procura montagem e marcenaria na sua cidade.'
      );

      // Tela 2
      expect(track.steps[1].leadText).toContain(
        'Perfil pronto em cerca de 10 minutos: especialidades, região, fotos e WhatsApp.'
      );

      // Tela 3
      expect(track.steps[2].leadText).toContain(
        'Cadastro gratuito no lançamento. Mudanças serão avisadas antes. Sem comissão sobre seus serviços.'
      );
    });
  });
});
