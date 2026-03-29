import Link from 'next/link'
import styles from '@/app/student/student.module.css'

export default function CourseCard({ subject, progress, locked = false }) {
  const { id, name, level_name } = subject || {}
  const completed = progress?.completed || 0
  const total = progress?.total || 1
  const pct = Math.round((completed / total) * 100)
  const isDone = pct >= 100

  if (locked) {
    return (
      <div className={`${styles.courseCard} ${styles.courseCardLocked}`}>
        <div className={styles.courseCardBody}>
          <span className={styles.courseCardLevel}>{level_name}</span>
          <h4 className={styles.courseCardTitle}>{name}</h4>
          <p className={styles.courseCardLockMsg}>🔒 Đăng ký để mở khóa</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.courseCard} ${isDone ? styles.courseCardDone : ''}`}>
      <div className={styles.courseCardBody}>
        <span className={styles.courseCardLevel}>{level_name}</span>
        <h4 className={styles.courseCardTitle}>{name}</h4>

        {/* Progress bar */}
        <div className={styles.progressBarWrap}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={styles.progressBarLabel}>{pct}%</span>
        </div>
      </div>

      <div className={styles.courseCardFooter}>
        {isDone && (
          <span className={styles.courseCardDoneBadge}>Hoàn thành ✅</span>
        )}
        <Link href={`/student/courses/${id}`} className={styles.courseCardLink}>
          {isDone ? 'Xem lại →' : 'Tiếp tục →'}
        </Link>
      </div>
    </div>
  )
}
