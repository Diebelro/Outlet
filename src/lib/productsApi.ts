/**
 * Citește produsele fie din API-ul Next.js (MongoDB), fie de pe serverul Express (server.js)
 * Setează în .env.local: EXTERNAL_PRODUCTS_API_URL=http://localhost:3001
 * pentru a folosi server.js ca backend.
 */

const EXTERNAL_BASE = process.env.EXTERNAL_PRODUCTS_API_URL || process.env.NEXT_PUBLIC_EXTERNAL_PRODUCTS_API_URL;
const INTERNAL_BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface ExpressProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  mainCategory: string;
  subCategory: string;
  image: string;
  sizes?: string[];
}

export interface ApiProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image?: string;
  sizes?: string[];
  stock?: number;
}

function normalizeFromExpress(p: ExpressProduct, baseUrl: string): ApiProduct {
  const imageUrl = p.image?.startsWith('http') ? p.image : `${baseUrl}${p.image?.startsWith('/') ? '' : '/'}${p.image || ''}`;
  return {
    _id: String(p.id),
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.mainCategory ? `${p.mainCategory}${p.subCategory ? ' / ' + p.subCategory : ''}` : p.subCategory,
    image: imageUrl || undefined,
    sizes: p.sizes,
  };
}

const FALLBACK_3001 = 'http://localhost:3001';

async function fetchFromExpress(baseUrl: string): Promise<ApiProduct[]> {
  const res = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  const list = Array.isArray(data) ? data : [];
  return list.map((p: ExpressProduct) => normalizeFromExpress(p, baseUrl));
}

export async function fetchProducts(): Promise<ApiProduct[]> {
  if (EXTERNAL_BASE) {
    try {
      return await fetchFromExpress(EXTERNAL_BASE);
    } catch (e) {
      console.warn('External products API failed, falling back to internal:', e);
    }
  }
  let fromMongo: ApiProduct[] = [];
  try {
    const res = await fetch(`${INTERNAL_BASE}/api/products`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      fromMongo = Array.isArray(data) ? data : [];
      if (fromMongo.length > 0) return fromMongo;
    }
  } catch (e) {
    console.warn('MongoDB/products failed, trying 3001:', e);
  }
  try {
    const from3001 = await fetchFromExpress(FALLBACK_3001);
    if (from3001.length > 0) return from3001;
  } catch (_) {}
  return fromMongo;
}

export async function fetchProductById(id: string): Promise<ApiProduct | null> {
  const tryInternal = async () => {
    const res = await fetch(`${INTERNAL_BASE}/api/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  };
  const tryExpress = async (base: string) => {
    const res = await fetch(`${base}/api/products`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    const p = list.find((x: ExpressProduct) => String(x.id) === id);
    return p ? normalizeFromExpress(p, base) : null;
  };
  if (EXTERNAL_BASE) {
    const fromExt = await tryExpress(EXTERNAL_BASE);
    if (fromExt) return fromExt;
  }
  const fromInternal = await tryInternal();
  if (fromInternal) return fromInternal;
  return tryExpress(FALLBACK_3001);
}
