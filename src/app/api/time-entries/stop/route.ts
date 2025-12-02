import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import { readJsonOrDefault } from '@/infra/http/requestUtils';
import { optionalUuid } from '@/infra/http/validationSchemas';
import { startUntrackedEntryForUser } from '@/infra/untracked/untrackedService';

const schema = z.object({
  timeEntryId: optionalUuid,
  endedAt: z.coerce.date().optional(),
});

export const POST = withErrorHandling(async (req: Request) => {
  const userId = getUserIdFromRequest(req);
  const body = await readJsonOrDefault(req, {});
  const parsed = schema.parse(body);

  const useCases = createUseCases();
  const entry = await useCases.stopTimeEntry({
    userId,
    ...parsed,
  });

  if (!entry.isUntracked) {
    await startUntrackedEntryForUser(userId);
  }

  return NextResponse.json(entry, { status: 200 });
});
