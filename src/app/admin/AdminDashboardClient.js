'use client'

import Link from 'next/link'
import StatsCard from '@/components/admin/StatsCard'
import DataTable from '@/components/admin/DataTable'
import styles from './admin.module.css'

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount || 0) + 'đ'
}

export default function AdminDashboardClient({ adminName, stats, recentEnrollments }) {
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  function renderStatus(status) {
    const map = {
      active: { label: 'Đang học', tone: 'badge--active' },
      completed: { label: 'Hoàn thành', tone: 'badge--completed' },
      paused: { label: 'Tạm dừng', tone: 'badge--paused' },
      cancelled: { label: 'Đã hủy', tone: 'badge--cancelled' },
    }
    const view = map[status] || map.active

    return <span className={`${styles.badge} ${styles[view.tone]}`}>{view.label}</span>
  }

  const enrollmentColumns = [
    { key: 'name', label: 'Tên học sinh' },
    { key: 'level', label: 'Gói học' },
    { key: 'date', label: 'Ngày kích hoạt' },
    { key: 'status', label: 'Trạng thái', render: renderStatus },
  ]

  return (
    <>
      <div className={styles.greeting}>
        <h2 className={styles.greetingTitle}>Xin chào, {adminName} 👋</h2>
        <p className={styles.greetingDate}>{today}</p>
      </div>

      <div className={styles.statsGrid}>
        <StatsCard
          title="Tổng học sinh"
          value={stats.students}
          color="primary"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Đã thu tháng này"
          value={formatCurrency(stats.revenue)}
          color="accent"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Gói đang học"
          value={stats.activeEnrollments}
          color="success"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
        />
        <StatsCard
          title="Đang học chưa thu tiền"
          value={stats.unpaidActiveEnrollments}
          color="warning"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          }
        />
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionCardHeader}>Kích hoạt gần đây</div>
        <DataTable
          columns={enrollmentColumns}
          data={recentEnrollments}
          searchKey="name"
          loading={false}
          emptyMessage="Chưa có lượt kích hoạt nào"
        />
      </div>

      <div className={styles.quickActions}>
        <Link href="/admin/students" className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}>
          + Thêm học sinh
        </Link>
        <Link href="/admin/payments" className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}>
          Xem sổ thanh toán
        </Link>
      </div>
    </>
  )
}
