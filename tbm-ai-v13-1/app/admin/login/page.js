'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [id, setId] = useState('admin');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');
  const router = useRouter();

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password })
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error || 'login error');
    router.push('/admin/dashboard');
  }

  return (
    <main className="admin-shell">
      <form className="admin-card step-card" onSubmit={onSubmit}>
        <h1>관리자 로그인</h1>
        <label>ID<input value={id} onChange={(e) => setId(e.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error ? <div className="error-box">{error}</div> : null}
        <button className="btn btn-primary full">로그인</button>
      </form>
    </main>
  );
}
