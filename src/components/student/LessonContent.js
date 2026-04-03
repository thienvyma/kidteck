'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { normalizeGoogleSlidesEmbedUrl } from '@/lib/google-slides'
import { sanitizeHTML } from '@/lib/sanitize'
import styles from '@/app/student/student.module.css'

export default function LessonContent({ subject, progress, studentId, onComplete }) {
  const [supabase] = useState(() => createClient())
  const [completed, setCompleted] = useState(progress?.completed || false)
  const [saving, setSaving] = useState(false)

  const content = subject?.content || {}
  const videoUrl = content.video_url || ''
  const slidesUrl = content.google_slides_url || content.slides_url || ''
  const body = content.body || ''
  const resources = content.resources || []

  // Extract YouTube embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
    if (match) return `https://www.youtube.com/embed/${match[1]}`
    // Vimeo
    const vimeo = url.match(/vimeo\.com\/(\d+)/)
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
    return null
  }

  const embedUrl = getEmbedUrl(videoUrl)
  const slidesEmbedUrl = normalizeGoogleSlidesEmbedUrl(slidesUrl)

  const handleToggle = async (e) => {
    const newVal = e.target.checked
    setCompleted(newVal) // Optimistic
    setSaving(true)

    const { error } = await supabase
      .from('progress')
      .upsert({
        student_id: studentId,
        subject_id: subject.id,
        completed: newVal,
        completed_at: newVal ? new Date().toISOString() : null,
      }, {
        onConflict: 'student_id,subject_id',
      })

    if (error) {
      console.error('Progress update error:', error)
      setCompleted(!newVal) // Rollback
    } else if (onComplete) {
      onComplete(newVal)
    }
    setSaving(false)
  }

  return (
    <div className={styles.lessonContent}>
      {/* Video */}
      {embedUrl && (
        <div className={styles.videoWrap}>
          <iframe
            src={embedUrl}
            title={subject.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {slidesEmbedUrl && (
        <div className={styles.slidesSection}>
          <h4 className={styles.resourcesTitle}>📑 Slide bài giảng</h4>
          <div className={styles.slidesWrap}>
            <iframe
              src={slidesEmbedUrl}
              title={`${subject.name} - Google Slides`}
              loading="lazy"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
          <p className={styles.slidesNote}>
            Slide được hiển thị trực tiếp trong hệ thống để học sinh theo dõi ngay tại đây.
          </p>
        </div>
      )}

      {/* Body */}
      {body ? (
        <div
          className={styles.lessonBody}
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(body) }}
        />
      ) : (
        <p className={styles.lessonEmpty}>📝 Nội dung đang được cập nhật</p>
      )}

      {/* Resources */}
      {resources.length > 0 && (
        <div className={styles.resourcesSection}>
          <h4 className={styles.resourcesTitle}>📎 Tài liệu tham khảo</h4>
          <ul className={styles.resourcesList}>
            {resources.map((r, i) => (
              <li key={i}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className={styles.resourceLink}>
                  {r.title || r.url} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Complete checkbox */}
      <div className={styles.completeSection}>
        <label className={styles.completeLabel}>
          <input
            type="checkbox"
            checked={completed}
            onChange={handleToggle}
            disabled={saving}
            className={styles.completeCheckbox}
          />
          <span>{completed ? 'Đã hoàn thành ✅' : 'Đánh dấu hoàn thành'}</span>
        </label>
      </div>
    </div>
  )
}
