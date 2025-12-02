import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import { optionalHexColor, optionalNotes, optionalPositiveInt, optionalShortText, optionalUuid, uuidString } from '@/infra/http/validationSchemas';

const paramsSchema = z.object({
  id: uuidString,
});

const patchSchema = z.object({
  parentId: optionalUuid,
  dimensionId: optionalUuid,
  label: optionalShortText,
  code: z.string().max(50).nullable().optional(),
  color: optionalHexColor,
  sortOrder: optionalPositiveInt,
  isArchived: z.boolean().optional(),
  notes: optionalNotes.optional(), // kept for forward-compat; unused in domain
  isProductive: z.boolean().optional(),
});

const handler = async (req: Request, context?: { params?: { id: string } }) => {
  const userId = getUserIdFromRequest(req);
  void userId;
  const { id } = paramsSchema.parse(context?.params ?? {});
  const body = await req.json();
  const parsed = patchSchema.parse(body ?? {});

  const useCases = createUseCases();
  const updated = await useCases.updateCategoryValue({
    id,
    updates: {
      dimensionId: parsed.dimensionId ?? undefined,
      parentId: parsed.parentId,
      label: parsed.label,
      code: parsed.code,
      color: parsed.color ?? undefined,
      sortOrder: parsed.sortOrder,
      isArchived: parsed.isArchived,
      isProductive: parsed.isProductive,
    },
  });

  return NextResponse.json(updated, { status: 200 });
};

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  return withErrorHandling(handler)(req, { params });
}
