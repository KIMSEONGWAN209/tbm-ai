import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE, isAdmin } from '../../../lib/auth';
import { createSubmission, getSubmissions, patchSubmission } from '../../../lib/data';
import { todayKST } from '../../../lib/date';

export async function GET(request) {
  const cookieStore = cookies();
  if (!isAdmin(cookieStore.get(COOKIE)?.value)) {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  return NextResponse.json({ submissions: await getSubmissions(searchParams.get('date') || undefined) });
}

export async function POST(request) {
  const body = await request.json();
  const submission = await createSubmission({
    date: body.date || todayKST(),
    workerName: body.workerName,
    nationality: body.nationality,
    ageGroup: body.ageGroup,
    companyName: body.companyName,
    phoneNumber: body.phoneNumber,
    residentIdMasked: body.residentIdMasked,
    language: body.language,
    selectedPackageId: body.selectedPackageId,
    transcript: body.transcript,
    remediationCompleted: false,
    remediationViewedSeconds: 0,
    analysis: body.analysis
  });
  return NextResponse.json({ submission });
}

export async function PATCH(request) {
  const { id, remediationCompleted, remediationViewedSeconds } = await request.json();
  const submission = await patchSubmission(id, { remediationCompleted, remediationViewedSeconds });
  return NextResponse.json({ submission });
}
