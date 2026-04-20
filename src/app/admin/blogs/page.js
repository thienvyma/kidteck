'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import DataTable from '@/components/admin/DataTable'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import styles from '../admin.module.css'

export default function BlogsAdminPage() {
  const router = useRouter()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState(null)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [filter, setFilter] = useState('all')

  const fetchBlogs = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/blogs', { cache: 'no-store' })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || 'Khong the tai danh sach bai viet')
      }

      setBlogs(
        (payload.blogs || []).map((blog) => ({
          ...blog,
          status: blog.is_published ? 'published' : 'draft',
          publishedDate: blog.published_at
            ? new Date(blog.published_at).toLocaleDateString('vi-VN')
            : '—',
          createdDate: new Date(blog.created_at).toLocaleDateString('vi-VN'),
        }))
      )
    } catch (err) {
      console.error('Blogs fetch error:', err)
      setFeedback({ type: 'error', text: 'Khong the tai danh sach bai viet' })
    } finally {
      setLoading(false)
    }
  }, [])

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
      const response = await fetch(`/api/admin/blogs/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || 'Loi khi xoa bai viet')
      }

      setFeedback({
        type: 'success',
        text: `Da xoa bai viet "${deleteTarget.title}"`,
      })
      setDeleteTarget(null)
      fetchBlogs()
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error.message || 'Loi khi xoa bai viet',
      })
    } finally {
      setDeleting(false)
    }
  }

  const renderStatus = (status) => {
    if (status === 'published') {
      return <span className={`${styles.badge} ${styles['badge--active']}`}>Da xuat ban</span>
    }
    return <span className={`${styles.badge} ${styles['badge--inactive']}`}>Ban nhap</span>
  }

  const columns = [
    { key: 'title', label: 'Tieu de bai viet' },
    { key: 'slug', label: 'URL Slug' },
    { key: 'status', label: 'Trang thai', render: renderStatus },
    { key: 'publishedDate', label: 'Ngay dang' },
    { key: 'createdDate', label: 'Ngay tao' },
  ]

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newBlogForm, setNewBlogForm] = useState({ title: '', slug: '', cover_image_url: '' })
  const [creating, setCreating] = useState(false)

  const handleNewBlogTitleChange = (value) => {
    const slug = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    setNewBlogForm((prev) => ({ ...prev, title: value, slug }))
  }

  const handleCreateBlog = async (e) => {
    e.preventDefault()
    if (!newBlogForm.title || !newBlogForm.slug) return

    setCreating(true)
    setFeedback(null)

    try {
      const response = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newBlogForm.title,
          slug: newBlogForm.slug,
          cover_image_url: newBlogForm.cover_image_url,
          is_published: false,
          content: '',
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Loi khi tao moi')
      }

      router.push(`/admin/blogs/${result.blog.id}`)
    } catch (err) {
      console.error(err)
      setFeedback({ type: 'error', text: err.message || 'Loi khi tao moi!' })
      setCreating(false)
    }
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Quan ly Blog / Tin tuc</h2>
          <p className={styles.curriculumLead} style={{ marginTop: '0.5rem' }}>
            Quan ly cac bai viet chuan SEO de thu hut luu luong truy cap.
          </p>
        </div>
        <button
          className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
          onClick={() => setIsModalOpen(true)}
        >
          + Viet bai moi
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
              ? 'Tat ca'
              : item === 'published'
                ? 'Da xuat ban'
                : 'Ban nhap'}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredBlogs}
        searchKey="title"
        loading={loading}
        emptyMessage="Chua co bai viet nao"
        actions={[
          {
            label: 'Chinh sua',
            onClick: (row) => router.push(`/admin/blogs/${row.id}`),
          },
          {
            label: 'Xoa',
            onClick: (row) => setDeleteTarget(row),
            disabled: () => deleting,
          },
        ]}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xoa bai viet"
        message={
          deleteTarget
            ? `Ban co chac muon xoa bai viet "${deleteTarget.title}"? Thao tac nay khong the hoan tac.`
            : ''
        }
        confirmText="Xoa bai"
        cancelText="Huy"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteBlog}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null)
        }}
      />

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
          }}
        >
          <form
            onSubmit={handleCreateBlog}
            className={styles.modalContent}
            style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              border: '1px solid rgba(108, 92, 231, 0.1)',
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  margin: '0 0 0.5rem 0',
                  color: 'var(--color-slate-800)',
                }}
              >
                Khoi tao bai viet moi
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-slate-500)' }}>
                Nhap tieu de de bat dau, cac thiet lap khac co the bo sung sau.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-slate-700)',
                  }}
                >
                  Tieu de (Title)
                </span>
                <input
                  required
                  type="text"
                  value={newBlogForm.title}
                  onChange={(e) => handleNewBlogTitleChange(e.target.value)}
                  placeholder="Vi du: Hoc AI tu dau?"
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-gray-200)',
                    width: '100%',
                  }}
                  autoFocus
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-slate-700)',
                  }}
                >
                  Duong dan tinh (Slug)
                </span>
                <input
                  required
                  type="text"
                  value={newBlogForm.slug}
                  onChange={(e) =>
                    setNewBlogForm((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="hoc-ai-tu-dau"
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-gray-200)',
                    width: '100%',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: 'var(--color-slate-600)',
                    backgroundColor: '#f8fafc',
                  }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={creating}
                style={{
                  padding: '0.75rem 1.25rem',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: '8px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Huy bo
              </button>
              <button
                type="submit"
                disabled={creating}
                style={{
                  padding: '0.75rem 1.25rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {creating ? 'Dang khoi tao...' : 'Tao va Viet bai →'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
