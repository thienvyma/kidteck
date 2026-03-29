'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import styles from '@/app/admin/admin.module.css'

export default function CreateStudentModal({ isOpen, onClose, onCreated }) {
  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [levels, setLevels] = useState([])
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    parentName: '',
    parentPhone: '',
    levelId: '',
  })

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const fetchLevels = async () => {
      const { data } = await supabase
        .from('levels')
        .select('id, name')
        .order('sort_order')

      setLevels(data || [])
    }

    fetchLevels()
    setError('')
    setSuccess(false)
  }, [isOpen, supabase])

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    if (form.password.length < 6) {
      setError('Mật khẩu phải >= 6 ký tự.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          parentName: form.parentName,
          parentPhone: form.parentPhone,
          levelId: form.levelId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.error?.includes('already registered')) {
          setError('Email này đã được sử dụng.')
        } else {
          setError('Lỗi: ' + (result.error || 'Unknown error'))
        }
        setLoading(false)
        return
      }

      setSuccess(true)
      setForm({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        parentName: '',
        parentPhone: '',
        levelId: '',
      })

      if (onCreated) {
        onCreated()
      }
    } catch (err) {
      setError('Lỗi hệ thống: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Thêm học sinh mới</h3>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        {success ? (
          <div className={styles.modalBody} style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h4 style={{ marginBottom: '0.5rem' }}>Tạo thành công!</h4>
            <p style={{ color: 'var(--color-gray-700)', marginBottom: '1.5rem' }}>
              Học viên sẽ xuất hiện trong danh sách ngay sau khi đóng modal.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
                onClick={() => setSuccess(false)}
              >
                Tạo thêm
              </button>
              <button className={styles.quickActionBtn} onClick={onClose}>
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.modalBody}>
            {error && <div className={styles.modalError}>⚠️ {error}</div>}

            <div className={styles.modalGrid}>
              <div className={styles.modalField}>
                <label>Họ tên học sinh *</label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  required
                  className="input"
                />
              </div>
              <div className={styles.modalField}>
                <label>SĐT học sinh *</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0912345678"
                  required
                  className="input"
                />
              </div>
            </div>

            <div className={styles.modalGrid}>
              <div className={styles.modalField}>
                <label>Email đăng nhập *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  required
                  className="input"
                />
              </div>
              <div className={styles.modalField}>
                <label>Mật khẩu *</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder=">=6 ký tự"
                  required
                  className="input"
                />
              </div>
            </div>

            <div className={styles.modalGrid}>
              <div className={styles.modalField}>
                <label>Tên phụ huynh</label>
                <input
                  name="parentName"
                  value={form.parentName}
                  onChange={handleChange}
                  placeholder="Tên bố/mẹ"
                  className="input"
                />
              </div>
              <div className={styles.modalField}>
                <label>SĐT phụ huynh</label>
                <input
                  name="parentPhone"
                  value={form.parentPhone}
                  onChange={handleChange}
                  placeholder="0901234567"
                  className="input"
                />
              </div>
            </div>

            <div className={styles.modalField}>
              <label>Kích hoạt gói ngay (tùy chọn)</label>
              <select
                name="levelId"
                value={form.levelId}
                onChange={handleChange}
                className="input"
              >
                <option value="">— Để kích hoạt sau ở trang chi tiết —</option>
                {levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
              <small style={{ color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
                Nếu kích hoạt ngay ở đây mà chưa ghi nhận thanh toán, dashboard sẽ tính vào nhóm đang học chưa thu tiền cho đến khi admin tạo giao dịch.
              </small>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.quickActionBtn}
                onClick={onClose}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className={`${styles.quickActionBtn} ${styles['quickActionBtn--primary']}`}
                disabled={loading}
              >
                {loading ? 'Đang tạo...' : 'Tạo học sinh'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
