'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <>
      <Link href="/admin" style={{ color: 'var(--text)', fontWeight: 500 }}>
        Dashboard
      </Link>
      <Link href="/admin/products" style={{ color: 'var(--text)', fontWeight: 500 }}>
        Produse
      </Link>
      <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Înapoi la magazin
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        Deconectare
      </button>
    </>
  );
}
