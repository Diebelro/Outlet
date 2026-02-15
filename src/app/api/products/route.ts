import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getAdminSession } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    const serialized = products.map((p) => ({
      ...p,
      _id: p._id?.toString(),
    }));
    return NextResponse.json(serialized);
  } catch (err) {
    console.error('GET /api/products:', err);
    const msg = err instanceof Error ? err.message : 'Eroare la încărcarea produselor';
    return NextResponse.json(
      { error: msg, details: process.env.NODE_ENV === 'development' ? String(err) : undefined },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, price, category, stock, sizes, image, imagePublicId } = body;
    if (!name || description == null || price == null || !category || stock == null) {
      return NextResponse.json(
        { error: 'Lipsesc câmpuri obligatorii: nume, descriere, preț, categorie, stoc' },
        { status: 400 }
      );
    }

    await connectDB();
    const product = await Product.create({
      name: name.trim(),
      description: String(description),
      price: Number(price),
      category: String(category).trim(),
      stock: Number(stock),
      sizes: Array.isArray(sizes) ? sizes : [],
      image: image || '',
      imagePublicId: imagePublicId || '',
    });

    return NextResponse.json({
      ...product.toObject(),
      _id: product._id.toString(),
    });
  } catch (err) {
    console.error('POST /api/products:', err);
    return NextResponse.json({ error: 'Eroare la crearea produsului' }, { status: 500 });
  }
}
