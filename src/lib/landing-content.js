import 'server-only'

import { cloneDefaultLandingContent } from '@/lib/landing-defaults'
import { assertLandingContentWriteVersion } from '@/lib/landing-content-version'
import { createServiceRoleClient } from '@/lib/server-auth'

const LANDING_CONTENT_TABLE = 'landing_content'
const LANDING_CONTENT_ROW_ID = 'default'
const LANDING_CONTENT_SELECT = 'id, content, created_at, updated_at'
const LANDING_CONTENT_CONFLICT_CODE = 'LANDING_CONTENT_CONFLICT'
const LANDING_CONTENT_CONFLICT_MESSAGE =
  'Landing content has changed on the server. Reload before saving.'

let landingContentSeedPromise = null

function createAdminClient() {
  try {
    return createServiceRoleClient()
  } catch {
    return null
  }
}

function readString(value, fallback) {
  if (typeof value !== 'string') {
    return fallback
  }

  return value.trim()
}

function readOptionalString(value) {
  return readString(value, '')
}

function readBoolean(value, fallback) {
  if (typeof value !== 'boolean') {
    return fallback
  }

  return value
}

function readStringArray(values, fallback) {
  if (!Array.isArray(values)) {
    return fallback
  }

  const normalized = values
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)

  return normalized
}

function normalizeSectionVisibility(values, fallback) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    return fallback
  }

  return Object.fromEntries(
    Object.keys(fallback).map((sectionId) => [sectionId, values[sectionId] !== false])
  )
}

function normalizeCard(item, fallback) {
  return {
    icon: readString(item?.icon, fallback.icon),
    title: readString(item?.title, fallback.title),
    description: readString(item?.description, fallback.description),
    ...(fallback.quote
      ? { quote: readString(item?.quote, fallback.quote) }
      : {}),
    ...(fallback.answer
      ? { answer: readString(item?.answer, fallback.answer) }
      : {}),
    ...(fallback.question
      ? { question: readString(item?.question, fallback.question) }
      : {}),
  }
}

function normalizeLinkItem(item, fallback) {
  return {
    label: readString(item?.label, fallback.label),
    href: readString(item?.href, fallback.href),
  }
}

function normalizeObjectArray(values, fallback) {
  if (!Array.isArray(values)) {
    return fallback
  }

  const visibleItems = values.filter((item) =>
    ['icon', 'title', 'description', 'quote', 'answer', 'question'].some((field) =>
      readOptionalString(item?.[field])
    )
  )

  return visibleItems.map((item, index) => normalizeCard(item, fallback[index] || fallback[0]))
}

function normalizeFixedObjectArray(values, fallback) {
  if (!Array.isArray(values)) {
    return fallback
  }

  return fallback.map((fallbackItem, index) => normalizeCard(values[index] || {}, fallbackItem))
}

function normalizePillarArray(values, fallback) {
  return normalizeObjectArray(values, fallback)
}

function normalizeLinkArray(values, fallback) {
  if (!Array.isArray(values)) {
    return fallback
  }

  return values.length > 0
    ? values.map((item, index) => normalizeLinkItem(item, fallback[index] || fallback[0]))
    : fallback
}

export function normalizeLandingContent(input) {
  const fallback = cloneDefaultLandingContent()

  return {
    sectionVisibility: normalizeSectionVisibility(
      input?.sectionVisibility,
      fallback.sectionVisibility
    ),
    header: {
      contactLabel: readString(input?.header?.contactLabel, fallback.header.contactLabel),
      roadmapLabel: readString(input?.header?.roadmapLabel, fallback.header.roadmapLabel),
      faqLabel: readString(input?.header?.faqLabel, fallback.header.faqLabel),
      ctaLabel: readString(input?.header?.ctaLabel, fallback.header.ctaLabel),
    },
    hero: {
      eyebrow: readString(input?.hero?.eyebrow, fallback.hero.eyebrow),
      title: readString(input?.hero?.title, fallback.hero.title),
      description: readString(input?.hero?.description, fallback.hero.description),
      primaryCtaLabel: readString(
        input?.hero?.primaryCtaLabel,
        fallback.hero.primaryCtaLabel
      ),
      secondaryCtaLabel: readString(
        input?.hero?.secondaryCtaLabel,
        fallback.hero.secondaryCtaLabel
      ),
      trustItems: readStringArray(input?.hero?.trustItems, fallback.hero.trustItems),
    },
    solution: {
      title: readString(input?.solution?.title, fallback.solution.title),
      subtitle: readString(input?.solution?.subtitle, fallback.solution.subtitle),
      showComparison: readBoolean(
        input?.solution?.showComparison,
        fallback.solution.showComparison
      ),
      beforeTitle: readString(input?.solution?.beforeTitle, fallback.solution.beforeTitle),
      beforeItems: readStringArray(input?.solution?.beforeItems, fallback.solution.beforeItems),
      afterTitle: readString(input?.solution?.afterTitle, fallback.solution.afterTitle),
      afterItems: readStringArray(input?.solution?.afterItems, fallback.solution.afterItems),
      pillars: normalizePillarArray(input?.solution?.pillars, fallback.solution.pillars),
    },
    results: {
      title: readString(input?.results?.title, fallback.results.title),
      subtitle: readString(input?.results?.subtitle, fallback.results.subtitle),
      beforeTitle: readString(input?.results?.beforeTitle, fallback.results.beforeTitle),
      beforeItems: readStringArray(input?.results?.beforeItems, fallback.results.beforeItems),
      afterTitle: readString(input?.results?.afterTitle, fallback.results.afterTitle),
      afterItems: readStringArray(input?.results?.afterItems, fallback.results.afterItems),
      showcaseItems: normalizeObjectArray(
        input?.results?.showcaseItems,
        fallback.results.showcaseItems
      ),
    },
    method: {
      title: readString(input?.method?.title, fallback.method.title),
      subtitle: readString(input?.method?.subtitle, fallback.method.subtitle),
      items: normalizeFixedObjectArray(input?.method?.items, fallback.method.items),
    },
    commitment: {
      title: readString(input?.commitment?.title, fallback.commitment.title),
      subtitle: readString(input?.commitment?.subtitle, fallback.commitment.subtitle),
      showGuarantee: readBoolean(
        input?.commitment?.showGuarantee,
        fallback.commitment.showGuarantee
      ),
      items: normalizeFixedObjectArray(input?.commitment?.items, fallback.commitment.items),
      guaranteeTitle: readString(
        input?.commitment?.guaranteeTitle,
        fallback.commitment.guaranteeTitle
      ),
      guaranteeText: readString(
        input?.commitment?.guaranteeText,
        fallback.commitment.guaranteeText
      ),
    },
    faq: {
      title: readString(input?.faq?.title, fallback.faq.title),
      subtitle: readString(input?.faq?.subtitle, fallback.faq.subtitle),
      items: Array.isArray(input?.faq?.items)
        ? input.faq.items
            .map((item) => ({
              question: readOptionalString(item?.question),
              answer: readOptionalString(item?.answer),
            }))
            .filter((item) => item.question || item.answer)
        : fallback.faq.items,
    },
    cta: {
      title: readString(input?.cta?.title, fallback.cta.title),
      description: readString(input?.cta?.description, fallback.cta.description),
      benefits: readStringArray(input?.cta?.benefits, fallback.cta.benefits),
      formTitle: readString(input?.cta?.formTitle, fallback.cta.formTitle),
      formNote: readString(input?.cta?.formNote, fallback.cta.formNote),
      submitLabel: readString(input?.cta?.submitLabel, fallback.cta.submitLabel),
    },
    contactDirect: {
      title: readString(input?.contactDirect?.title, fallback.contactDirect?.title || 'Liên hệ trực tiếp'),
      subtitle: readString(input?.contactDirect?.subtitle, fallback.contactDirect?.subtitle),
    },
    footer: {
      logoSubtitle: readString(input?.footer?.logoSubtitle, fallback.footer.logoSubtitle),
      description: readString(input?.footer?.description, fallback.footer.description),
      roadmapTitle: readString(input?.footer?.roadmapTitle, fallback.footer.roadmapTitle),
      quickLinksTitle: readString(
        input?.footer?.quickLinksTitle,
        fallback.footer.quickLinksTitle
      ),
      faqLabel: readString(input?.footer?.faqLabel, fallback.footer.faqLabel),
      commitmentLabel: readString(
        input?.footer?.commitmentLabel,
        fallback.footer.commitmentLabel
      ),
      ctaLabel: readString(input?.footer?.ctaLabel, fallback.footer.ctaLabel),
      contactTitle: readString(input?.footer?.contactTitle, fallback.footer.contactTitle),
      contactLinks: normalizeLinkArray(
        input?.footer?.contactLinks,
        fallback.footer.contactLinks
      ),
      copyright: readString(input?.footer?.copyright, fallback.footer.copyright),
    },
  }
}

function mapLandingContentRecord(row) {
  return {
    content: normalizeLandingContent(row?.content || {}),
    createdAt: readOptionalString(row?.created_at),
    updatedAt: readOptionalString(row?.updated_at),
  }
}

function createLandingContentConflictError() {
  const error = new Error(LANDING_CONTENT_CONFLICT_MESSAGE)
  error.code = LANDING_CONTENT_CONFLICT_CODE
  return error
}

async function fetchDatabaseLandingContent(adminClient) {
  const { data, error } = await adminClient
    .from(LANDING_CONTENT_TABLE)
    .select(LANDING_CONTENT_SELECT)
    .eq('id', LANDING_CONTENT_ROW_ID)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ? mapLandingContentRecord(data) : null
}

async function insertDatabaseLandingContent(adminClient, content) {
  const now = new Date().toISOString()
  const { data, error } = await adminClient
    .from(LANDING_CONTENT_TABLE)
    .insert({
      id: LANDING_CONTENT_ROW_ID,
      content,
      created_at: now,
      updated_at: now,
    })
    .select(LANDING_CONTENT_SELECT)
    .single()

  if (error) {
    throw error
  }

  return mapLandingContentRecord(data)
}

async function updateDatabaseLandingContent(adminClient, content, expectedUpdatedAt) {
  let query = adminClient
    .from(LANDING_CONTENT_TABLE)
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', LANDING_CONTENT_ROW_ID)

  if (expectedUpdatedAt) {
    query = query.eq('updated_at', expectedUpdatedAt)
  }

  const { data, error } = await query
    .select(LANDING_CONTENT_SELECT)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ? mapLandingContentRecord(data) : null
}

async function ensureLandingContentSeeded(adminClient) {
  if (landingContentSeedPromise) {
    return landingContentSeedPromise
  }

  landingContentSeedPromise = (async () => {
    const existing = await fetchDatabaseLandingContent(adminClient)
    if (existing) {
      return existing
    }

    const defaultContent = cloneDefaultLandingContent()

    try {
      return await insertDatabaseLandingContent(adminClient, defaultContent)
    } catch (error) {
      if (error?.code === '23505') {
        return fetchDatabaseLandingContent(adminClient)
      }

      throw error
    }
  })().finally(() => {
    landingContentSeedPromise = null
  })

  return landingContentSeedPromise
}

export async function getLandingContentDocument(options = {}) {
  const fallbackOnError = options.fallbackOnError === true
  const fallback = cloneDefaultLandingContent()
  const adminClient = createAdminClient()

  if (!adminClient) {
    if (!fallbackOnError) {
      throw new Error('Supabase admin client is not configured.')
    }

    console.warn('getLandingContentDocument fallback: Supabase admin client is not configured.')
    return { content: fallback, createdAt: '', updatedAt: '' }
  }

  try {
    const current = await fetchDatabaseLandingContent(adminClient)
    if (current) {
      return current
    }

    const seeded = await ensureLandingContentSeeded(adminClient)
    if (!seeded) {
      throw new Error('Landing content seed failed.')
    }

    return seeded
  } catch (error) {
    if (!fallbackOnError) {
      throw error
    }

    console.warn('getLandingContentDocument fallback:', error?.message || error)
    return { content: fallback, createdAt: '', updatedAt: '' }
  }
}

export async function getLandingContent() {
  const document = await getLandingContentDocument()
  return document.content
}

export async function getLandingHeaderData() {
  const content = await getLandingContent()

  return {
    header: content.header,
    sectionVisibility: content.sectionVisibility,
  }
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isSectionVisible(content, sectionId) {
  return content.sectionVisibility?.[sectionId] !== false
}

function assertLandingContentCanPublish(content) {
  const visibleCoreSections = ['hero', 'solution', 'results', 'method', 'commitment', 'faq', 'cta']
    .filter((sectionId) => isSectionVisible(content, sectionId))

  if (visibleCoreSections.length === 0) {
    throw new Error('At least one core landing section must stay visible.')
  }

  if (
    isSectionVisible(content, 'hero') &&
    (!hasText(content.hero?.title) || !hasText(content.hero?.description))
  ) {
    throw new Error('Hero title and description are required while hero is visible.')
  }

  if (isSectionVisible(content, 'solution') && !hasText(content.solution?.title)) {
    throw new Error('Solution title is required while solution is visible.')
  }

  if (isSectionVisible(content, 'results') && !hasText(content.results?.title)) {
    throw new Error('Results title is required while results is visible.')
  }

  if (
    isSectionVisible(content, 'method') &&
    (!hasText(content.method?.title) || (content.method?.items || []).length === 0)
  ) {
    throw new Error('Method title and at least one item are required while method is visible.')
  }

  if (
    isSectionVisible(content, 'commitment') &&
    (!hasText(content.commitment?.title) || (content.commitment?.items || []).length === 0)
  ) {
    throw new Error('Commitment title and at least one item are required while commitment is visible.')
  }

  if (
    isSectionVisible(content, 'faq') &&
    (!hasText(content.faq?.title) ||
      !(content.faq?.items || []).some((item) => hasText(item.question) && hasText(item.answer)))
  ) {
    throw new Error('FAQ title and at least one complete question are required while FAQ is visible.')
  }

  if (
    isSectionVisible(content, 'cta') &&
    (!hasText(content.cta?.title) || !hasText(content.cta?.submitLabel))
  ) {
    throw new Error('CTA title and submit label are required while CTA is visible.')
  }
}

export async function saveLandingContent(content, options = {}) {
  const adminClient = createAdminClient()
  if (!adminClient) {
    throw new Error('Supabase admin client is not configured.')
  }

  const normalized = normalizeLandingContent(content)
  assertLandingContentCanPublish(normalized)
  const expectedUpdatedAt = readOptionalString(options.expectedUpdatedAt)

  const current = await fetchDatabaseLandingContent(adminClient)
  assertLandingContentWriteVersion(current, expectedUpdatedAt)

  if (!current) {
    try {
      return await insertDatabaseLandingContent(adminClient, normalized)
    } catch (error) {
      if (error?.code === '23505') {
        throw createLandingContentConflictError()
      }

      throw error
    }
  }

  if (expectedUpdatedAt) {
    const saved = await updateDatabaseLandingContent(
      adminClient,
      normalized,
      expectedUpdatedAt
    )

    if (!saved) {
      throw createLandingContentConflictError()
    }

    return saved
  }

  return updateDatabaseLandingContent(adminClient, normalized)
}

export async function getLandingLevels() {
  const adminClient = createAdminClient()
  if (!adminClient) {
    console.warn('getLandingLevels fallback: Supabase admin client is not configured.')
    return []
  }

  try {
    const { data, error } = await adminClient
      .from('levels')
      .select(`
        id,
        name,
        slug,
        description,
        price,
        subject_count,
        duration_weeks,
        sort_order,
        is_active,
        subjects (
          id,
          name,
          description,
          sort_order
        )
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      throw error
    }

    return (data || []).map((level) => ({
      ...level,
      subjects: [...(level.subjects || [])].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
      ),
    }))
  } catch (error) {
    console.error('getLandingLevels fallback:', error)
    return []
  }
}

export async function getLandingPageData() {
  const [content, levels] = await Promise.all([getLandingContent(), getLandingLevels()])

  return {
    content,
    levels,
  }
}
