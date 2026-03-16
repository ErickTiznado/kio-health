import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    
    // Expect the title or a specific element to be visible
    await expect(page).toHaveTitle(/Kio Health/);
    await expect(page.getByRole('heading', { name: /(Bienvenido a Kio|Welcome to Kio)/ })).toBeVisible();
    
    // Check if email and password inputs exist
    await expect(page.getByLabel(/(Correo electrónico|Email)/i)).toBeVisible();
    await expect(page.getByLabel(/(Contraseña|Password)/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /(Iniciar Sesión|Sign In)/i })).toBeVisible();
  });

  test('should show validation errors on empty submission', async ({ page }) => {
    await page.goto('/login');
    
    // Click submit without filling form
    await page.getByRole('button', { name: /(Iniciar Sesión|Sign In)/i }).click();
    
    // Expect validation errors (assuming standard HTML5 validation or Zod errors rendered as text)
    await expect(page.getByText(/Email is required/i)).toBeVisible();
    await expect(page.getByText(/Password is required/i)).toBeVisible();
  });
});
