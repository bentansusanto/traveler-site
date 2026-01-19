# Traveler-Site Deployment - Quick Checklist

## 📦 Pre-Deployment

- [ ] `next.config.ts` has `output: "standalone"`
- [ ] `.env` configured for production
- [ ] Build successful: `pnpm build`
- [ ] Run: `./prepare-deployment.sh`

## 📤 Upload to VPS

- [ ] Upload `traveler-site_YYYYMMDD_HHMMSS.tar.gz` to VPS
- [ ] Extract to `/www/wwwroot/traveler-site`
- [ ] Copy static files:
  ```bash
  cd /www/wwwroot/traveler-site
  cp -r .next/static .next/standalone/.next/
  cp -r public .next/standalone/
  ```

## ⚙️ Configuration

```bash
# Create .env
cat > .env << 'EOF'
NODE_ENV=production
PORT=3002
HOSTNAME=0.0.0.0
NEXT_PUBLIC_IS_MAINTENANCE=false
NEXT_PUBLIC_API_URL=https://api.pacifictravelindo.com
EOF

# Secure .env
chmod 600 .env
cp .env .next/standalone/.env

# Create logs directory
mkdir -p logs
```

## 🚀 Deploy with PM2

```bash
# Start
pm2 start ecosystem.config.js

# Save & auto-start
pm2 save
pm2 startup
```

## 🌐 Reverse Proxy (aaPanel)

- [ ] Website → Add site → `pacifictravelindo.com`
- [ ] Reverse Proxy → `http://127.0.0.1:3002`
- [ ] SSL → Let's Encrypt
- [ ] Force HTTPS

## ✅ Verification

```bash
# Check PM2
pm2 status

# Check memory
pm2 show traveler-site

# Check logs
pm2 logs traveler-site

# Test
curl http://localhost:3002
curl https://pacifictravelindo.com
```

## 📊 Memory Configuration

**Per Instance:** 512 MB max
**Total (2 instances):** ~1 GB
**Auto-restart:** Enabled

## 🔄 Update Deployment

```bash
# 1. Local: build
pnpm build
./prepare-deployment.sh

# 2. Upload & extract

# 3. VPS: restart
pm2 restart traveler-site
```

---

**Done! 🎉** Site live at: `https://pacifictravelindo.com`
