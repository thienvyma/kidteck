import styles from '@/app/page.module.css'

import Navbar from '@/components/ui/Navbar'
import FAQSection from '@/components/ui/FAQSection'
import CTAForm from '@/components/ui/CTAForm'
import BrandLogo from '@/components/ui/BrandLogo'
import FutureRobotScene from '@/components/landing/FutureRobotScene'

const roadmapVariants = ['l1', 'l2', 'l3']
const pricingBadgeVariants = ['success', 'primary', 'accent']

function getRenderableStringList(items = []) {
  return (items || []).filter((item) => typeof item === 'string' && item.trim())
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
  if (
    !clean.startsWith('http://') &&
    !clean.startsWith('https://') &&
    !clean.startsWith('mailto:') &&
    !clean.startsWith('tel:')
  ) {
    clean = `https://${clean}`
  }

  return clean
}

function getContactActionMeta(href) {
  if (href.startsWith('tel:')) {
    return {
      label: 'Gọi ngay',
      detail: href.replace('tel:', ''),
    }
  }

  if (href.startsWith('mailto:')) {
    return {
      label: 'Gửi email',
      detail: href.replace('mailto:', ''),
    }
  }

  if (href.includes('facebook.com')) {
    return {
      label: 'Mở fanpage',
      detail: 'Nhắn trực tiếp qua fanpage',
    }
  }

  if (href.includes('zalo.me')) {
    return {
      label: 'Nhắn Zalo',
      detail: 'Liên hệ nhanh trên điện thoại',
    }
  }

  return {
    label: 'Liên hệ',
    detail: 'Bấm để mở kênh hỗ trợ',
  }
}

export default function LandingPageView({
  content,
  levels = [],
  includeStructuredData = true,
  anchorBase = '/',
  previewMode = false,
  selectedSectionId = null,
}) {
  const solutionPillars = (content.solution?.pillars || []).filter(
    (item) => item?.title?.trim() || item?.description?.trim() || item?.icon?.trim()
  )
  const heroTrustItems = getRenderableStringList(content.hero?.trustItems)
  const solutionBeforeItems = getRenderableStringList(content.solution?.beforeItems)
  const solutionAfterItems = getRenderableStringList(content.solution?.afterItems)
  const resultShowcaseItems = (content.results?.showcaseItems || []).filter(
    (item) => item?.title?.trim() || item?.description?.trim() || item?.icon?.trim()
  )
  const resultBeforeItems = getRenderableStringList(content.results?.beforeItems)
  const resultAfterItems = getRenderableStringList(content.results?.afterItems)
  const ctaBenefits = getRenderableStringList(content.cta?.benefits)
  const footerContactLinks = (content.footer?.contactLinks || []).filter(
    (item) => item?.label?.trim() || item?.href?.trim()
  )
  const sectionVisibility = content.sectionVisibility || {}
  const showHeader = sectionVisibility.header !== false
  const showHero = sectionVisibility.hero !== false
  const showSolution = sectionVisibility.solution !== false
  const showCatalog = sectionVisibility.catalog !== false
  const showResults = sectionVisibility.results !== false
  const showMethod = sectionVisibility.method !== false
  const showCommitment = sectionVisibility.commitment !== false
  const showContact = sectionVisibility.contact !== false
  const showFaq = sectionVisibility.faq !== false
  const showCta = sectionVisibility.cta !== false
  const showFooter = sectionVisibility.footer !== false
  const footerQuickLinks = [
    {
      sectionId: 'faq',
      href: '#faq',
      label: content.footer.faqLabel,
    },
    {
      sectionId: 'commitment',
      href: '#commitment',
      label: content.footer.commitmentLabel,
    },
    {
      sectionId: 'cta',
      href: '#cta',
      label: content.footer.ctaLabel,
    },
  ].filter((item) => sectionVisibility[item.sectionId] !== false)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        name: 'AIgenlabs',
        url: 'https://aigenlabs.vn',
        logo: 'https://aigenlabs.vn/AIGen_blacklogo.png',
        description: content.hero.description,
        sameAs: ['https://www.facebook.com/aigenlabs.vn'],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+84909044430',
          contactType: 'customer service',
          email: 'edu@aigenlabs.vn',
          availableLanguage: ['Vietnamese'],
        },
      },
      ...(levels || []).map((level) => ({
        '@type': 'Course',
        name: level.name,
        description: level.description || 'Học AI qua dự án thật và tư duy hệ thống',
        provider: {
          '@type': 'EducationalOrganization',
          name: 'AIgenlabs',
          sameAs: 'https://aigenlabs.vn',
        },
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          duration: `P${level.duration_weeks || 4}W`,
        },
        offers: {
          '@type': 'Offer',
          category: 'Paid',
          priceCurrency: 'VND',
          price: level.price || 0,
        },
      })),
    ],
  }

  function getPreviewSectionProps(sectionId, baseClassName = '', domId) {
    const className = previewMode
      ? `${baseClassName} ${styles.landingPreviewSelectableSection} ${
          selectedSectionId === sectionId ? styles.landingPreviewSelectableSectionActive : ''
        }`.trim()
      : baseClassName

    return {
      id: domId,
      className,
      'data-landing-preview-section': previewMode ? sectionId : undefined,
    }
  }

  return (
    <>
      {includeStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {showHeader && (
        <div {...getPreviewSectionProps('header', '', 'landing-preview-header')}>
          <Navbar
            header={content.header}
            anchorBase={anchorBase}
            homeHref={anchorBase}
            sectionVisibility={sectionVisibility}
          />
        </div>
      )}

      {showHero && (
        <section {...getPreviewSectionProps('hero', styles.hero, 'hero')}>
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

            {(showCta || showCatalog) && (
              <div className={styles.hero__actions}>
                {showCta && (
                  <a href="#cta" className="btn btn--primary btn--lg">
                    {content.hero.primaryCtaLabel}
                  </a>
                )}
                {showCatalog && (
                  <a href="#roadmap" className="btn btn--secondary btn--lg">
                    {content.hero.secondaryCtaLabel}
                  </a>
                )}
              </div>
            )}

            <div className={styles.hero__trust}>
              {heroTrustItems.map((item) => (
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
      )}

      {showSolution && (
        <section
          {...getPreviewSectionProps('solution', `section ${styles.solution}`, 'solution')}
        >
        <div className="container">
          <div className={`${styles.sectionShell} ${styles.sectionShellSky}`}>
            <h2 className="section__title">{content.solution.title}</h2>
            <p className="section__subtitle">{content.solution.subtitle}</p>

            <div className={styles.solution__comparison}>
              <div className={`${styles.solution__col} ${styles['solution__col--before']}`}>
                <h3 className={styles['solution__col-title']}>{content.solution.beforeTitle}</h3>
                <div className={styles['solution__col-list']}>
                  {solutionBeforeItems.map((item) => (
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
                  {solutionAfterItems.map((item) => (
                    <div key={item} className={styles['solution__col-item']}>
                      <span>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.solution__pillars}>
              {solutionPillars.map((item, index) => (
                <div
                  key={`${item.title || 'pillar'}-${index}`}
                  className={styles.solution__pillar}
                >
                  <div className={styles['solution__pillar-icon']}>{item.icon}</div>
                  <div className={styles['solution__pillar-title']}>{item.title}</div>
                  <div className={styles['solution__pillar-desc']}>{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </section>
      )}

      {showCatalog && (
        <section
          {...getPreviewSectionProps('catalog', `section ${styles.roadmapSection}`, 'roadmap')}
        >
        <div className="container">
          <div className={`${styles.sectionShell} ${styles.sectionShellDeep}`}>
            <h2 className="section__title">
              Lộ trình theo <span className="gradient-text">từng nhịp phát triển</span>
            </h2>
            <p className="section__subtitle">
              Mỗi level giữ một mục tiêu và độ sâu khác nhau để học viên không bị ngợp, nhưng vẫn đi
              được tới sản phẩm có thể demo và kể lại rõ ràng.
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
                    <p className={styles['roadmap__card-goal']}>
                      {level.description || 'Chưa có mô tả'}
                    </p>

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
                Chưa có level nào đang mở. Bạn vẫn có thể để lại thông tin ở cuối trang để nhận cập
                nhật sớm nhất.
              </p>
            )}
          </div>
        </div>
        </section>
      )}

      {showResults && (
        <section {...getPreviewSectionProps('results', `section ${styles.results}`, 'results')}>
        <div className="container">
          <div className={`${styles.sectionShell} ${styles.sectionShellBright}`}>
            <h2 className="section__title">{content.results.title}</h2>
            <p className="section__subtitle">{content.results.subtitle}</p>

            <div className={styles['results__before-after']}>
              <div className={`${styles.results__col} ${styles['results__col--before']}`}>
                <h3 className={styles['results__col-title']}>{content.results.beforeTitle}</h3>
                {resultBeforeItems.map((item) => (
                  <div key={item} className={styles['results__col-item']}>
                    <span>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className={styles.results__arrow}>→</div>

              <div className={`${styles.results__col} ${styles['results__col--after']}`}>
                <h3 className={styles['results__col-title']}>{content.results.afterTitle}</h3>
                {resultAfterItems.map((item) => (
                  <div key={item} className={styles['results__col-item']}>
                    <span>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {resultShowcaseItems.length > 0 && (
              <div className={styles.results__showcase}>
                {resultShowcaseItems.map((item, index) => (
                  <div
                    key={`${item.title || 'showcase'}-${index}`}
                    className={styles['results__showcase-item']}
                  >
                    <div className={styles['results__showcase-icon']}>{item.icon}</div>
                    <div className={styles['results__showcase-title']}>{item.title}</div>
                    <div className={styles['results__showcase-desc']}>{item.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </section>
      )}

      {showMethod && (
        <section
          {...getPreviewSectionProps('method', `section ${styles.methodSection}`, 'method')}
        >
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
      )}

      {showCommitment && (
        <section
          {...getPreviewSectionProps(
            'commitment',
            `section ${styles.commitment}`,
            'commitment'
          )}
        >
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
      )}

      {showContact && (
        <section {...getPreviewSectionProps('contact', 'section', 'contact-direct')}>
        <div className="container">
          <div className={`${styles.sectionShell} ${styles.sectionShellSky}`}>
            <h2 className="section__title">
              {content.contactDirect?.title || 'Liên hệ trực tiếp'}
            </h2>
            <p className="section__subtitle">
              {content.contactDirect?.subtitle ||
                'Đội ngũ AIgenlabs luôn sẵn sàng hỗ trợ và giải đáp thắc mắc của phụ huynh và học viên.'}
            </p>
            <div className={styles.contactDirect__grid}>
              {footerContactLinks.map((item, index) => {
                const href = formatExternalUrl(item.href)
                const isExternal = href.startsWith('http')

                let Icon = (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    <path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path>
                    <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M18 8a6 6 0 0 0-9.33-5"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )

                if (href.startsWith('tel:')) {
                  Icon = (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  )
                } else if (href.startsWith('mailto:')) {
                  Icon = (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  )
                } else if (href.includes('facebook.com')) {
                  Icon = (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  )
                } else if (href.includes('zalo.me')) {
                  Icon = (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                  )
                }

                let title = item.label
                let text = ''
                if (title.includes(':')) {
                  const parts = title.split(':')
                  title = parts[0].trim()
                  text = parts.slice(1).join(':').trim()
                } else if (href.startsWith('tel:')) {
                  text = href.replace('tel:', '')
                } else if (href.startsWith('mailto:')) {
                  text = href.replace('mailto:', '')
                }

                const actionMeta = getContactActionMeta(href)
                if (!text) {
                  text = actionMeta.detail
                }

                return (
                  <a
                    key={`${item.label || 'contact'}-${href}-${index}`}
                    href={href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className={styles.contactDirect__card}
                  >
                    <div className={styles.contactDirect__cardMain}>
                      <div className={styles.contactDirect__icon}>{Icon}</div>
                      <div className={styles.contactDirect__body}>
                        <div className={styles.contactDirect__label}>{title}</div>
                        <div className={styles.contactDirect__detail}>
                          {text || actionMeta.detail}
                        </div>
                      </div>
                    </div>
                    <div className={styles.contactDirect__action}>
                      <span className={styles.contactDirect__actionText}>{actionMeta.label}</span>
                      <span className={styles.contactDirect__actionArrow} aria-hidden="true">
                        →
                      </span>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
        </section>
      )}

      {showFaq && (
        <section {...getPreviewSectionProps('faq', `section ${styles.faq}`, 'faq')}>
        <div className="container">
          <div className={`${styles.sectionShell} ${styles.sectionShellBright}`}>
            <h2 className="section__title">{content.faq.title}</h2>
            <p className="section__subtitle">{content.faq.subtitle}</p>

            <FAQSection items={content.faq.items} />
          </div>
        </div>
        </section>
      )}

      {showCta && (
        <section {...getPreviewSectionProps('cta', `section ${styles['cta-final']}`, 'cta')}>
        <div className="container">
          <div className={styles['cta-final__inner']}>
            <div>
              <h2 className={styles['cta-final__title']}>{content.cta.title}</h2>
              <p className={styles['cta-final__desc']}>{content.cta.description}</p>
              <div className={styles['cta-final__benefits']}>
                {ctaBenefits.map((item) => (
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
              previewMode={previewMode}
            />
          </div>
        </div>
        </section>
      )}

      {showFooter && (
        <footer {...getPreviewSectionProps('footer', styles.footer)}>
        <div className="container">
          <div className={styles.footer__inner}>
            <div>
              <div className={styles['footer__brand-name']}>
                <BrandLogo size="lg" theme="dark" subtitle={content.footer.logoSubtitle} />
              </div>
              <p className={styles['footer__brand-desc']}>{content.footer.description}</p>
            </div>
            {showCatalog && levels.length > 0 && (
              <div>
                <div className={styles['footer__col-title']}>{content.footer.roadmapTitle}</div>
                {levels.slice(0, 3).map((level, index) => (
                  <a key={level.id} href="#roadmap" className={styles.footer__link}>
                    Level {index + 1}: {level.name}
                  </a>
                ))}
              </div>
            )}
            {footerQuickLinks.length > 0 && (
              <div>
                <div className={styles['footer__col-title']}>{content.footer.quickLinksTitle}</div>
                {footerQuickLinks.map((item) => (
                  <a key={item.sectionId} href={item.href} className={styles.footer__link}>
                    {item.label}
                  </a>
                ))}
              </div>
            )}
            <div>
              <div className={styles['footer__col-title']}>{content.footer.contactTitle}</div>
              {footerContactLinks.map((item, index) => {
                const href = formatExternalUrl(item.href)
                const isExternal = href.startsWith('http')

                return (
                  <a
                    key={`${item.label || 'footer-link'}-${item.href}-${index}`}
                    href={href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className={styles.footer__link}
                  >
                    {item.label}
                  </a>
                )
              })}
            </div>
          </div>
          <div className={styles.footer__bottom}>{content.footer.copyright}</div>
        </div>
        </footer>
      )}
    </>
  )
}
