import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import Navbar from '@/components/ui/Navbar'
import { getLandingPageData } from '@/lib/landing-content'
import styles from './blog.module.css'

export const revalidate = 60 // ISR caching auto-revalidate 

export const metadata = {
  title: 'Blog & Tin Tức | AIgenlabs',
  description: 'Cập nhật tin tức mới nhất về học lập trình AI, dự án công nghệ và tư duy điều phối cho học sinh.',
}

async function getBlogs() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  const { data, error } = await supabase
    .from('blogs')
    .select('id, slug, title, description, cover_image_url, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching blogs:', error)
    return []
  }
  return data || []
}

export default async function BlogArchivePage() {
  const [blogs, landingData] = await Promise.all([
    getBlogs(),
    getLandingPageData()
  ])

  return (
    <>
      <Navbar header={landingData.content.header} />
      
      <main className={styles.blogContainer}>
        <h1 className={styles.pageTitle}>Góc nhìn công nghệ</h1>
        <p className={styles.pageDescription}>
          Nơi đội ngũ đào tạo AIgenlabs và các học viên chia sẻ hành trình thực chiến, 
          những giải pháp công nghệ và góc nhìn phát triển trong kỷ nguyên trí tuệ nhân tạo.
        </p>

        {blogs.length === 0 ? (
          <div className={styles.emptyState}>
            Đang cập nhật những bài viết đầu tiên. Vui lòng quay lại sau!
          </div>
        ) : (
          <div className={styles.blogGrid}>
            {blogs.map((blog) => (
              <Link href={`/blog/${blog.slug}`} key={blog.id} className={styles.blogCard}>
                {blog.cover_image_url ? (
                  <img 
                    src={blog.cover_image_url} 
                    alt={blog.title} 
                    className={styles.cardImage} 
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.cardImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-gray-100)', color: 'var(--color-gray-400)' }}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '48px', height: '48px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                    </svg>
                  </div>
                )}
                <div className={styles.cardContent}>
                  <div className={styles.cardMeta}>
                    {new Date(blog.published_at).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <h2 className={styles.cardTitle}>{blog.title}</h2>
                  <p className={styles.cardDescription}>{blog.description}</p>
                  <div className={styles.cardFooter}>
                    Đọc tiếp
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
