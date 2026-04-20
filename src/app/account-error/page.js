'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function AccountErrorPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        background:
          'radial-gradient(circle at top, rgba(108, 92, 231, 0.14), transparent 45%), #f8fafc',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#fff',
          borderRadius: '24px',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 24px 80px rgba(15, 23, 42, 0.08)',
          padding: '2rem',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '999px',
            background: 'rgba(225, 112, 85, 0.12)',
            color: '#c2410c',
            fontSize: '0.875rem',
            fontWeight: 700,
          }}
        >
          Tai khoan can xac minh
        </span>

        <h1
          style={{
            margin: '1rem 0 0.75rem',
            fontSize: '2rem',
            lineHeight: 1.15,
            color: '#0f172a',
          }}
        >
          He thong khong xac dinh duoc role cho tai khoan nay
        </h1>

        <p style={{ margin: 0, color: '#475569', lineHeight: 1.7 }}>
          Tai khoan da dang nhap nhung profile/role khong hop le hoac chua duoc khoi tao day du.
          Tam thoi khong mo admin hay student area cho den khi admin kiem tra lai du lieu Supabase.
        </p>

        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem 1.1rem',
            borderRadius: '16px',
            background: '#f8fafc',
            color: '#334155',
            lineHeight: 1.7,
          }}
        >
          <strong style={{ display: 'block', marginBottom: '0.35rem' }}>Huong xu ly nhanh</strong>
          <span>1. Dang xuat khoi phien hien tai.</span>
          <br />
          <span>2. Kiem tra bang `profiles` va cot `role` tren Supabase.</span>
          <br />
          <span>3. Chi cho phep `admin` hoac `student`.</span>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginTop: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={handleSignOut}
            disabled={loading}
            style={{
              padding: '0.9rem 1.25rem',
              borderRadius: '14px',
              border: 'none',
              background: '#6c5ce7',
              color: '#fff',
              fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? 'Dang dang xuat...' : 'Dang xuat va thu lai'}
          </button>

          <Link
            href="/"
            style={{
              padding: '0.9rem 1.25rem',
              borderRadius: '14px',
              border: '1px solid rgba(108, 92, 231, 0.28)',
              color: '#6c5ce7',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Ve trang chu
          </Link>
        </div>
      </section>
    </main>
  )
}
