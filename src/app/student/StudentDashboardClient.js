'use client'

import Link from 'next/link'
import ProgressRing from '@/components/student/ProgressRing'
import styles from './student.module.css'

export default function StudentDashboardClient({ name, quote, enrollment, nextSubject, allLevels, overallPct }) {
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
