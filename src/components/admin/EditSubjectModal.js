'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { normalizeGoogleSlidesEmbedUrl } from '@/lib/google-slides'
import styles from '@/app/admin/admin.module.css'

export default function EditSubjectModal({ subjectId, onClose, onSaveSuccess }) {
  const [supabase] = useState(() => createClient())
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
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!subjectId) return
    
    async function fetchSubject() {
      setLoading(true)
      const response = await fetch(`/api/admin/curriculum?subjectId=${subjectId}`, {
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

    fetchSubject()
  }, [subjectId])

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

    const response = await fetch('/api/admin/curriculum', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateSubject',
        subjectId,
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
    
    if (onSaveSuccess) {
      onSaveSuccess()
    }
    
    // Auto close after success
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  if (!subjectId) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`${styles.modalContent} ${styles.largeModalContent}`} 
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <h3>{loading ? 'Đang tải...' : `Trình soạn: ${name || 'Môn học'}`}</h3>
            {!loading && (
              <p style={{ margin: '0.2rem 0 0 0', color: 'var(--color-gray-500)', fontSize: '13px' }}>
                Thuộc gói {levelName} • Thứ tự {sortOrder}
              </p>
            )}
          </div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className={styles.modalBodyScroll} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--color-gray-500)' }}>Đang nạp dữ liệu nội dung...</p>
          </div>
        ) : (
          <>
            <div className={styles.modalBodyScroll}>
              {message && (
                <div
                  className={`${styles.feedbackBanner} ${
                    message.type === 'error'
                      ? styles.feedbackBannerError
                      : styles.feedbackBannerSuccess
                  }`}
                  style={{ marginBottom: 'var(--space-lg)' }}
                >
                  {message.text}
                </div>
              )}

              <form id="edit-subject-form" onSubmit={handleSave} className={styles.editForm}>
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
                    rows={3}
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
                            placeholder="Link Google Slides"
                          />
                          {slide.url.trim() && !normalizeGoogleSlidesEmbedUrl(slide.url) && (
                            <p className={styles.courseEditorWarning}>
                              Link chưa bọc chế độ Embed chuẩn.
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
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                    {slides.length === 0 && (
                      <div className={styles.slidesEmpty}>Chưa có slide nào.</div>
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
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Nội dung chi tiết (Văn bản / HTML)</label>
                  <textarea
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    rows={8}
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
                            placeholder="Tiêu đề tài liệu"
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
                            placeholder="Link tải/xem tài liệu"
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
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                    {resources.length === 0 && (
                      <div className={styles.slidesEmpty}>Chưa có tài liệu nào.</div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className={styles.modalActionsFixed}>
              <button
                type="button"
                className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
                onClick={onClose}
                disabled={saving}
              >
                Hủy & Đóng
              </button>
              <button
                type="submit"
                form="edit-subject-form"
                disabled={saving}
                className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
              >
                {saving ? 'Đang lưu...' : 'Lưu môn học'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
