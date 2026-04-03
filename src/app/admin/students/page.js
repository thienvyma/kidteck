'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import DataTable from '@/components/admin/DataTable'
import CreateStudentModal from '@/components/admin/CreateStudentModal'
import styles from '../admin.module.css'

export default function StudentsPage() {
  const [supabase] = useState(() => createClient())
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

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

      <DataTable
        columns={columns}
        data={students}
        searchKey="full_name"
        loading={loading}
        emptyMessage="Chưa có học sinh nào"
        actions={[
          {
            label: 'Xem',
            onClick: (row) => router.push(`/admin/students/${row.id}`),
          },
        ]}
      />

      <CreateStudentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleStudentCreated}
      />
    </>
  )
}
