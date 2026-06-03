import { NextResponse } from 'next/server';
import { toFile } from 'openai/uploads';
import { getOpenAI } from '../../../lib/openai';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio');
    const language = String(formData.get('language') || 'ko');
    if (!(audio instanceof File)) {
      return NextResponse.json({ error: 'audio file required' }, { status: 400 });
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ text: '' });
    }
    const client = getOpenAI();
    const file = await toFile(Buffer.from(await audio.arrayBuffer()), audio.name || 'tbm.webm', { type: audio.type || 'audio/webm' });
    const result = await client.audio.transcriptions.create({
      model: 'whisper-1',
      file,
      language,
      prompt: '건설현장 TBM 점검 음성입니다. 안전수칙과 주의사항을 정확히 전사하세요.'
    });
    return NextResponse.json({ text: result.text });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'transcribe error' }, { status: 500 });
  }
}
