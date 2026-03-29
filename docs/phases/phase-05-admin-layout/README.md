# Phase 05: Admin Layout — Session 5

> 1 Session = 1 Phase = tối đa 4 files. Đọc file này là đủ context.

## Mục tiêu
Dựng khung giao diện tĩnh cho Admin. Chưa kết nối data.

## Dependencies
- Session 4 (Auth UI) phải completed

## Ghi chú: Shared UI (PRD §8.1)
> Nếu cần `Button.js`, `Modal.js`, `Toast.js` (hoặc `src/lib/utils.js` cho formatting VND/date) → tạo trong session này hoặc sessions sau khi gặp nhu cầu. Xem PRD §8.1 cho specs.
> Lưu ý: `.btn` classes đã có sẵn trong `globals.css` — chỉ tạo Button component nếu cần logic phức tạp hơn (loading state, icon).

## Files (4)

### 1. `src/app/admin/layout.js` + `admin.module.css`
```
Type: Server → Client hybrid
Structure: Sidebar (260px fixed left) + Topbar (64px) + Content area
CSS:
  - Sidebar: fixed left, width 260px, bg #2D3436, white text
  - Topbar: height 64px, bg white, border-bottom, breadcrumb + admin name
  - Content: margin-left 260px, padding var(--space-lg)
  - Mobile (<968px): sidebar hidden, hamburger toggle ở topbar
```

### 2. `src/components/admin/Sidebar.js` + `Sidebar.module.css`
```
Type: "use client" (usePathname, mobile toggle)
Menu Items:
  - 📊 Dashboard     → /admin
  - 👥 Học sinh      → /admin/students
  - 📚 Khóa học      → /admin/courses
  - 💰 Thanh toán    → /admin/payments
Footer: Admin name + Logout button (supabase.auth.signOut())
CSS:
  - Dark theme: #2D3436 bg, white text
  - Active: left border 3px primary, bg rgba(white, 0.1)
  - Hover: bg rgba(white, 0.05)
  - Mobile: slide-in overlay
  - BEM: .sidebar__item, .sidebar__item--active
```

### 3. `src/components/admin/StatsCard.js`
```
Type: Server Component (no interactivity)
Props: { title, value, icon, color('primary'|'success'|'accent'|'warning'), change? }
CSS:
  - White card, border-radius var(--radius-md)
  - Colored left border 4px
  - Icon circle: 48px, bg color nhạt
  - Value: font-size var(--text-3xl), font-weight 700
  - Title: font-size var(--text-sm), color var(--color-gray-700)
```

## Verify
- Sidebar renders 4 menu items với active state đúng
- StatsCard hiển thị đúng với sample data hardcode
- Mobile: sidebar collapses <968px
- `npm run build` pass

## Commit
`feat(admin): layout + sidebar + stats card`
