import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import { uuidArray } from '@/infra/http/validationSchemas';

const schema = z.object({
  categoryValueIds: uuidArray,
});

export const POST = withErrorHandling(async (req: Request, { params }: { params: { id: string } }) => {
  const userId = getUserIdFromRequest(req);
  const body = await req.json();
  const parsed = schema.parse(body);

  const useCases = createUseCases();
  await useCases.assignCategoriesToTaskTemplate({
    taskTemplateId: params.id,
    userId,
    categoryValueIds: parsed.categoryValueIds,
  });

  return new NextResponse(null, { status: 204 });
});
