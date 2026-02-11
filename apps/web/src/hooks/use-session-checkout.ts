import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { addWeeks, addDays, addMonths } from 'date-fns';
import { completeCheckout } from '../lib/appointments.api';
import type { PaymentMethod, CheckoutPayload } from '../types/appointments.types';

/* ── Types ───────────────────────────────────────── */

type PaymentStatus = 'PENDING' | 'PAID';
type ScheduleOption = '1_WEEK' | '15_DAYS' | '1_MONTH' | 'MANUAL';

export interface CheckoutState {
  amount: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  scheduleOption: ScheduleOption | null;
  manualDate: string;
  shouldSendEmail: boolean;
}

export interface CheckoutActions {
  setAmount: (value: string) => void;
  setPaymentStatus: (value: PaymentStatus) => void;
  setPaymentMethod: (value: PaymentMethod) => void;
  selectScheduleOption: (key: ScheduleOption) => void;
  setManualDate: (value: string) => void;
  setShouldSendEmail: (value: boolean) => void;
  handleSaveAndClose: () => Promise<void>;
}

export interface UseSessionCheckoutReturn {
  state: CheckoutState;
  actions: CheckoutActions;
  suggestedDate: Date | null;
  isSubmitting: boolean;
  error: string | null;
}

/* ── Helpers ─────────────────────────────────────── */

function computeSuggestedDate(option: ScheduleOption): Date {
  const today = new Date();

  if (option === '1_WEEK') return addWeeks(today, 1);
  if (option === '15_DAYS') return addDays(today, 15);
  return addMonths(today, 1);
}

function buildNextAppointmentDate(
  scheduleOption: ScheduleOption | null,
  manualDate: string,
): string | null {
  if (!scheduleOption) return null;

  if (scheduleOption === 'MANUAL') {
    return manualDate || null;
  }

  return computeSuggestedDate(scheduleOption).toISOString().split('T')[0];
}

/* ── Hook ────────────────────────────────────────── */

/**
 * Encapsulates all checkout logic: state, derived values, and API mutation.
 * SRP: separates business logic from presentational layer.
 */
export function useSessionCheckout(
  appointmentId: string,
  defaultAmount = 500,
  onCompleted?: () => void,
): UseSessionCheckoutReturn {
  const navigate = useNavigate();

  /* ── State ── */
  const [amount, setAmount] = useState<string>(String(defaultAmount));
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PENDING');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [scheduleOption, setScheduleOption] = useState<ScheduleOption | null>(null);
  const [manualDate, setManualDate] = useState<string>('');
  const [shouldSendEmail, setShouldSendEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Derived (computed during render, no useEffect) ── */
  const suggestedDate =
    scheduleOption === 'MANUAL' && manualDate
      ? new Date(manualDate + 'T12:00:00')
      : scheduleOption && scheduleOption !== 'MANUAL'
        ? computeSuggestedDate(scheduleOption)
        : null;

  /* ── Actions ── */

  const selectScheduleOption = useCallback((key: ScheduleOption) => {
    setScheduleOption((prev) => (prev === key ? null : key));
    if (key !== 'MANUAL') setManualDate('');
  }, []);

  const handleSaveAndClose = useCallback(async () => {
    setError(null);
    setIsSubmitting(true);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setError('El monto ingresado no es válido');
      setIsSubmitting(false);
      return;
    }

    const payload: CheckoutPayload = {
      amount: parsedAmount,
      paymentStatus,
      paymentMethod,
      nextAppointmentDate: buildNextAppointmentDate(scheduleOption, manualDate),
      shouldSendEmail,
    };

    try {
      await completeCheckout(appointmentId, payload);
      onCompleted?.();
      navigate('/dashboard');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error al guardar. Intenta de nuevo.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    amount,
    paymentStatus,
    paymentMethod,
    scheduleOption,
    manualDate,
    shouldSendEmail,
    appointmentId,
    navigate,
    onCompleted,
  ]);

  return {
    state: {
      amount,
      paymentStatus,
      paymentMethod,
      scheduleOption,
      manualDate,
      shouldSendEmail,
    },
    actions: {
      setAmount,
      setPaymentStatus,
      setPaymentMethod,
      selectScheduleOption,
      setManualDate,
      setShouldSendEmail,
      handleSaveAndClose,
    },
    suggestedDate,
    isSubmitting,
    error,
  };
}
