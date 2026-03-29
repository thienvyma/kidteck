'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import ProgressRing from '@/components/student/ProgressRing'
import styles from './student.module.css'

export default function StudentDashboard() {
  const supabase = createClient()
  const [name, setName] = useState('')
  const [enrollment, setEnrollment] = useState(null)
  const [overallPct, setOverallPct] = useState(0)
  const [nextSubject, setNextSubject] = useState(null)
  const [allLevels, setAllLevels] = useState([])
  const [loading, setLoading] = useState(true)

  const quotes = [
    '"Hành trình vạn dặm bắt đầu từ một bước chân." — Lão Tử',
    '"Tương lai thuộc về người học hỏi không ngừng." — Eric Hoffer',
    '"Code today, change the world tomorrow." — KidTech',
  ]
  const quote = quotes[Math.floor(Math.random() * quotes.length)]

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      setName(profile?.full_name || 'Học sinh')

      // Active enrollment
      const { data: enr } = await supabase
        .from('enrollments')
        .select('*, levels(id, name, subject_count)')
        .eq('student_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .single()
      setEnrollment(enr)

      // Progress for current level
      if (enr?.levels?.id) {
        const { data: subjects } = await supabase
          .from('subjects')
          .select('id, name')
          .eq('level_id', enr.levels.id)
          .order('sort_order')

        const { data: prog } = await supabase
          .from('progress')
          .select('subject_id, completed')
          .eq('student_id', user.id)

        const progMap = {}
        ;(prog || []).forEach((p) => { progMap[p.subject_id] = p.completed })

        const total = subjects?.length || 1
        const done = (subjects || []).filter((s) => progMap[s.id]).length
        setOverallPct(Math.round((done / total) * 100))

        // Find next incomplete subject
        const next = (subjects || []).find((s) => !progMap[s.id])
        setNextSubject(next || null)
      }

      // All levels summary
      const { data: levels } = await supabase
        .from('levels')
        .select('id, name, subject_count')
        .order('sort_order')

      const { data: allEnrollments } = await supabase
        .from('enrollments')
        .select('level_id, status')
        .eq('student_id', user.id)

      const { data: allProgress } = await supabase
        .from('progress')
        .select('subject_id, completed, subjects(level_id)')
        .eq('student_id', user.id)

      const levelSummary = (levels || []).map((level) => {
        const enrolled = (allEnrollments || []).find((e) => e.level_id === level.id)
        const progForLevel = (allProgress || []).filter(
          (p) => p.subjects?.level_id === level.id && p.completed
        )
        return {
          ...level,
          enrolled: !!enrolled,
          completedCount: progForLevel.length,
          totalCount: level.subject_count || 1,
        }
      })
      setAllLevels(levelSummary)
      setLoading(false)
    }
    fetch()
  }, [supabase])

  if (loading) {
    return <p style={{ color: 'var(--color-gray-500)' }}>Đang tải...</p>
  }

  return (
    <>
      {/* Section 1: Greeting */}
      <div className={styles.dashGreeting}>
        <h2 className={styles.dashGreetingTitle}>👋 Chào {name}!</h2>
        <p className={styles.dashQuote}>{quote}</p>
      </div>

      <div className={styles.dashGrid}>
        {/* Section 2: Current Level + ProgressRing */}
        <div className={styles.dashCard}>
          <h3 className={styles.dashCardTitle}>
            {enrollment ? enrollment.levels?.name : 'Chưa đăng ký khóa nào'}
          </h3>
          <div className={styles.dashCardCenter}>
            <ProgressRing percentage={overallPct} size={140} strokeWidth={10} />
          </div>
          <p className={styles.dashCardSub}>Tiến độ tổng thể</p>
        </div>

        {/* Section 3: Next Lesson */}
        <div className={styles.dashCard}>
          <h3 className={styles.dashCardTitle}>Bài học tiếp theo</h3>
          {nextSubject ? (
            <div className={styles.dashNextLesson}>
              <span className={styles.dashNextIcon}>📖</span>
              <div>
                <p className={styles.dashNextName}>{nextSubject.name}</p>
                <a href={`/student/courses/${nextSubject.id}`} className={styles.dashNextLink}>
                  Tiếp tục học →
                </a>
              </div>
            </div>
          ) : (
            <p className={styles.dashCardSub}>
              {enrollment ? '🎉 Đã hoàn thành tất cả bài học!' : 'Đăng ký khóa học để bắt đầu'}
            </p>
          )}
        </div>
      </div>

      {/* Section 4: All levels progress */}
      <div className={styles.dashCard} style={{ marginTop: 'var(--space-lg)' }}>
        <h3 className={styles.dashCardTitle}>Tổng quan các Level</h3>
        <div className={styles.levelProgressList}>
          {allLevels.map((level) => {
            const pct = Math.round((level.completedCount / level.totalCount) * 100)
            return (
              <div key={level.id} className={styles.levelProgressItem}>
                <div className={styles.levelProgressHeader}>
                  <span className={styles.levelProgressName}>{level.name}</span>
                  <span className={styles.levelProgressPct}>{pct}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
