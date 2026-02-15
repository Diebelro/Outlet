import Header from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductByIdServer } from '@/lib/getProductsServer';

export default async function ProdusDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductByIdServer(id);
  if (!product) notFound();

  return (
    <>
      <Header />
      <main style={{ padding: '2rem 0 4rem' }}>
        <div className="container">
          <Link
            href="/produse"
            style={{
              display: 'inline-block',
              marginBottom: '1.5rem',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}
          >
            ← Înapoi la produse
          </Link>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '3rem',
              alignItems: 'start',
            }}
            className="product-detail-grid"
          >
            <div
              style={{
                position: 'relative',
                aspectRatio: '1',
                background: 'var(--bg)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
              }}
            >
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  Fără imagine
                </div>
              )}
            </div>

            <div>
              {product.category && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {product.category}
                </span>
              )}
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem',
                  fontWeight: 600,
                  marginTop: '0.25rem',
                  marginBottom: '1rem',
                }}
              >
                {product.name}
              </h1>
              <p style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '1rem' }}>
                {product.price} lei
              </p>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                {product.description}
              </p>
              {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Mărimi disponibile:</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {product.sizes.map((s: string) => (
                      <span
                        key={s}
                        style={{
                          padding: '0.35rem 0.75rem',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.9rem',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {product.stock != null && (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Stoc: {product.stock} bucăți
                </p>
              )}
            </div>
          </div>
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
