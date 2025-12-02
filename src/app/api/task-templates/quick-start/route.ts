import { NextResponse } from 'next/server';
import { createUseCases } from '../../../../infra/container';
import { withErrorHandling } from '../../../../infra/http/withErrorHandling';
import { getUserIdFromRequest } from '../../../../infra/http/getUserId';

export const GET = withErrorHandling(async (req: Request) => {
  const userId = getUserIdFromRequest(req);
  const useCases = createUseCases();
  const templates = await useCases.listQuickStartTaskTemplates({ userId });
  return NextResponse.json(templates, { status: 200 });
});
