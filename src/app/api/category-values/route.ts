import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import { uuidString, optionalUuid, optionalShortText, optionalNotes, optionalPositiveInt, optionalHexColor } from '@/infra/http/validationSchemas';

const listSchema = z.object({
  dimensionId: uuidString,
});

const createSchema = z.object({
  dimensionId: uuidString,
  parentId: optionalUuid,
  label: z.string().min(1).max(191),
  code: z.string().max(50).nullable().optional(),
  color: optionalHexColor,
  sortOrder: optionalPositiveInt,
  isProductive: z.boolean().optional(),
});

const getHandler = async (req: Request) => {
  const userId = getUserIdFromRequest(req);
  const url = new URL(req.url);
  const dimensionId = url.searchParams.get('dimensionId');
  const parsed = listSchema.parse({ dimensionId });

  const useCases = createUseCases();
  const values = await useCases.listCategoryValues({ userId, dimensionId: parsed.dimensionId });
  return NextResponse.json(values, { status: 200 });
};

const postHandler = async (req: Request) => {
  const userId = getUserIdFromRequest(req);
  const body = await req.json();
  const parsed = createSchema.parse(body);

  const useCases = createUseCases();
  const value = await useCases.createCategoryValue({
    userId,
    ...parsed,
    isProductive: parsed.isProductive ?? false,
  });

  return NextResponse.json(value, { status: 201 });
};

export async function GET(req: NextRequest, context: { params: Promise<Record<string, never>> }) {
  return withErrorHandling(getHandler)(req, { params: await context.params });
}

export async function POST(req: NextRequest, context: { params: Promise<Record<string, never>> }) {
  return withErrorHandling(postHandler)(req, { params: await context.params });
}
