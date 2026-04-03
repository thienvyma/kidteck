'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import CourseCard from '@/components/student/CourseCard'
import styles from '../student.module.css'

const ACCESSIBLE_STATUSES = new Set(['active', 'completed'])

export default function StudentCoursesPage() {
  const [supabase] = useState(() => createClient())
  const [levels, setLevels] = useState([])
  const [activeTab, setActiveTab] = useState(0)
  const [enrolledIds, setEnrolledIds] = useState([])
  const [progressMap, setProgressMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const user = session?.user

        if (!user) {
          return
        }

        const [levelsResult, enrollmentResult, progressResult] = await Promise.all([
          supabase
            .from('levels')
            .select('id, name, sort_order, subjects(id, name, description, sort_order)')
            .order('sort_order'),
          supabase
            .from('enrollments')
            .select('level_id, status')
            .eq('student_id', user.id),
          supabase
            .from('progress')
            .select('subject_id, completed')
            .eq('student_id', user.id),
        ])

        const nextLevels = levelsResult.data || []
        const enrollments = enrollmentResult.data || []
        const progressRows = progressResult.data || []

        setLevels(nextLevels)
        setEnrolledIds(
          enrollments
            .filter((item) => ACCESSIBLE_STATUSES.has(item.status))
            .map((item) => item.level_id)
        )

        const map = {}
        for (const row of progressRows) {
          map[row.subject_id] = row.completed
        }
        setProgressMap(map)
      } catch (error) {
        console.error('Student courses fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [supabase])

  if (loading) {
    return <p style={{ color: 'var(--color-gray-500)' }}>Đang tải...</p>
  }

  const currentLevel = levels[activeTab]
  const isLocked = currentLevel && !enrolledIds.includes(currentLevel.id)
  const subjects = [...(currentLevel?.subjects || [])].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  )

  return (
    <>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Môn học</h2>
      </div>

      <div className={styles.tabBar}>
        {levels.map((level, idx) => (
          <button
            key={level.id}
            className={`${styles.tabBtn} ${activeTab === idx ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab(idx)}
          >
            {level.name}
          </button>
        ))}
      </div>

      {isLocked && (
        <div className={styles.lockedBanner}>
          🔒 Gói học này chưa được kích hoạt cho tài khoản của bạn. Hãy liên hệ admin để mở
          khóa.
        </div>
      )}

      <div className={styles.courseGrid}>
        {subjects.map((subject) => {
          const isCompleted = progressMap[subject.id] || false
          return (
            <CourseCard
              key={subject.id}
              subject={{
                id: subject.id,
                name: subject.name,
                level_name: currentLevel.name,
              }}
              progress={{ completed: isCompleted ? 1 : 0, total: 1 }}
              locked={isLocked}
            />
          )
        })}
        {subjects.length === 0 && (
          <p style={{ color: 'var(--color-gray-500)' }}>Chưa có môn học nào.</p>
        )}
      </div>
    </>
  )
}
