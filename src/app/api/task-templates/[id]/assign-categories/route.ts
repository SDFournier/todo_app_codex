import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import { uuidArray } from '@/infra/http/validationSchemas';

const schema = z.object({
  categoryValueIds: uuidArray,
});

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const handler = async (req: Request, context?: { params?: { id: string } }) => {
  const userId = getUserIdFromRequest(req);
  const body = await req.json();
  const parsed = schema.parse(body);

  const useCases = createUseCases();
  await useCases.assignCategoriesToTaskTemplate({
    taskTemplateId: paramsSchema.parse(context?.params ?? {}).id,
    userId,
    categoryValueIds: parsed.categoryValueIds,
  });

  return new NextResponse(null, { status: 204 });
};

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(handler)(req, { params: await context.params });
}
