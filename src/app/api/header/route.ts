import { NextResponse, type NextRequest } from 'next/server';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getHeaderDataForUser } from '@/infra/header/getHeaderData';

const getHandler = async (req: Request) => {
  const userId = getUserIdFromRequest(req);
  const data = await getHeaderDataForUser(userId);
  return NextResponse.json(data, { status: 200 });
};

export async function GET(req: NextRequest, context: { params: Promise<Record<string, never>> }) {
  return withErrorHandling(getHandler)(req, { params: await context.params });
}
