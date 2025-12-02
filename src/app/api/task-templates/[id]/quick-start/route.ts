import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';

const schema = z.object({
  isQuickStart: z.boolean(),
});

export const POST = withErrorHandling(async (req: Request, { params }: { params: { id: string } }) => {
  const userId = getUserIdFromRequest(req);
  const body = await req.json();
  const parsed = schema.parse(body);
  const useCases = createUseCases();
  await useCases.setQuickStartTemplate({
    userId,
    templateId: params.id,
    isQuickStart: parsed.isQuickStart,
  });
  return NextResponse.json({ ok: true }, { status: 200 });
});
