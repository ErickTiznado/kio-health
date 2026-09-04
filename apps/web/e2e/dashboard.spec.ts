import { test, expect } from '@playwright/test';

const USER_EMAIL = process.env.E2E_USER_EMAIL ?? 'seed@kio.health';
const USER_PASSWORD = process.env.E2E_USER_PASSWORD ?? 'Seed1234!';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/correo electrónico/i).fill(USER_EMAIL);
    await page.getByLabel(/contraseña/i).fill(USER_PASSWORD);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('el dashboard carga sin errores', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // No debe haber pantalla de error
    await expect(page.getByText(/algo salió mal/i)).not.toBeVisible();
    await expect(page.getByText(/error/i)).not.toBeVisible();

    // La página debe tener algún contenido (heading o widget)
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
  });

  test('muestra la sección de próxima cita o estado vacío', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Puede mostrar una cita o el estado "No tienes citas"
    const tieneCita = await page.getByText(/próxima cita/i).isVisible().catch(() => false);
    const sinCitas = await page.getByText(/no tienes citas/i).isVisible().catch(() => false);
    expect(tieneCita || sinCitas).toBe(true);
  });

  test('navegar a pacientes desde el dashboard', async ({ page }) => {
    // Buscar enlace o botón de pacientes en la navegación
    await page.getByRole('link', { name: /pacientes/i }).first().click();
    await page.waitForURL(/\/patients/, { timeout: 5000 });
    await expect(page.url()).toContain('/patients');
  });

  test('navegar a agenda desde el dashboard', async ({ page }) => {
    await page.getByRole('link', { name: /agenda/i }).first().click();
    await page.waitForURL(/\/agenda/, { timeout: 5000 });
    await expect(page.url()).toContain('/agenda');
  });
});
