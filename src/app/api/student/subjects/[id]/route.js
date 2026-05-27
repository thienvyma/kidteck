import { NextResponse } from 'next/server'
import { createServiceRoleClient, requireRole } from '@/lib/server-auth'
import { decryptSubjectContent } from '@/lib/subject-content-crypto'

const ALLOWED_ENROLLMENT_STATUSES = ['active', 'completed']

function createAdminClient() {
  return createServiceRoleClient()
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params
    const subjectId = Number(id)

    if (!Number.isInteger(subjectId) || subjectId <= 0) {
      return NextResponse.json({ error: 'Invalid subject id' }, { status: 400 })
    }

    const auth = await requireRole('student')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { supabase, user } = auth

    const adminClient = createAdminClient()
    const { data: subject, error: subjectError } = await adminClient
      .from('subjects')
      .select('id, level_id, name, description, levels(id, name)')
      .eq('id', subjectId)
      .single()

    if (subjectError || !subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('student_id', user.id)
      .eq('level_id', subject.level_id)
      .in('status', ALLOWED_ENROLLMENT_STATUSES)
      .maybeSingle()

    if (enrollmentError) {
      return NextResponse.json({ error: enrollmentError.message }, { status: 400 })
    }

    if (!enrollment) {
      return NextResponse.json(
        {
          error: 'Course is not activated for this student',
          levelName: subject.levels?.name || '',
        },
        { status: 403 }
      )
    }

    const { data: contentRow, error: contentError } = await adminClient
      .from('subjects')
      .select('content')
      .eq('id', subjectId)
      .single()

    if (contentError || !contentRow) {
      return NextResponse.json({ error: 'Subject content not found' }, { status: 404 })
    }

    const [{ data: siblings, error: siblingsError }, { data: progressRows, error: progressError }] =
      await Promise.all([
        adminClient
          .from('subjects')
          .select('id, name, sort_order')
          .eq('level_id', subject.level_id)
          .order('sort_order', { ascending: true }),
        supabase
          .from('progress')
          .select('subject_id, completed, subjects!inner(level_id)')
          .eq('student_id', user.id)
          .eq('subjects.level_id', subject.level_id),
      ])

    const firstError = siblingsError || progressError
    if (firstError) {
      return NextResponse.json({ error: firstError.message }, { status: 400 })
    }

    const progressMap = {}
    for (const row of progressRows || []) {
      progressMap[row.subject_id] = row.completed
    }

    return NextResponse.json({
      subject: {
        ...subject,
        content: decryptSubjectContent(contentRow.content),
      },
      siblings: siblings || [],
      progressMap,
      studentId: user.id,
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
