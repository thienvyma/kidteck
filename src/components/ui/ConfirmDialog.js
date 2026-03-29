'use client'

import { useEffect, useRef } from 'react'

/**
 * ConfirmDialog — Custom modal thay thế window.confirm()
 * 
 * Props:
 *   isOpen     — boolean
 *   title      — string (default: "Xác nhận")
 *   message    — string
 *   confirmText — string (default: "Xác nhận")
 *   cancelText  — string (default: "Hủy")
 *   variant    — "danger" | "warning" | "default"
 *   onConfirm  — function
 *   onCancel   — function
 *   loading    — boolean (optional)
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Xác nhận',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'default',
  onConfirm,
  onCancel,
  loading = false,
}) {
  const confirmRef = useRef(null)

  // Focus trap + keyboard
  useEffect(() => {
    if (!isOpen) return

    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel?.()
      if (e.key === 'Enter') onConfirm?.()
    }
    document.addEventListener('keydown', handleKey)
    confirmRef.current?.focus()

    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onCancel, onConfirm])

  if (!isOpen) return null

  const variantColors = {
    danger: { bg: 'var(--color-error)', icon: '⚠️' },
    warning: { bg: 'var(--color-warning)', icon: '⚡' },
    default: { bg: 'var(--color-primary)', icon: '❓' },
  }
  const v = variantColors[variant] || variantColors.default

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <span style={{ fontSize: '1.25rem' }}>{v.icon}</span>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{title}</h3>
        </div>
        <p style={messageStyle}>{message}</p>
        <div style={actionsStyle}>
          <button style={cancelBtnStyle} onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            style={{ ...confirmBtnStyle, background: v.bg }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '⏳...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Inline styles (no extra CSS file needed, reuses design tokens) ---
const overlayStyle = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
  animation: 'fadeIn 0.2s ease',
}

const dialogStyle = {
  background: '#fff',
  borderRadius: 'var(--radius-xl, 16px)',
  padding: '1.5rem',
  maxWidth: '400px',
  width: '90%',
  boxShadow: 'var(--shadow-xl, 0 20px 40px rgba(0,0,0,0.15))',
  animation: 'slideUp 0.25s ease',
}

const headerStyle = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  marginBottom: '0.75rem',
}

const messageStyle = {
  color: 'var(--color-gray-700, #555)',
  fontSize: '0.9rem',
  lineHeight: 1.5,
  marginBottom: '1.25rem',
}

const actionsStyle = {
  display: 'flex', gap: '0.5rem', justifyContent: 'flex-end',
}

const cancelBtnStyle = {
  padding: '0.5rem 1rem',
  borderRadius: 'var(--radius-md, 8px)',
  border: '1px solid var(--color-gray-300, #ddd)',
  background: '#fff',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: 500,
}

const confirmBtnStyle = {
  padding: '0.5rem 1rem',
  borderRadius: 'var(--radius-md, 8px)',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: 600,
}
