import { toast } from 'sonner';
import { createElement } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
}

/**
 * Styled confirmation dialog using Sonner toast.
 * Replaces native `confirm()` with an in-app styled prompt.
 */
export function confirmAction({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
}: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const variantStyles = {
      danger: {
        icon: 'bg-red-50 dark:bg-red-900/20 text-red-500',
        confirm: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
        border: 'border-red-100 dark:border-red-900/30',
      },
      warning: {
        icon: 'bg-amber-50 dark:bg-amber-900/20 text-amber-500',
        confirm: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
        border: 'border-amber-100 dark:border-amber-900/30',
      },
      default: {
        icon: 'bg-kio-light/20 dark:bg-kio/20 text-kanji dark:text-kio',
        confirm: 'bg-kanji dark:bg-kio hover:bg-kio dark:hover:bg-white shadow-kanji/20',
        border: 'border-gray-200 dark:border-slate-700',
      },
    };

    const styles = variantStyles[variant];

    toast.custom(
      (toastId) =>
        createElement(
          'div',
          {
            className: `bg-surface dark:bg-slate-800 p-5 rounded-[24px] shadow-2xl border ${styles.border} flex flex-col gap-4 w-[360px] animate-in fade-in slide-in-from-top-5 duration-300`,
          },
          createElement(
            'div',
            { className: 'flex items-start gap-4' },
            createElement(
              'div',
              { className: `w-12 h-12 rounded-2xl ${styles.icon} flex items-center justify-center shrink-0` },
              createElement(AlertTriangle, { size: 24 })
            ),
            createElement(
              'div',
              null,
              createElement('h3', { className: 'font-bold text-kanji dark:text-white text-lg leading-tight' }, title),
              description &&
                createElement(
                  'p',
                  { className: 'text-xs text-gray-500 dark:text-slate-400 opacity-70 mt-1.5 leading-relaxed' },
                  description
                )
            )
          ),
          createElement(
            'div',
            { className: 'flex gap-3 pt-2' },
            createElement(
              'button',
              {
                onClick: () => {
                  toast.dismiss(toastId);
                  resolve(false);
                },
                className:
                  'flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-kanji dark:text-kio hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors',
              },
              cancelLabel
            ),
            createElement(
              'button',
              {
                onClick: () => {
                  toast.dismiss(toastId);
                  resolve(true);
                },
                className: `flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white dark:text-slate-900 ${styles.confirm} shadow-lg transition-all active:scale-95`,
              },
              confirmLabel
            )
          )
        ),
      { duration: Infinity, position: 'top-center' }
    );
  });
}
