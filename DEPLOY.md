# Git + Vercel – pași

## 1. Git (GitHub)

### Prima dată (în terminal, în folderul proiectului):

```powershell
cd "C:\Users\Alr\OneDrive\Desktop\magazin online"

git init
git add .
git commit -m "Initial commit - magazin online"
```

### Creează repo pe GitHub:

1. Mergi la https://github.com/new
2. Nume repo: `magazin-online` (sau cum vrei)
3. **Private** sau Public
4. **Nu** bifa "Add a README" – ai deja cod
5. Create repository

### Conectează și urcă:

```powershell
git remote add origin https://github.com/TEUL_USERNAME/magazin-online.git
git branch -M main
git push -u origin main
```

(Înlocuiește `TEUL_USERNAME` cu username-ul tău de GitHub. Dacă cer parolă, folosește un **Personal Access Token** în loc de parolă: GitHub → Settings → Developer settings → Personal access tokens.)

---

## 2. Vercel

1. Mergi la https://vercel.com și loghează-te (cu GitHub).
2. **Add New** → **Project**.
3. Importă repo-ul **magazin-online** (din lista de proiecte GitHub).
4. **Environment Variables** – adaugă:
   - `MONGODB_URI` = connection string-ul tău MongoDB (din .env.local)
   - `MONGODB_URI_DIRECT` = connection string-ul direct (din .env.local)
   - `SESSION_SECRET` = o frază secretă (ex: Superstar1_@#$)
5. **Deploy**.

După deploy, Vercel îți dă un URL (ex: `magazin-online-xxx.vercel.app`). Site-ul Next.js (pagina principală, produse, admin login) rulează acolo.

**Notă:** Pe Vercel rulează doar aplicația **Next.js**. `server.js` (Express) nu rulează pe Vercel – pentru admin cu parolă și produse folosești Next.js (admin la `/admin/login`).
