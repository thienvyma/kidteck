import { createServerClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import {
  decryptSubjectContent,
  encryptSubjectContent,
} from '@/lib/subject-content-crypto'

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

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function getUniqueSlug(adminClient, name) {
  const baseSlug = slugify(name) || `goi-hoc-${Date.now()}`

  const { data: existing } = await adminClient
    .from('levels')
    .select('id')
    .eq('slug', baseSlug)
    .maybeSingle()

  if (!existing) {
    return baseSlug
  }

  return `${baseSlug}-${Date.now()}`
}

async function syncSubjectCount(adminClient, levelId) {
  const { count, error: countError } = await adminClient
    .from('subjects')
    .select('*', { count: 'exact', head: true })
    .eq('level_id', levelId)

  if (countError) {
    throw countError
  }

  const { error: updateError } = await adminClient
    .from('levels')
    .update({ subject_count: count || 0 })
    .eq('id', levelId)

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
    const subjectId = Number(searchParams.get('subjectId'))

    if (!Number.isInteger(subjectId) || subjectId <= 0) {
      return NextResponse.json({ error: 'Missing or invalid subjectId' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('subjects')
      .select('id, level_id, name, description, content, sort_order, levels(name)')
      .eq('id', subjectId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      ...data,
      content: decryptSubjectContent(data.content),
    })
  } catch (error) {
    console.error('curriculum GET error:', error)
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
    const adminClient = createAdminClient()

    if (body.action === 'createLevel') {
      if (!body.name?.trim()) {
        return NextResponse.json({ error: 'Tên gói học là bắt buộc' }, { status: 400 })
      }

      const price = Number(body.price)
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json({ error: 'Giá gói học phải lớn hơn 0' }, { status: 400 })
      }

      const { data: lastLevel } = await adminClient
        .from('levels')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle()

      const slug = await getUniqueSlug(adminClient, body.name)

      const { data, error } = await adminClient
        .from('levels')
        .insert({
          name: body.name.trim(),
          slug,
          description: body.description?.trim() || null,
          price,
          duration_weeks: Number(body.durationWeeks) || null,
          sort_order: (lastLevel?.sort_order || 0) + 1,
          subject_count: 0,
          is_active: body.isActive !== false,
        })
        .select('*')
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, level: data })
    }

    if (body.action === 'createSubject') {
      if (!body.levelId || !body.name?.trim()) {
        return NextResponse.json(
          { error: 'Thiếu gói học hoặc tên môn học' },
          { status: 400 }
        )
      }

      const levelId = Number(body.levelId)
      const { data: lastSubject } = await adminClient
        .from('subjects')
        .select('sort_order')
        .eq('level_id', levelId)
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle()

      const { data, error } = await adminClient
        .from('subjects')
        .insert({
          level_id: levelId,
          name: body.name.trim(),
          description: body.description?.trim() || null,
          content: encryptSubjectContent({}),
          sort_order: (lastSubject?.sort_order || 0) + 1,
        })
        .select('*')
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      await syncSubjectCount(adminClient, levelId)

      return NextResponse.json({ success: true, subject: data })
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  } catch (error) {
    console.error('curriculum POST error:', error)
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
    const adminClient = createAdminClient()

    if (body.action === 'updateLevel') {
      if (!body.levelId || !body.name?.trim()) {
        return NextResponse.json({ error: 'Thiếu dữ liệu gói học' }, { status: 400 })
      }

      const price = Number(body.price)
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json({ error: 'Giá gói học phải lớn hơn 0' }, { status: 400 })
      }

      const { error } = await adminClient
        .from('levels')
        .update({
          name: body.name.trim(),
          description: body.description?.trim() || null,
          price,
          duration_weeks: Number(body.durationWeeks) || null,
          is_active: body.isActive !== false,
        })
        .eq('id', Number(body.levelId))

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true })
    }

    if (body.action === 'updateSubject') {
      if (!body.subjectId || !body.name?.trim()) {
        return NextResponse.json({ error: 'Thiếu dữ liệu môn học' }, { status: 400 })
      }

      const { error } = await adminClient
        .from('subjects')
        .update({
          name: body.name.trim(),
          description: body.description?.trim() || null,
          content: encryptSubjectContent(body.content || {}),
        })
        .eq('id', Number(body.subjectId))

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  } catch (error) {
    console.error('curriculum PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const auth = await verifyAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const adminClient = createAdminClient()

    if (body.action === 'deleteLevel') {
      const levelId = Number(body.levelId)

      if (!Number.isInteger(levelId) || levelId <= 0) {
        return NextResponse.json({ error: 'Thiếu levelId để xóa gói học' }, { status: 400 })
      }

      const { data: level, error: levelReadError } = await adminClient
        .from('levels')
        .select('id, name')
        .eq('id', levelId)
        .single()

      if (levelReadError || !level) {
        return NextResponse.json({ error: 'Không tìm thấy gói học' }, { status: 404 })
      }

      const [{ count: enrollmentCount, error: enrollmentError }, { count: paymentCount, error: paymentError }] =
        await Promise.all([
          adminClient
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('level_id', levelId),
          adminClient
            .from('payments')
            .select('*', { count: 'exact', head: true })
            .eq('level_id', levelId),
        ])

      if (enrollmentError || paymentError) {
        throw enrollmentError || paymentError
      }

      if ((enrollmentCount || 0) > 0 || (paymentCount || 0) > 0) {
        return NextResponse.json(
          {
            error:
              'Gói học này đã liên kết với học sinh hoặc giao dịch. Hãy chuyển sang "Tạm ẩn" thay vì xóa hẳn.',
          },
          { status: 409 }
        )
      }

      const { error: deleteLevelError } = await adminClient
        .from('levels')
        .delete()
        .eq('id', levelId)

      if (deleteLevelError) {
        return NextResponse.json({ error: deleteLevelError.message }, { status: 400 })
      }

      return NextResponse.json({ success: true })
    }

    if (body.action !== 'deleteSubject' || !body.subjectId) {
      return NextResponse.json({ error: 'Thiếu subjectId để xóa môn học' }, { status: 400 })
    }

    const subjectId = Number(body.subjectId)
    const { data: subject, error: readError } = await adminClient
      .from('subjects')
      .select('id, level_id')
      .eq('id', subjectId)
      .single()

    if (readError || !subject) {
      return NextResponse.json({ error: 'Không tìm thấy môn học' }, { status: 404 })
    }

    const { error } = await adminClient
      .from('subjects')
      .delete()
      .eq('id', subjectId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    await syncSubjectCount(adminClient, subject.level_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('curriculum DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
