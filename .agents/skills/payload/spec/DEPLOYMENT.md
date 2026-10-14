# Panduan Deploy School Website ke Vercel + MongoDB Atlas

> Panduan ini khusus untuk deploy project `school-website` (Payload CMS 3.90.2 + Next.js 16) ke **Vercel Hobby (free tier)** dengan database **MongoDB Atlas (free M0 cluster)** dan media storage **Vercel Blob**.

## Prasyarat

- Akun GitHub (repo sudah di-push)
- Akun Vercel (sign up via GitHub di [vercel.com](https://vercel.com))
- Akun MongoDB Atlas ([mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
- Node.js >= 20.9.0 dan pnpm terinstal lokal

---

## Langkah 1: Setup MongoDB Atlas (Free M0)

1. Buat akun / login di [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Create Cluster** → pilih **M0 (free)**, region **Singapore (ap-southeast-1)** untuk latency terbaik ke Vercel
3. **Database Access** → **Add Database User**
   - Authentication Method: Password
   - Buat username dan password. **Catat credentials ini.**
   - Pastikan password tidak mengandung karakter spesial yang perlu di-encode (`@`, `:`, `/`). Gunakan huruf dan angka saja untuk menghindari masalah connection string.
4. **Network Access** → **Add IP Address** → **"Allow Access from Anywhere" (0.0.0.0/0)**
   - Ini diperlukan karena IP Vercel serverless functions bersifat dinamis.
   - Keamanan tetap dijaga oleh credentials database.
5. **Connect** → **Drivers** → copy connection string. Ganti `<password>` dan tambahkan nama database:

   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/school-website?retryWrites=true&w=majority
   ```

6. **Catatan:** M0 free tier dibatasi 512MB storage dan 500 koneksi. Cukup untuk website sekolah dengan traffic normal.

---

## Langkah 2: Setup Vercel Blob Storage (WAJIB)

### Mengapa wajib?

Project saat ini meng-upload media ke `public/media/` (disk lokal) — lihat konfigurasi di `src/collections/Media.ts`:

```ts
upload: {
  staticDir: path.resolve(dirname, '../../public/media'),
  // ...
}
```

**Vercel filesystem bersifat read-only saat runtime**, sehingga upload gambar via admin panel akan **gagal** tanpa cloud storage. Vercel Blob menggantikan penyimpanan lokal ini.

### 2a. Install package

```bash
pnpm add @payloadcms/storage-vercel-blob
```

### 2b. Tambahkan plugin di `src/plugins/index.ts`

Tambahkan import di bagian atas file:

```ts
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
```

Kemudian tambahkan plugin di **akhir** array `plugins[]`:

```ts
export const plugins: Plugin[] = [
  redirectsPlugin({
    // ... konfigurasi existing
  }),
  nestedDocsPlugin({
    // ... konfigurasi existing
  }),
  seoPlugin({
    // ... konfigurasi existing
  }),
  formBuilderPlugin({
    // ... konfigurasi existing
  }),
  searchPlugin({
    // ... konfigurasi existing
  }),
  // === Tambahkan di bawah ini ===
  vercelBlobStorage({
    collections: {
      media: true,
    },
    token: process.env.BLOB_READ_WRITE_TOKEN || '',
  }),
]
```

> **Catatan:** Plugin ini hanya aktif ketika `BLOB_READ_WRITE_TOKEN` tersedia. Di environment lokal tanpa token, Payload akan tetap menggunakan penyimpanan lokal `public/media/` seperti biasa.

### 2c. Update `next.config.ts`

Tambahkan domain Vercel Blob ke `images.remotePatterns` agar Next.js Image Optimization bisa memuat gambar dari Blob storage:

```ts
images: {
  localPatterns: [
    {
      pathname: '/api/media/file/**',
    },
  ],
  qualities: [100],
  remotePatterns: [
    ...[NEXT_PUBLIC_SERVER_URL].map((item) => {
      const url = new URL(item)
      return {
        hostname: url.hostname,
        protocol: url.protocol.replace(':', '') as 'http' | 'https',
      }
    }),
    // === Tambahkan ini untuk Vercel Blob ===
    {
      hostname: '*.public.blob.vercel-storage.com',
      protocol: 'https',
    },
  ],
},
```

### 2d. Update `.env.example`

Tambahkan variabel baru di `.env.example`:

```
# Vercel Blob storage token (otomatis terisi di Vercel setelah connect Blob store)
BLOB_READ_WRITE_TOKEN=
```

> Token ini akan didapat setelah membuat Blob store di Vercel dashboard (Langkah 4c). Vercel bisa meng-inject token ini otomatis ke project environment.

---

## Langkah 3: Buat `vercel.json` (Opsional — untuk Scheduled Publish)

Project ini menggunakan fitur scheduled publish via jobs queue (dikonfigurasi di `src/payload.config.ts`). Endpoint jobs dilindungi oleh `CRON_SECRET` via Authorization header.

Di Vercel **Hobby plan**, cron dibatasi **1x per hari**.

Buat file `vercel.json` di root project:

```json
{
  "crons": [
    {
      "path": "/api/payload-jobs/run",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Catatan:** Jika tidak membutuhkan scheduled publish, langkah ini bisa dilewati. Konten tetap bisa dipublish secara manual kapan saja melalui admin panel.

---

## Langkah 4: Deploy ke Vercel

### 4a. Push ke GitHub

Pastikan semua perubahan dari Langkah 2 dan 3 sudah di-commit:

```bash
git add -A
git commit -m "chore: prepare for Vercel deployment"
git push origin main
```

### 4b. Import project di Vercel

1. Login ke [vercel.com](https://vercel.com) → **"Add New"** → **"Project"**
2. Import repository GitHub `school-website`
3. Framework Preset: **Next.js** (otomatis terdeteksi)
4. Build Command: biarkan default — Vercel akan menjalankan `pnpm build` yang sudah dikonfigurasi di `package.json` sebagai `cross-env NODE_OPTIONS=--no-deprecation next build`, dilanjutkan `next-sitemap` (postbuild)
5. Root Directory: biarkan default (`.`)

> **Jangan deploy dulu!** Konfigurasi environment variables terlebih dahulu (Langkah 4c dan 4d).

### 4c. Setup Vercel Blob Store

1. Di Vercel Dashboard → **Storage** → **Create** → pilih **Blob**
2. Beri nama store (mis. `school-website-media`)
3. Setelah dibuat → **Connect to Project** → pilih project `school-website`
4. Vercel **otomatis menambahkan** `BLOB_READ_WRITE_TOKEN` ke environment variables project

### 4d. Konfigurasi Environment Variables

Di **Settings → Environment Variables**, tambahkan:

| Variable | Nilai | Scope |
| --- | --- | --- |
| `DATABASE_URL` | `mongodb+srv://...` (dari Langkah 1) | Production, Preview |
| `PAYLOAD_SECRET` | String acak minimal 32 karakter (lihat cara generate di bawah) | Production, Preview |
| `CRON_SECRET` | String acak untuk proteksi cron endpoint | Production |
| `PREVIEW_SECRET` | String acak untuk validasi draft preview | Production, Preview |
| `BLOB_READ_WRITE_TOKEN` | Otomatis terisi jika Blob store sudah di-connect (Langkah 4c) | Production, Preview |

**Generate secret string:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Jalankan perintah ini 3x untuk mendapatkan nilai berbeda untuk `PAYLOAD_SECRET`, `CRON_SECRET`, dan `PREVIEW_SECRET`.

> **JANGAN** isi `NEXT_PUBLIC_SERVER_URL` — project sudah otomatis menggunakan `VERCEL_PROJECT_PRODUCTION_URL` yang disediakan Vercel. Lihat penanganan fallback di `next.config.ts` dan `src/utilities/getURL.ts`. Isi variabel ini **hanya** jika kamu menggunakan custom domain (lihat Langkah 6).

### 4e. Deploy

Klik **Deploy**. Vercel akan menjalankan:

1. `pnpm install` — install dependencies
2. `pnpm build` → `cross-env NODE_OPTIONS=--no-deprecation next build` — build Next.js + Payload
3. `next-sitemap` (postbuild) — generate sitemap dan robots.txt

Build pertama memakan waktu sekitar **2-5 menit**.

---

## Langkah 5: Setup Awal Setelah Online

1. Buka `https://nama-project.vercel.app/admin`
2. Buat **user admin pertama** (email + password)
3. **(Opsional)** Gunakan fitur **"Seed Database"** di admin panel untuk mengisi data contoh

   > **PERHATIAN:** Seeding bersifat destruktif — akan menghapus data yang sudah ada. Hanya gunakan untuk setup awal. Endpoint seed memiliki `maxDuration: 60` detik, yang melebihi limit Hobby plan (10 detik). Jika timeout, jalankan seed di environment lokal dengan connection string Atlas.

4. Jika sudah seed, **hapus demo user bawaan template** dari koleksi Users:
   - Email: `demo-author@payloadcms.com`
   - Password: `password`

---

## Langkah 6: Custom Domain (Opsional)

1. Vercel Dashboard → **Settings** → **Domains** → tambahkan domain
2. Konfigurasi DNS di registrar domain (CNAME atau A record sesuai instruksi Vercel)
3. Tambahkan environment variable:

   ```
   NEXT_PUBLIC_SERVER_URL=https://www.namadomainmu.com
   ```

4. **Redeploy** agar perubahan URL aktif. Ini memastikan:
   - Sitemap menggunakan domain yang benar (lihat `next-sitemap.config.cjs`)
   - Link SEO dan canonical URL menggunakan domain yang benar (via `getServerSideURL()`)
   - CORS mengizinkan request dari domain baru (via `payload.config.ts`)

---

## Batasan Vercel Hobby Plan

| Batasan | Limit |
| --- | --- |
| Serverless Function Duration | 10 detik |
| Bandwidth | 100 GB/bulan |
| Build Duration | 45 menit |
| Cron Jobs | 1x per hari |
| Vercel Blob Storage | Cek limit terkini di [vercel.com/pricing](https://vercel.com/pricing) |

Untuk website sekolah dengan traffic normal, limit ini umumnya cukup. Perhatikan **function duration 10 detik** — upload media besar atau operasi batch bisa timeout.

## Batasan MongoDB Atlas M0 (Free)

| Batasan | Limit |
| --- | --- |
| Storage | 512 MB |
| Koneksi | 500 |
| RAM | Shared |
| Backup | Tidak ada automated backup |

---

## Troubleshooting

### Build gagal: "Cannot find module '@payloadcms/storage-vercel-blob'"

→ Pastikan sudah menjalankan `pnpm add @payloadcms/storage-vercel-blob` dan commit `package.json` beserta `pnpm-lock.yaml`.

### Upload media gagal / error EPERM

→ Pastikan Vercel Blob sudah di-setup (Langkah 2 dan 4c) dan `BLOB_READ_WRITE_TOKEN` terisi di environment variables. Cek di **Settings → Environment Variables** bahwa token tersedia untuk scope Production dan Preview.

### Admin panel tidak bisa diakses

→ Buka `/admin` (bukan `/`). Pastikan `PAYLOAD_SECRET` terisi di environment variables. Jika muncul error 500, cek log di Vercel Dashboard → **Deployments** → klik deployment → **Functions** tab.

### Database connection timeout

→ Periksa **Network Access** di MongoDB Atlas — pastikan `0.0.0.0/0` sudah ditambahkan. Periksa connection string: username, password (tanpa karakter spesial), dan nama database sudah benar.

### Gambar tidak muncul di frontend

→ Pastikan `next.config.ts` sudah menambahkan `*.public.blob.vercel-storage.com` di `remotePatterns` (Langkah 2c). Jika gambar di-upload sebelum Blob storage diaktifkan, gambar tersebut perlu di-upload ulang.

### Scheduled publish tidak berjalan

→ Cron di Hobby plan hanya berjalan **1x per hari** (sesuai `vercel.json`). Pastikan `vercel.json` sudah di-commit dan `CRON_SECRET` terisi di environment variables. Cek log cron di Vercel Dashboard → **Settings** → **Cron Jobs**.

### Seed database timeout

→ Endpoint seed membutuhkan hingga 60 detik, melebihi limit Hobby plan (10 detik). Alternatif: jalankan seed secara lokal dengan `DATABASE_URL` Atlas:

```bash
# Di terminal lokal
DATABASE_URL="mongodb+srv://..." pnpm dev
# Lalu buka http://localhost:3000/admin dan klik Seed
```
