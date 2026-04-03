import styles from '../../admin.module.css'

export default function LoadingCourseEditor() {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h2 className={styles.pageTitle}>Đang tải môn học...</h2>
        <p className={styles.curriculumLead}>Chuẩn bị trình soạn nội dung.</p>
      </div>
    </div>
  )
}
