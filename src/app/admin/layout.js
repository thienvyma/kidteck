'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/admin/Sidebar'
import styles from './admin.module.css'

export default function AdminLayout({ children }) {
  const [supabase] = useState(() => createClient())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.localStorage.getItem('admin-sidebar-collapsed') === 'true'
  })
  const [adminName, setAdminName] = useState('Admin')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .maybeSingle()

          if (profile?.full_name) {
            setAdminName(profile.full_name)
          }
        }
      } catch (err) {
        console.error('Profile fetch error:', err)
      }
    }

    fetchProfile()
  }, [supabase])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((current) => {
      const next = !current

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('admin-sidebar-collapsed', String(next))
      }

      return next
    })
  }

  const closeSidebar = () => {
    if (sidebarOpen) {
      setSidebarOpen(false)
    }
  }


  return (
    <div className={styles.adminLayout}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        adminName={adminName}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapsed}
      />

      <div
        className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.active : ''}`}
        onClick={closeSidebar}
      />

      <div
        className={`${styles.mainWrapper} ${
          sidebarCollapsed ? styles.mainWrapperCollapsed : ''
        }`}
      >
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
