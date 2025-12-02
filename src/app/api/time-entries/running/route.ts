import { NextResponse } from 'next/server';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import { ensureRunningEntry } from '@/infra/untracked/untrackedService';

export const GET = withErrorHandling(async (req: Request) => {
  const userId = getUserIdFromRequest(req);
  const useCases = createUseCases();
  await ensureRunningEntry(userId);
  const entry = await useCases.repositories.timeEntryRepository.findRunningByUser(userId);
  if (!entry) return new NextResponse(null, { status: 204 });
  return NextResponse.json(entry, { status: 200 });
});
