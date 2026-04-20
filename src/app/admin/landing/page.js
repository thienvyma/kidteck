'use client'

import { useDeferredValue, useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { cloneDefaultLandingContent } from '@/lib/landing-defaults'
import {
  LANDING_EDITOR_SECTIONS,
  LANDING_EDITOR_SECTION_MAP,
} from '@/lib/landing-editor-schema'
import FieldRenderer from '@/components/admin/landing/FieldRenderer'
import LandingSectionCard from '@/components/admin/landing/LandingSectionCard'
import RepeaterField from '@/components/admin/landing/RepeaterField'
import styles from '../admin.module.css'

const LANDING_SECTIONS = LANDING_EDITOR_SECTIONS
const SECTION_CONTENT_KEYS = Object.fromEntries(
  LANDING_SECTIONS.map((section) => [section.id, section.contentKey ?? null])
)
const PREVIEW_UPDATE_MESSAGE_TYPE = 'landing-preview:update'
const PREVIEW_SECTION_SELECT_MESSAGE_TYPE = 'landing-preview:section-select'

function cloneContent(value) {
  return JSON.parse(JSON.stringify(value))
}

function createSectionState(initialValue = false) {
  return Object.fromEntries(LANDING_SECTIONS.map(({ id }) => [id, initialValue]))
}

function arrayToTextarea(values = []) {
  return values.join('\n')
}

function textareaToArray(value) {
  return value
    .split('\n')
    .map((item) => item.replace(/\r/g, ''))
}

function formatTimestamp(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getPreviewTarget(sectionId) {
  return LANDING_EDITOR_SECTION_MAP[sectionId]?.previewTarget || 'hero'
}

function createEmptyCard() {
  return {
    icon: '',
    title: '',
    description: '',
  }
}

function createEmptyFaqItem() {
  return {
    question: '',
    answer: '',
  }
}

function createEmptyLinkItem() {
  return {
    label: '',
    href: '',
  }
}

function LandingPanelIcon({ kind }) {
  if (kind === 'toggle-visible') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }

  if (kind === 'toggle-hidden') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M3 3l18 18" />
        <path d="M10.6 10.7a3 3 0 0 0 4.2 4.2" />
        <path d="M9.9 5.1A11.8 11.8 0 0 1 12 5c6.5 0 10 7 10 7a17.2 17.2 0 0 1-3.2 4.1" />
        <path d="M6.2 6.3A17.9 17.9 0 0 0 2 12s3.5 7 10 7a10.8 10.8 0 0 0 4-.8" />
      </svg>
    )
  }

  if (kind === 'previous') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M15 18l-6-6 6-6" />
        <path d="M20 12H9" />
      </svg>
    )
  }

  if (kind === 'next') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M9 18l6-6-6-6" />
        <path d="M4 12h11" />
      </svg>
    )
  }

  if (kind === 'reload') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 3v18" />
      <path d="M7 8l5-5 5 5" />
      <path d="M5 21h14" />
    </svg>
  )
}

export default function AdminLandingPage() {
  const previewFrameRef = useRef(null)
  const contextFormRef = useRef(null)
  const skipNextPreviewSyncRef = useRef(false)
  const latestContentRef = useRef(cloneDefaultLandingContent())
  const latestActiveSectionRef = useRef('header')
  const [content, setContent] = useState(() => cloneDefaultLandingContent())
  const [savedContent, setSavedContent] = useState(() => cloneDefaultLandingContent())
  const [contentUpdatedAt, setContentUpdatedAt] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [activeSection, setActiveSection] = useState('header')
  const [collapsedSections, setCollapsedSections] = useState(() => createSectionState(false))
  const [sectionSwitcherOpen, setSectionSwitcherOpen] = useState(false)
  const [previewDevice, setPreviewDevice] = useState('desktop')
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0)
  const [previewLoading, setPreviewLoading] = useState(true)
  const deferredContent = useDeferredValue(content)

  const fetchContent = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true)
    }

    try {
      const response = await fetch('/api/admin/landing-content', { cache: 'no-store' })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Khong the tai noi dung landing')
      }

      const nextContent = result.content || cloneDefaultLandingContent()
      setContent(nextContent)
      setSavedContent(nextContent)
      setContentUpdatedAt(result.updatedAt || '')
      return true
    } catch (error) {
      console.error('fetch landing content error:', error)
      setFeedback({
        type: 'error',
        text: error.message || 'Khong the tai noi dung landing',
      })
      return false
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  const dirtySections = useMemo(
    () =>
      LANDING_SECTIONS.reduce((accumulator, section) => {
        const contentKey = SECTION_CONTENT_KEYS[section.id]
        const visibilityChanged =
          (content?.sectionVisibility?.[section.id] !== false) !==
          (savedContent?.sectionVisibility?.[section.id] !== false)

        if (!contentKey) {
          accumulator[section.id] = visibilityChanged
          return accumulator
        }

        accumulator[section.id] =
          visibilityChanged ||
          JSON.stringify(content?.[contentKey] ?? null) !==
          JSON.stringify(savedContent?.[contentKey] ?? null)

        return accumulator
      }, {}),
    [content, savedContent]
  )

  const hasUnsavedChanges = Object.values(dirtySections).some(Boolean)
  const lastSavedLabel = formatTimestamp(contentUpdatedAt)
  const editorStatusLabel = saving ? 'Dang luu' : hasUnsavedChanges ? 'Chua luu' : 'Da dong bo'
  const editorStatusTone = saving ? 'pending' : hasUnsavedChanges ? 'warning' : 'success'
  const activeSectionIndex = LANDING_SECTIONS.findIndex((section) => section.id === activeSection)
  const activeSectionMeta = LANDING_SECTIONS[activeSectionIndex] || LANDING_SECTIONS[0]
  const previousSection = activeSectionIndex > 0 ? LANDING_SECTIONS[activeSectionIndex - 1] : null
  const nextSection =
    activeSectionIndex >= 0 && activeSectionIndex < LANDING_SECTIONS.length - 1
      ? LANDING_SECTIONS[activeSectionIndex + 1]
      : null
  const activeSectionOrderLabel =
    activeSectionIndex >= 0 ? `${activeSectionIndex + 1}/${LANDING_SECTIONS.length}` : ''
  const activeSectionVisible = content?.sectionVisibility?.[activeSection] !== false
  const visibleSectionCount = LANDING_SECTIONS.filter(
    (section) => content?.sectionVisibility?.[section.id] !== false
  ).length
  const previewTarget = getPreviewTarget(activeSection)
  const liveOpenHref =
    !activeSectionVisible || previewTarget === 'footer' ? '/' : `/#${previewTarget}`
  const previewBaseHref = `/landing-preview${previewRefreshKey ? `?preview=${previewRefreshKey}` : ''}`
  const previewOpenHref =
    !activeSectionVisible || previewTarget === 'footer'
      ? previewBaseHref
      : `${previewBaseHref}#${previewTarget}`
  const previewFrameSrc = previewBaseHref

  useEffect(() => {
    latestContentRef.current = content
  }, [content])

  useEffect(() => {
    latestActiveSectionRef.current = activeSection
  }, [activeSection])

  useEffect(() => {
    contextFormRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [activeSection])

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return undefined
    }

    function handleBeforeUnload(event) {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    function handlePreviewSelection(event) {
      if (event.origin !== window.location.origin) {
        return
      }

      if (event.data?.type !== PREVIEW_SECTION_SELECT_MESSAGE_TYPE) {
        return
      }

      const sectionId = event.data?.sectionId
      if (!sectionId || !LANDING_EDITOR_SECTION_MAP[sectionId]) {
        return
      }

      skipNextPreviewSyncRef.current = true
      focusSection(sectionId)
    }

    window.addEventListener('message', handlePreviewSelection)
    return () => window.removeEventListener('message', handlePreviewSelection)
  }, [])

  const syncPreviewSection = useCallback((sectionId, behavior = 'smooth') => {
    const frame = previewFrameRef.current
    const frameWindow = frame?.contentWindow
    const frameDocument = frame?.contentDocument

    if (!frameWindow || !frameDocument) {
      return false
    }

    const previewTarget = getPreviewTarget(sectionId)

    if (previewTarget === 'footer') {
      const footerElement = frameDocument.querySelector('footer')
      if (footerElement) {
        footerElement.scrollIntoView({ behavior, block: 'start' })
        return true
      }

      const scrollRoot = frameDocument.scrollingElement || frameDocument.documentElement
      frameWindow.scrollTo({ top: scrollRoot.scrollHeight, behavior })
      return true
    }

    const targetElement = frameDocument.getElementById(previewTarget)

    if (targetElement) {
      targetElement.scrollIntoView({ behavior, block: 'start' })
      return true
    }

    frameWindow.location.hash = previewTarget
    return true
  }, [])

  const postPreviewDraft = useCallback((draftContent, sectionId) => {
    const frameWindow = previewFrameRef.current?.contentWindow

    if (!frameWindow || typeof window === 'undefined') {
      return false
    }

    frameWindow.postMessage(
      {
        type: PREVIEW_UPDATE_MESSAGE_TYPE,
        content: draftContent,
        activeSection: sectionId,
      },
      window.location.origin
    )

    return true
  }, [])

  useEffect(() => {
    if (previewLoading) {
      return undefined
    }

    const frameId = window.requestAnimationFrame(() => {
      const skipScroll = skipNextPreviewSyncRef.current
      skipNextPreviewSyncRef.current = false
      postPreviewDraft(latestContentRef.current, activeSection)

      if (!skipScroll) {
        syncPreviewSection(activeSection, 'smooth')
      }
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [activeSection, postPreviewDraft, previewLoading, syncPreviewSection])

  useEffect(() => {
    if (previewLoading) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      postPreviewDraft(deferredContent, latestActiveSectionRef.current)
    }, 120)

    return () => window.clearTimeout(timeoutId)
  }, [deferredContent, postPreviewDraft, previewLoading])

  function refreshPreview() {
    setPreviewLoading(true)
    setPreviewRefreshKey((current) => current + 1)
  }

  function handlePreviewLoad() {
    setPreviewLoading(false)
    window.requestAnimationFrame(() => {
      postPreviewDraft(content, activeSection)
      syncPreviewSection(activeSection, 'auto')
    })
  }

  function updateSection(section, field, value) {
    setContent((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }))
  }

  function updateArrayField(section, field, value) {
    updateSection(section, field, textareaToArray(value))
  }

  function updateArrayObjectItem(section, arrayField, index, field, value) {
    setContent((current) => {
      const next = cloneContent(current)
      next[section][arrayField][index][field] = value
      return next
    })
  }

  function addArrayObjectItem(section, arrayField, createItem, maxItems) {
    setContent((current) => {
      const currentItems = current[section][arrayField] || []

      if (typeof maxItems === 'number' && currentItems.length >= maxItems) {
        return current
      }

      const next = cloneContent(current)
      next[section][arrayField] = [...currentItems, createItem()]
      return next
    })
  }

  function removeArrayObjectItem(section, arrayField, index, minItems = 1) {
    setContent((current) => {
      const currentItems = current[section][arrayField] || []
      if (currentItems.length <= minItems) {
        return current
      }

      const next = cloneContent(current)
      next[section][arrayField].splice(index, 1)
      return next
    })
  }

  function moveArrayObjectItem(section, arrayField, index, direction) {
    setContent((current) => {
      const currentItems = current[section][arrayField] || []
      const targetIndex = index + direction

      if (targetIndex < 0 || targetIndex >= currentItems.length) {
        return current
      }

      const next = cloneContent(current)
      const [movedItem] = next[section][arrayField].splice(index, 1)
      next[section][arrayField].splice(targetIndex, 0, movedItem)
      return next
    })
  }

  function setSectionVisibility(sectionId, isVisible) {
    setContent((current) => ({
      ...current,
      sectionVisibility: {
        ...(current.sectionVisibility || {}),
        [sectionId]: isVisible,
      },
    }))
  }

  function getEditorBlockVisibility(section, block) {
    if (!section.contentKey || !block.visibilityKey) {
      return true
    }

    return content?.[section.contentKey]?.[block.visibilityKey] !== false
  }

  function setEditorBlockVisibility(section, block, isVisible) {
    if (!section.contentKey || !block.visibilityKey) {
      return
    }

    updateSection(section.contentKey, block.visibilityKey, isVisible)
  }

  function focusSection(sectionId) {
    setActiveSection(sectionId)
    setSectionSwitcherOpen(false)
    setCollapsedSections((current) => ({
      ...current,
      [sectionId]: false,
    }))
  }

  function toggleSection(sectionId) {
    setCollapsedSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }))
  }

  async function handleReloadFromServer() {
    if (
      hasUnsavedChanges &&
      !window.confirm('Ban dang co thay doi chua luu. Tai lai tu server se bo phan dang chinh. Tiep tuc?')
    ) {
      return
    }

    const refreshed = await fetchContent()
    if (refreshed) {
      setFeedback({
        type: 'success',
        text: 'Da tai lai landing content tu server.',
      })
      refreshPreview()
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setFeedback(null)

    try {
      const response = await fetch('/api/admin/landing-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, expectedUpdatedAt: contentUpdatedAt }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Khong the luu landing content')
      }

      const refreshed = await fetchContent({ silent: true })
      if (!refreshed) {
        throw new Error('Khong the doc lai noi dung landing sau khi luu')
      }
      setFeedback({
        type: 'success',
        text: 'Da luu noi dung landing. Khoi roadmap van tu dong bo tu phan Khoa hoc.',
      })
      refreshPreview()
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error.message || 'Khong the luu landing content',
      })
    } finally {
      setSaving(false)
    }
  }

  function getSchemaFieldValue(section, field) {
    const sectionContent = content?.[section.contentKey] || {}
    const rawValue = sectionContent?.[field.key]

    if (field.type === 'textarea-list') {
      return arrayToTextarea(Array.isArray(rawValue) ? rawValue : [])
    }

    return rawValue ?? ''
  }

  function handleSchemaFieldChange(section, field, value) {
    if (!section.contentKey) {
      return
    }

    if (field.type === 'textarea-list') {
      updateArrayField(section.contentKey, field.key, value)
      return
    }

    updateSection(section.contentKey, field.key, value)
  }

  function createEditorBlockItem(block) {
    if (block.createItem === 'faq') {
      return createEmptyFaqItem()
    }

    if (block.createItem === 'link') {
      return createEmptyLinkItem()
    }

    return createEmptyCard()
  }

  function renderItemShapeFields(section, block, item, index) {
    if (!section.contentKey) {
      return null
    }

    if (block.itemShape === 'question-answer') {
      return (
        <>
          <label>
            <span className={styles.formLabel}>Cau hoi</span>
            <input
              className={styles.formInput}
              value={item.question}
              onChange={(event) =>
                updateArrayObjectItem(
                  section.contentKey,
                  block.arrayField,
                  index,
                  'question',
                  event.target.value
                )
              }
            />
          </label>
          <label>
            <span className={styles.formLabel}>Tra loi</span>
            <textarea
              className={styles.formTextarea}
              rows={4}
              value={item.answer}
              onChange={(event) =>
                updateArrayObjectItem(
                  section.contentKey,
                  block.arrayField,
                  index,
                  'answer',
                  event.target.value
                )
              }
            />
          </label>
        </>
      )
    }

    if (block.itemShape === 'label-href') {
      return (
        <div className={styles.contentEditorGrid}>
          <FieldRenderer
            field={{ key: `${section.id}-${block.arrayField}-label-${index}`, label: 'Nhan', type: 'text' }}
            value={item.label}
            onChange={(value) =>
              updateArrayObjectItem(section.contentKey, block.arrayField, index, 'label', value)
            }
          />
          <FieldRenderer
            field={{
              key: `${section.id}-${block.arrayField}-href-${index}`,
              label: 'URL / href',
              type: 'text',
            }}
            value={item.href}
            onChange={(value) =>
              updateArrayObjectItem(section.contentKey, block.arrayField, index, 'href', value)
            }
          />
        </div>
      )
    }

    return (
      <>
        <div className={styles.contentEditorGrid}>
          <label>
            <span className={styles.formLabel}>Icon</span>
            <input
              className={styles.formInput}
              value={item.icon}
              onChange={(event) =>
                updateArrayObjectItem(section.contentKey, block.arrayField, index, 'icon', event.target.value)
              }
            />
          </label>
          <label>
            <span className={styles.formLabel}>Tieu de</span>
            <input
              className={styles.formInput}
              value={item.title}
              onChange={(event) =>
                updateArrayObjectItem(section.contentKey, block.arrayField, index, 'title', event.target.value)
              }
            />
          </label>
        </div>
        <label>
          <span className={styles.formLabel}>Mo ta</span>
          <textarea
            className={styles.formTextarea}
            rows={3}
            value={item.description}
            onChange={(event) =>
              updateArrayObjectItem(
                section.contentKey,
                block.arrayField,
                index,
                'description',
                event.target.value
              )
            }
          />
        </label>
      </>
    )
  }

  function renderEditorBlock(section, block, blockIndex) {
    if (block.type === 'note') {
      return (
        <div key={`${section.id}-block-${blockIndex}`} className={styles.contentEditorCard}>
          {block.title && <div className={styles.contentEditorHeader}>{block.title}</div>}
          <p className={styles.accountNote}>{block.text}</p>
        </div>
      )
    }

    if (block.type === 'comparison') {
      const blockVisible = getEditorBlockVisibility(section, block)

      return (
        <div key={`${section.id}-block-${blockIndex}`} className={styles.contentEditorStack}>
          {(block.title || block.note || block.visibilityKey) && (
            <div className={styles.contentEditorCard}>
              <div className={styles.contentEditorToolbar}>
                <div className={styles.contentEditorToolbarMeta}>
                  {block.title && <div className={styles.contentEditorHeader}>{block.title}</div>}
                  <span className={styles.contentEditorHint}>
                    {blockVisible
                      ? block.note || 'Khối này đang hiển thị trên landing public.'
                      : 'Khối này đang ẩn trên landing public và preview, nhưng dữ liệu vẫn được giữ lại.'}
                  </span>
                </div>
                {block.visibilityKey && (
                  <button
                    type="button"
                    className={`${styles.contentEditorToggle} ${
                      blockVisible
                        ? styles.contentEditorToggleVisible
                        : styles.contentEditorToggleHidden
                    }`}
                    onClick={() => setEditorBlockVisibility(section, block, !blockVisible)}
                    aria-label={
                      blockVisible
                        ? block.hideLabel || 'Ẩn khối'
                        : block.showLabel || 'Hiện lại khối'
                    }
                    title={
                      blockVisible
                        ? block.hideLabel || 'Ẩn khối'
                        : block.showLabel || 'Hiện lại khối'
                    }
                  >
                    <span className={styles.contentEditorToggleIcon} aria-hidden="true">
                      <LandingPanelIcon
                        kind={blockVisible ? 'toggle-hidden' : 'toggle-visible'}
                      />
                    </span>
                    <span className={styles.contentEditorToggleLabel}>
                      {blockVisible ? 'Ẩn' : 'Hiện'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className={styles.contentEditorGrid}>
            {block.columns.map((column) => (
              <label
                key={`${section.id}-${column.titleKey}`}
                className={styles.contentEditorCard}
              >
                <span className={styles.formLabel}>{column.label}</span>
                <input
                  className={styles.formInput}
                  value={content[section.contentKey]?.[column.titleKey] || ''}
                  onChange={(event) =>
                    updateSection(section.contentKey, column.titleKey, event.target.value)
                  }
                />
                <textarea
                  className={styles.formTextarea}
                  rows={column.rows || 5}
                  value={arrayToTextarea(content[section.contentKey]?.[column.itemsKey] || [])}
                  onChange={(event) =>
                    updateArrayField(section.contentKey, column.itemsKey, event.target.value)
                  }
                />
              </label>
            ))}
          </div>
        </div>
      )
    }

    if (block.type === 'fixed-items') {
      const items = content[section.contentKey]?.[block.arrayField] || []

      return (
        <div key={`${section.id}-block-${blockIndex}`} className={styles.contentEditorStack}>
          {items.map((item, index) => (
            <div key={`${block.arrayField}-${index}`} className={styles.contentEditorCard}>
              <div className={styles.contentEditorHeader}>
                {block.itemTitlePrefix} {index + 1}
              </div>
              {renderItemShapeFields(section, block, item, index)}
            </div>
          ))}
        </div>
      )
    }

    if (block.type === 'repeater') {
      const items = content[section.contentKey]?.[block.arrayField] || []

      return (
        <RepeaterField
          key={`${section.id}-block-${blockIndex}`}
          title={block.title}
          note={block.note}
          items={items}
          minItems={block.minItems ?? 1}
          maxItems={block.maxItems}
          addLabel={block.addLabel}
          getItemTitle={(_, index) => `${block.itemTitlePrefix} ${index + 1}`}
          onAdd={() =>
            addArrayObjectItem(
              section.contentKey,
              block.arrayField,
              () => createEditorBlockItem(block),
              block.maxItems
            )
          }
          onRemove={(index) =>
            removeArrayObjectItem(section.contentKey, block.arrayField, index, block.minItems ?? 1)
          }
          onMove={(index, direction) =>
            moveArrayObjectItem(section.contentKey, block.arrayField, index, direction)
          }
          renderItem={({ item, index }) => renderItemShapeFields(section, block, item, index)}
        />
      )
    }

    return null
  }

  function renderSchemaSection(sectionId, options = {}) {
    const { extraContent = null, embedded = false } = options
    const section = LANDING_EDITOR_SECTION_MAP[sectionId]
    const fieldGroups = Array.isArray(section?.fieldGroups) ? section.fieldGroups : []
    const editorBlocks = Array.isArray(section?.editorBlocks) ? section.editorBlocks : []

    if (!section || (fieldGroups.length === 0 && editorBlocks.length === 0 && !extraContent)) {
      return null
    }

    const contentBody = (
      <>
        {fieldGroups.map((group, groupIndex) => {
          const groupFields = group.fields.map((field) => (
            <FieldRenderer
              key={`${section.id}-${field.key}`}
              field={field}
              value={getSchemaFieldValue(section, field)}
              onChange={(value) => handleSchemaFieldChange(section, field, value)}
            />
          ))

          if (group.layout === 'grid') {
            return (
              <div key={`${section.id}-group-${groupIndex}`} className={styles.contentEditorGrid}>
                {groupFields}
              </div>
            )
          }

          return (
            <div key={`${section.id}-group-${groupIndex}`} className={styles.contentEditorStack}>
              {groupFields}
            </div>
          )
        })}
        {editorBlocks.map((block, blockIndex) => renderEditorBlock(section, block, blockIndex))}
        {extraContent}
      </>
    )

    if (embedded) {
      return (
        <div key={`${section.id}-embedded`} className={styles.landingContextSectionEditor}>
          {contentBody}
        </div>
      )
    }

    return (
      <LandingSectionCard
        key={section.id}
        sectionId={section.id}
        title={section.title}
        lead={section.lead}
        badge={section.badge}
        active={activeSection === section.id}
        collapsed={collapsedSections[section.id]}
        dirty={dirtySections[section.id]}
        onToggle={() => toggleSection(section.id)}
      >
        {contentBody}
      </LandingSectionCard>
    )
  }

  if (loading) {
    return (
      <div className={`${styles.pageHeader} ${styles.landingEditorPageHeader}`}>
        <div className={styles.landingEditorHeaderCompact}>
          <h2 className={styles.pageTitle}>Landing Content</h2>
          <p className={styles.curriculumLead}>Dang tai noi dung landing...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`${styles.pageHeader} ${styles.landingEditorPageHeader}`}>
        <div className={styles.landingEditorHeaderCompact}>
          <div className={styles.landingEditorTitleRow}>
            <h2 className={styles.pageTitle}>Landing Content</h2>
            <span
              className={`${styles.landingEditorStatusPill} ${
                styles[`landingEditorStatusPill--${editorStatusTone}`]
              }`}
            >
              {editorStatusLabel}
            </span>
            {lastSavedLabel && (
              <span className={styles.landingEditorMetaInline}>Luu gan nhat: {lastSavedLabel}</span>
            )}
          </div>
        </div>

        <div className={styles.quickActions}>
          <a
            href={liveOpenHref}
            target="_blank"
            rel="noreferrer"
            className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
          >
            Mo landing that
          </a>
          <button
            type="button"
            className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
            onClick={handleReloadFromServer}
            disabled={saving}
          >
            Tai lai tu server
          </button>
          <button
            type="submit"
            form="landing-editor-form"
            className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
            disabled={saving}
          >
            {saving ? 'Dang luu...' : 'Luu landing content'}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`${styles.feedbackBanner} ${
            feedback.type === 'success'
              ? styles.feedbackBannerSuccess
              : styles.feedbackBannerError
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className={styles.landingEditorLayout}>
        <div className={styles.landingEditorWorkspace}>
          <section className={styles.landingPreviewPane}>
            <div className={styles.landingPreviewCard}>
              <div className={styles.landingPreviewHead}>
                <div className={styles.landingPreviewTitleBlock}>
                  <div className={styles.landingPreviewTitle}>Preview landing</div>
                  <p className={styles.accountNote}>
                    Khung nay render bang cung component voi landing public. Bam truc tiep vao
                    bat ky section nao de doi panel chinh sua sang dung context.
                  </p>
                </div>
                <span
                  className={`${styles.landingEditorStatusPill} ${
                    styles['landingEditorStatusPill--pending']
                  }`}
                >
                  {previewDevice === 'mobile' ? 'Mobile' : 'Desktop'}
                </span>
              </div>

              <div className={styles.landingPreviewToolbar}>
                <div className={styles.landingPreviewDeviceSwitch}>
                  <button
                    type="button"
                    className={`${styles.landingPreviewDeviceButton} ${
                      previewDevice === 'desktop' ? styles.landingPreviewDeviceButtonActive : ''
                    }`}
                    onClick={() => setPreviewDevice('desktop')}
                    aria-pressed={previewDevice === 'desktop'}
                  >
                    Desktop
                  </button>
                  <button
                    type="button"
                    className={`${styles.landingPreviewDeviceButton} ${
                      previewDevice === 'mobile' ? styles.landingPreviewDeviceButtonActive : ''
                    }`}
                    onClick={() => setPreviewDevice('mobile')}
                    aria-pressed={previewDevice === 'mobile'}
                  >
                    Mobile
                  </button>
                </div>

                <button
                  type="button"
                  className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
                  onClick={refreshPreview}
                  disabled={saving}
                >
                  Tai lai preview
                </button>
                <a
                  href={previewOpenHref}
                  target="_blank"
                  rel="noreferrer"
                  className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
                >
                  {activeSectionVisible ? 'Mo section nay' : 'Mo preview root'}
                </a>
              </div>

              <div className={styles.landingPreviewMeta}>
                <span>Dang chon: {activeSectionMeta.label}</span>
                <span>
                  {!activeSectionVisible
                    ? 'Khoi nay dang an tren landing. Ban van co the chinh noi dung va bam Hien lai khi san sang.'
                    : hasUnsavedChanges
                    ? 'Preview dang phan anh ban draft chua luu. Panel ben phai chi hien thi dung khoi ban dang chon.'
                    : 'Preview dang bam theo ban da luu gan nhat va san sang doi context theo click.'}
                </span>
              </div>

              <div
                className={`${styles.landingPreviewViewport} ${
                  previewDevice === 'mobile'
                    ? styles.landingPreviewViewportMobile
                    : styles.landingPreviewViewportDesktop
                }`}
              >
                <div
                  className={`${styles.landingPreviewFrameShell} ${
                    previewDevice === 'mobile'
                      ? styles.landingPreviewFrameShellMobile
                      : styles.landingPreviewFrameShellDesktop
                  }`}
                >
                  {previewDevice === 'mobile' && (
                    <div className={styles.landingPreviewPhoneTopbar} aria-hidden="true" />
                  )}
                  <div className={styles.landingPreviewFrameMask}>
                    {previewLoading && (
                      <div className={styles.landingPreviewLoading}>Dang tai landing preview...</div>
                    )}
                    <iframe
                      ref={previewFrameRef}
                      title="Landing preview"
                      src={previewFrameSrc}
                      className={`${styles.landingPreviewFrame} ${
                        previewDevice === 'mobile'
                          ? styles.landingPreviewFrameMobile
                          : styles.landingPreviewFrameDesktop
                      }`}
                      onLoad={handlePreviewLoad}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className={styles.landingContextPane}>
            <div className={styles.landingContextCard}>
              <div className={styles.landingContextHead}>
                <div className={styles.landingContextTitleBlock}>
                  <div className={styles.landingEditorMetaTitle}>Panel chinh section</div>
                  <div className={styles.landingContextTitleRow}>
                    <span className={styles.sectionCardHeader}>{activeSectionMeta.title}</span>
                    <span className={styles.landingEditorSectionBadge}>{activeSectionMeta.badge}</span>
                    <span
                      className={`${styles.landingEditorStatusPill} ${
                        styles[
                          activeSectionVisible
                            ? 'landingEditorStatusPill--success'
                            : 'landingEditorStatusPill--warning'
                        ]
                      }`}
                    >
                      {activeSectionVisible ? 'Dang hien' : 'Dang an'}
                    </span>
                    {dirtySections[activeSection] && (
                      <span
                        className={`${styles.landingEditorStatusPill} ${
                          styles['landingEditorStatusPill--warning']
                        }`}
                      >
                        Chua luu
                      </span>
                    )}
                  </div>
                  <p className={styles.accountNote}>{activeSectionMeta.lead}</p>
                </div>
                <div className={styles.landingContextActions}>
                  <span className={styles.landingContextOrderBadge}>{activeSectionOrderLabel}</span>
                  <div className={styles.landingContextActionGroup}>
                    <button
                      type="button"
                      className={`${styles.landingContextActionButton} ${
                        activeSectionVisible
                          ? styles.landingContextActionButtonWarning
                          : styles.landingContextActionButtonSuccess
                      }`}
                      onClick={() => setSectionVisibility(activeSection, !activeSectionVisible)}
                    >
                      <span className={styles.landingContextActionButtonIcon} aria-hidden="true">
                        <LandingPanelIcon
                          kind={activeSectionVisible ? 'toggle-hidden' : 'toggle-visible'}
                        />
                      </span>
                      <span className={styles.landingContextActionButtonLabel}>
                        {activeSectionVisible ? 'An khoi landing' : 'Hien lai section'}
                      </span>
                    </button>

                    <div className={styles.landingContextPager}>
                      <button
                        type="button"
                        className={`${styles.landingContextActionButton} ${styles.landingContextActionButtonGhost}`}
                        onClick={() => previousSection && focusSection(previousSection.id)}
                        disabled={!previousSection}
                      >
                        <span className={styles.landingContextActionButtonIcon} aria-hidden="true">
                          <LandingPanelIcon kind="previous" />
                        </span>
                        <span className={styles.landingContextActionButtonLabel}>Khoi truoc</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.landingContextActionButton} ${styles.landingContextActionButtonGhost}`}
                        onClick={() => nextSection && focusSection(nextSection.id)}
                        disabled={!nextSection}
                      >
                        <span className={styles.landingContextActionButtonIcon} aria-hidden="true">
                          <LandingPanelIcon kind="next" />
                        </span>
                        <span className={styles.landingContextActionButtonLabel}>Khoi sau</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.landingContextStatusStrip}>
                <span>
                  {dirtySections[activeSection]
                    ? 'Ban nhap nay dang co thay doi chua luu.'
                    : 'Khoi nay dang khop voi ban da luu gan nhat.'}
                </span>
                <span>
                  Preview ben trai la cach chon section chinh. Danh sach day du ben duoi chi de nhay nhanh khi can.
                </span>
              </div>

              <form
                id="landing-editor-form"
                ref={contextFormRef}
                className={styles.landingContextForm}
                onSubmit={handleSubmit}
              >
                <div className={styles.landingContextPrimaryEditor}>
                  {renderSchemaSection(activeSection, { embedded: true })}
                </div>

                <div className={styles.landingContextSwitcher}>
                  <button
                    type="button"
                    className={styles.landingContextSwitcherToggle}
                    onClick={() => setSectionSwitcherOpen((current) => !current)}
                    aria-expanded={sectionSwitcherOpen}
                    aria-controls="landing-section-switcher"
                  >
                    <span className={styles.landingContextSwitcherToggleMeta}>
                      <span className={styles.landingEditorMetaTitle}>
                        Tat ca section ({visibleSectionCount}/{LANDING_SECTIONS.length} dang hien)
                      </span>
                      <span className={styles.accountNote}>
                        {sectionSwitcherOpen
                          ? 'Thu gon danh sach de tap trung vao form chinh sua.'
                          : 'Mo danh sach khi can chuyen nhanh section ma khong can click trong preview.'}
                      </span>
                    </span>
                    <span className={styles.landingContextSwitcherToggleAction}>
                      {sectionSwitcherOpen ? 'Thu gon' : 'Mo danh sach'}
                    </span>
                  </button>

                  {sectionSwitcherOpen && (
                    <div id="landing-section-switcher" className={styles.landingEditorNav}>
                      {LANDING_SECTIONS.map((section) => {
                        const sectionVisible = content?.sectionVisibility?.[section.id] !== false

                        return (
                          <button
                            key={section.id}
                            type="button"
                            className={`${styles.landingEditorNavItem} ${
                              activeSection === section.id ? styles.landingEditorNavItemActive : ''
                            }`}
                            onClick={() => focusSection(section.id)}
                          >
                            <span className={styles.landingEditorNavLabel}>
                              <span>{section.label}</span>
                              <span className={styles.landingEditorNavMeta}>
                                {sectionVisible ? 'Dang hien' : 'Dang an'}
                                {dirtySections[section.id] ? ' • Chua luu' : ''}
                              </span>
                            </span>
                            <span className={styles.landingEditorSectionBadge}>{section.badge}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

              </form>

              <div className={styles.landingContextDock}>
                <div className={styles.landingContextDockMeta}>
                  <span className={styles.landingEditorMetaTitle}>Thao tac nhanh</span>
                  <span className={styles.accountNote}>
                    Luu hoac tai lai ma khong can cuon xuong cuoi form.
                  </span>
                </div>
                <div className={styles.landingContextDockActions}>
                  <button
                    type="button"
                    className={`${styles.landingContextActionButton} ${styles.landingContextActionButtonGhost}`}
                    onClick={handleReloadFromServer}
                    disabled={saving}
                  >
                    <span className={styles.landingContextActionButtonIcon} aria-hidden="true">
                      <LandingPanelIcon kind="reload" />
                    </span>
                    <span className={styles.landingContextActionButtonLabel}>Tai lai tu server</span>
                  </button>
                  <button
                    type="submit"
                    form="landing-editor-form"
                    className={`${styles.landingContextActionButton} ${styles.landingContextActionButtonPrimary}`}
                    disabled={saving}
                  >
                    <span className={styles.landingContextActionButtonIcon} aria-hidden="true">
                      <LandingPanelIcon kind="save" />
                    </span>
                    <span className={styles.landingContextActionButtonLabel}>
                      {saving ? 'Dang luu...' : 'Luu landing content'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}


