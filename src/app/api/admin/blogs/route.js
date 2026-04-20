import { NextResponse } from 'next/server'
import { createServiceRoleClient, requireRole } from '@/lib/server-auth'

export async function GET() {
  try {
    const auth = await requireRole('admin')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const adminClient = createServiceRoleClient()
    const { data, error } = await adminClient
      .from('blogs')
      .select('id, title, slug, is_published, published_at, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ blogs: data || [] })
  } catch (error) {
    console.error('admin blogs GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const auth = await requireRole('admin')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const adminClient = createServiceRoleClient()
    const payload = {
      title: body.title,
      slug: body.slug,
      description: body.description || null,
      cover_image_url: body.cover_image_url || null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      content: body.content || '',
      is_published: body.is_published === true,
      author_id: auth.user.id,
      published_at: body.is_published ? body.published_at || new Date().toISOString() : null,
    }

    const { data, error } = await adminClient
      .from('blogs')
      .insert([payload])
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ blog: data })
  } catch (error) {
    console.error('admin blogs POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
