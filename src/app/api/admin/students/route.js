import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase-server'

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

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
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

function escapeIlike(value) {
  return value.replace(/[%_]/g, '')
}

function compareValues(a, b, direction) {
  const left = typeof a === 'string' ? a.toLowerCase() : a ?? ''
  const right = typeof b === 'string' ? b.toLowerCase() : b ?? ''

  if (left < right) return direction === 'asc' ? -1 : 1
  if (left > right) return direction === 'asc' ? 1 : -1
  return 0
}

function sortStudents(rows, sortKey, sortDir) {
  if (!sortKey) {
    return rows
  }

  return [...rows].sort((a, b) => {
    switch (sortKey) {
      case 'full_name':
      case 'phone':
      case 'level':
      case 'status':
        return compareValues(a[sortKey], b[sortKey], sortDir)
      case 'created_at':
        return compareValues(a.createdAtValue, b.createdAtValue, sortDir)
      default:
        return compareValues(a.createdAtValue, b.createdAtValue, 'desc')
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
    const filter = readString(searchParams.get('status')) || 'all'
    const query = readString(searchParams.get('q'))
    const page = readPage(searchParams.get('page'))
    const perPage = readPerPage(searchParams.get('perPage'))
    const sortKey = readString(searchParams.get('sortKey'))
    const sortDir = readString(searchParams.get('sortDir')) === 'desc' ? 'desc' : 'asc'

    const adminClient = createAdminClient()
    let studentsQuery = adminClient
      .from('profiles')
      .select(
        `
          id,
          full_name,
          phone,
          created_at,
          enrollments(status, enrolled_at, levels(name))
        `
      )
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    if (query) {
      const safeQuery = escapeIlike(query)
      studentsQuery = studentsQuery.or(`full_name.ilike.%${safeQuery}%,phone.ilike.%${safeQuery}%`)
    }

    const { data, error } = await studentsQuery

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const rows = (data || []).map((student) => {
      const orderedEnrollments = [...(student.enrollments || [])].sort(
        (a, b) => new Date(b.enrolled_at || 0) - new Date(a.enrolled_at || 0)
      )
      const currentEnrollment =
        orderedEnrollments.find((item) => item.status === 'active') ||
        orderedEnrollments[0] ||
        null

      return {
        id: student.id,
        full_name: student.full_name || '-',
        phone: student.phone || '-',
        level: currentEnrollment?.levels?.name || 'Chua kich hoat',
        status: currentEnrollment?.status || 'inactive',
        created_at: new Date(student.created_at).toLocaleDateString('vi-VN'),
        createdAtValue: student.created_at,
      }
    })

    const filteredRows =
      filter === 'all' ? rows : rows.filter((student) => student.status === filter)
    const sortedRows = sortStudents(filteredRows, sortKey, sortDir)
    const totalItems = sortedRows.length
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
    const start = page * perPage
    const students = sortedRows.slice(start, start + perPage)

    return NextResponse.json({
      students,
      pagination: {
        page,
        perPage,
        totalItems,
        totalPages,
      },
    })
  } catch (error) {
    console.error('admin students GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
