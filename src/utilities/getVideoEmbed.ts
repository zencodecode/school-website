/**
 * Utility for parsing video URLs (YouTube / Vimeo) and producing a safe
 * embed URL for use in an <iframe>.
 *
 * Security rationale: we NEVER place the raw admin-provided URL directly into
 * the iframe src. Instead we extract the video ID and build the embed URL
 * ourselves. This prevents arbitrary iframe injection.
 */

export type VideoProvider = 'youtube' | 'vimeo'

export interface VideoEmbedResult {
  provider: VideoProvider
  id: string
  embedUrl: string
}

/**
 * Extracts embed info from a YouTube or Vimeo video URL.
 * Returns null if the URL is unrecognized / invalid.
 *
 * Supported YouTube formats:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID
 *   - https://www.youtube.com/shorts/VIDEO_ID
 *   - https://www.youtube.com/live/VIDEO_ID
 *
 * Supported Vimeo formats:
 *   - https://vimeo.com/VIDEO_ID
 *   - https://player.vimeo.com/video/VIDEO_ID
 */
export function getVideoEmbed(rawInput?: string | null): VideoEmbedResult | null {
  if (!rawInput || typeof rawInput !== 'string') return null

  // If the admin accidentally pasted a full <iframe ... src="..."> snippet,
  // extract its src value. Ideally the admin just pastes a plain link.
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
 * If the input is a full <iframe ... src="..."> snippet (from YouTube's "Embed"
 * button), take the src attribute value. Otherwise return the input as-is so it
 * can be processed as a plain URL.
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
    // youtube-nocookie for better privacy (no tracking cookies until playback)
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
  }
}

function isValidYouTubeId(id: string): boolean {
  // YouTube video ID: 11 alphanumeric characters, dash, underscore
  return /^[a-zA-Z0-9_-]{11}$/.test(id)
}
