import { test, expect } from '@playwright/test';

/**
 * Tests E2E para el flujo de signup con invitación beta.
 *
 * Setup: requiere que el backend esté corriendo y que exista una
 * BetaInvitation válida en la DB. El token se lee de la variable de entorno
 * E2E_BETA_TOKEN (generada con el script create-invites.ts antes de correr los tests).
 *
 * Ejecución:
 *   E2E_BETA_TOKEN=uuid-del-token npx playwright test e2e/signup-invite.spec.ts
 */

test.describe('Signup con invitación beta', () => {
  test('sin token muestra pantalla "Beta Cerrada" y no el formulario', async ({ page }) => {
    await page.goto('/signup');

    // Debe mostrar el mensaje de beta cerrada
    await expect(page.getByText('Beta Cerrada')).toBeVisible();
    await expect(page.getByText(/acceso es únicamente por invitación/i)).toBeVisible();

    // No debe mostrar el formulario de registro
    await expect(page.getByRole('button', { name: /crear cuenta/i })).not.toBeVisible();
  });

  test('con token inválido muestra pantalla de error', async ({ page }) => {
    await page.goto('/signup?invite=token-completamente-invalido-xyz');

    await expect(page.getByText('Link inválido')).toBeVisible();
    await expect(page.getByText(/no es válido o ya fue utilizado/i)).toBeVisible();

    // No debe mostrar el formulario de registro
    await expect(page.getByRole('button', { name: /crear cuenta/i })).not.toBeVisible();
  });

  test('link a /login visible en pantalla de beta cerrada', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('link', { name: /inicia sesión/i })).toBeVisible();
  });

  // Este test requiere E2E_BETA_TOKEN configurado con un token real de la DB
  test('con token válido muestra formulario con email pre-llenado y readonly', async ({ page }) => {
    const token = process.env.E2E_BETA_TOKEN;
    if (!token) {
      test.skip(true, 'E2E_BETA_TOKEN no configurado — skipping');
      return;
    }

    await page.goto(`/signup?invite=${token}`);

    // Debe mostrar el badge de invitación
    await expect(page.getByText(/Acceso Beta/i)).toBeVisible();

    // El campo de email debe estar pre-llenado y ser readonly
    const emailInput = page.getByLabel(/correo electrónico/i);
    await expect(emailInput).toBeVisible();
    const emailValue = await emailInput.inputValue();
    expect(emailValue.length).toBeGreaterThan(0); // tiene un email
    await expect(emailInput).toHaveAttribute('readonly', '');

    // El botón de registro debe estar visible
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeVisible();
  });
});
