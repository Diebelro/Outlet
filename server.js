/**
 * Backend Node.js + Express pentru magazin online
 * - Autentificare admin: MongoDB + sesiuni (express-session + connect-mongo)
 * - POST /api/products (multipart): adaugă produs + încarcă imagine (Multer)
 * - GET /api/products: returnează lista de produse din data/products.json
 * - /admin protejat: doar cu sesiune validă; /admin/login și /admin/logout
 */
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const Admin = require('./models/Admin');

const app = express();
const PORT = process.env.PORT || 3001;

const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

async function connectDB() {
  const uri = process.env.MONGODB_URI_DIRECT || process.env.MONGODB_URI;
  if (!uri) return;
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB error:', err);
  }
}

async function seedAdmin() {
  try {
    if (mongoose.connection.readyState !== 1) return;
    const count = await Admin.countDocuments();
    if (count === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await Admin.create({ username: 'admin', password: hash });
      console.log('Admin implicit creat: username=admin, parola=admin123 (schimbă parola!)');
    }
  } catch (err) {
    console.warn('seedAdmin skip (MongoDB?):', err.message);
  }
}




// Asigură că folderele există
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Inițializează products.json dacă nu există
if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(PRODUCTS_FILE, '[]', 'utf8');
}

// Configurare Multer – salvare imagini în uploads/ cu nume unic
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const safeName = Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /^image\/(jpeg|png|webp|gif)$/i;
    if (allowed.test(file.mimetype)) return cb(null, true);
    cb(new Error('Doar imagini (JPEG, PNG, WebP, GIF) sunt permise.'));
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoUrl = process.env.MONGODB_URI_DIRECT || process.env.MONGODB_URI;
if (mongoUrl) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'schimba-secretul-in-productie',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl }),
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true }
  }));
} else {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'schimba-secretul-in-productie',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true }
  }));
}

// Middleware: permite acces la /admin doar dacă sesiunea este activă
function protectAdmin(req, res, next) {
  if (req.session && req.session.admin === true) return next();
  res.redirect('/admin/login');
}

// Verificare sesiune pentru API (returnează JSON 401 dacă nu e autentificat)
function requireAdminApi(req, res, next) {
  if (req.session && req.session.admin === true) return next();
  res.status(401).json({ error: 'Trebuie să fii autentificat. Mergi la /admin/login' });
}

// Rute admin (înainte de static ca /admin și /admin.html să fie protejate)
app.get('/admin/login', (req, res) => {
  if (req.session && req.session.admin) return res.redirect('/admin');
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.redirect('/admin/login?error=1');
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.redirect('/admin/login?error=2');
    }
    const admin = await Admin.findOne({ username: String(username).trim().toLowerCase() });
    if (!admin) return res.redirect('/admin/login?error=1');
    const ok = await bcrypt.compare(String(password), admin.password);
    if (!ok) return res.redirect('/admin/login?error=1');
    req.session.admin = true;
    req.session.username = admin.username;
    return res.redirect('/admin');
  } catch (err) {
    console.error('Login error:', err);
    return res.redirect('/admin/login?error=1');
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    res.redirect('/admin/login');
  });
});

app.get('/admin', protectAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});
app.get('/admin.html', protectAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Verificare sesiune admin (pentru panou – redirect la login dacă expirat)
app.get('/api/auth/check', (req, res) => {
  if (req.session && req.session.admin === true) {
    return res.json({ ok: true, username: req.session.username });
  }
  res.status(401).json({ ok: false });
});

// Rute magazin (produse etc.) – pe 3001 redirecționare la Next.js (3000)
const NEXT_SITE = 'http://localhost:3000';
app.get('/produse', (req, res) => res.redirect(NEXT_SITE + '/produse'));
app.get('/produse/*', (req, res) => res.redirect(NEXT_SITE + req.originalUrl));

app.use(express.static(__dirname));
app.use('/uploads', express.static(UPLOADS_DIR));

// CORS (pentru admin deschis ca fișier sau de pe alt port)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.get('/test-db', (req, res) => {
  const mongoose = require('mongoose');
  res.send("MongoDB state: " + mongoose.connection.readyState);
});

// Citește produsele din JSON
function readProducts() {
  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Scrie produsele în JSON
function writeProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
}

// GET /api/products
app.get('/api/products', (req, res) => {
  try {
    const products = readProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Eroare la citirea produselor.' });
  }
});

// POST /api/products – doar pentru admin autentificat
app.post('/api/products', requireAdminApi, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Lipsește imaginea produsului.' });
    }

    const name = (req.body.name || '').trim();
    const description = (req.body.description || '').trim();
    const price = parseFloat(req.body.price);
    const mainCategory = (req.body.mainCategory || '').trim();
    const subCategory = (req.body.subCategory || '').trim();

    if (!name) return res.status(400).json({ message: 'Numele produsului este obligatoriu.' });
    if (!description) return res.status(400).json({ message: 'Descrierea este obligatorie.' });
    if (Number.isNaN(price) || price < 0) return res.status(400).json({ message: 'Preț invalid.' });
    if (!mainCategory || !subCategory) return res.status(400).json({ message: 'Categoria și subcategoria sunt obligatorii.' });

    const products = readProducts();
    const nextId = products.length ? Math.max(...products.map(p => p.id), 0) + 1 : 1;

    const imagePath = '/uploads/' + req.file.filename;

    const product = {
      id: nextId,
      name,
      description,
      price,
      mainCategory,
      subCategory,
      image: imagePath,
      sizes: mainCategory === 'haine' ? ['S', 'M', 'L', 'XL'] : ['39', '40', '41', '42', '43']
    };

    products.push(product);
    writeProducts(products);

    res.status(201).json({ message: 'Produs adăugat.', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Eroare la salvare.' });
  }
});

// Eroare Multer (ex: fișier prea mare)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Imaginea este prea mare (max 5 MB).' });
    }
  }
  if (err.message) return res.status(400).json({ message: err.message });
  next(err);
});

async function start() {
  await connectDB();
  await seedAdmin();
  const ports = [PORT, 3002, 3003, 3004, 3005];
  function tryListen(idx) {
    if (idx >= ports.length) {
      console.error('Toate porturile sunt ocupate. Oprește alte procese: taskkill /IM node.exe /F');
      process.exit(1);
    }
    const p = ports[idx];
    const server = app.listen(p, () => {
      console.log('');
      console.log('>>> Server pornit: http://localhost:' + p);
      console.log('>>> Admin: http://localhost:' + p + '/admin');
      console.log('');
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        tryListen(idx + 1);
      } else {
        console.error('Eroare server:', err);
        process.exit(1);
      }
    });
  }
  tryListen(0);
}

start().catch((err) => {
  console.error('Start error:', err);
  process.exit(1);
});
