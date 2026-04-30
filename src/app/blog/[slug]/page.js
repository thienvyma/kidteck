import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import Navbar from '@/components/ui/Navbar'
import { getLandingHeaderData } from '@/lib/landing-content'
import { createPublicSupabaseClient } from '@/lib/public-supabase'
import { sanitizeHTML } from '@/lib/sanitize'
import { normalizeImageUrl } from '@/lib/blog-media'
import styles from '../blog.module.css'
import landingStyles from '../../page.module.css'

export const revalidate = 60

async function getBlog(slug) {
  const supabase = createPublicSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data || !data.is_published) {
    return null
  }

  return data
}

async function getRecentBlogs(excludeSlug) {
  const supabase = createPublicSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('blogs')
    .select('id, slug, title, published_at')
    .eq('is_published', true)
    .neq('slug', excludeSlug)
    .order('published_at', { ascending: false })
    .limit(3)

  if (error) return []
  return data || []
}

async function getAllTags() {
  const supabase = createPublicSupabaseClient()
  if (!supabase) return []

  const { data } = await supabase.from('blogs').select('tags').eq('is_published', true)
  if (!data) return []

  const tagSet = new Set()
  data.forEach((blog) => {
    if (blog.tags && Array.isArray(blog.tags)) {
      blog.tags.forEach((tag) => tagSet.add(tag))
    }
  })
  return Array.from(tagSet).sort()
}

function normalizeArticleContent(value) {
  if (typeof value !== 'string') return ''

  return value
    .replace(/&nbsp;|&#160;|\u00a0/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
}

function enhanceArticleHtml(html) {
  return html
    .replace(/<p>(?:\s|<br\s*\/?>)*<\/p>/gi, '')
    .replace(/<p>\s*[-•]\s*([^<]+?)\s*<\/p>/gi, '<ul><li>$1</li></ul>')
    .replace(/<\/ul>\s*<ul>/gi, '')
}

export async function generateStaticParams() {
  const supabase = createPublicSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('blogs')
    .select('slug')
    .eq('is_published', true)

  if (error) {
    console.warn('blog generateStaticParams error:', error.message)
    return []
  }

  return (data || [])
    .filter((blog) => typeof blog.slug === 'string' && blog.slug.trim())
    .map((blog) => ({ slug: blog.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const blog = await getBlog(slug)

  if (!blog) {
    return { title: 'Không tìm thấy bài viết | AIgenlabs' }
  }

  const coverImageUrl = normalizeImageUrl(blog.cover_image_url)

  return {
    title: `${blog.title} | AIgenlabs`,
    description: blog.description || 'Góc nhìn công nghệ trên AIgenlabs.',
    openGraph: {
      title: blog.title,
      description: blog.description,
      images: coverImageUrl ? [{ url: coverImageUrl }] : [],
      type: 'article',
      publishedTime: blog.published_at,
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  const [blog, landingHeaderData, recentBlogs, allTags] = await Promise.all([
    getBlog(slug),
    getLandingHeaderData(),
    getRecentBlogs(slug),
    getAllTags(),
  ])

  if (!blog) {
    notFound()
  }

  const content = normalizeArticleContent(blog.content)
  const coverImageUrl = normalizeImageUrl(blog.cover_image_url)
  const publishedDate = new Date(blog.published_at).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.description,
    image: coverImageUrl || undefined,
    datePublished: blog.published_at,
    dateModified: blog.updated_at || blog.published_at,
    publisher: {
      '@type': 'Organization',
      name: 'AIgenlabs',
      logo: {
        '@type': 'ImageObject',
        url: 'https://aigenlabs.vn/AIGen_blacklogo.png',
      },
    },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: 'https://aigenlabs.vn/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Góc nhìn công nghệ',
        item: 'https://aigenlabs.vn/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: blog.title,
        item: `https://aigenlabs.vn/blog/${slug}`,
      },
    ],
  }

  const articleHtml = /<[a-z][\s\S]*>/i.test(content)
    ? enhanceArticleHtml(sanitizeHTML(content)).replace(/<img(?!.*?referrerpolicy)[^>]*>/gi, (match) =>
        match.replace('<img', '<img referrerpolicy="no-referrer" loading="lazy" decoding="async"')
      )
    : null

  return (
    <>
      <Navbar
        header={landingHeaderData.header}
        sectionVisibility={landingHeaderData.sectionVisibility}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbLd]) }}
      />

      <div className={styles.singleBlogWrapper}>
        <div className={`container ${landingStyles.sectionShell} ${landingStyles.sectionShellBright} ${styles.singleBlogShell}`}>
          <div className={styles.headerArea}>
            <h1 className="section__title">
              <span className="gradient-text">Góc nhìn công nghệ</span>
            </h1>
            <p className="section__subtitle">
              Nơi đội ngũ đào tạo AIgenlabs chia sẻ kiến thức chuyên sâu về công nghệ,
              trí tuệ nhân tạo và tư duy product alignment cho giới trẻ.
            </p>
          </div>

          <div className={styles.magazineLayout}>
            <div className={styles.mainContent}>
              <div className={styles.backLinkRow}>
                <Link href="/blog" className={`btn btn--secondary btn--sm ${styles.backBtnWrapper}`}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: '6px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Tất cả bài viết
                </Link>
              </div>

              <main className={styles.articleContainer}>
                <header className={styles.articleHeader}>
                  <div className={styles.articleMobileNav}>
                    <Link href="/blog" className={styles.articleMobileBack}>
                      ← Tin tức
                    </Link>
                    <span>Góc nhìn công nghệ</span>
                  </div>
                  <h1 className={styles.articleTitle}>{blog.title}</h1>
                  <div className={styles.articleMeta}>
                    <span>AIgenlabs Academy</span>
                    <span>{publishedDate}</span>
                  </div>
                </header>

                {coverImageUrl && (
                  <div className={styles.articleCoverWrapper}>
                    <Image
                      src={coverImageUrl}
                      alt={`Ảnh bìa bài viết: ${blog.title}`}
                      className={styles.articleCover}
                      fill
                      sizes="(max-width: 768px) 100vw, 860px"
                      priority
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <article className={styles.articleProse}>
                  {articleHtml ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: articleHtml,
                      }}
                    />
                  ) : (
                    <ReactMarkdown
                      components={{
                        img: ({ node, alt, src = '', ...props }) => {
                          const imageUrl = normalizeImageUrl(src)
                          if (!imageUrl) return null

                          return (
                            <Image
                              {...props}
                              src={imageUrl}
                              alt={alt || ''}
                              width={1600}
                              height={900}
                              sizes="100vw"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              decoding="async"
                              style={{ width: '100%', height: 'auto' }}
                            />
                          )
                        },
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  )}
                </article>

                <footer className={styles.articleFooter}>
                  <Link href="/blog" className={styles.articleFooterLink}>
                    Xem thêm bài viết
                  </Link>
                  <Link href="/#cta" className={styles.articleFooterCta}>
                    Nhận tư vấn
                  </Link>
                </footer>
              </main>
            </div>

            <aside className={styles.sidebar}>
              <div className={`${styles.widget} card`}>
                <h4 className={styles.widgetTitle}>Tìm kiếm</h4>
                <div className={styles.searchBox}>
                  <input type="text" placeholder="Tìm kiếm bài viết..." className="input" disabled />
                  <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className={`${styles.widget} card`}>
                <h4 className={styles.widgetTitle}>Chủ đề nổi bật</h4>
                <div className={styles.tagCloud}>
                  {allTags.length === 0 && <span className={styles.tag}>Chưa có chủ đề</span>}
                  {allTags.map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className={`${styles.widget} card`}>
                <h4 className={styles.widgetTitle}>Đáng chú ý</h4>
                <div className={styles.popularList}>
                  {recentBlogs.length === 0 && <p className={styles.emptyStateMinimal}>Đang cập nhật...</p>}
                  {recentBlogs.map((b, i) => (
                    <Link href={`/blog/${b.slug}`} key={b.id} className={styles.popularItem}>
                      <span className={styles.popularRank}>0{i + 1}</span>
                      <div className={styles.popularContent}>
                        <h5 className={styles.popularTitle}>{b.title}</h5>
                        <span className={styles.metaDataText}>{new Date(b.published_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className={`${landingStyles.sectionShell} ${landingStyles.sectionShellDeep} ${styles.widget} ${styles.newsletterWidget}`}>
                <h4 className="section__title" style={{ color: 'white', marginBottom: '8px', fontSize: '1.25rem', textAlign: 'left' }}>Nhận tư vấn</h4>
                <p className="section__subtitle" style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'left', marginBottom: '24px', fontSize: '0.9rem' }}>
                  Trao đổi với đội ngũ AIgenlabs về lộ trình phù hợp.
                </p>
                <Link href="/#cta" className="btn btn--accent" style={{ width: '100%' }}>
                  Liên hệ ngay
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
