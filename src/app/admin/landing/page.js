'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { cloneDefaultLandingContent } from '@/lib/landing-defaults'
import styles from '../admin.module.css'

const LANDING_SECTIONS = [
  { id: 'header', label: 'Header', badge: 'Menu' },
  { id: 'hero', label: 'Hero', badge: 'Banner' },
  { id: 'solution', label: 'Positioning', badge: 'Story' },
  { id: 'catalog', label: 'Roadmap & Pricing', badge: 'Sync' },
  { id: 'results', label: 'Results', badge: 'Outcome' },
  { id: 'method', label: 'Method', badge: 'Studio' },
  { id: 'commitment', label: 'Commitment', badge: 'Trust' },
  { id: 'faq', label: 'FAQ', badge: 'Answer' },
  { id: 'cta', label: 'CTA', badge: 'Lead' },
  { id: 'contact', label: 'Contact', badge: 'Direct' },
  { id: 'footer', label: 'Footer', badge: 'Brand' },
]

function cloneContent(value) {
  return JSON.parse(JSON.stringify(value))
}

function arrayToTextarea(values = []) {
  return values.join('\n')
}

function textareaToArray(value) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function AdminLandingPage() {
  const [content, setContent] = useState(() => cloneDefaultLandingContent())
  const [contentUpdatedAt, setContentUpdatedAt] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [activeSection, setActiveSection] = useState('header')

  const fetchContent = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true)
    }

    try {
      const response = await fetch('/api/admin/landing-content', { cache: 'no-store' })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Không thể tải nội dung landing')
      }

      setContent(result.content || cloneDefaultLandingContent())
      setContentUpdatedAt(result.updatedAt || '')
      return true
    } catch (error) {
      console.error('fetch landing content error:', error)
      setFeedback({
        type: 'error',
        text: error.message || 'Không thể tải nội dung landing',
      })
      return false
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  function updateSection(section, field, value) {
    setContent((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }))
  }

  function updateArrayField(section, field, value) {
    updateSection(section, field, textareaToArray(value))
  }

  function updateObjectItem(section, index, field, value) {
    setContent((current) => {
      const next = cloneContent(current)
      next[section].items[index][field] = value
      return next
    })
  }

  function updateArrayObjectItem(section, arrayField, index, field, value) {
    setContent((current) => {
      const next = cloneContent(current)
      next[section][arrayField][index][field] = value
      return next
    })
  }

  function updateSolutionPillar(index, field, value) {
    setContent((current) => {
      const next = cloneContent(current)
      next.solution.pillars[index][field] = value
      return next
    })
  }

  function updateFooterLink(index, field, value) {
    setContent((current) => {
      const next = cloneContent(current)
      next.footer.contactLinks[index][field] = value
      return next
    })
  }

  function addFooterLink() {
    setContent((current) => ({
      ...current,
      footer: {
        ...current.footer,
        contactLinks: [...current.footer.contactLinks, { label: '', href: '' }],
      },
    }))
  }

  function removeFooterLink(index) {
    setContent((current) => {
      if (current.footer.contactLinks.length <= 1) {
        return current
      }

      const next = cloneContent(current)
      next.footer.contactLinks.splice(index, 1)
      return next
    })
  }

  function jumpToSection(sectionId) {
    setActiveSection(sectionId)
    document
      .getElementById(`landing-section-${sectionId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setFeedback(null)

    try {
      const response = await fetch('/api/admin/landing-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, expectedUpdatedAt: contentUpdatedAt }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Không thể lưu landing content')
      }

      const refreshed = await fetchContent({ silent: true })
      if (!refreshed) {
        throw new Error('KhÃ´ng thá»ƒ Ä‘á»c láº¡i ná»™i dung landing sau khi lÆ°u')
      }
      setFeedback({
        type: 'success',
        text: 'Đã lưu nội dung landing. Roadmap và pricing vẫn tự đồng bộ từ phần Khóa học.',
      })
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error.message || 'Không thể lưu landing content',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Landing Content</h2>
          <p className={styles.curriculumLead}>Đang tải nội dung landing...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Landing Content</h2>
          <p className={styles.curriculumLead}>
            Chỉnh landing theo đúng từng khối đang hiển thị ngoài site. Header và Footer giờ
            cũng chỉnh riêng được, còn roadmap và pricing vẫn đồng bộ từ phần Khóa học để tránh
            lệch dữ liệu.
          </p>
        </div>

        <div className={styles.quickActions}>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
          >
            Mở landing thật
          </a>
          <button
            type="button"
            className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
            onClick={() => fetchContent()}
            disabled={saving}
          >
            Tải lại từ server
          </button>
          <button
            type="submit"
            form="landing-editor-form"
            className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
            disabled={saving}
          >
            {saving ? 'Đang lưu...' : 'Lưu landing content'}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`${styles.feedbackBanner} ${
            feedback.type === 'success'
              ? styles.feedbackBannerSuccess
              : styles.feedbackBannerError
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className={styles.landingEditorLayout}>
        <aside className={styles.landingEditorSidebar}>
          <div className={styles.landingEditorMetaCard}>
            <div className={styles.landingEditorMetaTitle}>Cách dùng nhanh</div>
            <p className={styles.accountNote}>
              Menu bên trái bám theo từng section của landing thật để bạn nhảy nhanh tới đúng
              khối cần sửa thay vì phải cuộn một form dài.
            </p>
          </div>

          <div className={styles.landingEditorMetaCard}>
            <div className={styles.landingEditorMetaTitle}>Phần đồng bộ từ khóa học</div>
            <p className={styles.accountNote}>
              Tên gói, mô tả, giá, thời lượng và danh sách môn hiển thị ở roadmap/pricing luôn
              lấy từ phần Khóa học trong admin.
            </p>
            <Link
              href="/admin/courses"
              className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
            >
              Mở quản lý khóa học
            </Link>
          </div>

          <nav className={styles.landingEditorNav}>
            {LANDING_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`${styles.landingEditorNavItem} ${
                  activeSection === section.id ? styles.landingEditorNavItemActive : ''
                }`}
                onClick={() => jumpToSection(section.id)}
              >
                <span>{section.label}</span>
                <span className={styles.landingEditorNavBadge}>{section.badge}</span>
              </button>
            ))}
          </nav>
        </aside>

        <form
          id="landing-editor-form"
          className={styles.contentEditor}
          onSubmit={handleSubmit}
        >
        <section
          id="landing-section-header"
          className={`${styles.sectionCard} ${styles.landingEditorSection}`}
        >
          <div className={styles.landingEditorSectionHead}>
            <div>
              <div className={styles.sectionCardHeader}>Header</div>
              <p className={styles.landingEditorSectionLead}>
                Chỉnh nhãn điều hướng và CTA ở phần đầu landing.
              </p>
            </div>
            <span className={styles.landingEditorSectionBadge}>Menu</span>
          </div>
          <div className={styles.accountSection}>
            <div className={styles.contentEditorGrid}>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Nhãn Lộ trình</span>
                <input
                  className={styles.formInput}
                  value={content.header.roadmapLabel}
                  onChange={(event) =>
                    updateSection('header', 'roadmapLabel', event.target.value)
                  }
                />
              </label>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Nhãn FAQ</span>
                <input
                  className={styles.formInput}
                  value={content.header.faqLabel}
                  onChange={(event) => updateSection('header', 'faqLabel', event.target.value)}
                />
              </label>
            </div>

            <label className={styles.contentEditorCard}>
              <span className={styles.formLabel}>CTA trên header</span>
              <input
                className={styles.formInput}
                value={content.header.ctaLabel}
                onChange={(event) => updateSection('header', 'ctaLabel', event.target.value)}
              />
            </label>
          </div>
        </section>

        <section
          id="landing-section-hero"
          className={`${styles.sectionCard} ${styles.landingEditorSection}`}
        >
          <div className={styles.landingEditorSectionHead}>
            <div>
              <div className={styles.sectionCardHeader}>Hero</div>
              <p className={styles.landingEditorSectionLead}>
                Thông điệp đầu trang, CTA và trust points.
              </p>
            </div>
            <span className={styles.landingEditorSectionBadge}>Banner</span>
          </div>
          <div className={styles.accountSection}>
            <div className={styles.contentEditorGrid}>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Eyebrow</span>
                <input
                  className={styles.formInput}
                  value={content.hero.eyebrow}
                  onChange={(event) => updateSection('hero', 'eyebrow', event.target.value)}
                />
              </label>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Tiêu đề</span>
                <input
                  className={styles.formInput}
                  value={content.hero.title}
                  onChange={(event) => updateSection('hero', 'title', event.target.value)}
                />
              </label>
            </div>

            <label className={styles.contentEditorCard}>
              <span className={styles.formLabel}>Mô tả</span>
              <textarea
                className={styles.formTextarea}
                rows={4}
                value={content.hero.description}
                onChange={(event) => updateSection('hero', 'description', event.target.value)}
              />
            </label>

            <div className={styles.contentEditorGrid}>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>CTA chính</span>
                <input
                  className={styles.formInput}
                  value={content.hero.primaryCtaLabel}
                  onChange={(event) =>
                    updateSection('hero', 'primaryCtaLabel', event.target.value)
                  }
                />
              </label>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>CTA phụ</span>
                <input
                  className={styles.formInput}
                  value={content.hero.secondaryCtaLabel}
                  onChange={(event) =>
                    updateSection('hero', 'secondaryCtaLabel', event.target.value)
                  }
                />
              </label>
            </div>

            <label className={styles.contentEditorCard}>
              <span className={styles.formLabel}>Trust items</span>
              <textarea
                className={styles.formTextarea}
                rows={4}
                value={arrayToTextarea(content.hero.trustItems)}
                onChange={(event) => updateArrayField('hero', 'trustItems', event.target.value)}
              />
              <span className={styles.contentEditorHint}>Mỗi dòng là một item.</span>
            </label>
          </div>
        </section>

        <section
          id="landing-section-solution"
          className={`${styles.sectionCard} ${styles.landingEditorSection}`}
        >
          <div className={styles.landingEditorSectionHead}>
            <div>
              <div className={styles.sectionCardHeader}>Positioning / Solution</div>
              <p className={styles.landingEditorSectionLead}>
                Thông điệp định vị, so sánh trước/sau và các trụ tư duy.
              </p>
            </div>
            <span className={styles.landingEditorSectionBadge}>Story</span>
          </div>
          <div className={styles.accountSection}>
            <div className={styles.contentEditorGrid}>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Tiêu đề section</span>
                <input
                  className={styles.formInput}
                  value={content.solution.title}
                  onChange={(event) => updateSection('solution', 'title', event.target.value)}
                />
              </label>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Subtitle</span>
                <input
                  className={styles.formInput}
                  value={content.solution.subtitle}
                  onChange={(event) => updateSection('solution', 'subtitle', event.target.value)}
                />
              </label>
            </div>

            <div className={styles.contentEditorGrid}>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Cột trước</span>
                <input
                  className={styles.formInput}
                  value={content.solution.beforeTitle}
                  onChange={(event) =>
                    updateSection('solution', 'beforeTitle', event.target.value)
                  }
                />
                <textarea
                  className={styles.formTextarea}
                  rows={5}
                  value={arrayToTextarea(content.solution.beforeItems)}
                  onChange={(event) =>
                    updateArrayField('solution', 'beforeItems', event.target.value)
                  }
                />
              </label>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Cột sau</span>
                <input
                  className={styles.formInput}
                  value={content.solution.afterTitle}
                  onChange={(event) =>
                    updateSection('solution', 'afterTitle', event.target.value)
                  }
                />
                <textarea
                  className={styles.formTextarea}
                  rows={5}
                  value={arrayToTextarea(content.solution.afterItems)}
                  onChange={(event) =>
                    updateArrayField('solution', 'afterItems', event.target.value)
                  }
                />
              </label>
            </div>

            <div className={styles.contentEditorStack}>
              {content.solution.pillars.map((item, index) => (
                <div key={index} className={styles.contentEditorCard}>
                  <div className={styles.contentEditorHeader}>Pillar {index + 1}</div>
                  <div className={styles.contentEditorGrid}>
                    <label>
                      <span className={styles.formLabel}>Icon</span>
                      <input
                        className={styles.formInput}
                        value={item.icon}
                        onChange={(event) =>
                          updateSolutionPillar(index, 'icon', event.target.value)
                        }
                      />
                    </label>
                    <label>
                      <span className={styles.formLabel}>Tiêu đề</span>
                      <input
                        className={styles.formInput}
                        value={item.title}
                        onChange={(event) =>
                          updateSolutionPillar(index, 'title', event.target.value)
                        }
                      />
                    </label>
                  </div>
                  <label>
                    <span className={styles.formLabel}>Mô tả</span>
                    <textarea
                      className={styles.formTextarea}
                      rows={3}
                      value={item.description}
                      onChange={(event) =>
                        updateSolutionPillar(index, 'description', event.target.value)
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="landing-section-catalog"
          className={`${styles.sectionCard} ${styles.landingEditorSection}`}
        >
          <div className={styles.landingEditorSectionHead}>
            <div>
              <div className={styles.sectionCardHeader}>Roadmap</div>
              <p className={styles.landingEditorSectionLead}>
                Khối này chỉ đọc để đảm bảo landing luôn khớp với dữ liệu khóa học thật.
              </p>
            </div>
            <span className={styles.landingEditorSectionBadge}>Sync</span>
          </div>
          <div className={styles.accountSection}>
            <div className={styles.contentEditorCard}>
              <div className={styles.contentEditorHeader}>Roadmap</div>
              <p className={styles.accountNote}>
                Level, mô tả, học phí, thời lượng và danh sách môn đang lấy trực tiếp từ phần
                Khóa học trong admin.
              </p>
            </div>
          </div>
        </section>

        <section
          id="landing-section-method"
          className={`${styles.sectionCard} ${styles.landingEditorSection}`}
        >
          <div className={styles.landingEditorSectionHead}>
            <div>
              <div className={styles.sectionCardHeader}>Method</div>
              <p className={styles.landingEditorSectionLead}>
                Cách học, nhịp mentor và trải nghiệm kiểu studio nhỏ.
              </p>
            </div>
            <span className={styles.landingEditorSectionBadge}>Studio</span>
          </div>
          <div className={styles.accountSection}>
            <div className={styles.contentEditorGrid}>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Tiêu đề section</span>
                <input
                  className={styles.formInput}
                  value={content.method.title}
                  onChange={(event) => updateSection('method', 'title', event.target.value)}
                />
              </label>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Subtitle</span>
                <input
                  className={styles.formInput}
                  value={content.method.subtitle}
                  onChange={(event) => updateSection('method', 'subtitle', event.target.value)}
                />
              </label>
            </div>

            <div className={styles.contentEditorStack}>
              {content.method.items.map((item, index) => (
                <div key={index} className={styles.contentEditorCard}>
                  <div className={styles.contentEditorHeader}>Method item {index + 1}</div>
                  <div className={styles.contentEditorGrid}>
                    <label>
                      <span className={styles.formLabel}>Icon</span>
                      <input
                        className={styles.formInput}
                        value={item.icon}
                        onChange={(event) =>
                          updateObjectItem('method', index, 'icon', event.target.value)
                        }
                      />
                    </label>
                    <label>
                      <span className={styles.formLabel}>Tiêu đề</span>
                      <input
                        className={styles.formInput}
                        value={item.title}
                        onChange={(event) =>
                          updateObjectItem('method', index, 'title', event.target.value)
                        }
                      />
                    </label>
                  </div>
                  <label>
                    <span className={styles.formLabel}>Mô tả</span>
                    <textarea
                      className={styles.formTextarea}
                      rows={3}
                      value={item.description}
                      onChange={(event) =>
                        updateObjectItem('method', index, 'description', event.target.value)
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="landing-section-results"
          className={`${styles.sectionCard} ${styles.landingEditorSection}`}
        >
          <div className={styles.landingEditorSectionHead}>
            <div>
              <div className={styles.sectionCardHeader}>Results</div>
              <p className={styles.landingEditorSectionLead}>
                Khối before/after và các output mà học viên có thể tạo ra.
              </p>
            </div>
            <span className={styles.landingEditorSectionBadge}>Outcome</span>
          </div>
          <div className={styles.accountSection}>
            <div className={styles.contentEditorGrid}>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Tiêu đề section</span>
                <input
                  className={styles.formInput}
                  value={content.results.title}
                  onChange={(event) => updateSection('results', 'title', event.target.value)}
                />
              </label>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Subtitle</span>
                <input
                  className={styles.formInput}
                  value={content.results.subtitle}
                  onChange={(event) => updateSection('results', 'subtitle', event.target.value)}
                />
              </label>
            </div>

            <div className={styles.contentEditorGrid}>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Cột trước</span>
                <input
                  className={styles.formInput}
                  value={content.results.beforeTitle}
                  onChange={(event) =>
                    updateSection('results', 'beforeTitle', event.target.value)
                  }
                />
                <textarea
                  className={styles.formTextarea}
                  rows={5}
                  value={arrayToTextarea(content.results.beforeItems)}
                  onChange={(event) =>
                    updateArrayField('results', 'beforeItems', event.target.value)
                  }
                />
              </label>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Cột sau</span>
                <input
                  className={styles.formInput}
                  value={content.results.afterTitle}
                  onChange={(event) =>
                    updateSection('results', 'afterTitle', event.target.value)
                  }
                />
                <textarea
                  className={styles.formTextarea}
                  rows={5}
                  value={arrayToTextarea(content.results.afterItems)}
                  onChange={(event) =>
                    updateArrayField('results', 'afterItems', event.target.value)
                  }
                />
              </label>
            </div>

            <div className={styles.contentEditorStack}>
              {content.results.showcaseItems.map((item, index) => (
                <div key={index} className={styles.contentEditorCard}>
                  <div className={styles.contentEditorHeader}>Showcase {index + 1}</div>
                  <div className={styles.contentEditorGrid}>
                    <label>
                      <span className={styles.formLabel}>Icon</span>
                      <input
                        className={styles.formInput}
                        value={item.icon}
                        onChange={(event) =>
                          updateArrayObjectItem(
                            'results',
                            'showcaseItems',
                            index,
                            'icon',
                            event.target.value
                          )
                        }
                      />
                    </label>
                    <label>
                      <span className={styles.formLabel}>Tiêu đề</span>
                      <input
                        className={styles.formInput}
                        value={item.title}
                        onChange={(event) =>
                          updateArrayObjectItem(
                            'results',
                            'showcaseItems',
                            index,
                            'title',
                            event.target.value
                          )
                        }
                      />
                    </label>
                  </div>
                  <label>
                    <span className={styles.formLabel}>Mô tả</span>
                    <textarea
                      className={styles.formTextarea}
                      rows={3}
                      value={item.description}
                      onChange={(event) =>
                        updateArrayObjectItem(
                          'results',
                          'showcaseItems',
                          index,
                          'description',
                          event.target.value
                        )
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="landing-section-commitment"
          className={`${styles.sectionCard} ${styles.landingEditorSection}`}
        >
          <div className={styles.landingEditorSectionHead}>
            <div>
              <div className={styles.sectionCardHeader}>Commitment</div>
              <p className={styles.landingEditorSectionLead}>
                Các cam kết có thể kiểm chứng và phần bảo đảm trải nghiệm.
              </p>
            </div>
            <span className={styles.landingEditorSectionBadge}>Trust</span>
          </div>
          <div className={styles.accountSection}>
            <div className={styles.contentEditorGrid}>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Tiêu đề section</span>
                <input
                  className={styles.formInput}
                  value={content.commitment.title}
                  onChange={(event) =>
                    updateSection('commitment', 'title', event.target.value)
                  }
                />
              </label>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Subtitle</span>
                <input
                  className={styles.formInput}
                  value={content.commitment.subtitle}
                  onChange={(event) =>
                    updateSection('commitment', 'subtitle', event.target.value)
                  }
                />
              </label>
            </div>

            <div className={styles.contentEditorStack}>
              {content.commitment.items.map((item, index) => (
                <div key={index} className={styles.contentEditorCard}>
                  <div className={styles.contentEditorHeader}>Commitment item {index + 1}</div>
                  <div className={styles.contentEditorGrid}>
                    <label>
                      <span className={styles.formLabel}>Icon</span>
                      <input
                        className={styles.formInput}
                        value={item.icon}
                        onChange={(event) =>
                          updateObjectItem('commitment', index, 'icon', event.target.value)
                        }
                      />
                    </label>
                    <label>
                      <span className={styles.formLabel}>Tiêu đề</span>
                      <input
                        className={styles.formInput}
                        value={item.title}
                        onChange={(event) =>
                          updateObjectItem('commitment', index, 'title', event.target.value)
                        }
                      />
                    </label>
                  </div>
                  <label>
                    <span className={styles.formLabel}>Mô tả</span>
                    <textarea
                      className={styles.formTextarea}
                      rows={3}
                      value={item.description}
                      onChange={(event) =>
                        updateObjectItem('commitment', index, 'description', event.target.value)
                      }
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className={styles.contentEditorGrid}>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Tiêu đề guarantee</span>
                <input
                  className={styles.formInput}
                  value={content.commitment.guaranteeTitle}
                  onChange={(event) =>
                    updateSection('commitment', 'guaranteeTitle', event.target.value)
                  }
                />
              </label>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Mô tả guarantee</span>
                <textarea
                  className={styles.formTextarea}
                  rows={3}
                  value={content.commitment.guaranteeText}
                  onChange={(event) =>
                    updateSection('commitment', 'guaranteeText', event.target.value)
                  }
                />
              </label>
            </div>
          </div>
        </section>

        <section
          id="landing-section-faq"
          className={`${styles.sectionCard} ${styles.landingEditorSection}`}
        >
          <div className={styles.landingEditorSectionHead}>
            <div>
              <div className={styles.sectionCardHeader}>FAQ</div>
              <p className={styles.landingEditorSectionLead}>
                Các câu hỏi thường gặp ở cuối landing.
              </p>
            </div>
            <span className={styles.landingEditorSectionBadge}>Answer</span>
          </div>
          <div className={styles.accountSection}>
            <div className={styles.contentEditorGrid}>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Tiêu đề section</span>
                <input
                  className={styles.formInput}
                  value={content.faq.title}
                  onChange={(event) => updateSection('faq', 'title', event.target.value)}
                />
              </label>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Subtitle</span>
                <input
                  className={styles.formInput}
                  value={content.faq.subtitle}
                  onChange={(event) => updateSection('faq', 'subtitle', event.target.value)}
                />
              </label>
            </div>

            <div className={styles.contentEditorStack}>
              {content.faq.items.map((item, index) => (
                <div key={index} className={styles.contentEditorCard}>
                  <div className={styles.contentEditorHeader}>FAQ {index + 1}</div>
                  <label>
                    <span className={styles.formLabel}>Câu hỏi</span>
                    <input
                      className={styles.formInput}
                      value={item.question}
                      onChange={(event) =>
                        updateObjectItem('faq', index, 'question', event.target.value)
                      }
                    />
                  </label>
                  <label>
                    <span className={styles.formLabel}>Trả lời</span>
                    <textarea
                      className={styles.formTextarea}
                      rows={4}
                      value={item.answer}
                      onChange={(event) =>
                        updateObjectItem('faq', index, 'answer', event.target.value)
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="landing-section-cta"
          className={`${styles.sectionCard} ${styles.landingEditorSection}`}
        >
          <div className={styles.landingEditorSectionHead}>
            <div>
              <div className={styles.sectionCardHeader}>CTA cuối trang</div>
              <p className={styles.landingEditorSectionLead}>
                Khối chốt cuối trang và form nhận tư vấn.
              </p>
            </div>
            <span className={styles.landingEditorSectionBadge}>Lead</span>
          </div>
          <div className={styles.accountSection}>
            <label className={styles.contentEditorCard}>
              <span className={styles.formLabel}>Tiêu đề</span>
              <input
                className={styles.formInput}
                value={content.cta.title}
                onChange={(event) => updateSection('cta', 'title', event.target.value)}
              />
            </label>
            <label className={styles.contentEditorCard}>
              <span className={styles.formLabel}>Mô tả</span>
              <textarea
                className={styles.formTextarea}
                rows={4}
                value={content.cta.description}
                onChange={(event) => updateSection('cta', 'description', event.target.value)}
              />
            </label>
            <label className={styles.contentEditorCard}>
              <span className={styles.formLabel}>Benefits</span>
              <textarea
                className={styles.formTextarea}
                rows={4}
                value={arrayToTextarea(content.cta.benefits)}
                onChange={(event) => updateArrayField('cta', 'benefits', event.target.value)}
              />
              <span className={styles.contentEditorHint}>Mỗi dòng là một benefit.</span>
            </label>
            <div className={styles.contentEditorGrid}>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Tiêu đề form</span>
                <input
                  className={styles.formInput}
                  value={content.cta.formTitle}
                  onChange={(event) => updateSection('cta', 'formTitle', event.target.value)}
                />
              </label>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Nhãn nút submit</span>
                <input
                  className={styles.formInput}
                  value={content.cta.submitLabel}
                  onChange={(event) => updateSection('cta', 'submitLabel', event.target.value)}
                />
              </label>
            </div>
            <label className={styles.contentEditorCard}>
              <span className={styles.formLabel}>Ghi chú form</span>
              <textarea
                className={styles.formTextarea}
                rows={3}
                value={content.cta.formNote}
                onChange={(event) => updateSection('cta', 'formNote', event.target.value)}
              />
            </label>
          </div>
        </section>

        <section
          id="landing-section-contact"
          className={`${styles.sectionCard} ${styles.landingEditorSection}`}
        >
          <div className={styles.landingEditorSectionHead}>
            <div>
              <div className={styles.sectionCardHeader}>Direct Contact</div>
              <p className={styles.landingEditorSectionLead}>
                Chỉnh sửa khối thông tin Liên hệ trực tiếp. Khối này sẽ tự động lấy các nút Liên hệ từ mục Footer.
              </p>
            </div>
            <span className={styles.landingEditorSectionBadge}>Direct</span>
          </div>
          <div className={styles.accountSection}>
            <div className={styles.contentEditorGrid}>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Tiêu đề chính</span>
                <input
                  className={styles.formInput}
                  value={content.contactDirect?.title || ''}
                  onChange={(event) => updateSection('contactDirect', 'title', event.target.value)}
                />
              </label>
            </div>
            <label className={styles.contentEditorCard}>
              <span className={styles.formLabel}>Tiêu đề phụ (mô tả)</span>
              <textarea
                className={styles.formTextarea}
                rows={3}
                value={content.contactDirect?.subtitle || ''}
                onChange={(event) => updateSection('contactDirect', 'subtitle', event.target.value)}
              />
            </label>
          </div>
        </section>

        <section
          id="landing-section-footer"
          className={`${styles.sectionCard} ${styles.landingEditorSection}`}
        >
          <div className={styles.landingEditorSectionHead}>
            <div>
              <div className={styles.sectionCardHeader}>Footer</div>
              <p className={styles.landingEditorSectionLead}>
                Chỉnh phần brand, quick links, contact links và copyright ở cuối trang.
              </p>
            </div>
            <span className={styles.landingEditorSectionBadge}>Brand</span>
          </div>
          <div className={styles.accountSection}>
            <div className={styles.contentEditorGrid}>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Logo subtitle</span>
                <input
                  className={styles.formInput}
                  value={content.footer.logoSubtitle}
                  onChange={(event) =>
                    updateSection('footer', 'logoSubtitle', event.target.value)
                  }
                />
              </label>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Tiêu đề cột Lộ trình</span>
                <input
                  className={styles.formInput}
                  value={content.footer.roadmapTitle}
                  onChange={(event) =>
                    updateSection('footer', 'roadmapTitle', event.target.value)
                  }
                />
              </label>
            </div>

            <label className={styles.contentEditorCard}>
              <span className={styles.formLabel}>Mô tả brand</span>
              <textarea
                className={styles.formTextarea}
                rows={4}
                value={content.footer.description}
                onChange={(event) => updateSection('footer', 'description', event.target.value)}
              />
            </label>

            <div className={styles.contentEditorGrid}>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Tiêu đề cột Thông tin</span>
                <input
                  className={styles.formInput}
                  value={content.footer.quickLinksTitle}
                  onChange={(event) =>
                    updateSection('footer', 'quickLinksTitle', event.target.value)
                  }
                />
              </label>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Tiêu đề cột Liên hệ</span>
                <input
                  className={styles.formInput}
                  value={content.footer.contactTitle}
                  onChange={(event) =>
                    updateSection('footer', 'contactTitle', event.target.value)
                  }
                />
              </label>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Nhãn link FAQ</span>
                <input
                  className={styles.formInput}
                  value={content.footer.faqLabel}
                  onChange={(event) => updateSection('footer', 'faqLabel', event.target.value)}
                />
              </label>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Nhãn link Commitment</span>
                <input
                  className={styles.formInput}
                  value={content.footer.commitmentLabel}
                  onChange={(event) =>
                    updateSection('footer', 'commitmentLabel', event.target.value)
                  }
                />
              </label>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Nhãn link CTA</span>
                <input
                  className={styles.formInput}
                  value={content.footer.ctaLabel}
                  onChange={(event) => updateSection('footer', 'ctaLabel', event.target.value)}
                />
              </label>
              <label className={styles.contentEditorCard}>
                <span className={styles.formLabel}>Copyright</span>
                <input
                  className={styles.formInput}
                  value={content.footer.copyright}
                  onChange={(event) =>
                    updateSection('footer', 'copyright', event.target.value)
                  }
                />
              </label>
            </div>

            <div className={styles.contentEditorStack}>
              {content.footer.contactLinks.map((item, index) => (
                <div key={index} className={styles.contentEditorCard}>
                  <div className={styles.contentEditorHeader}>Contact link {index + 1}</div>
                  <div className={styles.contentEditorGrid}>
                    <label>
                      <span className={styles.formLabel}>Nhãn</span>
                      <input
                        className={styles.formInput}
                        value={item.label}
                        onChange={(event) =>
                          updateFooterLink(index, 'label', event.target.value)
                        }
                      />
                    </label>
                    <label>
                      <span className={styles.formLabel}>URL / href</span>
                      <input
                        className={styles.formInput}
                        value={item.href}
                        onChange={(event) => updateFooterLink(index, 'href', event.target.value)}
                      />
                    </label>
                  </div>
                  <div className={styles.accountActions}>
                    <button
                      type="button"
                      className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
                      onClick={() => removeFooterLink(index)}
                      disabled={content.footer.contactLinks.length <= 1}
                    >
                      Xóa link này
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.accountActions}>
              <button
                type="button"
                className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
                onClick={addFooterLink}
              >
                Thêm contact link
              </button>
            </div>
          </div>
        </section>

        <div className={styles.quickActions}>
          <button
            type="button"
            className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
            onClick={() => fetchContent()}
            disabled={saving}
          >
            Tải lại từ server
          </button>
          <button
            type="submit"
            className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
            disabled={saving}
          >
            {saving ? 'Đang lưu...' : 'Lưu landing content'}
          </button>
        </div>
        </form>
      </div>
    </>
  )
}
