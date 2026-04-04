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

export default async function Home() {

  const { content, levels } = await getLandingPageData()

  return (
    <>
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
                    <div className={styles['roadmap__card-age']}>Level {index + 1}</div>
                    <h3 className={styles['roadmap__card-name']}>{level.name}</h3>
                    <p className={styles['roadmap__card-goal']}>{level.description}</p>
                    <div className={styles['roadmap__card-meta']}>
                      <span className={`badge badge--${badgeVariant}`}>
                        {level.subject_count || level.subjects.length} môn
                      </span>
                      <span className={`badge badge--${badgeVariant}`}>
                        {level.duration_weeks || '?'} tuần
                      </span>
                    </div>
                    <div className={styles['roadmap__card-subjects']}>
                      {level.subjects.slice(0, 5).map((subject) => (
                        <div key={subject.id} className={styles['roadmap__card-subject']}>
                          • {subject.description || subject.name}
                        </div>
                      ))}
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
                    className={`${styles.pricing__card} ${
                      isFeatured ? styles['pricing__card--featured'] : ''
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
                      {new Intl.NumberFormat('vi-VN').format(level.price || 0)}đ
                    </div>
                    <div className={styles['pricing__card-period']}>
                      {level.subject_count || level.subjects.length} môn •{' '}
                      {level.duration_weeks || '?'} tuần
                    </div>
                    <div className={styles['pricing__card-features']}>
                      {level.subjects.slice(0, 5).map((subject) => (
                        <div key={subject.id} className={styles['pricing__card-feature']}>
                          <span className={styles['pricing__card-feature-icon']}>✓</span>
                          <span>{subject.description || subject.name}</span>
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
              {content.footer.contactLinks.map((item) => (
                <a
                  key={`${item.label}-${item.href}`}
                  href={item.href || '#'}
                  className={styles.footer__link}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div className={styles.footer__bottom}>{content.footer.copyright}</div>
        </div>
      </footer>
    </>
  )
}
