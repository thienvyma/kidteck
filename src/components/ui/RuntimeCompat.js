'use client'

import { useEffect } from 'react'

const SAFARI_UA_PATTERN = /Safari/i
const NON_SAFARI_UA_PATTERN = /Chrome|CriOS|Edg|OPR|SamsungBrowser|Android|FxiOS/i

function isSafariBrowser(userAgent) {
  return SAFARI_UA_PATTERN.test(userAgent) && !NON_SAFARI_UA_PATTERN.test(userAgent)
}

export default function RuntimeCompat() {
  useEffect(() => {
    const root = document.documentElement
    const userAgent = navigator.userAgent
    const safari = isSafariBrowser(userAgent)

    if (safari) {
      root.dataset.browser = 'safari'
    }

    const updateViewportHeight = () => {
      root.style.setProperty('--app-viewport-height', `${window.innerHeight}px`)
    }

    updateViewportHeight()
    window.addEventListener('resize', updateViewportHeight, { passive: true })
    window.addEventListener('orientationchange', updateViewportHeight)

    return () => {
      window.removeEventListener('resize', updateViewportHeight)
      window.removeEventListener('orientationchange', updateViewportHeight)

      if (root.dataset.browser === 'safari') {
        delete root.dataset.browser
      }
    }
  }, [])

  return null
}
