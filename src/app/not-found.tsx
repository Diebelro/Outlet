import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'var(--font-body)',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Pagina nu există (404)</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Asigură-te că folosești adresa corectă și că serverul rulează cu <code>npm run dev</code>.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" className="btn btn-primary">Acasă</Link>
        <Link href="/produse" className="btn btn-ghost">Produse</Link>
        <Link href="/admin" className="btn btn-ghost">Admin</Link>
        <Link href="/admin/login" className="btn btn-ghost">Admin – Login</Link>
      </div>
      <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Adresa corectă: <strong>http://localhost:3000</strong>
      </p>
    </div>
  );
}
