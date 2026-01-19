# Traveler-Site - Files to Upload

## ✅ WAJIB DI-UPLOAD

### Setelah Build (RECOMMENDED):

```
traveler-site/
├── 📁 .next/standalone/        ✅ WAJIB - Built application
├── 📁 .next/static/            ✅ WAJIB - Static assets
├── 📁 public/                  ✅ WAJIB - Public files (images, etc)
├── 📄 ecosystem.config.js      ✅ WAJIB - PM2 config
├── 📄 .env.example             ✅ WAJIB - Environment template
└── 📄 package.json             ⚠️  OPTIONAL
```

**Total: ~20-50 MB (compressed)**

---

## 📦 Cara Upload yang Benar

### Opsi 1: Gunakan Script (RECOMMENDED)

```bash
cd /Users/test/Documents/project-benny/travel-app/traveler-site

# Build dan compress otomatis
./prepare-deployment.sh

# Output: traveler-site_YYYYMMDD_HHMMSS.tar.gz
```

### Opsi 2: Manual Build & Compress

```bash
# 1. Build
pnpm build

# 2. Compress
tar -czf traveler-site-deploy.tar.gz \
  .next/standalone \
  .next/static \
  public \
  ecosystem.config.js \
  .env.example
```

---

## ❌ JANGAN DI-UPLOAD

```
├── 📁 node_modules/            ❌ JANGAN! (sudah include di standalone)
├── 📁 .git/                    ❌ JANGAN!
├── 📁 .next/cache/             ❌ JANGAN!
├── 📁 app/                     ❌ JANGAN! (sudah di-build)
├── 📁 components/              ❌ JANGAN! (sudah di-build)
├── 📁 modules/                 ❌ JANGAN! (sudah di-build)
├── 📄 .env                     ❌ JANGAN! (buat baru di VPS)
└── 📄 .DS_Store                ❌ JANGAN!
```

---

## 🎯 Setup di VPS

### After Extract:

```bash
cd /www/wwwroot/traveler-site

# 1. Copy static files ke standalone
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# 2. Create .env
cp .env.example .env
nano .env  # Edit
chmod 600 .env
cp .env .next/standalone/.env

# 3. Create logs
mkdir -p logs

# 4. Start PM2
pm2 start ecosystem.config.js
```

---

## 📊 Ukuran yang Diharapkan

| Item | Ukuran | Status |
|------|--------|--------|
| `.next/standalone/` | ~15-30 MB | ✅ Normal |
| `.next/static/` | ~5-10 MB | ✅ Normal |
| `public/` | ~2-5 MB | ✅ Normal |
| **Total (compressed)** | **20-50 MB** | ✅ Normal |
| **Total (compressed)** | **> 100 MB** | ❌ Terlalu besar! |

---

## ✅ Verification

```bash
# After extract, verify:
ls .next/standalone/server.js       # ✅ Must exist
ls .next/standalone/.next/static/   # ✅ Must exist
ls .next/standalone/public/         # ✅ Must exist
ls ecosystem.config.js              # ✅ Must exist
```

---

**Gunakan `./prepare-deployment.sh` untuk hasil terbaik!** 🚀
