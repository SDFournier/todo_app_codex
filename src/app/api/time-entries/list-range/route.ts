import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';

const schema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export const POST = withErrorHandling(async (req: Request) => {
  const userId = getUserIdFromRequest(req);
  const body = await req.json();
  const parsed = schema.parse(body);

  const useCases = createUseCases();
  const entries = await useCases.listTimeEntriesByRange({
    userId,
    from: parsed.from,
    to: parsed.to,
  });

  return NextResponse.json(entries, { status: 200 });
});
