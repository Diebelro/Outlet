/**
 * Panou administrator – adăugare produse
 * Trimite datele la backend-ul Node.js (API_BASE)
 * Panoul cere parolă: accesează doar prin http://localhost:3001/admin
 */

const API_BASE = typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'file://' && window.location.origin !== 'null'
  ? window.location.origin
  : 'http://localhost:3001';

const SUB_CATEGORIES = {
  haine: [
    { id: 'geci', name: 'Geci' },
    { id: 'haine-sport', name: 'Haine sport' },
    { id: 'tricouri', name: 'Tricouri' },
    { id: 'pantaloni', name: 'Pantaloni' }
  ],
  incaltaminte: [
    { id: 'adidasi', name: 'Adidași' },
    { id: 'papuci-fotbal', name: 'Papuci fotbal' },
    { id: 'papuci-sport', name: 'Papuci sport' }
  ]
};

const form = document.getElementById('productForm');
const mainCategorySelect = document.getElementById('mainCategory');
const subCategorySelect = document.getElementById('subCategory');
const imageInput = document.getElementById('productImage');
const imagePreview = document.getElementById('imagePreview');
const formMessage = document.getElementById('formMessage');
const submitBtn = document.getElementById('submitBtn');

// La încărcare: verifică dacă ești autentificat; altfel redirect la login
(async function checkAuth() {
  try {
    const res = await fetch(API_BASE + '/api/auth/check', { credentials: 'include' });
    if (res.status === 401) {
      window.location.href = API_BASE + '/admin/login';
      return;
    }
  } catch (e) {
    window.location.href = API_BASE + '/admin/login';
    return;
  }
})();

function setMessage(text, type) {
  formMessage.textContent = text || '';
  formMessage.className = 'form-message' + (type ? ` ${type}` : '');
}

function updateSubCategories() {
  const mainId = mainCategorySelect.value;
  subCategorySelect.innerHTML = '<option value="">Selectează subcategoria</option>';
  subCategorySelect.disabled = !mainId;

  if (mainId && SUB_CATEGORIES[mainId]) {
    SUB_CATEGORIES[mainId].forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub.id;
      opt.textContent = sub.name;
      subCategorySelect.appendChild(opt);
    });
  }
}

function showImagePreview(file) {
  if (!file || !file.type.startsWith('image/')) {
    imagePreview.classList.remove('has-image');
    imagePreview.innerHTML = '<span class="image-preview-text">Imaginea va apărea aici</span>';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const img = imagePreview.querySelector('img');
    if (img) {
      img.src = reader.result;
    } else {
      const i = document.createElement('img');
      i.src = reader.result;
      i.alt = 'Preview';
      imagePreview.innerHTML = '';
      imagePreview.appendChild(i);
    }
    imagePreview.classList.add('has-image');
  };
  reader.readAsDataURL(file);
}

mainCategorySelect.addEventListener('change', updateSubCategories);
imageInput.addEventListener('change', () => showImagePreview(imageInput.files[0]));

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setMessage('');

  const name = document.getElementById('productName').value.trim();
  const description = document.getElementById('productDescription').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  const mainCategory = mainCategorySelect.value;
  const subCategory = subCategorySelect.value;
  const file = imageInput.files[0];

  if (!file) {
    setMessage('Selectează o poză pentru produs.', 'error');
    return;
  }
  if (!mainCategory || !subCategory) {
    setMessage('Selectează categoria și subcategoria.', 'error');
    return;
  }

  submitBtn.disabled = true;

  const formData = new FormData();
  formData.append('image', file);
  formData.append('name', name);
  formData.append('description', description);
  formData.append('price', String(price));
  formData.append('mainCategory', mainCategory);
  formData.append('subCategory', subCategory);

  try {
    const res = await fetch(API_BASE + '/api/products', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      setMessage('Sesiune expirată. Te redirecționăm la login...', 'error');
      setTimeout(() => { window.location.href = API_BASE + '/admin/login'; }, 1500);
      submitBtn.disabled = false;
      return;
    }
    if (!res.ok) {
      setMessage(data.message || data.error || 'Eroare la salvare.', 'error');
      submitBtn.disabled = false;
      return;
    }

    setMessage('Produsul a fost adăugat cu succes.', 'success');
    form.reset();
    imagePreview.classList.remove('has-image');
    imagePreview.innerHTML = '<span class="image-preview-text">Imaginea va apărea aici</span>';
    updateSubCategories();
  } catch (err) {
    setMessage('Nu s-a putut conecta la server. Pornește backend-ul (npm run server).', 'error');
  }

  submitBtn.disabled = false;
});

updateSubCategories();
