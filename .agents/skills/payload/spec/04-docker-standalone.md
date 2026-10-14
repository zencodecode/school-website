# 04 — Konfigurasi Next.js untuk Docker Standalone Output

## Objective

Tambahkan `output: 'standalone'` ke `next.config.ts` agar build menghasilkan folder `.next/standalone` yang bisa dijalankan mandiri di Docker tanpa `node_modules`. Selain itu, buat Vercel Blob Storage plugin conditional agar app bisa berjalan baik di VPS (tanpa Vercel) maupun tetap di Vercel jika diperlukan.

---

## Mengapa `output: 'standalone'`?

Next.js `standalone` output menghasilkan folder yang berisi:
- `server.js` — entry point server
- Semua dependensi yang dibutuhkan (trace-based, hanya file yang benar-benar dipakai)
- Ukuran image Docker jauh lebih kecil (dari ~1GB+ menjadi ~200-400MB)

Dockerfile yang sudah ada di project ini sudah mengasumsikan standalone output:
```dockerfile
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
CMD HOSTNAME="0.0.0.0" node server.js
```

Tapi `next.config.ts` belum mengatur `output: 'standalone'` — ini yang perlu ditambahkan.

---

## Files yang Dimodifikasi

### 1. `next.config.ts` — Tambah `output: 'standalone'`

**Sebelum:**
```typescript
const nextConfig: NextConfig = {
  sassOptions: {
    loadPaths: ['./node_modules/@payloadcms/ui/dist/scss/'],
  },
  images: {
    // ...
  },
  // ... config lainnya
}
```

**Sesudah:**
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  sassOptions: {
    loadPaths: ['./node_modules/@payloadcms/ui/dist/scss/'],
  },
  images: {
    // ...
  },
  // ... config lainnya
}
```

**Perubahan:** Tambahkan `output: 'standalone'` sebagai property pertama di `nextConfig` object.

**File lengkap sesudah perubahan:**
```typescript
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
import { redirects } from './redirects'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

const nextConfig: NextConfig = {
  output: 'standalone',
  sassOptions: {
    loadPaths: ['./node_modules/@payloadcms/ui/dist/scss/'],
  },
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
      {
        hostname: '*.public.blob.vercel-storage.com',
        protocol: 'https' as const,
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
```

---

### 2. `src/plugins/index.ts` — Vercel Blob Storage Conditional

Saat ini plugin `vercelBlobStorage` selalu di-load. Di VPS kita tidak punya Vercel Blob, jadi media akan disimpan ke local disk (default behavior Payload). Plugin harus conditional berdasarkan environment variable.

**Sebelum:**
```typescript
export const plugins: Plugin[] = [
  redirectsPlugin({ /* ... */ }),
  nestedDocsPlugin({ /* ... */ }),
  seoPlugin({ /* ... */ }),
  formBuilderPlugin({ /* ... */ }),
  searchPlugin({ /* ... */ }),
  vercelBlobStorage({
    collections: {
      media: true,
    },
    token: process.env.BLOB_READ_WRITE_TOKEN || '',
  }),
]
```

**Sesudah:**
```typescript
export const plugins: Plugin[] = [
  redirectsPlugin({ /* ... */ }),
  nestedDocsPlugin({ /* ... */ }),
  seoPlugin({ /* ... */ }),
  formBuilderPlugin({ /* ... */ }),
  searchPlugin({ /* ... */ }),
  // Vercel Blob Storage — hanya aktif jika token tersedia (deployment di Vercel)
  // Di VPS, media otomatis disimpan ke local disk oleh Payload
  ...(process.env.BLOB_READ_WRITE_TOKEN
    ? [
        vercelBlobStorage({
          collections: {
            media: true,
          },
          token: process.env.BLOB_READ_WRITE_TOKEN,
        }),
      ]
    : []),
]
```

**Penjelasan:**
- Jika `BLOB_READ_WRITE_TOKEN` ada (deploy di Vercel) → gunakan Vercel Blob
- Jika tidak ada (deploy di VPS) → spread empty array `[]`, plugin tidak di-load
- Payload secara default menyimpan media ke local disk (`/media/` folder) jika tidak ada storage adapter — ini yang kita inginkan di VPS

---

### 3. `src/collections/Media.ts` — Verifikasi Local Upload Path

Periksa bahwa collection Media sudah punya `staticDir` yang benar untuk local upload. Buka file dan pastikan ada konfigurasi seperti:

```typescript
export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    // staticDir harus menunjuk ke folder yang bisa diakses
    // Default Payload: path.resolve(dirname, '../../media')
    // Ini sudah benar untuk kebanyakan kasus
  },
  // ...
}
```

**Catatan:** Jika `staticDir` tidak diset, Payload menggunakan default `./media` di root project. Di Docker, folder ini perlu di-mount sebagai volume agar persistent (lihat Task 5 untuk Docker Compose setup).

Untuk production di Docker, pastikan Dockerfile tidak mengabaikan folder media. Volume akan di-mount di `docker-compose.prod.yml`.

---

### 4. `src/utilities/getURL.ts` — Bersihkan URL Logic

**Sebelum:**
```typescript
export const getServerSideURL = () => {
  return (
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000')
  )
}

export const getClientSideURL = () => {
  if (canUseDOM) {
    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port
    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  return process.env.NEXT_PUBLIC_SERVER_URL || ''
}
```

**Sesudah (tidak berubah):**

File ini **tidak perlu diubah**. Logic-nya sudah benar:
- `NEXT_PUBLIC_SERVER_URL` adalah primary source (kita set ke `https://ponpesabubakarsidik.com` di `.env.production`)
- Vercel fallback tetap ada sebagai safety net (tidak mengganggu di VPS karena env var `VERCEL_PROJECT_PRODUCTION_URL` tidak ada)
- Fallback terakhir `http://localhost:3000` untuk development

Yang penting: di `.env.production`, pastikan set:
```
NEXT_PUBLIC_SERVER_URL=https://ponpesabubakarsidik.com
```

---

## Verifikasi

```bash
# Build — harus berhasil dan menghasilkan .next/standalone/
pnpm build

# Verifikasi standalone output ada
ls .next/standalone/
# Harus ada: server.js, node_modules/, .next/, package.json

# Verifikasi bisa dijalankan
node .next/standalone/server.js
# Harus start di port 3000
```

**Catatan:** Setelah `output: 'standalone'`, `pnpm start` (next start) tidak lagi berfungsi. Gunakan `node .next/standalone/server.js` untuk menjalankan production build secara lokal.

---

## Troubleshooting

### Error: "Cannot find module" saat menjalankan standalone
Pastikan `public/` dan `.next/static/` di-copy ke folder standalone. Dockerfile sudah menangani ini:
```dockerfile
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
```

### Build gagal setelah tambah `output: 'standalone'`
Ini bisa terjadi jika ada dynamic import yang tidak compatible. Cek error log dan pastikan semua dependensi Payload ter-resolve dengan benar.

---

## Checklist

- [ ] `next.config.ts` — `output: 'standalone'` ditambahkan
- [ ] `src/plugins/index.ts` — Vercel Blob Storage di-wrap conditional
- [ ] `src/collections/Media.ts` — verifikasi staticDir untuk local upload
- [ ] `src/utilities/getURL.ts` — tidak perlu diubah (sudah benar)
- [ ] `pnpm build` berhasil
- [ ] Folder `.next/standalone/` tergenerate
- [ ] `node .next/standalone/server.js` berjalan tanpa error
