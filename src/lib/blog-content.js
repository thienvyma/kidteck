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

function htmlToPlainText(value) {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|blockquote|tr)>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;|\u00a0/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function readHtmlAttribute(tag, attribute) {
  const pattern = new RegExp(`${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i')
  const match = tag.match(pattern)
  return match ? match[1] || match[2] || match[3] || '' : ''
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

async function sanitizeArticleHtml(html) {
  try {
    const { sanitizeHTML } = await import('@/lib/sanitize')
    return sanitizeHTML(html)
  } catch (error) {
    console.error('Blog article sanitize fallback:', error)
    return textToArticleHtml(htmlToPlainText(html))
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
