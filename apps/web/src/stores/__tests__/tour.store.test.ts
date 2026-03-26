import { describe, it, expect, beforeEach } from 'vitest';
import { useTourStore, TOUR_STEPS } from '../tour.store';

/** Reset store to a clean state before each test. */
function resetStore() {
  useTourStore.setState({
    hasCompletedTour: false,
    isActive: false,
    currentStepIndex: 0,
  });
  localStorage.removeItem('kio-tour');
}

describe('useTourStore', () => {
  beforeEach(resetStore);

  describe('startTour', () => {
    it('activa el tour en el paso 0', () => {
      useTourStore.getState().startTour();
      const { isActive, currentStepIndex } = useTourStore.getState();
      expect(isActive).toBe(true);
      expect(currentStepIndex).toBe(0);
    });

    it('no modifica hasCompletedTour al iniciar', () => {
      useTourStore.getState().startTour();
      expect(useTourStore.getState().hasCompletedTour).toBe(false);
    });
  });

  describe('nextStep', () => {
    it('avanza al siguiente paso', () => {
      useTourStore.setState({ isActive: true, currentStepIndex: 0 });
      useTourStore.getState().nextStep();
      expect(useTourStore.getState().currentStepIndex).toBe(1);
    });

    it('mantiene isActive=true mientras no sea el último paso', () => {
      useTourStore.setState({ isActive: true, currentStepIndex: 3 });
      useTourStore.getState().nextStep();
      expect(useTourStore.getState().isActive).toBe(true);
    });

    it('en el último paso: cierra el tour y marca hasCompletedTour', () => {
      const lastIndex = TOUR_STEPS.length - 1;
      useTourStore.setState({ isActive: true, currentStepIndex: lastIndex });
      useTourStore.getState().nextStep();
      const { isActive, hasCompletedTour, currentStepIndex } = useTourStore.getState();
      expect(isActive).toBe(false);
      expect(hasCompletedTour).toBe(true);
      expect(currentStepIndex).toBe(0);
    });
  });

  describe('prevStep', () => {
    it('retrocede al paso anterior', () => {
      useTourStore.setState({ isActive: true, currentStepIndex: 4 });
      useTourStore.getState().prevStep();
      expect(useTourStore.getState().currentStepIndex).toBe(3);
    });

    it('no retrocede por debajo de 0', () => {
      useTourStore.setState({ isActive: true, currentStepIndex: 0 });
      useTourStore.getState().prevStep();
      expect(useTourStore.getState().currentStepIndex).toBe(0);
    });
  });

  describe('skipTour', () => {
    it('cierra el tour y marca como completado', () => {
      useTourStore.setState({ isActive: true, currentStepIndex: 2 });
      useTourStore.getState().skipTour();
      const { isActive, hasCompletedTour, currentStepIndex } = useTourStore.getState();
      expect(isActive).toBe(false);
      expect(hasCompletedTour).toBe(true);
      expect(currentStepIndex).toBe(0);
    });
  });

  describe('resetTour', () => {
    it('borra hasCompletedTour y el índice', () => {
      useTourStore.setState({ hasCompletedTour: true, currentStepIndex: 5 });
      useTourStore.getState().resetTour();
      const { hasCompletedTour, currentStepIndex } = useTourStore.getState();
      expect(hasCompletedTour).toBe(false);
      expect(currentStepIndex).toBe(0);
    });

    it('no activa el tour automáticamente', () => {
      useTourStore.setState({ hasCompletedTour: true });
      useTourStore.getState().resetTour();
      expect(useTourStore.getState().isActive).toBe(false);
    });
  });

  describe('flujo completo', () => {
    it('recorre todos los pasos y termina con hasCompletedTour=true', () => {
      useTourStore.getState().startTour();

      for (let i = 0; i < TOUR_STEPS.length; i++) {
        expect(useTourStore.getState().currentStepIndex).toBe(i);
        expect(useTourStore.getState().isActive).toBe(true);
        useTourStore.getState().nextStep();
      }

      expect(useTourStore.getState().isActive).toBe(false);
      expect(useTourStore.getState().hasCompletedTour).toBe(true);
    });

    it('reset + startTour reinicia el flujo desde 0', () => {
      useTourStore.setState({ hasCompletedTour: true });
      useTourStore.getState().resetTour();
      useTourStore.getState().startTour();
      expect(useTourStore.getState().isActive).toBe(true);
      expect(useTourStore.getState().currentStepIndex).toBe(0);
    });
  });

  describe('TOUR_STEPS', () => {
    it('tiene exactamente 9 pasos', () => {
      expect(TOUR_STEPS).toHaveLength(9);
    });

    it('cada paso tiene los campos obligatorios', () => {
      for (const step of TOUR_STEPS) {
        expect(step.id).toBeTruthy();
        expect(step.title).toBeTruthy();
        expect(step.description).toBeTruthy();
        expect(step.route).toMatch(/^\//);
        expect(['top', 'bottom', 'left', 'right']).toContain(step.placement);
      }
    });

    it('los ids de paso son únicos', () => {
      const ids = TOUR_STEPS.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
