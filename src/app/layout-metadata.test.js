import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const layoutSource = readFileSync(new URL('./layout.js', import.meta.url), 'utf8')

function readPngSize(fileUrl) {
  const bytes = readFileSync(fileUrl)

  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')

  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  }
}

test('site metadata uses the approved title, description, and project logo', () => {
  assert.match(
    layoutSource,
    /AIgenlabs — Project-Based AI Learning for the Next Generation/
  )
  assert.match(
    layoutSource,
    /Sự phát triển phi mã của AI đang rút ngắn vòng đời của kiến thức/
  )
  assert.match(layoutSource, /const siteIcon = '\/aigenlabs-meta-icon\.png'/)
  assert.match(layoutSource, /url:\s*siteIcon,\s*width:\s*512,\s*height:\s*512,/)
  assert.match(layoutSource, /card:\s*'summary'/)
  assert.match(layoutSource, /icons:\s*\{/)
  assert.match(layoutSource, /openGraph:\s*\{/)
  assert.match(layoutSource, /twitter:\s*\{/)
})

test('metadata image assets use preview-safe dimensions', () => {
  assert.deepEqual(readPngSize(new URL('../../public/aigenlabs-meta-icon.png', import.meta.url)), {
    width: 512,
    height: 512,
  })
  assert.deepEqual(readPngSize(new URL('./icon.png', import.meta.url)), {
    width: 512,
    height: 512,
  })
})
