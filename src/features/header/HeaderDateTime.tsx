"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";

type Props = {
  initialIso: string;
};

export const HeaderDateTime: React.FC<Props> = ({ initialIso }) => {
  const [now, setNow] = useState<Date>(new Date(initialIso));

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-start gap-1 text-left sm:items-end sm:text-right">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Now</div>
      <div className="text-sm font-semibold text-[var(--color-text-main)] sm:text-base">
        {format(now, "EEE, MMM d \u00b7 HH:mm:ss")}
      </div>
    </div>
  );
};
