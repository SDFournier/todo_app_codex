import { useEffect, useState } from 'react';

export const useElapsedTime = (startedAt?: string | Date, endedAt?: string | Date | null) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const startMs = typeof startedAt === 'string' ? new Date(startedAt).getTime() : startedAt.getTime();
    const endMs = endedAt ? (typeof endedAt === 'string' ? new Date(endedAt).getTime() : endedAt.getTime()) : null;

    const compute = () => {
      const now = Date.now();
      const end = endMs ?? now;
      return Math.max(0, Math.floor((end - startMs) / 1000));
    };

    setElapsed(compute());
    if (endMs) return;

    const id = setInterval(() => setElapsed(compute()), 1000);
    return () => clearInterval(id);
  }, [startedAt, endedAt]);

  return elapsed;
};
