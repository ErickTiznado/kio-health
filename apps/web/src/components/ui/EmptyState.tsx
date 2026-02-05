import type { FC, ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Friendly empty state component with Kio Design System styling.
 * Purple accent colors, Bento-style rounded container.
 */
export const EmptyState: FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
    >
      {icon && (
        <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-2xl bg-kio-light text-kio">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-kanji mb-2">{title}</h3>
      {description && (
        <p className="text-text/60 text-sm max-w-xs mb-4">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
