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

  // --- New Blog Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newBlogForm, setNewBlogForm] = useState({ title: '', slug: '', cover_image_url: '' })
  const [creating, setCreating] = useState(false)

  const handleNewBlogTitleChange = (val) => {
      // Auto-generate slug while typing title if they haven't explicitly edited the slug
      const slug = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
      setNewBlogForm(prev => ({ ...prev, title: val, slug }))
  }

  const handleCreateBlog = async (e) => {
      e.preventDefault()
      if (!newBlogForm.title || !newBlogForm.slug) return
      
      setCreating(true)
      setFeedback(null)
      try {
          const { data: { session } } = await supabase.auth.getSession()
          
          const payload = {
              title: newBlogForm.title,
              slug: newBlogForm.slug,
              cover_image_url: newBlogForm.cover_image_url,
              is_published: false,
              content: '' // Explicit empty content
          }
          if (session?.user) {
              payload.author_id = session.user.id
          }

          const { data, error } = await supabase.from('blogs').insert([payload]).select().single()
          
          if (error) throw error
          
          // Redirect to the newly created ID to use the full MDEditor
          router.push(`/admin/blogs/${data.id}`)

      } catch (err) {
          console.error(err)
          setFeedback({ type: 'error', text: err.message || 'Lỗi khi tạo mới!' })
          setCreating(false)
      }
  }

  // --- /New Blog Modal State ---

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
          onClick={() => setIsModalOpen(true)}
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

      {/* --- Topup Modal: Create New Post --- */}
      {isModalOpen && (
        <div className={styles.modalOverlay} style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', 
            backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', 
            justifyContent: 'center', alignItems: 'center', padding: '1rem'
        }}>
            <form onSubmit={handleCreateBlog} className={styles.modalContent} style={{
                background: '#fff', padding: '2rem', borderRadius: '16px',
                width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex', flexDirection: 'column', gap: '1.5rem',
                border: '1px solid rgba(108, 92, 231, 0.1)'
            }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--color-slate-800)' }}>Khởi tạo bài viết mới</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-slate-500)' }}>Nhập tiêu đề để bắt đầu, các thiết lập khác có thể bổ sung sau.</p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-slate-700)' }}>Tiêu đề (Title)</span>
                        <input
                            required
                            type="text"
                            value={newBlogForm.title}
                            onChange={(e) => handleNewBlogTitleChange(e.target.value)}
                            placeholder="Ví dụ: Học AI từ đâu?"
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-gray-200)', width: '100%' }}
                            autoFocus
                        />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-slate-700)' }}>Đường dẫn tĩnh (Slug)</span>
                        <input
                            required
                            type="text"
                            value={newBlogForm.slug}
                            onChange={(e) => setNewBlogForm(prev => ({ ...prev, slug: e.target.value }))}
                            placeholder="hoc-ai-tu-dau"
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-gray-200)', width: '100%', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--color-slate-600)', backgroundColor: '#f8fafc' }}
                        />
                    </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)}
                        disabled={creating}
                        style={{ padding: '0.75rem 1.25rem', border: '1px solid var(--color-gray-200)', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        type="submit" 
                        disabled={creating}
                        style={{ padding: '0.75rem 1.25rem', border: 'none', borderRadius: '8px', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                    >
                        {creating ? 'Đang khởi tạo...' : 'Tạo và Viết bài →'}
                    </button>
                </div>
            </form>
        </div>
      )}
      
    </>
  )
}
