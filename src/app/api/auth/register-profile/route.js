import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { createServiceRoleClient } from '@/lib/server-auth'

export async function POST(request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const fullName = body.fullName || user.user_metadata?.full_name || ''

    if (!fullName.trim()) {
      return NextResponse.json({ error: 'Missing full name' }, { status: 400 })
    }

    const adminClient = createServiceRoleClient()
    const { error } = await adminClient.from('profiles').upsert(
      {
        id: user.id,
        full_name: fullName.trim(),
        role: 'student',
        phone: body.phone || user.user_metadata?.phone || null,
        parent_name: body.parentName || user.user_metadata?.parent_name || null,
      },
      {
        onConflict: 'id',
      }
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('register-profile POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
