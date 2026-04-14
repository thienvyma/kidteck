import 'server-only'

import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const SITE_CONTENT_BUCKET = 'site-content'
const LEADS_DIR = 'landing'
const LEGACY_LEADS_FILE_PATTERN = /^leads(?:-\d+)?\.json$/
const LEAD_EVENTS_DIR = `${LEADS_DIR}/lead-events`
const LEAD_EVENT_FILE_PATTERN = /^\d+-[0-9a-f-]+\.json$/i
const STORAGE_LIST_PAGE_SIZE = 100
const LANDING_LEADS_TABLE = 'landing_leads'
const LANDING_LEADS_SELECT = `
  id,
  name,
  learner_name,
  phone,
  email,
  stage,
  message,
  notes,
  status,
  source,
  created_at,
  updated_at
`

const LEAD_STATUSES = new Set(['new', 'contacted', 'qualified', 'enrolled', 'archived'])

let legacyLeadBackfillPromise = null

function getVersionOrder(file) {
  const match = file?.name?.match(/^leads-(\d+)\.json$/)
  if (match) {
    return Number(match[1])
  }

  return new Date(file?.updated_at || file?.created_at || 0).getTime()
}

function getEventOrder(file) {
  const match = file?.name?.match(/^(\d+)-/)
  return Number(match?.[1] || 0)
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

async function listFiles(adminClient, directory) {
  const allFiles = []
  let offset = 0

  while (true) {
    const { data, error } = await adminClient.storage
      .from(SITE_CONTENT_BUCKET)
      .list(directory, {
        limit: STORAGE_LIST_PAGE_SIZE,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      })

    if (error) {
      throw error
    }

    const files = data || []
    allFiles.push(...files)

    if (files.length < STORAGE_LIST_PAGE_SIZE) {
      return allFiles
    }

    offset += STORAGE_LIST_PAGE_SIZE
  }
}

async function getLatestLegacyLeadsFile(adminClient) {
  const files = await listFiles(adminClient, LEADS_DIR)
  const latest = files
    .filter((file) => LEGACY_LEADS_FILE_PATTERN.test(file.name))
    .sort((a, b) => getVersionOrder(b) - getVersionOrder(a))[0]

  if (!latest) {
    return null
  }

  return `${LEADS_DIR}/${latest.name}`
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
    name: readString(input?.name, 'Ch\u01b0a r\u00f5'),
    learnerName: readOptionalString(input?.learnerName),
    phone: readString(input?.phone, ''),
    email: readOptionalString(input?.email),
    stage: readString(input?.stage, 'Ch\u01b0a r\u00f5 giai \u0111o\u1ea1n'),
    message: readOptionalString(input?.message),
    notes: readOptionalString(input?.notes),
    status: normalizeStatus(input?.status),
    source: readString(input?.source, 'landing_cta'),
    createdAt: readString(input?.createdAt, new Date().toISOString()),
    updatedAt: readString(input?.updatedAt, new Date().toISOString()),
  }
}

function normalizeLeadPatch(input) {
  const patch = {}

  if (input?.status !== undefined) {
    patch.status = normalizeStatus(input.status)
  }

  if (input?.notes !== undefined) {
    patch.notes = readOptionalString(input.notes)
  }

  return patch
}

function mapLeadRow(row) {
  return normalizeLead({
    id: row?.id,
    name: row?.name,
    learnerName: row?.learner_name,
    phone: row?.phone,
    email: row?.email,
    stage: row?.stage,
    message: row?.message,
    notes: row?.notes,
    status: row?.status,
    source: row?.source,
    createdAt: row?.created_at,
    updatedAt: row?.updated_at,
  })
}

function toLeadRow(lead) {
  return {
    id: lead.id,
    name: lead.name,
    learner_name: lead.learnerName || null,
    phone: lead.phone,
    email: lead.email || null,
    stage: lead.stage,
    message: lead.message || null,
    notes: lead.notes || null,
    status: lead.status,
    source: lead.source,
    created_at: lead.createdAt,
    updated_at: lead.updatedAt,
  }
}

function isMissingLandingLeadsTable(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase()

  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    (message.includes('landing_leads') &&
      (message.includes('does not exist') || message.includes('schema cache')))
  )
}

async function fetchDatabaseLeads(adminClient) {
  const { data, error } = await adminClient
    .from(LANDING_LEADS_TABLE)
    .select(LANDING_LEADS_SELECT)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map(mapLeadRow)
}

async function insertDatabaseLead(adminClient, lead) {
  const { data, error } = await adminClient
    .from(LANDING_LEADS_TABLE)
    .insert(toLeadRow(lead))
    .select(LANDING_LEADS_SELECT)
    .single()

  if (error) {
    throw error
  }

  return mapLeadRow(data)
}

async function insertMissingLegacyLeads(adminClient, leads) {
  if (!Array.isArray(leads) || leads.length === 0) {
    return
  }

  const { error } = await adminClient
    .from(LANDING_LEADS_TABLE)
    .upsert(
      leads.map(toLeadRow),
      {
        onConflict: 'id',
        ignoreDuplicates: true,
      }
    )

  if (error) {
    throw error
  }
}

async function applyDatabaseLeadPatch(adminClient, id, patch, updatedAt) {
  const updateData = { updated_at: updatedAt }

  if (patch.status !== undefined) {
    updateData.status = patch.status
  }

  if (patch.notes !== undefined) {
    updateData.notes = patch.notes || null
  }

  const { data, error } = await adminClient
    .from(LANDING_LEADS_TABLE)
    .update(updateData)
    .eq('id', id)
    .select(LANDING_LEADS_SELECT)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ? mapLeadRow(data) : null
}

async function appendLeadEvent(adminClient, event) {
  await ensureBucket(adminClient)

  const filePath = `${LEAD_EVENTS_DIR}/${Date.now()}-${crypto.randomUUID()}.json`
  const payload = JSON.stringify(event, null, 2)
  const { error } = await adminClient.storage
    .from(SITE_CONTENT_BUCKET)
    .upload(filePath, Buffer.from(payload, 'utf8'), {
      contentType: 'application/json',
      cacheControl: '0',
    })

  if (error) {
    throw error
  }
}

async function getLegacyBaseLeads(adminClient) {
  const latestFile = await getLatestLegacyLeadsFile(adminClient)

  if (!latestFile) {
    return []
  }

  const { data, error } = await adminClient.storage
    .from(SITE_CONTENT_BUCKET)
    .download(latestFile)

  if (error || !data) {
    return []
  }

  try {
    const raw = JSON.parse(await data.text())
    return Array.isArray(raw) ? raw.map(normalizeLead) : []
  } catch {
    return []
  }
}

async function getLegacyLeadEvents(adminClient) {
  const files = (await listFiles(adminClient, LEAD_EVENTS_DIR))
    .filter((file) => LEAD_EVENT_FILE_PATTERN.test(file.name))
    .sort((a, b) => {
      const diff = getEventOrder(a) - getEventOrder(b)
      if (diff !== 0) {
        return diff
      }

      return a.name.localeCompare(b.name)
    })

  if (files.length === 0) {
    return []
  }

  const events = await Promise.all(
    files.map(async (file) => {
      const { data, error } = await adminClient.storage
        .from(SITE_CONTENT_BUCKET)
        .download(`${LEAD_EVENTS_DIR}/${file.name}`)

      if (error || !data) {
        return null
      }

      try {
        const raw = JSON.parse(await data.text())
        const createdAt = readString(raw?.createdAt, new Date().toISOString())

        if (raw?.type === 'upsert') {
          return {
            type: 'upsert',
            createdAt,
            fileName: file.name,
            lead: normalizeLead(raw.lead),
          }
        }

        if (raw?.type === 'patch') {
          const leadId = readString(raw?.leadId)
          if (!leadId) {
            return null
          }

          return {
            type: 'patch',
            createdAt,
            fileName: file.name,
            leadId,
            patch: normalizeLeadPatch(raw.payload || raw.patch),
          }
        }

        return null
      } catch {
        return null
      }
    })
  )

  return events
    .filter(Boolean)
    .sort((a, b) => {
      const timeDiff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (timeDiff !== 0) {
        return timeDiff
      }

      return a.fileName.localeCompare(b.fileName)
    })
}

async function getLegacyLandingLeads(adminClient) {
  const [legacyLeads, events] = await Promise.all([
    getLegacyBaseLeads(adminClient),
    getLegacyLeadEvents(adminClient),
  ])

  const leadMap = new Map(legacyLeads.map((lead) => [lead.id, lead]))

  for (const event of events) {
    if (event.type === 'upsert') {
      leadMap.set(event.lead.id, event.lead)
      continue
    }

    const currentLead = leadMap.get(event.leadId)
    if (!currentLead) {
      continue
    }

    leadMap.set(
      event.leadId,
      normalizeLead({
        ...currentLead,
        ...event.patch,
        id: currentLead.id,
        updatedAt: event.createdAt,
      })
    )
  }

  return Array.from(leadMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

async function ensureLegacyLeadsBackfilled(adminClient) {
  if (legacyLeadBackfillPromise) {
    return legacyLeadBackfillPromise
  }

  legacyLeadBackfillPromise = (async () => {
    const legacyLeads = await getLegacyLandingLeads(adminClient)
    await insertMissingLegacyLeads(adminClient, legacyLeads)
    return legacyLeads
  })().catch((error) => {
    legacyLeadBackfillPromise = null
    throw error
  })

  return legacyLeadBackfillPromise
}

async function getDatabaseLeadsWithBackfill(adminClient) {
  const leads = await fetchDatabaseLeads(adminClient)

  try {
    const legacyLeads = await ensureLegacyLeadsBackfilled(adminClient)

    if (legacyLeads.length > 0) {
      return fetchDatabaseLeads(adminClient)
    }
  } catch (error) {
    console.warn('landing leads legacy import skipped:', error?.message || error)
  }

  return leads
}

export async function getLandingLeads() {
  const adminClient = createAdminClient()

  try {
    return await getDatabaseLeadsWithBackfill(adminClient)
  } catch (error) {
    if (isMissingLandingLeadsTable(error)) {
      try {
        return await getLegacyLandingLeads(adminClient)
      } catch (legacyError) {
        console.warn('getLandingLeads legacy fallback:', legacyError?.message || legacyError)
        return []
      }
    }

    console.warn('getLandingLeads fallback:', error?.message || error)
    return []
  }
}

export async function createLandingLead(input) {
  const adminClient = createAdminClient()
  const now = new Date().toISOString()

  const lead = normalizeLead({
    ...input,
    id: crypto.randomUUID(),
    status: 'new',
    source: 'landing_cta',
    createdAt: now,
    updatedAt: now,
  })

  try {
    return await insertDatabaseLead(adminClient, lead)
  } catch (error) {
    if (!isMissingLandingLeadsTable(error)) {
      throw error
    }
  }

  await appendLeadEvent(adminClient, {
    type: 'upsert',
    createdAt: now,
    lead,
  })

  return lead
}

export async function updateLandingLead(id, patch) {
  const adminClient = createAdminClient()
  const now = new Date().toISOString()
  const normalizedPatch = normalizeLeadPatch(patch)

  try {
    let nextLead = await applyDatabaseLeadPatch(adminClient, id, normalizedPatch, now)

    if (!nextLead) {
      await ensureLegacyLeadsBackfilled(adminClient)
      nextLead = await applyDatabaseLeadPatch(adminClient, id, normalizedPatch, now)
    }

    if (nextLead) {
      return nextLead
    }

    throw new Error('Lead not found')
  } catch (error) {
    if (!isMissingLandingLeadsTable(error)) {
      throw error
    }
  }

  const leads = await getLegacyLandingLeads(adminClient)
  const currentLead = leads.find((lead) => lead.id === id)

  if (!currentLead) {
    throw new Error('Lead not found')
  }

  await appendLeadEvent(adminClient, {
    type: 'patch',
    createdAt: now,
    leadId: currentLead.id,
    payload: normalizedPatch,
  })

  return normalizeLead({
    ...currentLead,
    ...normalizedPatch,
    id: currentLead.id,
    updatedAt: now,
  })
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
