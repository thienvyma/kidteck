'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BrandLogo from '@/components/ui/BrandLogo'
import styles from '@/app/admin/admin.module.css'

const menuItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
  },
  {
    name: 'Hoc sinh',
    href: '/admin/students',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    name: 'Khoa hoc',
    href: '/admin/courses',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    name: 'Lead',
    href: '/admin/leads',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.186-3.559C3.438 15.254 3 13.666 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    name: 'Thanh toan',
    href: '/admin/payments',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
  {
    name: 'Tin tuc',
    href: '/admin/blogs',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"
        />
      </svg>
    ),
  },
  {
    name: 'Landing',
    href: '/admin/landing',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 6v12m6-6H6m12.364-5.364a9 9 0 11-12.728 0 9 9 0 0112.728 0z"
        />
      </svg>
    ),
  },
]

export default function Sidebar({
  isOpen,
  onClose,
  adminName: initialAdminName,
  collapsed = false,
  onToggleCollapse,
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [adminName, setAdminName] = useState(initialAdminName || 'Admin')
  const displayAdminName = initialAdminName || adminName || 'Admin'

  useEffect(() => {
    if (initialAdminName) {
      return
    }

    const fetchProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const user = session?.user

      if (!user) {
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle()

      if (data?.full_name) {
        setAdminName(data.full_name)
      }
    }

    fetchProfile()
  }, [initialAdminName, supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.mobileOpen : ''} ${
        collapsed ? styles.sidebarCollapsed : ''
      }`}
    >
      <button
        type="button"
        className={styles.sidebarRailToggle}
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand admin sidebar' : 'Collapse admin sidebar'}
        title={collapsed ? 'Mo rong menu' : 'Thu gon menu'}
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {collapsed ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 5l7 7-7 7M4 5l7 7-7 7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 19l-7-7 7-7M20 19l-7-7 7-7"
            />
          )}
        </svg>
      </button>

      <div className={styles.sidebarHeader}>
        <BrandLogo
          size="sm"
          theme="dark"
          compact
          className={collapsed ? styles.sidebarBrandCompact : ''}
        />
      </div>

      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => {
          const isActive =
            item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ''}`}
              onClick={() => {
                if (window.innerWidth <= 968) {
                  onClose()
                }
              }}
            >
              {item.icon}
              <span className={styles.sidebarItemLabel}>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.adminProfile}>
          <div className={styles.adminAvatar}>{displayAdminName.charAt(0).toUpperCase()}</div>
          <div className={styles.adminProfileMeta}>
            <div style={{ fontWeight: 600 }}>{displayAdminName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
              Quan tri vien
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <svg
            style={{ width: '18px', height: '18px' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className={styles.logoutBtnLabel}>Dang xuat</span>
        </button>
      </div>
    </aside>
  )
}
