# 02 — Rebranding: Wire `siteName` ke Semua Metadata & SEO

## Objective

Ganti semua hardcoded string `'Payload Website Template'` di metadata/SEO layer dengan `DEFAULT_SITE_NAME` dari `src/utilities/getSiteName.ts`. Setelah task ini selesai, tidak ada satupun halaman frontend yang menampilkan "Payload" di browser tab title, OpenGraph, maupun meta tags.

---

## Prasyarat

Task 1 (`01-rebranding-sitename.md`) sudah selesai — file `src/utilities/getSiteName.ts` sudah ada dengan export `DEFAULT_SITE_NAME`.

---

## Constant yang Digunakan

```typescript
import { DEFAULT_SITE_NAME } from '@/utilities/getSiteName'
// DEFAULT_SITE_NAME = 'Ponpes Abu Bakar Sidik'
```

**Kenapa pakai constant dan bukan async `getSiteName()`?**

Beberapa file menggunakan `generateMetadata()` yang harus synchronous (static export), atau konteks dimana async call ke database tidak ideal (misalnya di top-level module scope plugin config). Untuk kasus ini kita gunakan `DEFAULT_SITE_NAME` sebagai fallback statis. Untuk halaman yang bisa async, kita tetap bisa panggil `getSiteName()`.

---

## Files yang Dimodifikasi (7 files)

### 1. `src/utilities/mergeOpenGraph.ts`

**Sebelum:**
```typescript
import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'An open-source website built with Payload and Next.js.',
  images: [
    {
      url: `${getServerSideURL()}/website-template-OG.webp`,
    },
  ],
  siteName: 'Payload Website Template',
  title: 'Payload Website Template',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
```

**Sesudah:**
```typescript
import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'
import { DEFAULT_SITE_NAME } from '@/utilities/getSiteName'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Website resmi Pondok Pesantren Abu Bakar Sidik.',
  images: [
    {
      url: `${getServerSideURL()}/website-template-OG.webp`,
    },
  ],
  siteName: DEFAULT_SITE_NAME,
  title: DEFAULT_SITE_NAME,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
```

**Perubahan:**
- `description`: `'An open-source website built with Payload and Next.js.'` → `'Website resmi Pondok Pesantren Abu Bakar Sidik.'`
- `siteName`: `'Payload Website Template'` → `DEFAULT_SITE_NAME`
- `title`: `'Payload Website Template'` → `DEFAULT_SITE_NAME`

---

### 2. `src/utilities/generateMeta.ts`

**Sebelum:**
```typescript
const title = doc?.meta?.title
  ? doc?.meta?.title + ' | Payload Website Template'
  : 'Payload Website Template'
```

**Sesudah:**
```typescript
import { DEFAULT_SITE_NAME } from '@/utilities/getSiteName'

// ... (kode lain tetap sama)

const title = doc?.meta?.title
  ? `${doc.meta.title} | ${DEFAULT_SITE_NAME}`
  : DEFAULT_SITE_NAME
```

**Perubahan:**
- Import `DEFAULT_SITE_NAME`
- Ganti kedua instance `'Payload Website Template'` dengan `DEFAULT_SITE_NAME`

**File lengkap sesudah perubahan:**
```typescript
import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import { DEFAULT_SITE_NAME } from '@/utilities/getSiteName'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
}): Promise<Metadata> => {
  const { doc } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title
    ? `${doc.meta.title} | ${DEFAULT_SITE_NAME}`
    : DEFAULT_SITE_NAME

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}
```

---

### 3. `src/plugins/index.ts`

**Sebelum:**
```typescript
const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Website Template` : 'Payload Website Template'
}
```

**Sesudah:**
```typescript
import { DEFAULT_SITE_NAME } from '@/utilities/getSiteName'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | ${DEFAULT_SITE_NAME}` : DEFAULT_SITE_NAME
}
```

**Catatan:** Tambahkan import `DEFAULT_SITE_NAME` di bagian atas file, bersama import lainnya.

---

### 4. `src/app/(frontend)/posts/page.tsx`

**Sebelum:**
```typescript
export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Posts`,
  }
}
```

**Sesudah:**
```typescript
import { DEFAULT_SITE_NAME } from '@/utilities/getSiteName'

// ... (kode lain tetap sama)

export function generateMetadata(): Metadata {
  return {
    title: `Posts | ${DEFAULT_SITE_NAME}`,
  }
}
```

---

### 5. `src/app/(frontend)/posts/page/[pageNumber]/page.tsx`

**Sebelum:**
```typescript
export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `Payload Website Template Posts Page ${pageNumber || ''}`,
  }
}
```

**Sesudah:**
```typescript
import { DEFAULT_SITE_NAME } from '@/utilities/getSiteName'

// ... (kode lain tetap sama)

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `Posts Halaman ${pageNumber || ''} | ${DEFAULT_SITE_NAME}`,
  }
}
```

---

### 6. `src/app/(frontend)/search/page.tsx`

**Sebelum:**
```typescript
export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Search`,
  }
}
```

**Sesudah:**
```typescript
import { DEFAULT_SITE_NAME } from '@/utilities/getSiteName'

// ... (kode lain tetap sama)

export function generateMetadata(): Metadata {
  return {
    title: `Pencarian | ${DEFAULT_SITE_NAME}`,
  }
}
```

---

### 7. `src/app/(frontend)/layout.tsx`

**Sebelum:**
```typescript
export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
```

**Sesudah:**
```typescript
export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    // Hapus creator @payloadcms — ganti dengan handle ponpes jika ada
  },
}
```

**Perubahan:**
- Hapus `creator: '@payloadcms'` (atau ganti dengan handle media sosial ponpes jika ada)

---

## Ringkasan Semua Perubahan

| File | Apa yang Berubah |
|---|---|
| `src/utilities/mergeOpenGraph.ts` | description, siteName, title |
| `src/utilities/generateMeta.ts` | title suffix dan fallback |
| `src/plugins/index.ts` | `generateTitle` function |
| `src/app/(frontend)/posts/page.tsx` | metadata title |
| `src/app/(frontend)/posts/page/[pageNumber]/page.tsx` | metadata title |
| `src/app/(frontend)/search/page.tsx` | metadata title |
| `src/app/(frontend)/layout.tsx` | twitter creator |

---

## Verifikasi

```bash
# Build test — pastikan tidak ada error
pnpm build

# Atau dev mode
pnpm dev
```

**Demo manual:** Buka setiap halaman berikut dan periksa browser tab title:

| Halaman | Expected Tab Title |
|---|---|
| Homepage (`/`) | `Ponpes Abu Bakar Sidik` (atau title dari meta di admin) |
| Posts (`/posts`) | `Posts \| Ponpes Abu Bakar Sidik` |
| Posts Page 2 (`/posts/page/2`) | `Posts Halaman 2 \| Ponpes Abu Bakar Sidik` |
| Search (`/search`) | `Pencarian \| Ponpes Abu Bakar Sidik` |
| Any page with custom SEO title | `[Custom Title] \| Ponpes Abu Bakar Sidik` |

**Periksa juga:** Klik kanan → View Page Source → cari `og:site_name`, `og:title`, dan `og:description` — tidak boleh ada "Payload".

---

## Checklist

- [ ] `src/utilities/mergeOpenGraph.ts` — description, siteName, title diganti
- [ ] `src/utilities/generateMeta.ts` — import + ganti title logic
- [ ] `src/plugins/index.ts` — import + ganti generateTitle
- [ ] `src/app/(frontend)/posts/page.tsx` — metadata title
- [ ] `src/app/(frontend)/posts/page/[pageNumber]/page.tsx` — metadata title
- [ ] `src/app/(frontend)/search/page.tsx` — metadata title
- [ ] `src/app/(frontend)/layout.tsx` — hapus twitter creator @payloadcms
- [ ] `pnpm build` berhasil tanpa error
- [ ] Semua halaman frontend tidak menampilkan "Payload" di tab title
