# 07 — Setup VPS & Domain (Panduan Step-by-Step)

## Objective

Panduan lengkap step-by-step untuk:
1. Membeli domain `ponpesabubakarsidik.com`
2. Menyewa dan setup VPS
3. Konfigurasi Cloudflare DNS
4. First deploy
5. Backup strategy
6. Monitoring

---

## A. Beli Domain

### Opsi 1: Cloudflare Registrar (Rekomendasi)

**Harga:** ~$10.44/tahun (at cost, tanpa markup)

**Kelebihan:**
- Harga paling murah (at cost, Cloudflare tidak ambil profit dari domain)
- WHOIS privacy gratis
- Integrasi langsung dengan Cloudflare DNS/CDN
- Tidak ada hidden fees atau harga renewal yang naik

**Langkah-langkah:**

1. Buat akun di [cloudflare.com](https://cloudflare.com) (gratis)
2. Login → Dashboard → **Domain Registration** → **Register Domains**
3. Search: `ponpesabubakarsidik.com`
4. Jika tersedia, klik **Purchase**
5. Isi informasi kontak (diproteksi WHOIS privacy otomatis)
6. Bayar dengan credit card atau PayPal
7. Domain aktif dalam hitungan menit

**Catatan:** Cloudflare Registrar membutuhkan kartu kredit/debit internasional atau PayPal. Jika tidak punya, gunakan Opsi 2.

### Opsi 2: Registrar Lokal Indonesia (Alternatif)

**Provider dan estimasi harga:**

| Provider | Harga .com /tahun | Renewal | Website |
|---|---|---|---|
| Niagahoster | Rp129.900 (promo) | Rp179.900/tahun | niagahoster.co.id |
| IDwebhost | Rp120.000 (promo) | Rp165.000/tahun | idwebhost.com |
| Domainesia | Rp99.000 (promo) | Rp164.000/tahun | domainesia.com |
| Rumahweb | Rp139.000 | Rp169.000/tahun | rumahweb.com |

**Kelebihan:**
- Bayar via transfer bank lokal (BCA, Mandiri, BNI, dll), e-wallet (GoPay, OVO, Dana)
- Support Bahasa Indonesia
- Invoice dalam Rupiah

**Langkah-langkah:**

1. Buka salah satu provider di atas
2. Search domain `ponpesabubakarsidik.com`
3. Tambah ke keranjang → Checkout
4. Bayar via metode lokal
5. **PENTING — Setelah beli, arahkan nameserver ke Cloudflare:**
   - Login ke panel registrar
   - Cari menu **Nameserver** atau **DNS Management**
   - Ganti nameserver ke yang diberikan Cloudflare (lihat Section D langkah 3)
   - Biasanya: `ns1.cloudflare.com` dan `ns2.cloudflare.com` (tapi Cloudflare akan memberikan nameserver spesifik saat add site)

---

## B. Sewa VPS

### Opsi 1: Hetzner Cloud (Rekomendasi — Paling Murah)

**Harga:** CX22 — €4.35/bulan (~Rp75.000/bulan)

**Spesifikasi CX22:**
- 2 vCPU (shared)
- 4 GB RAM
- 40 GB SSD
- 20 TB traffic/bulan
- Location: Nuremberg, Falkenstein, atau Helsinki

**Kelebihan:**
- Harga paling kompetitif di kelasnya
- Performa sangat baik untuk harganya
- Data center di Eropa (latensi cukup baik dari Indonesia via Cloudflare CDN)
- Bisa bayar via credit card atau PayPal

**Langkah-langkah:**

1. Buat akun di [hetzner.com](https://www.hetzner.com/)
2. Verifikasi identitas (bisa diminta scan ID/passport)
3. Buka **Cloud Console** → **New Project** (nama: `ponpes-abs`)
4. Dalam project → **Add Server**
5. **Location:** Nuremberg (EU) atau Ashburn (US, jika ingin lebih dekat Asia)
6. **Image:** Ubuntu 24.04
7. **Type:** Shared vCPU → **CX22** (2 vCPU, 4 GB RAM, 40 GB SSD)
8. **Networking:** Public IPv4 + IPv6
9. **SSH Keys:** Tambahkan public key dari komputer lokal Anda
   ```bash
   # Di komputer lokal Windows (PowerShell):
   # Jika belum punya SSH key:
   ssh-keygen -t ed25519 -C "maftuh@ponpes-abs"
   
   # Tampilkan public key — copy ini ke Hetzner
   cat ~/.ssh/id_ed25519.pub
   ```
10. **Name:** `ponpes-abs-prod`
11. Klik **Create & Buy**
12. Catat IP address yang diberikan (misalnya `123.45.67.89`)

### Opsi 2: DigitalOcean (Alternatif)

**Harga:** $12/bulan (2GB RAM) atau $24/bulan (4GB RAM)

| Plan | vCPU | RAM | SSD | Harga |
|---|---|---|---|---|
| Basic $12 | 1 | 2 GB | 50 GB | $12/bulan |
| Basic $24 | 2 | 4 GB | 80 GB | $24/bulan |

**Langkah-langkah:**
1. Buat akun di [digitalocean.com](https://www.digitalocean.com/)
2. **Create** → **Droplets**
3. Region: Singapore (SGP1) — terdekat dari Indonesia
4. Image: Ubuntu 24.04
5. Plan: sesuai budget
6. Authentication: SSH Key
7. Hostname: `ponpes-abs-prod`
8. Create Droplet

---

## C. Setup VPS (SSH ke Server)

Setelah VPS aktif, SSH ke server dari komputer lokal:

```bash
# Ganti IP_ADDRESS dengan IP VPS Anda
ssh root@IP_ADDRESS
```

### Langkah 1: Update System

```bash
apt update && apt upgrade -y
```

### Langkah 2: Buat Non-Root User

```bash
# Buat user 'deploy'
adduser deploy
# Masukkan password yang kuat saat diminta

# Berikan akses sudo
usermod -aG sudo deploy
```

### Langkah 3: Setup SSH Key untuk User Deploy

```bash
# Pindah ke user deploy
su - deploy

# Buat folder .ssh
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Salin authorized_keys dari root (agar bisa SSH langsung ke user deploy)
sudo cp /root/.ssh/authorized_keys ~/.ssh/authorized_keys
sudo chown deploy:deploy ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Kembali ke root
exit
```

### Langkah 4: Install Docker & Docker Compose

```bash
# Install Docker menggunakan convenience script
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Tambahkan user deploy ke grup docker (agar bisa run docker tanpa sudo)
usermod -aG docker deploy

# Verifikasi instalasi
docker --version
docker compose version

# Bersihkan
rm get-docker.sh
```

### Langkah 5: Setup Firewall (UFW)

```bash
# Install UFW jika belum ada
apt install ufw -y

# Allow SSH (PENTING — lakukan ini SEBELUM enable UFW!)
ufw allow OpenSSH

# Allow HTTP dan HTTPS (untuk Nginx)
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Verifikasi
ufw status
```

**Output yang diharapkan:**
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

### Langkah 6: (Opsional) Disable Root Login & Password Auth

Untuk keamanan tambahan:

```bash
# Edit SSH config
nano /etc/ssh/sshd_config

# Ubah baris berikut:
PermitRootLogin no
PasswordAuthentication no

# Restart SSH
systemctl restart sshd
```

**⚠️ PENTING:** Pastikan Anda sudah bisa SSH sebagai user `deploy` dengan SSH key SEBELUM disable root login! Jika tidak, Anda bisa terkunci dari server.

Test dulu di terminal baru:
```bash
ssh deploy@IP_ADDRESS
```

### Langkah 7: Setup Swap (Opsional tapi Direkomendasikan)

Untuk VPS dengan RAM 4GB, tambahkan swap sebagai safety net:

```bash
# Buat swap file 2GB
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Buat permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verifikasi
free -h
```

---

## D. Setup Cloudflare DNS

### Langkah 1: Add Site ke Cloudflare

1. Login ke [cloudflare.com](https://dash.cloudflare.com/)
2. Klik **Add a site** (atau **Add site** di sidebar)
3. Masukkan: `ponpesabubakarsidik.com`
4. Pilih plan: **Free** ($0/bulan)
5. Klik **Continue**

### Langkah 2: Konfigurasi DNS Records

Cloudflare akan scan DNS records yang ada. Hapus semua yang tidak perlu, lalu tambahkan:

| Type | Name | Content | Proxy | TTL |
|---|---|---|---|---|
| A | `@` | `IP_VPS_ANDA` | ✅ Proxied (orange cloud) | Auto |
| A | `www` | `IP_VPS_ANDA` | ✅ Proxied (orange cloud) | Auto |

**Ganti `IP_VPS_ANDA` dengan IP address VPS yang dicatat di Section B.**

**Kenapa Proxy ON (orange cloud)?**
- Cloudflare CDN aktif — website lebih cepat
- IP VPS tersembunyi dari publik — lebih aman
- DDoS protection aktif
- SSL/TLS otomatis

### Langkah 3: Update Nameserver

Jika domain dibeli di Cloudflare Registrar → otomatis, skip langkah ini.

Jika domain dibeli di registrar lain (Niagahoster, IDwebhost, dll):
1. Cloudflare akan memberikan 2 nameserver, misalnya:
   - `emma.ns.cloudflare.com`
   - `john.ns.cloudflare.com`
2. Login ke panel registrar tempat Anda beli domain
3. Cari menu **Nameserver** / **DNS** / **Name Server Management**
4. Ganti nameserver ke yang diberikan Cloudflare
5. Simpan
6. Tunggu propagasi (biasanya 1-24 jam, seringkali < 1 jam)

### Langkah 4: Konfigurasi SSL/TLS

1. Di Cloudflare dashboard → pilih site `ponpesabubakarsidik.com`
2. Sidebar: **SSL/TLS** → **Overview**
3. Pilih mode: **Flexible**

   ```
   Flexible: Visitor ↔ HTTPS ↔ Cloudflare ↔ HTTP ↔ VPS
   ```
   
   Ini paling mudah karena tidak perlu setup SSL di VPS. Cloudflare menangani semua.

4. (Opsional) Sidebar: **SSL/TLS** → **Edge Certificates**:
   - **Always Use HTTPS:** ON
   - **Automatic HTTPS Rewrites:** ON
   - **Minimum TLS Version:** TLS 1.2

### Langkah 5: Konfigurasi Tambahan (Opsional)

**Caching:**
- Sidebar: **Caching** → **Configuration**
- Browser Cache TTL: **Respect Existing Headers** (Nginx sudah handle)

**Speed:**
- Sidebar: **Speed** → **Optimization**
- Auto Minify: ON untuk JavaScript, CSS, HTML

**Security:**
- Sidebar: **Security** → **Settings**
- Security Level: Medium
- Bot Fight Mode: ON

**Page Rules (gratis 3 rules):**
- Rule 1: `ponpesabubakarsidik.com/admin/*` → Cache Level: Bypass (jangan cache admin panel)
- Rule 2: `ponpesabubakarsidik.com/api/*` → Cache Level: Bypass (jangan cache API)

---

## E. First Deploy

Setelah VPS dan DNS siap, lakukan deploy pertama:

```bash
# SSH ke VPS sebagai user deploy
ssh deploy@IP_ADDRESS

# 1. Buat project directory
sudo mkdir -p /opt/ponpes-abs
sudo chown deploy:deploy /opt/ponpes-abs

# 2. Clone repository
cd /opt/ponpes-abs
git clone https://github.com/USERNAME/REPO_NAME.git .

# 3. Setup environment variables
cp .env.production.example .env.production
nano .env.production
```

**Isi `.env.production`:**
```bash
# Generate secrets (jalankan di terminal VPS):
# openssl rand -hex 32  → untuk PAYLOAD_SECRET
# openssl rand -hex 16  → untuk CRON_SECRET dan PREVIEW_SECRET
# openssl rand -base64 24  → untuk MONGO_PASSWORD

NEXT_PUBLIC_SERVER_URL=https://ponpesabubakarsidik.com
PAYLOAD_SECRET=HASIL_DARI_openssl_rand_hex_32
CRON_SECRET=HASIL_DARI_openssl_rand_hex_16
PREVIEW_SECRET=HASIL_DARI_openssl_rand_hex_16
MONGO_USERNAME=admin
MONGO_PASSWORD=HASIL_DARI_openssl_rand_base64_24
DATABASE_URL=mongodb://admin:HASIL_DARI_openssl_rand_base64_24@mongo:27017/ponpes-abs?authSource=admin
```

**⚠️ PENTING:** Password MongoDB di `DATABASE_URL` harus sama persis dengan `MONGO_PASSWORD`. Jika password mengandung karakter spesial (`@`, `:`, `/`, `%`), URL-encode terlebih dahulu atau gunakan password tanpa karakter spesial.

```bash
# 4. Buat deploy script executable
chmod +x scripts/deploy.sh

# 5. Build dan jalankan
docker compose -f docker-compose.prod.yml up -d --build

# Ini akan memakan waktu 5-10 menit untuk pertama kali (download images + build)
```

```bash
# 6. Monitor logs (Ctrl+C untuk keluar)
docker compose -f docker-compose.prod.yml logs -f

# 7. Cek status containers
docker compose -f docker-compose.prod.yml ps
```

**Output yang diharapkan:**
```
NAME                 IMAGE                  STATUS
ponpes-abs-app       ponpes-abs-app         Up 2 minutes (healthy)
ponpes-abs-mongo     mongo:7                Up 2 minutes (healthy)
ponpes-abs-nginx     nginx:alpine           Up 2 minutes
```

```bash
# 8. Test akses lokal
curl -I http://localhost
# Harus return HTTP 200

# 9. Test akses dari domain (tunggu DNS propagasi)
curl -I https://ponpesabubakarsidik.com
# Harus return HTTP 200 (via Cloudflare)
```

---

## F. Setup GitHub Actions Secrets

Agar CI/CD berjalan otomatis (lihat detail di `06-github-actions-cicd.md`):

```bash
# Di komputer lokal, generate SSH key khusus deploy
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/ponpes-deploy
# Jangan kasih passphrase (tekan Enter saat diminta)
```

```bash
# Di VPS, tambahkan public key ke user deploy
ssh deploy@IP_ADDRESS
echo "ISI_PUBLIC_KEY" >> ~/.ssh/authorized_keys
```

Di GitHub repository → **Settings** → **Secrets and variables** → **Actions**:

| Secret | Value |
|---|---|
| `VPS_HOST` | IP address VPS (misalnya `123.45.67.89`) |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Isi lengkap file `~/.ssh/ponpes-deploy` (private key) |
| `VPS_PORT` | `22` |

---

## G. Backup Strategy

### Backup MongoDB Otomatis (Daily)

```bash
# SSH ke VPS sebagai user deploy
ssh deploy@IP_ADDRESS

# Buat folder backup
sudo mkdir -p /opt/backups/mongodb
sudo chown deploy:deploy /opt/backups/mongodb

# Buat backup script
cat > /opt/ponpes-abs/scripts/backup.sh << 'EOF'
#!/bin/bash
# ============================================
# MongoDB Backup Script
# ============================================
set -euo pipefail

BACKUP_DIR="/opt/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ponpes-abs-$DATE.gz"
RETENTION_DAYS=7

# Jalankan mongodump di container
docker exec ponpes-abs-mongo mongodump \
    --archive --gzip \
    --username="$MONGO_USERNAME" \
    --password="$MONGO_PASSWORD" \
    --authenticationDatabase=admin \
    > "$BACKUP_FILE"

echo "[$(date)] Backup berhasil: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

# Hapus backup lama (lebih dari 7 hari)
find "$BACKUP_DIR" -name "ponpes-abs-*.gz" -mtime +$RETENTION_DAYS -delete
echo "[$(date)] Backup lama (>$RETENTION_DAYS hari) dihapus"
EOF

chmod +x /opt/ponpes-abs/scripts/backup.sh
```

```bash
# Tambahkan ke crontab — backup setiap hari jam 02:00
crontab -e

# Tambahkan baris berikut:
0 2 * * * source /opt/ponpes-abs/.env.production && /opt/ponpes-abs/scripts/backup.sh >> /var/log/ponpes-abs-backup.log 2>&1
```

### Test Backup Manual

```bash
# Jalankan backup manual
source /opt/ponpes-abs/.env.production && bash /opt/ponpes-abs/scripts/backup.sh

# Cek file backup
ls -la /opt/backups/mongodb/
```

### Restore dari Backup

Jika perlu restore database:

```bash
# Ganti BACKUP_FILE dengan file backup yang diinginkan
docker exec -i ponpes-abs-mongo mongorestore \
    --archive --gzip \
    --username="admin" \
    --password="PASSWORD" \
    --authenticationDatabase=admin \
    --drop \
    < /opt/backups/mongodb/ponpes-abs-20250101_020000.gz
```

---

## H. Monitoring

### Docker Container Logs

```bash
# Semua container
docker compose -f docker-compose.prod.yml logs -f

# Hanya app
docker compose -f docker-compose.prod.yml logs -f app

# Hanya Nginx
docker compose -f docker-compose.prod.yml logs -f nginx

# 50 baris terakhir
docker compose -f docker-compose.prod.yml logs --tail=50 app
```

### System Resources

```bash
# Disk usage
df -h

# RAM usage
free -h

# Docker resource usage per container
docker stats --no-stream

# Proses berjalan
htop  # (install: apt install htop)
```

### Uptime Monitoring (Gratis)

**Opsi 1: UptimeRobot (Rekomendasi)**
1. Buat akun gratis di [uptimerobot.com](https://uptimerobot.com/)
2. Add New Monitor:
   - Type: HTTPS
   - URL: `https://ponpesabubakarsidik.com`
   - Interval: 5 menit
3. Setup alert via email/Telegram jika down

**Opsi 2: Cloudflare Health Checks**
1. Di Cloudflare dashboard → **Traffic** → **Health Checks**
2. Create health check:
   - URL: `https://ponpesabubakarsidik.com`
   - Interval: 60 seconds
   - Notification: email

### Useful Alias (Opsional)

Tambahkan ke `~/.bashrc` user deploy:

```bash
echo '
# Ponpes ABS shortcuts
alias pabs="cd /opt/ponpes-abs"
alias pabs-logs="docker compose -f /opt/ponpes-abs/docker-compose.prod.yml logs -f"
alias pabs-ps="docker compose -f /opt/ponpes-abs/docker-compose.prod.yml ps"
alias pabs-restart="docker compose -f /opt/ponpes-abs/docker-compose.prod.yml restart"
alias pabs-deploy="bash /opt/ponpes-abs/scripts/deploy.sh"
' >> ~/.bashrc

source ~/.bashrc
```

Sekarang bisa jalankan:
```bash
pabs-logs    # Lihat logs
pabs-ps      # Lihat status container
pabs-restart # Restart semua container
pabs-deploy  # Manual deploy
```

---

## Estimasi Biaya Final

| Item | Provider | Harga | Periode |
|---|---|---|---|
| VPS CX22 | Hetzner | €4.35 (~$5) | /bulan |
| Domain .com | Cloudflare | $10.44 | /tahun |
| DNS + CDN + SSL | Cloudflare | $0 | gratis |
| MongoDB | Self-hosted | $0 | included di VPS |
| CI/CD | GitHub Actions | $0 | free tier |
| Uptime monitoring | UptimeRobot | $0 | free tier |
| **Total** | | **~$5.87/bulan** | |

Dibandingkan dengan setup sebelumnya (Vercel Hobby + MongoDB Atlas Free):
- Performa jauh lebih baik (no cold start, dedicated resources)
- Kontrol penuh atas infrastruktur
- Media storage unlimited (sesuai disk VPS)
- Harga sedikit lebih tinggi dari free tier, tapi jauh lebih murah dari Vercel Pro ($20/bulan)

---

## Quick Reference — Perintah Penting

```bash
# SSH ke server
ssh deploy@IP_ADDRESS

# Masuk ke project
cd /opt/ponpes-abs

# Status containers
docker compose -f docker-compose.prod.yml ps

# Restart app saja
docker compose -f docker-compose.prod.yml restart app

# Rebuild dan restart semua
docker compose -f docker-compose.prod.yml up -d --build

# Lihat logs real-time
docker compose -f docker-compose.prod.yml logs -f

# Stop semua
docker compose -f docker-compose.prod.yml down

# Start semua
docker compose -f docker-compose.prod.yml up -d

# Disk usage
df -h

# RAM usage
free -h

# Masuk ke MongoDB shell
docker exec -it ponpes-abs-mongo mongosh -u admin -p PASSWORD

# Manual backup
source .env.production && bash scripts/backup.sh
```

---

## Checklist Lengkap

### Domain
- [ ] Domain `ponpesabubakarsidik.com` dibeli
- [ ] Nameserver mengarah ke Cloudflare (jika beli di registrar lokal)

### VPS
- [ ] VPS disewa (Hetzner CX22 atau DigitalOcean)
- [ ] Catat IP address: `____________`
- [ ] SSH ke server berhasil
- [ ] System di-update (`apt update && apt upgrade`)
- [ ] User `deploy` dibuat
- [ ] SSH key untuk user `deploy` disetup
- [ ] Docker & Docker Compose terinstall
- [ ] Firewall (UFW) dikonfigurasi (22, 80, 443)
- [ ] (Opsional) Root login disabled
- [ ] (Opsional) Swap 2GB ditambahkan

### Cloudflare DNS
- [ ] Site ditambahkan ke Cloudflare
- [ ] A record `@` → IP VPS (Proxied)
- [ ] A record `www` → IP VPS (Proxied)
- [ ] SSL/TLS mode: Flexible
- [ ] Always Use HTTPS: ON
- [ ] DNS propagasi selesai (cek: `dig ponpesabubakarsidik.com`)

### Deploy
- [ ] Repository di-clone ke `/opt/ponpes-abs`
- [ ] `.env.production` dikonfigurasi
- [ ] `scripts/deploy.sh` executable
- [ ] `docker compose up -d --build` berhasil
- [ ] Semua 3 container running
- [ ] Website accessible via `https://ponpesabubakarsidik.com`
- [ ] Admin panel accessible via `https://ponpesabubakarsidik.com/admin`

### CI/CD
- [ ] SSH key pair untuk deploy di-generate
- [ ] Public key ditambahkan ke VPS
- [ ] GitHub Secrets diset
- [ ] Push ke main → auto deploy berhasil

### Backup & Monitoring
- [ ] Backup script dibuat
- [ ] Cron job backup harian diset
- [ ] Test backup + restore berhasil
- [ ] UptimeRobot atau Cloudflare health check aktif
