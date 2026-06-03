import { NextResponse } from 'next/server';
import { COOKIE, token, validLogin } from '../../../../lib/auth';

export async function POST(request) {
  const { id, password } = await request.json();
  if (!validLogin(id, password)) {
    return NextResponse.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE, token(), { httpOnly: true, sameSite: 'lax', path: '/' });
  return response;
}
