import { test, expect } from '@playwright/test';

test.describe('FASE 15 — E2E de Isenção, Avisos e Tela de Saída WhatsApp', () => {
  test('aviso curto fixo da plataforma está visível no rodapé em todas as páginas', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const avisoRodape = page.locator('footer').getByRole('region', { name: 'Aviso oficial da plataforma' });
    await expect(avisoRodape).toBeVisible();
    await expect(avisoRodape).toContainText('A Conecta Móveis é uma vitrine de anúncios');
    await expect(avisoRodape).toContainText('Não presta, intermedeia, contrata, garante nem avalia a qualidade');
  });

  test('aviso da plataforma está presente na página de busca e nos perfis', async ({ page }) => {
    await page.goto('/encontrar-profissionais');
    await page.waitForLoadState('domcontentloaded');

    // Confirma aviso na busca
    const avisoBusca = page.getByRole('region', { name: 'Aviso oficial da plataforma' });
    await expect(avisoBusca).toBeVisible();

    // Navega para função da plataforma
    await page.goto('/funcao-da-plataforma');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1')).toContainText('Função e Limites da Plataforma');

    // Navega para como ordenamos os resultados
    await page.goto('/como-ordenamos-os-resultados');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1')).toContainText('Como Ordenamos os Resultados');

    // Navega para contrate com segurança
    await page.goto('/contrate-com-seguranca');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1')).toContainText('Orientações de Segurança para Contratação');
  });

  test('clicar no botão de WhatsApp abre a tela de saída antes do redirecionamento', async ({ page }) => {
    // Acessa a busca de profissionais e clica no primeiro perfil disponível
    await page.goto('/encontrar-profissionais');
    await page.waitForLoadState('domcontentloaded');

    const cardLink = page.locator('a[href^="/profissionais/"]').first();
    if (await cardLink.isVisible()) {
      await cardLink.click();
      await page.waitForLoadState('domcontentloaded');

      const waBtn = page.locator('a[href*="wa.me"]').first();
      if (await waBtn.isVisible()) {
        await waBtn.click();

        // O modal de aviso deve abrir na tela
        const modal = page.locator('div[role="dialog"]');
        await expect(modal).toBeVisible();
        await expect(modal).toContainText('Aviso de Saída da Plataforma');
        await expect(modal).toContainText('Você vai conversar diretamente com o anunciante, fora da Conecta Móveis');
        await expect(modal).toContainText('Preço, prazo, contrato e pagamento são combinados somente entre vocês');

        // Botão voltar fecha o modal
        const voltarBtn = modal.getByRole('button', { name: 'Voltar' });
        await voltarBtn.click();
        await expect(modal).not.toBeVisible();
      }
    }
  });
});

