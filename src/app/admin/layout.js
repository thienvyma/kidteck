'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/admin/Sidebar'
import styles from './admin.module.css'

export default function AdminLayout({ children }) {
  const [supabase] = useState(() => createClient())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)
  const [adminName, setAdminName] = useState('Admin')
  const router = useRouter()

  useEffect(() => {
    const checkRole = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const user = session?.user

        if (!user) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .maybeSingle()

        if (profile?.role !== 'admin') {
          router.push('/student')
          return
        }

        setAdminName(profile.full_name || 'Admin')
        setAuthorized(true)
      } catch (err) {
        console.error('Role check error:', err)
        router.push('/login')
      } finally {
        setChecking(false)
      }
    }

    checkRole()
  }, [router, supabase])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    if (sidebarOpen) {
      setSidebarOpen(false)
    }
  }

  if (checking || !authorized) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--color-light)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            color: 'var(--color-gray-500)',
          }}
        >
          Đang kiểm tra quyền truy cập...
        </div>
      </div>
    )
  }

  return (
    <div className={styles.adminLayout}>
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} adminName={adminName} />

      <div
        className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.active : ''}`}
        onClick={closeSidebar}
      />

      <div className={styles.mainWrapper}>
        <header className={styles.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className={styles.menuToggleBtn}
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className={styles.topbarTitle}>AIgenlabs Admin</h1>
          </div>

          <div className={styles.topbarRight} />
        </header>

        <main className={styles.contentBody}>{children}</main>
      </div>
    </div>
  )
}
