import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import {
  getLandingLeadSummary,
  queryLandingLeads,
  updateLandingLead,
} from '@/lib/landing-leads'

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

export async function GET(request) {
  try {
    const auth = await verifyAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const status = readString(searchParams.get('status'))
    const query = readString(searchParams.get('q'))
    const page = readPage(searchParams.get('page'))
    const perPage = readPerPage(searchParams.get('perPage'))
    const sortKey = readString(searchParams.get('sortKey'))
    const sortDir = readString(searchParams.get('sortDir')) === 'desc' ? 'desc' : 'asc'

    const [{ leads, pagination }, summary] = await Promise.all([
      queryLandingLeads({
        status,
        query,
        page,
        perPage,
        sortKey,
        sortDir,
      }),
      getLandingLeadSummary(),
    ])

    return NextResponse.json({
      leads,
      summary,
      pagination,
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
