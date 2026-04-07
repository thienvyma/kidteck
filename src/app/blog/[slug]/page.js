import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import ReactMarkdown from 'react-markdown'
import Navbar from '@/components/ui/Navbar'
import { getLandingPageData } from '@/lib/landing-content'
import styles from '../blog.module.css'

export const revalidate = 60

async function getBlog(slug) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data || !data.is_published) {
    return null
  }

  return data
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const blog = await getBlog(slug)
  
  if (!blog) {
    return { title: 'Không tìm thấy bài viết | AIgenlabs' }
  }
  
  return {
    title: `${blog.title} | AIgenlabs`,
    description: blog.description || 'Góc nhìn công nghệ trên AIgenlabs.',
    openGraph: {
      title: blog.title,
      description: blog.description,
      images: blog.cover_image_url ? [{ url: blog.cover_image_url }] : [],
      type: 'article',
      publishedTime: blog.published_at,
    }
  }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  const [blog, landingData] = await Promise.all([
    getBlog(slug),
    getLandingPageData()
  ])

  if (!blog) {
    notFound()
  }

  const publishedDate = new Date(blog.published_at).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // SEO JSON-LD cho bài viết (Article Schema)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.description,
    image: blog.cover_image_url,
    datePublished: blog.published_at,
    dateModified: blog.updated_at || blog.published_at,
    publisher: {
      '@type': 'Organization',
      name: 'AIgenlabs',
      logo: {
        '@type': 'ImageObject',
        url: 'https://aigenlabs.vn/icon.svg'
      }
    }
  }

  return (
    <>
      <Navbar header={landingData.content.header} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className={styles.articleContainer}>
        <Link href="/blog" className={styles.backLink}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại danh sách
        </Link>
        
        <header className={styles.articleHeader}>
          <h1 className={styles.articleTitle}>{blog.title}</h1>
          <div className={styles.articleMeta}>
            AIgenlabs Academy • {publishedDate}
          </div>
        </header>

        {blog.cover_image_url && (
          <img 
            src={blog.cover_image_url} 
            alt={blog.title} 
            className={styles.articleCover} 
          />
        )}

        <article className={styles.articleProse}>
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </article>
      </main>
    </>
  )
}
