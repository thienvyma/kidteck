'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import LessonContent from '@/components/student/LessonContent'
import styles from '../../student.module.css'

export default function CourseDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  const [subject, setSubject] = useState(null)
  const [siblings, setSiblings] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [studentId, setStudentId] = useState(null)
  const [blockedMessage, setBlockedMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setStudentId(user.id)

      const response = await fetch(`/api/student/subjects/${id}`, {
        cache: 'no-store',
      })
      const result = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          const levelName = result.levelName || 'khóa học này'
          setBlockedMessage(
            `${levelName} chưa được kích hoạt cho tài khoản này hoặc đang bị tạm dừng.`
          )
        }
        setLoading(false)
        return
      }

      setSubject(result.subject)
      setSiblings(result.siblings || [])

      const { data: progressRows } = await supabase
        .from('progress')
        .select('subject_id, completed')
        .eq('student_id', user.id)
        .in('subject_id', (result.siblings || []).map((item) => item.id))

      const nextMap = {}
      ;(progressRows || []).forEach((row) => {
        nextMap[row.subject_id] = row.completed
      })
      setProgressMap(nextMap)
      setLoading(false)
    }

    if (id) {
      fetchData()
    }
  }, [id, supabase])

  if (loading) {
    return <p style={{ color: 'var(--color-gray-500)' }}>Đang tải...</p>
  }

  if (blockedMessage) {
    return (
      <div>
        <div className={styles.lockedBanner}>🔒 {blockedMessage}</div>
        <Link href="/student/courses" className={styles.courseCardLink}>
          ← Quay lại danh sách môn học
        </Link>
      </div>
    )
  }

  if (!subject) {
    return (
      <div>
        <p>Không tìm thấy môn học.</p>
        <button
          className={styles.courseCardLink}
          onClick={() => router.push('/student/courses')}
        >
          ← Quay lại
        </button>
      </div>
    )
  }

  const currentIdx = siblings.findIndex((item) => String(item.id) === String(id))
  const prev = currentIdx > 0 ? siblings[currentIdx - 1] : null
  const next = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null

  return (
    <div className={styles.lessonLayout}>
      <div className={styles.lessonMain}>
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <Link href="/student/courses" className={styles.courseCardLink}>
            ← {subject.levels?.name || 'Quay lại'}
          </Link>
        </div>

        <h2 className={styles.pageTitle} style={{ marginBottom: 'var(--space-lg)' }}>
          {subject.name}
        </h2>

        <LessonContent
          subject={subject}
          progress={{ completed: progressMap[subject.id] || false }}
          studentId={studentId}
          onComplete={(value) => {
            setProgressMap((current) => ({ ...current, [subject.id]: value }))
          }}
        />

        <div className={styles.lessonNav}>
          {prev ? (
            <Link href={`/student/courses/${prev.id}`} className={styles.lessonNavBtn}>
              ← {prev.name}
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link href={`/student/courses/${next.id}`} className={styles.lessonNavBtn}>
              {next.name} →
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>

      <aside className={styles.lessonSidebar}>
        <h4 className={styles.lessonSidebarTitle}>Nội dung khóa học</h4>
        <ul className={styles.lessonSidebarList}>
          {siblings.map((item) => (
            <li key={item.id}>
              <Link
                href={`/student/courses/${item.id}`}
                className={`${styles.lessonSidebarItem} ${
                  String(item.id) === String(id) ? styles.lessonSidebarItemActive : ''
                }`}
              >
                <span>{progressMap[item.id] ? '✅' : '⬜'}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
