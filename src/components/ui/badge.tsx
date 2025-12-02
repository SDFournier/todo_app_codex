import React from 'react';
import clsx from 'clsx';

type BadgeColor = 'gray' | 'blue' | 'green' | 'red' | 'amber';

type BadgeProps = {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
};

const colorClasses: Record<BadgeColor, string> = {
  gray: 'bg-[var(--color-primary-soft)] text-[var(--color-text-main)]',
  blue: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  green: 'bg-[#ecfdf3] text-[var(--color-success)]',
  red: 'bg-[#fef2f2] text-[var(--color-error)]',
  amber: 'bg-[#fffbeb] text-[var(--color-warning)]',
};

export const Badge: React.FC<BadgeProps> = ({ children, color = 'gray', className }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        colorClasses[color],
        className,
      )}
    >
      {children}
    </span>
  );
};
