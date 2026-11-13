import { test, expect } from '@playwright/test';

test.describe('Perfil Público de Profissional', () => {
  test('página /encontrar-profissionais carrega sem erro', async ({ page }) => {
    const response = await page.goto('/encontrar-profissionais');
    expect(response?.status()).not.toBe(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('cards de profissional (se existirem) possuem alt text na imagem', async ({ page }) => {
    await page.goto('/encontrar-profissionais');

    // Wait for page to settle
    await page.waitForLoadState('domcontentloaded');

    // Find all images inside cards/list items
    const images = page.locator(
      'article img, [class*="card"] img, [class*="Card"] img, li img, [role="listitem"] img'
    );

    const count = await images.count();

    if (count === 0) {
      // No professional cards/images found — that's acceptable (empty state or SSR auth-gated)
      console.log('Nenhum card de profissional encontrado na página. Pulando verificação de alt.');
      return;
    }

    // Every image in a card must have a non-empty alt attribute
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(
        alt !== null && alt.trim().length > 0,
        `Imagem ${i + 1} de ${count} não possui alt text`
      ).toBe(true);
    }
  });

  test('página /profissionais/[slug] é acessível por URL de slug', async ({ page }) => {
    // Navigate to base profissionais route — may redirect or show profile
    // We just verify no 500 is thrown
    const response = await page.goto('/profissionais/exemplo-slug');
    // 404 is acceptable (slug doesn't exist); 500 is not
    if (response) {
      expect(response.status()).not.toBe(500);
    }
  });
});
