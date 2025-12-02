import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import { optionalNotes, optionalPositiveInt, optionalUuidArray } from '@/infra/http/validationSchemas';

const createSchema = z.object({
  name: z.string().min(1).max(191),
  description: optionalNotes.nullable(),
  isQuickStart: z.boolean().optional(),
  defaultDurationEstimateMinutes: optionalPositiveInt.nullable(),
  categoryValueIds: optionalUuidArray,
  mainCategoryValueId: z.string().uuid().nullable().optional(),
  colorHex: z.string().max(20).nullable().optional(),
});

const getHandler = async (req: Request) => {
  const userId = getUserIdFromRequest(req);
  const useCases = createUseCases();
  const templates = await useCases.listTaskTemplates({ userId });
  return NextResponse.json(templates, { status: 200 });
};

const postHandler = async (req: Request) => {
  const userId = getUserIdFromRequest(req);
  const body = await req.json();
  const parsed = createSchema.parse(body);

  const useCases = createUseCases();
  const categoryValueIds = parsed.categoryValueIds ? Array.from(new Set(parsed.categoryValueIds)) : [];
  const mainCategoryValueId = parsed.mainCategoryValueId ?? null;
  const normalizedCategoryIds =
    mainCategoryValueId && !categoryValueIds.includes(mainCategoryValueId)
      ? [...categoryValueIds, mainCategoryValueId]
      : categoryValueIds;

  const template = await useCases.createTaskTemplate({
    userId,
    name: parsed.name,
    description: parsed.description ?? null,
    isQuickStart: parsed.isQuickStart,
    defaultDurationEstimateMinutes: parsed.defaultDurationEstimateMinutes ?? null,
    mainCategoryValueId,
    colorHex: parsed.colorHex ?? null,
  });

  if (normalizedCategoryIds.length > 0) {
    await useCases.assignCategoriesToTaskTemplate({
      taskTemplateId: template.id,
      userId,
      categoryValueIds: normalizedCategoryIds,
    });
  }

  const refreshed = await useCases.repositories.taskTemplateRepository.findById(template.id);

  return NextResponse.json(refreshed ?? template, { status: 201 });
};

export async function GET(req: NextRequest, context: { params: Promise<Record<string, never>> }) {
  return withErrorHandling(getHandler)(req, { params: await context.params });
}

export async function POST(req: NextRequest, context: { params: Promise<Record<string, never>> }) {
  return withErrorHandling(postHandler)(req, { params: await context.params });
}
