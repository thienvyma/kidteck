import assert from 'node:assert/strict'
import test from 'node:test'

import { assertLandingContentWriteVersion } from './landing-content-version.js'

test('landing content save requires a version when database content already exists', () => {
  assert.throws(
    () => assertLandingContentWriteVersion({ updatedAt: '2026-05-27T07:00:00Z' }, ''),
    /Reload landing content before saving/
  )
})

test('landing content save accepts matching version intent from admin editor', () => {
  assert.doesNotThrow(() =>
    assertLandingContentWriteVersion(
      { updatedAt: '2026-05-27T07:00:00Z' },
      '2026-05-27T07:00:00Z'
    )
  )
})

test('landing content first seed can save without a version', () => {
  assert.doesNotThrow(() => assertLandingContentWriteVersion(null, ''))
})
