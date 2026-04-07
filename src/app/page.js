import styles from './page.module.css'

import Navbar from '@/components/ui/Navbar'
import FAQSection from '@/components/ui/FAQSection'
import CTAForm from '@/components/ui/CTAForm'
import BrandLogo from '@/components/ui/BrandLogo'
import FutureRobotScene from '@/components/landing/FutureRobotScene'
import { getLandingPageData } from '@/lib/landing-content'

const roadmapVariants = ['l1', 'l2', 'l3']
const pricingButtonVariants = ['secondary', 'primary', 'accent']
const pricingBadgeVariants = ['success', 'primary', 'accent']
const pricingStages = ['Khởi đầu', 'Tăng tốc', 'Đi sâu']

export const revalidate = 60

export const metadata = {
  alternates: {
    canonical: '/',
  },
}

function formatExternalUrl(url) {
  if (!url) return '#'
  let clean = String(url).replace(/['"]+/g, '').trim()
  if (clean === '#' || clean.startsWith('#') || clean.startsWith('/')) return clean

  if (clean.includes('@') && !clean.startsWith('mailto:') && !clean.startsWith('http')) {
    return `mailto:${clean}`
  }
  if (/^[\+\d\s\.\-\(\)]+$/.test(clean) && clean.replace(/\D/g, '').length >= 8) {
    return `tel:${clean.replace(/[\s\.\-\(\)]/g, '')}`
  }
  if (clean.startsWith('https:/') && !clean.startsWith('https://')) {
    clean = clean.replace('https:/', 'https://')
  } else if (clean.startsWith('http:/') && !clean.startsWith('http://')) {
    clean = clean.replace('http:/', 'http://')
  }
  if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('mailto:') && !clean.startsWith('tel:')) {
    clean = `https://${clean}`
  }

  return clean
}

export default async function Home() {

  const { content, levels } = await getLandingPageData()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        name: 'AIgenlabs',
        url: 'https://aigenlabs.vn',
        logo: 'https://aigenlabs.vn/icon.svg',
        description: content.hero.description,
        sameAs: [
          // Thêm các link mxh của anh vào mảng này (nếu có)
          'https://www.facebook.com/aigenlabs.vn'
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+84909044430',
          contactType: 'customer service',
          email: 'edu@aigenlabs.vn',
          availableLanguage: ['Vietnamese']
        }
      },
      ...(levels || []).map(level => ({
        '@type': 'Course',
        name: level.name,
        description: level.description || 'Học AI qua dự án thật và tư duy hệ thống',
        provider: {
          '@type': 'EducationalOrganization',
          name: 'AIgenlabs',
          sameAs: 'https://aigenlabs.vn'
        },
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          duration: `P${level.duration_weeks || 4}W`
        },
        offers: {
          '@type': 'Offer',
          category: 'Paid',
          priceCurrency: 'VND',
          price: level.price || 0
        }
      }))
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar header={content.header} />

      <section className={styles.hero} id="hero">
        <div className={styles['hero__bg-shapes']}>
          <div className={`${styles.hero__shape} ${styles['hero__shape--1']}`} />
          <div className={`${styles.hero__shape} ${styles['hero__shape--2']}`} />
          <div className={`${styles.hero__shape} ${styles['hero__shape--3']}`} />
          <div className={styles.hero__grid} />
        </div>

        <div className={`container ${styles.hero__inner}`}>
          <div className={styles.hero__content}>
            <div className={styles.hero__eyebrow}>{content.hero.eyebrow}</div>
            <h1 className={styles.hero__title}>{content.hero.title}</h1>
            <p className={styles.hero__description}>{content.hero.description}</p>

            <div className={styles.hero__actions}>
              <a href="#cta" className="btn btn--primary btn--lg">
                {content.hero.primaryCtaLabel}
              </a>
              <a href="#roadmap" className="btn btn--secondary btn--lg">
                {content.hero.secondaryCtaLabel}
              </a>
            </div>

            <div className={styles.hero__trust}>
              {content.hero.trustItems.map((item) => (
                <div key={item} className={styles['hero__trust-item']}>
                  ✓ {item}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.hero__visual}>
            <div className={styles.hero__visualStage}>
              <FutureRobotScene />
            </div>
          </div>
        </div>
      </section>

      <section className={`section ${styles.pain}`} id="pain">
        <div className="container">
          <div className={`${styles.sectionShell} ${styles.sectionShellBright}`}>
            <h2 className="section__title">{content.pain.title}</h2>
            <p className="section__subtitle">{content.pain.subtitle}</p>

            <div className={styles.pain__grid}>
              {content.pain.items.map((item, index) => (
                <div key={item.title} className={styles.pain__card}>
                  <div className={styles['pain__card-number']}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className={styles['pain__card-icon']}>{item.icon}</div>
                  <h3 className={styles['pain__card-title']}>{item.title}</h3>
                  <p className={styles['pain__card-desc']}>{item.description}</p>
                  <p className={styles['pain__card-quote']}>{item.quote}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`section ${styles.solution}`} id="solution">
        <div className="container">
          <div className={`${styles.sectionShell} ${styles.sectionShellSky}`}>
            <h2 className="section__title">{content.solution.title}</h2>
            <p className="section__subtitle">{content.solution.subtitle}</p>

            <div className={styles.solution__comparison}>
              <div className={`${styles.solution__col} ${styles['solution__col--before']}`}>
                <h3 className={styles['solution__col-title']}>{content.solution.beforeTitle}</h3>
                <div className={styles['solution__col-list']}>
                  {content.solution.beforeItems.map((item) => (
                    <div key={item} className={styles['solution__col-item']}>
                      <span>✕</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.solution__arrow}>→</div>

              <div className={`${styles.solution__col} ${styles['solution__col--after']}`}>
                <h3 className={styles['solution__col-title']}>{content.solution.afterTitle}</h3>
                <div className={styles['solution__col-list']}>
                  {content.solution.afterItems.map((item) => (
                    <div key={item} className={styles['solution__col-item']}>
                      <span>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.solution__pillars}>
              {content.solution.pillars.map((item) => (
                <div key={item.title} className={styles.solution__pillar}>
                  <div className={styles['solution__pillar-icon']}>{item.icon}</div>
                  <div className={styles['solution__pillar-title']}>{item.title}</div>
                  <div className={styles['solution__pillar-desc']}>{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`section ${styles.roadmapSection}`} id="roadmap">
        <div className="container">
          <div className={`${styles.sectionShell} ${styles.sectionShellDeep}`}>
            <h2 className="section__title">
              Lộ trình theo <span className="gradient-text">từng nhịp phát triển</span>
            </h2>
            <p className="section__subtitle">
              Mỗi level giữ một mục tiêu và độ sâu khác nhau để học viên không bị ngợp, nhưng
              vẫn đi được tới sản phẩm có thể demo và kể lại rõ ràng.
            </p>

            <div className={styles.roadmap__cards}>
              {levels.map((level, index) => {
                const variant = roadmapVariants[index % roadmapVariants.length]
                const badgeVariant = pricingBadgeVariants[index % pricingBadgeVariants.length]

                return (
                  <div
                    key={level.id}
                    className={`${styles.roadmap__card} ${styles[`roadmap__card--${variant}`]}`}
                  >
                    <div className={styles['roadmap__card-price-wrapper']}>
                      <span className={`${styles['roadmap__card-price']} gradient-text`}>
                        {new Intl.NumberFormat('vi-VN').format(level.price || 0)}
                      </span>
                      <span className={styles['roadmap__card-currency']}>đ</span>
                    </div>

                    <div className={styles['roadmap__card-age']}>Level {index + 1}</div>

                    <h3 className={styles['roadmap__card-name']}>{level.name}</h3>
                    <p className={styles['roadmap__card-goal']}>{level.description || 'Chưa có mô tả'}</p>

                    <div className={styles['roadmap__card-meta']}>
                      <span className={`badge badge--${badgeVariant}`}>
                        {level.subject_count || level.subjects.length} MÔN
                      </span>
                      <span className={`badge badge--${badgeVariant}`}>
                        {level.duration_weeks || '?'} TUẦN
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {levels.length === 0 && (
              <p className="section__subtitle">
                Chưa có level nào đang mở. Bạn vẫn có thể để lại thông tin ở cuối trang để nhận
                cập nhật sớm nhất.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className={`section ${styles.results}`} id="results">
        <div className="container">
          <div className={`${styles.sectionShell} ${styles.sectionShellBright}`}>
            <h2 className="section__title">{content.results.title}</h2>
            <p className="section__subtitle">{content.results.subtitle}</p>

            <div className={styles['results__before-after']}>
              <div className={`${styles.results__col} ${styles['results__col--before']}`}>
                <h3 className={styles['results__col-title']}>{content.results.beforeTitle}</h3>
                {content.results.beforeItems.map((item) => (
                  <div key={item} className={styles['results__col-item']}>
                    <span>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className={styles.results__arrow}>→</div>

              <div className={`${styles.results__col} ${styles['results__col--after']}`}>
                <h3 className={styles['results__col-title']}>{content.results.afterTitle}</h3>
                {content.results.afterItems.map((item) => (
                  <div key={item} className={styles['results__col-item']}>
                    <span>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.results__showcase}>
              {content.results.showcaseItems.map((item) => (
                <div key={item.title} className={styles['results__showcase-item']}>
                  <div className={styles['results__showcase-icon']}>{item.icon}</div>
                  <div className={styles['results__showcase-title']}>{item.title}</div>
                  <div className={styles['results__showcase-desc']}>{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`section ${styles.methodSection}`} id="method">
        <div className="container">
          <div className={`${styles.sectionShell} ${styles.sectionShellDeep}`}>
            <h2 className="section__title">{content.method.title}</h2>
            <p className="section__subtitle">{content.method.subtitle}</p>

            <div className={styles.method__grid}>
              {content.method.items.map((item) => (
                <div key={item.title} className={styles.method__item}>
                  <div className={styles['method__item-icon']}>{item.icon}</div>
                  <div className={styles['method__item-title']}>{item.title}</div>
                  <div className={styles['method__item-desc']}>{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`section ${styles.commitment}`} id="commitment">
        <div className="container">
          <div className={`${styles.sectionShell} ${styles.sectionShellViolet}`}>
            <h2 className="section__title">{content.commitment.title}</h2>
            <p className="section__subtitle">{content.commitment.subtitle}</p>

            <div className={styles.commitment__grid}>
              {content.commitment.items.map((item) => (
                <div key={item.title} className={styles.commitment__item}>
                  <div className={styles['commitment__item-icon']}>{item.icon}</div>
                  <div>
                    <div className={styles['commitment__item-title']}>{item.title}</div>
                    <div className={styles['commitment__item-desc']}>{item.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.commitment__guarantee}>
              <div className={styles['commitment__guarantee-icon']}>🛡️</div>
              <div className={styles['commitment__guarantee-title']}>
                {content.commitment.guaranteeTitle}
              </div>
              <p className={styles['commitment__guarantee-text']}>
                {content.commitment.guaranteeText}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`section`} id="contact-direct">
        <div className="container">
          <div className={`${styles.sectionShell} ${styles.sectionShellSky}`}>
            <h2 className="section__title">{content.contactDirect?.title || 'Liên hệ trực tiếp'}</h2>
            <p className="section__subtitle">
              {content.contactDirect?.subtitle || 'Đội ngũ AIgenlabs luôn sẵn sàng hỗ trợ và giải đáp thắc mắc của phụ huynh và học viên.'}
            </p>
            <div className={styles.contactDirect__grid}>
              {content.footer.contactLinks.map((item) => {
                const href = formatExternalUrl(item.href)
                const isExternal = href.startsWith('http')
                
                let Icon = (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path><path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M18 8a6 6 0 0 0-9.33-5"></path><line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )

                if (href.startsWith('tel:')) {
                  Icon = (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  )
                } else if (href.startsWith('mailto:')) {
                  Icon = (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  )
                } else if (href.includes('facebook.com')) {
                  Icon = (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  )
                } else if (href.includes('zalo.me')) {
                  Icon = (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                  )
                }

                let title = item.label;
                let text = "Bấm để liên hệ";
                if(title.includes(':')) {
                  const parts = title.split(':');
                  title = parts[0].trim();
                  text = parts.slice(1).join(':').trim();
                } else if (href.startsWith('tel:')) {
                  text = href.replace('tel:', '');
                } else if (href.startsWith('mailto:')) {
                  text = href.replace('mailto:', '');
                }

                return (
                  <a
                    key={`${item.label}-${href}`}
                    href={href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className={styles.contactDirect__card}
                  >
                    <div className={styles.contactDirect__icon}>
                      {Icon}
                    </div>
                    <div className={styles.contactDirect__label}>{title}</div>
                    <div className={styles.contactDirect__detail}>{text}</div>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className={`section ${styles.pricingSection}`} id="pricing">
        <div className="container">
          <div className={`${styles.sectionShell} ${styles.sectionShellDeep}`}>
            <h2 className="section__title">
              Các gói học <span className="gradient-text">hiện có</span>
            </h2>
            <p className="section__subtitle">
              Tên gói, mức học phí và cấu trúc môn học luôn bám theo chương trình đang vận hành để
              bạn nhìn đúng level mình đang cân nhắc.
            </p>

            <div className={styles.pricing__grid}>
              {levels.map((level, index) => {
                const buttonVariant = pricingButtonVariants[index % pricingButtonVariants.length]
                const isFeatured = index === 1

                return (
                  <div
                    key={level.id}
                    className={`${styles.pricing__card} ${isFeatured ? styles['pricing__card--featured'] : ''
                      }`}
                  >
                    {isFeatured && (
                      <div className={styles['pricing__card-popular']}>Được chọn nhiều</div>
                    )}
                    <div className={styles['pricing__card-level']}>Level {index + 1}</div>
                    <div className={styles['pricing__card-age']}>
                      {pricingStages[index] || 'Lộ trình nâng cao'}
                    </div>
                    <div className={styles['pricing__card-name']}>{level.name}</div>
                    <div className={`${styles['pricing__card-price']} gradient-text`}>
                      <span className={styles['price-number']}>
                        {new Intl.NumberFormat('vi-VN').format(level.price || 0)}
                      </span>
                      <span className={styles['price-currency']}>đ</span>
                    </div>
                    <div className={styles['pricing__card-period-wrap']}>
                      <span className={styles['pricing-badge']}>{level.duration_weeks} TUẦN</span>
                      <span className={styles['pricing-badge']}>
                        {level.subjects?.length || 1} MÔN
                      </span>
                    </div>

                    <div className={styles['pricing__card-divider']}></div>

                    <div className={styles['pricing__card-features']}>
                      <div className={styles['pricing__features-title']}>Bạn sẽ nhận được:</div>
                      {(level.description || 'Chưa có mô tả')
                        .split('\n')
                        .filter((line) => line.trim())
                        .map((line, idx) => (
                          <div key={idx} className={styles['pricing__card-feature']}>
                            <div className={styles['pricing__card-feature-icon']}>
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <span>{line.trim()}</span>
                          </div>
                      ))}
                    </div>
                    <a
                      href="#cta"
                      className={`btn btn--${buttonVariant}`}
                      style={{ width: '100%' }}
                    >
                      Nhận tư vấn {level.name}
                    </a>
                  </div>
                )
              })}
            </div>

            <p className={styles.pricing__note}>
              * Đội ngũ AIgenlabs sẽ xác nhận lại level phù hợp dựa trên độ tuổi, trải nghiệm hiện tại
              và mục tiêu học viên trước khi đăng ký.
            </p>
          </div>
        </div>
      </section>

      <section className={`section ${styles.faq}`} id="faq">
        <div className="container">
          <div className={`${styles.sectionShell} ${styles.sectionShellBright}`}>
            <h2 className="section__title">{content.faq.title}</h2>
            <p className="section__subtitle">{content.faq.subtitle}</p>

            <FAQSection items={content.faq.items} />
          </div>
        </div>
      </section>

      <section className={`section ${styles['cta-final']}`} id="cta">
        <div className="container">
          <div className={styles['cta-final__inner']}>
            <div>
              <h2 className={styles['cta-final__title']}>{content.cta.title}</h2>
              <p className={styles['cta-final__desc']}>{content.cta.description}</p>
              <div className={styles['cta-final__benefits']}>
                {content.cta.benefits.map((item) => (
                  <div key={item} className={styles['cta-final__benefit']}>
                    ✓ {item}
                  </div>
                ))}
              </div>
            </div>

            <CTAForm
              title={content.cta.formTitle}
              note={content.cta.formNote}
              submitLabel={content.cta.submitLabel}
            />
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footer__inner}>
            <div>
              <div className={styles['footer__brand-name']}>
                <BrandLogo
                  size="lg"
                  theme="dark"
                  subtitle={content.footer.logoSubtitle}
                />
              </div>
              <p className={styles['footer__brand-desc']}>{content.footer.description}</p>
            </div>
            <div>
              <div className={styles['footer__col-title']}>{content.footer.roadmapTitle}</div>
              {levels.slice(0, 3).map((level, index) => (
                <a key={level.id} href="#roadmap" className={styles.footer__link}>
                  Level {index + 1}: {level.name}
                </a>
              ))}
            </div>
            <div>
              <div className={styles['footer__col-title']}>{content.footer.quickLinksTitle}</div>
              <a href="#faq" className={styles.footer__link}>
                {content.footer.faqLabel}
              </a>
              <a href="#commitment" className={styles.footer__link}>
                {content.footer.commitmentLabel}
              </a>
              <a href="#cta" className={styles.footer__link}>
                {content.footer.ctaLabel}
              </a>
            </div>
            <div>
              <div className={styles['footer__col-title']}>{content.footer.contactTitle}</div>
              {content.footer.contactLinks.map((item) => {
                const href = formatExternalUrl(item.href);
                const isExternal = href.startsWith('http');
                return (
                  <a
                    key={`${item.label}-${item.href}`}
                    href={href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className={styles.footer__link}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>
          <div className={styles.footer__bottom}>{content.footer.copyright}</div>
        </div>
      </footer>
    </>
  )
}
