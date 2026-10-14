# 06 — GitHub Actions CI/CD Pipeline

## Objective

Buat pipeline CI/CD otomatis: setiap kali push ke branch `main`, GitHub Actions akan SSH ke VPS, pull kode terbaru, rebuild Docker image, dan restart container. Zero-downtime deployment.

---

## Prasyarat

- Task 5 (`05-docker-compose-production.md`) sudah selesai — `docker-compose.prod.yml` sudah ada
- VPS sudah setup dan bisa diakses via SSH (lihat Task 7)
- Repository sudah di-push ke GitHub

---

## Files yang Dibuat (2 files)

### 1. `.github/workflows/deploy.yml` (BARU)

```yaml
name: Deploy to VPS

on:
  push:
    branches:
      - main

  # Memungkinkan trigger manual dari GitHub UI
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest

    # Mencegah deploy bersamaan (antri jika ada deploy yang sedang berjalan)
    concurrency:
      group: production-deploy
      cancel-in-progress: false

    steps:
      # =============================================
      # Step 1: Checkout (untuk validasi & lint)
      # =============================================
      - name: Checkout code
        uses: actions/checkout@v4

      # =============================================
      # Step 2: Setup SSH key
      # =============================================
      - name: Setup SSH key
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.VPS_SSH_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -p ${{ secrets.VPS_PORT || 22 }} ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts 2>/dev/null

      # =============================================
      # Step 3: Deploy via SSH
      # =============================================
      - name: Deploy to VPS
        run: |
          ssh -i ~/.ssh/deploy_key \
              -p ${{ secrets.VPS_PORT || 22 }} \
              -o StrictHostKeyChecking=no \
              ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} \
              'bash /opt/ponpes-abs/scripts/deploy.sh'

      # =============================================
      # Step 4: Health check
      # =============================================
      - name: Health check
        run: |
          echo "Menunggu 30 detik agar container siap..."
          sleep 30

          # Coba health check hingga 5 kali
          for i in {1..5}; do
            HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
              --max-time 10 \
              https://ponpesabubakarsidik.com || echo "000")

            if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
              echo "✅ Health check berhasil! Status: $HTTP_STATUS"
              exit 0
            fi

            echo "⏳ Percobaan $i/5 — Status: $HTTP_STATUS, menunggu 15 detik..."
            sleep 15
          done

          echo "❌ Health check gagal setelah 5 percobaan"
          exit 1

      # =============================================
      # Step 5: Cleanup SSH key
      # =============================================
      - name: Cleanup SSH key
        if: always()
        run: rm -f ~/.ssh/deploy_key
```

**Penjelasan alur:**
1. **Trigger:** Push ke `main` atau manual trigger via GitHub UI
2. **Concurrency:** Hanya 1 deploy yang berjalan bersamaan, tidak cancel yang sedang berjalan
3. **SSH Setup:** Pasang SSH key dari GitHub Secrets
4. **Deploy:** SSH ke VPS dan jalankan `scripts/deploy.sh`
5. **Health check:** Cek apakah website accessible setelah deploy (retry 5x)
6. **Cleanup:** Hapus SSH key dari runner

---

### 2. `scripts/deploy.sh` (BARU)

```bash
#!/bin/bash
# ============================================
# Deploy Script — Ponpes Abu Bakar Sidik
# ============================================
# Script ini dijalankan di VPS oleh GitHub Actions
# Lokasi: /opt/ponpes-abs/scripts/deploy.sh

set -euo pipefail

# Konfigurasi
PROJECT_DIR="/opt/ponpes-abs"
COMPOSE_FILE="docker-compose.prod.yml"
LOG_FILE="/var/log/ponpes-abs-deploy.log"

# ============================================
# Functions
# ============================================
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ============================================
# Main Deploy Process
# ============================================
log "=========================================="
log "🚀 Memulai deployment..."
log "=========================================="

# Pindah ke project directory
cd "$PROJECT_DIR"

# Pull kode terbaru
log "📥 Pulling latest code..."
git fetch origin main
git reset --hard origin/main

# Build Docker image baru
log "🔨 Building Docker image..."
docker compose -f "$COMPOSE_FILE" build --no-cache app

# Restart container dengan image baru
# Docker Compose akan restart hanya container yang berubah
log "🔄 Restarting containers..."
docker compose -f "$COMPOSE_FILE" up -d

# Tunggu app container ready
log "⏳ Menunggu app container ready..."
sleep 10

# Verifikasi container berjalan
if docker compose -f "$COMPOSE_FILE" ps | grep -q "ponpes-abs-app.*running"; then
    log "✅ App container berjalan!"
else
    log "❌ App container tidak berjalan. Cek logs:"
    docker compose -f "$COMPOSE_FILE" logs --tail=50 app
    exit 1
fi

# Bersihkan Docker images yang tidak terpakai
log "🧹 Cleaning up old images..."
docker image prune -f

# Log disk usage
log "💾 Disk usage: $(df -h / | tail -1 | awk '{print $5}')"

log "=========================================="
log "✅ Deployment selesai!"
log "=========================================="
```

**Penjelasan script:**
- `set -euo pipefail` — Script berhenti jika ada error
- `git reset --hard origin/main` — Paksa local code sesuai dengan remote (aman karena kita tidak edit code di server)
- `--no-cache` pada build — Memastikan image baru di-build dari scratch (bisa dihapus untuk build lebih cepat jika yakin cache aman)
- Container check — Verifikasi app container berjalan setelah restart
- Image prune — Hapus old images untuk hemat disk space
- Logging — Semua output di-log ke `/var/log/ponpes-abs-deploy.log`

---

## Setup GitHub Secrets

Buka repository di GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Value | Contoh |
|---|---|---|
| `VPS_HOST` | IP address VPS | `123.456.789.0` |
| `VPS_USER` | Username SSH di VPS | `deploy` |
| `VPS_SSH_KEY` | Private key SSH (isi lengkap file) | `-----BEGIN OPENSSH PRIVATE KEY-----\n...` |
| `VPS_PORT` | Port SSH (opsional, default 22) | `22` |

### Cara generate SSH key pair untuk deploy:

```bash
# Di komputer lokal, generate key pair khusus untuk deploy
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/ponpes-deploy

# Tampilkan private key — copy ini ke GitHub Secret VPS_SSH_KEY
cat ~/.ssh/ponpes-deploy

# Tampilkan public key — tambahkan ke VPS
cat ~/.ssh/ponpes-deploy.pub
```

```bash
# Di VPS, sebagai user deploy, tambahkan public key:
echo "ISI_PUBLIC_KEY_DISINI" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

## Setup di VPS

Sebelum GitHub Actions bisa deploy, pastikan di VPS:

```bash
# 1. Buat project directory
sudo mkdir -p /opt/ponpes-abs
sudo chown deploy:deploy /opt/ponpes-abs

# 2. Clone repo
cd /opt/ponpes-abs
git clone https://github.com/USERNAME/school-website.git .

# 3. Setup .env.production
cp .env.production.example .env.production
nano .env.production  # Isi semua value

# 4. Buat deploy script executable
chmod +x scripts/deploy.sh

# 5. Buat log file
sudo touch /var/log/ponpes-abs-deploy.log
sudo chown deploy:deploy /var/log/ponpes-abs-deploy.log

# 6. First deploy manual
bash scripts/deploy.sh
```

---

## Workflow Manual Trigger

Selain auto-deploy saat push ke `main`, Anda bisa trigger deploy manual:

1. Buka repository GitHub
2. Tab **Actions**
3. Pilih workflow **Deploy to VPS**
4. Klik **Run workflow**
5. Pilih branch `main`
6. Klik **Run workflow**

Ini berguna jika perlu redeploy tanpa push code baru (misalnya setelah update environment variable di VPS).

---

## Monitoring Deploy

### Lihat status deploy di GitHub
- Repository → Tab **Actions** → Lihat status workflow run (✅ success / ❌ failed)

### Lihat log deploy di VPS
```bash
# Log deploy script
tail -f /var/log/ponpes-abs-deploy.log

# Log Docker containers
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.prod.yml logs -f mongo
```

---

## Troubleshooting

### Deploy gagal: "Permission denied (publickey)"
- Pastikan SSH key sudah ditambahkan ke VPS user `deploy`
- Pastikan `VPS_SSH_KEY` di GitHub Secrets berisi **private key** (bukan public)
- Cek permission: `chmod 600 ~/.ssh/authorized_keys` di VPS

### Deploy gagal: "docker compose not found"
- Pastikan Docker Compose v2 terinstall: `docker compose version`
- Jika pakai versi lama: `sudo apt install docker-compose-plugin`

### Health check gagal tapi website sebenarnya jalan
- Cek apakah DNS sudah mengarah ke VPS: `dig ponpesabubakarsidik.com`
- Cek apakah Cloudflare proxy aktif
- Bisa juga karena SSL belum propagate — tunggu beberapa menit

### Build sangat lambat di VPS
- Hapus `--no-cache` dari `scripts/deploy.sh` untuk leverage Docker cache
- Pertimbangkan build di GitHub Actions dan push image ke registry (advanced setup)

---

## Checklist

- [ ] `.github/workflows/deploy.yml` dibuat
- [ ] `scripts/deploy.sh` dibuat
- [ ] `scripts/deploy.sh` executable (`chmod +x`)
- [ ] GitHub Secrets diset: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`
- [ ] SSH key pair di-generate dan public key ditambahkan ke VPS
- [ ] Project di-clone di VPS (`/opt/ponpes-abs`)
- [ ] First deploy manual berhasil
- [ ] Push ke `main` → GitHub Actions trigger → deploy berhasil
- [ ] Health check passing
