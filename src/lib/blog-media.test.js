import assert from 'node:assert/strict'
import test from 'node:test'

import { getBlogCoverImages } from './blog-media.js'

test('getBlogCoverImages normalizes desktop and mobile cover URLs', () => {
  const result = getBlogCoverImages({
    cover_image_url: 'https://drive.google.com/file/d/desktop-id_123/view',
    cover_image_mobile_url: 'https://drive.google.com/open?id=mobile-id_456',
  })

  assert.deepEqual(result, {
    desktop: 'https://lh3.googleusercontent.com/d/desktop-id_123',
    mobile: 'https://lh3.googleusercontent.com/d/mobile-id_456',
    hasMobileArtDirection: true,
  })
})

test('getBlogCoverImages falls back to desktop cover for legacy posts', () => {
  const result = getBlogCoverImages({
    cover_image_url: 'https://example.com/desktop.jpg',
    cover_image_mobile_url: '',
  })

  assert.deepEqual(result, {
    desktop: 'https://example.com/desktop.jpg',
    mobile: 'https://example.com/desktop.jpg',
    hasMobileArtDirection: false,
  })
})

test('getBlogCoverImages can use a mobile-only cover as a last-resort fallback', () => {
  const result = getBlogCoverImages({
    cover_image_url: '',
    cover_image_mobile_url: '/mobile-cover.jpg',
  })

  assert.deepEqual(result, {
    desktop: '/mobile-cover.jpg',
    mobile: '/mobile-cover.jpg',
    hasMobileArtDirection: false,
  })
})
