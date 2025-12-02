import { NextResponse, type NextRequest } from 'next/server';
import { createUseCases } from '@/infra/container';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import { z } from 'zod';

const paramsSchema = z.object({ id: z.string().uuid() });

const handler = async (req: Request, context?: { params?: { id: string } }) => {
  getUserIdFromRequest(req); // ensure auth present
  const useCases = createUseCases();
  await useCases.archiveTaskTemplate({ id: paramsSchema.parse(context?.params ?? {}).id });
  return new NextResponse(null, { status: 204 });
};

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withErrorHandling(handler)(req, { params: await context.params });
}
