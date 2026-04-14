import LandingPreviewClient from '@/components/landing/LandingPreviewClient'
import { getLandingPageData } from '@/lib/landing-content'

export const dynamic = 'force-dynamic'

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function LandingPreviewPage() {
  const { content, levels } = await getLandingPageData()

  return <LandingPreviewClient initialContent={content} levels={levels} />
}
