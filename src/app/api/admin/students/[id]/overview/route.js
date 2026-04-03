import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase-server'

const MANAGED_ENROLLMENT_STATUSES = new Set(['active', 'paused', 'completed'])

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

function sortByOrder(items = []) {
  return [...items].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
}

export async function GET(_request, { params }) {
  try {
    const auth = await verifyAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Missing student id' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, full_name, phone, parent_name, parent_phone, role, created_at')
      .eq('id', id)
      .maybeSingle()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    if (!profile) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const [
      { data: levels, error: levelsError },
      { data: enrollments, error: enrollmentsError },
      { data: progressRows, error: progressError },
      { data: payments, error: paymentsError },
      { data: authUserData, error: authUserError },
    ] = await Promise.all([
      adminClient
        .from('levels')
        .select(`
          id,
          name,
          description,
          price,
          duration_weeks,
          subject_count,
          sort_order,
          is_active,
          subjects (
            id,
            name,
            sort_order
          )
        `)
        .order('sort_order', { ascending: true }),
      adminClient
        .from('enrollments')
        .select('id, level_id, status, enrolled_at, completed_at')
        .eq('student_id', id),
      adminClient
        .from('progress')
        .select(`
          subject_id,
          completed,
          completed_at,
          subjects (
            id,
            name,
            level_id,
            sort_order
          )
        `)
        .eq('student_id', id),
      adminClient
        .from('payments')
        .select('id, level_id, amount, status, method, transaction_id, created_at, paid_at')
        .eq('student_id', id),
      adminClient.auth.admin.getUserById(id),
    ])

    const firstError =
      levelsError || enrollmentsError || progressError || paymentsError || authUserError

    if (firstError) {
      return NextResponse.json({ error: firstError.message }, { status: 400 })
    }

    const enrollmentByLevel = new Map(
      (enrollments || []).map((row) => [row.level_id, row])
    )
    const levelNameById = new Map((levels || []).map((level) => [level.id, level.name]))

    const completedSubjectIds = new Set()
    const recentCompletions = []

    for (const row of progressRows || []) {
      if (!row.completed || !row.subjects?.id) {
        continue
      }

      completedSubjectIds.add(row.subjects.id)
      recentCompletions.push({
        id: `${row.subjects.id}-${row.completed_at || 'recent'}`,
        levelName: levelNameById.get(row.subjects.level_id) || '—',
        subjectName: row.subjects.name || '—',
        completedAt: row.completed_at || null,
      })
    }

    recentCompletions.sort(
      (a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0)
    )

    const latestPaymentByLevel = new Map()
    for (const payment of payments || []) {
      const current = latestPaymentByLevel.get(payment.level_id)
      if (
        !current ||
        new Date(payment.created_at || 0) > new Date(current.created_at || 0)
      ) {
        latestPaymentByLevel.set(payment.level_id, payment)
      }
    }

    const packages = (levels || []).map((level) => {
      const subjects = sortByOrder(level.subjects || [])
      const enrollment = enrollmentByLevel.get(level.id) || null
      const completedLessons = subjects.filter((subject) =>
        completedSubjectIds.has(subject.id)
      ).length
      const totalLessons = subjects.length
      const percentage =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
      const nextSubject =
        subjects.find((subject) => !completedSubjectIds.has(subject.id)) || null
      const latestPayment = latestPaymentByLevel.get(level.id) || null

      return {
        id: level.id,
        name: level.name,
        description: level.description || '',
        price: level.price || 0,
        durationWeeks: level.duration_weeks || null,
        subjectCount: level.subject_count || totalLessons,
        totalLessons,
        completedLessons,
        percentage,
        isPublished: level.is_active !== false,
        enrollment: enrollment
          ? {
              id: enrollment.id,
              status: enrollment.status,
              enrolledAt: enrollment.enrolled_at,
              completedAt: enrollment.completed_at,
            }
          : null,
        nextSubject: nextSubject
          ? {
              id: nextSubject.id,
              name: nextSubject.name,
            }
          : null,
        payment: latestPayment
          ? {
              id: latestPayment.id,
              status: latestPayment.status,
              amount: latestPayment.amount,
              method: latestPayment.method,
              transactionId: latestPayment.transaction_id,
              paidAt: latestPayment.paid_at,
              createdAt: latestPayment.created_at,
            }
          : null,
      }
    })

    const account = {
      email: authUserData?.user?.email || '',
      lastSignInAt: authUserData?.user?.last_sign_in_at || null,
      emailConfirmedAt: authUserData?.user?.email_confirmed_at || null,
    }

    return NextResponse.json({
      profile,
      account,
      packages,
      recentCompletions: recentCompletions.slice(0, 12),
      hasPaymentRecords: (payments || []).length > 0,
    })
  } catch (err) {
    console.error('student overview GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await verifyAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Missing student id' }, { status: 400 })
    }

    const body = await request.json()
    const levelId = Number(body.levelId)
    const nextStatus = body.status

    if (body.action !== 'setEnrollmentStatus') {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
    }

    if (!Number.isInteger(levelId) || levelId <= 0) {
      return NextResponse.json({ error: 'Invalid level id' }, { status: 400 })
    }

    if (!MANAGED_ENROLLMENT_STATUSES.has(nextStatus)) {
      return NextResponse.json({ error: 'Invalid enrollment status' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data: existing, error: readError } = await adminClient
      .from('enrollments')
      .select('id')
      .eq('student_id', id)
      .eq('level_id', levelId)
      .maybeSingle()

    if (readError) {
      return NextResponse.json({ error: readError.message }, { status: 400 })
    }

    if (!existing) {
      if (nextStatus !== 'active') {
        return NextResponse.json(
          { error: 'Hãy kích hoạt khóa học trước khi đổi trạng thái khác' },
          { status: 400 }
        )
      }

      const { error: insertError } = await adminClient.from('enrollments').insert({
        student_id: id,
        level_id: levelId,
        status: 'active',
      })

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 400 })
      }

      return NextResponse.json({ success: true })
    }

    const updateData = {
      status: nextStatus,
      completed_at: nextStatus === 'completed' ? new Date().toISOString() : null,
    }

    const { error: updateError } = await adminClient
      .from('enrollments')
      .update(updateData)
      .eq('id', existing.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('student overview PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
