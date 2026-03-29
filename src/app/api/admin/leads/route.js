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

export async function GET(request) {
  try {
    const auth = await verifyAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const status = readString(searchParams.get('status'))

    const allLeads = await getLandingLeads()
    const leads =
      status && status !== 'all'
        ? allLeads.filter((lead) => lead.status === status)
        : allLeads

    return NextResponse.json({
      leads,
      summary: summarizeLeads(allLeads),
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
