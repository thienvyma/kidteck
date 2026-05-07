import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import { getLandingHeaderData } from '@/lib/landing-content'
import { createPublicSupabaseClient } from '@/lib/public-supabase'
import { getBlogCoverImages } from '@/lib/blog-media'
import ResponsiveBlogCover from './ResponsiveBlogCover'
import styles from './blog.module.css'

export const revalidate = 60 // ISR caching auto-revalidate 

export const metadata = {
  title: 'Blog & Tin Tức | AIgenlabs',
  description: 'Cập nhật tin tức mới nhất về học lập trình AI, dự án công nghệ và tư duy điều phối cho học sinh.',
  alternates: {
    canonical: '/blog',
  },
}

const ITEMS_PER_PAGE = 6;

async function getBlogs(page = 1) {
  const supabase = createPublicSupabaseClient()
  if (!supabase) {
    return { data: [], totalPages: 0, currentPage: page }
  }
  
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data, error, count } = await supabase
    .from('blogs')
    .select(
      'id, slug, title, description, cover_image_url, cover_image_mobile_url, published_at, tags',
      { count: 'exact' }
    )
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching blogs:', error)
    return { data: [], totalPages: 0 }
  }
  
  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);
  return { data: data || [], totalPages, currentPage: page }
}

async function getAllTags() {
  const supabase = createPublicSupabaseClient()
  if (!supabase) return []

  const { data } = await supabase.from('blogs').select('tags').eq('is_published', true)
  if (!data) return []
  
  const tagSet = new Set()
  data.forEach(blog => {
    if (blog.tags && Array.isArray(blog.tags)) {
      blog.tags.forEach(tag => tagSet.add(tag))
    }
  })
  return Array.from(tagSet).sort()
}

function formatBlogDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

import landingStyles from '../page.module.css';

export default async function BlogArchivePage({ searchParams }) {
  // Fix for Next.js 15 searchParams resolution
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams?.page) || 1;

  const [{ data: blogs, totalPages }, landingHeaderData, allTags] = await Promise.all([
    getBlogs(currentPage),
    getLandingHeaderData(),
    getAllTags()
  ])

  // Extract hero
  const isPageOne = currentPage === 1;
  const hero = isPageOne && blogs.length > 0 ? blogs[0] : null;
  const feedBlogs = isPageOne ? blogs.slice(1) : blogs;
  const popularBlogs = hero ? blogs.slice(1, 4) : blogs.slice(0, 3);
  const heroCover = getBlogCoverImages(hero)

  // Render pagination buttons
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(
            <Link 
                key={i} 
                href={`/blog?page=${i}`}
                className={`${styles.pageBtn} ${currentPage === i ? styles.pageBtnActive : ''}`}
            >
                {i}
            </Link>
        )
    }
    return (
        <div className={styles.pagination}>
            {currentPage > 1 && (
                <Link href={`/blog?page=${currentPage - 1}`} className="btn btn--secondary btn--sm">← Trở về</Link>
            )}
            <div className={styles.pageNumbers}>
                {pages}
            </div>
            {currentPage < totalPages && (
                <Link href={`/blog?page=${currentPage + 1}`} className="btn btn--secondary btn--sm">Tiếp tục →</Link>
            )}
        </div>
    )
  }

  return (
    <>
      <Navbar
        header={landingHeaderData.header}
        sectionVisibility={landingHeaderData.sectionVisibility}
      />
      
      <main className={`container section ${styles.blogArchivePage}`}>
        
        <div className={`${landingStyles.sectionShell} ${landingStyles.sectionShellBright} ${styles.archiveShell}`}>
          
          <div className={styles.headerArea}>
              <h1 className="section__title">
                <span className="gradient-text">Góc nhìn công nghệ</span>
              </h1>
              <p className="section__subtitle">
              Nơi đội ngũ đào tạo AIgenlabs chia sẻ kiến thức chuyên sâu về công nghệ, 
              trí tuệ nhân tạo và tư duy product alignment cho giới trẻ.
              </p>
          </div>

          {blogs.length === 0 ? (
            <div className={styles.emptyState}>
              Đang cập nhật những bài viết đầu tiên. Vui lòng quay lại sau!
            </div>
          ) : (
            <div className={styles.magazineLayout}>
              {/* Cột Trái: Dòng thời gian hiển thị */}
              <div className={styles.mainContent}>
                  
                  {/* Hero section chỉ hiện ở Page 1 */}
                  {hero && (
                      <Link href={`/blog/${hero.slug}`} className={`${styles.heroCard} ${!heroCover.desktop ? styles.heroCardNoImage : ''} card`}>
                          {heroCover.desktop && (
                              <div className={`${styles.heroImageWrapper} ${heroCover.hasMobileArtDirection ? styles.heroImageWrapperArtDirected : ''}`}>
                                  <ResponsiveBlogCover
                                    desktopSrc={heroCover.desktop}
                                    mobileSrc={heroCover.mobile}
                                    alt={hero.title}
                                    className={styles.heroImage}
                                    cover={heroCover.hasMobileArtDirection}
                                    eager
                                  />
                              </div>
                          )}
                          <div className={styles.heroContent}>
                              <div className={styles.metadataRow}>
                                  <span className="badge badge--success">NỔI BẬT</span>
                              </div>
                              <h2 className={styles.heroTitle}>{hero.title}</h2>
                              <p className={styles.heroDescription}>{hero.description}</p>
                              <div className={styles.authorMeta}>
                                  <div className={styles.avatar}>A</div>
                                  <div className={styles.authorDetails}>
                                      <span className={styles.authorName}>AIgenlabs Team</span>
                                      <span className={styles.publishDate}>{formatBlogDate(hero.published_at)}</span>
                                  </div>
                              </div>
                          </div>
                      </Link>
                  )}

                  {/* Danh sách bài đăng (Horizontal) */}
                  {feedBlogs.length > 0 && (
                  <div className={styles.postFeed}>
                      <h3 className={styles.sectionTitle}>Mới nhất</h3>
                      {feedBlogs.map(blog => {
                          const cover = getBlogCoverImages(blog)
                          return (
                              <Link href={`/blog/${blog.slug}`} key={blog.id} className={`${styles.horizontalCard} card`}>
                                  <div className={`${styles.hImageWrapper} ${cover.hasMobileArtDirection ? styles.hImageWrapperArtDirected : ''} ${!cover.desktop ? styles.hImageWrapperEmpty : ''}`}>
                                      {cover.desktop ? (
                                          <ResponsiveBlogCover
                                            desktopSrc={cover.desktop}
                                            mobileSrc={cover.mobile}
                                            alt={blog.title}
                                            className={styles.hImage}
                                            cover={cover.hasMobileArtDirection}
                                          />
                                      ) : (
                                          <div className={styles.placeholderBg}>AI</div>
                                      )}
                                  </div>
                                  <div className={styles.hContent}>
                                      <div className={styles.metadataRow}>
                                          <span className="badge badge--primary">CHUYÊN MÔN</span>
                                          <span className={styles.metaDataText}>{formatBlogDate(blog.published_at)}</span>
                                      </div>
                                      <h2 className={styles.hTitle}>{blog.title}</h2>
                                      <p className={styles.hDescription}>{blog.description}</p>
                                      <div className={styles.hFooter}>
                                          <span className={styles.publishDate}>{formatBlogDate(blog.published_at)}</span>
                                      </div>
                                  </div>
                              </Link>
                          )
                      })}
                  </div>
                  )}

                  {/* Component Phân Trang */}
                  {renderPagination()}

              </div>

              {/* Cột Phải: Sticky Sidebar */}
              <aside className={styles.sidebar}>
                  
                  {/* Search Bar (Mock) */}
                  <div className={`${styles.widget} ${styles.searchWidget} card`}>
                      <h4 className={styles.widgetTitle}>Tìm kiếm</h4>
                      <div className={styles.searchBox}>
                          <input type="text" placeholder="Tìm kiếm bài viết..." className="input" disabled />
                          <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </div>
                  </div>

                  {/* Categories */}
                  {allTags.length > 0 && (
                  <div className={`${styles.widget} ${styles.tagsWidget} card`}>
                      <h4 className={styles.widgetTitle}>Chủ đề nổi bật</h4>
                      <div className={styles.tagCloud}>
                          {allTags.map(tag => (
                              <span key={tag} className={styles.tag}>{tag}</span>
                          ))}
                      </div>
                  </div>
                  )}

                  {/* Featured / Popular Posts (Mock) */}
                  {popularBlogs.length > 0 && (
                  <div className={`${styles.widget} ${styles.popularWidget} card`}>
                      <h4 className={styles.widgetTitle}>Đáng chú ý</h4>
                      <div className={styles.popularList}>
                          {popularBlogs.map((b, i) => (
                              <Link href={`/blog/${b.slug}`} key={b.id} className={styles.popularItem}>
                                  <span className={styles.popularRank}>0{i+1}</span>
                                  <div className={styles.popularContent}>
                                      <h5 className={styles.popularTitle}>{b.title}</h5>
                                      <span className={styles.metaDataText}>{formatBlogDate(b.published_at)}</span>
                                  </div>
                              </Link>
                          ))}
                      </div>
                  </div>
                  )}

                  {/* Newsletter Box - Style như Landing Page */}
                  <div className={`${landingStyles.sectionShell} ${landingStyles.sectionShellDeep} ${styles.widget} ${styles.newsletterWidget}`}>
                      <h4 className="section__title" style={{color: 'white', marginBottom: '8px', fontSize: '1.25rem', textAlign: 'left'}}>Nhận tư vấn</h4>
                      <p className="section__subtitle" style={{color: 'rgba(255,255,255,0.8)', textAlign: 'left', marginBottom: '24px', fontSize: '0.9rem'}}>
                          Trao đổi với đội ngũ AIgenlabs về lộ trình phù hợp.
                      </p>
                      <Link href="/#cta" className="btn btn--accent" style={{width: '100%'}}>
                          Liên hệ ngay
                      </Link>
                  </div>

              </aside>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
