'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import DataTable from '@/components/admin/DataTable'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import styles from '../admin.module.css'

export default function BlogsAdminPage() {
  const [supabase] = useState(() => createClient())
  const router = useRouter()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState(null)
  
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [filter, setFilter] = useState('all') // 'all', 'published', 'draft'

  const fetchBlogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`id, title, slug, is_published, published_at, created_at`)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setBlogs(
        (data || []).map((b) => ({
          ...b,
          status: b.is_published ? 'published' : 'draft',
          publishedDate: b.published_at
            ? new Date(b.published_at).toLocaleDateString('vi-VN')
            : '—',
          createdDate: new Date(b.created_at).toLocaleDateString('vi-VN'),
        }))
      )
    } catch (err) {
      console.error('Blogs fetch error:', err)
      setFeedback({ type: 'error', text: 'Không thể tải danh sách bài viết' })
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  const filteredBlogs = useMemo(() => {
    if (filter === 'all') return blogs
    return blogs.filter((blog) => blog.status === filter)
  }, [blogs, filter])

  async function handleDeleteBlog() {
    if (!deleteTarget?.id) return

    setDeleting(true)
    setFeedback(null)

    try {
      const { error } = await supabase.from('blogs').delete().eq('id', deleteTarget.id)

      if (error) throw error

      setFeedback({
        type: 'success',
        text: `Đã xóa bài viết "${deleteTarget.title}"`,
      })
      setDeleteTarget(null)
      fetchBlogs()
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error.message || 'Lỗi khi xóa bài viết',
      })
    } finally {
      setDeleting(false)
    }
  }

  const renderStatus = (status) => {
    if (status === 'published') {
      return <span className={`${styles.badge} ${styles['badge--active']}`}>Đã xuất bản</span>
    }
    return <span className={`${styles.badge} ${styles['badge--inactive']}`}>Bản nháp</span>
  }

  const columns = [
    { key: 'title', label: 'Tiêu đề bài viết' },
    { key: 'slug', label: 'URL Slug' },
    { key: 'status', label: 'Trạng thái', render: renderStatus },
    { key: 'publishedDate', label: 'Ngày đăng' },
    { key: 'createdDate', label: 'Ngày tạo' },
  ]

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Quản lý Blog / Tin tức</h2>
          <p className={styles.curriculumLead} style={{ marginTop: '0.5rem' }}>
            Quản lý các bài viết chuẩn SEO để thu hút lưu lượng truy cập (Traffic).
          </p>
        </div>
        <button
          className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
          onClick={() => router.push('/admin/blogs/new')}
        >
          + Viết bài mới
        </button>
      </div>

      {feedback && (
        <div
          className={`${styles.feedbackBanner} ${
            feedback.type === 'success' ? styles.feedbackBannerSuccess : styles.feedbackBannerError
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className={styles.filterBar}>
        {['all', 'published', 'draft'].map((item) => (
          <button
            key={item}
            className={`${styles.filterBtn} ${filter === item ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter(item)}
          >
            {item === 'all'
              ? 'Tất cả'
              : item === 'published'
              ? 'Đã xuất bản'
              : 'Bản nháp'}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredBlogs}
        searchKey="title"
        loading={loading}
        emptyMessage="Chưa có bài viết nào"
        actions={[
          {
            label: 'Chỉnh sửa',
            onClick: (row) => router.push(`/admin/blogs/${row.id}`),
          },
          {
            label: 'Xóa',
            onClick: (row) => setDeleteTarget(row),
            disabled: () => deleting,
          },
        ]}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xóa bài viết"
        message={
          deleteTarget
            ? `Bạn có chắc muốn xóa bài viết "${deleteTarget.title}"? Thao tác này không thể hoàn tác.`
            : ''
        }
        confirmText="Xóa bài"
        cancelText="Hủy"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteBlog}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null)
        }}
      />
    </>
  )
}
