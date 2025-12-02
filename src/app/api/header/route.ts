import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/infra/http/getUserId';
import { withErrorHandling } from '@/infra/http/withErrorHandling';
import { getHeaderDataForUser } from '@/infra/header/getHeaderData';

export const GET = withErrorHandling(async (req: Request) => {
  const userId = getUserIdFromRequest(req);
  const data = await getHeaderDataForUser(userId);
  return NextResponse.json(data, { status: 200 });
});
