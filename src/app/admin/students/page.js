'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import DataTable from '@/components/admin/DataTable'
import CreateStudentModal from '@/components/admin/CreateStudentModal'
import StudentDetailModal from '@/components/admin/StudentDetailModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import styles from '../admin.module.css'

export default function StudentsPage() {
  const [supabase] = useState(() => createClient())
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  
  const [filter, setFilter] = useState('all')
  const [activeStudentId, setActiveStudentId] = useState(null)

  const fetchStudents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          created_at,
          enrollments(status, enrolled_at, levels(name))
        `)
        .eq('role', 'student')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching students:', error)
        setFeedback({
          type: 'error',
          text: error.message || 'Không thể tải danh sách học viên',
        })
        return
      }

      setStudents(
        (data || []).map((student) => {
          const orderedEnrollments = [...(student.enrollments || [])].sort(
            (a, b) => new Date(b.enrolled_at || 0) - new Date(a.enrolled_at || 0)
          )
          const currentEnrollment =
            orderedEnrollments.find((item) => item.status === 'active') ||
            orderedEnrollments[0] ||
            null

          return {
            id: student.id,
            full_name: student.full_name || '—',
            phone: student.phone || '—',
            level: currentEnrollment?.levels?.name || 'Chưa kích hoạt',
            status: currentEnrollment?.status || 'inactive',
            created_at: new Date(student.created_at).toLocaleDateString('vi-VN'),
          }
        })
      )
    } catch (err) {
      console.error('Students fetch error:', err)
      setFeedback({
        type: 'error',
        text: 'Không thể tải danh sách học viên',
      })
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleStudentCreated = () => {
    setLoading(true)
    fetchStudents()
  }

  const filteredStudents = useMemo(() => {
    if (filter === 'all') return students
    return students.filter(student => student.status === filter)
  }, [students, filter])

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
        throw new Error(result.error || 'Không thể xóa tài khoản học viên')
      }

      setFeedback({
        type: 'success',
        text: `Đã xóa học viên "${deleteTarget.full_name}" và đồng bộ dữ liệu liên quan`,
      })
      setDeleteTarget(null)
      setLoading(true)
      await fetchStudents()
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error.message || 'Không thể xóa tài khoản học viên',
      })
    } finally {
      setDeleting(false)
    }
  }

  const renderStatus = (status) => {
    const map = {
      inactive: { label: 'Chưa kích hoạt', cls: styles['badge--inactive'] },
      active: { label: 'Đang học', cls: styles['badge--active'] },
      completed: { label: 'Hoàn thành', cls: styles['badge--completed'] },
      paused: { label: 'Tạm dừng', cls: styles['badge--paused'] },
      cancelled: { label: 'Đã hủy', cls: styles['badge--cancelled'] },
    }

    const state = map[status]
    if (!state) {
      return <span>—</span>
    }

    return <span className={`${styles.badge} ${state.cls}`}>{state.label}</span>
  }

  const columns = [
    { key: 'full_name', label: 'Họ tên' },
    { key: 'phone', label: 'Điện thoại' },
    { key: 'level', label: 'Gói hiện tại' },
    { key: 'status', label: 'Trạng thái', render: renderStatus },
    { key: 'created_at', label: 'Ngày đăng ký' },
  ]

  return (
    <>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Quản lý Học sinh</h2>
        <button
          className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
          onClick={() => setShowModal(true)}
        >
          + Thêm học sinh mới
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
            onClick={() => setFilter(item)}
          >
            {item === 'all'
              ? 'Tất cả'
              : item === 'active'
                ? 'Đang học'
                : item === 'inactive'
                  ? 'Chưa kích hoạt'
                  : 'Hoàn thành'}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredStudents}
        searchKey="full_name"
        loading={loading}
        emptyMessage="Chưa có học sinh nào"
        actions={[
          {
            label: 'Hồ sơ',
            onClick: (row) => setActiveStudentId(row.id),
          },
          {
            label: 'Xóa nhanh',
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
        title="Xóa học viên"
        message={
          deleteTarget
            ? `Bạn có chắc muốn xóa học viên "${deleteTarget.full_name}"? Tài khoản đăng nhập, profile và dữ liệu học tập sẽ bị xóa.`
            : ''
        }
        confirmText="Xóa học viên"
        cancelText="Hủy"
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
