import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import { optionalHexColor, optionalNotes } from '@/infra/http/validationSchemas';

const createSchema = z.object({
  name: z.string().min(1).max(191),
  description: optionalNotes.nullable(),
  sortOrder: z.number().int().optional(),
  isSystem: z.boolean().optional(),
  color: optionalHexColor,
});

export const GET = withErrorHandling(async (req: Request) => {
  const userId = getUserIdFromRequest(req);
  const useCases = createUseCases();
  const dims = await useCases.listCategoryDimensions({ userId });
  return NextResponse.json(dims, { status: 200 });
});

export const POST = withErrorHandling(async (req: Request) => {
  const userId = getUserIdFromRequest(req);
  const body = await req.json();
  const parsed = createSchema.parse(body);
  const useCases = createUseCases();
  const dim = await useCases.createCategoryDimension({
    userId,
    ...parsed,
  });
  return NextResponse.json(dim, { status: 201 });
});
