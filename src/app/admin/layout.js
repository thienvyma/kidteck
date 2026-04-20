'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/admin/Sidebar'
import styles from './admin.module.css'

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'admin-sidebar-collapsed'
const SIDEBAR_COLLAPSED_EVENT = 'admin-sidebar-collapsed-change'

function getSidebarCollapsedServerSnapshot() {
  return false
}

function getSidebarCollapsedSnapshot() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true'
}

function subscribeSidebarCollapsed(callback) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  function handleChange(event) {
    if (event.type === 'storage' && event.key !== SIDEBAR_COLLAPSED_STORAGE_KEY) {
      return
    }

    callback()
  }

  window.addEventListener('storage', handleChange)
  window.addEventListener(SIDEBAR_COLLAPSED_EVENT, handleChange)

  return () => {
    window.removeEventListener('storage', handleChange)
    window.removeEventListener(SIDEBAR_COLLAPSED_EVENT, handleChange)
  }
}

export default function AdminLayout({ children }) {
  const [supabase] = useState(() => createClient())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarCollapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    getSidebarCollapsedSnapshot,
    getSidebarCollapsedServerSnapshot
  )
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
    const next = !sidebarCollapsed
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(next))
    window.dispatchEvent(new CustomEvent(SIDEBAR_COLLAPSED_EVENT, { detail: next }))
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
