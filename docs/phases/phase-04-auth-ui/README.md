# Phase 04: Auth UI — Session 4

> 1 Session = 1 Phase = tối đa 4 files. Đọc file này là đủ context.

## Mục tiêu
Giao diện đăng nhập/đăng ký. Kết nối với SDK từ Session 3.

## Dependencies
- Session 3 (Auth Core) phải completed

## Files (4)

### 1. `src/app/(auth)/layout.js` + `auth.module.css`
```
Type: Server Component
Route group (auth) — không tạo URL segment
UI:
  - Background: gradient primary → secondary
  - Card: white, border-radius lg, shadow xl, max-width 480px, centered
  - KidTech logo ở trên form
  - Không có Navbar/Sidebar
CSS tokens: var(--color-primary), var(--shadow-xl), var(--radius-lg)
```

### 2. `src/app/(auth)/login/page.js`
```
Type: "use client" (useState, form handling)
Sections:
  - KidTech logo + "Đăng nhập" heading
  - Email input (required, type=email)
  - Password input (required, show/hide toggle)
  - "Quên mật khẩu?" link (placeholder)
  - Submit "Đăng nhập" (primary, full-width, loading state)
  - "Chưa có tài khoản? Đăng ký ngay" → /register
  - Error alert (red, tiếng Việt)

Submit: supabase.auth.signInWithPassword({ email, password })
Success: query profile role → router.push('/admin' hoặc '/student')
Errors: "Email hoặc mật khẩu không đúng", "Lỗi kết nối"
```

### 3. `src/app/(auth)/register/page.js`
```
Type: "use client" (useState, form handling)
Fields:
  - Họ và tên (text, required)
  - Email (email, required)
  - Mật khẩu (password, min 6 chars)
  - Xác nhận mật khẩu (must match)
  - Số điện thoại (tel, VN format: 0xxx hoặc +84xxx)
  - Tên phụ huynh (text, optional)
  - Checkbox: "Tôi đồng ý với điều khoản sử dụng"
  - Submit "Tạo tài khoản" (primary, full-width, loading)
  - "Đã có tài khoản? Đăng nhập" → /login

Submit: supabase.auth.signUp({ email, password, options: { data: { full_name, phone, parent_name } } })
Trigger tự tạo profile (handle_new_user trong DB)
Validation: email format, password ≥6, password match, phone VN
Errors: "Email đã được sử dụng", "Mật khẩu phải ≥ 6 ký tự", "Mật khẩu không khớp"
```

## Verify
1. Register → profile tạo trong Supabase → redirect /student
2. Login admin@kidtech.vn → redirect /admin
3. Login student@kidtech.vn → redirect /student
4. Access /admin as student → redirect /student
5. Responsive 375px
6. `npm run build` pass

## Commit
`feat(auth): login + register pages + auth layout`
