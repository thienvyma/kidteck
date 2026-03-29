import 'server-only'

import { createClient } from '@supabase/supabase-js'

const SITE_CONTENT_BUCKET = 'site-content'
const LEADS_DIR = 'landing'
const LEADS_FILE_PATTERN = /^leads(?:-\d+)?\.json$/

const LEAD_STATUSES = new Set(['new', 'contacted', 'qualified', 'enrolled', 'archived'])

function getVersionOrder(file) {
  const match = file?.name?.match(/^leads-(\d+)\.json$/)
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

async function ensureBucket(adminClient) {
  const { data: buckets, error: listError } = await adminClient.storage.listBuckets()
  if (listError) {
    throw listError
  }

  const exists = (buckets || []).some((bucket) => bucket.id === SITE_CONTENT_BUCKET)
  if (exists) {
    return
  }

  const { error: createError } = await adminClient.storage.createBucket(SITE_CONTENT_BUCKET, {
    public: false,
  })

  if (createError) {
    throw createError
  }
}

async function getLatestLeadsFile(adminClient) {
  const { data: files, error } = await adminClient.storage
    .from(SITE_CONTENT_BUCKET)
    .list(LEADS_DIR, {
      limit: 100,
    })

  if (error) {
    throw error
  }

  const latest = (files || [])
    .filter((file) => LEADS_FILE_PATTERN.test(file.name))
    .sort((a, b) => getVersionOrder(b) - getVersionOrder(a))[0]

  if (!latest) {
    return null
  }

  return `${LEADS_DIR}/${latest.name}`
}

async function pruneLeadVersions(adminClient) {
  const { data: files, error } = await adminClient.storage
    .from(SITE_CONTENT_BUCKET)
    .list(LEADS_DIR, {
      limit: 100,
    })

  if (error) {
    throw error
  }

  const removable = (files || [])
    .filter((file) => /^leads-\d+\.json$/.test(file.name))
    .sort((a, b) => getVersionOrder(b) - getVersionOrder(a))
    .slice(8)
    .map((file) => `${LEADS_DIR}/${file.name}`)

  if (removable.length === 0) {
    return
  }

  await adminClient.storage.from(SITE_CONTENT_BUCKET).remove(removable)
}

function readString(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()
  return trimmed || fallback
}

function readOptionalString(value) {
  return readString(value, '')
}

function normalizeStatus(value) {
  return LEAD_STATUSES.has(value) ? value : 'new'
}

function normalizeLead(input) {
  return {
    id: readString(input?.id, crypto.randomUUID()),
    name: readString(input?.name, 'Chưa rõ'),
    learnerName: readOptionalString(input?.learnerName),
    phone: readString(input?.phone, ''),
    email: readOptionalString(input?.email),
    stage: readString(input?.stage, 'Chưa rõ giai đoạn'),
    message: readOptionalString(input?.message),
    notes: readOptionalString(input?.notes),
    status: normalizeStatus(input?.status),
    source: readString(input?.source, 'landing_cta'),
    createdAt: readString(input?.createdAt, new Date().toISOString()),
    updatedAt: readString(input?.updatedAt, new Date().toISOString()),
  }
}

async function saveLeads(adminClient, leads) {
  await ensureBucket(adminClient)

  const payload = JSON.stringify(leads, null, 2)
  const filePath = `${LEADS_DIR}/leads-${Date.now()}.json`
  const { error } = await adminClient.storage
    .from(SITE_CONTENT_BUCKET)
    .upload(filePath, new Blob([payload]), {
      contentType: 'application/json',
      cacheControl: '0',
    })

  if (error) {
    throw error
  }

  await pruneLeadVersions(adminClient)
}

export async function getLandingLeads() {
  const adminClient = createAdminClient()

  try {
    const latestFile = await getLatestLeadsFile(adminClient)

    if (!latestFile) {
      return []
    }

    const { data, error } = await adminClient.storage
      .from(SITE_CONTENT_BUCKET)
      .download(latestFile)

    if (error || !data) {
      return []
    }

    const raw = JSON.parse(await data.text())
    const leads = Array.isArray(raw) ? raw.map(normalizeLead) : []

    return leads.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch (error) {
    console.warn('getLandingLeads fallback:', error?.message || error)
    return []
  }
}

export async function createLandingLead(input) {
  const adminClient = createAdminClient()
  const existing = await getLandingLeads()
  const now = new Date().toISOString()

  const lead = normalizeLead({
    ...input,
    id: crypto.randomUUID(),
    status: 'new',
    source: 'landing_cta',
    createdAt: now,
    updatedAt: now,
  })

  await saveLeads(adminClient, [lead, ...existing])
  return lead
}

export async function updateLandingLead(id, patch) {
  const adminClient = createAdminClient()
  const leads = await getLandingLeads()
  const index = leads.findIndex((lead) => lead.id === id)

  if (index === -1) {
    throw new Error('Lead not found')
  }

  const nextLead = normalizeLead({
    ...leads[index],
    ...patch,
    id: leads[index].id,
    updatedAt: new Date().toISOString(),
  })

  const nextLeads = [...leads]
  nextLeads[index] = nextLead

  await saveLeads(adminClient, nextLeads)
  return nextLead
}

export function summarizeLeads(leads) {
  const summary = {
    total: leads.length,
    new: 0,
    contacted: 0,
    qualified: 0,
    enrolled: 0,
    archived: 0,
  }

  for (const lead of leads) {
    if (summary[lead.status] !== undefined) {
      summary[lead.status] += 1
    }
  }

  return summary
}
