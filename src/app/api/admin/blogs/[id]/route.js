import { NextResponse } from 'next/server'
import { createServiceRoleClient, requireRole } from '@/lib/server-auth'

export async function GET(_request, { params }) {
  try {
    const auth = await requireRole('admin')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Missing blog id' }, { status: 400 })
    }

    const adminClient = createServiceRoleClient()
    const { data, error } = await adminClient.from('blogs').select('*').eq('id', id).single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ blog: data })
  } catch (error) {
    console.error('admin blog GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requireRole('admin')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Missing blog id' }, { status: 400 })
    }

    const body = await request.json()
    const payload = {
      title: body.title,
      slug: body.slug,
      description: body.description || null,
      cover_image_url: body.cover_image_url || null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      content: body.content || '',
      is_published: body.is_published === true,
      published_at: body.is_published ? body.published_at || new Date().toISOString() : null,
    }

    const adminClient = createServiceRoleClient()
    const { error } = await adminClient.from('blogs').update(payload).eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('admin blog PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request, { params }) {
  try {
    const auth = await requireRole('admin')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Missing blog id' }, { status: 400 })
    }

    const adminClient = createServiceRoleClient()
    const { error } = await adminClient.from('blogs').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('admin blog DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
