import Link from 'next/link'
import BrandLogo from '@/components/ui/BrandLogo'
import styles from './auth.module.css'

export const metadata = {
  title: 'Đăng nhập / Đăng ký - KidTech',
  description: 'Giao diện đăng nhập và đăng ký nền tảng học Vibe Coding',
}

export default function AuthLayout({ children }) {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
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
