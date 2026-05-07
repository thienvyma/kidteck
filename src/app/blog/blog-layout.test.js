import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const css = readFileSync(new URL('./blog.module.css', import.meta.url), 'utf8')

test('mobile art-directed covers keep the source image ratio instead of fixed frames', () => {
  const mobileArtDirectionRule = css.match(
    /@media \(max-width: 768px\)[\s\S]*?\.heroImageWrapper\.heroImageWrapperArtDirected,[\s\S]*?\.articleCoverWrapper\.articleCoverWrapperArtDirected \{(?<body>[\s\S]*?)\}/
  )?.groups?.body

  assert.ok(mobileArtDirectionRule, 'expected a mobile art-direction wrapper rule')
  assert.match(mobileArtDirectionRule, /aspect-ratio:\s*auto;/)
  assert.match(mobileArtDirectionRule, /height:\s*auto;/)
  assert.match(mobileArtDirectionRule, /max-height:\s*none;/)
  assert.match(mobileArtDirectionRule, /background:\s*transparent;/)

  const naturalPictureRule = css.match(
    /@media \(max-width: 768px\)[\s\S]*?\.articleCoverWrapperArtDirected \.coverPicture \{(?<body>[\s\S]*?)\}/
  )?.groups?.body

  assert.ok(naturalPictureRule, 'expected a mobile natural-size picture rule')
  assert.match(naturalPictureRule, /width:\s*auto;/)
  assert.match(naturalPictureRule, /max-width:\s*100%;/)
  assert.match(naturalPictureRule, /height:\s*auto;/)
})
