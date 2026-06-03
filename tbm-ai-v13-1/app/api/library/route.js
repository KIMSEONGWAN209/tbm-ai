import { NextResponse } from 'next/server';
import { getLibrary } from '../../../lib/data';

export async function GET() {
  return NextResponse.json({ library: await getLibrary() });
}
