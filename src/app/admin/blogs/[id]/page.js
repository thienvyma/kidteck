'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import styles from '../../admin.module.css'

export default function BlogEditorPage() {
  const router = useRouter()
  const params = useParams()
  const isNew = params.id === 'new'

  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    cover_image_url: '',
    content: '',
    is_published: false,
  })

  useEffect(() => {
    if (isNew) return

    async function fetchBlog() {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        setForm({
          title: data.title || '',
          slug: data.slug || '',
          description: data.description || '',
          cover_image_url: data.cover_image_url || '',
          content: data.content || '',
          is_published: data.is_published || false,
        })
      } catch (err) {
        console.error(err)
        setFeedback({ type: 'error', text: 'Không thể tải dữ liệu bài viết.' })
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [isNew, params.id, supabase])

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

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
        content: form.content,
        is_published: form.is_published,
        ...(form.is_published && { published_at: new Date().toISOString() })
      }

      let error;
      if (isNew) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          payload.author_id = session.user.id
        }
        
        const res = await supabase.from('blogs').insert([payload]).select().single()
        error = res.error
        if (!error && res.data) {
          router.replace(`/admin/blogs/${res.data.id}`)
          return 
        }
      } else {
        const res = await supabase.from('blogs').update(payload).eq('id', params.id)
        error = res.error
      }

      if (error) throw error

      setFeedback({ type: 'success', text: 'Lưu bài viết thành công!' })
    } catch (err) {
      console.error(err)
      setFeedback({ type: 'error', text: err.message || 'Có lỗi xảy ra khi lưu bài viết.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className={styles.pageHeader}>Đang tải dữ liệu...</div>
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <button 
            type="button" 
            onClick={() => router.push('/admin/blogs')}
            style={{ marginBottom: '8px', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            ← Quay lại danh sách
          </button>
          <h2 className={styles.pageTitle}>{isNew ? 'Viết bài mới' : 'Chỉnh sửa bài viết'}</h2>
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

      <form className={styles.curriculumForm} onSubmit={handleSave} style={{ maxWidth: '800px' }}>
        <section className={styles.curriculumPanel} style={{ marginBottom: '24px' }}>
          <div className={styles.curriculumPanelHeader}>
            <h3>Thông tin SEO & Cơ bản</h3>
          </div>
          
          <div className={styles.curriculumFormGrid}>
            <label className={styles.formField} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.formLabel}>Tiêu đề bài viết (Title)</span>
              <input
                className={styles.formInput}
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="Ví dụ: Học AI từ đâu cho người mới bắt đầu?"
                required
              />
            </label>

            <label className={styles.formField} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.formLabel}>Đường dẫn tĩnh (Slug)</span>
              <input
                className={styles.formInput}
                value={form.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="hoc-ai-tu-dau-cho-nguoi-moi-bat-dau"
                required
                style={{ fontFamily: 'monospace' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '4px' }}>
                Đây sẽ là URL bài viết: aigenlabs.vn/blog/<strong>slug-cua-ban</strong>
              </span>
            </label>

            <label className={styles.formField} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.formLabel}>Mô tả ngắn (Description / Meta SEO)</span>
              <textarea
                className={styles.formTextarea}
                rows={3}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Đoạn văn tóm tắt nội dung bài viết, sẽ hiển thị trên Google và Facebook..."
              />
            </label>

            <label className={styles.formField} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.formLabel}>Ảnh Thumbnail URL (Tuỳ chọn)</span>
              <input
                className={styles.formInput}
                value={form.cover_image_url}
                onChange={(e) => handleChange('cover_image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </label>

            <label className={styles.formField}>
              <span className={styles.formLabel}>Trạng thái xuất bản</span>
              <select
                className={styles.formInput}
                value={form.is_published ? 'published' : 'draft'}
                onChange={(e) => handleChange('is_published', e.target.value === 'published')}
              >
                <option value="draft">Bản nháp (Đang viết)</option>
                <option value="published">Xuất bản (Public)</option>
              </select>
            </label>
          </div>
        </section>

        <section className={styles.curriculumPanel} style={{ marginBottom: '24px' }}>
          <div className={styles.curriculumPanelHeader}>
            <h3>Nội dung bài viết (Markdown / HTML)</h3>
            <p style={{ fontSize: '0.85rem' }}>Hỗ trợ cú pháp Markdown. Ví dụ: # Tiêu đề 1, **In đậm**</p>
          </div>
          
          <label className={styles.formField}>
            <textarea
              className={styles.formTextarea}
              rows={25}
              value={form.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Bắt đầu viết nội dung tại đây..."
              style={{ fontFamily: 'monospace', lineHeight: '1.6' }}
              required
            />
          </label>
        </section>

        <div className={styles.curriculumFormActions} style={{ position: 'sticky', bottom: '20px', backgroundColor: 'var(--color-bg)', padding: '16px 0', borderTop: '1px solid var(--color-border)' }}>
          <button
            type="submit"
            className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
            disabled={saving}
            style={{ width: '200px', padding: '12px', fontSize: '1rem' }}
          >
            {saving ? 'Đang lưu...' : 'Lưu bài viết'}
          </button>
        </div>
      </form>
    </>
  )
}
