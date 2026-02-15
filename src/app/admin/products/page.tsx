import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getAdminSession } from '@/lib/auth';
import DeleteProductButton from '@/components/admin/DeleteProductButton';

async function getProducts() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/products`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminProductsPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  const products = await getProducts();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>
          Produse
        </h1>
        <Link href="/admin/products/new" className="btn btn-primary">
          Adaugă produs
        </Link>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
              <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Imagine</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Nume</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Preț</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Categorie</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600 }}>Stoc</th>
              <th style={{ textAlign: 'right', padding: '1rem', fontWeight: 600 }}>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: { _id: string; name: string; price: number; image?: string; category: string; stock: number }) => (
              <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>
                  {p.image ? (
                    <div style={{ position: 'relative', width: 56, height: 56, borderRadius: 4, overflow: 'hidden', background: 'var(--bg)' }}>
                      <Image src={p.image} alt="" fill style={{ objectFit: 'cover' }} width={56} height={56} />
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: '1rem' }}>{p.price} lei</td>
                <td style={{ padding: '1rem' }}>{p.category}</td>
                <td style={{ padding: '1rem' }}>{p.stock}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <Link
                    href={`/admin/products/${p._id}/edit`}
                    className="btn btn-ghost"
                    style={{ marginRight: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                  >
                    Editează
                  </Link>
                  <DeleteProductButton productId={p._id} productName={p.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nu există produse. <Link href="/admin/products/new" style={{ color: 'var(--accent)' }}>Adaugă primul produs</Link>.
          </p>
        )}
      </div>
    </div>
  );
}

