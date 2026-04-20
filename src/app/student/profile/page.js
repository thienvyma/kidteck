'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import PageSkeleton from '@/components/student/PageSkeleton'
import styles from '../student.module.css'

export default function ProfilePage() {
  const [supabase] = useState(() => createClient())
  const [profile, setProfile] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [github, setGithub] = useState('')
  const [website, setWebsite] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/student/profile', { cache: 'no-store' })
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error || 'Không thể tải hồ sơ')
        }

        const prof = payload.profile
        const enrollmentRows = payload.enrollments || []

        setProfile(prof)
        setGithub(prof?.avatar_url || '')
        setWebsite(prof?.website_url || '')
        setEnrollments(
          enrollmentRows.map((item) => ({
            id: item.id,
            level: item.levels?.name || '—',
            status: item.status,
            date: new Date(item.enrolled_at).toLocaleDateString('vi-VN'),
          }))
        )
      } catch (error) {
        console.error('Profile fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSave = async () => {
    if (!profile?.id) {
      return
    }

    setSaving(true)
    setMessage('')

    const response = await fetch('/api/student/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        avatarUrl: github,
        websiteUrl: website,
      }),
    })
    const payload = await response.json()

    if (!response.ok) {
      setMessage(`❌ Lỗi: ${payload.error}`)
    } else {
      setMessage('✅ Đã lưu!')
    }
    setSaving(false)
  }

  const handleSavePassword = async () => {
    setPasswordMessage('')

    if (!oldPassword) {
      setPasswordMessage('❌ Lỗi: Vui lòng nhập mật khẩu hiện tại.')
      return
    }

    if (password.length < 6) {
      setPasswordMessage('❌ Lỗi: Mật khẩu mới phải có ít nhất 6 ký tự.')
      return
    }

    if (password !== confirmPassword) {
      setPasswordMessage('❌ Lỗi: Xác nhận mật khẩu không khớp.')
      return
    }

    setPasswordSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      setPasswordMessage('❌ Lỗi: Không tìm thấy thông tin phiên đăng nhập.')
      setPasswordSaving(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    })

    if (signInError) {
      setPasswordMessage('❌ Lỗi: Mật khẩu hiện tại không đúng.')
      setPasswordSaving(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setPasswordMessage(`❌ Lỗi: ${error.message}`)
    } else {
      setPasswordMessage('✅ Đổi mật khẩu thành công!')
      setOldPassword('')
      setPassword('')
      setConfirmPassword('')
    }
    setPasswordSaving(false)
  }

  const renderStatus = (status) => {
    const map = {
      active: 'Đang học',
      completed: 'Hoàn thành',
      paused: 'Tạm dừng',
      cancelled: 'Đã hủy',
    }
    return map[status] || status
  }

  if (loading) {
    return <PageSkeleton variant="profile" />
  }

  const initials = (profile?.full_name || 'S')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Hồ sơ cá nhân</h2>
      </div>

      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>{initials}</div>
        <div>
          <h3 className={styles.profileName}>{profile?.full_name}</h3>
          <p className={styles.profileEmail}>{profile?.email}</p>
        </div>
      </div>

      <div className={styles.profileCard}>
        <h4 className={styles.profileCardTitle}>Thông tin liên hệ</h4>
        <div className={styles.profileGrid}>
          <div className={styles.profileField}>
            <span className={styles.profileFieldLabel}>Điện thoại</span>
            <span>{profile?.phone || '—'}</span>
          </div>
          <div className={styles.profileField}>
            <span className={styles.profileFieldLabel}>Phụ huynh</span>
            <span>{profile?.parent_name || '—'}</span>
          </div>
          <div className={styles.profileField}>
            <span className={styles.profileFieldLabel}>SĐT phụ huynh</span>
            <span>{profile?.parent_phone || '—'}</span>
          </div>
        </div>
        <p className={styles.profileNote}>Liên hệ admin để thay đổi thông tin cá nhân.</p>
      </div>

      <div className={styles.profileCard}>
        <h4 className={styles.profileCardTitle}>Lịch sử đăng ký</h4>
        {enrollments.length === 0 ? (
          <p style={{ color: 'var(--color-gray-500)' }}>Chưa đăng ký khóa nào.</p>
        ) : (
          <table className={styles.profileTable}>
            <thead>
              <tr>
                <th>Level</th>
                <th>Trạng thái</th>
                <th>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((item) => (
                <tr key={item.id}>
                  <td>{item.level}</td>
                  <td>{renderStatus(item.status)}</td>
                  <td>{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.profileCard}>
        <h4 className={styles.profileCardTitle}>Portfolio</h4>
        <div className={styles.profileField}>
          <label className={styles.profileFieldLabel}>GitHub URL</label>
          <input
            type="url"
            value={github}
            onChange={(event) => setGithub(event.target.value)}
            placeholder="https://github.com/username"
            className={styles.profileInput}
          />
        </div>
        <div className={styles.profileField}>
          <label className={styles.profileFieldLabel}>Website</label>
          <input
            type="url"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            placeholder="https://myportfolio.com"
            className={styles.profileInput}
          />
        </div>
        {message && (
          <p
            style={{
              color: message.startsWith('✅') ? 'var(--color-success)' : 'var(--color-error)',
              fontWeight: 500,
              marginTop: 'var(--space-sm)',
            }}
          >
            {message}
          </p>
        )}
        <button onClick={handleSave} disabled={saving} className={styles.profileSaveBtn}>
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      <div className={styles.profileCard}>
        <h4 className={styles.profileCardTitle}>Đổi mật khẩu</h4>
        <div className={styles.profileField}>
          <label className={styles.profileFieldLabel}>Mật khẩu hiện tại</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
            placeholder="Nhập mật khẩu hiện tại"
            className={styles.profileInput}
          />
        </div>
        <div className={styles.profileField}>
          <label className={styles.profileFieldLabel}>Mật khẩu mới</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhập ít nhất 6 ký tự"
            className={styles.profileInput}
          />
        </div>
        <div className={styles.profileField}>
          <label className={styles.profileFieldLabel}>Xác nhận mật khẩu</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            className={styles.profileInput}
          />
        </div>
        {passwordMessage && (
          <p
            style={{
              color: passwordMessage.startsWith('✅')
                ? 'var(--color-success)'
                : 'var(--color-error)',
              fontWeight: 500,
              marginTop: 'var(--space-sm)',
            }}
          >
            {passwordMessage}
          </p>
        )}
        <button
          onClick={handleSavePassword}
          disabled={passwordSaving}
          className={styles.profileSaveBtn}
        >
          {passwordSaving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </button>
      </div>
    </>
  )
}
