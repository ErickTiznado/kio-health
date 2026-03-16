import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTourStore, TOUR_STEPS } from '../../stores/tour.store';
import { toast } from 'sonner';

const GAP = 16;

interface TooltipPos {
  top: number;
  left: number;
}

function computeTooltipPosition(
  rect: DOMRect,
  placement: 'top' | 'bottom' | 'left' | 'right',
  tooltipW = 320,
  tooltipH = 200,
): TooltipPos | null {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // If rect is zero or out of viewport, return null → center
  if (rect.width === 0 || rect.height === 0) return null;
  if (rect.bottom < 0 || rect.top > vh || rect.right < 0 || rect.left > vw) return null;

  let top = 0;
  let left = 0;

  switch (placement) {
    case 'bottom':
      top = rect.bottom + GAP;
      left = rect.left + rect.width / 2 - tooltipW / 2;
      break;
    case 'top':
      top = rect.top - tooltipH - GAP;
      left = rect.left + rect.width / 2 - tooltipW / 2;
      break;
    case 'right':
      top = rect.top + rect.height / 2 - tooltipH / 2;
      left = rect.right + GAP;
      break;
    case 'left':
      top = rect.top + rect.height / 2 - tooltipH / 2;
      left = rect.left - tooltipW - GAP;
      break;
  }

  // Clamp to viewport
  left = Math.max(GAP, Math.min(left, vw - tooltipW - GAP));
  top = Math.max(GAP, Math.min(top, vh - tooltipH - GAP));

  return { top, left };
}

export function TourOverlay() {
  const { isActive, currentStepIndex, nextStep, prevStep, skipTour } = useTourStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [tooltipPos, setTooltipPos] = useState<TooltipPos | null>(null);
  const highlightedRef = useRef<Element | null>(null);
  const measureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = TOUR_STEPS[currentStepIndex];

  const measureTarget = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(`[data-tour="${step.id}"]`);
    if (!el) {
      setTooltipPos(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    const pos = computeTooltipPosition(rect, step.placement);
    setTooltipPos(pos);
  }, [step]);

  // Highlight the target element
  useEffect(() => {
    if (!isActive || !step) return;

    // Remove previous highlight
    if (highlightedRef.current) {
      highlightedRef.current.classList.remove('tour-highlight');
      highlightedRef.current = null;
    }

    // Navigate if needed
    if (location.pathname !== step.route) {
      navigate(step.route);
    }

    // Wait for route transition + DOM settle
    measureTimerRef.current = setTimeout(() => {
      const el = document.querySelector(`[data-tour="${step.id}"]`);
      if (el) {
        el.classList.add('tour-highlight');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlightedRef.current = el;
      }
      measureTarget();
    }, 350);

    return () => {
      if (measureTimerRef.current) clearTimeout(measureTimerRef.current);
      if (highlightedRef.current) {
        highlightedRef.current.classList.remove('tour-highlight');
        highlightedRef.current = null;
      }
    };
  }, [isActive, currentStepIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-measure on resize/scroll
  useEffect(() => {
    if (!isActive) return;
    window.addEventListener('resize', measureTarget);
    window.addEventListener('scroll', measureTarget, { capture: true });
    return () => {
      window.removeEventListener('resize', measureTarget);
      window.removeEventListener('scroll', measureTarget, { capture: true });
    };
  }, [isActive, measureTarget]);

  const handleSkip = useCallback(() => {
    skipTour();
  }, [skipTour]);

  const handleNext = useCallback(() => {
    const isLast = currentStepIndex === TOUR_STEPS.length - 1;
    nextStep();
    if (isLast) {
      toast.success('¡Listo! Ya conoces Kio Health.');
    }
  }, [currentStepIndex, nextStep]);

  const isLast = currentStepIndex === TOUR_STEPS.length - 1;
  const isFirst = currentStepIndex === 0;

  // Tooltip position: centered if null
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const centeredPos: TooltipPos = {
    top: vh / 2 - 100,
    left: vw / 2 - 160,
  };
  const finalPos = tooltipPos ?? centeredPos;

  return (
    <AnimatePresence>
      {isActive && step && (
        <>
          {/* Backdrop — transparent click-catcher for skip */}
          <motion.div
            key="tour-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9000]"
            onClick={handleSkip}
          />

          {/* Tooltip */}
          <motion.div
            key={`tour-tooltip-${currentStepIndex}`}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ top: finalPos.top, left: finalPos.left }}
            className="fixed z-[9002] w-80 bg-white dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-700 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-xs font-semibold text-kio uppercase tracking-widest">
                Paso {currentStepIndex + 1} de {TOUR_STEPS.length}
              </span>
              <button
                type="button"
                onClick={handleSkip}
                className="p-1 rounded-lg text-gray-400 dark:text-slate-500 hover:text-kanji dark:hover:text-kio hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Cerrar tour"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
              <h3 className="text-base font-bold text-kanji dark:text-white mb-1">{step.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{step.description}</p>
            </div>

            {/* Progress bar */}
            <div className="mx-4 mb-4 h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-kanji to-kio rounded-full"
                initial={{ width: `${(currentStepIndex / TOUR_STEPS.length) * 100}%` }}
                animate={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-4 pb-4 gap-2">
              <button
                type="button"
                onClick={prevStep}
                disabled={isFirst}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-kanji dark:hover:text-kio hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold bg-kio text-white hover:bg-kanji transition-colors shadow-sm"
              >
                {isLast ? 'Finalizar' : 'Siguiente'}
                {!isLast && <ChevronRight size={16} />}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
