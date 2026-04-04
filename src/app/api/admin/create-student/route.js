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

/**
 * POST /api/admin/create-student
 * Server-side student creation using Supabase Admin API.
 * - Verifies caller is admin
 * - Creates user with admin.createUser() (no session change)
 * - Updates profile + auto-enrolls
 */
export async function POST(request) {
  try {
    // 1. Verify admin session
    const auth = await verifyAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // 2. Parse request body
    const body = await request.json()
    const { fullName, email, phone, password, parentName, parentPhone, levelId } = body

    // 3. Validate
    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu phải ≥ 6 ký tự' }, { status: 400 })
    }

    // 4. Create Supabase Admin client (service_role key — server only)
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // 5. Create user — no session change for the caller!
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

    // 6. Update profile with extra fields
    await adminClient
      .from('profiles')
      .update({
        phone: phone || null,
        parent_name: parentName || null,
        parent_phone: parentPhone || null,
      })
      .eq('id', userId)

    // 7. Auto-enroll if level selected
    if (levelId) {
      await adminClient
        .from('enrollments')
        .insert({
          student_id: userId,
          level_id: parseInt(levelId),
          status: 'active',
        })
    }

    return NextResponse.json({ success: true, userId })
  } catch (err) {
    console.error('create-student error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
