import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getLandingLeads, summarizeLeads, updateLandingLead } from '@/lib/landing-leads'

const LEAD_STATUSES = new Set(['new', 'contacted', 'qualified', 'enrolled', 'archived'])

async function verifyAdmin() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Forbidden - admin only', status: 403 }
  }

  return { user }
}

function readString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function readPage(value) {
  const nextValue = Number.parseInt(value || '0', 10)
  return Number.isInteger(nextValue) && nextValue >= 0 ? nextValue : 0
}

function readPerPage(value) {
  const nextValue = Number.parseInt(value || '10', 10)
  if (!Number.isInteger(nextValue) || nextValue <= 0) {
    return 10
  }

  return Math.min(nextValue, 100)
}

function compareValues(a, b, direction) {
  const left = typeof a === 'string' ? a.toLowerCase() : a ?? ''
  const right = typeof b === 'string' ? b.toLowerCase() : b ?? ''

  if (left < right) return direction === 'asc' ? -1 : 1
  if (left > right) return direction === 'asc' ? 1 : -1
  return 0
}

function sortLeads(rows, sortKey, sortDir) {
  if (!sortKey) {
    return rows
  }

  return [...rows].sort((a, b) => {
    switch (sortKey) {
      case 'createdLabel':
        return compareValues(a.createdAt, b.createdAt, sortDir)
      case 'name':
      case 'learnerLabel':
      case 'phone':
      case 'stage':
      case 'status':
        return compareValues(a[sortKey], b[sortKey], sortDir)
      default:
        return compareValues(a.createdAt, b.createdAt, 'desc')
    }
  })
}

export async function GET(request) {
  try {
    const auth = await verifyAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const status = readString(searchParams.get('status'))
    const query = readString(searchParams.get('q')).toLowerCase()
    const page = readPage(searchParams.get('page'))
    const perPage = readPerPage(searchParams.get('perPage'))
    const sortKey = readString(searchParams.get('sortKey'))
    const sortDir = readString(searchParams.get('sortDir')) === 'desc' ? 'desc' : 'asc'

    const allLeads = await getLandingLeads()
    const statusFilteredLeads =
      status && status !== 'all'
        ? allLeads.filter((lead) => lead.status === status)
        : allLeads
    const searchFilteredLeads = query
      ? statusFilteredLeads.filter((lead) =>
          [lead.name, lead.learnerName, lead.phone, lead.email, lead.stage, lead.status]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(query)
        )
      : statusFilteredLeads
    const mappedLeads = searchFilteredLeads.map((lead) => ({
      ...lead,
      createdLabel: lead.createdAt,
      updatedLabel: lead.updatedAt,
      learnerLabel: lead.learnerName || '—',
    }))
    const sortedLeads = sortLeads(mappedLeads, sortKey, sortDir)
    const totalItems = sortedLeads.length
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
    const start = page * perPage
    const leads = sortedLeads.slice(start, start + perPage)

    return NextResponse.json({
      leads,
      summary: summarizeLeads(allLeads),
      pagination: {
        page,
        perPage,
        totalItems,
        totalPages,
      },
    })
  } catch (error) {
    console.error('admin leads GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const auth = await verifyAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const leadId = readString(body?.leadId)
    const nextStatus = readString(body?.status)
    const notes = readString(body?.notes)

    if (!leadId) {
      return NextResponse.json({ error: 'Missing leadId' }, { status: 400 })
    }

    if (nextStatus && !LEAD_STATUSES.has(nextStatus)) {
      return NextResponse.json({ error: 'Invalid lead status' }, { status: 400 })
    }

    const lead = await updateLandingLead(leadId, {
      ...(nextStatus ? { status: nextStatus } : {}),
      notes,
    })

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error('admin leads PATCH error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
