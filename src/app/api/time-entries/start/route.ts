import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import { readJsonOrDefault } from '@/infra/http/requestUtils';
import { optionalUuid, optionalShortText, optionalNotes, optionalUuidArray } from '@/infra/http/validationSchemas';

const schema = z.object({
  taskTemplateId: optionalUuid,
  titleOverride: optionalShortText.nullable(),
  notes: optionalNotes,
  categoryValueIds: optionalUuidArray,
  stopRunningIfExists: z.boolean().optional(),
});

const handler = async (req: Request) => {
  const userId = getUserIdFromRequest(req);
  const body = await readJsonOrDefault(req, {});
  const parsed = schema.parse(body);

  const useCases = createUseCases();
  const entry = await useCases.startTimeEntry({
    userId,
    ...parsed,
  });

  return NextResponse.json(entry, { status: 201 });
};

export async function POST(req: NextRequest, context: { params: Promise<Record<string, never>> }) {
  return withErrorHandling(handler)(req, { params: await context.params });
}
