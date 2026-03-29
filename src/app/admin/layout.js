'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/admin/Sidebar'
import styles from './admin.module.css'

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role !== 'admin') {
          // Student trying to access admin → redirect to student portal
          router.push('/student')
          return
        }

        setAuthorized(true)
      } catch (err) {
        console.error('Role check error:', err)
        router.push('/login')
      } finally {
        setChecking(false)
      }
    }

    checkRole()
  }, [supabase, router])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    if (sidebarOpen) {
      setSidebarOpen(false)
    }
  }

  // Show nothing while checking role
  if (checking || !authorized) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--color-light)'
      }}>
        <div style={{
          textAlign: 'center', color: 'var(--color-gray-500)'
        }}>
          ⏳ Đang kiểm tra quyền truy cập...
        </div>
      </div>
    )
  }

  return (
    <div className={styles.adminLayout}>
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      {/* Overlay for mobile */}
      <div 
        className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.active : ''}`}
        onClick={closeSidebar}
      />

      <div className={styles.mainWrapper}>
        <header className={styles.topbar}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <button 
              className={styles.menuToggleBtn} 
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className={styles.topbarTitle}>KidTech Admin</h1>
          </div>
          
          <div className={styles.topbarRight}>
            {/* Topbar right content if needed (e.g., notifications) */}
          </div>
        </header>

        <main className={styles.contentBody}>
          {children}
        </main>
      </div>
    </div>
  )
}
