export function normalizeImageUrl(value) {
  if (typeof value !== 'string') return ''

  const url = value.trim()
  if (!url) return ''

  if (url.startsWith('/')) {
    return url
  }

  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : ''
  } catch {
    return ''
  }
}

