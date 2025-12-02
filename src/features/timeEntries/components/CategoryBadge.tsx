import React from 'react';
import clsx from 'clsx';
import { UNTRACKED_CATEGORY_COLOR, UNTRACKED_CATEGORY_LABEL } from '@/lib/untracked';

type Props = {
  label?: string | null;
  color?: string | null;
  isUntracked?: boolean;
  className?: string;
  size?: 'sm' | 'md';
};

export const CategoryBadge: React.FC<Props> = ({
  label,
  color,
  isUntracked = false,
  className,
  size = 'md',
}) => {
  const background = isUntracked ? UNTRACKED_CATEGORY_COLOR : color ?? 'var(--color-primary)';
  const textColor = isUntracked ? '#374151' : '#ffffff';
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-[13px]';

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium leading-none',
        padding,
        className,
      )}
      style={{ backgroundColor: background, color: textColor }}
    >
      {label || (isUntracked ? UNTRACKED_CATEGORY_LABEL : 'Uncategorized')}
    </span>
  );
};
