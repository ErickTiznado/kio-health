import type { FC } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

/**
 * Animated loading skeleton with Kio Design System styling.
 * Uses Kio purple accent for shimmer effect.
 */
export const Skeleton: FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
}) => {
  const baseClasses = 'animate-pulse bg-cruz/40';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  );
};
