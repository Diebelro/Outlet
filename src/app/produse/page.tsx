import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { getProductsServer } from '@/lib/getProductsServer';

export const dynamic = 'force-dynamic';

export default async function ProdusePage() {
  const products = await getProductsServer();

  return (
    <>
      <Header />
      <main style={{ padding: '2rem 0 4rem' }}>
        <div className="container">
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
            }}
          >
            Toate produsele
          </h1>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {products.map((p: { _id: string; name: string; price: number; image?: string; category?: string }) => (
              <ProductCard key={p._id} {...p} />
            ))}
          </div>
            {products.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>
              Nu există produse.
            </p>
          )}
        </div>
      </main>
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
        }}
      >
        <div className="container">© 2026 Diebel. Toate drepturile rezervate. Profi.</div>
      </footer>
    </>
  );
}
