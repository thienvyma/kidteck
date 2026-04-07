'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'
import styles from '../../admin.module.css'
import blogStyles from '@/app/blog/blog.module.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

// Bộ xử lý chuyển link Drive chia sẻ thành link tải ảnh trực tiếp
function parseGoogleDriveLink(url) {
  if (!url) return url
  
  // Lọc định dạng chuẩn: file/d/ID/view
  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
  const match = url.match(driveRegex)
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`
  }
  
  // Lọc định dạng cũ: uc?export=view&id=ID
  const ucRegex = /drive\.google\.com\/uc\?.*?id=([a-zA-Z0-9_-]+)/
  const matchUc = url.match(ucRegex)
  if (matchUc && matchUc[1]) {
    return `https://lh3.googleusercontent.com/d/${matchUc[1]}`
  }

  // Lọc định dạng: open?id=ID
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

  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  
  // Trạng thái tab biên tập (Old state, not really used anymore but kept just in case)
  const [activeTab, setActiveTab] = useState('write') // 'write' or 'preview'
  const quillRef = useRef(null)

  // Custom Quill Image Handler — prompt for URL instead of file upload
  const imageHandler = () => {
    const url = window.prompt("Dán đường link ảnh (Google Drive hoặc link trực tiếp) vào đây:");
    if (!url) return;
    const parsedUrl = parseGoogleDriveLink(url);
    const editor = quillRef.current?.getEditor?.();
    if (!editor) return;
    const range = editor.getSelection(true);
    editor.insertEmbed(range.index, "image", parsedUrl);
    editor.setSelection(range.index + 1);
  }

  const modules = useMemo(() => ({
    toolbar: {
        container: [
            [{ 'header': [2, 3, 4, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['blockquote', 'link', 'image'],
            ['clean']
        ],
        handlers: {
            image: imageHandler
        }
    }
  }), [])

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    cover_image_url: '',
    tags: '',
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
          tags: (data.tags || []).join(', '),
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

  const handleChange = (key, value) => {
    // Đối với URL ảnh bìa, ép parse Google Drive link
    if (key === 'cover_image_url') {
      value = parseGoogleDriveLink(value)
    }

    // KHÔNG sửa HTML content trong onChange — sẽ gây vòng lặp vô hạn với Quill.
    // referrerPolicy được xử lý ở phía hiển thị (blog/[slug]/page.js) thay vì ở đây.

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
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
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

      <form className={styles.curriculumForm} onSubmit={handleSave} style={{ maxWidth: '900px' }}>
        <section className={styles.curriculumPanel} style={{ marginBottom: '24px' }}>
          <div className={styles.curriculumPanelHeader}>
            <h3>1. Thông tin SEO & Nhận diện</h3>
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
              <span className={styles.formLabel}>Đường dẫn tham khảo (Slug tự động)</span>
              <input
                className={styles.formInput}
                value={form.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="hoc-ai-tu-dau-cho-nguoi-moi-bat-dau"
                required
                style={{ fontFamily: 'monospace' }}
              />
            </label>

            <label className={styles.formField} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.formLabel}>Ảnh Thumbnail </span>
              <input
                className={styles.formInput}
                value={form.cover_image_url}
                onChange={(e) => handleChange('cover_image_url', e.target.value)}
                placeholder="Link ảnh .PNG/JPG hoặc copy Link Google Drive dán vào"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)', marginTop: '4px' }}>
                Hỗ trợ dán sẵn link chia sẻ từ Google Drive. Form sẽ tự chuyển thành màng hình hiển thị.
              </span>
              {form.cover_image_url && (
                <div style={{ marginTop: '12px', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={form.cover_image_url} alt="Cover Preview" referrerPolicy="no-referrer" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                </div>
              )}
            </label>

            <label className={styles.formField} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.formLabel}>Chủ đề / Tags (Tùy chọn)</span>
              <input
                className={styles.formInput}
                value={form.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="Ví dụ: AI & Tech, Nhập môn, Lập trình (phân cách bằng dấu phẩy)"
              />
            </label>

            <label className={styles.formField} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.formLabel}>Mô tả ngắn SEO</span>
              <textarea
                className={styles.formTextarea}
                rows={3}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Tóm tắt nội dung bài viết, hiển thị khi share lên mạng xã hội..."
              />
            </label>

            <label className={styles.formField}>
              <span className={styles.formLabel}>Trạng thái xuất bản</span>
              <select
                className={styles.formInput}
                value={form.is_published ? 'published' : 'draft'}
                onChange={(e) => handleChange('is_published', e.target.value === 'published')}
              >
                <option value="draft">Bản nháp (Luôn ẩn)</option>
                <option value="published">Xuất bản cho công chúng</option>
              </select>
            </label>
          </div>
        </section>

        <section className={styles.curriculumPanel} style={{ marginBottom: '24px', padding: '0', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', padding: '0 16px', background: 'var(--color-gray-50)', alignItems: 'center' }}>
             <h3 style={{ margin: 0, padding: '16px 8px', fontSize: '1rem', fontWeight: '600', color: 'var(--color-slate-800)' }}>
                2. Soạn thảo Nội dung (Giao diện chuẩn Word)
             </h3>
             <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--color-gray-500)' }}>
                 Hỗ trợ bôi đen để định dạng và chèn ảnh trực tiếp
             </span>
          </div>

          <div style={{ padding: '0', backgroundColor: '#fff' }} className="quill-editor-wrapper">
              <ReactQuill 
                  ref={quillRef}
                  theme="snow"
                  value={form.content}
                  onChange={(val) => handleChange('content', val)}
                  style={{ height: '600px', border: 'none' }}
                  placeholder="Bắt đầu gõ nội dung bài viết tuyệt vời của bạn tại đây..."
                  modules={modules}
              />
          </div>
          {/* Fix internal quill height styling */}
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

        <div className={styles.curriculumFormActions} style={{ position: 'sticky', bottom: '20px', backgroundColor: 'var(--color-bg)', padding: '16px 0', borderTop: '1px solid var(--color-border)', justifyContent: 'flex-end', display: 'flex' }}>
          <button
            type="submit"
            className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
            disabled={saving}
            style={{ width: '240px', padding: '14px', fontSize: '1.1rem' }}
          >
            {saving ? 'Đang lưu hệ thống...' : 'Lưu lại bài viết'}
          </button>
        </div>
      </form>
    </>
  )
}
