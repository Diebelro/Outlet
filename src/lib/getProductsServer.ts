/**
 * Citire produse direct în Server Component: MongoDB, apoi 3001, apoi fișier data/products.json.
 */

import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import path from 'path';
import fs from 'fs';

const FALLBACK_URL = 'http://localhost:3001';

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

export interface ProductItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image?: string;
  sizes?: string[];
  stock?: number;
}

function readFromJsonFile(): ProductItem[] {
  try {
    const jsonPath = path.resolve(process.cwd(), 'data', 'products.json');
    if (!fs.existsSync(jsonPath)) return [];
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) return [];
    return arr.map((p: ExpressProduct) => ({
      _id: String(p.id),
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.mainCategory ? `${p.mainCategory}${p.subCategory ? ' / ' + p.subCategory : ''}` : p.subCategory,
      image: p.image?.startsWith('http') ? p.image : p.image || undefined,
      sizes: p.sizes,
    }));
  } catch (_) {
    return [];
  }
}

export async function getProductsServer(): Promise<ProductItem[]> {
  const fromFile = readFromJsonFile();
  if (fromFile.length > 0) return fromFile;
  try {
    await connectDB();
    const list = await Product.find().sort({ createdAt: -1 }).lean();
    const fromMongo: ProductItem[] = list.map((p) => ({
      _id: String(p._id),
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
      sizes: p.sizes,
      stock: p.stock,
    }));
    if (fromMongo.length > 0) return fromMongo;
  } catch (_) {}
  try {
    const res = await fetch(`${FALLBACK_URL}/api/products`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      if (arr.length > 0) {
        return arr.map((p: ExpressProduct) => ({
          _id: String(p.id),
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.mainCategory ? `${p.mainCategory}${p.subCategory ? ' / ' + p.subCategory : ''}` : p.subCategory,
          image: p.image?.startsWith('http') ? p.image : p.image || undefined,
          sizes: p.sizes,
        }));
      }
    }
  } catch (_) {}
  return fromFile;
}

export async function getProductByIdServer(id: string): Promise<ProductItem | null> {
  try {
    await connectDB();
    const p = await Product.findById(id).lean();
    if (p && p._id) {
      return {
        _id: String(p._id),
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        image: p.image,
        sizes: p.sizes,
        stock: p.stock,
      };
    }
  } catch (_) {}
  try {
    const res = await fetch(`${FALLBACK_URL}/api/products`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    const arr = Array.isArray(data) ? data : [];
    const p = arr.find((x: ExpressProduct) => String(x.id) === id);
    if (!p) return null;
    return {
      _id: String(p.id),
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.mainCategory ? `${p.mainCategory}${p.subCategory ? ' / ' + p.subCategory : ''}` : p.subCategory,
      image: p.image?.startsWith('http') ? p.image : p.image || undefined,
      sizes: p.sizes,
    };
  } catch (_) {}
  try {
    const jsonPath = path.resolve(process.cwd(), 'data', 'products.json');
    if (!fs.existsSync(jsonPath)) return null;
    const arr = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const p = Array.isArray(arr) ? arr.find((x: ExpressProduct) => String(x.id) === id) : null;
    if (p) {
      return {
        _id: String(p.id),
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.mainCategory ? `${p.mainCategory}${p.subCategory ? ' / ' + p.subCategory : ''}` : p.subCategory,
        image: p.image?.startsWith('http') ? p.image : p.image || undefined,
        sizes: p.sizes,
      };
    }
  } catch (_) {}
  return null;
}
