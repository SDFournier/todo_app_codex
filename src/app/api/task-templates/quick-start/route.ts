import { NextResponse, type NextRequest } from 'next/server';
import { createUseCases } from '../../../../infra/container';
import { withErrorHandling } from '../../../../infra/http/withErrorHandling';
import { getUserIdFromRequest } from '../../../../infra/http/getUserId';

const handler = async (req: Request) => {
  const userId = getUserIdFromRequest(req);
  const useCases = createUseCases();
  const templates = await useCases.listQuickStartTaskTemplates({ userId });
  return NextResponse.json(templates, { status: 200 });
};

export async function GET(req: NextRequest, context: { params: Promise<Record<string, never>> }) {
  return withErrorHandling(handler)(req, { params: await context.params });
}
