'use client'

import styles from '@/app/student/student.module.css'

/**
 * PageSkeleton — Skeleton shimmer loading cho Student pages
 * 
 * Variants: "dashboard" | "courses" | "profile" | "lesson"
 * Tái sử dụng @keyframes shimmer từ globals.css
 */
export default function PageSkeleton({ variant = 'dashboard' }) {
  const shimmer = {
    background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: 'var(--radius-md, 8px)',
  }

  const bar = (w, h = '16px', mb = '0.75rem') => (
    <div style={{ ...shimmer, width: w, height: h, marginBottom: mb }} />
  )

  const card = (h = '120px') => (
    <div style={{ ...shimmer, width: '100%', height: h, marginBottom: '1rem' }} />
  )

  if (variant === 'dashboard') {
    return (
      <div style={{ padding: 'var(--space-md)' }}>
        {bar('200px', '24px', '1.5rem')}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ ...shimmer, width: '140px', height: '140px', borderRadius: '50%' }} />
          <div style={{ flex: 1, minWidth: '200px' }}>
            {bar('60%', '20px')}
            {bar('80%')}
            {bar('40%')}
          </div>
        </div>
        {card('160px')}
        {card('100px')}
      </div>
    )
  }

  if (variant === 'courses') {
    return (
      <div style={{ padding: 'var(--space-md)' }}>
        {bar('180px', '24px', '1.5rem')}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {bar('80px', '32px', '0')}
          {bar('80px', '32px', '0')}
          {bar('80px', '32px', '0')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {card('200px')}
          {card('200px')}
          {card('200px')}
        </div>
      </div>
    )
  }

  if (variant === 'profile') {
    return (
      <div style={{ padding: 'var(--space-md)' }}>
        {bar('160px', '24px', '1.5rem')}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ ...shimmer, width: '80px', height: '80px', borderRadius: '50%' }} />
          <div>
            {bar('150px', '20px')}
            {bar('200px', '14px')}
          </div>
        </div>
        {card('100px')}
        {card('120px')}
        {card('80px')}
      </div>
    )
  }

  if (variant === 'lesson') {
    return (
      <div style={{ padding: 'var(--space-md)' }}>
        {bar('250px', '24px', '1rem')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
          <div>
            <div style={{ ...shimmer, width: '100%', height: '300px', marginBottom: '1.5rem' }} />
            {bar('90%', '18px')}
            {bar('70%')}
            {bar('80%')}
          </div>
          <div>
            {card('60px')}
            {card('60px')}
            {card('60px')}
          </div>
        </div>
      </div>
    )
  }

  // Fallback
  return (
    <div style={{ padding: 'var(--space-md)' }}>
      {bar('200px', '24px', '1.5rem')}
      {card('100px')}
      {card('80px')}
    </div>
  )
}
