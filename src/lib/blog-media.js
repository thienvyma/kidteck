export function normalizeImageUrl(value) {
  if (typeof value !== 'string') return ''

  let url = value.trim()
  if (!url) return ''

  url = normalizeGoogleDriveImageUrl(url)

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

function normalizeGoogleDriveImageUrl(url) {
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (driveFileMatch?.[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`
  }

  const driveUcMatch = url.match(/drive\.google\.com\/uc\?.*?id=([a-zA-Z0-9_-]+)/)
  if (driveUcMatch?.[1]) {
    return `https://lh3.googleusercontent.com/d/${driveUcMatch[1]}`
  }

  const driveOpenMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/)
  if (driveOpenMatch?.[1]) {
    return `https://lh3.googleusercontent.com/d/${driveOpenMatch[1]}`
  }

  return url
}
