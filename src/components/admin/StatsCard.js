import styles from '@/app/admin/admin.module.css'

export default function StatsCard({ title, value, icon, color = 'primary' }) {
  // Determine color class modifier based on props
  // Map allowed colors: 'success', 'warning', 'accent'
  const colorClass = styles[`statsCard--${color}`] || ''

  return (
    <div className={`${styles.statsCard} ${colorClass}`}>
      <div className={styles.statsIcon}>
        {icon}
      </div>
      <div className={styles.statsContent}>
        <h3 className={styles.statsTitle}>{title}</h3>
        <span className={styles.statsValue}>{value}</span>
      </div>
    </div>
  )
}
