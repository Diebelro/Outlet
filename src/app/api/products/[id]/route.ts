import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getAdminSession } from '@/lib/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import mongoose from 'mongoose';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'ID invalid' }, { status: 400 });
  }

  try {
    await connectDB();
    const product = await Product.findById(id).lean() as { _id?: mongoose.Types.ObjectId; [k: string]: unknown } | null;
    if (!product || !product._id) {
      return NextResponse.json({ error: 'Produs negăsit' }, { status: 404 });
    }
    return NextResponse.json({
      ...product,
      _id: product._id.toString(),
    });
  } catch (err) {
    console.error('GET /api/products/[id]:', err);
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 });
  }

  const { id } = await params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'ID invalid' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, description, price, category, stock, sizes, image, imagePublicId } = body;
    await connectDB();

    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = String(name).trim();
    if (description !== undefined) update.description = String(description);
    if (price !== undefined) update.price = Number(price);
    if (category !== undefined) update.category = String(category).trim();
    if (stock !== undefined) update.stock = Number(stock);
    if (sizes !== undefined) update.sizes = Array.isArray(sizes) ? sizes : [];
    if (image !== undefined) update.image = image;
    if (imagePublicId !== undefined) update.imagePublicId = imagePublicId;

    const product = await Product.findByIdAndUpdate(id, update, { new: true }).lean() as { _id?: mongoose.Types.ObjectId; [k: string]: unknown } | null;
    if (!product || !product._id) {
      return NextResponse.json({ error: 'Produs negăsit' }, { status: 404 });
    }
    return NextResponse.json({
      ...product,
      _id: product._id.toString(),
    });
  } catch (err) {
    console.error('PUT /api/products/[id]:', err);
    return NextResponse.json({ error: 'Eroare la actualizare' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 });
  }

  const { id } = await params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'ID invalid' }, { status: 400 });
  }

  try {
    await connectDB();
    const product = await Product.findById(id).lean() as { imagePublicId?: string; _id?: unknown } | null;
    if (!product) {
      return NextResponse.json({ error: 'Produs negăsit' }, { status: 404 });
    }
    if (product.imagePublicId) {
      try {
        await deleteFromCloudinary(product.imagePublicId);
      } catch (e) {
        console.warn('Cloudinary delete failed:', e);
      }
    }
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/products/[id]:', err);
    return NextResponse.json({ error: 'Eroare la ștergere' }, { status: 500 });
  }
}
