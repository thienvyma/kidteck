import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase-server'
import { decryptSubjectContent } from '@/lib/subject-content-crypto'

const ALLOWED_ENROLLMENT_STATUSES = ['active', 'completed']

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params
    const subjectId = Number(id)

    if (!Number.isInteger(subjectId) || subjectId <= 0) {
      return NextResponse.json({ error: 'Invalid subject id' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminClient = createAdminClient()
    const { data: subject, error: subjectError } = await adminClient
      .from('subjects')
      .select('id, level_id, name, description, content, levels(id, name)')
      .eq('id', subjectId)
      .single()

    if (subjectError || !subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('student_id', user.id)
      .eq('level_id', subject.level_id)
      .in('status', ALLOWED_ENROLLMENT_STATUSES)
      .maybeSingle()

    if (!enrollment) {
      return NextResponse.json(
        {
          error: 'Course is not activated for this student',
          levelName: subject.levels?.name || '',
        },
        { status: 403 }
      )
    }

    const { data: siblings, error: siblingsError } = await adminClient
      .from('subjects')
      .select('id, name, sort_order')
      .eq('level_id', subject.level_id)
      .order('sort_order', { ascending: true })

    if (siblingsError) {
      return NextResponse.json({ error: siblingsError.message }, { status: 400 })
    }

    return NextResponse.json({
      subject: {
        ...subject,
        content: decryptSubjectContent(subject.content),
      },
      siblings: siblings || [],
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
      },
    })
  } catch (err) {
    console.error('student subject GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
