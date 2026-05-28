import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const layoutSource = readFileSync(new URL('./layout.js', import.meta.url), 'utf8')

test('site metadata uses the approved title, description, and project logo', () => {
  assert.match(
    layoutSource,
    /AIgenlabs — Project-Based AI Learning for the Next Generation/
  )
  assert.match(
    layoutSource,
    /Sự phát triển phi mã của AI đang rút ngắn vòng đời của kiến thức/
  )
  assert.match(layoutSource, /const siteLogo = '\/AIGen_blacklogo\.png'/)
  assert.match(layoutSource, /icons:\s*\{/)
  assert.match(layoutSource, /openGraph:\s*\{/)
  assert.match(layoutSource, /twitter:\s*\{/)
})
