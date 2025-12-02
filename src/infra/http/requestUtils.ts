/**
 * Safely parse JSON from a Request. Falls back to the provided default when the
 * body is empty or invalid JSON. Useful for routes where the body is optional.
 */
export async function readJsonOrDefault<T = unknown>(req: Request, fallback: T): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    return fallback;
  }
}
