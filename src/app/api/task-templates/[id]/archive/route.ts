import { NextResponse } from 'next/server';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';

export const POST = withErrorHandling(async (req: Request, { params }: { params: { id: string } }) => {
  getUserIdFromRequest(req); // ensure auth present
  const useCases = createUseCases();
  await useCases.archiveTaskTemplate({ id: params.id });
  return new NextResponse(null, { status: 204 });
});
