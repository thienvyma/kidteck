'use client'

import { useState } from 'react'
import styles from '@/app/page.module.css'

const INITIAL_FORM = {
  name: '',
  learnerName: '',
  phone: '',
  email: '',
  stage: '',
  message: '',
  website: '',
}

export default function CTAForm({
  title = 'Nhận đề xuất lộ trình',
  note = 'Thông tin chỉ dùng để liên hệ tư vấn và sắp xếp buổi trao đổi phù hợp.',
  submitLabel = 'Đặt lịch tư vấn',
  previewMode = false,
}) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [submittedLead, setSubmittedLead] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (previewMode) {
      setError('Preview mode: form không gửi dữ liệu thật.')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/landing-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Chưa thể gửi thông tin lúc này')
      }

      setSubmittedLead(result.lead)
      setForm(INITIAL_FORM)
    } catch (submitError) {
      setError(submitError.message || 'Chưa thể gửi thông tin lúc này')
    } finally {
      setSubmitting(false)
    }
  }

  if (submittedLead) {
    return (
      <div className={styles['cta-final__form']} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.75rem', marginBottom: '1rem' }}>✓</div>
        <div className={styles['cta-final__form-title']}>Đã nhận thông tin</div>
        <p style={{ color: 'var(--color-gray-700)', marginTop: '0.5rem', lineHeight: 1.7 }}>
          Đội ngũ AIgenlabs sẽ liên hệ <strong>{submittedLead.name}</strong> qua số{' '}
          <strong>{submittedLead.phone}</strong> để trao đổi thêm về lộ trình phù hợp.
        </p>
        <p className={styles['cta-final__form-note']} style={{ marginTop: '1rem' }}>
          Nếu gửi ngoài giờ, đội ngũ sẽ phản hồi ở khung giờ làm việc gần nhất.
        </p>
        <button
          type="button"
          className={styles['cta-final__form-submit']}
          onClick={() => setSubmittedLead(null)}
          style={{ marginTop: '1.5rem' }}
        >
          Gửi thêm thông tin khác
        </button>
      </div>
    )
  }

  return (
    <form className={styles['cta-final__form']} onSubmit={handleSubmit}>
      <div className={styles['cta-final__form-title']}>{title}</div>

      {error && (
        <div
          className={`${styles['cta-final__form-feedback']} ${styles['cta-final__form-feedback--error']}`}
        >
          {error}
        </div>
      )}

      <div className={styles['cta-final__form-grid']}>
        <div className={styles['cta-final__form-group']}>
          <label htmlFor="contact-name">Người liên hệ</label>
          <input
            type="text"
            id="contact-name"
            name="name"
            placeholder="Nguyễn Văn A"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles['cta-final__form-group']}>
          <label htmlFor="learner-name">Tên học viên</label>
          <input
            type="text"
            id="learner-name"
            name="learnerName"
            placeholder="Có thể bỏ trống nếu chưa tiện chia sẻ"
            value={form.learnerName}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={styles['cta-final__form-grid']}>
        <div className={styles['cta-final__form-group']}>
          <label htmlFor="contact-phone">Số điện thoại</label>
          <input
            type="tel"
            id="contact-phone"
            name="phone"
            placeholder="0901234567"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles['cta-final__form-group']}>
          <label htmlFor="contact-email">Email</label>
          <input
            type="email"
            id="contact-email"
            name="email"
            placeholder="phuhuynh@email.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={styles['cta-final__form-group']}>
        <label htmlFor="learner-stage">Học viên đang ở giai đoạn nào?</label>
        <select
          id="learner-stage"
          name="stage"
          value={form.stage}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Chọn nhóm phù hợp...
          </option>
          <option value="12-13 tuổi • mới bắt đầu với AI và project">12-13 tuổi • mới bắt đầu</option>
          <option value="14-15 tuổi • cần framework rõ hơn để học và làm dự án">
            14-15 tuổi • cần framework rõ hơn
          </option>
          <option value="16 tuổi • muốn build project chỉn chu hơn">
            16 tuổi • muốn build project chỉn chu
          </option>
          <option value="17-18 tuổi • muốn đi sâu product, AI và năng lực triển khai">
            17-18 tuổi • muốn đi sâu product và AI
          </option>
        </select>
      </div>

      <div className={styles['cta-final__form-group']}>
        <label htmlFor="lead-message">Điều bạn muốn trao đổi thêm</label>
        <textarea
          id="lead-message"
          name="message"
          rows="4"
          placeholder="Ví dụ: muốn tìm lộ trình phù hợp, muốn con có project đầu tay, muốn học theo hướng product và vận hành..."
          value={form.message}
          onChange={handleChange}
        />
      </div>

      <div className={styles['cta-final__form-trap']}>
        <label htmlFor="company-website">Website</label>
        <input
          type="text"
          id="company-website"
          name="website"
          value={form.website}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        className={styles['cta-final__form-submit']}
        disabled={submitting}
      >
        {submitting ? 'Đang gửi...' : submitLabel}
      </button>

      <p className={styles['cta-final__form-note']}>{note}</p>
    </form>
  )
}
