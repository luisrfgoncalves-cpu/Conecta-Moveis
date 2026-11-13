import { test, expect } from '@playwright/test';

test.describe('Busca de Profissionais', () => {
  test('página /encontrar-profissionais carrega sem erro 500', async ({ page }) => {
    const response = await page.goto('/encontrar-profissionais');
    expect(response?.status()).not.toBe(500);
  });

  test('existe input de busca na página', async ({ page }) => {
    await page.goto('/encontrar-profissionais');
    // Open drawer on mobile if button is present
    const drawerBtn = page.getByRole('button', { name: /filtrar/i }).filter({ visible: true });
    if (await drawerBtn.isVisible().catch(() => false)) {
      await drawerBtn.click();
    }
    // Look for a text/search input
    const input = page.locator('input[type="text"], input[type="search"], input[placeholder*="busca" i], input[placeholder*="cidade" i], input[placeholder*="profissional" i], input[name*="busca" i], input[name*="cidade" i]').filter({ visible: true });
    await expect(input.first()).toBeVisible();
  });

  test('existe botão de busca ou filtro na página', async ({ page }) => {
    await page.goto('/encontrar-profissionais');
    const button = page.locator(
      'button[type="submit"], button:has-text("Buscar"), button:has-text("Filtrar"), button:has-text("Aplicar"), button:has-text("Pesquisar")'
    ).filter({ visible: true });
    await expect(button.first()).toBeVisible();
  });

  test('preencher campo de cidade e verificar que a página não quebra', async ({ page }) => {
    await page.goto('/encontrar-profissionais');
    // Try to find a city-related input
    const cityInput = page.locator(
      'input[placeholder*="cidade" i], input[name*="cidade" i], input[placeholder*="jundiaí" i], input[placeholder*="localidade" i]'
    ).first();

    const cityInputVisible = await cityInput.isVisible().catch(() => false);
    if (cityInputVisible) {
      await cityInput.fill('jundiai');
    } else {
      // Fall back to any visible text input
      const anyInput = page.locator('input[type="text"], input[type="search"]').first();
      const anyVisible = await anyInput.isVisible().catch(() => false);
      if (anyVisible) {
        await anyInput.fill('jundiai');
      }
    }

    // Page should not crash
    await expect(page.locator('body')).toBeVisible();
    // No error boundary or server error
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });
});
