import { NextResponse } from 'next/server'
import { createServiceRoleClient, requireRole } from '@/lib/server-auth'

/**
 * POST /api/admin/create-student
 * Server-side student creation using Supabase Admin API.
 * - Verifies caller is admin
 * - Creates user with admin.createUser() (no session change)
 * - Ensures a profile row exists with role=student
 * - Auto-enrolls when a level is selected
 */
export async function POST(request) {
  try {
    const auth = await requireRole('admin')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { fullName, email, phone, password, parentName, parentPhone, levelId } = body

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Mat khau phai >= 6 ky tu' }, { status: 400 })
    }

    const adminClient = createServiceRoleClient()

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: phone || null,
      },
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    const userId = newUser?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'User created but no ID returned' }, { status: 500 })
    }

    const { error: profileError } = await adminClient.from('profiles').upsert(
      {
        id: userId,
        full_name: fullName,
        role: 'student',
        phone: phone || null,
        parent_name: parentName || null,
        parent_phone: parentPhone || null,
      },
      {
        onConflict: 'id',
      }
    )

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    if (levelId) {
      const { error: enrollmentError } = await adminClient.from('enrollments').insert({
        student_id: userId,
        level_id: parseInt(levelId, 10),
        status: 'active',
      })

      if (enrollmentError) {
        return NextResponse.json({ error: enrollmentError.message }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true, userId })
  } catch (err) {
    console.error('create-student error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
