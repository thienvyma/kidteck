import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServiceRoleClient, requireRole } from '@/lib/server-auth'
import { normalizeBlogContentForStorage } from '@/lib/blog-content'
import { normalizeImageUrl } from '@/lib/blog-media'

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
    const coverImageUrl = normalizeImageUrl(body.cover_image_url)
    const coverImageMobileUrl = normalizeImageUrl(body.cover_image_mobile_url)
    if (body.cover_image_url && !coverImageUrl) {
      return NextResponse.json({ error: 'Invalid cover image URL' }, { status: 400 })
    }
    if (body.cover_image_mobile_url && !coverImageMobileUrl) {
      return NextResponse.json({ error: 'Invalid mobile cover image URL' }, { status: 400 })
    }

    const content = await normalizeBlogContentForStorage(body.content || '')
    const payload = {
      title: body.title,
      slug: body.slug,
      description: body.description || null,
      cover_image_url: coverImageUrl || null,
      cover_image_mobile_url: coverImageMobileUrl || null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      content,
      is_published: body.is_published === true,
      published_at: body.is_published ? body.published_at || new Date().toISOString() : null,
    }

    const adminClient = createServiceRoleClient()
    const { data: currentBlog } = await adminClient
      .from('blogs')
      .select('slug')
      .eq('id', id)
      .maybeSingle()

    const { error } = await adminClient.from('blogs').update(payload).eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    revalidatePath('/blog')
    if (currentBlog?.slug) {
      revalidatePath(`/blog/${currentBlog.slug}`)
    }
    if (payload.slug && payload.slug !== currentBlog?.slug) {
      revalidatePath(`/blog/${payload.slug}`)
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
    const { data: currentBlog } = await adminClient
      .from('blogs')
      .select('slug')
      .eq('id', id)
      .maybeSingle()

    const { error } = await adminClient.from('blogs').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    revalidatePath('/blog')
    if (currentBlog?.slug) {
      revalidatePath(`/blog/${currentBlog.slug}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('admin blog DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
