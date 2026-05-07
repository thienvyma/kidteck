'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'
import { normalizeImageUrl } from '@/lib/blog-media'
import styles from '../../admin.module.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

function parseGoogleDriveLink(url) {
  if (!url) return url

  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
  const match = url.match(driveRegex)
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`
  }

  const ucRegex = /drive\.google\.com\/uc\?.*?id=([a-zA-Z0-9_-]+)/
  const matchUc = url.match(ucRegex)
  if (matchUc && matchUc[1]) {
    return `https://lh3.googleusercontent.com/d/${matchUc[1]}`
  }

  const openRegex = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/
  const matchOpen = url.match(openRegex)
  if (matchOpen && matchOpen[1]) {
    return `https://lh3.googleusercontent.com/d/${matchOpen[1]}`
  }

  return url
}

export default function BlogEditorPage() {
  const router = useRouter()
  const params = useParams()
  const isNew = params.id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const quillRef = useRef(null)

  const imageHandler = () => {
    const url = window.prompt('Dan duong link anh (Google Drive hoac link truc tiep) vao day:')
    if (!url) return
    const parsedUrl = parseGoogleDriveLink(url)
    const editor = quillRef.current?.getEditor?.()
    if (!editor) return
    const range = editor.getSelection(true)
    editor.insertEmbed(range.index, 'image', parsedUrl)
    editor.setSelection(range.index + 1)
  }

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, 4, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'link', 'image'],
          ['clean'],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    []
  )

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    cover_image_url: '',
    cover_image_mobile_url: '',
    tags: '',
    content: '',
    is_published: false,
  })
  const coverPreviewUrl = normalizeImageUrl(form.cover_image_url)
  const coverMobilePreviewUrl = normalizeImageUrl(form.cover_image_mobile_url)

  useEffect(() => {
    if (isNew) return

    async function fetchBlog() {
      try {
        const response = await fetch(`/api/admin/blogs/${params.id}`, {
          cache: 'no-store',
        })
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error || 'Khong the tai du lieu bai viet')
        }

        const data = payload.blog
        setForm({
          title: data.title || '',
          slug: data.slug || '',
          description: data.description || '',
          cover_image_url: data.cover_image_url || '',
          cover_image_mobile_url: data.cover_image_mobile_url || '',
          tags: (data.tags || []).join(', '),
          content: data.content || '',
          is_published: data.is_published || false,
        })
      } catch (err) {
        console.error(err)
        setFeedback({ type: 'error', text: 'Khong the tai du lieu bai viet.' })
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [isNew, params.id])

  const handleChange = (key, value) => {
    if (key === 'cover_image_url' || key === 'cover_image_mobile_url') {
      value = parseGoogleDriveLink(value)
    }

    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleTitleBlur = () => {
    if (!form.slug && form.title) {
      const generatedSlug = form.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

      handleChange('slug', generatedSlug)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)

    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        description: form.description,
        cover_image_url: form.cover_image_url,
        cover_image_mobile_url: form.cover_image_mobile_url,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        content: form.content,
        is_published: form.is_published,
        ...(form.is_published && { published_at: new Date().toISOString() }),
      }

      const response = await fetch(isNew ? '/api/admin/blogs' : `/api/admin/blogs/${params.id}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Co loi xay ra khi luu bai viet.')
      }

      if (isNew && result.blog?.id) {
        router.replace(`/admin/blogs/${result.blog.id}`)
        return
      }

      setFeedback({ type: 'success', text: 'Luu bai viet thanh cong!' })
    } catch (err) {
      console.error(err)
      setFeedback({ type: 'error', text: err.message || 'Co loi xay ra khi luu bai viet.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className={styles.pageHeader}>Dang tai du lieu...</div>
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <button
            type="button"
            onClick={() => router.push('/admin/blogs')}
            style={{
              marginBottom: '8px',
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ← Quay lai danh sach
          </button>
          <h2 className={styles.pageTitle}>{isNew ? 'Viet bai moi' : 'Chinh sua bai viet'}</h2>
        </div>
      </div>

      {feedback && (
        <div
          className={`${styles.feedbackBanner} ${
            feedback.type === 'success' ? styles.feedbackBannerSuccess : styles.feedbackBannerError
          }`}
        >
          {feedback.text}
        </div>
      )}

      <form className={styles.curriculumForm} onSubmit={handleSave} style={{ maxWidth: '900px' }}>
        <section className={styles.curriculumPanel} style={{ marginBottom: '24px' }}>
          <div className={styles.curriculumPanelHeader}>
            <h3>1. Thong tin SEO & Nhan dien</h3>
          </div>

          <div className={styles.curriculumFormGrid}>
            <label className={styles.formField} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.formLabel}>Tieu de bai viet (Title)</span>
              <input
                className={styles.formInput}
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="Vi du: Hoc AI tu dau cho nguoi moi bat dau?"
                required
              />
            </label>

            <label className={styles.formField} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.formLabel}>Duong dan tham khao (Slug tu dong)</span>
              <input
                className={styles.formInput}
                value={form.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="hoc-ai-tu-dau-cho-nguoi-moi-bat-dau"
                required
                style={{ fontFamily: 'monospace' }}
              />
            </label>

            <label className={styles.formField}>
              <span className={styles.formLabel}>Ảnh ngang (tablet / PC)</span>
              <input
                className={styles.formInput}
                value={form.cover_image_url}
                onChange={(e) => handleChange('cover_image_url', e.target.value)}
                placeholder="Khuyến nghị 16:9, ví dụ 1600x900"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '4px' }}>
                Hiển thị cho tablet và PC. Hỗ trợ link chia sẻ Google Drive hoặc link ảnh trực tiếp.
              </span>
              {coverPreviewUrl && (
                <div
                  style={{
                    marginTop: '12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '160px',
                      aspectRatio: '16 / 9',
                      background:
                        'linear-gradient(135deg, rgba(108, 92, 231, 0.08), rgba(0, 210, 211, 0.06)), #f3f4f6',
                    }}
                  >
                    <Image
                      src={coverPreviewUrl}
                      alt="Cover Preview"
                      fill
                      sizes="800px"
                      referrerPolicy="no-referrer"
                      unoptimized
                      style={{ objectFit: 'contain', objectPosition: 'center' }}
                    />
                  </div>
                </div>
              )}
            </label>

            <label className={styles.formField}>
              <span className={styles.formLabel}>Ảnh dọc (mobile)</span>
              <input
                className={styles.formInput}
                value={form.cover_image_mobile_url}
                onChange={(e) => handleChange('cover_image_mobile_url', e.target.value)}
                placeholder="Khuyến nghị 4:5, ví dụ 1080x1350"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '4px' }}>
                Hiển thị riêng trên mobile. Bỏ trống nếu muốn dùng lại ảnh ngang.
              </span>
              {coverMobilePreviewUrl && (
                <div
                  style={{
                    marginTop: '12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '260px',
                      aspectRatio: '4 / 5',
                      background:
                        'linear-gradient(135deg, rgba(108, 92, 231, 0.08), rgba(0, 210, 211, 0.06)), #f3f4f6',
                    }}
                  >
                    <Image
                      src={coverMobilePreviewUrl}
                      alt="Mobile Cover Preview"
                      fill
                      sizes="420px"
                      referrerPolicy="no-referrer"
                      unoptimized
                      style={{ objectFit: 'contain', objectPosition: 'center' }}
                    />
                  </div>
                </div>
              )}
            </label>

            <label className={styles.formField} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.formLabel}>Chu de / Tags (Tuy chon)</span>
              <input
                className={styles.formInput}
                value={form.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="Vi du: AI & Tech, Nhap mon, Lap trinh (phan cach bang dau phay)"
              />
            </label>

            <label className={styles.formField} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.formLabel}>Mo ta ngan SEO</span>
              <textarea
                className={styles.formTextarea}
                rows={3}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Tom tat noi dung bai viet, hien thi khi share len mang xa hoi..."
              />
            </label>

            <label className={styles.formField}>
              <span className={styles.formLabel}>Trang thai xuat ban</span>
              <select
                className={styles.formInput}
                value={form.is_published ? 'published' : 'draft'}
                onChange={(e) => handleChange('is_published', e.target.value === 'published')}
              >
                <option value="draft">Ban nhap (Luon an)</option>
                <option value="published">Xuat ban cho cong chung</option>
              </select>
            </label>
          </div>
        </section>

        <section
          className={styles.curriculumPanel}
          style={{ marginBottom: '24px', padding: '0', overflow: 'hidden' }}
        >
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--color-border)',
              padding: '0 16px',
              background: 'var(--color-gray-50)',
              alignItems: 'center',
            }}
          >
            <h3
              style={{
                margin: 0,
                padding: '16px 8px',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--color-slate-800)',
              }}
            >
              2. Soan thao Noi dung (Giao dien chuan Word)
            </h3>
            <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--color-gray-500)' }}>
              Ho tro boi den de dinh dang va chen anh truc tiep
            </span>
          </div>

          <div style={{ padding: '0', backgroundColor: '#fff' }} className="quill-editor-wrapper">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={form.content}
              onChange={(val) => handleChange('content', val)}
              style={{ height: '600px', border: 'none' }}
              placeholder="Bat dau go noi dung bai viet tuyet voi cua ban tai day..."
              modules={modules}
            />
          </div>

          <style jsx global>{`
            .quill-editor-wrapper .ql-container {
              height: 558px !important;
              border: none !important;
              font-family: inherit;
              font-size: 16px;
            }

            .quill-editor-wrapper .ql-toolbar {
              border: none !important;
              border-bottom: 1px solid var(--color-border) !important;
              padding: 12px 16px !important;
              background-color: #fcfcfc;
            }

            .quill-editor-wrapper .ql-editor {
              padding: 24px;
              line-height: 1.7;
            }

            .quill-editor-wrapper .ql-editor img {
              border-radius: 8px;
              margin: 1rem 0;
            }
          `}</style>
        </section>

        <div
          className={styles.curriculumFormActions}
          style={{
            position: 'sticky',
            bottom: '20px',
            backgroundColor: 'var(--color-bg)',
            padding: '16px 0',
            borderTop: '1px solid var(--color-border)',
            justifyContent: 'flex-end',
            display: 'flex',
          }}
        >
          <button
            type="submit"
            className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
            disabled={saving}
            style={{ width: '240px', padding: '14px', fontSize: '1.1rem' }}
          >
            {saving ? 'Dang luu he thong...' : 'Luu lai bai viet'}
          </button>
        </div>
      </form>
    </>
  )
}
