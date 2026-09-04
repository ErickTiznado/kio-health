import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SignupPage } from '../SignupPage';
import { api } from '../../lib/api';

// Mock del módulo api
vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock del auth store
vi.mock('../../stores/auth.store', () => ({
  useAuthStore: () => ({
    signup: vi.fn(),
    isLoading: false,
  }),
}));

function renderSignupPage(search = '') {
  return render(
    <MemoryRouter initialEntries={[`/signup${search}`]}>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/onboarding" element={<div>Onboarding</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sin ?invite= muestra "Beta cerrada" y no el formulario', async () => {
    renderSignupPage(); // sin query param

    await waitFor(() => {
      expect(screen.getByText('Beta cerrada')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /crear cuenta/i })).not.toBeInTheDocument();
  });

  it('con token inválido (API retorna 400) muestra pantalla de error', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('400 Bad Request'),
    );

    renderSignupPage('?invite=token-invalido');

    await waitFor(() => {
      expect(screen.getByText('Enlace no válido')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /crear cuenta/i })).not.toBeInTheDocument();
  });

  it('con token válido muestra formulario con email pre-llenado y readonly', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { valid: true, email: 'beta@test.com' },
    });

    renderSignupPage('?invite=token-valido-uuid');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    expect(emailInput).toHaveValue('beta@test.com');
    expect(emailInput).toHaveAttribute('readonly');

    // Muestra el badge de beta
    expect(screen.getByText(/Acceso Beta/i)).toBeInTheDocument();
  });

  it('llama a GET /auth/validate-invite/:token con el token correcto', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { valid: true, email: 'beta@test.com' },
    });

    renderSignupPage('?invite=mi-token-correcto');

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining('mi-token-correcto'),
      );
    });
  });

  it('muestra spinner de carga mientras valida el token', async () => {
    // Promesa que nunca resuelve durante el test
    (api.get as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

    renderSignupPage('?invite=any-token');

    // Mientras carga, no debe mostrar ni "Beta Cerrada" ni el formulario
    expect(screen.queryByText('Beta Cerrada')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /crear cuenta/i })).not.toBeInTheDocument();
  });
});
