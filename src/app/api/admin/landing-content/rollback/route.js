import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/server-auth'
import { rollbackLandingContentVersion } from '@/lib/landing-content'

function getAdminVersionAuthor(auth) {
  return auth?.profile?.full_name || auth?.user?.email || 'Admin'
}

export async function POST(request) {
  try {
    const auth = await requireRole('admin')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const versionId = typeof body?.versionId === 'string' ? body.versionId.trim() : ''

    if (!versionId) {
      return NextResponse.json({ error: 'Missing landing content version' }, { status: 400 })
    }

    const saved = await rollbackLandingContentVersion(versionId, {
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
    console.error('landing-content rollback error:', error)
    const status = ['LANDING_CONTENT_CONFLICT', 'LANDING_CONTENT_VERSION_REQUIRED'].includes(
      error?.code
    )
      ? 409
      : error?.code === 'LANDING_CONTENT_VERSION_NOT_FOUND'
      ? 404
      : 500

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status }
    )
  }
}
