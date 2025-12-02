import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import { optionalHexColor, optionalNotes, optionalPositiveInt, uuidString } from '@/infra/http/validationSchemas';

const paramsSchema = z.object({
  id: uuidString,
});

const patchSchema = z.object({
  name: z.string().min(1).max(191).optional(),
  description: optionalNotes.nullable().optional(),
  color: optionalHexColor,
  sortOrder: optionalPositiveInt,
});

const handler = async (req: Request, context?: { params?: { id: string } }) => {
  const userId = getUserIdFromRequest(req);
  const { id } = paramsSchema.parse(context?.params ?? {});
  const body = await req.json();
  const parsed = patchSchema.parse(body ?? {});

  const useCases = createUseCases();
  const updated = await useCases.updateCategoryDimension({
    id,
    updates: {
      ...parsed,
    },
  });

  return NextResponse.json(updated, { status: 200 });
};

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  return withErrorHandling(handler)(req, { params });
}
