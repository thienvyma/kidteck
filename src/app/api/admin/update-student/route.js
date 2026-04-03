import { createServerClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

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

function generateTemporaryPassword() {
  return `AIgenlabs@${Math.random().toString(36).slice(-6).toUpperCase()}`
}

async function purgeStudentData(adminClient, studentId) {
  const cleanupSummary = {
    progress: 0,
    enrollments: 0,
    payments: 0,
    profiles: 0,
  }

  const purgeTargets = [
    ['progress', 'student_id', 'progress'],
    ['enrollments', 'student_id', 'enrollments'],
    ['payments', 'student_id', 'payments'],
    ['profiles', 'id', 'profiles'],
  ]

  for (const [table, column, summaryKey] of purgeTargets) {
    const { error, count } = await adminClient
      .from(table)
      .delete({ count: 'exact' })
      .eq(column, studentId)

    if (error) {
      throw new Error(`Cleanup ${table} failed: ${error.message}`)
    }

    cleanupSummary[summaryKey] = count || 0
  }

  return cleanupSummary
}

export async function GET(request) {
  try {
    const auth = await verifyAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('id')

    if (!studentId) {
      return NextResponse.json({ error: 'Missing id param' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient.auth.admin.getUserById(studentId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      email: data.user?.email || '',
      lastSignInAt: data.user?.last_sign_in_at || null,
      emailConfirmedAt: data.user?.email_confirmed_at || null,
    })
  } catch (err) {
    console.error('update-student GET error:', err)
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
    const { studentId } = body
    const newPassword = body.newPassword || generateTemporaryPassword()

    if (!studentId) {
      return NextResponse.json({ error: 'Missing studentId' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient.auth.admin.updateUserById(studentId, {
      password: newPassword,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, password: newPassword })
  } catch (err) {
    console.error('update-student POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const auth = await verifyAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { studentId, fullName, phone, parentName, parentPhone } = body

    if (!studentId) {
      return NextResponse.json({ error: 'Missing studentId' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const updateData = {}
    if (fullName !== undefined) updateData.full_name = fullName
    if (phone !== undefined) updateData.phone = phone || null
    if (parentName !== undefined) updateData.parent_name = parentName || null
    if (parentPhone !== undefined) updateData.parent_phone = parentPhone || null
    updateData.updated_at = new Date().toISOString()

    const { error } = await adminClient
      .from('profiles')
      .update(updateData)
      .eq('id', studentId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('update-student PUT error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const auth = await verifyAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('id')

    if (!studentId) {
      return NextResponse.json({ error: 'Missing id param' }, { status: 400 })
    }

    if (studentId === auth.user?.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own admin account' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()
    const { data: studentProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, role, full_name')
      .eq('id', studentId)
      .maybeSingle()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    if (studentProfile.role !== 'student') {
      return NextResponse.json(
        { error: 'Only student accounts can be deleted from this endpoint' },
        { status: 400 }
      )
    }

    const deleteResult = await adminClient.auth.admin.deleteUser(studentId)
    let fallbackCleanup = false

    if (deleteResult.error) {
      const errorMessage = deleteResult.error.message || ''
      const constraintHint = /(foreign key|constraint|references|dependent)/i.test(
        errorMessage
      )

      if (!constraintHint) {
        return NextResponse.json({ error: errorMessage }, { status: 400 })
      }

      await purgeStudentData(adminClient, studentId)
      fallbackCleanup = true

      const retryDelete = await adminClient.auth.admin.deleteUser(studentId)
      const retryErrorMessage = retryDelete.error?.message || ''
      const userAlreadyMissing = /user not found/i.test(retryErrorMessage)

      if (retryDelete.error && !userAlreadyMissing) {
        return NextResponse.json({ error: retryErrorMessage }, { status: 400 })
      }
    }

    const cleanup = await purgeStudentData(adminClient, studentId)

    return NextResponse.json({
      success: true,
      studentId,
      studentName: studentProfile.full_name || null,
      cleanup,
      fallbackCleanup,
    })
  } catch (err) {
    console.error('update-student DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
