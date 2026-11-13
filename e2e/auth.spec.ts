import { test, expect } from '@playwright/test';

// ─── Páginas de autenticação ──────────────────────────────────────────────────

test.describe('Páginas de autenticação', () => {
  test('página /entrar carrega e tem campos acessíveis', async ({ page }) => {
    await page.goto('/entrar');
    await expect(page).toHaveTitle(/Entrar/);
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByLabel('Senha')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  });

  test('página /criar-conta carrega e tem todos os campos', async ({ page }) => {
    await page.goto('/criar-conta');
    await expect(page).toHaveTitle(/Criar conta/);
    await expect(page.getByLabel('Nome completo')).toBeVisible();
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByLabel('Senha')).toBeVisible();
    await expect(page.getByRole('checkbox')).toBeVisible();
  });

  test('página /recuperar-senha carrega e tem campo de e-mail', async ({ page }) => {
    await page.goto('/recuperar-senha');
    await expect(page).toHaveTitle(/Recuperar senha/);
    await expect(page.getByLabel('E-mail cadastrado')).toBeVisible();
  });
});

// ─── Validação do lado do cliente ────────────────────────────────────────────

test.describe('Validação de formulários', () => {
  test('cadastro com e-mail inválido mostra erro de validação', async ({ page }) => {
    await page.goto('/criar-conta');
    await page.getByLabel('Nome completo').fill('João Testador');
    await page.getByLabel('E-mail').fill('nao-e-email');
    await page.getByLabel('Senha').fill('senha1234');
    await page.getByRole('button', { name: 'Criar conta' }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
  });

  test('cadastro sem aceitar termos mostra erro', async ({ page }) => {
    await page.goto('/criar-conta');
    await page.getByLabel('Nome completo').fill('João Testador');
    await page.getByLabel('E-mail').fill('joao@teste.com');
    await page.getByLabel('Senha').fill('senha1234');
    // Não marca checkbox
    await page.getByRole('button', { name: 'Criar conta' }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
  });

  test('login com senha vazia mostra erro de validação', async ({ page }) => {
    await page.goto('/entrar');
    await page.getByLabel('E-mail').fill('usuario@teste.com');
    // Não preenche senha
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
  });
});

// ─── Proteção de rotas (testes negativos) ────────────────────────────────────

test.describe('Proteção de rotas — testes negativos', () => {
  test('acesso a /painel sem login redireciona para /entrar', async ({ page }) => {
    await page.goto('/painel');
    await expect(page).toHaveURL(/\/entrar/);
  });

  test('acesso a /painel/seguranca sem login redireciona para /entrar', async ({ page }) => {
    await page.goto('/painel/seguranca');
    await expect(page).toHaveURL(/\/entrar/);
  });

  test('acesso a /painel/configuracoes sem login redireciona para /entrar', async ({ page }) => {
    await page.goto('/painel/configuracoes');
    await expect(page).toHaveURL(/\/entrar/);
  });

  test('acesso a /admin sem login redireciona para /entrar', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/entrar/);
  });
});

// ─── Acessibilidade e UI ──────────────────────────────────────────────────────

test.describe('Acessibilidade', () => {
  test('/entrar não tem rolagem horizontal em 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/entrar');
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);
  });

  test('/criar-conta não tem rolagem horizontal em 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/criar-conta');
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);
  });

  test('/entrar tem link de recuperação de senha', async ({ page }) => {
    await page.goto('/entrar');
    await expect(page.getByRole('link', { name: 'Esqueci minha senha' })).toBeVisible();
  });

  test('/entrar tem link para criar conta', async ({ page }) => {
    await page.goto('/entrar');
    await expect(page.getByRole('link', { name: 'Criar conta grátis' })).toBeVisible();
  });

  test('/criar-conta tem link para voltar ao login', async ({ page }) => {
    await page.goto('/criar-conta');
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible();
  });

  test('botão de mostrar/ocultar senha funciona em /entrar', async ({ page }) => {
    await page.goto('/entrar');
    const passwordInput = page.getByLabel('Senha');
    const toggleButton = page.getByRole('button', { name: 'Mostrar senha' });

    await expect(passwordInput).toHaveAttribute('type', 'password');
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await page.getByRole('button', { name: 'Ocultar senha' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});

