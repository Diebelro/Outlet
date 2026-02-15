import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth';

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1rem' }}>
        Dashboard
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Autentificat ca <strong>{session.email}</strong>
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <Link href="/admin/products" className="btn btn-primary">
          Gestionează produse
        </Link>
        <Link href="/admin/products/new" className="btn btn-primary">
          Adaugă produs nou
        </Link>
      </div>
    </div>
  );
}
