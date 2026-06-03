import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE, isAdmin } from '../../../lib/auth';
import { getPackagesForDate, saveSetup } from '../../../lib/data';
import { todayKST } from '../../../lib/date';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || todayKST();
  return NextResponse.json({ date, packages: await getPackagesForDate(date) });
}

export async function POST(request) {
  const cookieStore = cookies();
  if (!isAdmin(cookieStore.get(COOKIE)?.value)) {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 });
  }
  const { date, packageIds } = await request.json();
  await saveSetup(date, Array.isArray(packageIds) ? packageIds : []);
  return NextResponse.json({ ok: true });
}
