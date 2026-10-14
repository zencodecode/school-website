# 05 — Docker Compose Production Setup

## Objective

Buat konfigurasi Docker Compose production-ready dengan 3 service: Next.js + Payload CMS, MongoDB, dan Nginx reverse proxy. Setup ini dirancang untuk berjalan di VPS (Hetzner/DigitalOcean) dengan Cloudflare di depannya sebagai CDN dan SSL termination.

---

## Prasyarat

- Task 4 (`04-docker-standalone.md`) sudah selesai — `output: 'standalone'` sudah diset
- Docker dan Docker Compose terinstall di VPS

---

## Files yang Dibuat (3 files)

### 1. `docker-compose.prod.yml` (BARU)

```yaml
version: '3.8'

services:
  # ============================================
  # Next.js + Payload CMS Application
  # ============================================
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ponpes-abs-app
    restart: unless-stopped
    env_file:
      - .env.production
    environment:
      - NODE_ENV=production
      - HOSTNAME=0.0.0.0
      - PORT=3000
    depends_on:
      mongo:
        condition: service_started
    volumes:
      # Media uploads — persistent storage
      - media_data:/app/media
    networks:
      - internal
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # ============================================
  # MongoDB Database
  # ============================================
  mongo:
    image: mongo:7
    container_name: ponpes-abs-mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME:-admin}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:?MONGO_PASSWORD harus diisi di .env.production}
    volumes:
      # Database data — persistent storage
      - mongo_data:/data/db
      # Backup directory
      - mongo_backup:/backup
    networks:
      - internal
    # MongoDB tidak perlu expose port ke host — hanya accessible dari internal network
    # Uncomment baris berikut jika perlu akses langsung (debugging):
    # ports:
    #   - "27017:27017"
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s

  # ============================================
  # Nginx Reverse Proxy
  # ============================================
  nginx:
    image: nginx:alpine
    container_name: ponpes-abs-nginx
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      app:
        condition: service_started
    networks:
      - internal

# ============================================
# Persistent Volumes
# ============================================
volumes:
  mongo_data:
    driver: local
  mongo_backup:
    driver: local
  media_data:
    driver: local

# ============================================
# Internal Network
# ============================================
networks:
  internal:
    driver: bridge
```

**Penjelasan arsitektur:**
- **app** — Container Next.js + Payload. Build dari Dockerfile lokal. Port 3000 hanya internal (tidak exposed ke host).
- **mongo** — MongoDB 7 dengan authentication. Data persistent via volume. Tidak exposed ke internet.
- **nginx** — Reverse proxy, listen port 80. Cloudflare akan handle SSL termination, jadi Nginx cukup HTTP.
- **Volume `media_data`** — Menyimpan file upload media agar persistent saat container di-restart/rebuild.
- **Volume `mongo_data`** — Menyimpan data MongoDB agar persistent.
- **Volume `mongo_backup`** — Folder untuk menyimpan backup MongoDB.

**Kenapa Nginx port 80 saja (tanpa 443)?**

Karena kita menggunakan Cloudflare dengan SSL mode "Flexible":
```
Visitor → HTTPS → Cloudflare → HTTP → Nginx (:80) → App (:3000)
```
Cloudflare menangani SSL certificate dan enkripsi. Traffic dari Cloudflare ke VPS melalui HTTP (port 80). Ini menyederhanakan setup karena tidak perlu manage SSL certificate di server.

Jika nanti ingin upgrade ke SSL mode "Full", bisa tambahkan Cloudflare Origin Certificate di Nginx (lihat catatan di bagian bawah).

---

### 2. `nginx/nginx.conf` (BARU)

Buat folder `nginx/` di root project, lalu buat file `nginx.conf`:

```nginx
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    # =========================================
    # Basic Settings
    # =========================================
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;  # Max upload size untuk media

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # =========================================
    # Logging
    # =========================================
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # =========================================
    # Gzip Compression
    # =========================================
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml
        application/rss+xml
        image/svg+xml;

    # =========================================
    # Rate Limiting (optional, basic protection)
    # =========================================
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;

    # =========================================
    # Upstream — Next.js App
    # =========================================
    upstream nextjs_app {
        server app:3000;
    }

    # =========================================
    # Server Block
    # =========================================
    server {
        listen 80;
        server_name ponpesabubakarsidik.com www.ponpesabubakarsidik.com;

        # -----------------------------------------
        # Security Headers
        # -----------------------------------------
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # -----------------------------------------
        # Redirect www ke non-www
        # -----------------------------------------
        if ($host = www.ponpesabubakarsidik.com) {
            return 301 $scheme://ponpesabubakarsidik.com$request_uri;
        }

        # -----------------------------------------
        # Static files caching
        # -----------------------------------------
        location /_next/static/ {
            proxy_pass http://nextjs_app;
            proxy_cache_valid 200 365d;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        # -----------------------------------------
        # Media files
        # -----------------------------------------
        location /media/ {
            proxy_pass http://nextjs_app;
            proxy_cache_valid 200 30d;
            add_header Cache-Control "public, max-age=2592000";
        }

        # -----------------------------------------
        # Next.js Image Optimization
        # -----------------------------------------
        location /_next/image {
            proxy_pass http://nextjs_app;
            proxy_cache_valid 200 60d;
            add_header Cache-Control "public, max-age=5184000";
        }

        # -----------------------------------------
        # Admin panel — no caching
        # -----------------------------------------
        location /admin {
            limit_req zone=general burst=20 nodelay;
            proxy_pass http://nextjs_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # -----------------------------------------
        # API routes — no caching
        # -----------------------------------------
        location /api/ {
            limit_req zone=general burst=30 nodelay;
            proxy_pass http://nextjs_app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # -----------------------------------------
        # All other requests — Next.js app
        # -----------------------------------------
        location / {
            limit_req zone=general burst=20 nodelay;
            proxy_pass http://nextjs_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

**Penjelasan konfigurasi:**
- **`client_max_body_size 100M`** — Mengizinkan upload file hingga 100MB (untuk media gambar/video ponpes)
- **Gzip** — Kompresi response untuk mempercepat loading
- **Rate limiting** — Proteksi dasar dari spam request (10 req/detik per IP, burst 20-30)
- **Security headers** — Proteksi dasar XSS, clickjacking, MIME sniffing
- **Static files caching** — `_next/static` di-cache 1 tahun (immutable), media 30 hari
- **Admin panel** — Tidak di-cache, dengan rate limiting lebih ketat
- **www redirect** — `www.ponpesabubakarsidik.com` → `ponpesabubakarsidik.com`

---

### 3. `.env.production.example` (BARU)

```bash
# ============================================
# Ponpes Abu Bakar Sidik — Production Environment
# ============================================
# Salin file ini ke .env.production dan isi semua value
# cp .env.production.example .env.production

# ============================================
# Application
# ============================================
# URL publik website (tanpa trailing slash)
NEXT_PUBLIC_SERVER_URL=https://ponpesabubakarsidik.com

# Secret untuk enkripsi JWT tokens (WAJIB GANTI!)
# Generate: openssl rand -hex 32
PAYLOAD_SECRET=GANTI_DENGAN_RANDOM_STRING_PANJANG

# Secret untuk autentikasi cron jobs
# Generate: openssl rand -hex 16
CRON_SECRET=GANTI_DENGAN_RANDOM_STRING

# Secret untuk validasi preview requests
# Generate: openssl rand -hex 16
PREVIEW_SECRET=GANTI_DENGAN_RANDOM_STRING

# ============================================
# Database (MongoDB)
# ============================================
# Username dan password untuk MongoDB root user
MONGO_USERNAME=admin
MONGO_PASSWORD=GANTI_DENGAN_PASSWORD_KUAT

# Connection string — sesuaikan username & password dengan di atas
DATABASE_URL=mongodb://admin:GANTI_DENGAN_PASSWORD_KUAT@mongo:27017/ponpes-abs?authSource=admin

# ============================================
# Storage (Opsional)
# ============================================
# Kosongkan jika deploy di VPS (media disimpan ke local disk)
# Isi jika deploy di Vercel (gunakan Vercel Blob Storage)
BLOB_READ_WRITE_TOKEN=
```

**PENTING:** 
- File `.env.production` **JANGAN** di-commit ke git!
- Pastikan `.env.production` sudah ada di `.gitignore`
- Generate secret yang kuat dengan: `openssl rand -hex 32`

Tambahkan ke `.gitignore`:
```
.env.production
```

---

## Verifikasi

```bash
# Validasi syntax Docker Compose
docker compose -f docker-compose.prod.yml config

# Test build lokal (opsional, butuh Docker di mesin lokal)
docker compose -f docker-compose.prod.yml build

# Jika ingin test run lokal:
# 1. Copy .env.production.example ke .env.production
# 2. Isi semua value
# 3. Jalankan:
docker compose -f docker-compose.prod.yml up -d

# Cek logs
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml logs -f mongo
docker compose -f docker-compose.prod.yml logs -f nginx

# Stop
docker compose -f docker-compose.prod.yml down
```

---

## Catatan: Upgrade ke SSL Full (Opsional)

Jika nanti ingin Cloudflare SSL mode "Full" (Cloudflare → HTTPS → Nginx):

1. Buat Origin Certificate di Cloudflare Dashboard → SSL/TLS → Origin Server
2. Download certificate dan key
3. Simpan di server:
   ```bash
   mkdir -p /opt/ponpes-abs/nginx/ssl
   # Paste certificate content
   nano /opt/ponpes-abs/nginx/ssl/origin.pem
   nano /opt/ponpes-abs/nginx/ssl/origin-key.pem
   ```
4. Update `nginx.conf`:
   ```nginx
   server {
       listen 443 ssl;
       ssl_certificate /etc/nginx/ssl/origin.pem;
       ssl_certificate_key /etc/nginx/ssl/origin-key.pem;
       # ... rest of config
   }
   server {
       listen 80;
       return 301 https://$host$request_uri;
   }
   ```
5. Update `docker-compose.prod.yml` nginx volumes:
   ```yaml
   volumes:
     - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
     - ./nginx/ssl:/etc/nginx/ssl:ro
   ```
6. Tambah port 443:
   ```yaml
   ports:
     - "80:80"
     - "443:443"
   ```

---

## Checklist

- [ ] `docker-compose.prod.yml` dibuat
- [ ] `nginx/nginx.conf` dibuat
- [ ] `.env.production.example` dibuat
- [ ] `.env.production` ditambahkan ke `.gitignore`
- [ ] `docker compose -f docker-compose.prod.yml config` berhasil
- [ ] (Opsional) Test build lokal berhasil
