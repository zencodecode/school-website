/**
 * Utility untuk mem-parsing URL video (YouTube / Vimeo) dan
 * menghasilkan URL embed yang aman untuk digunakan di <iframe>.
 *
 * Alasan keamanan: kita TIDAK pernah menaruh URL mentah dari admin
 * langsung ke src iframe. Sebaliknya kita ekstrak ID video, lalu
 * membangun URL embed sendiri. Ini mencegah injeksi iframe sembarangan.
 */

export type VideoProvider = 'youtube' | 'vimeo'

export interface VideoEmbedResult {
  provider: VideoProvider
  id: string
  embedUrl: string
}

/**
 * Ekstrak informasi embed dari URL video YouTube atau Vimeo.
 * Mengembalikan null jika URL tidak dikenali / tidak valid.
 *
 * Format YouTube yang didukung:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID
 *   - https://www.youtube.com/shorts/VIDEO_ID
 *   - https://www.youtube.com/live/VIDEO_ID
 *
 * Format Vimeo yang didukung:
 *   - https://vimeo.com/VIDEO_ID
 *   - https://player.vimeo.com/video/VIDEO_ID
 */
export function getVideoEmbed(rawInput?: string | null): VideoEmbedResult | null {
  if (!rawInput || typeof rawInput !== 'string') return null

  // Jika admin tidak sengaja menempel kode <iframe ... src="..."> penuh,
  // ekstrak nilai src-nya. Idealnya admin cukup menempel link biasa.
  const url = extractUrlFromMaybeIframe(rawInput.trim())
  if (!url) return null

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase()

  // ---------- YouTube ----------
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    // /watch?v=ID
    const vParam = parsed.searchParams.get('v')
    if (vParam && isValidYouTubeId(vParam)) {
      return buildYouTube(vParam)
    }

    // /embed/ID, /shorts/ID, /live/ID
    const segments = parsed.pathname.split('/').filter(Boolean)
    if (segments.length >= 2 && ['embed', 'shorts', 'live'].includes(segments[0])) {
      const id = segments[1]
      if (isValidYouTubeId(id)) return buildYouTube(id)
    }
  }

  if (host === 'youtu.be') {
    const id = parsed.pathname.split('/').filter(Boolean)[0]
    if (id && isValidYouTubeId(id)) return buildYouTube(id)
  }

  // ---------- Vimeo ----------
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const segments = parsed.pathname.split('/').filter(Boolean)
    // player.vimeo.com/video/ID  atau  vimeo.com/ID
    const candidate = segments[0] === 'video' ? segments[1] : segments[0]
    if (candidate && /^\d+$/.test(candidate)) {
      return {
        provider: 'vimeo',
        id: candidate,
        embedUrl: `https://player.vimeo.com/video/${candidate}`,
      }
    }
  }

  return null
}

/**
 * Jika input adalah kode <iframe ... src="..."> penuh (hasil tombol "Embed"
 * di YouTube), ambil nilai atribut src. Jika bukan, kembalikan input apa adanya
 * agar bisa diproses sebagai URL biasa.
 */
function extractUrlFromMaybeIframe(input: string): string {
  if (!input.toLowerCase().includes('<iframe')) return input

  const match = input.match(/\bsrc\s*=\s*["']([^"']+)["']/i)
  return match?.[1]?.trim() || ''
}

function buildYouTube(id: string): VideoEmbedResult {
  return {
    provider: 'youtube',
    id,
    // youtube-nocookie untuk privasi lebih baik (tidak set cookie tracking sampai diputar)
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
  }
}

function isValidYouTubeId(id: string): boolean {
  // ID video YouTube: 11 karakter alfanumerik, dash, underscore
  return /^[a-zA-Z0-9_-]{11}$/.test(id)
}
