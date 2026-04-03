import styles from '../../admin.module.css'

export default function LoadingStudentDetail() {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h2 className={styles.pageTitle}>Chi tiết học sinh</h2>
        <p className={styles.curriculumLead}>Đang tải hồ sơ học sinh...</p>
      </div>
    </div>
  )
}
