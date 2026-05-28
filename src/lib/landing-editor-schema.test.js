import assert from 'node:assert/strict'
import test from 'node:test'

import { defaultLandingContent } from './landing-defaults.js'
import { LANDING_EDITOR_SECTION_MAP } from './landing-editor-schema.js'

test('results editor no longer exposes before or after columns', () => {
  const results = LANDING_EDITOR_SECTION_MAP.results
  const serialized = JSON.stringify(results)

  assert.equal(serialized.includes('beforeItems'), false)
  assert.equal(serialized.includes('afterItems'), false)
  assert.equal(serialized.includes('beforeTitle'), false)
  assert.equal(serialized.includes('afterTitle'), false)
  assert.equal(results.editorBlocks.some((block) => block.type === 'comparison'), false)
})

test('solution supports five or more pillars in defaults and editor schema', () => {
  const solutionRepeater = LANDING_EDITOR_SECTION_MAP.solution.editorBlocks.find(
    (block) => block.type === 'repeater' && block.arrayField === 'pillars'
  )

  assert.ok(solutionRepeater)
  assert.equal(solutionRepeater.maxItems, undefined)
  assert.ok(defaultLandingContent.solution.pillars.length >= 5)
})
