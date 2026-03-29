import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content — remove scripts, event handlers, dangerous tags.
 * Safe to use with React's dangerouslySetInnerHTML.
 *
 * Whitelist approach: only allows known-safe tags and attributes.
 */
export function sanitizeHTML(dirty) {
  if (!dirty) return ''
  // SSR fallback — DOMPurify requires window/document
  if (typeof window === 'undefined') return dirty
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'em', 'b', 'i', 'u', 's',
      'a', 'img',
      'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'sub', 'sup',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class',
      'target', 'rel', 'width', 'height',
    ],
    ALLOW_DATA_ATTR: false,
  })
}
