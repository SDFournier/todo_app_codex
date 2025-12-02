import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  const appPassword = process.env.APP_PASSWORD;
  if (!appPassword) {
    return NextResponse.json({ message: 'Password not set' }, { status: 500 });
  }
  const body = await req.json().catch(() => ({}));
  if (body?.password !== appPassword) {
    return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set("app_auth", appPassword, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
};
