'use client'

import { useEffect, useRef } from 'react'
import styles from '@/app/student/student.module.css'

export default function ProgressRing({
  percentage = 0,
  size = 120,
  strokeWidth = 8,
  color,
}) {
  const circleRef = useRef(null)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Auto color based on percentage
  const getColor = () => {
    if (color) return color
    if (percentage > 80) return 'var(--color-success)'
    if (percentage >= 40) return 'var(--color-warning)'
    return '#e17055' // coral
  }

  useEffect(() => {
    const circle = circleRef.current
    if (!circle) return

    // Start from full offset (hidden) then animate to target
    const offset = circumference * (1 - percentage / 100)
    circle.style.strokeDashoffset = circumference
    // Trigger reflow
    circle.getBoundingClientRect()
    circle.style.strokeDashoffset = offset
  }, [percentage, circumference])

  const fontSize = size * 0.22

  return (
    <div className={styles.progressRing} style={{ width: size, height: size }}>
      <svg
        className={styles.progressRingSvg}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          className={styles.progressRingBg}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Foreground (progress) */}
        <circle
          ref={circleRef}
          className={styles.progressRingFg}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={getColor()}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <span
        className={styles.progressRingText}
        style={{ fontSize: `${fontSize}px` }}
      >
        {Math.round(percentage)}%
      </span>
    </div>
  )
}
