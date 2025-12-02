import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';

const querySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(10),
});

const handler = async (req: Request) => {
  const userId = getUserIdFromRequest(req);
  const url = new URL(req.url);
  const limitParam = url.searchParams.get('limit');
  const { limit } = querySchema.parse({ limit: limitParam ?? undefined });

  const useCases = createUseCases();
  // For simplicity, fetch last 30 days and slice.
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 30);

  const entries = await useCases.listTimeEntriesByRange({
    userId,
    from,
    to: now,
  });

  // Sort by startedAt desc and limit.
  const sorted = entries.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  return NextResponse.json(sorted.slice(0, limit), { status: 200 });
};

export async function GET(req: NextRequest, context: { params: Promise<Record<string, never>> }) {
  return withErrorHandling(handler)(req, { params: await context.params });
}
