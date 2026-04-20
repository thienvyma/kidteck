import { NextResponse } from 'next/server'
import { createServiceRoleClient, requireRole } from '@/lib/server-auth'

export async function GET() {
  try {
    const auth = await requireRole('student')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const adminClient = createServiceRoleClient()

    const [profileResult, enrollmentResult] = await Promise.all([
      adminClient
        .from('profiles')
        .select(
          'id, full_name, phone, parent_name, parent_phone, avatar_url, website_url'
        )
        .eq('id', auth.user.id)
        .maybeSingle(),
      adminClient
        .from('enrollments')
        .select('id, status, enrolled_at, levels(name)')
        .eq('student_id', auth.user.id)
        .order('enrolled_at', { ascending: false }),
    ])

    if (profileResult.error || enrollmentResult.error) {
      return NextResponse.json(
        {
          error: profileResult.error?.message || enrollmentResult.error?.message,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      profile: {
        ...(profileResult.data || {}),
        email: auth.user.email || '',
      },
      enrollments: enrollmentResult.data || [],
    })
  } catch (error) {
    console.error('student profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const auth = await requireRole('student')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const adminClient = createServiceRoleClient()

    const { error } = await adminClient
      .from('profiles')
      .update({
        avatar_url: body.avatarUrl || null,
        website_url: body.websiteUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', auth.user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('student profile PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
