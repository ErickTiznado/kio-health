import { useEffect } from 'react';

/**
 * Hook to execute a callback when a specific keyboard shortcut is pressed.
 * 
 * @param keys Array of keys to trigger the action (e.g., ['k', 'K']).
 * @param callback Function to execute when shortcut is triggered.
 * @param metaKey If true, requires Ctrl (Windows/Linux) or Cmd (Mac) to be pressed.
 */
export function useKeyboardShortcut(
  keys: string[], 
  callback: () => void, 
  metaKey: boolean = true
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the required meta key is pressed (Ctrl or Cmd)
      const isMetaPressed = metaKey ? (event.ctrlKey || event.metaKey) : true;
      
      if (isMetaPressed && keys.includes(event.key)) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [keys, callback, metaKey]);
}
