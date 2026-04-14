import Link from 'next/link'
import BrandLogo from '@/components/ui/BrandLogo'
import styles from './auth.module.css'

export const metadata = {
  title: 'Đăng nhập / Đăng ký - AIgenlabs',
  description: 'Giao diện đăng nhập và đăng ký nền tảng học Vibe Coding',
}

export default function AuthLayout({ children }) {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <Link href="/" className={styles.backButton}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Về trang chủ
        </Link>
        <div className={styles.logoContainer}>
          <Link href="/" className={styles.logo}>
            <BrandLogo size="lg" />
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
