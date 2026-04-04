'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { normalizeGoogleSlidesEmbedUrl } from '@/lib/google-slides'
import styles from '../../admin.module.css'

export default function CourseEditPage() {
  const { id } = useParams()
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [body, setBody] = useState('')
  const [resources, setResources] = useState([])
  const [slides, setSlides] = useState([])
  const [levelName, setLevelName] = useState('')
  const [sortOrder, setSortOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    async function fetchSubject() {
      const response = await fetch(`/api/admin/curriculum?subjectId=${id}`, {
        cache: 'no-store',
      })
      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: `Không thể tải môn học: ${data.error}` })
        setLoading(false)
        return
      }

      setName(data.name || '')
      setDescription(data.description || '')
      setVideoUrl(data.content?.video_url || '')
      setBody(data.content?.body || '')
      setResources(data.content?.resources || [])
      
      let loadedSlides = data.content?.slides || []
      if (loadedSlides.length === 0) {
        const legacyUrl = data.content?.google_slides_url || data.content?.slides_url
        if (legacyUrl) {
          loadedSlides = [{ title: 'Slide bài giảng', url: legacyUrl }]
        }
      }
      setSlides(loadedSlides)

      setLevelName(data.levels?.name || '')
      setSortOrder(data.sort_order || null)
      setLoading(false)
    }

    if (id) {
      fetchSubject()
    }
  }, [id])

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage(null)

    let parsedContent = {
      video_url: videoUrl,
      body: body,
      resources: resources.filter((r) => r.title.trim() || r.url.trim()),
    }

    if (slides.length > 0) {
      parsedContent.slides = slides.filter(s => s.url && s.url.trim())
    }
    
    // Xóa trường cũ để thống nhất dữ liệu
    delete parsedContent.google_slides_url
    delete parsedContent.slides_url

    const response = await fetch('/api/admin/curriculum', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateSubject',
        subjectId: id,
        name,
        description,
        content: parsedContent,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      setMessage({ type: 'error', text: result.error || 'Không thể lưu môn học' })
      setSaving(false)
      return
    }

    setMessage({ type: 'success', text: 'Đã lưu thay đổi cho môn học' })
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    setMessage(null)

    const response = await fetch('/api/admin/curriculum', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'deleteSubject',
        subjectId: id,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      setMessage({ type: 'error', text: result.error || 'Không thể xóa môn học' })
      setDeleting(false)
      setShowDeleteConfirm(false)
      return
    }

    router.push('/admin/courses')
  }

  if (loading) {
    return (
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Đang tải môn học...</h2>
          <p className={styles.curriculumLead}>Chuẩn bị trình soạn nội dung.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={styles.editorBackRow}>
        <button
          className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
          onClick={() => router.push('/admin/courses')}
        >
          ← Quay lại quản lý gói học
        </button>
      </div>

      <section className={styles.courseEditorHero}>
        <span className={styles.packageHeroEyebrow}>Trình soạn môn học</span>
        <h2 className={styles.pageTitle}>{name || 'Môn học chưa đặt tên'}</h2>
        <p className={styles.curriculumLead}>
          {levelName ? `Thuộc gói ${levelName}` : 'Chưa gắn vào gói học'}{' '}
          {sortOrder ? `• Thứ tự ${sortOrder}` : ''}
        </p>
      </section>

      {message && (
        <div
          className={`${styles.feedbackBanner} ${
            message.type === 'error'
              ? styles.feedbackBannerError
              : styles.feedbackBannerSuccess
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className={styles.editForm}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Tên môn học</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className={styles.formInput}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Mô tả ngắn</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className={styles.formTextarea}
            placeholder="Mô tả nhanh giá trị của môn học này."
          />
        </div>

        <div className={styles.formField}>
          <div className={styles.slidesHeaderRow}>
            <label className={styles.formLabel}>Slides Bài Giảng</label>
            <button 
              type="button" 
              onClick={() => setSlides([...slides, { title: `Phần ${slides.length + 1}`, url: '' }])}
              className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']} ${styles.addSlideBtn}`}
            >
              + Thêm Slide
            </button>
          </div>
          <p className={styles.courseEditorHint}>
            Trường hợp khóa học có nhiều slide, bạn có thể thêm các phần ở đây. Dùng link Google Slides đã publish hoặc link presentation công khai.
          </p>
          
          <div className={styles.slidesList}>
            {slides.map((slide, index) => (
              <div key={index} className={styles.slideItemEditor}>
                <div className={styles.slideItemEditorMain}>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => {
                      const newSlides = [...slides]
                      newSlides[index].title = e.target.value
                      setSlides(newSlides)
                    }}
                    className={styles.formInput}
                    placeholder="Tiêu đề (VD: Phần 1 - Lý thuyết)"
                  />
                  <input
                    type="url"
                    value={slide.url}
                    onChange={(e) => {
                      const newSlides = [...slides]
                      newSlides[index].url = e.target.value
                      setSlides(newSlides)
                    }}
                    className={styles.formInput}
                    placeholder="https://docs.google.com/presentation/d/e/.../pub?start=false&loop=false&delayms=3000"
                  />
                  {slide.url.trim() && !normalizeGoogleSlidesEmbedUrl(slide.url) && (
                    <p className={styles.courseEditorWarning}>
                      Link này chưa đúng định dạng. Hãy dùng link publish hoặc embed từ Google Slides.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newSlides = [...slides]
                    newSlides.splice(index, 1)
                    setSlides(newSlides)
                  }}
                  className={styles.deleteSlideItemBtn}
                  title="Xóa slide này"
                >
                  Xóa
                </button>
              </div>
            ))}
            {slides.length === 0 && (
              <div className={styles.slidesEmpty}>Chưa có slide nào. Bấm "+ Thêm Slide" để bắt đầu.</div>
            )}
          </div>
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Link Video bài giảng (YouTube/Vimeo)</label>
          <input
            type="url"
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            className={styles.formInput}
            placeholder="VD: https://www.youtube.com/watch?v=..."
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Nội dung chi tiết (Văn bản / HTML)</label>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={10}
            className={styles.formTextarea}
            placeholder="Nội dung diễn giải, hướng dẫn bài học..."
          />
        </div>

        <div className={styles.formField}>
          <div className={styles.slidesHeaderRow}>
            <label className={styles.formLabel}>Tài liệu tham khảo</label>
            <button 
              type="button" 
              onClick={() => setResources([...resources, { title: '', url: '' }])}
              className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']} ${styles.addSlideBtn}`}
            >
              + Thêm tài liệu
            </button>
          </div>
          <p className={styles.courseEditorHint}>
            Link bài viết, file PDF, repository mã nguồn hỗ trợ học tập cho học sinh.
          </p>
          
          <div className={styles.slidesList}>
            {resources.map((res, index) => (
              <div key={index} className={styles.slideItemEditor}>
                <div className={styles.slideItemEditorMain}>
                  <input
                    type="text"
                    value={res.title}
                    onChange={(e) => {
                      const newRes = [...resources]
                      newRes[index].title = e.target.value
                      setResources(newRes)
                    }}
                    className={styles.formInput}
                    placeholder="Tiêu đề (VD: Giáo trình PDF)"
                  />
                  <input
                    type="url"
                    value={res.url}
                    onChange={(e) => {
                      const newRes = [...resources]
                      newRes[index].url = e.target.value
                      setResources(newRes)
                    }}
                    className={styles.formInput}
                    placeholder="https://..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newRes = [...resources]
                    newRes.splice(index, 1)
                    setResources(newRes)
                  }}
                  className={styles.deleteSlideItemBtn}
                  title="Xóa tài liệu này"
                >
                  Xóa
                </button>
              </div>
            ))}
            {resources.length === 0 && (
              <div className={styles.slidesEmpty}>Chưa có tài liệu nào. Bấm "+ Thêm tài liệu" để bắt đầu.</div>
            )}
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            disabled={saving}
            className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/courses')}
            className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className={styles.deleteBtn}
          >
            Xóa môn học
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Xóa môn học"
        message={`Bạn có chắc muốn xóa "${name}"? Môn học sẽ biến mất khỏi gói học và danh sách học viên.`}
        confirmText="Xóa môn này"
        cancelText="Giữ lại"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={deleting}
      />
    </>
  )
}
