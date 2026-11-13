import { test, expect } from '@playwright/test';

test.describe('Página Inicial', () => {
  test('título contém "Conecta Móveis" ou "Profissionais"', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    const hasExpectedTitle =
      title.includes('Conecta Móveis') || title.includes('Profissionais');
    expect(hasExpectedTitle).toBe(true);
  });

  test('existe link de navegação para /encontrar-profissionais ou /busca', async ({ page }) => {
    await page.goto('/');
    // Check for navigation link pointing to the search/find page
    const searchLink = page.locator(
      'a[href="/encontrar-profissionais"], a[href="/busca"], a[href*="profissionais"]'
    ).filter({ visible: true });
    await expect(searchLink.first()).toBeVisible();
  });

  test('existe link para /para-profissionais, /planos ou /criar-conta', async ({ page }) => {
    await page.goto('/');
    const proLink = page.locator(
      'a[href="/para-profissionais"], a[href="/planos"], a[href="/criar-conta"]'
    ).filter({ visible: true });
    await expect(proLink.first()).toBeVisible();
  });

  test('navegação por teclado — primeiro elemento focável recebe foco visível', async ({ page }) => {
    await page.goto('/');
    // Press Tab to focus the first focusable element
    await page.keyboard.press('Tab');
    // The focused element should have an outline (visible focus indicator)
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return null;
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        outlineWidth: style.outlineWidth,
        outlineStyle: style.outlineStyle,
        outlineOffset: style.outlineOffset,
        boxShadow: style.boxShadow,
      };
    });
    expect(focusedElement).not.toBeNull();
    // Focus ring: either outline is visible (not "0px none") or box-shadow is set
    const hasOutline =
      focusedElement!.outlineWidth !== '0px' ||
      focusedElement!.boxShadow !== 'none';
    expect(hasOutline).toBe(true);
  });
});
