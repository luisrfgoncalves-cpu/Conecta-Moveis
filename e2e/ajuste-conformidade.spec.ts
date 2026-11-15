import { test, expect } from '@playwright/test';

test.describe('Fase Ajuste — Textos, Dados Fictícios e Conformidade', () => {
  test('home não contém "+120 Profissionais", métricas inventadas nem marcas de terceiros como Blum/Reflecta', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const bodyText = await page.locator('body').innerText();

    // 1. Números fixos e métricas inventadas
    expect(bodyText).not.toMatch(/\+120/i);
    expect(bodyText).not.toMatch(/120\s+profissionais/i);
    expect(bodyText).not.toMatch(/responde em até 1 hora/i);
    expect(bodyText).not.toMatch(/12 anos de atuação/i);

    // 2. Termos proibidos da Etapa 4
    expect(bodyText).not.toMatch(/avaliações reais/i);
    expect(bodyText).not.toMatch(/avaliações com base em contato prévio de verdade/i);
    expect(bodyText).not.toMatch(/aprovadas manualmente/i);
    expect(bodyText).not.toMatch(/especialistas em evidência/i);
    expect(bodyText).not.toMatch(/acabamento profissional/i);
    expect(bodyText).not.toMatch(/alta resolução/i);
    expect(bodyText).not.toMatch(/catálogo visual/i);
    expect(bodyText).not.toMatch(/transparência total/i);
    expect(bodyText).not.toMatch(/zero taxa/i);

    // 3. Marcas de terceiros
    expect(bodyText).not.toMatch(/\bBlum\b/);
    expect(bodyText).not.toMatch(/\bReflecta\b/);
  });

  test('vitrine mostra ou perfis reais ou estado vazio honesto com botão de cadastro', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const section = page.locator('section').filter({ hasText: /Perfis em exibição|Vitrine em Destaque/i });
    await expect(section).toBeVisible();

    const emptyState = page.getByText('Os primeiros perfis estão chegando');
    const realCards = page.locator('a[href^="/profissionais/"]');

    const isEmpty = await emptyState.isVisible();
    const hasCards = (await realCards.count()) > 0;

    // Deve ser um ou outro (honesto)
    expect(isEmpty || hasCards).toBe(true);
    if (isEmpty) {
      await expect(page.getByRole('link', { name: /Cadastrar meu perfil|Cadastrar Perfil/i })).toBeVisible();
    }
  });

  test('FAQ utiliza details/summary acessível nativo no HTML', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const details = page.locator('details');
    const count = await details.count();
    expect(count).toBeGreaterThan(0);

    // O primeiro item inicia aberto
    const firstDetails = details.first();
    await expect(firstDetails).toHaveAttribute('open', '');

    // O segundo item inicia fechado; ao clicar em seu summary, ele deve abrir
    const secondDetails = details.nth(1);
    await expect(secondDetails).not.toHaveAttribute('open', '');
    const secondSummary = secondDetails.locator('summary');
    await secondSummary.click();
    await expect(secondDetails).toHaveAttribute('open', '');
  });

  test('rodapé exibe operador em formalização sem usar a palavra "Pendente"', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    const footerText = await footer.innerText();
    expect(footerText).toContain('Operador: em processo de formalização');
    expect(footerText).not.toContain('CNPJ Pendente');
    expect(footerText).not.toContain('Razão Social: Pendente');
  });

  test('background utiliza WebP otimizado', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const sources = page.locator('picture source[type="image/webp"]');
    await expect(sources.first()).toBeAttached();
    const count = await sources.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const firstSrcset = await sources.first().getAttribute('srcset');
    expect(firstSrcset).toMatch(/background-(mobile|desktop)\.webp/);
  });
});
