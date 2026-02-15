# Magazin Online – Next.js 14, MongoDB, Cloudinary

Magazin online profesional cu panou de administrare, autentificare admin, upload imagini în Cloudinary și API REST pentru produse.

## Cerințe

- Node.js 18+
- Cont [MongoDB Atlas](https://cloud.mongodb.com) (gratuit)
- Cont [Cloudinary](https://cloudinary.com) (gratuit)

## Instalare și rulare

### 1. Instalare dependențe

```bash
npm install
```

### 2. Configurare variabile de mediu

Copiază fișierul de exemplu și completează valorile:

```bash
copy .env.local.example .env.local
```

Deschide `.env.local` și setează:

- **MONGODB_URI** – vezi mai jos cum îl obții din MongoDB Atlas.
- **Cloudinary** – vezi mai jos cum îi obții din Cloudinary.
- **ADMIN_SESSION_SECRET** – un string lung și aleatoriu (ex: `openssl rand -hex 32`).

### 3. Rulare în development

```bash
npm run dev
```

Aplicația rulează la **http://localhost:3000**.

### 4. Build pentru producție

```bash
npm run build
npm start
```

---

## Configurare MongoDB

1. Intră pe [cloud.mongodb.com](https://cloud.mongodb.com) și creează un cont (dacă nu ai).
2. Creează un **Cluster** (gratuit, e.g. M0).
3. În **Database Access** → **Add New Database User**: creează un user cu parolă și notează user + parolă.
4. În **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (sau adaugă IP-ul tău).
5. În **Database** → **Connect** → **Connect your application** → copiază connection string-ul.
6. Înlocuiește `<password>` cu parola userului și opțional `<dbname>` cu numele bazei (ex: `magazin`).

Exemplu `.env.local`:

```
MONGODB_URI=mongodb+srv://user:parola123@cluster0.xxxxx.mongodb.net/magazin?retryWrites=true&w=majority
```

La prima rulare, Mongoose creează automat colecțiile `products` și `admins`.

---

## Configurare Cloudinary

1. Intră pe [cloudinary.com](https://cloudinary.com) și creează un cont.
2. Din **Dashboard** notează:
   - **Cloud name**
   - **API Key**
   - **API Secret**
3. În `.env.local` adaugă:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Important:** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` trebuie să fie setat pentru ca imaginile să se încarce corect și pe client. Celelalte două sunt doar pentru server (upload).

---

## Utilizare

### Frontend (clienți)

- **/** – Pagina principală cu produse recente.
- **/products** – Lista tuturor produselor.
- **/products/[id]** – Detalii produs (nume, descriere, preț, mărimi, stoc).

### Panou administrator

- **/admin** – După login, dashboard-ul admin.
- **/admin/login** – Login (email + parolă). La prima rulare nu există niciun admin: folosește același formular care va apărea ca „Creare cont administrator” și creează primul cont.
- **/admin/products** – Listă produse cu acțiuni Editează / Șterge.
- **/admin/products/new** – Formular adăugare produs nou (inclusiv upload imagine în Cloudinary).
- **/admin/products/[id]/edit** – Formular editare produs.

Rutele din `/admin` (cu excepția `/admin/login`) sunt protejate: fără sesiune ești redirecționat la `/admin/login`.

---

## API Routes

| Metodă | Rută | Descriere | Auth |
|--------|------|-----------|------|
| GET | `/api/products` | Listă produse | Nu |
| GET | `/api/products/[id]` | Detalii produs | Nu |
| POST | `/api/products` | Adaugă produs | Admin |
| PUT | `/api/products/[id]` | Actualizează produs | Admin |
| DELETE | `/api/products/[id]` | Șterge produs | Admin |
| POST | `/api/upload` | Upload imagine → Cloudinary | Admin |
| GET | `/api/auth/setup` | Verifică dacă există admin (needsSetup) | Nu |
| POST | `/api/auth/setup` | Creează primul admin (doar dacă nu există niciunul) | Nu |
| POST | `/api/auth/login` | Login admin | Nu |
| POST | `/api/auth/logout` | Logout admin | Nu |
| GET | `/api/auth/me` | Sesie curentă admin | Nu |

---

## Structură proiect

```
src/
├── app/
│   ├── api/           # API Routes (auth, products, upload)
│   ├── admin/         # Panou admin (login, dashboard, produse)
│   ├── products/      # Pagini client (listare, detalii)
│   ├── layout.tsx
│   ├── page.tsx       # Home
│   └── globals.css
├── components/
│   ├── admin/         # Componente admin (formular produs, delete, logout)
│   ├── Header.tsx
│   └── ProductCard.tsx
├── lib/
│   ├── auth.ts        # Sesie admin (cookie semnat)
│   ├── cloudinary.ts
│   └── mongodb.ts
├── models/
│   ├── Admin.ts
│   └── Product.ts
└── middleware.ts      # Protecție rute /admin
```

---

## Rezolvare probleme

- **Eroare la conectare MongoDB:** Verifică MONGODB_URI, user/parolă, și că IP-ul este permis în Network Access.
- **Upload imagine eșuează:** Verifică cele 3 variabile Cloudinary și că API Key/Secret sunt corecte.
- **„Neautorizat” la adăugare/editare produs:** Te asiguri că ești logat la /admin; refresh la pagină după login.
- **Produse nu apar pe home:** Asigură-te că ai adăugat cel puțin un produs din /admin/products/new.

Dacă rulezi front-ul pe un domeniu/port diferit de `localhost:3000`, setează în `.env.local`:

```
NEXT_PUBLIC_BASE_URL=https://domeniul-tau.ro
```

(în development, `http://localhost:3000` este folosit implicit pentru fetch-urile server-side.)
