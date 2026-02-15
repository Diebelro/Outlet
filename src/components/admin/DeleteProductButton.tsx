'use client';

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  async function handleDelete() {
    if (!confirm(`Ștergi produsul „${productName}"?`)) return;
    const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    if (res.ok) window.location.reload();
    else alert('Eroare la ștergere');
  }
  return (
    <button
      type="button"
      onClick={handleDelete}
      style={{
        padding: '0.4rem 0.8rem',
        fontSize: '0.9rem',
        background: 'transparent',
        border: '1px solid #c00',
        color: '#c00',
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
      }}
    >
      Șterge
    </button>
  );
}
