import styles from '../../student.module.css'

export default function LoadingCourseDetail() {
  return (
    <div className={styles.lessonLayout}>
      <div className={styles.lessonMain}>
        <p style={{ color: 'var(--color-gray-500)' }}>Đang tải nội dung môn học...</p>
      </div>
    </div>
  )
}
