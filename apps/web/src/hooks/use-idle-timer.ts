import { useState, useEffect, useCallback, useRef } from 'react';

export function useIdleTimer(timeoutMs: number) {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (isIdle) {
      // Do nothing if already idle, waiting for explicit unlock
      return; 
    }
    timerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, timeoutMs);
  }, [isIdle, timeoutMs]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    
    const handleEvent = () => {
      resetTimer();
    };

    events.forEach(event => window.addEventListener(event, handleEvent));
    resetTimer(); // Start timer

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, handleEvent));
    };
  }, [resetTimer]);

  return { isIdle, setIsIdle };
}
