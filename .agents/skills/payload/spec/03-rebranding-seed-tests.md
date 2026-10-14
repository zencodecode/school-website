# 03 — Rebranding: Update Seed Data & Test Files

## Objective

Bersihkan semua referensi "Payload" dari seed data (data awal yang di-generate saat pertama kali setup) dan test assertions. Ini memastikan bahwa jika database di-seed ulang, semua konten sudah menggunakan nama "Ponpes Abu Bakar Sidik".

---

## Prasyarat

Task 1 (`01-rebranding-sitename.md`) sudah selesai — `DEFAULT_SITE_NAME` tersedia.

---

## Files yang Dimodifikasi (5 files)

### 1. `src/endpoints/seed/home.ts`

File ini berisi data seed untuk homepage. Ada beberapa tempat yang perlu diubah:

**Perubahan A — Hero heading text (sekitar baris 51):**

Sebelum:
```typescript
text: 'Payload Website Template',
```

Sesudah:
```typescript
text: 'Ponpes Abu Bakar Sidik',
```

**Perubahan B — Meta description (sekitar baris 670-673):**

Sebelum:
```typescript
meta: {
  description: 'An open-source website built with Payload and Next.js.',
  image: heroImage.id,
  title: 'Payload Website Template',
},
```

Sesudah:
```typescript
meta: {
  description: 'Website resmi Pondok Pesantren Abu Bakar Sidik.',
  image: heroImage.id,
  title: 'Ponpes Abu Bakar Sidik',
},
```

**Cara menemukan lokasi pasti:**
```bash
# Cari semua instance di file
grep -n "Payload Website Template" src/endpoints/seed/home.ts
grep -n "An open-source website built with Payload" src/endpoints/seed/home.ts
```

---

### 2. `src/endpoints/seed/home-static.ts`

File ini sama persis strukturnya dengan `home.ts` tapi untuk static seed data.

**Perubahan A — Hero heading text (sekitar baris 22):**

Sebelum:
```typescript
text: 'Payload Website Template',
```

Sesudah:
```typescript
text: 'Ponpes Abu Bakar Sidik',
```

**Perubahan B — Meta (sekitar baris 83-85):**

Sebelum:
```typescript
meta: {
  description: 'An open-source website built with Payload and Next.js.',
  title: 'Payload Website Template',
},
```

Sesudah:
```typescript
meta: {
  description: 'Website resmi Pondok Pesantren Abu Bakar Sidik.',
  title: 'Ponpes Abu Bakar Sidik',
},
```

---

### 3. `src/endpoints/seed/contact-form.ts`

**Perubahan — emailFrom (sekitar baris 38):**

Sebelum:
```typescript
emailFrom: '"Payload" \u003Cdemo@payloadcms.com\u003E',
```

Sesudah:
```typescript
emailFrom: '"Ponpes Abu Bakar Sidik" \u003Cnoreply@ponpesabubakarsidik.com\u003E',
```

**Catatan:** `\u003C` dan `\u003E` adalah unicode escape untuk `<` dan `>`. Jadi hasilnya: `"Ponpes Abu Bakar Sidik" <noreply@ponpesabubakarsidik.com>`

---

### 4. `tests/e2e/frontend.e2e.spec.ts`

**Sebelum:**
```typescript
test('can load homepage', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await expect(page).toHaveTitle(/Payload Website Template/)
  const heading = page.locator('h1').first()
  await expect(heading).toHaveText('Payload Website Template')
})
```

**Sesudah:**
```typescript
test('can load homepage', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await expect(page).toHaveTitle(/Ponpes Abu Bakar Sidik/)
  const heading = page.locator('h1').first()
  await expect(heading).toHaveText('Ponpes Abu Bakar Sidik')
})
```

---

### 5. `public/website-template-OG.webp` (OG Image)

File ini adalah gambar OpenGraph default yang muncul saat link website di-share di media sosial. Saat ini masih berisi branding Payload.

**Opsi:**
- **Opsi A (cepat):** Biarkan dulu, ganti nanti setelah ada desain OG image yang proper untuk Ponpes
- **Opsi B (ideal):** Buat OG image baru berukuran 1200x630px dengan:
  - Nama "Ponpes Abu Bakar Sidik"
  - Logo ponpes
  - Background yang sesuai
  - Simpan sebagai `public/website-template-OG.webp` (atau rename dan update referensi di `mergeOpenGraph.ts` dan `generateMeta.ts`)

**Reminder:** Buat issue/task terpisah untuk desain OG image yang proper.

---

## Verifikasi

```bash
# Jalankan semua test
pnpm test

# Atau hanya e2e test
pnpm test:e2e

# Atau hanya integration test
pnpm test:int
```

**Catatan:** E2E test (`test:e2e`) memerlukan server berjalan di `localhost:3000`. Jalankan `pnpm dev` di terminal terpisah sebelum menjalankan e2e test, atau gunakan `pnpm dev:prod` untuk build + start.

**Demo:** Seed ulang database via admin panel (atau endpoint `/next/seed`), kemudian buka homepage — heading harus menampilkan "Ponpes Abu Bakar Sidik".

---

## Semua String yang Diganti (Quick Reference)

| String Lama | String Baru | File |
|---|---|---|
| `'Payload Website Template'` | `'Ponpes Abu Bakar Sidik'` | `home.ts`, `home-static.ts` (heading) |
| `'Payload Website Template'` | `'Ponpes Abu Bakar Sidik'` | `home.ts`, `home-static.ts` (meta title) |
| `'An open-source website built with Payload and Next.js.'` | `'Website resmi Pondok Pesantren Abu Bakar Sidik.'` | `home.ts`, `home-static.ts` (meta desc) |
| `'"Payload" <demo@payloadcms.com>'` | `'"Ponpes Abu Bakar Sidik" <noreply@ponpesabubakarsidik.com>'` | `contact-form.ts` |
| `/Payload Website Template/` | `/Ponpes Abu Bakar Sidik/` | `frontend.e2e.spec.ts` |

---

## Checklist

- [ ] `src/endpoints/seed/home.ts` — hero text + meta diubah
- [ ] `src/endpoints/seed/home-static.ts` — hero text + meta diubah
- [ ] `src/endpoints/seed/contact-form.ts` — emailFrom diubah
- [ ] `tests/e2e/frontend.e2e.spec.ts` — assertions diubah
- [ ] `pnpm test:int` passing
- [ ] `pnpm test:e2e` passing (dengan server running)
- [ ] TODO: Buat OG image baru untuk ponpes (task terpisah)
