/**
 * Minimal logger helper. Can be swapped for a real logger later.
 */
export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    console.info(msg, meta ?? '');
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    console.warn(msg, meta ?? '');
  },
  error: (msg: string, meta?: Record<string, unknown>) => {
    console.error(msg, meta ?? '');
  },
};
