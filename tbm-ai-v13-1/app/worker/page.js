'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const REMEDIATION_SECONDS = 30;

const labels = {
  ko: {
    dateTitle: '날짜 선택', next: '다음', back: '뒤로가기', languageTitle: '언어 선택', name: '이름', nationality: '국적', age: '나이대', company: '업체명', phone: '전화번호', resident: '주민번호', residentGuide: '형식: 123456-1xxxxxx', work: '오늘 작업', voiceGuide: '안전수칙과 주의사항을 말해 주세요', voiceExample: '예시', record: '녹음 시작', stop: '녹음 종료', transcript: 'STT 확인 및 수정', submit: '제출', loading: '처리 중...', pass: '확인', supplement: '보안교육 필요', remediation: '보완교육 시작', reenter: '보안교육 이어보기', remediationTitle: '보완교육 진행 중', remediationNeed: '보완 필요 항목', remain: '남은 시간', complete: '이수 완료', finish: '종료', finalThanks: '수고하셨습니다.', wait: '30초 확인 후 이수 가능합니다.', done: '이수 완료', noTranscript: 'STT 내용을 입력해 주세요.', micError: '마이크 권한을 확인해 주세요.', loadError: '작업 목록을 불러오지 못했습니다.', sttFallback: 'STT 미연동 상태입니다. 이 칸에 직접 내용을 입력해 주세요.', remediationFallback: '보완교육: 오늘 작업의 핵심 안전수칙을 다시 확인하고 누락된 위험요인을 중심으로 다시 답변해 주세요.', exitRemediation: '교육 도중 나가면 타이머가 멈추며, 다시 시작 버튼을 눌러야 이어서 진행됩니다.', modalTitle: '입력 확인', ok: '확인', examples: ['슬링 상태 확인', '신호수 지시 준수', '화물 아래 진입 금지'], alerts: { workerName: '이름을 입력해 주세요.', companyName: '업체명을 입력해 주세요.', phoneNumber: '전화번호를 입력해 주세요.', residentIdMasked: '주민번호를 입력해 주세요.', selectedPackageId: '오늘 작업을 선택해 주세요.' } },
  vi: {
    dateTitle: 'Chọn ngày', next: 'Tiếp theo', back: 'Quay lại', languageTitle: 'Chọn ngôn ngữ', name: 'Tên', nationality: 'Quốc tịch', age: 'Nhóm tuổi', company: 'Tên công ty', phone: 'Số điện thoại', resident: 'Số ID cư trú', residentGuide: 'Định dạng: 123456-1xxxxxx', work: 'Công việc hôm nay', voiceGuide: 'Hãy nói quy tắc an toàn và lưu ý', voiceExample: 'Ví dụ', record: 'Bắt đầu ghi âm', stop: 'Dừng ghi âm', transcript: 'Kiểm tra và sửa STT', submit: 'Gửi', loading: 'Đang xử lý...', pass: 'Xác nhận', supplement: 'Cần đào tạo bổ sung', remediation: 'Bắt đầu đào tạo bổ sung', reenter: 'Tiếp tục đào tạo', remediationTitle: 'Đang đào tạo bổ sung', remediationNeed: 'Mục cần bổ sung', remain: 'Thời gian còn lại', complete: 'Hoàn tất', finish: 'Kết thúc', finalThanks: 'Cảm ơn, bạn đã hoàn thành.', wait: 'Có thể hoàn tất sau 30 giây.', done: 'Đã hoàn tất', noTranscript: 'Vui lòng nhập nội dung STT.', micError: 'Vui lòng kiểm tra quyền micro.', loadError: 'Không thể tải danh sách công việc.', sttFallback: 'STT chưa kết nối. Vui lòng nhập nội dung trực tiếp vào ô này.', remediationFallback: 'Đào tạo bổ sung: Hãy xem lại các quy tắc an toàn chính của công việc hôm nay và trả lời lại tập trung vào các nguy cơ còn thiếu.', exitRemediation: 'Nếu rời màn hình trong lúc đào tạo, bộ đếm sẽ dừng và chỉ tiếp tục khi bạn nhấn bắt đầu lại.', modalTitle: 'Kiểm tra nhập liệu', ok: 'Xác nhận', examples: ['Kiểm tra dây cẩu', 'Theo chỉ huy tín hiệu', 'Không vào dưới hàng treo'], alerts: { workerName: 'Vui lòng nhập tên.', companyName: 'Vui lòng nhập tên công ty.', phoneNumber: 'Vui lòng nhập số điện thoại.', residentIdMasked: 'Vui lòng nhập số ID cư trú.', selectedPackageId: 'Vui lòng chọn công việc hôm nay.' } },
  zh: {
    dateTitle: '选择日期', next: '下一步', back: '返回', languageTitle: '选择语言', name: '姓名', nationality: '国籍', age: '年龄段', company: '公司名', phone: '电话号码', resident: '居民号码', residentGuide: '格式: 123456-1xxxxxx', work: '今日作业', voiceGuide: '请说出安全守则和注意事项', voiceExample: '示例', record: '开始录音', stop: '结束录音', transcript: '查看并修改 STT', submit: '提交', loading: '处理中...', pass: '确认', supplement: '需要补充教育', remediation: '开始补充教育', reenter: '继续教育', remediationTitle: '补充教育进行中', remediationNeed: '需要补充的项目', remain: '剩余时间', complete: '完成', finish: '结束', finalThanks: '辛苦了，已完成。', wait: '30秒后可以完成。', done: '已完成', noTranscript: '请输入 STT 内容。', micError: '请检查麦克风权限。', loadError: '无法加载作业列表。', sttFallback: 'STT 未连接。请直接在此输入内容。', remediationFallback: '补充教育：请重新确认今天作业的核心安全守则，并围绕遗漏的危险因素重新回答。', exitRemediation: '如果中途离开教育界面，计时器会停止，重新开始后才会继续计时。', modalTitle: '输入确认', ok: '确认', examples: ['检查吊索状态', '遵守指挥信号', '禁止进入吊物下方'], alerts: { workerName: '请输入姓名。', companyName: '请输入公司名。', phoneNumber: '请输入电话号码。', residentIdMasked: '请输入居民号码。', selectedPackageId: '请选择今日作业。' } },
  en: {
    dateTitle: 'Select date', next: 'Next', back: 'Back', languageTitle: 'Select language', name: 'Name', nationality: 'Nationality', age: 'Age group', company: 'Company', phone: 'Phone number', resident: 'Resident ID', residentGuide: 'Format: 123456-1xxxxxx', work: 'Today work', voiceGuide: 'Please speak the safety rules and cautions', voiceExample: 'Example', record: 'Start recording', stop: 'Stop recording', transcript: 'Check and edit STT', submit: 'Submit', loading: 'Processing...', pass: 'Confirm', supplement: 'Remediation required', remediation: 'Start remediation', reenter: 'Continue remediation', remediationTitle: 'Remediation in progress', remediationNeed: 'Required items', remain: 'Remaining time', complete: 'Complete', finish: 'Finish', finalThanks: 'Thank you. You are all done.', wait: 'Completion is available after 30 seconds.', done: 'Completed', noTranscript: 'Please enter the STT text.', micError: 'Please allow microphone access.', loadError: 'Could not load work list.', sttFallback: 'STT is not connected. Please type the content directly in this box.', remediationFallback: 'Remediation: Review the key safety rules for today’s work and answer again focusing on the missing hazards.', exitRemediation: 'If you leave during remediation, the timer stops and you must watch a new 30-second session when you re-enter.', modalTitle: 'Check input', ok: 'OK', examples: ['Check sling status', 'Follow signalman', 'Do not go under load'], alerts: { workerName: 'Please enter the name.', companyName: 'Please enter the company.', phoneNumber: 'Please enter the phone number.', residentIdMasked: 'Please enter the resident ID.', selectedPackageId: 'Please select today work.' } }
};

const languageOptions = [
  { code: 'ko', label: '한국어' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' }
];

const nationalityOptions = {
  ko: [
    { code: 'KR', label: '한국인' },
    { code: 'CN', label: '중국인' },
    { code: 'US', label: '미국인' },
    { code: 'VN', label: '베트남인' },
    { code: 'OTHER', label: '기타' }
  ],
  vi: [
    { code: 'KR', label: 'Người Hàn Quốc' },
    { code: 'CN', label: 'Người Trung Quốc' },
    { code: 'US', label: 'Người Mỹ' },
    { code: 'VN', label: 'Người Việt Nam' },
    { code: 'OTHER', label: 'Khác' }
  ],
  zh: [
    { code: 'KR', label: '韩国人' },
    { code: 'CN', label: '中国人' },
    { code: 'US', label: '美国人' },
    { code: 'VN', label: '越南人' },
    { code: 'OTHER', label: '其他' }
  ],
  en: [
    { code: 'KR', label: 'Korean' },
    { code: 'CN', label: 'Chinese' },
    { code: 'US', label: 'American' },
    { code: 'VN', label: 'Vietnamese' },
    { code: 'OTHER', label: 'Other' }
  ]
};

const ageOptions = ['20대', '30대', '40대', '50대', '60대'];

function workLabel(pkg, language) {
  const work = language === 'ko' ? pkg.workNameKo : pkg.workNameTranslations[language];
  const risk = language === 'ko' ? pkg.riskObjectKo : pkg.riskObjectTranslations[language];
  return `${pkg.workNameKo} / ${work} · ${pkg.riskObjectKo} / ${risk}`;
}

function formatResidentId(value) {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  const first = digits.slice(0, 6);
  const seventh = digits.slice(6, 7);
  const maskedTail = 'x'.repeat(Math.max(0, digits.length - 7));
  if (digits.length <= 6) return first;
  return `${first}-${seventh}${maskedTail}`;
}

function formatTime(value) {
  const safe = Math.max(0, value);
  const mm = String(Math.floor(safe / 60)).padStart(2, '0');
  const ss = String(safe % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function WorkerPage() {
  const [step, setStep] = useState('date');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [language, setLanguage] = useState('ko');
  const [packages, setPackages] = useState([]);
  const [workerName, setWorkerName] = useState('');
  const [nationality, setNationality] = useState('KR');
  const [ageGroup, setAgeGroup] = useState('30대');
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [residentIdMasked, setResidentIdMasked] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [submissionId, setSubmissionId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [remediationText, setRemediationText] = useState('');
  const [countdown, setCountdown] = useState(REMEDIATION_SECONDS);
  const [remediationDone, setRemediationDone] = useState(false);
  const [remediationOpen, setRemediationOpen] = useState(false);
  const [remediationStarted, setRemediationStarted] = useState(false);
  const [remediationRunning, setRemediationRunning] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [resumeReady, setResumeReady] = useState(false);
  const [finished, setFinished] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const onStopRef = useRef(null);
  const streamRef = useRef(null);
  const t = labels[language];
  const selectedPackage = useMemo(() => packages.find((v) => v.id === selectedPackageId) || null, [packages, selectedPackageId]);
  const nationalityList = nationalityOptions[language] || nationalityOptions.ko;

  useEffect(() => () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (!remediationOpen || !remediationRunning || remediationDone || countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [remediationOpen, remediationRunning, remediationDone, countdown]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && remediationOpen && !remediationDone) {
        setRemediationRunning(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [remediationOpen, remediationDone]);

  useEffect(() => {
    async function resumeFromQuery() {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('resume');
      if (!id) {
        setResumeReady(true);
        return;
      }
      try {
        const response = await fetch(`/api/worker-resume?id=${id}`);
        const data = await response.json();
        if (!response.ok || !data.submission) {
          setResumeReady(true);
          return;
        }
        const row = data.submission;
        setDate(row.date);
        setLanguage(row.language || 'ko');
        setWorkerName(row.workerName || '');
        setNationality('KR');
        setAgeGroup(row.ageGroup || '30대');
        setCompanyName(row.companyName || '');
        setPhoneNumber(row.phoneNumber || '');
        setResidentIdMasked(row.residentIdMasked || '');
        setTranscript(row.transcript || '');
        setAnalysis(row.analysis || null);
        setSubmissionId(row.id);
        setRemediationDone(Boolean(row.remediationCompleted));
        setRemediationStarted(Boolean(row.analysis && row.analysis.decision === 'supplement'));
        setRemediationRunning(false);
        await loadPackages(row.date, row.selectedPackageId);
        setSelectedPackageId(row.selectedPackageId || '');
        setStep('result');
      } finally {
        setResumeReady(true);
      }
    }
    resumeFromQuery();
  }, []);

  function getNationalityLabel() {
    return (nationalityList.find((item) => item.code === nationality) || nationalityList[0] || { label: nationality }).label;
  }

  function openModal(message) {
    setModalMessage(message);
  }

  function closeModal() {
    setModalMessage('');
  }

  function clearResumeQuery() {
    const url = new URL(window.location.href);
    url.searchParams.delete('resume');
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);
  }

  function leaveRemediation() {
    if (!remediationOpen) return;
    setRemediationOpen(false);
    setRemediationStarted(true);
    setRemediationRunning(false);
  }

  function goBack() {
    setError('');
    if (remediationOpen) {
      leaveRemediation();
      return;
    }
    if (step === 'language') setStep('date');
    else if (step === 'form') setStep('language');
    else if (step === 'result') setStep('form');
  }

  async function loadPackages(targetDate, preferredId = '') {
    const response = await fetch(`/api/daily-setup?date=${targetDate}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || t.loadError);
    setPackages(data.packages || []);
    setSelectedPackageId(preferredId || data.packages?.[0]?.id || '');
  }

  async function moveToForm() {
    setBusy(true);
    setError('');
    try {
      await loadPackages(date);
      setStep('form');
    } catch (e) {
      setError(e instanceof Error ? e.message : t.loadError);
    } finally {
      setBusy(false);
    }
  }

  async function startRecord() {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        if (onStopRef.current) onStopRef.current();
      };
      recorder.start();
    } catch {
      setError(t.micError);
      openModal(t.micError);
    }
  }

  async function stopRecord() {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    const audioBlobPromise = new Promise((resolve) => {
      onStopRef.current = () => resolve(new Blob(chunksRef.current, { type: 'audio/webm' }));
    });
    recorder.stop();
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    const audioBlob = await audioBlobPromise;
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'tbm.webm');
      formData.append('language', language);
      const response = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'stt error');
      setTranscript(data.text || t.sttFallback);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t.sttFallback;
      setError(msg);
      setTranscript((prev) => prev || t.sttFallback);
    } finally {
      setBusy(false);
      onStopRef.current = null;
    }
  }

  function validateFields() {
    const checks = [
      ['workerName', workerName],
      ['companyName', companyName],
      ['phoneNumber', phoneNumber],
      ['residentIdMasked', residentIdMasked],
      ['selectedPackageId', selectedPackageId]
    ];
    const missing = checks.find(([, value]) => !String(value || '').trim());
    if (missing) {
      const message = t.alerts[missing[0]] || t.noTranscript;
      setError(message);
      openModal(message);
      return false;
    }
    if (!transcript.trim()) {
      setError(t.noTranscript);
      openModal(t.noTranscript);
      return false;
    }
    return true;
  }

  async function submitAll() {
    if (!validateFields()) return;
    setBusy(true);
    setError('');
    try {
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: selectedPackageId, transcript, language })
      });
      const analyzeData = await analyzeResponse.json();
      if (!analyzeResponse.ok) throw new Error(analyzeData.error || 'analyze error');
      const saveResponse = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          workerName,
          nationality: getNationalityLabel(),
          ageGroup,
          companyName,
          phoneNumber,
          residentIdMasked,
          language,
          selectedPackageId,
          transcript,
          analysis: analyzeData.analysis
        })
      });
      const saveData = await saveResponse.json();
      if (!saveResponse.ok) throw new Error(saveData.error || 'save error');
      const newId = saveData.submission.id;
      const url = new URL(window.location.href);
      url.searchParams.set('resume', newId);
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
      setAnalysis(analyzeData.analysis);
      setSubmissionId(newId);
      setRemediationOpen(false);
      setRemediationStarted(false);
      setRemediationDone(false);
      setRemediationRunning(false);
      setCountdown(REMEDIATION_SECONDS);
      setStep('result');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'submit error';
      setError(msg);
      openModal(msg);
    } finally {
      setBusy(false);
    }
  }

  async function openRemediation(reset = true) {
    if (!selectedPackage || !analysis) return;
    setRemediationStarted(true);
    setRemediationDone(false);
    setRemediationOpen(true);
    if (reset) {
      setCountdown(REMEDIATION_SECONDS);
      setRemediationRunning(true);
    } else {
      setRemediationRunning(false);
    }
    const response = await fetch('/api/remediation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: selectedPackage.id, transcript, language, missingItems: analysis.missingItems })
    });
    const data = await response.json();
    setRemediationText(data.text || t.remediationFallback);
  }

  function startRemediationTimer() {
    if (remediationDone || countdown <= 0) return;
    setRemediationRunning(true);
  }

  async function markRemediationComplete() {
    if (!submissionId || countdown > 0) return;
    const response = await fetch('/api/submissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: submissionId, remediationCompleted: true, remediationViewedSeconds: REMEDIATION_SECONDS })
    });
    if (response.ok) {
      setRemediationDone(true);
      setRemediationOpen(false);
      setFinished(true);
      clearResumeQuery();
    }
  }

  function renderHeader(title, allowBack = false, customBack) {
    return (
      <div className="topbar">
        {allowBack ? <button className="btn btn-ghost" type="button" onClick={customBack || goBack}>{t.back}</button> : <div className="topbar-spacer" />}
        <h1>{title}</h1>
        <div className="topbar-spacer" />
      </div>
    );
  }

  if (!resumeReady) {
    return <main className="worker-shell"><section className="mobile-card step-card"><div className="helper-text">Loading...</div></section></main>;
  }


if (finished) {
  return (
    <main className="worker-shell">
      <section className="mobile-card step-card">
        <div className="topbar"><div className="topbar-spacer" /><h1>{t.ok}</h1><div className="topbar-spacer" /></div>
        <div className="result-box pass">
          <p>{t.finalThanks}</p>
        </div>
        <button className="btn btn-primary full" type="button" onClick={() => window.location.href = '/'}>{t.ok}</button>
      </section>
    </main>
  );
}

  if (remediationOpen && analysis) {
    const lines = (remediationText || t.remediationFallback).split(/\n+/).filter(Boolean);
    const visibleItems = analysis.missingItems && analysis.missingItems.length ? analysis.missingItems : lines.slice(0, 2);
    return (
      <main className="worker-shell">
        <section className="remediation-screen">
          <div className="remediation-head">
            <button className="btn btn-ghost" type="button" onClick={leaveRemediation}>{t.back}</button>
            <div className="remediation-title">{t.remediationTitle}</div>
          </div>
          <div className="remediation-label">{t.remediationNeed}</div>
          <div className="remediation-list">
            {visibleItems.map((item, idx) => <div key={`${item}-${idx}`} className="warning-item">▷ {item}</div>)}
          </div>
          <div className="timer-panel">
            <div className="timer-caption">{t.remain}</div>
            <div className="timer-number">{formatTime(countdown)}</div>
          </div>
          <div className="remediation-actions">
            {!remediationRunning && countdown > 0 ? (
              <button className="btn btn-secondary full" type="button" onClick={startRemediationTimer}>{t.reenter}</button>
            ) : null}
            <button className={`btn full ${countdown > 0 ? 'btn-disabled' : 'btn-primary'}`} type="button" disabled={countdown > 0} onClick={markRemediationComplete}>{t.complete}</button>
          </div>
          <div className="small-note">{t.wait} {t.exitRemediation}</div>
        </section>
        {modalMessage ? (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-title">{t.modalTitle}</div>
              <div className="modal-body">{modalMessage}</div>
              <button className="btn btn-primary full" type="button" onClick={closeModal}>{t.ok}</button>
            </div>
          </div>
        ) : null}
      </main>
    );
  }

  return (
    <main className="worker-shell">
      {step === 'date' && (
        <section className="mobile-card step-card">
          {renderHeader(t.dateTitle, true, () => window.location.href = '/')}
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          {error ? <div className="error-box">{error}</div> : null}
          <button className="btn btn-primary full" type="button" onClick={() => setStep('language')}>{t.next}</button>
        </section>
      )}

      {step === 'language' && (
        <section className="mobile-card step-card">
          {renderHeader(t.languageTitle, true)}
          <div className="language-grid">
            {languageOptions.map((item) => (
              <button key={item.code} className={`lang-btn ${language === item.code ? 'active' : ''}`} type="button" onClick={() => setLanguage(item.code)}>
                {item.label}
              </button>
            ))}
          </div>
          {error ? <div className="error-box">{error}</div> : null}
          <button className="btn btn-primary full" type="button" onClick={moveToForm}>{busy ? t.loading : t.next}</button>
        </section>
      )}

      {step === 'form' && (
        <section className="mobile-card form-card">
          {renderHeader(t.work, true)}
          <div className="group">
            <label>{t.name}<input value={workerName} onChange={(e) => setWorkerName(e.target.value)} /></label>
            <label>{t.nationality}<select value={nationality} onChange={(e) => setNationality(e.target.value)}>{nationalityList.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label>
            <label>{t.age}<select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>{ageOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>{t.company}<input value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></label>
            <label>{t.phone}<input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} /></label>
            <label>{t.resident}<input value={residentIdMasked} onChange={(e) => setResidentIdMasked(formatResidentId(e.target.value))} placeholder="123456-1xxxxxx" maxLength={14} /></label>
            <div className="helper-text">{t.residentGuide}</div>
          </div>

          <div className="group">
            <div className="section-title">{t.work}</div>
            <select value={selectedPackageId} onChange={(e) => setSelectedPackageId(e.target.value)}>
              {packages.map((pkg) => <option key={pkg.id} value={pkg.id}>{workLabel(pkg, language)}</option>)}
            </select>
          </div>

          <div className="group">
            <div className="section-title">{t.voiceGuide}</div>
            <div className="helper-text">{t.voiceExample}</div>
            <div className="example-grid">
              {t.examples.map((item) => <div key={item} className="example-chip">{item}</div>)}
            </div>
            <div className="record-row">
              <button className="btn btn-secondary" type="button" onClick={startRecord}>{t.record}</button>
              <button className="btn btn-secondary" type="button" onClick={stopRecord}>{t.stop}</button>
            </div>
          </div>

          <div className="group">
            <div className="section-title">{t.transcript}</div>
            <textarea rows={8} value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder={t.sttFallback} />
          </div>

          {error ? <div className="error-box">{error}</div> : null}
          <button className="btn btn-primary full" type="button" onClick={submitAll}>{busy ? t.loading : t.submit}</button>
        </section>
      )}

      {step === 'result' && analysis && (
        <section className="mobile-card step-card">
          {renderHeader(analysis.decision === 'pass' ? t.pass : t.supplement, true)}
          <div className={`result-box ${analysis.decision}`}>
            <p>{analysis.summary}</p>
            <div className="score-box">Score {analysis.score}</div>
          </div>
          {analysis.decision === 'pass' ? (
            <button className="btn btn-primary full" type="button" onClick={() => { setFinished(true); clearResumeQuery(); }}>{t.finish}</button>
          ) : (
            <>
              <button className="btn btn-primary full" type="button" onClick={() => openRemediation(!remediationStarted)}>{remediationStarted ? t.reenter : t.remediation}</button>
              {remediationDone ? <div className="helper-text">{t.done}</div> : <div className="small-note">{t.exitRemediation}</div>}
            </>
          )}
        </section>
      )}

      {modalMessage ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-title">{t.modalTitle}</div>
            <div className="modal-body">{modalMessage}</div>
            <button className="btn btn-primary full" type="button" onClick={closeModal}>{t.ok}</button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
