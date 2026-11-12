import { test, expect } from '@playwright/test';

const resolutions = [
  { name: 'Mobile 320', width: 320, height: 640 },
  { name: 'Mobile 390', width: 390, height: 844 },
  { name: 'Tablet 768', width: 768, height: 1024 },
  { name: 'Desktop 1280', width: 1280, height: 800 },
];

for (const res of resolutions) {
  test(`Layout não possui rolagem horizontal em ${res.name} (${res.width}px)`, async ({ page }) => {
    await page.setViewportSize({ width: res.width, height: res.height });
    await page.goto('/');

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });
}

test('Carrega logo e imagens sem erro 404', async ({ page }) => {
  const failedRequests: string[] = [];
  page.on('response', (response) => {
    if (response.status() === 404) {
      failedRequests.push(response.url());
    }
  });

  await page.goto('/');
  expect(failedRequests).toHaveLength(0);
});

test('Navegação e links da casca não quebram', async ({ page }) => {
  await page.goto('/como-funciona');
  await expect(page.locator('h1')).toContainText('Como Funciona');

  await page.goto('/termos');
  await expect(page.locator('h1')).toContainText('Termos de Uso');
});

