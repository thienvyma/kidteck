'use client'

import { useEffect, useState } from 'react'
import LandingPageView from '@/components/landing/LandingPageView'

const PREVIEW_MESSAGE_TYPE = 'landing-preview:update'
const PREVIEW_SECTION_SELECT_MESSAGE_TYPE = 'landing-preview:section-select'

export default function LandingPreviewClient({ initialContent, levels }) {
  const [content, setContent] = useState(initialContent)
  const [selectedSection, setSelectedSection] = useState('header')

  useEffect(() => {
    function handleMessage(event) {
      if (event.origin !== window.location.origin) {
        return
      }

      if (event.data?.type !== PREVIEW_MESSAGE_TYPE) {
        return
      }

      if (!event.data.content || typeof event.data.content !== 'object') {
        return
      }

      setContent(event.data.content)
      if (typeof event.data.activeSection === 'string' && event.data.activeSection) {
        setSelectedSection(event.data.activeSection)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    function handlePreviewClick(event) {
      const target = event.target

      if (!(target instanceof Element)) {
        return
      }

      const sectionElement = target.closest('[data-landing-preview-section]')
      if (!(sectionElement instanceof HTMLElement)) {
        return
      }

      const sectionId = sectionElement.dataset.landingPreviewSection
      if (!sectionId) {
        return
      }

      event.preventDefault()

      window.parent?.postMessage(
        {
          type: PREVIEW_SECTION_SELECT_MESSAGE_TYPE,
          sectionId,
        },
        window.location.origin
      )

      setSelectedSection(sectionId)
    }

    document.addEventListener('click', handlePreviewClick, true)
    return () => document.removeEventListener('click', handlePreviewClick, true)
  }, [])

  return (
    <LandingPageView
      content={content}
      levels={levels}
      includeStructuredData={false}
      anchorBase="/landing-preview"
      previewMode
      selectedSectionId={selectedSection}
    />
  )
}
