'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  sizes: string;
  image?: string;
  imagePublicId?: string;
}

const DEFAULT_SIZES = 'S, M, L, XL';

export default function ProductForm({
  initial,
  productId,
}: {
  initial?: Partial<ProductFormData>;
  productId?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial?.price ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [stock, setStock] = useState(initial?.stock ?? '');
  const [sizes, setSizes] = useState(initial?.sizes ?? DEFAULT_SIZES);
  const [image, setImage] = useState(initial?.image ?? '');
  const [imagePublicId, setImagePublicId] = useState(initial?.imagePublicId ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Eroare upload');
      setImage(data.url);
      setImagePublicId(data.public_id || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la încărcarea imaginii');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const sizesArray = sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      stock: Number(stock),
      sizes: sizesArray,
      image: image || undefined,
      imagePublicId: imagePublicId || undefined,
    };

    try {
      const url = productId ? `/api/products/${productId}` : '/api/products';
      const method = productId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Eroare la salvare');
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
      <div className="form-group">
        <label>Imagine produs</label>
        {image ? (
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ position: 'relative', width: 200, height: 200, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--bg)' }}>
              <Image src={image} alt="Preview" fill style={{ objectFit: 'cover' }} />
            </div>
            <button
              type="button"
              onClick={() => { setImage(''); setImagePublicId(''); }}
              className="btn btn-ghost"
              style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}
            >
              Elimină imaginea
            </button>
          </div>
        ) : null}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Se încarcă...</p>}
      </div>

      <div className="form-group">
        <label>Nume produs *</label>
        <input
          type="text"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Descriere *</label>
        <textarea
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          style={{ resize: 'vertical' }}
        />
      </div>
      <div className="form-group">
        <label>Preț (lei) *</label>
        <input
          type="number"
          className="input"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Categorie *</label>
        <input
          type="text"
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          placeholder="ex: Tricouri, Pantaloni, Adidași"
        />
      </div>
      <div className="form-group">
        <label>Stoc (bucăți) *</label>
        <input
          type="number"
          className="input"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Mărimi disponibile (separate prin virgulă)</label>
        <input
          type="text"
          className="input"
          value={sizes}
          onChange={(e) => setSizes(e.target.value)}
          placeholder="S, M, L, XL"
        />
      </div>

      {error && <p style={{ color: '#c00', marginBottom: '1rem' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Se salvează...' : productId ? 'Actualizează' : 'Adaugă produs'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => router.back()}
        >
          Anulare
        </button>
      </div>
    </form>
  );
}
