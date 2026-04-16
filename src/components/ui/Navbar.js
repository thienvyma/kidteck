'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import BrandLogo from './BrandLogo'
import styles from './Navbar.module.css'

const DEFAULT_HEADER = {
  contactLabel: 'Lien he',
  roadmapLabel: 'Lộ trình',
  faqLabel: 'FAQ',
  ctaLabel: 'Nhận lộ trình',
}

function getSectionHref(anchorBase, sectionId) {
  return `${anchorBase}#${sectionId}`
}

export default function Navbar({
  header,
  anchorBase = '/',
  homeHref = '/',
  sectionVisibility,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const labels = {
    ...DEFAULT_HEADER,
    ...(header || {}),
  }
  const showRoadmapLink = sectionVisibility?.catalog !== false
  const showContactLink = sectionVisibility?.contact !== false
  const showFaqLink = sectionVisibility?.faq !== false
  const showCtaLink = sectionVisibility?.cta !== false

  useEffect(() => {
    const options = { passive: true }

    function handleScroll() {
      const nextScrolled = window.scrollY > 50
      setScrolled((current) => (current === nextScrolled ? current : nextScrolled))
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, options)
    return () => window.removeEventListener('scroll', handleScroll, options)
  }, [])

  function handleLinkClick() {
    setIsOpen(false)
  }

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`} id="navbar">
      <div className={styles.navbar__inner}>
        <Link href={homeHref} className={styles.navbar__logo}>
          <BrandLogo size="sm" compact />
        </Link>

        <div
          className={`${styles.navbar__links} ${isOpen ? styles['navbar__links--open'] : ''}`}
        >
          {showRoadmapLink && (
            <Link
              href={getSectionHref(anchorBase, 'roadmap')}
              className={styles.navbar__link}
              onClick={handleLinkClick}
            >
              {labels.roadmapLabel}
            </Link>
          )}
          {showContactLink && (
            <Link
              href={getSectionHref(anchorBase, 'contact-direct')}
              className={styles.navbar__link}
              onClick={handleLinkClick}
            >
              {labels.contactLabel}
            </Link>
          )}
          {showFaqLink && (
            <Link
              href={getSectionHref(anchorBase, 'faq')}
              className={styles.navbar__link}
              onClick={handleLinkClick}
            >
              {labels.faqLabel}
            </Link>
          )}
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
          {showCtaLink && (
            <Link
              href={getSectionHref(anchorBase, 'cta')}
              className={`btn btn--primary btn--sm ${styles.navbar__cta}`}
              onClick={handleLinkClick}
            >
              {labels.ctaLabel}
            </Link>
          )}
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
