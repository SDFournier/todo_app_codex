import { createUseCases } from '@/infra/container';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { NextResponse } from 'next/server';
import { z } from 'zod';


const schema = z.object({
  date: z.coerce.date(),
});

export const POST = withErrorHandling(async (req: Request) => {
  const userId = getUserIdFromRequest(req);
  const body = await req.json();
  const parsed = schema.parse(body);

  const useCases = createUseCases();
  const summary = await useCases.getDailySummary({
    userId,
    date: parsed.date,
  });

  return NextResponse.json(summary, { status: 200 });
});
