import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { getProductsServer } from '@/lib/getProductsServer';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let products = await getProductsServer();
  const featured = products.slice(0, 8);

  return (
    <>
      <Header />
      <main>
        <section
          style={{
            padding: '4rem 0',
            textAlign: 'center',
            background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-card) 100%)',
          }}
        >
          <div className="container">
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}
            >
              Haine & Încălțăminte
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
              Geci, pantaloni, tricouri, adidași — tot ce ai nevoie
            </p>
          </div>
        </section>

        <section style={{ padding: '2rem 0 4rem' }}>
          <div className="container">
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.75rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
              }}
            >
              Produse recente
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {featured.map((p: { _id: string; name: string; price: number; image?: string; category?: string }) => (
                <ProductCard key={p._id} {...p} />
              ))}
            </div>
            {featured.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                Nu există produse încă. Adaugă produse din panoul de administrare (<a href="/admin">/admin</a>).
              </p>
            )}
            {products.length > 8 && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <a href="/produse" className="btn btn-primary">
                  Vezi toate produsele
                </a>
              </div>
            )}
          </div>
        </section>
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
