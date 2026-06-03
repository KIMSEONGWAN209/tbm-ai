import { NextResponse } from 'next/server';
import { getSubmissionById } from '../../../lib/data';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const submission = await getSubmissionById(id);
  if (!submission) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ submission });
}
