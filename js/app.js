// Produse – încărcate din API (când rulează serverul) sau listă statică
const STATIC_PRODUCTS = [
  { id: 1, name: 'Geacă blugger', mainCategory: 'haine', subCategory: 'geci', price: 349, description: 'Geacă casual, material respirant', image: '🧥', sizes: ['S', 'M', 'L', 'XL'] },
  { id: 2, name: 'Geacă sport', mainCategory: 'haine', subCategory: 'geci', price: 279, description: 'Pentru alergare și fitness', image: '🧥', sizes: ['S', 'M', 'L'] },
  { id: 3, name: 'Tricou sport', mainCategory: 'haine', subCategory: 'haine-sport', price: 79, description: 'Bumbac tehnic, uscare rapidă', image: '👕', sizes: ['S', 'M', 'L', 'XL'] },
  { id: 4, name: 'Bluză sport', mainCategory: 'haine', subCategory: 'haine-sport', price: 129, description: 'Cu glugă, material elastic', image: '👕', sizes: ['M', 'L', 'XL'] },
  { id: 5, name: 'Tricou basic', mainCategory: 'haine', subCategory: 'tricouri', price: 59, description: 'Bumbac 100%, culori multiple', image: '👕', sizes: ['S', 'M', 'L', 'XL'] },
  { id: 6, name: 'Tricou polo', mainCategory: 'haine', subCategory: 'tricouri', price: 99, description: 'Elegant și confortabil', image: '👕', sizes: ['S', 'M', 'L'] },
  { id: 7, name: 'Pantaloni blugi', mainCategory: 'haine', subCategory: 'pantaloni', price: 199, description: 'Slim fit, stretch', image: '👖', sizes: ['S', 'M', 'L', 'XL'] },
  { id: 8, name: 'Pantaloni sport', mainCategory: 'haine', subCategory: 'pantaloni', price: 149, description: 'Pentru sală și alergare', image: '👖', sizes: ['S', 'M', 'L', 'XL'] },
  { id: 9, name: 'Adidași casual', mainCategory: 'incaltaminte', subCategory: 'adidasi', price: 249, description: 'Versatili pentru orice ocazie', image: '👟', sizes: ['39', '40', '41', '42', '43'] },
  { id: 10, name: 'Adidași alergare', mainCategory: 'incaltaminte', subCategory: 'adidasi', price: 399, description: 'Talpă amortizată, respirabili', image: '👟', sizes: ['40', '41', '42', '43', '44'] },
  { id: 11, name: 'Papuci fotbal copii', mainCategory: 'incaltaminte', subCategory: 'papuci-fotbal', price: 189, description: 'Pentru teren sintetic', image: '⚽', sizes: ['35', '36', '37', '38'] },
  { id: 12, name: 'Papuci fotbal seniori', mainCategory: 'incaltaminte', subCategory: 'papuci-fotbal', price: 299, description: 'Studs pentru gazon natural', image: '⚽', sizes: ['40', '41', '42', '43', '44'] },
  { id: 13, name: 'Papuci sală sport', mainCategory: 'incaltaminte', subCategory: 'papuci-sport', price: 149, description: 'Ușori pentru fitness', image: '👟', sizes: ['39', '40', '41', '42', '43'] }
];
let PRODUCTS = [...STATIC_PRODUCTS];

// Mărimi disponibile per categorie (pentru filtre)
const SIZES_BY_CATEGORY = {
  haine: ['S', 'M', 'L', 'XL'],
  incaltaminte: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44']
};

// State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentMain = 'haine';
let currentSub = 'all';
let currentSize = 'all';

// DOM
const mainTabs = document.getElementById('mainTabs');
const subTabs = document.getElementById('subTabs');
const sizeTabs = document.getElementById('sizeTabs');
const productsGrid = document.getElementById('productsGrid');
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

function isImagePath(img) {
  return typeof img === 'string' && (img.startsWith('/') || img.startsWith('http'));
}

function init() {
  renderMainTabs();
  renderSubTabs();
  renderSizeFilter();
  renderProducts();
  renderCart();
  updateCartCount();
  bindEvents();
  loadProductsFromApi();
}

function loadProductsFromApi() {
  fetch('/api/products')
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        PRODUCTS = data;
        renderProducts();
      }
    })
    .catch(() => {});
}

function renderMainTabs() {
  mainTabs.innerHTML = MAIN_CATEGORIES.map(cat => `
    <button class="main-tab ${currentMain === cat.id ? 'active' : ''}" data-main="${cat.id}">${cat.name}</button>
  `).join('');
}

function renderSubTabs() {
  const subs = SUB_CATEGORIES[currentMain] || [];
  subTabs.innerHTML = `
    <button class="sub-tab ${currentSub === 'all' ? 'active' : ''}" data-sub="all">Toate</button>
    ${subs.map(s => `
      <button class="sub-tab ${currentSub === s.id ? 'active' : ''}" data-sub="${s.id}">${s.name}</button>
    `).join('')}
  `;
}

function renderSizeFilter() {
  const sizes = SIZES_BY_CATEGORY[currentMain] || [];
  sizeTabs.innerHTML = `
    <button class="size-tab ${currentSize === 'all' ? 'active' : ''}" data-size="all">Toate</button>
    ${sizes.map(sz => `
      <button class="size-tab ${currentSize === sz ? 'active' : ''}" data-size="${sz}">${sz}</button>
    `).join('')}
  `;
}

function renderProducts() {
  let filtered = PRODUCTS.filter(p => p.mainCategory === currentMain);
  if (currentSub !== 'all') {
    filtered = filtered.filter(p => p.subCategory === currentSub);
  }
  if (currentSize !== 'all') {
    filtered = filtered.filter(p => p.sizes && p.sizes.includes(currentSize));
  }

  productsGrid.innerHTML = filtered.length ? filtered.map(p => `
    <article class="product-card">
      <div class="product-image">${isImagePath(p.image) ? `<img src="${p.image}" alt="${p.name}">` : p.image}</div>
      <div class="product-info">
        <span class="product-sub">${getSubName(p.subCategory)}</span>
        <h3 class="product-name">${p.name}</h3>
        ${p.sizes && p.sizes.length ? `<p class="product-sizes">Mărimi: ${p.sizes.join(', ')}</p>` : ''}
        <p class="product-desc">${p.description}</p>
        <div class="product-footer">
          <span class="product-price">${p.price} lei</span>
          <button class="btn-add add-to-cart" data-id="${p.id}">Adaugă</button>
        </div>
      </div>
    </article>
  `).join('') : '<p class="no-products">Niciun produs în această categorie.</p>';
}

function getSubName(id) {
  const subs = SUB_CATEGORIES[currentMain] || [];
  return subs.find(s => s.id === id)?.name || id;
}

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(item => item.id === productId);
  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });
  saveCart();
  renderCart();
  updateCartCount();
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCart();
  updateCartCount();
}

function updateQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) removeFromCart(productId);
  else { saveCart(); renderCart(); updateCartCount(); }
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function renderCart() {
  const items = cart.filter(i => i.quantity > 0);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  cartEmpty.style.display = items.length ? 'none' : 'block';
  checkoutBtn.disabled = !items.length;
  cartTotal.textContent = `${total} lei`;
  if (!items.length) {
    cartItems.innerHTML = '<p class="cart-empty" id="cartEmpty">Coșul este gol</p>';
    return;
  }
  cartItems.innerHTML = items.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-img">${isImagePath(item.image) ? `<img src="${item.image}" alt="">` : item.image}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.price} lei</div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-id="${item.id}" data-delta="-1">−</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
        </div>
      </div>
      <button class="cart-remove" data-id="${item.id}">×</button>
    </div>
  `).join('');
}

function updateCartCount() {
  cartCount.textContent = cart.reduce((s, i) => s + i.quantity, 0);
}

function bindEvents() {
  mainTabs.addEventListener('click', e => {
    const btn = e.target.closest('.main-tab');
    if (btn) {
      currentMain = btn.dataset.main;
      currentSub = 'all';
      currentSize = 'all';
      renderMainTabs();
      renderSubTabs();
      renderSizeFilter();
      renderProducts();
    }
  });

  subTabs.addEventListener('click', e => {
    const btn = e.target.closest('.sub-tab');
    if (btn) {
      currentSub = btn.dataset.sub;
      subTabs.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts();
    }
  });

  sizeTabs.addEventListener('click', e => {
    const btn = e.target.closest('.size-tab');
    if (btn) {
      currentSize = btn.dataset.size;
      sizeTabs.querySelectorAll('.size-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts();
    }
  });

  productsGrid.addEventListener('click', e => {
    const btn = e.target.closest('.add-to-cart');
    if (btn) addToCart(parseInt(btn.dataset.id));
  });

  cartBtn.addEventListener('click', () => {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
  });
  closeCart.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
  });
  cartOverlay.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
  });

  cartItems.addEventListener('click', e => {
    const id = parseInt(e.target.closest('[data-id]')?.dataset.id);
    if (!id) return;
    if (e.target.closest('.qty-btn')) updateQuantity(id, parseInt(e.target.closest('.qty-btn').dataset.delta));
    else if (e.target.closest('.cart-remove')) removeFromCart(id);
  });

  checkoutBtn.addEventListener('click', () => {
    if (!cart.length) return;
    alert('Mulțumim! Comandă plasată. (demonstrație)');
    cart = [];
    saveCart();
    renderCart();
    updateCartCount();
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
  });
}

init();
