import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase-server'

const STUDENT_ROSTER_VIEW = 'admin_student_roster'

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
  return value.replace(/[%_,()]/g, '')
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
      default:
        return compareValues(a.createdAtValue, b.createdAtValue, sortDir)
    }
  })
}

function mapStudentRow(row) {
  return {
    id: row.id,
    full_name: row.full_name || '-',
    phone: row.phone || '-',
    level: row.level || 'Chua kich hoat',
    status: row.status || 'inactive',
    created_at: new Date(row.created_at).toLocaleDateString('vi-VN'),
    createdAtValue: row.created_at,
  }
}

function getStudentOrder(sortKey) {
  switch (sortKey) {
    case 'full_name':
      return { column: 'full_name', ascending: true }
    case 'phone':
      return { column: 'phone', ascending: true, nullsFirst: false }
    case 'level':
      return { column: 'level', ascending: true }
    case 'status':
      return { column: 'status', ascending: true }
    case 'created_at':
    default:
      return { column: 'created_at', ascending: false }
  }
}

function isMissingStudentRosterView(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase()

  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    (message.includes(STUDENT_ROSTER_VIEW) &&
      (message.includes('does not exist') || message.includes('schema cache')))
  )
}

async function queryStudentRoster(adminClient, options) {
  const filter = readString(options.filter) || 'all'
  const query = readString(options.query)
  const page = readPage(String(options.page))
  const perPage = readPerPage(String(options.perPage))
  const sortKey = readString(options.sortKey)
  const sortDir = readString(options.sortDir) === 'desc' ? 'desc' : 'asc'
  const orderConfig = getStudentOrder(sortKey)

  let queryBuilder = adminClient
    .from(STUDENT_ROSTER_VIEW)
    .select('id, full_name, phone, level, status, created_at', { count: 'exact' })

  if (filter && filter !== 'all') {
    queryBuilder = queryBuilder.eq('status', filter)
  }

  if (query) {
    const safeQuery = escapeIlike(query)
    queryBuilder = queryBuilder.or(
      [
        `full_name.ilike.%${safeQuery}%`,
        `phone.ilike.%${safeQuery}%`,
        `level.ilike.%${safeQuery}%`,
      ].join(',')
    )
  }

  const start = page * perPage
  const end = start + perPage - 1
  const { data, count, error } = await queryBuilder
    .order(orderConfig.column, {
      ascending: sortDir === 'asc',
      nullsFirst: orderConfig.nullsFirst,
    })
    .range(start, end)

  if (error) {
    throw error
  }

  const totalItems = count || 0
  return {
    students: (data || []).map(mapStudentRow),
    pagination: {
      page,
      perPage,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / perPage)),
    },
  }
}

async function queryLegacyStudents(adminClient, options) {
  const filter = readString(options.filter) || 'all'
  const query = readString(options.query)
  const page = readPage(String(options.page))
  const perPage = readPerPage(String(options.perPage))
  const sortKey = readString(options.sortKey)
  const sortDir = readString(options.sortDir) === 'desc' ? 'desc' : 'asc'

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
    throw error
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

  const filteredRows = filter === 'all' ? rows : rows.filter((student) => student.status === filter)
  const sortedRows = sortStudents(filteredRows, sortKey, sortDir)
  const totalItems = sortedRows.length
  const start = page * perPage

  return {
    students: sortedRows.slice(start, start + perPage),
    pagination: {
      page,
      perPage,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / perPage)),
    },
  }
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

    try {
      const result = await queryStudentRoster(adminClient, {
        filter,
        query,
        page,
        perPage,
        sortKey,
        sortDir,
      })

      return NextResponse.json(result)
    } catch (error) {
      if (!isMissingStudentRosterView(error)) {
        throw error
      }
    }

    const fallback = await queryLegacyStudents(adminClient, {
      filter,
      query,
      page,
      perPage,
      sortKey,
      sortDir,
    })

    return NextResponse.json(fallback)
  } catch (error) {
    console.error('admin students GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
