/**
 * Extracts userId from the request. In real apps, replace with your auth/session provider.
 * Here we fallback to an `x-user-id` header for simplicity.
 */
export function getUserIdFromRequest(req: Request): string {
  const headerId = req.headers.get('x-user-id');
  if (headerId) return headerId;

  // Development-only escape hatch so local requests can succeed without auth wiring.
  const devFallback = process.env.DEV_USER_ID;
  if (process.env.NODE_ENV !== 'production' && devFallback) return devFallback;

  throw new Error('Unauthorized: missing user id');
}
