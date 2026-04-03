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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const user = session?.user

        if (!user) {
          return
        }

        const [profileResult, enrollmentResult] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
          supabase
            .from('enrollments')
            .select('id, status, enrolled_at, levels(name)')
            .eq('student_id', user.id)
            .order('enrolled_at', { ascending: false }),
        ])

        const prof = profileResult.data
        const enrollmentRows = enrollmentResult.data || []

        setProfile({ ...prof, email: user.email })
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
  }, [supabase])

  const handleSave = async () => {
    if (!profile?.id) {
      return
    }

    setSaving(true)
    setMessage('')
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: github, website_url: website })
      .eq('id', profile.id)

    if (error) {
      setMessage(`❌ Lỗi: ${error.message}`)
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
        <h4 className={styles.profileCardTitle}>🔗 Portfolio</h4>
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
        <h4 className={styles.profileCardTitle}>🏆 Chứng chỉ</h4>
        <p style={{ color: 'var(--color-gray-500)', fontStyle: 'italic' }}>
          Tính năng đang được phát triển. Sắp ra mắt!
        </p>
      </div>
    </>
  )
}
