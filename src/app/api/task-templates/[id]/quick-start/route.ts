import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import { uuidString } from '@/infra/http/validationSchemas';

const schema = z.object({
  isQuickStart: z.boolean(),
});

const paramsSchema = z.object({
  id: uuidString,
});

const handler = async (req: Request, context?: { params?: { id: string } }) => {
  const userId = getUserIdFromRequest(req);
  const body = await req.json();
  const parsed = schema.parse(body);
  const useCases = createUseCases();
  await useCases.setQuickStartTemplate({
    userId,
    templateId: paramsSchema.parse(context?.params ?? {}).id,
    isQuickStart: parsed.isQuickStart,
  });
  return NextResponse.json({ ok: true }, { status: 200 });
};

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(handler)(req, { params: await context.params });
}
