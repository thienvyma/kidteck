import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const adminCss = readFileSync(new URL('../admin.module.css', import.meta.url), 'utf8')
const pageSource = readFileSync(new URL('./page.js', import.meta.url), 'utf8')

function ruleBody(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return adminCss.match(new RegExp(`${escapedSelector}\\s*\\{(?<body>[\\s\\S]*?)\\}`))?.groups?.body
}

test('landing editor uses one scrollable context card on wide desktop', () => {
  const contextPaneRule = ruleBody('.landingContextPane')
  const contextCardRule = ruleBody('.landingContextCard')
  const contextFormRule = ruleBody('.landingContextForm')
  const contextDockRule = ruleBody('.landingContextDock')

  assert.ok(contextPaneRule, 'expected landing context pane CSS rule')
  assert.match(contextPaneRule, /position:\s*sticky;/)
  assert.match(contextPaneRule, /height:\s*auto;/)
  assert.match(contextPaneRule, /min-height:\s*0;/)
  assert.match(contextPaneRule, /overflow:\s*visible;/)

  assert.ok(contextCardRule, 'expected landing context card CSS rule')
  assert.match(contextCardRule, /max-height:\s*calc\(100dvh - 112px\);/)
  assert.match(contextCardRule, /overflow-y:\s*auto;/)
  assert.doesNotMatch(contextCardRule, /overflow:\s*hidden;/)

  assert.ok(contextFormRule, 'expected landing context form CSS rule')
  assert.match(contextFormRule, /overflow:\s*visible;/)
  assert.doesNotMatch(contextFormRule, /overflow:\s*auto;/)

  assert.ok(contextDockRule, 'expected landing context dock CSS rule')
  assert.match(contextDockRule, /position:\s*sticky;/)
  assert.match(contextDockRule, /bottom:\s*0;/)
})

test('landing versions are opened from a compact dialog instead of occupying the editor card', () => {
  assert.match(pageSource, /const \[versionDialogOpen, setVersionDialogOpen\] = useState\(false\)/)
  assert.match(pageSource, /setVersionDialogOpen\(true\)/)
  assert.match(pageSource, /role="dialog"/)
  assert.match(pageSource, /aria-modal="true"/)
  assert.match(pageSource, /className=\{styles\.landingVersionSummaryButton\}/)
  assert.match(pageSource, /className=\{styles\.landingVersionModal\}/)
})
