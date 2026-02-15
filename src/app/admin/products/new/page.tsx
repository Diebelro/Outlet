import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth';
import ProductForm from '@/components/admin/ProductForm';

export default async function NewProductPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  return (
    <div>
      <Link
        href="/admin/products"
        style={{
          display: 'inline-block',
          marginBottom: '1rem',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
        }}
      >
        ← Înapoi la produse
      </Link>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '1.5rem' }}>
        Adaugă produs nou
      </h1>
      <ProductForm />
    </div>
  );
}
