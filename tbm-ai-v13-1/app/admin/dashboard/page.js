'use client';

import { useEffect, useMemo, useState } from 'react';

const tabs = [
  { key: 'map', label: 'Understanding 맵' },
  { key: 'setting', label: '작업 세팅' },
  { key: 'status', label: '이수현황' },
  { key: 'report', label: 'TBM 작성일지' }
];

export default function AdminDashboardPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [activeTab, setActiveTab] = useState('setting');
  const [library, setLibrary] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [openRows, setOpenRows] = useState([]);
  const [statusCategory, setStatusCategory] = useState('all');
  const [statusPackage, setStatusPackage] = useState('all');
  const [reportLoading, setReportLoading] = useState(false);

  const categories = useMemo(() => [...new Set(library.map((v) => v.category))], [library]);
  const filteredLibrary = useMemo(() => library.filter((v) => v.category === selectedCategory), [library, selectedCategory]);
  const pkgMap = useMemo(() => Object.fromEntries(library.map((v) => [v.id, v])), [library]);

  const statusPackages = useMemo(() => {
    if (statusCategory === 'all') return library;
    return library.filter((item) => item.category === statusCategory);
  }, [library, statusCategory]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      const pkg = pkgMap[item.selectedPackageId];
      if (!pkg) return statusCategory === 'all' && statusPackage === 'all';
      const categoryOk = statusCategory === 'all' || pkg.category === statusCategory;
      const packageOk = statusPackage === 'all' || item.selectedPackageId === statusPackage;
      return categoryOk && packageOk;
    });
  }, [submissions, pkgMap, statusCategory, statusPackage]);

  async function loadAll() {
    const [a, b, c] = await Promise.all([
      fetch('/api/library'),
      fetch(`/api/daily-setup?date=${date}`),
      fetch(`/api/submissions?date=${date}`)
    ]);
    const ad = await a.json();
    const bd = await b.json();
    const cd = await c.json();
    const nextLibrary = ad.library || [];
    setLibrary(nextLibrary);
    setSelectedIds((bd.packages || []).map((v) => v.id));
    setSubmissions(cd.submissions || []);
    setOpenRows([]);
    if (!selectedCategory && nextLibrary.length) setSelectedCategory(nextLibrary[0].category);
  }

  useEffect(() => { loadAll(); }, [date]);

  useEffect(() => {
    if (!categories.includes(selectedCategory) && categories.length) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (statusCategory !== 'all' && !categories.includes(statusCategory)) {
      setStatusCategory('all');
    }
  }, [categories, statusCategory]);

  useEffect(() => {
    const validIds = new Set(statusPackages.map((item) => item.id));
    if (statusPackage !== 'all' && !validIds.has(statusPackage)) {
      setStatusPackage('all');
    }
  }, [statusPackages, statusPackage]);

  function togglePackage(id) {
    setSelectedIds((current) => current.includes(id) ? current.filter((v) => v !== id) : [...current, id]);
  }

  function toggleRow(id) {
    setOpenRows((current) => current.includes(id) ? current.filter((v) => v !== id) : [...current, id]);
  }

  async function saveSetup() {
    await fetch('/api/daily-setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, packageIds: selectedIds })
    });
    await loadAll();
    setActiveTab('status');
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  function goHome() {
    window.location.href = '/';
  }

  async function handleReportDownload() {
    try {
      setReportLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1400));
      const response = await fetch('/tbm-write-log-demo.pdf');
      if (!response.ok) throw new Error('download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tbm-write-log-demo.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('PDF 다운로드에 실패했습니다.');
    } finally {
      setReportLoading(false);
    }
  }

  function renderMapPage() {
    return (
      <section className="dashboard-card step-card">
        <div className="section-title">Understanding 맵</div>
        <div className="map-placeholder">
          <div className="map-badge">Page 1</div>
          <div className="map-grid">
            <div className="map-node">대분류 구조</div>
            <div className="map-node">공정 관계</div>
            <div className="map-node">기인물 연결</div>
            <div className="map-node">이해도 시각화</div>
          </div>
        </div>
      </section>
    );
  }

  function renderSettingPage() {
    return (
      <section className="dashboard-card step-card">
        <div className="section-title">작업 세팅</div>
        <div className="setting-layout">
          <div className="setting-column">
            <div className="pane-title">대분류 선택</div>
            <div className="tile-list tall">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`select-tile ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <span className="tile-main">{category}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="setting-column wide">
            <div className="pane-head">
              <div className="pane-title">중분류 + 기인물</div>
              <label className="mini-date">
                <span>날짜</span>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
            </div>
            <div className="tile-list">
              {filteredLibrary.map((item) => (
                <button
                  key={item.id}
                  className={`select-tile pair ${selectedIds.includes(item.id) ? 'active' : ''}`}
                  onClick={() => togglePackage(item.id)}
                >
                  <span className="tile-main">{item.workNameKo}</span>
                  <span className="tile-sub">{item.riskObjectKo}</span>
                </button>
              ))}
            </div>
            <div className="selection-strip">
              <span>선택 수</span>
              <strong>{selectedIds.length}</strong>
            </div>
            <button className="btn btn-primary full" onClick={saveSetup}>작업 세팅 저장</button>
          </div>
        </div>
      </section>
    );
  }

  function renderStatusPage() {
    return (
      <section className="dashboard-card step-card">
        <div className="status-head">
          <div>
            <div className="section-title">이수현황</div>
          </div>
          <label className="mini-date">
            <span>날짜</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>

        <div className="status-filters">
          <label className="filter-box">
            <span>대분류 선택</span>
            <select value={statusCategory} onChange={(e) => { setStatusCategory(e.target.value); setStatusPackage('all'); }}>
              <option value="all">전체</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="filter-box">
            <span>중분류 / 기인물 선택</span>
            <select value={statusPackage} onChange={(e) => setStatusPackage(e.target.value)}>
              <option value="all">전체</option>
              {statusPackages.map((item) => (
                <option key={item.id} value={item.id}>{item.workNameKo} / {item.riskObjectKo}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="status-table-wrap">
          <div className="status-table status-table-head">
            <div>이름</div>
            <div>국적</div>
            <div>나이대</div>
            <div>결과</div>
            <div>최종상태</div>
          </div>

          {filteredSubmissions.map((item) => {
            const opened = openRows.includes(item.id);
            const pkg = pkgMap[item.selectedPackageId] || null;
            const passed = item.analysis?.decision === 'pass';
            return (
              <div key={item.id} className={`status-row-card ${opened ? 'open' : ''}`}>
                <button className="status-table status-row" onClick={() => toggleRow(item.id)}>
                  <div>{item.workerName}</div>
                  <div>{item.nationality}</div>
                  <div>{item.ageGroup}</div>
                  <div>
                    <span className={`result-chip ${passed ? 'pass' : 'supplement'}`}>
                      <strong>{passed ? 'O' : 'X'}</strong>
                      <span>{passed ? '적합' : '보안교육 필요'}</span>
                    </span>
                  </div>
                  <div>
                    <span className={`result-chip ${item.remediationCompleted ? 'pass' : 'supplement'}`}>
                      <strong>{item.remediationCompleted ? 'O' : 'X'}</strong>
                      <span>{item.remediationCompleted ? '이수완료' : '미이수'}</span>
                    </span>
                  </div>
                </button>

                {opened ? (
                  <div className="status-detail">
                    <div className="status-detail-grid">
                      <div><strong>이름</strong><span>{item.workerName}</span></div>
                      <div><strong>국적</strong><span>{item.nationality}</span></div>
                      <div><strong>나이대</strong><span>{item.ageGroup}</span></div>
                      <div><strong>작업명</strong><span>{pkg?.workNameKo || '-'}</span></div>
                      <div><strong>기인물</strong><span>{pkg?.riskObjectKo || '-'}</span></div>
                      <div><strong>결과정보</strong><span className={passed ? 'status-text-pass' : 'status-text-supplement'}>{passed ? '적합' : '보안교육 필요'}</span></div>
                      <div><strong>최종상태</strong><span className={item.remediationCompleted ? 'status-text-pass' : 'status-text-supplement'}>{item.remediationCompleted ? '이수완료' : '미이수'}</span></div>
                      <div><strong>점수</strong><span>{item.analysis?.score ?? '-'}</span></div>
                    </div>
                    <div className="summary-box">{item.analysis?.summary || '-'}</div>
                    <div className="transcript-box">{item.transcript || '-'}</div>
                  </div>
                ) : null}
              </div>
            );
          })}

          {!filteredSubmissions.length ? (
            <div className="empty-status">선택한 조건에 해당하는 이수현황이 없습니다.</div>
          ) : null}
        </div>
      </section>
    );
  }

  function renderReportPage() {
    return (
      <section className="dashboard-card step-card">
        <div className="section-title">TBM 작성일지</div>
        <div className="report-demo-box">
          <div className="map-badge">Demo</div>
          <button className="btn btn-primary" type="button" onClick={handleReportDownload}>TBM 작성일지 생성</button>
        </div>
        {reportLoading ? (
          <div className="modal-backdrop">
            <div className="modal-card loading-card">
              <div className="loading-spinner" />
              <strong>TBM 작성일지 생성 중입니다</strong>
              <p>잠시만 기다려 주세요.</p>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <main className="dashboard-shell admin-v7-shell">
      <section className="dashboard-card step-card admin-v7-top">
        <div className="dashboard-top">
          <div>
            <h1>관리자</h1>
          </div>
          <div className="top-actions">
            <button className="btn btn-ghost" onClick={goHome}>뒤로가기</button>
            <button className="btn btn-secondary" onClick={loadAll}>새로고침</button>
            <button className="btn btn-secondary" onClick={logout}>로그아웃</button>
          </div>
        </div>
        <div className="admin-tabbar admin-tabbar-four">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === 'map' ? renderMapPage() : null}
      {activeTab === 'setting' ? renderSettingPage() : null}
      {activeTab === 'status' ? renderStatusPage() : null}
      {activeTab === 'report' ? renderReportPage() : null}
    </main>
  );
}
