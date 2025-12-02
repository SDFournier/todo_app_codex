import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import {
  optionalUuid,
  optionalShortText,
  optionalNotes,
  optionalUuidArray,
  optionalPositiveInt,
} from '@/infra/http/validationSchemas';

const schema = z.object({
  taskTemplateId: optionalUuid,
  titleOverride: optionalShortText,
  notes: optionalNotes,
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date(),
  durationSeconds: optionalPositiveInt,
  categoryValueIds: optionalUuidArray,
});

const handler = async (req: Request) => {
  const userId = getUserIdFromRequest(req);
  const body = await req.json();
  const parsed = schema.parse(body);

  const useCases = createUseCases();
  const entry = await useCases.createManualTimeEntry({
    userId,
    ...parsed,
  });

  return NextResponse.json(entry, { status: 201 });
};

export async function POST(req: NextRequest, context: { params: Promise<Record<string, never>> }) {
  return withErrorHandling(handler)(req, { params: await context.params });
}
