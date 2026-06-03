import { NextResponse } from 'next/server';
import { getOpenAI } from '../../../lib/openai';
import { getPackage } from '../../../lib/data';

const fallbackLead = {
  ko: '보완 포인트',
  vi: 'Điểm cần bổ sung',
  zh: '补充要点',
  en: 'Points to review'
};

function localRemediation(pkg, missingItems, language) {
  const lead = fallbackLead[language] || fallbackLead.ko;
  const misses = Array.isArray(missingItems) && missingItems.length ? missingItems.join(', ') : '핵심 안전수칙';
  return `${pkg.correctAnswerExample}\n\n${lead}: ${misses}`;
}

export async function POST(request) {
  try {
    const { packageId, transcript, language, missingItems } = await request.json();
    const pkg = await getPackage(packageId);
    if (!pkg) return NextResponse.json({ error: 'package not found' }, { status: 404 });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ text: localRemediation(pkg, missingItems, language) });
    }

    const client = getOpenAI();
    const result = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: 'You create short remediation education text for construction workers. Understand the Korean work rules, then explain the remediation guidance in the selected language. Keep it concise and direct.' },
        { role: 'user', content: JSON.stringify({ language, workName: pkg.workNameKo, riskObject: pkg.riskObjectKo, transcript, missingItems, correctAnswerExample: pkg.correctAnswerExample, instruction: 'Create a short remediation guidance message for the worker in the selected language.' }) }
      ]
    });
    return NextResponse.json({ text: result.choices[0]?.message?.content || pkg.correctAnswerExample });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'remediation error' }, { status: 500 });
  }
}
