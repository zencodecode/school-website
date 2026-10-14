# 01 — Rebranding: Utility `getSiteName` dan Default Values

## Objective

Buat fungsi reusable `getSiteName()` yang mengambil `siteName` dari Header global config (cached), dengan fallback `'Ponpes Abu Bakar Sidik'`. Ubah semua default value dan fallback string yang sebelumnya `'School Website'`.

---

## Konteks

Proyek ini sudah memiliki field `siteName` di Header global config (`src/Header/config.ts`) dengan default value `'School Website'`. Header dan Footer component sudah mengonsumsi field ini. Yang perlu dilakukan:

1. Ubah default value ke `'Ponpes Abu Bakar Sidik'`
2. Buat utility function `getSiteName()` untuk digunakan di tempat lain (metadata, SEO, dll)
3. Ubah semua fallback string yang masih `'School Website'`

---

## File yang Dibuat

### `src/utilities/getSiteName.ts` (BARU)

```typescript
import { getCachedGlobal } from '@/utilities/getGlobals'

const DEFAULT_SITE_NAME = 'Ponpes Abu Bakar Sidik'

/**
 * Mengambil nama situs dari Header global config (cached).
 * Fallback ke DEFAULT_SITE_NAME jika belum diset di admin panel.
 */
export async function getSiteName(): Promise<string> {
  try {
    const header = await getCachedGlobal('header', 2)()
    return header?.siteName || DEFAULT_SITE_NAME
  } catch {
    return DEFAULT_SITE_NAME
  }
}

export { DEFAULT_SITE_NAME }
```

**Catatan:** `DEFAULT_SITE_NAME` di-export terpisah agar bisa digunakan di file-file yang butuh synchronous value (seperti `generateMetadata` static export yang tidak bisa async di beberapa konteks).

---

## File yang Dimodifikasi

### 1. `src/Header/config.ts`

**Sebelum:**
```typescript
{
  name: 'siteName',
  type: 'text',
  label: 'Site Name',
  defaultValue: 'School Website',
  admin: {
    description:
      'Displayed as a fallback if logo is not uploaded, and used as the logo alt text.',
  },
},
```

**Sesudah:**
```typescript
{
  name: 'siteName',
  type: 'text',
  label: 'Site Name',
  defaultValue: 'Ponpes Abu Bakar Sidik',
  admin: {
    description:
      'Displayed as a fallback if logo is not uploaded, and used as the logo alt text.',
  },
},
```

---

### 2. `src/Header/Component.client.tsx`

**Sebelum (baris ~39):**
```typescript
const siteName = data.siteName || 'School Website'
```

**Sesudah:**
```typescript
const siteName = data.siteName || 'Ponpes Abu Bakar Sidik'
```

---

### 3. `src/Footer/Component.tsx`

**Sebelum (baris ~20):**
```typescript
const siteName = headerData?.siteName || 'School Website'
```

**Sesudah:**
```typescript
const siteName = headerData?.siteName || 'Ponpes Abu Bakar Sidik'
```

---

## Test Requirements

### `src/utilities/getSiteName.test.ts` (BARU)

```typescript
import { describe, it, expect, vi } from 'vitest'
import { getSiteName, DEFAULT_SITE_NAME } from './getSiteName'

// Mock getCachedGlobal
vi.mock('@/utilities/getGlobals', () => ({
  getCachedGlobal: vi.fn(),
}))

import { getCachedGlobal } from '@/utilities/getGlobals'

describe('getSiteName', () => {
  it('mengembalikan siteName dari header global jika ada', async () => {
    const mockHeader = { siteName: 'Nama Kustom' }
    vi.mocked(getCachedGlobal).mockReturnValue(() => Promise.resolve(mockHeader) as any)

    const result = await getSiteName()
    expect(result).toBe('Nama Kustom')
  })

  it('mengembalikan DEFAULT_SITE_NAME jika siteName kosong', async () => {
    const mockHeader = { siteName: '' }
    vi.mocked(getCachedGlobal).mockReturnValue(() => Promise.resolve(mockHeader) as any)

    const result = await getSiteName()
    expect(result).toBe(DEFAULT_SITE_NAME)
  })

  it('mengembalikan DEFAULT_SITE_NAME jika siteName null', async () => {
    const mockHeader = { siteName: null }
    vi.mocked(getCachedGlobal).mockReturnValue(() => Promise.resolve(mockHeader) as any)

    const result = await getSiteName()
    expect(result).toBe(DEFAULT_SITE_NAME)
  })

  it('mengembalikan DEFAULT_SITE_NAME jika terjadi error', async () => {
    vi.mocked(getCachedGlobal).mockReturnValue(() => {
      throw new Error('DB connection failed')
    })

    const result = await getSiteName()
    expect(result).toBe(DEFAULT_SITE_NAME)
  })

  it('DEFAULT_SITE_NAME adalah Ponpes Abu Bakar Sidik', () => {
    expect(DEFAULT_SITE_NAME).toBe('Ponpes Abu Bakar Sidik')
  })
})
```

---

## Verifikasi

Setelah implementasi, jalankan:

```bash
# Unit test
pnpm vitest run src/utilities/getSiteName.test.ts

# Dev server
pnpm dev
```

**Demo:** Buka browser → navigasi ke website → Header dan Footer harus menampilkan "Ponpes Abu Bakar Sidik" sebagai fallback text (saat logo belum di-upload via admin panel).

---

## Checklist

- [ ] File `src/utilities/getSiteName.ts` dibuat
- [ ] Default value di `src/Header/config.ts` diubah
- [ ] Fallback di `src/Header/Component.client.tsx` diubah
- [ ] Fallback di `src/Footer/Component.tsx` diubah
- [ ] Test `src/utilities/getSiteName.test.ts` dibuat dan passing
- [ ] Dev server berjalan tanpa error
