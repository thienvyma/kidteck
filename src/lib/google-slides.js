function buildEmbedUrl(basePath, originalUrl) {
  const params = new URLSearchParams(originalUrl.search)

  if (!params.has('start')) {
    params.set('start', 'false')
  }
  if (!params.has('loop')) {
    params.set('loop', 'false')
  }
  if (!params.has('delayms')) {
    params.set('delayms', '8000')
  }

  return `${basePath}?${params.toString()}`
}

export function normalizeGoogleSlidesEmbedUrl(rawUrl) {
  if (!rawUrl) {
    return null
  }

  try {
    const url = new URL(rawUrl)
    if (url.hostname !== 'docs.google.com') {
      return null
    }

    const publishedMatch = url.pathname.match(/^\/presentation\/d\/e\/([^/]+)\/(pub|embed|present|edit)$/)
    if (publishedMatch) {
      return buildEmbedUrl(
        `https://docs.google.com/presentation/d/e/${publishedMatch[1]}/embed`,
        url
      )
    }

    const regularMatch = url.pathname.match(/^\/presentation\/d\/([^/]+)\/(edit|embed|present|pub)$/)
    if (regularMatch) {
      return buildEmbedUrl(
        `https://docs.google.com/presentation/d/${regularMatch[1]}/embed`,
        url
      )
    }

    return null
  } catch {
    return null
  }
}
