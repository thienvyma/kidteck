import { normalizeImageUrl } from '@/lib/blog-media'

export function hasArticleHtml(value) {
  return /<[a-z][\s\S]*>/i.test(String(value || ''))
}

export function normalizeArticleContent(value) {
  if (typeof value !== 'string') return ''

  return value
    .replace(/&nbsp;|&#160;|\u00a0/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
}

export function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function textToArticleHtml(value) {
  return String(value)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHTML(block).replace(/\n/g, '<br />')}</p>`)
    .join('')
}

function readHtmlAttribute(tag, attribute) {
  const pattern = new RegExp(`${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i')
  const match = tag.match(pattern)
  return match ? match[1] || match[2] || match[3] || '' : ''
}

function isSafeLinkUrl(value) {
  const url = String(value || '').trim()
  if (!url) return false

  if (url.startsWith('/') || url.startsWith('#')) {
    return true
  }

  try {
    const parsed = new URL(url)
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

function normalizeLengthAttribute(value) {
  const normalized = String(value || '').trim()
  return /^\d{1,5}$/.test(normalized) ? normalized : ''
}

export function normalizeEmbeddedImages(html) {
  return String(html).replace(/<img\b[^>]*>/gi, (tag) => {
    const imageUrl = normalizeImageUrl(readHtmlAttribute(tag, 'src'))
    if (!imageUrl) return ''

    const alt = readHtmlAttribute(tag, 'alt')
    return `<img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(alt)}" referrerpolicy="no-referrer" loading="lazy" decoding="async" />`
  })
}

export function enhanceArticleHtml(html) {
  return String(html)
    .replace(/<p>(?:\s|<br\s*\/?>)*<\/p>/gi, '')
    .replace(/<p>\s*[-\u2022]\s*([^<]+?)\s*<\/p>/gi, '<ul><li>$1</li></ul>')
    .replace(/<\/ul>\s*<ul>/gi, '')
}

function fallbackSanitizeHTML(html) {
  const allowedTags = new Set([
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'ul', 'ol', 'li',
    'strong', 'em', 'b', 'i', 'u', 's',
    'a', 'img',
    'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span', 'sub', 'sup',
  ])

  return String(html)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\s*(script|style|iframe|object|embed|svg|math|form)[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*\/?\s*(script|style|iframe|object|embed|svg|math|form|input|button|textarea|select|option|meta|link)[^>]*>/gi, '')
    .replace(/<\s*(\/?)([a-z][a-z0-9-]*)([^>]*)>/gi, (match, closingSlash, rawTagName, rawAttrs = '') => {
      const tagName = rawTagName.toLowerCase()
      if (!allowedTags.has(tagName)) return ''

      if (closingSlash) {
        return ['br', 'hr', 'img'].includes(tagName) ? '' : `</${tagName}>`
      }

      if (tagName === 'br' || tagName === 'hr') {
        return `<${tagName}>`
      }

      if (tagName === 'img') {
        const imageUrl = normalizeImageUrl(readHtmlAttribute(match, 'src'))
        if (!imageUrl) return ''

        const alt = readHtmlAttribute(match, 'alt')
        const width = normalizeLengthAttribute(readHtmlAttribute(match, 'width'))
        const height = normalizeLengthAttribute(readHtmlAttribute(match, 'height'))

        return [
          `<img src="${escapeHTML(imageUrl)}"`,
          `alt="${escapeHTML(alt)}"`,
          width ? `width="${width}"` : '',
          height ? `height="${height}"` : '',
          'referrerpolicy="no-referrer"',
          'loading="lazy"',
          'decoding="async"',
          '/>',
        ].filter(Boolean).join(' ')
      }

      if (tagName === 'a') {
        const href = readHtmlAttribute(match, 'href')
        if (!isSafeLinkUrl(href)) return '<a>'

        const title = readHtmlAttribute(match, 'title')
        const target = readHtmlAttribute(match, 'target') === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : ''
        return `<a href="${escapeHTML(href)}"${title ? ` title="${escapeHTML(title)}"` : ''}${target}>`
      }

      const className = readHtmlAttribute(`<${tagName}${rawAttrs}>`, 'class')
      const safeClassName = className
        .split(/\s+/)
        .filter((item) => /^ql-(align|indent|direction)-[\w-]+$/.test(item))
        .join(' ')

      return safeClassName ? `<${tagName} class="${escapeHTML(safeClassName)}">` : `<${tagName}>`
    })
}

async function sanitizeArticleHtml(html) {
  try {
    const { sanitizeHTML } = await import('@/lib/sanitize')
    return sanitizeHTML(html)
  } catch (error) {
    console.error('Blog article sanitize fallback:', error)
    return fallbackSanitizeHTML(html)
  }
}

export async function buildSafeArticleHtml(content) {
  const normalizedContent = normalizeArticleContent(content)
  const sourceHtml = hasArticleHtml(normalizedContent)
    ? normalizedContent
    : textToArticleHtml(normalizedContent)
  const sanitizedHtml = await sanitizeArticleHtml(sourceHtml)
  return normalizeEmbeddedImages(enhanceArticleHtml(sanitizedHtml))
}

export async function normalizeBlogContentForStorage(content) {
  const normalizedContent = normalizeArticleContent(content)
  if (!normalizedContent || !hasArticleHtml(normalizedContent)) {
    return normalizedContent
  }

  return buildSafeArticleHtml(normalizedContent)
}
