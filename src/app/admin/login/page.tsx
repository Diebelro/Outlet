'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/setup')
      .then((r) => r.json())
      .then((d) => setNeedsSetup(d.needsSetup))
      .catch(() => setNeedsSetup(true));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const url = needsSetup ? '/api/auth/setup' : '/api/auth/login';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Eroare la autentificare');
      return;
    }
    router.push('/admin');
    router.refresh();
  };

  if (needsSetup === null) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Se încarcă...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: '0 auto',
        padding: '2rem',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
        {needsSetup ? 'Creare cont administrator' : 'Autentificare admin'}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        {needsSetup
          ? 'Este prima rulare. Creează contul de administrator.'
          : 'Introdu email și parola.'}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{needsSetup ? 'Email sau nume utilizator' : 'Email'}</label>
          <input
            type={needsSetup ? 'text' : 'email'}
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            placeholder={needsSetup ? 'ex: admin' : ''}
          />
        </div>
        <div className="form-group">
          <label>Parolă {needsSetup && '(min. 6 caractere)'}</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={needsSetup ? 6 : 1}
            autoComplete={needsSetup ? 'new-password' : 'current-password'}
          />
        </div>
        {error && (
          <p style={{ color: '#c00', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>
        )}
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Se procesează...' : needsSetup ? 'Creează cont' : 'Autentificare'}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Înapoi la magazin
        </Link>
      </p>
    </div>
  );
}
