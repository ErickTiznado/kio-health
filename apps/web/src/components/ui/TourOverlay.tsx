import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTourStore, TOUR_STEPS } from '../../stores/tour.store';
import { toast } from 'sonner';

const GAP = 16;
const TOOLTIP_W = 320;
/** Fallback height used before the panel has been measured. */
const TOOLTIP_H_FALLBACK = 220;
/** Below this width the panel is centered instead of anchored. */
const MOBILE_BREAKPOINT = 640;

interface TooltipPos {
  top: number;
  left: number;
}

function computeTooltipPosition(
  rect: DOMRect,
  placement: 'top' | 'bottom' | 'left' | 'right',
  tooltipH: number,
): TooltipPos | null {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (rect.width === 0 || rect.height === 0) return null;
  if (rect.bottom < 0 || rect.top > vh || rect.right < 0 || rect.left > vw) return null;

  let top = 0;
  let left = 0;

  switch (placement) {
    case 'bottom':
      top = rect.bottom + GAP;
      left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
      break;
    case 'top':
      top = rect.top - tooltipH - GAP;
      left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
      break;
    case 'right':
      top = rect.top + rect.height / 2 - tooltipH / 2;
      left = rect.right + GAP;
      break;
    case 'left':
      top = rect.top + rect.height / 2 - tooltipH / 2;
      left = rect.left - TOOLTIP_W - GAP;
      break;
  }

  return { top, left };
}

export function TourOverlay() {
  const { isActive, currentStepIndex, nextStep, prevStep, skipTour } = useTourStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [tooltipPos, setTooltipPos] = useState<TooltipPos | null>(null);
  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1200,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));
  /** Measured panel height, kept in state so render never reads a ref. */
  const [panelH, setPanelH] = useState(TOOLTIP_H_FALLBACK);
  const highlightedRef = useRef<Element | null>(null);
  const measureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  /** Element focused before the tour opened, so focus can be handed back. */
  const openerRef = useRef<HTMLElement | null>(null);

  const step = TOUR_STEPS[currentStepIndex];

  const measureTarget = useCallback(() => {
    if (!step) return;
    setViewport({ w: window.innerWidth, h: window.innerHeight });

    const el = document.querySelector(`[data-tour="${step.id}"]`);
    if (!el) {
      setTooltipPos(null);
      return;
    }
    const height = panelRef.current?.offsetHeight ?? TOOLTIP_H_FALLBACK;
    setPanelH(height);
    setTooltipPos(computeTooltipPosition(el.getBoundingClientRect(), step.placement, height));
  }, [step]);

  // Highlight the target element
  useEffect(() => {
    if (!isActive || !step) return;

    if (highlightedRef.current) {
      highlightedRef.current.classList.remove('tour-highlight');
      highlightedRef.current = null;
    }

    if (location.pathname !== step.route) {
      navigate(step.route);
    }

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
    // Capture before the store update nulls the ref, and restore on the next
    // tick: the focus trap below is still attached this tick and would yank
    // focus straight back into a panel that is about to unmount.
    const opener = openerRef.current;
    skipTour();
    setTimeout(() => opener?.focus(), 0);
  }, [skipTour]);

  const handleNext = useCallback(() => {
    const isLast = currentStepIndex === TOUR_STEPS.length - 1;
    nextStep();
    if (isLast) {
      toast.success('¡Listo! Ya conoces Kio Health.');
    }
  }, [currentStepIndex, nextStep]);

  // Keyboard: Escape exits, arrows navigate.
  useEffect(() => {
    if (!isActive) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isActive, handleSkip, handleNext, prevStep]);

  // Move focus into the panel on every step so a keyboard or screen-reader user
  // is actually taken through the tour instead of left behind it.
  useEffect(() => {
    if (!isActive) return;
    if (!openerRef.current && document.activeElement instanceof HTMLElement) {
      openerRef.current = document.activeElement;
    }
    const t = setTimeout(() => {
      panelRef.current?.focus();
      if (panelRef.current) setPanelH(panelRef.current.offsetHeight);
    }, 60);
    return () => clearTimeout(t);
  }, [isActive, currentStepIndex]);

  // Focus trap, by cycling Tab inside the panel.
  //
  // `aria-modal` is a promise to assistive tech that the rest of the page is out
  // of play; without trapping, Tab walked straight out of the dialog into a
  // background that is not `inert`, and the promise was a lie. Cycling Tab is
  // deterministic; a `focusin` bouncer is not — it fights the browser's own
  // sequential-navigation and measurably failed to hold focus here.
  useEffect(() => {
    if (!isActive) return;
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);

      if (focusables.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (!panel.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onTab, true);
    return () => window.removeEventListener('keydown', onTab, true);
  }, [isActive]);

  // Reset the remembered opener once the tour is fully closed.
  useEffect(() => {
    if (!isActive) openerRef.current = null;
  }, [isActive]);

  const isLast = currentStepIndex === TOUR_STEPS.length - 1;
  const isFirst = currentStepIndex === 0;

  const isMobile = viewport.w < MOBILE_BREAKPOINT;

  const centeredPos: TooltipPos = {
    top: Math.max(GAP, viewport.h / 2 - panelH / 2),
    left: Math.max(GAP, viewport.w / 2 - TOOLTIP_W / 2),
  };

  const rawPos = isMobile && step?.mobileCenter ? centeredPos : (tooltipPos ?? centeredPos);

  // Clamp at render time against the CURRENT viewport. Clamping only at measure
  // time let a resize strand the panel off-screen behind a blocking backdrop.
  const finalPos: TooltipPos = {
    left: Math.min(Math.max(GAP, rawPos.left), Math.max(GAP, viewport.w - TOOLTIP_W - GAP)),
    top: Math.min(Math.max(GAP, rawPos.top), Math.max(GAP, viewport.h - panelH - GAP)),
  };

  const isOpen = isActive && Boolean(step);

  if (!isOpen || !step) return null;

  /*
   * No AnimatePresence here, on purpose.
   *
   * Its exit animation ran (the panel reached opacity 0) but the nodes were
   * never unmounted, leaving a full-screen backdrop with `pointer-events: auto`
   * permanently over the app — an invisible wall that made the product look
   * dead after closing the tour. A plain conditional unmount is worth far more
   * than a 200ms fade-out. The enter animations below still play.
   */
  return (
    <>
      {/* Backdrop — visible, and NOT a click-to-dismiss target. Losing the only
          onboarding in the product to a stray click is not acceptable; exit is
          the X, "Omitir", or Escape. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9000] bg-gray-900/40 dark:bg-black/60"
        aria-hidden="true"
      />

      <motion.div
        key={`tour-tooltip-${currentStepIndex}`}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-description"
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ top: finalPos.top, left: finalPos.left, width: TOOLTIP_W }}
        className="fixed z-[9002] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-700 shadow-2xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kio"
      >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-[11px] font-bold text-kanji dark:text-kio uppercase tracking-wider">
                Paso {currentStepIndex + 1} de {TOUR_STEPS.length}
              </span>
              <button
                type="button"
                onClick={handleSkip}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-600 dark:text-slate-300 hover:text-kanji dark:hover:text-kio hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kio"
                aria-label="Cerrar recorrido guiado"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
              <h3 id="tour-title" className="text-base font-bold text-kanji dark:text-white mb-1">
                {step.title}
              </h3>
              <p id="tour-description" className="text-sm font-medium text-text-secondary dark:text-slate-300 leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Progress bar */}
            <div className="mx-4 mb-4 h-1 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-kio rounded-full"
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
                className="inline-flex min-h-11 items-center gap-1 px-3 rounded-xl text-sm font-bold text-text-secondary dark:text-slate-300 hover:text-kanji dark:hover:text-kio hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kio"
              >
                <ChevronLeft size={16} aria-hidden="true" />
                Anterior
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="inline-flex min-h-11 items-center px-3 rounded-xl text-sm font-bold text-text-secondary dark:text-slate-300 hover:text-kanji dark:hover:text-kio hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kio"
                >
                  Omitir
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex min-h-11 items-center gap-1 px-4 rounded-xl text-sm font-bold bg-kanji text-white hover:bg-kanji/90 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kio focus-visible:ring-offset-2"
                >
                  {isLast ? 'Finalizar' : 'Siguiente'}
                  {!isLast && <ChevronRight size={16} aria-hidden="true" />}
                </button>
              </div>
            </div>
      </motion.div>
    </>
  );
}
