import StudentSidebar from '@/components/student/Sidebar'
import styles from './student.module.css'

export const metadata = {
  title: 'AIgenlabs — Student Portal',
}

export default function StudentLayout({ children }) {
  return (
    <div className={styles.studentLayout}>
      <StudentSidebar>{children}</StudentSidebar>
    </div>
  )
}
