import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase-server'

const PAYMENT_METHODS = new Set(['bank_transfer', 'momo', 'cash', 'other'])
const PAYMENT_STATUSES = new Set(['pending', 'paid', 'refunded'])
const PAYMENT_ROWS_VIEW = 'admin_payment_rows'

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

function sortPayments(rows, sortKey, sortDir) {
  if (!sortKey) {
    return rows
  }

  return [...rows].sort((a, b) => {
    switch (sortKey) {
      case 'student':
      case 'level':
      case 'enrollmentStatus':
      case 'status':
        return compareValues(a[sortKey], b[sortKey], sortDir)
      case 'methodLabel':
        return compareValues(a.method, b.method, sortDir)
      case 'amountFormatted':
        return compareValues(a.amount, b.amount, sortDir)
      case 'createdLabel':
      default:
        return compareValues(a.createdAt, b.createdAt, sortDir)
    }
  })
}

function mapPaymentRow(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    student: row.student || '-',
    levelId: row.level_id,
    level: row.level || '-',
    amount: row.amount || 0,
    method: row.method || 'other',
    status: row.status || 'pending',
    transactionId: row.transaction_id || '',
    createdAt: row.created_at,
    paidAt: row.paid_at,
    enrollmentStatus: row.enrollment_status || 'inactive',
  }
}

function getPaymentOrder(sortKey) {
  switch (sortKey) {
    case 'student':
      return { column: 'student', ascending: true }
    case 'level':
      return { column: 'level', ascending: true }
    case 'enrollmentStatus':
      return { column: 'enrollment_status', ascending: true }
    case 'status':
      return { column: 'status', ascending: true }
    case 'methodLabel':
      return { column: 'method', ascending: true }
    case 'amountFormatted':
      return { column: 'amount', ascending: false }
    case 'createdLabel':
    default:
      return { column: 'created_at', ascending: false }
  }
}

function isMissingPaymentRowsView(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase()

  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    (message.includes(PAYMENT_ROWS_VIEW) &&
      (message.includes('does not exist') || message.includes('schema cache')))
  )
}

function isMissingPaymentSummaryFunction(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase()

  return (
    error?.code === '42883' ||
    error?.code === 'PGRST202' ||
    (message.includes('admin_payment_summary') &&
      (message.includes('does not exist') ||
        message.includes('could not find') ||
        message.includes('schema cache')))
  )
}

async function syncEnrollmentActivation(adminClient, studentId, levelId) {
  const { data: existing, error: readError } = await adminClient
    .from('enrollments')
    .select('id, status')
    .eq('student_id', studentId)
    .eq('level_id', levelId)
    .maybeSingle()

  if (readError) {
    throw readError
  }

  if (!existing) {
    const { error: insertError } = await adminClient.from('enrollments').insert({
      student_id: studentId,
      level_id: levelId,
      status: 'active',
    })

    if (insertError) {
      throw insertError
    }

    return
  }

  if (existing.status === 'completed') {
    return
  }

  const { error: updateError } = await adminClient
    .from('enrollments')
    .update({
      status: 'active',
      completed_at: null,
    })
    .eq('id', existing.id)

  if (updateError) {
    throw updateError
  }
}

async function queryPaymentRows(adminClient, options) {
  const statusFilter = options.statusFilter
  const studentId = options.studentId
  const query = readString(options.query)
  const page = readPage(String(options.page))
  const perPage = readPerPage(String(options.perPage))
  const sortKey = readString(options.sortKey)
  const sortDir = readString(options.sortDir) === 'desc' ? 'desc' : 'asc'
  const orderConfig = getPaymentOrder(sortKey)

  let queryBuilder = adminClient
    .from(PAYMENT_ROWS_VIEW)
    .select(
      `
        id,
        student_id,
        student,
        level_id,
        level,
        amount,
        status,
        method,
        transaction_id,
        created_at,
        paid_at,
        enrollment_status
      `,
      { count: 'exact' }
    )

  if (statusFilter && statusFilter !== 'all') {
    queryBuilder = queryBuilder.eq('status', statusFilter)
  }

  if (studentId) {
    queryBuilder = queryBuilder.eq('student_id', studentId)
  }

  if (query) {
    const safeQuery = escapeIlike(query)
    queryBuilder = queryBuilder.or(
      [
        `student.ilike.%${safeQuery}%`,
        `level.ilike.%${safeQuery}%`,
        `transaction_id.ilike.%${safeQuery}%`,
        `method.ilike.%${safeQuery}%`,
        `status.ilike.%${safeQuery}%`,
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
    payments: (data || []).map(mapPaymentRow),
    pagination: {
      page,
      perPage,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / perPage)),
    },
  }
}

async function queryPaymentSummary(adminClient, options) {
  const filterStatus =
    options.statusFilter && options.statusFilter !== 'all' ? options.statusFilter : null
  const filterStudentId = options.studentId || null

  const { data, error } = await adminClient.rpc('admin_payment_summary', {
    filter_status: filterStatus,
    filter_student_id: filterStudentId,
  })

  if (error) {
    throw error
  }

  const row = Array.isArray(data) ? data[0] : data
  return {
    totalPaid: Number(row?.total_paid || 0),
    totalPending: Number(row?.total_pending || 0),
    count: Number(row?.count || 0),
  }
}

async function queryLegacyPayments(adminClient, options) {
  const statusFilter = options.statusFilter
  const studentId = options.studentId
  const query = readString(options.query).toLowerCase()
  const page = readPage(String(options.page))
  const perPage = readPerPage(String(options.perPage))
  const sortKey = readString(options.sortKey)
  const sortDir = readString(options.sortDir) === 'desc' ? 'desc' : 'asc'

  let paymentsQuery = adminClient
    .from('payments')
    .select(
      `
        id,
        student_id,
        level_id,
        amount,
        status,
        method,
        transaction_id,
        created_at,
        paid_at,
        profiles(full_name),
        levels(name)
      `
    )
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    paymentsQuery = paymentsQuery.eq('status', statusFilter)
  }

  if (studentId) {
    paymentsQuery = paymentsQuery.eq('student_id', studentId)
  }

  const { data: payments, error: paymentsError } = await paymentsQuery

  if (paymentsError) {
    throw paymentsError
  }

  const { data: enrollments, error: enrollmentsError } = await adminClient
    .from('enrollments')
    .select('student_id, level_id, status')

  if (enrollmentsError) {
    throw enrollmentsError
  }

  const enrollmentByKey = new Map(
    (enrollments || []).map((row) => [`${row.student_id}:${row.level_id}`, row.status])
  )

  const baseRows = (payments || []).map((payment) => ({
    id: payment.id,
    studentId: payment.student_id,
    student: payment.profiles?.full_name || '-',
    levelId: payment.level_id,
    level: payment.levels?.name || '-',
    amount: payment.amount || 0,
    method: payment.method || 'other',
    status: payment.status,
    transactionId: payment.transaction_id || '',
    createdAt: payment.created_at,
    paidAt: payment.paid_at,
    enrollmentStatus:
      enrollmentByKey.get(`${payment.student_id}:${payment.level_id}`) || 'inactive',
  }))

  const totalPaid = baseRows
    .filter((row) => row.status === 'paid')
    .reduce((sum, row) => sum + row.amount, 0)
  const totalPending = baseRows
    .filter((row) => row.status === 'pending')
    .reduce((sum, row) => sum + row.amount, 0)
  const searchFilteredRows = query
    ? baseRows.filter((row) =>
        [row.student, row.level, row.transactionId, row.method, row.status]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query)
      )
    : baseRows
  const rows = sortPayments(searchFilteredRows, sortKey, sortDir)
  const totalItems = rows.length
  const start = page * perPage

  return {
    payments: rows.slice(start, start + perPage),
    summary: {
      totalPaid,
      totalPending,
      count: baseRows.length,
    },
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
    const statusFilter = searchParams.get('status')
    const studentId = searchParams.get('studentId')
    const query = readString(searchParams.get('q'))
    const page = readPage(searchParams.get('page'))
    const perPage = readPerPage(searchParams.get('perPage'))
    const sortKey = readString(searchParams.get('sortKey'))
    const sortDir = readString(searchParams.get('sortDir')) === 'desc' ? 'desc' : 'asc'

    const adminClient = createAdminClient()

    try {
      const [rowsResult, summary] = await Promise.all([
        queryPaymentRows(adminClient, {
          statusFilter,
          studentId,
          query,
          page,
          perPage,
          sortKey,
          sortDir,
        }),
        queryPaymentSummary(adminClient, { statusFilter, studentId }),
      ])

      return NextResponse.json({
        payments: rowsResult.payments,
        summary,
        pagination: rowsResult.pagination,
      })
    } catch (error) {
      if (!isMissingPaymentRowsView(error) && !isMissingPaymentSummaryFunction(error)) {
        throw error
      }
    }

    const fallback = await queryLegacyPayments(adminClient, {
      statusFilter,
      studentId,
      query,
      page,
      perPage,
      sortKey,
      sortDir,
    })

    return NextResponse.json(fallback)
  } catch (err) {
    console.error('admin payments GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()

    if (body.action !== 'recordPayment') {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
    }

    const studentId = body.studentId
    const levelId = Number(body.levelId)
    const amount = Number(body.amount)
    const method = body.method || 'bank_transfer'
    const status = body.status || 'pending'
    const transactionId = body.transactionId?.trim() || null
    const autoActivate = body.autoActivate === true

    if (!studentId) {
      return NextResponse.json({ error: 'Missing studentId' }, { status: 400 })
    }

    if (!Number.isInteger(levelId) || levelId <= 0) {
      return NextResponse.json({ error: 'Invalid levelId' }, { status: 400 })
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    if (!PAYMENT_METHODS.has(method)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }

    if (!PAYMENT_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const insertData = {
      student_id: studentId,
      level_id: levelId,
      amount,
      method,
      status,
      transaction_id: transactionId,
      paid_at: status === 'paid' ? new Date().toISOString() : null,
    }

    const { data: payment, error: insertError } = await adminClient
      .from('payments')
      .insert(insertData)
      .select('id, student_id, level_id, amount, status, method, transaction_id, created_at, paid_at')
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    if (status === 'paid' && autoActivate) {
      await syncEnrollmentActivation(adminClient, studentId, levelId)
    }

    return NextResponse.json({ success: true, payment })
  } catch (err) {
    console.error('admin payments POST error:', err)
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

    if (body.action !== 'updatePaymentStatus') {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
    }

    const paymentId = Number(body.paymentId)
    const nextStatus = body.status
    const autoActivate = body.autoActivate === true

    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      return NextResponse.json({ error: 'Invalid paymentId' }, { status: 400 })
    }

    if (!PAYMENT_STATUSES.has(nextStatus)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data: existing, error: readError } = await adminClient
      .from('payments')
      .select('id, student_id, level_id, paid_at')
      .eq('id', paymentId)
      .single()

    if (readError || !existing) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const updateData =
      nextStatus === 'paid'
        ? {
            status: 'paid',
            paid_at: existing.paid_at || new Date().toISOString(),
          }
        : nextStatus === 'pending'
          ? {
              status: 'pending',
              paid_at: null,
            }
          : {
              status: 'refunded',
            }

    const { error: updateError } = await adminClient
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    if (nextStatus === 'paid' && autoActivate) {
      await syncEnrollmentActivation(adminClient, existing.student_id, existing.level_id)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('admin payments PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
