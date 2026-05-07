import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const css = readFileSync(new URL('./blog.module.css', import.meta.url), 'utf8')

test('mobile covers keep the source image ratio instead of fixed frames', () => {
  const mobileNaturalCoverRule = css.match(
    /@media \(max-width: 768px\)[\s\S]*?\.heroImageWrapper,[\s\S]*?\.hImageWrapper:not\(\.hImageWrapperEmpty\),[\s\S]*?\.articleCoverWrapper \{(?<body>[\s\S]*?)\}/
  )?.groups?.body

  assert.ok(mobileNaturalCoverRule, 'expected a mobile natural cover wrapper rule')
  assert.match(mobileNaturalCoverRule, /aspect-ratio:\s*auto;/)
  assert.match(mobileNaturalCoverRule, /height:\s*auto;/)
  assert.match(mobileNaturalCoverRule, /max-height:\s*none;/)
  assert.match(mobileNaturalCoverRule, /background:\s*transparent;/)

  const naturalPictureRule = css.match(
    /@media \(max-width: 768px\)[\s\S]*?\.articleCoverWrapper \.coverPicture \{(?<body>[\s\S]*?)\}/
  )?.groups?.body

  assert.ok(naturalPictureRule, 'expected a mobile natural-size picture rule')
  assert.match(naturalPictureRule, /width:\s*auto;/)
  assert.match(naturalPictureRule, /max-width:\s*100%;/)
  assert.match(naturalPictureRule, /height:\s*auto;/)
})
