# Phase 09: Student Layout — Session 9

> 1 Session = 1 Phase = tối đa 4 files. Đọc file này là đủ context.

## Mục tiêu
Dựng khung giao diện Student + component ProgressRing. Chưa kết nối data.

## Dependencies
- Session 4 (Auth UI) phải completed

## Files (4)

### 1. `src/app/student/layout.js` + `student.module.css`
```
Type: Server → Client hybrid
Sidebar (240px) + Content area
UI tone: light sidebar, purple accent (#6C5CE7)
CSS:
  - Sidebar: fixed left, 240px, bg white, border-right gray-300
  - Content: margin-left 240px, padding var(--space-lg)
  - Mobile (<968px): sidebar hidden, hamburger toggle
```

### 2. `src/components/student/Sidebar.js` + `Sidebar.module.css`
```
Type: "use client" (usePathname, mobile toggle)
Menu:
  - 🏠 Dashboard → /student
  - 📚 Môn học → /student/courses
  - 👤 Hồ sơ → /student/profile
Footer: Level badge + small progress indicator
CSS: Light theme, primary accent on active, BEM naming
```

### 3. `src/components/student/ProgressRing.js`
```
Type: "use client" (useEffect animation)
Props: { percentage(0-100), size(120), strokeWidth(8), color? }
SVG:
  - Background circle: stroke gray-300, full circumference
  - Foreground: stroke color, dasharray=circumference, dashoffset=circumference*(1-pct/100)
  - transform: rotate(-90deg) để start từ top
  - Animation: CSS transition 400ms on mount
  - Text center: percentage + "%" , font-weight 700
Color logic: >80 green, 40-80 yellow, <40 coral
```

## Verify
- Layout renders với light sidebar
- ProgressRing animation mượt 0→value
- Mobile sidebar collapses
- `npm run build` pass

## Commit
`feat(student): layout + sidebar + progress ring`
