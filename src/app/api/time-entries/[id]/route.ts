import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import {
  uuidString,
  optionalUuid,
  optionalShortText,
  optionalNotes,
  optionalUuidArray,
  optionalPositiveInt,
} from '@/infra/http/validationSchemas';

const paramsSchema = z.object({
  id: uuidString,
});

const patchSchema = z.object({
  taskTemplateId: optionalUuid,
  titleOverride: optionalShortText.nullable(),
  notes: optionalNotes.nullable(),
  mainCategoryValueId: optionalUuid,
  startedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().nullable().optional(),
  durationSeconds: optionalPositiveInt.nullable(),
  localDate: z.coerce.date().nullable().optional(),
  year: z.number().int().nullable().optional(),
  month: z.number().int().nullable().optional(),
  weekOfYear: z.number().int().nullable().optional(),
  dayOfWeek: z.number().int().nullable().optional(),
  categoryValueIds: optionalUuidArray,
});

const patchHandler = async (req: Request, context?: { params?: { id: string } }) => {
  console.log('PATCH /api/time-entries/:id start', { url: req.url, method: req.method });
  const userId = getUserIdFromRequest(req);
  const { id } = paramsSchema.parse(context?.params ?? {});
  const raw = await req.text();
  // Debug logging to catch promise-like bodies that Zod rejects.
  console.log('PATCH /api/time-entries/:id raw type', typeof raw);
  console.log('PATCH /api/time-entries/:id raw snippet', raw?.slice?.(0, 200));
  let body: unknown = {};
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('PATCH /api/time-entries/:id JSON parse error', err);
  }
  if (body && typeof body === 'object' && typeof (body as { then?: unknown }).then === 'function') {
    console.log('PATCH /api/time-entries/:id body is thenable, awaiting it');
    try {
      body = await (body as Promise<unknown>);
      console.log('PATCH /api/time-entries/:id unwrapped thenable body type', typeof body);
    } catch (err) {
      console.error('PATCH /api/time-entries/:id failed to await thenable body', err);
    }
  }
  console.log('PATCH /api/time-entries/:id body type', typeof body);
  console.log('PATCH /api/time-entries/:id body keys', body && typeof body === 'object' ? Object.keys(body) : 'n/a');
  const parsed = await patchSchema.parseAsync(body ?? {});

  const useCases = createUseCases();
  const entry = await useCases.editTimeEntry({
    entryId: id,
    updates: {
      taskTemplateId: parsed.taskTemplateId,
      titleOverride: parsed.titleOverride,
      notes: parsed.notes,
      mainCategoryValueId: parsed.mainCategoryValueId,
      startedAt: parsed.startedAt,
      endedAt: parsed.endedAt ?? undefined,
      durationSeconds: parsed.durationSeconds ?? undefined,
      localDate: parsed.localDate ?? undefined,
      year: parsed.year ?? undefined,
      month: parsed.month ?? undefined,
      weekOfYear: parsed.weekOfYear ?? undefined,
      dayOfWeek: parsed.dayOfWeek ?? undefined,
    },
    categoryValueIds: parsed.categoryValueIds,
  });

  return NextResponse.json(entry, { status: 200 });
};

const deleteHandler = async (req: Request, context?: { params?: { id: string } }) => {
  const userId = getUserIdFromRequest(req);
  const { id } = paramsSchema.parse(context?.params ?? {});
  const useCases = createUseCases();
  await useCases.deleteTimeEntry({ userId, entryId: id });
  return new NextResponse(null, { status: 204 });
};

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(patchHandler)(req, { params: await context.params });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(deleteHandler)(req, { params: await context.params });
}
