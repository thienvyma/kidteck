'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import styles from '../../admin.module.css'

const enrollmentStateMap = {
  inactive: { label: 'Chưa kích hoạt', tone: 'badge--inactive' },
  active: { label: 'Đang học', tone: 'badge--active' },
  paused: { label: 'Tạm dừng', tone: 'badge--paused' },
  completed: { label: 'Hoàn thành', tone: 'badge--completed' },
  cancelled: { label: 'Đã hủy', tone: 'badge--cancelled' },
}

const paymentStateMap = {
  none: { label: 'Chưa ghi nhận', tone: 'badge--inactive' },
  pending: { label: 'Chờ thu', tone: 'badge--paused' },
  paid: { label: 'Đã thu', tone: 'badge--active' },
  refunded: { label: 'Hoàn tiền', tone: 'badge--cancelled' },
}

const paymentMethodMap = {
  bank_transfer: 'Chuyển khoản',
  momo: 'MoMo',
  cash: 'Tiền mặt',
  other: 'Khác',
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(value || 0) + 'đ'
}

function formatDate(value, withTime = false) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  return withTime ? date.toLocaleString('vi-VN') : date.toLocaleDateString('vi-VN')
}

function buildPaymentDrafts(packages = []) {
  return packages.reduce((drafts, pkg) => {
    drafts[pkg.id] = {
      amount: String(pkg.payment?.amount || pkg.price || ''),
      method: pkg.payment?.method || 'bank_transfer',
      status: 'paid',
      transactionId: '',
      autoActivate: !pkg.enrollment || pkg.enrollment.status !== 'active',
    }

    return drafts
  }, {})
}

export default function StudentDetailPage() {
  const params = useParams()
  const studentId = Array.isArray(params?.id) ? params.id[0] : params?.id

  const [overview, setOverview] = useState(null)
  const [accountInfo, setAccountInfo] = useState(null)
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    parentName: '',
    parentPhone: '',
  })
  const [paymentDrafts, setPaymentDrafts] = useState({})
  const [passwordInput, setPasswordInput] = useState('')
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionKey, setActionKey] = useState('')

  async function loadStudent(showLoader = true) {
    if (!studentId) {
      return
    }

    if (showLoader) {
      setLoading(true)
    }

    try {
      const [overviewResponse, accountResponse] = await Promise.all([
        fetch(`/api/admin/students/${studentId}/overview`, { cache: 'no-store' }),
        fetch(`/api/admin/update-student?id=${studentId}`, { cache: 'no-store' }),
      ])

      const overviewResult = await overviewResponse.json()
      const accountResult = accountResponse.ok ? await accountResponse.json() : null

      if (!overviewResponse.ok) {
        throw new Error(overviewResult.error || 'Không thể tải hồ sơ học sinh')
      }

      setOverview(overviewResult)
      setAccountInfo(accountResult)
      setProfileForm({
        fullName: overviewResult.profile?.full_name || '',
        phone: overviewResult.profile?.phone || '',
        parentName: overviewResult.profile?.parent_name || '',
        parentPhone: overviewResult.profile?.parent_phone || '',
      })
      setPaymentDrafts(buildPaymentDrafts(overviewResult.packages || []))
    } catch (error) {
      console.error('loadStudent error:', error)
      setFeedback({
        type: 'error',
        text: error.message || 'Không thể tải dữ liệu học sinh',
      })
    } finally {
      if (showLoader) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    loadStudent()
  }, [studentId])

  const progressSummary = useMemo(() => {
    const packages = overview?.packages || []

    return {
      activePackages: packages.filter((pkg) => pkg.enrollment?.status === 'active').length,
      completedPackages: packages.filter((pkg) => pkg.enrollment?.status === 'completed').length,
      completedLessons: packages.reduce((sum, pkg) => sum + (pkg.completedLessons || 0), 0),
      unpaidActivePackages: packages.filter(
        (pkg) => pkg.enrollment?.status === 'active' && pkg.payment?.status !== 'paid'
      ).length,
    }
  }, [overview])

  const isBusy = (key) => actionKey === key

  function showFeedback(type, text) {
    setFeedback({ type, text })
  }

  function updateProfileField(field, value) {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function updatePaymentDraft(levelId, field, value) {
    setPaymentDrafts((current) => ({
      ...current,
      [levelId]: {
        ...current[levelId],
        [field]: value,
      },
    }))
  }

  async function handleSaveProfile(event) {
    event.preventDefault()
    setActionKey('profile')
    setGeneratedPassword('')
    setFeedback(null)

    try {
      const response = await fetch('/api/admin/update-student', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          fullName: profileForm.fullName,
          phone: profileForm.phone,
          parentName: profileForm.parentName,
          parentPhone: profileForm.parentPhone,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Không thể cập nhật thông tin học sinh')
      }

      showFeedback('success', 'Đã cập nhật thông tin học sinh')
      await loadStudent(false)
    } catch (error) {
      showFeedback('error', error.message)
    } finally {
      setActionKey('')
    }
  }

  async function handleResetPassword(useCustomPassword) {
    setActionKey('password')
    setFeedback(null)

    try {
      const response = await fetch('/api/admin/update-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          newPassword: useCustomPassword ? passwordInput : undefined,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Không thể đổi mật khẩu')
      }

      setGeneratedPassword(result.password || '')
      setPasswordInput('')
      showFeedback(
        'success',
        'Đã đặt lại mật khẩu. Hãy gửi mật khẩu mới cho học sinh hoặc phụ huynh.'
      )
      await loadStudent(false)
    } catch (error) {
      showFeedback('error', error.message)
    } finally {
      setActionKey('')
    }
  }

  async function handleEnrollmentStatus(levelId, status, successMessage) {
    setActionKey(`enrollment-${levelId}-${status}`)
    setFeedback(null)

    try {
      const response = await fetch(`/api/admin/students/${studentId}/overview`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setEnrollmentStatus',
          levelId,
          status,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Không thể cập nhật trạng thái gói học')
      }

      showFeedback('success', successMessage)
      await loadStudent(false)
    } catch (error) {
      showFeedback('error', error.message)
    } finally {
      setActionKey('')
    }
  }

  async function handleRecordPayment(levelId) {
    const draft = paymentDrafts[levelId]
    const amount = Number(draft?.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      showFeedback('error', 'Số tiền phải lớn hơn 0')
      return
    }

    setActionKey(`payment-record-${levelId}`)
    setFeedback(null)

    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recordPayment',
          studentId,
          levelId,
          amount,
          method: draft.method,
          status: draft.status,
          transactionId: draft.transactionId,
          autoActivate: draft.autoActivate,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Không thể ghi nhận thanh toán')
      }

      showFeedback(
        'success',
        draft.status === 'paid'
          ? 'Đã ghi nhận đã thu tiền cho gói học'
          : 'Đã tạo phiếu chờ thanh toán cho gói học'
      )
      await loadStudent(false)
    } catch (error) {
      showFeedback('error', error.message)
    } finally {
      setActionKey('')
    }
  }

  async function handlePaymentStatus(paymentId, status, autoActivate, successMessage) {
    setActionKey(`payment-status-${paymentId}-${status}`)
    setFeedback(null)

    try {
      const response = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updatePaymentStatus',
          paymentId,
          status,
          autoActivate,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Không thể cập nhật trạng thái thanh toán')
      }

      showFeedback('success', successMessage)
      await loadStudent(false)
    } catch (error) {
      showFeedback('error', error.message)
    } finally {
      setActionKey('')
    }
  }

  function renderBadge(stateMap, status) {
    const view = stateMap[status] || stateMap.none || stateMap.inactive
    return (
      <span className={`${styles.badge} ${styles[view.tone]}`}>
        {view.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Chi tiết học sinh</h2>
          <p className={styles.curriculumLead}>Đang tải hồ sơ học sinh...</p>
        </div>
      </div>
    )
  }

  if (!overview?.profile) {
    return (
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Chi tiết học sinh</h2>
          <p className={styles.curriculumLead}>Không tìm thấy học sinh này.</p>
        </div>
      </div>
    )
  }

  const studentName = profileForm.fullName || overview.profile.full_name || 'Học sinh'
  const studentInitial = studentName.charAt(0).toUpperCase()

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Chi tiết học sinh</h2>
          <p className={styles.curriculumLead}>
            Ghi nhận thanh toán thủ công, kích hoạt gói học và kiểm tra tiến độ tại cùng một nơi.
          </p>
        </div>
        <div className={styles.quickActions}>
          <Link href="/admin/students" className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}>
            ← Danh sách học sinh
          </Link>
          <Link href={`/admin/payments?studentId=${studentId}`} className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}>
            Sổ thanh toán
          </Link>
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

      <div className={styles.detailHeader}>
        <div className={styles.detailAvatar}>{studentInitial}</div>
        <div style={{ flex: 1 }}>
          <div className={styles.detailName}>{studentName}</div>
          <div className={styles.studentPackageCatalogMeta}>
            <span className={styles.studentPackageTag}>
              Tạo ngày {formatDate(overview.profile.created_at)}
            </span>
            <span className={styles.studentPackageTag}>
              {accountInfo?.email || 'Chưa có email'}
            </span>
            <span className={styles.studentPackageTag}>
              {progressSummary.activePackages} gói đang học
            </span>
          </div>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionCardHeader}>Thông tin học sinh</div>
        <form className={styles.accountSection} onSubmit={handleSaveProfile}>
          <div className={styles.accountGrid}>
            <label className={styles.accountField}>
              <span className={styles.accountLabel}>Họ tên</span>
              <input
                className={styles.formInput}
                value={profileForm.fullName}
                onChange={(event) => updateProfileField('fullName', event.target.value)}
              />
            </label>
            <label className={styles.accountField}>
              <span className={styles.accountLabel}>Số điện thoại</span>
              <input
                className={styles.formInput}
                value={profileForm.phone}
                onChange={(event) => updateProfileField('phone', event.target.value)}
              />
            </label>
            <label className={styles.accountField}>
              <span className={styles.accountLabel}>Phụ huynh</span>
              <input
                className={styles.formInput}
                value={profileForm.parentName}
                onChange={(event) => updateProfileField('parentName', event.target.value)}
              />
            </label>
            <label className={styles.accountField}>
              <span className={styles.accountLabel}>Điện thoại phụ huynh</span>
              <input
                className={styles.formInput}
                value={profileForm.parentPhone}
                onChange={(event) => updateProfileField('parentPhone', event.target.value)}
              />
            </label>
          </div>
          <div className={styles.accountActions}>
            <button
              type="submit"
              className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
              disabled={isBusy('profile')}
            >
              {isBusy('profile') ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </form>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionCardHeader}>Tài khoản đăng nhập</div>
        <div className={styles.accountSection}>
          <div className={styles.accountGrid}>
            <div className={styles.accountField}>
              <span className={styles.accountLabel}>Email đăng nhập</span>
              <span className={styles.accountValue}>{accountInfo?.email || '—'}</span>
            </div>
            <div className={styles.accountField}>
              <span className={styles.accountLabel}>Xác nhận email</span>
              <span className={styles.accountValue}>
                {accountInfo?.emailConfirmedAt ? formatDate(accountInfo.emailConfirmedAt, true) : 'Chưa xác nhận'}
              </span>
            </div>
            <div className={styles.accountField}>
              <span className={styles.accountLabel}>Lần đăng nhập gần nhất</span>
              <span className={styles.accountValue}>
                {accountInfo?.lastSignInAt ? formatDate(accountInfo.lastSignInAt, true) : 'Chưa đăng nhập'}
              </span>
            </div>
            <div className={styles.accountField}>
              <span className={styles.accountLabel}>Mật khẩu hiện tại</span>
              <span className={styles.accountValue}>Không thể xem do Supabase chỉ lưu hash</span>
            </div>
          </div>

          <p className={styles.accountNote}>
            Nếu admin kích hoạt gói học trước khi thu tiền, dashboard sẽ tính gói đó vào nhóm đang học chưa thu tiền cho đến khi có giao dịch đã thu.
          </p>

          <div className={styles.accountActions}>
            <input
              type="password"
              value={passwordInput}
              onChange={(event) => setPasswordInput(event.target.value)}
              placeholder="Nhập mật khẩu mới hoặc để trống để tạo tạm"
              className={`${styles.formInput} ${styles.accountPasswordInput}`}
            />
            <button
              type="button"
              className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
              onClick={() => handleResetPassword(Boolean(passwordInput))}
              disabled={isBusy('password')}
            >
              {isBusy('password')
                ? 'Đang đổi mật khẩu...'
                : passwordInput
                  ? 'Đặt mật khẩu này'
                  : 'Tạo mật khẩu tạm'}
            </button>
          </div>

          {generatedPassword && (
            <div className={styles.accountPasswordResult}>
              <span className={styles.accountLabel}>Mật khẩu mới</span>
              <code>{generatedPassword}</code>
            </div>
          )}
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionCardHeader}>Gói học & thanh toán</div>
        <p className={styles.studentSectionNote}>
          Tất cả gói học đang có trong hệ thống đều hiện ở đây. Admin có thể kích hoạt trực tiếp, tạo phiếu chờ thu hoặc ghi nhận đã thu và kích hoạt ngay cho từng gói.
        </p>

        <div className={styles.studentPackageGrid}>
          {(overview.packages || []).map((pkg) => {
            const draft = paymentDrafts[pkg.id] || {}
            const hasActiveAccess =
              pkg.enrollment?.status === 'active' || pkg.enrollment?.status === 'completed'

            return (
              <article
                key={pkg.id}
                className={`${styles.studentPackageCard} ${
                  hasActiveAccess ? styles.studentPackageCardActive : ''
                }`}
              >
                <div className={styles.studentPackageHeader}>
                  <div className={styles.studentPackageTitleRow}>
                    <div>
                      <h3 className={styles.studentPackageTitle}>{pkg.name}</h3>
                      <p className={styles.studentPackageDescription}>
                        {pkg.description || 'Gói học chưa có mô tả chi tiết.'}
                      </p>
                    </div>
                    <div className={styles.studentPackageStatusRow}>
                      {renderBadge(enrollmentStateMap, pkg.enrollment?.status || 'inactive')}
                      {renderBadge(paymentStateMap, pkg.payment?.status || 'none')}
                    </div>
                  </div>

                  <div className={styles.studentPackageCatalogMeta}>
                    <span className={styles.studentPackageTag}>{formatCurrency(pkg.price)}</span>
                    <span className={styles.studentPackageTag}>{pkg.totalLessons} môn học</span>
                    <span className={styles.studentPackageTag}>
                      {pkg.durationWeeks ? `${pkg.durationWeeks} tuần` : 'Chưa đặt thời lượng'}
                    </span>
                  </div>
                </div>

                <div className={styles.studentPackageProgress}>
                  <div className={styles.studentPackageProgressHead}>
                    <span>
                      Tiến độ: <strong>{pkg.completedLessons}/{pkg.totalLessons} môn</strong>
                    </span>
                    <strong>{pkg.percentage}%</strong>
                  </div>
                  <div className={styles.studentPackageProgressBar}>
                    <div
                      className={styles.studentPackageProgressFill}
                      style={{ width: `${pkg.percentage}%` }}
                    />
                  </div>
                </div>

                <div className={styles.studentPackageMetaGrid}>
                  <div className={styles.studentPackageMetaItem}>
                    <span className={styles.studentPackageMetaLabel}>Trạng thái gói</span>
                    <span className={styles.studentPackageMetaValue}>
                      {enrollmentStateMap[pkg.enrollment?.status || 'inactive']?.label}
                    </span>
                  </div>
                  <div className={styles.studentPackageMetaItem}>
                    <span className={styles.studentPackageMetaLabel}>Bài tiếp theo</span>
                    <span className={styles.studentPackageMetaValue}>
                      {pkg.nextSubject?.name || 'Đã hoàn thành toàn bộ'}
                    </span>
                  </div>
                  <div className={styles.studentPackageMetaItem}>
                    <span className={styles.studentPackageMetaLabel}>Kích hoạt lúc</span>
                    <span className={styles.studentPackageMetaValue}>
                      {pkg.enrollment?.enrolledAt ? formatDate(pkg.enrollment.enrolledAt, true) : 'Chưa kích hoạt'}
                    </span>
                  </div>
                  <div className={styles.studentPackageMetaItem}>
                    <span className={styles.studentPackageMetaLabel}>Hoàn thành lúc</span>
                    <span className={styles.studentPackageMetaValue}>
                      {pkg.enrollment?.completedAt ? formatDate(pkg.enrollment.completedAt, true) : '—'}
                    </span>
                  </div>
                </div>

                <div className={styles.studentPackageFinance}>
                  <div className={styles.studentPackageFinanceHead}>
                    <div>
                      <div className={styles.studentPackageFinanceLabel}>Thanh toán gần nhất</div>
                      <div className={styles.studentPackageFinanceValue}>
                        {pkg.payment ? formatCurrency(pkg.payment.amount) : 'Chưa ghi nhận'}
                      </div>
                    </div>
                    {renderBadge(paymentStateMap, pkg.payment?.status || 'none')}
                  </div>

                  <div className={styles.studentPackageFinanceMeta}>
                    <span>Phương thức: {paymentMethodMap[pkg.payment?.method] || '—'}</span>
                    <span>Mã giao dịch: {pkg.payment?.transactionId || '—'}</span>
                    <span>
                      {pkg.payment?.status === 'paid'
                        ? `Đã thu lúc ${formatDate(pkg.payment?.paidAt, true)}`
                        : `Ghi nhận lúc ${formatDate(pkg.payment?.createdAt, true)}`}
                    </span>
                  </div>

                  <p className={styles.studentPackageFinanceNote}>
                    Dashboard chỉ cộng doanh thu khi giao dịch ở trạng thái đã thu. Gói đang học nhưng chưa có giao dịch đã thu sẽ nằm trong nhóm đang học chưa thu tiền.
                  </p>
                </div>

                <div className={styles.studentPackageComposer}>
                  <div className={styles.studentPackageComposerGrid}>
                    <label>
                      <span className={styles.formLabel}>Số tiền</span>
                      <input
                        type="number"
                        min="0"
                        className={styles.formInput}
                        value={draft.amount || ''}
                        onChange={(event) => updatePaymentDraft(pkg.id, 'amount', event.target.value)}
                      />
                    </label>
                    <label>
                      <span className={styles.formLabel}>Phương thức</span>
                      <select
                        className={styles.formInput}
                        value={draft.method || 'bank_transfer'}
                        onChange={(event) => updatePaymentDraft(pkg.id, 'method', event.target.value)}
                      >
                        {Object.entries(paymentMethodMap).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className={styles.formLabel}>Trạng thái phiếu</span>
                      <select
                        className={styles.formInput}
                        value={draft.status || 'paid'}
                        onChange={(event) => updatePaymentDraft(pkg.id, 'status', event.target.value)}
                      >
                        <option value="paid">Đã thu</option>
                        <option value="pending">Chờ thanh toán</option>
                      </select>
                    </label>
                    <label>
                      <span className={styles.formLabel}>Mã giao dịch / ghi chú</span>
                      <input
                        className={styles.formInput}
                        value={draft.transactionId || ''}
                        onChange={(event) => updatePaymentDraft(pkg.id, 'transactionId', event.target.value)}
                        placeholder="VD: CK-2803-001"
                      />
                    </label>
                  </div>

                  <label className={styles.studentPackageCheckbox}>
                    <input
                      type="checkbox"
                      checked={draft.autoActivate !== false}
                      onChange={(event) => updatePaymentDraft(pkg.id, 'autoActivate', event.target.checked)}
                    />
                    <span>Tự kích hoạt gói khi phiếu ở trạng thái đã thu</span>
                  </label>

                  <button
                    type="button"
                    className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
                    onClick={() => handleRecordPayment(pkg.id)}
                    disabled={isBusy(`payment-record-${pkg.id}`)}
                  >
                    {isBusy(`payment-record-${pkg.id}`)
                      ? 'Đang lưu giao dịch...'
                      : 'Ghi nhận thanh toán'}
                  </button>
                </div>

                <div className={styles.studentPackageActions}>
                  {!pkg.enrollment && (
                    <button
                      type="button"
                      className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
                      onClick={() => handleEnrollmentStatus(pkg.id, 'active', `Đã kích hoạt ${pkg.name}`)}
                      disabled={isBusy(`enrollment-${pkg.id}-active`)}
                    >
                      Kích hoạt gói
                    </button>
                  )}

                  {pkg.enrollment?.status === 'active' && (
                    <>
                      <button
                        type="button"
                        className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
                        onClick={() => handleEnrollmentStatus(pkg.id, 'paused', `Đã tạm dừng ${pkg.name}`)}
                        disabled={isBusy(`enrollment-${pkg.id}-paused`)}
                      >
                        Tạm dừng
                      </button>
                      <button
                        type="button"
                        className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
                        onClick={() => handleEnrollmentStatus(pkg.id, 'completed', `Đã đánh dấu hoàn thành ${pkg.name}`)}
                        disabled={isBusy(`enrollment-${pkg.id}-completed`)}
                      >
                        Đánh dấu hoàn thành
                      </button>
                    </>
                  )}

                  {pkg.enrollment?.status === 'paused' && (
                    <button
                      type="button"
                      className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
                      onClick={() => handleEnrollmentStatus(pkg.id, 'active', `Đã mở lại ${pkg.name}`)}
                      disabled={isBusy(`enrollment-${pkg.id}-active`)}
                    >
                      Mở lại
                    </button>
                  )}

                  {pkg.enrollment?.status === 'completed' && (
                    <button
                      type="button"
                      className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
                      onClick={() =>
                        handleEnrollmentStatus(
                          pkg.id,
                          'active',
                          `Đã mở lại ${pkg.name} để học sinh xem tiếp`
                        )
                      }
                      disabled={isBusy(`enrollment-${pkg.id}-active`)}
                    >
                      Mở lại
                    </button>
                  )}

                  {pkg.payment?.status === 'pending' && (
                    <button
                      type="button"
                      className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
                      onClick={() =>
                        handlePaymentStatus(
                          pkg.payment.id,
                          'paid',
                          !hasActiveAccess,
                          !hasActiveAccess
                            ? `Đã xác nhận thu tiền và kích hoạt ${pkg.name}`
                            : `Đã xác nhận thu tiền cho ${pkg.name}`
                        )
                      }
                      disabled={isBusy(`payment-status-${pkg.payment.id}-paid`)}
                    >
                      {!hasActiveAccess ? 'Xác nhận & kích hoạt' : 'Xác nhận đã thu'}
                    </button>
                  )}

                  {pkg.payment?.status === 'paid' && (
                    <button
                      type="button"
                      className={`${styles.quickActionBtn} ${styles['quickActionBtn--outline']}`}
                      onClick={() =>
                        handlePaymentStatus(
                          pkg.payment.id,
                          'refunded',
                          false,
                          `Đã ghi nhận hoàn tiền cho ${pkg.name}`
                        )
                      }
                      disabled={isBusy(`payment-status-${pkg.payment.id}-refunded`)}
                    >
                      Ghi nhận hoàn tiền
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionCardHeader}>Tiến độ học tập</div>
        <div className={styles.studentProgressSummary}>
          <div className={styles.studentProgressCard}>
            <span className={styles.studentProgressLabel}>Gói đang học</span>
            <strong className={styles.studentProgressValue}>{progressSummary.activePackages}</strong>
          </div>
          <div className={styles.studentProgressCard}>
            <span className={styles.studentProgressLabel}>Gói đã hoàn thành</span>
            <strong className={styles.studentProgressValue}>{progressSummary.completedPackages}</strong>
          </div>
          <div className={styles.studentProgressCard}>
            <span className={styles.studentProgressLabel}>Môn đã hoàn thành</span>
            <strong className={styles.studentProgressValue}>{progressSummary.completedLessons}</strong>
          </div>
          <div className={styles.studentProgressCard}>
            <span className={styles.studentProgressLabel}>Đang học chưa thu tiền</span>
            <strong className={styles.studentProgressValue}>{progressSummary.unpaidActivePackages}</strong>
          </div>
        </div>

        <div className={styles.studentProgressActivity}>
          <p className={styles.studentSectionNote}>
            Danh sách dưới đây lấy từ tiến độ học thật của học sinh, không phải dữ liệu mock.
          </p>

          <div className={styles.studentProgressList}>
            {(overview.recentCompletions || []).length === 0 ? (
              <div className={styles.studentPackageMetaItem}>
                <span className={styles.studentPackageMetaValue}>
                  Học sinh chưa hoàn thành môn học nào.
                </span>
              </div>
            ) : (
              overview.recentCompletions.map((item) => (
                <div key={item.id} className={styles.studentProgressItem}>
                  <div>
                    <div className={styles.studentProgressItemTitle}>{item.subjectName}</div>
                    <div className={styles.studentProgressItemMeta}>{item.levelName}</div>
                  </div>
                  <span className={`${styles.badge} ${styles['badge--completed']}`}>
                    Hoàn thành
                  </span>
                  <span className={styles.studentProgressDate}>
                    {formatDate(item.completedAt, true)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
