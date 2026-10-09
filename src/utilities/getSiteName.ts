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
