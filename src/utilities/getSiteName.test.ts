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

  it('DEFAULT_SITE_NAME adalah Ponpes Abu Bakar Shiddiq', () => {
    expect(DEFAULT_SITE_NAME).toBe('Ponpes Abu Bakar Shiddiq')
  })
})
