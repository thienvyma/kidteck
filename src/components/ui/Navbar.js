'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import BrandLogo from './BrandLogo'
import styles from './Navbar.module.css'

const DEFAULT_HEADER = {
  painLabel: 'Góc nhìn',
  roadmapLabel: 'Lộ trình',
  pricingLabel: 'Gói học',
  faqLabel: 'FAQ',
  ctaLabel: 'Nhận lộ trình',
}

export default function Navbar({ header }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const labels = {
    ...DEFAULT_HEADER,
    ...(header || {}),
  }

  useEffect(() => {
    const options = { passive: true }

    function handleScroll() {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, options)
    return () => window.removeEventListener('scroll', handleScroll, options)
  }, [])

  function handleLinkClick() {
    setIsOpen(false)
  }

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`} id="navbar">
      <div className={styles.navbar__inner}>
        <Link href="/" className={styles.navbar__logo}>
          <BrandLogo size="lg" compact />
        </Link>

        <div
          className={`${styles.navbar__links} ${isOpen ? styles['navbar__links--open'] : ''}`}
        >
          <Link href="/#pain" className={styles.navbar__link} onClick={handleLinkClick}>
            {labels.painLabel}
          </Link>
          <Link href="/#roadmap" className={styles.navbar__link} onClick={handleLinkClick}>
            {labels.roadmapLabel}
          </Link>
          <Link href="/#pricing" className={styles.navbar__link} onClick={handleLinkClick}>
            {labels.pricingLabel}
          </Link>
          <Link href="/#faq" className={styles.navbar__link} onClick={handleLinkClick}>
            {labels.faqLabel}
          </Link>
          <Link href="/blog" className={styles.navbar__link} onClick={handleLinkClick}>
            Tin Tức
          </Link>
          <Link
            href="/login"
            className={`btn btn--secondary btn--sm ${styles.navbar__cta}`}
            onClick={handleLinkClick}
          >
            Đăng nhập
          </Link>
          <Link
            href="/#cta"
            className={`btn btn--primary btn--sm ${styles.navbar__cta}`}
            onClick={handleLinkClick}
          >
            {labels.ctaLabel}
          </Link>
        </div>

        <button
          className={`${styles['navbar__mobile-toggle']} ${
            isOpen ? styles['navbar__mobile-toggle--open'] : ''
          }`}
          onClick={() => setIsOpen((current) => !current)}
          aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={isOpen}
        >
          <span className={styles['navbar__hamburger-line']} />
          <span className={styles['navbar__hamburger-line']} />
          <span className={styles['navbar__hamburger-line']} />
        </button>
      </div>

      {isOpen && <div className={styles.navbar__overlay} onClick={() => setIsOpen(false)} />}
    </nav>
  )
}
