import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessionCheckout } from '../use-session-checkout';

// Mock de navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock de la API de citas
vi.mock('../../lib/appointments.api', () => ({
  completeCheckout: vi.fn(),
}));

import { completeCheckout } from '../../lib/appointments.api';

const mockCompleteCheckout = completeCheckout as ReturnType<typeof vi.fn>;

describe('useSessionCheckout', () => {
  const appointmentId = 'appointment-uuid-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockCompleteCheckout.mockResolvedValue({ id: appointmentId });
  });

  it('inicializa con valores por defecto correctos', () => {
    const { result } = renderHook(() => useSessionCheckout(appointmentId));

    expect(result.current.state.paymentStatus).toBe('PENDING');
    expect(result.current.state.paymentMethod).toBe('CASH');
    expect(result.current.state.scheduleOption).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('actualiza el amount correctamente', () => {
    const { result } = renderHook(() => useSessionCheckout(appointmentId));

    act(() => {
      result.current.actions.setAmount('1500');
    });

    expect(result.current.state.amount).toBe('1500');
  });

  it('actualiza el paymentStatus a PAID', () => {
    const { result } = renderHook(() => useSessionCheckout(appointmentId));

    act(() => {
      result.current.actions.setPaymentStatus('PAID');
    });

    expect(result.current.state.paymentStatus).toBe('PAID');
  });

  it('actualiza la suggestedDate al seleccionar opción de schedule', () => {
    const { result } = renderHook(() => useSessionCheckout(appointmentId));

    act(() => {
      result.current.actions.selectScheduleOption('1_WEEK');
    });

    expect(result.current.state.scheduleOption).toBe('1_WEEK');
    expect(result.current.suggestedDate).toBeInstanceOf(Date);
  });

  it('llama a completeCheckout con los datos correctos', async () => {
    const { result } = renderHook(() => useSessionCheckout(appointmentId));

    act(() => {
      result.current.actions.setPaymentStatus('PAID');
      result.current.actions.setAmount('1000');
    });

    await act(async () => {
      await result.current.actions.handleSaveAndClose();
    });

    expect(mockCompleteCheckout).toHaveBeenCalledWith(
      appointmentId,
      expect.objectContaining({
        paymentStatus: 'PAID',
      }),
    );
  });

  it('navega de vuelta al completar el checkout', async () => {
    const { result } = renderHook(() => useSessionCheckout(appointmentId));

    await act(async () => {
      await result.current.actions.handleSaveAndClose();
    });

    expect(mockNavigate).toHaveBeenCalled();
  });

  it('captura error y lo expone en state.error si falla la API', async () => {
    mockCompleteCheckout.mockRejectedValue(new Error('Error de red'));

    const { result } = renderHook(() => useSessionCheckout(appointmentId));

    await act(async () => {
      await result.current.actions.handleSaveAndClose();
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });
});
