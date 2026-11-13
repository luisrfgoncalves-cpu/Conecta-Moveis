import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

type AxeViolation = {
  id: string;
  impact: string | null;
  description: string;
  nodes: unknown[];
};

const PAGES_TO_TEST = [
  { name: 'home', path: '/' },
  { name: 'busca', path: '/encontrar-profissionais' },
  { name: 'termos', path: '/termos' },
  { name: 'como-funciona', path: '/como-funciona' },
];

const report: Record<string, AxeViolation[]> = {};

test.describe('Auditoria de Acessibilidade (axe-core)', () => {
  for (const pageInfo of PAGES_TO_TEST) {
    test(`${pageInfo.name} — zero violações críticas`, async ({ page }) => {
      await page.goto(pageInfo.path);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      const violations = results.violations as AxeViolation[];
      report[pageInfo.name] = violations;

      const critical = violations.filter((v) => v.impact === 'critical');
      const serious = violations.filter((v) => v.impact === 'serious');

      // Log serious violations as warnings (do not fail on them)
      if (serious.length > 0) {
        console.warn(
          `[a11y] ${pageInfo.name}: ${serious.length} violação(ões) SÉRIA(S) —`,
          serious.map((v) => `${v.id}: ${v.description}`)
        );
      }

      // Fail on critical violations
      expect(
        critical,
        `Violações críticas em ${pageInfo.path}: ${critical.map((v) => v.id).join(', ')}`
      ).toHaveLength(0);
    });
  }

  test.afterAll(async () => {
    // Save full accessibility report
    const reportPath = path.join(__dirname, 'accessibility-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`Relatório de acessibilidade salvo em: ${reportPath}`);
  });
});
