import Link from 'next/link';
import Image from 'next/image';

export interface ProductCardProps {
  _id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

export default function ProductCard({ _id, name, price, image, category }: ProductCardProps) {
  return (
    <Link
      href={`/produse/${_id}`}
      style={{
        display: 'block',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      className="product-card"
    >
      <div style={{ position: 'relative', aspectRatio: '1', background: 'var(--bg)' }}>
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: 'cover' }}
            unoptimized={image.startsWith('/uploads')}
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
              fontSize: '0.9rem',
            }}
          >
            Fără imagine
          </div>
        )}
      </div>
      <div style={{ padding: '1rem' }}>
        {category && (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {category}
          </span>
        )}
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.15rem',
            fontWeight: 600,
            marginTop: '0.25rem',
            marginBottom: '0.5rem',
          }}
        >
          {name}
        </h3>
        <p style={{ fontWeight: 600, color: 'var(--accent)' }}>{price} lei</p>
      </div>
    </Link>
  );
}
