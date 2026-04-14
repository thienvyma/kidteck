import LandingPageView from '@/components/landing/LandingPageView'
import { getLandingPageData } from '@/lib/landing-content'

export const revalidate = 60

export const metadata = {
  alternates: {
    canonical: '/',
  },
}

export default async function Home() {
  const { content, levels } = await getLandingPageData()

  return <LandingPageView content={content} levels={levels} />
}
