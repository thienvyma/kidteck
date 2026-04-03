'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import styles from '../auth.module.css'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    parentName: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validatePhone = (phone) => {
    // Basic VN phone format check: 0xxx or +84xxx, exactly 10-11 digits mostly
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/
    return phoneRegex.test(phone)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validations
    if (formData.password.length < 6) {
      setError('Mật khẩu phải lớn hơn hoặc bằng 6 ký tự.')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.')
      setLoading(false)
      return
    }

    if (!validatePhone(formData.phone)) {
      setError('Số điện thoại không hợp lệ (Ví dụ: 0912345678).')
      setLoading(false)
      return
    }

    if (!formData.agreeTerms) {
      setError('Bạn cần đồng ý với Điều khoản sử dụng.')
      setLoading(false)
      return
    }

    // Call Supabase SignUp
    // Rule #12: destructure data & error
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          parent_name: formData.parentName || null
        }
      }
    })

    if (signUpError) {
      setLoading(false)
      if (signUpError.message.includes('already registered')) {
        setError('Email này đã được sử dụng.')
      } else {
        setError('Lỗi đăng ký: ' + signUpError.message)
      }
      return
    }

    // Auto profile trigger will create profile in DB.
    // So we just push to /student
    router.push('/student')
  }

  return (
    <>
      <h1 className={styles.title}>Tạo tài khoản</h1>
      <p className={styles.subtitle}>Bắt đầu hành trình Vibe Coding của bạn ngay hôm nay</p>

      {error && (
        <div className={styles.errorAlert}>
          <svg style={{width:'20px', height:'20px', marginRight:'8px', flexShrink:0}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          {error}
        </div>
      )}

      <form className={styles.form} onSubmit={handleRegister}>
        <div className={styles.grid}>
          <div className={styles.formGroup}>
            <label className="label" htmlFor="fullName">Họ và Tên Học sinh</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="input"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              required
              disabled={loading}
            />
          </div>
          <div className={styles.formGroup}>
            <label className="label" htmlFor="phone">Số điện thoại</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="09xx..."
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className="label" htmlFor="email">Email đăng nhập</label>
          <input
            id="email"
            name="email"
            type="email"
            className="input"
            value={formData.email}
            onChange={handleChange}
            placeholder="dien.email@cua.ban"
            required
            disabled={loading}
          />
        </div>

        <div className={styles.grid}>
          <div className={styles.formGroup}>
            <label className="label" htmlFor="password">Mật khẩu</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="input"
                value={formData.password}
                onChange={handleChange}
                placeholder="≥6 ký tự"
                required
                disabled={loading}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                <svg style={{width:'20px', height:'20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label className="label" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              className="input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className="label" htmlFor="parentName">Tên phụ huynh (Không bắt buộc)</label>
          <input
            id="parentName"
            name="parentName"
            type="text"
            className="input"
            value={formData.parentName}
            onChange={handleChange}
            placeholder="Tên bố/mẹ nếu có"
            disabled={loading}
          />
        </div>

        <div className={styles.checkboxContainer}>
          <input
            id="agreeTerms"
            name="agreeTerms"
            type="checkbox"
            checked={formData.agreeTerms}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <label htmlFor="agreeTerms" className={styles.checkboxLabel}>
            Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật của AIgenlabs.
          </label>
        </div>

        <button 
          type="submit" 
          className={`btn btn--primary ${styles.submitBtn}`}
          disabled={loading}
        >
          {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
        </button>
      </form>

      <div className={styles.footer}>
        Đã có tài khoản?{' '}
        <Link href="/login" className={styles.footerLink}>
          Đăng nhập
        </Link>
      </div>
    </>
  )
}
