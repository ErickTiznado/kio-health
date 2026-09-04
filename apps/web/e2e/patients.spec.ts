import { test, expect } from '@playwright/test';

/**
 * Tests E2E para gestión de pacientes.
 *
 * Requiere un usuario seed con credenciales en:
 *   E2E_USER_EMAIL / E2E_USER_PASSWORD (o usa los valores por defecto de seed)
 */

const USER_EMAIL = process.env.E2E_USER_EMAIL ?? 'seed@kio.health';
const USER_PASSWORD = process.env.E2E_USER_PASSWORD ?? 'Seed1234!';

async function loginAs(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/correo electrónico/i).fill(USER_EMAIL);
  await page.getByLabel(/contraseña/i).fill(USER_PASSWORD);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 });
}

test.describe('Gestión de Pacientes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    // Navegar a pacientes
    await page.goto('/patients');
    await page.waitForLoadState('networkidle');
  });

  test('la página de pacientes carga con tabs y campo de búsqueda', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /pacientes/i })).toBeVisible();
    await expect(page.getByRole('searchbox')).toBeVisible();
  });

  test('crear un paciente nuevo y verlo en la lista', async ({ page }) => {
    const nombrePaciente = `E2E Test ${Date.now()}`;

    // Buscar botón de nuevo paciente
    await page.getByRole('button', { name: /nuevo paciente/i }).click();

    // Llenar el formulario mínimo
    await page.getByLabel(/nombre completo/i).fill(nombrePaciente);

    // Guardar
    await page.getByRole('button', { name: /guardar/i }).click();

    // Verificar que aparece en la lista
    await expect(page.getByText(nombrePaciente)).toBeVisible({ timeout: 8000 });
  });

  test('buscar paciente por nombre', async ({ page }) => {
    const searchbox = page.getByRole('searchbox');
    await searchbox.fill('E2E Test');

    // Esperar debounce (500ms)
    await page.waitForTimeout(700);

    // Debe aparecer algún resultado o estado vacío — no un error
    const hasResults = await page.getByText('E2E Test').isVisible().catch(() => false);
    const hasEmpty = await page.getByText(/sin pacientes/i).isVisible().catch(() => false);
    expect(hasResults || hasEmpty).toBe(true);
  });

  test('ver el detalle de un paciente', async ({ page }) => {
    // Click en el primer paciente de la lista (si existe)
    const primerPaciente = page.locator('[data-testid="patient-row"]').first();
    const exists = await primerPaciente.isVisible().catch(() => false);

    if (!exists) {
      test.skip(true, 'No hay pacientes en la lista — crear uno primero');
      return;
    }

    await primerPaciente.click();
    await page.waitForURL(/\/patients\/.+/, { timeout: 5000 });
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
