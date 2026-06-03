import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="entry-wrap">
      <div className="entry-card">
        <h1>TBM AI</h1>
        <div className="entry-actions">
          <Link href="/worker" className="btn btn-primary">근로자</Link>
          <Link href="/admin/login" className="btn btn-secondary">관리자</Link>
        </div>
      </div>
    </main>
  );
}
