import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import { optionalNotes, optionalPositiveInt, optionalUuidArray, optionalUuid } from '@/infra/http/validationSchemas';

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(191).optional(),
  description: optionalNotes.nullable(),
  isQuickStart: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  defaultDurationEstimateMinutes: optionalPositiveInt.nullable(),
  colorHex: z.string().max(20).nullable().optional(),
  mainCategoryValueId: optionalUuid.nullable(),
  categoryValueIds: optionalUuidArray,
});

const handler = async (req: Request, context?: { params?: { id: string } }) => {
  const userId = getUserIdFromRequest(req);

  const body = await req.json();
  const parsed = updateSchema.parse(body);
  const useCases = createUseCases();

  const { categoryValueIds, mainCategoryValueId, ...rest } = parsed;
  const updates = {
    ...rest,
    colorHex: parsed.colorHex ?? null,
    mainCategoryValueId: mainCategoryValueId ?? null,
  };

  const id = paramsSchema.parse(context?.params ?? {}).id;
  const template = await useCases.updateTaskTemplate({
    id,
    updates,
  });

  let normalizedCategoryIds = categoryValueIds ? Array.from(new Set(categoryValueIds)) : null;
  if (parsed.mainCategoryValueId && normalizedCategoryIds && !normalizedCategoryIds.includes(parsed.mainCategoryValueId)) {
    normalizedCategoryIds = [...normalizedCategoryIds, parsed.mainCategoryValueId];
  }

  if (normalizedCategoryIds) {
      await useCases.assignCategoriesToTaskTemplate({
        taskTemplateId: id,
        userId,
        categoryValueIds: normalizedCategoryIds,
      });
  }

  const refreshed = await useCases.repositories.taskTemplateRepository.findById(id);

  return NextResponse.json(refreshed ?? template, { status: 200 });
};

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(handler)(req, { params: await context.params });
}
