import { NextResponse } from 'next/server';
import { getOpenAI } from '../../../lib/openai';
import { getPackage } from '../../../lib/data';

const localized = {
  ko: { passSummary: '핵심 안전수칙이 대체로 확인되었습니다.', supplementSummary: '일부 핵심 안전수칙이 부족하여 보완교육이 필요합니다.', passGuide: '현장 확인 후 통과 처리 가능합니다.', supplementGuide: '누락 항목 중심으로 추가 설명을 진행해 주세요.' },
  vi: { passSummary: 'Các quy tắc an toàn cốt lõi đã được xác nhận tương đối đầy đủ.', supplementSummary: 'Một số quy tắc an toàn cốt lõi còn thiếu nên cần đào tạo bổ sung.', passGuide: 'Có thể xử lý đạt sau khi quản lý kiểm tra tại hiện trường.', supplementGuide: 'Vui lòng giải thích thêm tập trung vào các mục còn thiếu.' },
  zh: { passSummary: '核心安全守则已基本确认。', supplementSummary: '部分核心安全守则不足，需要补充教育。', passGuide: '现场确认后可处理为通过。', supplementGuide: '请围绕遗漏项目补充说明。' },
  en: { passSummary: 'The core safety rules were mostly confirmed.', supplementSummary: 'Some core safety rules are missing, so remediation is required.', passGuide: 'It can be passed after the manager checks it on site.', supplementGuide: 'Please provide additional guidance focused on the missing items.' }
};

function localAnalysis(pkg, transcript, language) {
  const normalized = String(transcript || '').replace(/\s+/g, ' ').trim();
  const missingItems = [];
  let matched = 0;
  for (const rule of pkg.requiredSafetyRules) {
    const keywords = rule.split(/\s+/).filter((w) => w.length >= 2);
    const hit = keywords.some((word) => normalized.includes(word));
    if (hit) matched += 1;
    else missingItems.push(rule);
  }
  const score = Math.round((matched / Math.max(1, pkg.requiredSafetyRules.length)) * 100);
  const decision = matched >= Math.max(2, Math.ceil(pkg.requiredSafetyRules.length * 0.6)) ? 'pass' : 'supplement';
  const dict = localized[language] || localized.ko;
  return {
    decision,
    score,
    summary: decision === 'pass' ? dict.passSummary : dict.supplementSummary,
    missingItems,
    managerGuide: decision === 'pass' ? dict.passGuide : dict.supplementGuide
  };
}

export async function POST(request) {
  try {
    const { packageId, transcript, language } = await request.json();
    const pkg = await getPackage(packageId);
    if (!pkg) return NextResponse.json({ error: 'package not found' }, { status: 404 });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ analysis: localAnalysis(pkg, transcript, language) });
    }

    const client = getOpenAI();
    const result = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a TBM construction safety evaluator. The work package rules are Korean reference rules. Understand the worker transcript in the selected language, compare it semantically against the Korean rules, and respond in the selected language. Output JSON only with keys decision, score, summary, missingItems, managerGuide. decision must be pass or supplement. score must be 0-100.' },
        { role: 'user', content: JSON.stringify({ language, transcript, workName: pkg.workNameKo, riskObject: pkg.riskObjectKo, requiredSafetyRules: pkg.requiredSafetyRules, correctAnswerExample: pkg.correctAnswerExample }) }
      ]
    });
    const raw = result.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);
    return NextResponse.json({
      analysis: {
        decision: parsed.decision === 'pass' ? 'pass' : 'supplement',
        score: Number(parsed.score || 0),
        summary: parsed.summary || (localized[language] || localized.ko).supplementSummary,
        missingItems: Array.isArray(parsed.missingItems) ? parsed.missingItems : [],
        managerGuide: parsed.managerGuide || (localized[language] || localized.ko).supplementGuide
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'analyze error' }, { status: 500 });
  }
}
