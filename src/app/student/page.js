'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import ProgressRing from '@/components/student/ProgressRing'
import styles from './student.module.css'

export default function StudentDashboard() {
  const [supabase] = useState(() => createClient())
  const [name, setName] = useState('')
  const [enrollment, setEnrollment] = useState(null)
  const [overallPct, setOverallPct] = useState(0)
  const [nextSubject, setNextSubject] = useState(null)
  const [allLevels, setAllLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [quote, setQuote] = useState('')

  useEffect(() => {
    const quoteList = [
      '"Hành trình vạn dặm bắt đầu từ một bước chân." — Lão Tử',
      '"Tương lai thuộc về người học hỏi không ngừng." — Eric Hoffer',
      '"Code today, change the world tomorrow." — AIgenlabs',
    ]
    setQuote(quoteList[Math.floor(Math.random() * quoteList.length)])
  }, [])

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const user = session?.user

        if (!user) {
          return
        }

        const [profileResult, levelsResult, enrollmentsResult, progressResult] =
          await Promise.all([
            supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
            supabase
              .from('levels')
              .select('id, name, subject_count, sort_order, subjects(id, name, sort_order)')
              .order('sort_order'),
            supabase
              .from('enrollments')
              .select('level_id, status, enrolled_at')
              .eq('student_id', user.id)
              .order('enrolled_at', { ascending: false }),
            supabase
              .from('progress')
              .select('subject_id, completed, subjects(level_id)')
              .eq('student_id', user.id),
          ])

        const profile = profileResult.data
        const levels = levelsResult.data || []
        const enrollments = enrollmentsResult.data || []
        const progressRows = progressResult.data || []

        setName(profile?.full_name || 'Học sinh')

        const progressBySubject = {}
        const completedByLevel = {}

        for (const row of progressRows) {
          progressBySubject[row.subject_id] = row.completed
          if (row.completed && row.subjects?.level_id) {
            const levelId = row.subjects.level_id
            completedByLevel[levelId] = (completedByLevel[levelId] || 0) + 1
          }
        }

        const activeEnrollment = enrollments.find((item) => item.status === 'active') || null
        const activeLevel = activeEnrollment
          ? levels.find((level) => level.id === activeEnrollment.level_id) || null
          : null

        setEnrollment(
          activeEnrollment
            ? {
                ...activeEnrollment,
                levels: activeLevel
                  ? {
                      id: activeLevel.id,
                      name: activeLevel.name,
                      subject_count: activeLevel.subject_count,
                    }
                  : null,
              }
            : null
        )

        if (activeLevel) {
          const activeSubjects = [...(activeLevel.subjects || [])].sort(
            (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
          )
          const total = activeSubjects.length || activeLevel.subject_count || 1
          const done = activeSubjects.filter((subject) => progressBySubject[subject.id]).length

          setOverallPct(Math.round((done / total) * 100))
          setNextSubject(activeSubjects.find((subject) => !progressBySubject[subject.id]) || null)
        } else {
          setOverallPct(0)
          setNextSubject(null)
        }

        setAllLevels(
          levels.map((level) => {
            const enrolled = enrollments.some((item) => item.level_id === level.id)
            const totalCount = level.subject_count || level.subjects?.length || 1

            return {
              ...level,
              enrolled,
              completedCount: completedByLevel[level.id] || 0,
              totalCount,
            }
          })
        )
      } catch (error) {
        console.error('Student dashboard fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [supabase])

  if (loading) {
    return <p style={{ color: 'var(--color-gray-500)' }}>Đang tải...</p>
  }

  return (
    <>
      <div className={styles.dashGreeting}>
        <h2 className={styles.dashGreetingTitle}>👋 Chào {name}!</h2>
        <p className={styles.dashQuote}>{quote}</p>
      </div>

      <div className={styles.dashGrid}>
        <div className={styles.dashCard}>
          <h3 className={styles.dashCardTitle}>
            {enrollment ? enrollment.levels?.name : 'Chưa đăng ký khóa nào'}
          </h3>
          <div className={styles.dashCardCenter}>
            <ProgressRing percentage={overallPct} size={140} strokeWidth={10} />
          </div>
          <p className={styles.dashCardSub}>Tiến độ tổng thể</p>
        </div>

        <div className={styles.dashCard}>
          <h3 className={styles.dashCardTitle}>Bài học tiếp theo</h3>
          {nextSubject ? (
            <div className={styles.dashNextLesson}>
              <span className={styles.dashNextIcon}>📖</span>
              <div>
                <p className={styles.dashNextName}>{nextSubject.name}</p>
                <Link href={`/student/courses/${nextSubject.id}`} className={styles.dashNextLink}>
                  Tiếp tục học →
                </Link>
              </div>
            </div>
          ) : (
            <p className={styles.dashCardSub}>
              {enrollment ? '🎉 Đã hoàn thành tất cả bài học!' : 'Đăng ký khóa học để bắt đầu'}
            </p>
          )}
        </div>
      </div>

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
                  <div className={styles.progressBarFill} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
