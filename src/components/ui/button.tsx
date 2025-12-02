import React from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-primary)] text-[var(--color-text-on-primary)] hover:bg-[var(--color-primary-strong)] disabled:bg-[var(--color-primary-soft)] disabled:text-[var(--color-text-muted)]',
  secondary:
    'bg-[var(--color-surface)] text-[var(--color-text-main)] border border-[var(--color-border)] hover:bg-[var(--color-primary-soft)] disabled:text-[var(--color-text-muted)]',
  ghost:
    'bg-transparent text-[var(--color-text-main)] hover:bg-[var(--color-primary-soft)] disabled:text-[var(--color-text-muted)]',
  danger:
    'bg-[var(--color-error)] text-[var(--color-text-on-primary)] hover:bg-[#dc2626] disabled:bg-[#fecdd3] disabled:text-[var(--color-text-muted)]',
};

const sizeClasses = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-sm',
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', className, ...props }) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
};
