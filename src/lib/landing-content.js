import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { cloneDefaultLandingContent } from '@/lib/landing-defaults'

const LANDING_BUCKET = 'site-content'
const LANDING_DIR = 'landing'
const LANDING_FILE_PATTERN = /^content(?:-\d+)?\.json$/
const LANDING_CONTENT_TABLE = 'landing_content'
const LANDING_CONTENT_ROW_ID = 'default'
const LANDING_CONTENT_SELECT = 'id, content, created_at, updated_at'
const LANDING_CONTENT_CONFLICT_CODE = 'LANDING_CONTENT_CONFLICT'
const LANDING_CONTENT_CONFLICT_MESSAGE =
  'Landing content has changed on the server. Reload before saving.'

let landingContentSeedPromise = null

function getVersionOrder(file) {
  const match = file?.name?.match(/^content-(\d+)\.json$/)
  if (match) {
    return Number(match[1])
  }

  return new Date(file?.updated_at || file?.created_at || 0).getTime()
}

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
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

function readStringArray(values, fallback) {
  if (!Array.isArray(values)) {
    return fallback
  }

  const normalized = values
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)

  return normalized
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

  return values.length > 0
    ? values.map((item, index) => normalizeCard(item, fallback[index] || fallback[0]))
    : fallback
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
    header: {
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
      items: normalizeObjectArray(input?.method?.items, fallback.method.items),
    },
    commitment: {
      title: readString(input?.commitment?.title, fallback.commitment.title),
      subtitle: readString(input?.commitment?.subtitle, fallback.commitment.subtitle),
      items: normalizeObjectArray(input?.commitment?.items, fallback.commitment.items),
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
      items: (Array.isArray(input?.faq?.items) && input.faq.items.length > 0
        ? input.faq.items
        : fallback.faq.items
      ).map((item, index) => ({
        question: readString(item?.question, fallback.faq.items[index]?.question || fallback.faq.items[0].question),
        answer: readString(item?.answer, fallback.faq.items[index]?.answer || fallback.faq.items[0].answer),
      })),
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

function isMissingLandingContentTable(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase()

  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    (message.includes('landing_content') &&
      (message.includes('does not exist') || message.includes('schema cache')))
  )
}

async function ensureBucket(adminClient) {
  const { data: buckets, error: listError } = await adminClient.storage.listBuckets()
  if (listError) {
    throw listError
  }

  const exists = (buckets || []).some((bucket) => bucket.id === LANDING_BUCKET)
  if (exists) {
    return
  }

  const { error: createError } = await adminClient.storage.createBucket(LANDING_BUCKET, {
    public: false,
  })

  if (createError) {
    throw createError
  }
}

async function getLatestLandingFile(adminClient) {
  const { data: files, error } = await adminClient.storage
    .from(LANDING_BUCKET)
    .list(LANDING_DIR, {
      limit: 100,
    })

  if (error) {
    throw error
  }

  const latest = (files || [])
    .filter((file) => LANDING_FILE_PATTERN.test(file.name))
    .sort((a, b) => getVersionOrder(b) - getVersionOrder(a))[0]

  if (!latest) {
    return null
  }

  return `${LANDING_DIR}/${latest.name}`
}

async function pruneLandingVersions(adminClient) {
  const { data: files, error } = await adminClient.storage
    .from(LANDING_BUCKET)
    .list(LANDING_DIR, {
      limit: 100,
    })

  if (error) {
    throw error
  }

  const removable = (files || [])
    .filter((file) => /^content-\d+\.json$/.test(file.name))
    .sort((a, b) => getVersionOrder(b) - getVersionOrder(a))
    .slice(6)
    .map((file) => `${LANDING_DIR}/${file.name}`)

  if (removable.length === 0) {
    return
  }

  await adminClient.storage.from(LANDING_BUCKET).remove(removable)
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

async function getLegacyLandingContent(adminClient) {
  const fallback = cloneDefaultLandingContent()

  try {
    const latestFile = await getLatestLandingFile(adminClient)

    if (!latestFile) {
      return fallback
    }

    const { data, error } = await adminClient.storage
      .from(LANDING_BUCKET)
      .download(latestFile)

    if (error || !data) {
      return fallback
    }

    const text = await data.text()
    return normalizeLandingContent(JSON.parse(text))
  } catch (error) {
    console.warn('getLegacyLandingContent fallback:', error?.message || error)
    return fallback
  }
}

async function saveLegacyLandingContent(adminClient, content) {
  await ensureBucket(adminClient)

  const filePath = `${LANDING_DIR}/content-${Date.now()}.json`
  const { error } = await adminClient.storage
    .from(LANDING_BUCKET)
    .upload(filePath, Buffer.from(JSON.stringify(content, null, 2), 'utf8'), {
      contentType: 'application/json',
      cacheControl: '0',
    })

  if (error) {
    throw error
  }

  await pruneLandingVersions(adminClient)

  return {
    content,
    createdAt: '',
    updatedAt: '',
  }
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

    const legacyContent = await getLegacyLandingContent(adminClient)

    try {
      return await insertDatabaseLandingContent(adminClient, legacyContent)
    } catch (error) {
      if (error?.code === '23505') {
        return fetchDatabaseLandingContent(adminClient)
      }

      throw error
    }
  })().catch((error) => {
    landingContentSeedPromise = null
    throw error
  })

  return landingContentSeedPromise
}

export async function getLandingContentDocument() {
  const adminClient = createAdminClient()
  const fallback = cloneDefaultLandingContent()

  try {
    const current = await fetchDatabaseLandingContent(adminClient)
    if (current) {
      return current
    }

    const seeded = await ensureLandingContentSeeded(adminClient)
    return seeded || { content: fallback, createdAt: '', updatedAt: '' }
  } catch (error) {
    if (isMissingLandingContentTable(error)) {
      return {
        content: await getLegacyLandingContent(adminClient),
        createdAt: '',
        updatedAt: '',
      }
    }

    console.warn('getLandingContentDocument fallback:', error?.message || error)
    return { content: fallback, createdAt: '', updatedAt: '' }
  }
}

export async function getLandingContent() {
  const document = await getLandingContentDocument()
  return document.content
}

export async function saveLandingContent(content, options = {}) {
  const adminClient = createAdminClient()
  const normalized = normalizeLandingContent(content)
  const expectedUpdatedAt = readOptionalString(options.expectedUpdatedAt)

  try {
    const current = await ensureLandingContentSeeded(adminClient)

    if (!current) {
      return insertDatabaseLandingContent(adminClient, normalized)
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
  } catch (error) {
    if (!isMissingLandingContentTable(error)) {
      throw error
    }
  }

  return saveLegacyLandingContent(adminClient, normalized)
}

export async function getLandingLevels() {
  const adminClient = createAdminClient()
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
}

export async function getLandingPageData() {
  const [content, levels] = await Promise.all([getLandingContent(), getLandingLevels()])

  return {
    content,
    levels,
  }
}
