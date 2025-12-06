/**
 * Extracts userId from the request. In real apps, replace with your auth/session provider.
 * Here we fallback to an `x-user-id` header for simplicity.
 */
export function getUserIdFromRequest(req: Request): string {
  const headerId = req.headers.get('x-user-id');
  if (headerId) return headerId;

  // Fallback for environments without auth wiring (e.g. demo deployments).
  const fallback = process.env.DEMO_USER_ID ?? process.env.DEV_USER_ID ?? process.env.NEXT_PUBLIC_DEMO_USER_ID;
  if (fallback) return fallback;

  throw new Error('Unauthorized: missing user id');
}
