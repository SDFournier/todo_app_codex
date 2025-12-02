import React from 'react';
import clsx from 'clsx';

type CardProps = {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export const Card: React.FC<CardProps> = ({ title, actions, children, className }) => {
  return (
    <div
      className={clsx(
        'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]',
        className,
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          {title && <h3 className="text-[16px] font-semibold text-[var(--color-text-main)]">{title}</h3>}
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};
