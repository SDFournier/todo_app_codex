import React from 'react';
import clsx from 'clsx';
import { FALLBACK_TEMPLATE_COLOR } from '@/lib/display/templates';

type Props = {
  color?: string | null;
  className?: string;
};

export const TemplateColorDot: React.FC<Props> = ({ color, className }) => {
  return (
    <span
      className={clsx('inline-flex h-2.5 w-2.5 rounded-full border border-[var(--color-border)]', className)}
      style={{ backgroundColor: color ?? FALLBACK_TEMPLATE_COLOR }}
    />
  );
};
