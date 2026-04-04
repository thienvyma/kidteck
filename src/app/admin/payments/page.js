'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import DataTable from '@/components/admin/DataTable'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import styles from '../admin.module.css'

const paymentMethodMap = {
  bank_transfer: 'Chuyển khoản',
  momo: 'MoMo',
  cash: 'Tiền mặt',
  other: 'Khác',
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount || 0) + 'đ'
}

function formatDate(value, withTime = false) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  return withTime ? date.toLocaleString('vi-VN') : date.toLocaleDateString('vi-VN')
}

function PaymentsContent() {
  const searchParams = useSearchParams()
  const studentId = searchParams.get('studentId') || ''

  const [payments, setPayments] = useState([])
  const [summary, setSummary] = useState({ totalPaid: 0, totalPending: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [feedback, setFeedback] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchPayments = useCallback(async () => {
    setLoading(true)

    try {
      const params = new URLSearchParams()
      params.set('status', filter)
      if (studentId) {
        params.set('studentId', studentId)
      }

      const response = await fetch(`/api/admin/payments?${params.toString()}`, {
        cache: 'no-store',
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Không thể tải sổ thanh toán')
      }

      setPayments(
        (result.payments || []).map((payment) => ({
          ...payment,
          amountFormatted: formatCurrency(payment.amount),
          methodLabel: paymentMethodMap[payment.method] || 'Khác',
          createdLabel: formatDate(payment.createdAt, true),
          paidLabel: formatDate(payment.paidAt, true),
        }))
      )
      setSummary(result.summary || { totalPaid: 0, totalPending: 0, count: 0 })
    } catch (error) {
      console.error('fetchPayments error:', error)
      setFeedback({
        type: 'error',
        text: error.message || 'Không thể tải sổ thanh toán',
      })
    } finally {
      setLoading(false)
    }
  }, [filter, studentId])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  function renderPaymentStatus(status) {
    const map = {
      pending: { label: 'Chờ thu', tone: 'badge--paused' },
      paid: { label: 'Đã thu', tone: 'badge--active' },
      refunded: { label: 'Hoàn tiền', tone: 'badge--cancelled' },
    }
    const view = map[status]

    return <span className={`${styles.badge} ${styles[view.tone]}`}>{view.label}</span>
  }

  function renderEnrollmentStatus(status) {
    const map = {
      inactive: { label: 'Chưa kích hoạt', tone: 'badge--inactive' },
      active: { label: 'Đang học', tone: 'badge--active' },
      completed: { label: 'Hoàn thành', tone: 'badge--completed' },
      paused: { label: 'Tạm dừng', tone: 'badge--paused' },
      cancelled: { label: 'Đã hủy', tone: 'badge--cancelled' },
    }
    const view = map[status] || map.inactive

    return <span className={`${styles.badge} ${styles[view.tone]}`}>{view.label}</span>
  }

  async function executeAction() {
    if (!confirmAction) {
      return
    }

    setActionLoading(true)

    try {
      const shouldActivate =
        confirmAction.type === 'confirm' &&
        !['active', 'completed'].includes(confirmAction.row.enrollmentStatus)

      const response = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updatePaymentStatus',
          paymentId: confirmAction.row.id,
          status: confirmAction.type === 'confirm' ? 'paid' : 'refunded',
          autoActivate: shouldActivate,
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Không thể cập nhật giao dịch')
      }

      setFeedback({
        type: 'success',
        text:
          confirmAction.type === 'confirm'
            ? shouldActivate
              ? 'Đã xác nhận thu tiền và kích hoạt gói học.'
              : 'Đã xác nhận giao dịch đã thu.'
            : 'Đã ghi nhận hoàn tiền.',
      })
      setConfirmAction(null)
      await fetchPayments()
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error.message || 'Không thể cập nhật giao dịch',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    { key: 'student', label: 'Học sinh' },
    { key: 'level', label: 'Gói học' },
    { key: 'amountFormatted', label: 'Số tiền' },
    { key: 'methodLabel', label: 'Phương thức' },
    { key: 'enrollmentStatus', label: 'Trạng thái gói', render: renderEnrollmentStatus },
    { key: 'status', label: 'Trạng thái thu', render: renderPaymentStatus },
    { key: 'createdLabel', label: 'Ghi nhận lúc' },
  ]

  const actions = [
    {
      label: (row) =>
        ['active', 'completed'].includes(row.enrollmentStatus)
          ? 'Xác nhận đã thu'
          : 'Xác nhận & kích hoạt',
      hidden: (row) => row.status !== 'pending',
      onClick: (row) => setConfirmAction({ type: 'confirm', row }),
    },
    {
      label: 'Hoàn tiền',
      hidden: (row) => row.status !== 'paid',
      onClick: (row) => setConfirmAction({ type: 'refund', row }),
    },
  ]

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Sổ thanh toán</h2>
          <p className={styles.curriculumLead}>
            Giao dịch mới được tạo ở trang chi tiết học sinh. Màn này dùng để rà soát, xác nhận đã thu và theo dõi các gói đã kích hoạt nhưng chưa thu tiền.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`${styles.feedbackBanner} ${
            feedback.type === 'success'
              ? styles.feedbackBannerSuccess
              : styles.feedbackBannerError
          }`}
        >
          {feedback.text}
        </div>
      )}

      {studentId && (
        <div className={`${styles.feedbackBanner} ${styles.feedbackBannerSuccess}`}>
          Đang lọc giao dịch theo một học sinh cụ thể từ trang chi tiết.
        </div>
      )}

      <div className={styles.statsGrid} style={{ marginBottom: 'var(--space-xl)' }}>
        <div className={`${styles.statsCard} ${styles['statsCard--success']}`}>
          <div className={styles.statsContent}>
            <span className={styles.statsTitle}>Đã thu</span>
            <span className={styles.statsValue}>{formatCurrency(summary.totalPaid)}</span>
          </div>
        </div>
        <div className={`${styles.statsCard} ${styles['statsCard--warning']}`}>
          <div className={styles.statsContent}>
            <span className={styles.statsTitle}>Chờ thu</span>
            <span className={styles.statsValue}>{formatCurrency(summary.totalPending)}</span>
          </div>
        </div>
        <div className={styles.statsCard}>
          <div className={styles.statsContent}>
            <span className={styles.statsTitle}>Tổng giao dịch</span>
            <span className={styles.statsValue}>{summary.count}</span>
          </div>
        </div>
      </div>

      <div className={styles.filterBar}>
        {['all', 'pending', 'paid', 'refunded'].map((item) => (
          <button
            key={item}
            className={`${styles.filterBtn} ${filter === item ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter(item)}
          >
            {item === 'all'
              ? 'Tất cả'
              : item === 'pending'
                ? 'Chờ thu'
                : item === 'paid'
                  ? 'Đã thu'
                  : 'Hoàn tiền'}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={payments}
        searchKey="student"
        loading={loading}
        emptyMessage="Chưa có giao dịch nào"
        actions={actions}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmAction)}
        title={
          confirmAction?.type === 'confirm'
            ? 'Xác nhận đã thu'
            : 'Ghi nhận hoàn tiền'
        }
        message={
          confirmAction
            ? confirmAction.type === 'confirm'
              ? `Xác nhận giao dịch ${confirmAction.row.amountFormatted} của ${confirmAction.row.student}? Nếu gói chưa kích hoạt, hệ thống sẽ kích hoạt luôn khi cần.`
              : `Ghi nhận hoàn tiền ${confirmAction.row.amountFormatted} cho ${confirmAction.row.student}?`
            : ''
        }
        confirmText={confirmAction?.type === 'confirm' ? 'Xác nhận' : 'Hoàn tiền'}
        variant={confirmAction?.type === 'confirm' ? 'default' : 'warning'}
        onConfirm={executeAction}
        onCancel={() => setConfirmAction(null)}
        loading={actionLoading}
      />
    </>
  )
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>
        Đang tải sổ thanh toán...
      </div>
    }>
      <PaymentsContent />
    </Suspense>
  )
}
