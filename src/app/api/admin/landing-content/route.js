import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getLandingContentDocument, saveLandingContent } from '@/lib/landing-content'

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

export async function GET() {
  try {
    const auth = await verifyAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { content, updatedAt } = await getLandingContentDocument()
    return NextResponse.json({ content, updatedAt })
  } catch (error) {
    console.error('landing-content GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const auth = await verifyAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const saved = await saveLandingContent(body.content || {}, {
      expectedUpdatedAt: body.expectedUpdatedAt,
    })
    revalidatePath('/')
    return NextResponse.json({
      success: true,
      content: saved.content,
      updatedAt: saved.updatedAt,
    })
  } catch (error) {
    console.error('landing-content PUT error:', error)
    const status = error?.code === 'LANDING_CONTENT_CONFLICT' ? 409 : 500
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status }
    )
  }
}
