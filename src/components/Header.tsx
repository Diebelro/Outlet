import Link from 'next/link';

export default function Header() {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(250, 249, 246, 0.95)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 600,
            fontStyle: 'italic',
            color: 'var(--text)',
          }}
        >
          Diebel
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/">Acasă</Link>
          <Link href="/produse">Produse</Link>
        </nav>
      </div>
    </header>
  );
}
