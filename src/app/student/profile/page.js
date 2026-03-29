'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import PageSkeleton from '@/components/student/PageSkeleton'
import styles from '../student.module.css'

export default function ProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [github, setGithub] = useState('')
  const [website, setWebsite] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile({ ...prof, email: user.email })
      setGithub(prof?.avatar_url || '')
      setWebsite(prof?.website_url || '')

      const { data: enr } = await supabase
        .from('enrollments')
        .select('*, levels(name)')
        .eq('student_id', user.id)
        .order('enrolled_at', { ascending: false })

      setEnrollments(
        (enr || []).map((e) => ({
          id: e.id,
          level: e.levels?.name || '—',
          status: e.status,
          date: new Date(e.enrolled_at).toLocaleDateString('vi-VN'),
        }))
      )
      setLoading(false)
    }
    fetch()
  }, [supabase])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: github, website_url: website })
      .eq('id', profile.id)

    if (error) {
      setMessage('❌ Lỗi: ' + error.message)
    } else {
      setMessage('✅ Đã lưu!')
    }
    setSaving(false)
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
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Hồ sơ cá nhân</h2>
      </div>

      {/* Section 1: Avatar + Name */}
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>{initials}</div>
        <div>
          <h3 className={styles.profileName}>{profile?.full_name}</h3>
          <p className={styles.profileEmail}>{profile?.email}</p>
        </div>
      </div>

      {/* Section 2: Contact info */}
      <div className={styles.profileCard}>
        <h4 className={styles.profileCardTitle}>📋 Thông tin liên hệ</h4>
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

      {/* Section 3: Enrollments */}
      <div className={styles.profileCard}>
        <h4 className={styles.profileCardTitle}>📚 Lịch sử đăng ký</h4>
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
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <td>{e.level}</td>
                  <td>{renderStatus(e.status)}</td>
                  <td>{e.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Section 4: Portfolio */}
      <div className={styles.profileCard}>
        <h4 className={styles.profileCardTitle}>🔗 Portfolio</h4>
        <div className={styles.profileField}>
          <label className={styles.profileFieldLabel}>GitHub URL</label>
          <input
            type="url"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="https://github.com/username"
            className={styles.profileInput}
          />
        </div>
        <div className={styles.profileField}>
          <label className={styles.profileFieldLabel}>Website</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://myportfolio.com"
            className={styles.profileInput}
          />
        </div>
        {message && (
          <p style={{ color: message.startsWith('✅') ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 500, marginTop: 'var(--space-sm)' }}>
            {message}
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className={styles.profileSaveBtn}
        >
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      {/* Section 5: Certificates */}
      <div className={styles.profileCard}>
        <h4 className={styles.profileCardTitle}>🏆 Chứng chỉ</h4>
        <p style={{ color: 'var(--color-gray-500)', fontStyle: 'italic' }}>
          Tính năng đang được phát triển. Sắp ra mắt! 🚀
        </p>
      </div>
    </>
  )
}
