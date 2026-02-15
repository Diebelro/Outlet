import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth';
import ProductForm from '@/components/admin/ProductForm';

async function getProduct(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/products/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const initial = {
    name: product.name,
    description: product.description,
    price: String(product.price),
    category: product.category,
    stock: String(product.stock),
    sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
    image: product.image,
    imagePublicId: product.imagePublicId,
  };

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
        Editează: {product.name}
      </h1>
      <ProductForm initial={initial} productId={id} />
    </div>
  );
}
