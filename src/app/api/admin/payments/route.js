import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase-server'

const PAYMENT_METHODS = new Set(['bank_transfer', 'momo', 'cash', 'other'])
const PAYMENT_STATUSES = new Set(['pending', 'paid', 'refunded'])

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

export async function GET(request) {
  try {
    const auth = await verifyAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')
    const studentId = searchParams.get('studentId')

    const adminClient = createAdminClient()
    let paymentsQuery = adminClient
      .from('payments')
      .select(`
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
      `)
      .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
      paymentsQuery = paymentsQuery.eq('status', statusFilter)
    }

    if (studentId) {
      paymentsQuery = paymentsQuery.eq('student_id', studentId)
    }

    const { data: payments, error: paymentsError } = await paymentsQuery

    if (paymentsError) {
      return NextResponse.json({ error: paymentsError.message }, { status: 400 })
    }

    const { data: enrollments, error: enrollmentsError } = await adminClient
      .from('enrollments')
      .select('student_id, level_id, status')

    if (enrollmentsError) {
      return NextResponse.json({ error: enrollmentsError.message }, { status: 400 })
    }

    const enrollmentByKey = new Map(
      (enrollments || []).map((row) => [`${row.student_id}:${row.level_id}`, row.status])
    )

    const rows = (payments || []).map((payment) => ({
      id: payment.id,
      studentId: payment.student_id,
      student: payment.profiles?.full_name || '—',
      levelId: payment.level_id,
      level: payment.levels?.name || '—',
      amount: payment.amount || 0,
      method: payment.method || 'other',
      status: payment.status,
      transactionId: payment.transaction_id || '',
      createdAt: payment.created_at,
      paidAt: payment.paid_at,
      enrollmentStatus:
        enrollmentByKey.get(`${payment.student_id}:${payment.level_id}`) || 'inactive',
    }))

    const totalPaid = rows
      .filter((row) => row.status === 'paid')
      .reduce((sum, row) => sum + row.amount, 0)
    const totalPending = rows
      .filter((row) => row.status === 'pending')
      .reduce((sum, row) => sum + row.amount, 0)

    return NextResponse.json({
      payments: rows,
      summary: {
        totalPaid,
        totalPending,
        count: rows.length,
      },
    })
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
