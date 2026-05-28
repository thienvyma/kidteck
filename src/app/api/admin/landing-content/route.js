import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/server-auth'
import { getLandingContentDocument, saveLandingContent } from '@/lib/landing-content'

async function verifyAdmin() {
  return requireRole('admin')
}

function getAdminVersionAuthor(auth) {
  return auth?.profile?.full_name || auth?.user?.email || 'Admin'
}

export async function GET() {
  try {
    const auth = await verifyAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { content, updatedAt, versions } = await getLandingContentDocument({
      fallbackOnError: false,
    })
    return NextResponse.json({ content, updatedAt, versions })
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
    if (!body?.content || typeof body.content !== 'object' || Array.isArray(body.content)) {
      return NextResponse.json({ error: 'Missing landing content' }, { status: 400 })
    }

    const saved = await saveLandingContent(body.content, {
      expectedUpdatedAt: body.expectedUpdatedAt,
      savedBy: getAdminVersionAuthor(auth),
    })
    revalidatePath('/')
    revalidatePath('/blog')
    return NextResponse.json({
      success: true,
      content: saved.content,
      updatedAt: saved.updatedAt,
      versions: saved.versions,
    })
  } catch (error) {
    console.error('landing-content PUT error:', error)
    const status = ['LANDING_CONTENT_CONFLICT', 'LANDING_CONTENT_VERSION_REQUIRED'].includes(
      error?.code
    )
      ? 409
      : 500
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status }
    )
  }
}
