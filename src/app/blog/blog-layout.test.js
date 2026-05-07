import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const css = readFileSync(new URL('./blog.module.css', import.meta.url), 'utf8')

function lastRuleBody(pattern) {
  return [...css.matchAll(pattern)].at(-1)?.groups?.body
}

test('desktop primary covers render as natural images instead of 16:9 frames', () => {
  const primaryWrapperRule = lastRuleBody(
    /\.heroImageWrapper,\s*[\s\S]*?\.articleCoverWrapper \{(?<body>[\s\S]*?)\}/g
  )

  assert.ok(primaryWrapperRule, 'expected a desktop natural primary cover wrapper rule')
  assert.match(primaryWrapperRule, /width:\s*fit-content;/)
  assert.match(primaryWrapperRule, /max-width:\s*100%;/)
  assert.match(primaryWrapperRule, /height:\s*auto;/)
  assert.match(primaryWrapperRule, /max-height:\s*none;/)
  assert.match(primaryWrapperRule, /aspect-ratio:\s*auto;/)
  assert.match(primaryWrapperRule, /background:\s*transparent;/)
  assert.match(primaryWrapperRule, /align-self:\s*center;/)

  const primaryImageRule = lastRuleBody(
    /\.heroImageWrapper \.heroImage,\s*[\s\S]*?\.articleCoverWrapper \.articleCover \{(?<body>[\s\S]*?)\}/g
  )

  assert.ok(primaryImageRule, 'expected a desktop natural primary cover image rule')
  assert.match(primaryImageRule, /width:\s*auto;/)
  assert.match(primaryImageRule, /max-width:\s*100%;/)
  assert.match(primaryImageRule, /height:\s*auto;/)
})

test('mobile covers keep the source image ratio instead of fixed frames', () => {
  const mobileNaturalCoverRule = lastRuleBody(
    /@media \(max-width: 768px\)[\s\S]*?\.hImageWrapper:not\(\.hImageWrapperEmpty\) \{(?<body>[\s\S]*?)\}/g
  )

  assert.ok(mobileNaturalCoverRule, 'expected a mobile natural feed cover wrapper rule')
  assert.match(mobileNaturalCoverRule, /width:\s*fit-content;/)
  assert.match(mobileNaturalCoverRule, /max-width:\s*100%;/)
  assert.match(mobileNaturalCoverRule, /aspect-ratio:\s*auto;/)
  assert.match(mobileNaturalCoverRule, /height:\s*auto;/)
  assert.match(mobileNaturalCoverRule, /max-height:\s*none;/)
  assert.match(mobileNaturalCoverRule, /background:\s*transparent;/)

  const naturalPictureRule = lastRuleBody(
    /@media \(max-width: 768px\)[\s\S]*?\.hImageWrapper:not\(\.hImageWrapperEmpty\) \.coverPicture \{(?<body>[\s\S]*?)\}/g
  )

  assert.ok(naturalPictureRule, 'expected a mobile natural-size picture rule')
  assert.match(naturalPictureRule, /width:\s*auto;/)
  assert.match(naturalPictureRule, /max-width:\s*100%;/)
  assert.match(naturalPictureRule, /height:\s*auto;/)
})
