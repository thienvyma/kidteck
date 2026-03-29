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
  const [content, setContent] = useState('')
  const [slidesUrl, setSlidesUrl] = useState('')
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
      setContent(JSON.stringify(data.content || {}, null, 2))
      setSlidesUrl(data.content?.google_slides_url || data.content?.slides_url || '')
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

    let parsedContent = {}
    try {
      parsedContent = JSON.parse(content || '{}')
    } catch {
      setMessage({ type: 'error', text: 'Content JSON không hợp lệ' })
      setSaving(false)
      return
    }

    if (slidesUrl.trim()) {
      parsedContent.google_slides_url = slidesUrl.trim()
    } else {
      delete parsedContent.google_slides_url
      delete parsedContent.slides_url
    }

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
          <label className={styles.formLabel}>Google Slides URL</label>
          <p className={styles.courseEditorHint}>
            Dùng link Google Slides đã publish hoặc link presentation công khai. Hệ
            thống sẽ tự chuyển sang chế độ nhúng trong portal học sinh để hạn chế việc
            mở trực tiếp sang Google.
          </p>
          <input
            type="url"
            value={slidesUrl}
            onChange={(event) => setSlidesUrl(event.target.value)}
            className={styles.formInput}
            placeholder="https://docs.google.com/presentation/d/e/.../pub?start=false&loop=false&delayms=3000"
          />
          {slidesUrl.trim() && !normalizeGoogleSlidesEmbedUrl(slidesUrl) && (
            <p className={styles.courseEditorWarning}>
              Link này chưa đúng định dạng Google Slides hỗ trợ. Hãy dùng link publish
              hoặc embed từ Google Slides.
            </p>
          )}
        </div>

        <div className={styles.formField}>
          <label className={styles.formLabel}>Content (JSON)</label>
          <p className={styles.courseEditorHint}>
            Sử dụng cấu trúc như{' '}
            <code>{'{ "body": "", "video_url": "", "google_slides_url": "", "resources": [] }'}</code>
            {' '}để trang học sinh hiển thị đúng video, slide, nội dung, và tài liệu.
          </p>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={14}
            className={`${styles.formTextarea} ${styles.formTextareaMono}`}
            placeholder='{"body": "", "video_url": "", "resources": []}'
          />
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
