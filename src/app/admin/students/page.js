'use client'

import { useDeferredValue, useEffect, useState, useCallback } from 'react'
import DataTable from '@/components/admin/DataTable'
import CreateStudentModal from '@/components/admin/CreateStudentModal'
import StudentDetailModal from '@/components/admin/StudentDetailModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import styles from '../admin.module.css'

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [filter, setFilter] = useState('all')
  const [activeStudentId, setActiveStudentId] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [pagination, setPagination] = useState({
    page: 0,
    perPage: 10,
    totalItems: 0,
    totalPages: 1,
  })
  const deferredSearch = useDeferredValue(search)

  const fetchStudents = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      params.set('status', filter)
      params.set('q', deferredSearch)
      params.set('page', String(page))
      params.set('perPage', '10')
      params.set('sortKey', sortKey)
      params.set('sortDir', sortDir)

      const response = await fetch(`/api/admin/students?${params.toString()}`, {
        cache: 'no-store',
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Khong the tai danh sach hoc vien')
      }

      setStudents(result.students || [])
      setPagination(
        result.pagination || {
          page: 0,
          perPage: 10,
          totalItems: 0,
          totalPages: 1,
        }
      )
    } catch (err) {
      console.error('Students fetch error:', err)
      setFeedback({
        type: 'error',
        text: 'Khong the tai danh sach hoc vien',
      })
    } finally {
      setLoading(false)
    }
  }, [deferredSearch, filter, page, sortDir, sortKey])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleStudentCreated = () => {
    setLoading(true)
    setPage(0)
    fetchStudents()
  }

  async function handleDeleteStudent() {
    if (!deleteTarget?.id) {
      return
    }

    setDeleting(true)
    setFeedback(null)

    try {
      const response = await fetch(`/api/admin/update-student?id=${deleteTarget.id}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Khong the xoa tai khoan hoc vien')
      }

      setFeedback({
        type: 'success',
        text: `Da xoa hoc vien "${deleteTarget.full_name}" va dong bo du lieu lien quan`,
      })
      setDeleteTarget(null)
      setLoading(true)
      await fetchStudents()
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error.message || 'Khong the xoa tai khoan hoc vien',
      })
    } finally {
      setDeleting(false)
    }
  }

  const renderStatus = (status) => {
    const map = {
      inactive: { label: 'Chua kich hoat', cls: styles['badge--inactive'] },
      active: { label: 'Dang hoc', cls: styles['badge--active'] },
      completed: { label: 'Hoan thanh', cls: styles['badge--completed'] },
      paused: { label: 'Tam dung', cls: styles['badge--paused'] },
      cancelled: { label: 'Da huy', cls: styles['badge--cancelled'] },
    }

    const state = map[status]
    if (!state) {
      return <span>-</span>
    }

    return <span className={`${styles.badge} ${state.cls}`}>{state.label}</span>
  }

  const columns = [
    { key: 'full_name', label: 'Ho ten' },
    { key: 'phone', label: 'Dien thoai' },
    { key: 'level', label: 'Goi hien tai' },
    { key: 'status', label: 'Trang thai', render: renderStatus },
    { key: 'created_at', label: 'Ngay dang ky' },
  ]

  return (
    <>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Quan ly Hoc sinh</h2>
        <button
          className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
          onClick={() => setShowModal(true)}
        >
          + Them hoc sinh moi
        </button>
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

      <div className={styles.filterBar}>
        {['all', 'active', 'inactive', 'completed'].map((item) => (
          <button
            key={item}
            className={`${styles.filterBtn} ${filter === item ? styles.filterBtnActive : ''}`}
            onClick={() => {
              setFilter(item)
              setPage(0)
            }}
          >
            {item === 'all'
              ? 'Tat ca'
              : item === 'active'
                ? 'Dang hoc'
                : item === 'inactive'
                  ? 'Chua kich hoat'
                  : 'Hoan thanh'}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={students}
        searchKey="full_name"
        searchValue={search}
        onSearchChange={setSearch}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={(nextSortKey, nextSortDir) => {
          setSortKey(nextSortKey)
          setSortDir(nextSortDir)
        }}
        page={pagination.page}
        onPageChange={setPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        perPage={pagination.perPage}
        loading={loading}
        emptyMessage="Chua co hoc sinh nao"
        actions={[
          {
            label: 'Ho so',
            onClick: (row) => setActiveStudentId(row.id),
          },
          {
            label: 'Xoa nhanh',
            onClick: (row) => setDeleteTarget(row),
            disabled: () => deleting,
          },
        ]}
      />

      <CreateStudentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleStudentCreated}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xoa hoc vien"
        message={
          deleteTarget
            ? `Ban co chac muon xoa hoc vien "${deleteTarget.full_name}"? Tai khoan dang nhap, profile va du lieu hoc tap se bi xoa.`
            : ''
        }
        confirmText="Xoa hoc vien"
        cancelText="Huy"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteStudent}
        onCancel={() => {
          if (!deleting) {
            setDeleteTarget(null)
          }
        }}
      />

      {activeStudentId && (
        <StudentDetailModal
          studentId={activeStudentId}
          onClose={() => setActiveStudentId(null)}
          onRefreshList={fetchStudents}
        />
      )}
    </>
  )
}
