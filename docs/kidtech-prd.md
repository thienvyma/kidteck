# AIgenlabs Project — Master Reference Document (PRD)
## Dùng cho mọi AI IDE: Antigravity, Cursor, Claude Code

---

## 1. TOÀN CẢNH DỰ ÁN

### Mục tiêu
Xây dựng platform EdTech dạy **Vibe Coding** cho học sinh **12-17 tuổi** (3 nhóm: 12-14, 15-16, 16-17).
Hệ thống gồm 3 module chính hoạt động trên cùng 1 Next.js app.

### Đối tượng sử dụng
| Vai trò | Truy cập | Quyền |
|---|---|---|
| **Khách** (Public) | Landing Page | Xem thông tin, đăng ký |
| **Admin** | /admin/* | Quản lý toàn bộ hệ thống |
| **Học sinh** | /student/* | Xem bài học, theo dõi tiến độ |

### Tech Stack (KHÔNG thay đổi)
| Layer | Tech | Version | Lý do |
|---|---|---|---|
| Framework | Next.js | 14+ (App Router) | SEO, SSR, routing |
| Language | JavaScript | ES2022 | Đơn giản, Vibe Coding-friendly |
| Database | Supabase | Latest | Free tier, Auth tích hợp, RLS |
| Styling | Vanilla CSS + CSS Modules | N/A | Full control, không dependency |
| Font | Inter (Google Fonts) | Variable | Vietnamese support |
| Deploy | Vercel | Latest | Free, tích hợp Next.js |

---

## 2. TIẾN ĐỘ HIỆN TẠI

### ✅ Đã hoàn thành
| Phase | Mô tả | Files chính |
|---|---|---|
| Phase 1 | Project Setup | CLAUDE.md, globals.css, layout.js |
| Phase 2 | Landing Page | page.js (7 sections), page.module.css, Navbar component |

### ⏳ Chưa làm (1 Phase = 1 Session)
| Session | Module | Phase README |
|---|---|---|
| S3 | Auth Core & Middleware | `docs/phases/phase-03-auth-core/` |
| S4 | Auth UI (Login/Register) | `docs/phases/phase-04-auth-ui/` |
| S5 | Admin Layout + Components | `docs/phases/phase-05-admin-layout/` |
| S6 | DataTable + Dashboard | `docs/phases/phase-06-admin-dashboard/` |
| S7 | Students CRUD | `docs/phases/phase-07-admin-students/` |
| S8 | Courses & Payments | `docs/phases/phase-08-admin-courses/` |
| S9 | Student Layout + Components | `docs/phases/phase-09-student-layout/` |
| S10 | Dashboard + Course List | `docs/phases/phase-10-student-dashboard/` |
| S11 | Learning Flow + Profile | `docs/phases/phase-11-student-learning/` |

---

## 3. CẤU TRÚC DỰ ÁN HIỆN TẠI

```
aigenlabs-app/
├── CLAUDE.md                          ← AI agent memory (ngắn gọn)
├── AGENTS.md                          ← Next.js rules (auto-generated)
├── .env.local                         ← [CẦN TẠO] Supabase credentials
├── package.json
├── next.config.js
│
├── docs/                              ← Tài liệu kỹ thuật chi tiết
│   ├── INDEX.md                       ← Bản đồ cross-reference
│   ├── database-schema.md             ← SQL schema + RLS + seed data
│   ├── aigenlabs-prd.md                 ← Master Reference Document (file này)
│   ├── VIBECODING_GUIDE.md            ← Methodology reference
│   └── phases/                        ← 1 Phase = 1 Session (9 directories)
│       ├── phase-03-auth-core/        ← S3: Supabase clients + middleware
│       ├── phase-04-auth-ui/          ← S4: Login + Register pages
│       ├── phase-05-admin-layout/     ← S5: Admin layout, Sidebar, StatsCard
│       ├── phase-06-admin-dashboard/  ← S6: DataTable + Dashboard
│       ├── phase-07-admin-students/   ← S7: Students list + detail
│       ├── phase-08-admin-courses/    ← S8: Courses + Payments
│       ├── phase-09-student-layout/   ← S9: Student layout, ProgressRing
│       ├── phase-10-student-dashboard/← S10: CourseCard + Dashboard
│       └── phase-11-student-learning/ ← S11: LessonContent + Profile
│
├── public/
│   ├── images/                        ← [CẦN TẠO] Static images
│   └── icons/                         ← [CẦN TẠO] Icons
│
└── src/
    ├── middleware.js                   ← [CẦN TẠO] Route protection
    │
    ├── app/
    │   ├── globals.css                ← ✅ Design system (tokens, utilities)
    │   ├── layout.js                  ← ✅ Root layout (Inter font, SEO)
    │   ├── page.js                    ← ✅ Landing page (7 sections)
    │   ├── page.module.css            ← ✅ Landing page styles
    │   │
    │   ├── (auth)/                    ← [CẦN TẠO] Auth pages
    │   │   ├── layout.js              ← Auth layout (centered, gradient bg)
    │   │   ├── auth.module.css        ← Auth styles
    │   │   ├── login/page.js          ← Login form
    │   │   └── register/page.js       ← Register form
    │   │
    │   ├── admin/                     ← [CẦN TẠO] Admin pages
    │   │   ├── layout.js              ← Admin layout (sidebar)
    │   │   ├── admin.module.css       ← Admin styles
    │   │   ├── page.js                ← Dashboard (KPI)
    │   │   ├── students/page.js       ← Student list
    │   │   ├── students/[id]/page.js  ← Student detail
    │   │   ├── courses/page.js        ← Course management
    │   │   ├── courses/[id]/page.js   ← Course edit
    │   │   └── payments/page.js       ← Payment history
    │   │
    │   └── student/                   ← [CẦN TẠO] Student pages
    │       ├── layout.js              ← Student layout (sidebar)
    │       ├── student.module.css     ← Student styles
    │       ├── page.js                ← Dashboard (progress)
    │       ├── courses/page.js        ← Course list
    │       ├── courses/[id]/page.js   ← Lesson content
    │       └── profile/page.js        ← Profile & portfolio
    │
    ├── components/
    │   ├── ui/                        ← Shared components
    │   │   ├── Navbar.js              ← ✅ Responsive navbar + mobile menu
    │   │   ├── Navbar.module.css      ← ✅ Navbar styles
    │   │   ├── Button.js              ← [CẦN TẠO] Reusable button
    │   │   ├── Modal.js               ← [CẦN TẠO] Modal dialog
    │   │   └── Toast.js               ← [CẦN TẠO] Notification toast
    │   │
    │   ├── admin/                     ← [CẦN TẠO] Admin components
    │   │   ├── Sidebar.js             ← Admin sidebar nav
    │   │   ├── Sidebar.module.css
    │   │   ├── TopBar.js              ← Admin topbar
    │   │   ├── StatsCard.js           ← KPI card
    │   │   └── DataTable.js           ← Reusable data table
    │   │
    │   └── student/                   ← [CẦN TẠO] Student components
    │       ├── Sidebar.js             ← Student sidebar nav
    │       ├── ProgressRing.js        ← SVG progress circle
    │       ├── CourseCard.js           ← Course card with progress
    │       └── LessonContent.js       ← Lesson viewer
    │
    └── lib/                           ← [CẦN TẠO] Libraries
        ├── supabase.js                ← Browser Supabase client
        ├── supabase-server.js         ← Server Supabase client
        ├── auth.js                    ← Auth helper functions
        └── utils.js                   ← Formatting, validation
```

---

## 4. DESIGN SYSTEM — TOKENS CỐT LÕI

### Colors
```
Primary:     #6C5CE7  (Purple)       — Brand chính, CTA
Primary-dk:  #5A4BD1                  — Hover states
Primary-lt:  #A29BFE                  — Backgrounds nhẹ
Secondary:   #00D2D3  (Cyan)         — Accent
Accent:      #FF6B6B  (Coral)        — Attention, warnings
Success:     #00B894  (Green)        — Hoàn thành, active
Warning:     #FDCB6E  (Yellow)       — Chờ xử lý
Error:       #E17055  (Orange-Red)   — Lỗi
Dark:        #2D3436                  — Text chính
Gray-700:    #636E72                  — Text phụ
Gray-300:    #DFE6E9                  — Borders
Light:       #F8F9FA                  — Background nhẹ
White:       #FFFFFF                  — Background chính
```

### Spacing
```
xs: 0.25rem | sm: 0.5rem | md: 1rem | lg: 1.5rem
xl: 2rem | 2xl: 3rem | 3xl: 4rem | 4xl: 6rem
```

### Typography
```
Font: 'Inter', sans-serif (Vietnamese subset)
Sizes: xs(0.75) sm(0.875) base(1) lg(1.125) xl(1.25) 2xl(1.5) 3xl(2) 4xl(2.5) 5xl(3.5)
Weights: 300(light) 400(regular) 500(medium) 600(semibold) 700(bold) 800(extrabold) 900(black)
```

### Components Pattern
```
Radius: sm(0.375) md(0.75) lg(1) xl(1.5) full(9999px)
Shadow: sm(1px-3px) md(4px-12px) lg(8px-30px) xl(20px-60px)
Transition: fast(150ms) base(250ms) slow(400ms)
Container: max-width 1200px, padding 1.5rem
```

---

## 5. CODING CONVENTIONS — ĐỌC KỸ

### File Naming
- Components: **PascalCase** → `Sidebar.js`, `StatsCard.js`
- Pages: **lowercase** → `page.js`, `layout.js`
- Styles: **matching** → `Sidebar.module.css`, `admin.module.css`
- Utilities: **camelCase** → `supabase.js`, `utils.js`

### CSS Rules
- ✅ Dùng CSS Modules (`.module.css`) cho component-specific styles
- ✅ Dùng `globals.css` cho shared utilities (`.container`, `.btn`, `.card`, `.badge`)
- ✅ BEM-like naming: `.sidebar__item`, `.sidebar__item--active`
- ✅ Dùng CSS custom properties: `var(--color-primary)`
- ❌ KHÔNG dùng inline styles trừ dynamic values
- ❌ KHÔNG dùng Tailwind CSS
- ❌ KHÔNG import CSS libraries bên ngoài

### React/Next.js Rules
- ✅ Server Components by default (không `"use client"` trừ khi cần)
- ✅ `"use client"` CHỈ khi cần: useState, useEffect, onClick, form handling
- ✅ Dùng Next.js `<Link>` thay vì `<a>` cho internal navigation
- ✅ Dùng Next.js `<Image>` cho optimized images
- ✅ Error boundaries cho mỗi route group
- ❌ KHÔNG dùng `useRouter()` trong Server Components

### Supabase Rules
- ✅ Browser client: `src/lib/supabase.js` → dùng trong Client Components
- ✅ Server client: `src/lib/supabase-server.js` → dùng trong Server Components
- ✅ Luôn handle errors: `const { data, error } = await supabase.from(...)`
- ✅ Dùng RLS (Row Level Security) → KHÔNG query trực tiếp bỏ qua auth
- ❌ KHÔNG tạo thêm Supabase client instances ngoài 2 file trên
- ❌ KHÔNG hardcode Supabase URLs/Keys → dùng `process.env`

### Vietnamese Content
- Currency: `1.500.000đ` (dùng dấu chấm ngăn cách hàng nghìn)
- Phone: `0901234567` hoặc `+84901234567`
- Date: `24/03/2026` (dd/mm/yyyy)
- Comments: Tiếng Việt cho business logic, English cho technical

---

## 6. DATABASE SCHEMA — THAM CHIẾU NHANH

### Entity Relationship
```
auth.users (Supabase managed)
    │
    └──→ profiles (1:1)
              │
              ├──→ enrollments (1:N) ──→ levels (N:1)
              │                              │
              │                              └──→ subjects (1:N)
              │
              ├──→ progress (1:N) ──→ subjects (N:1)
              │
              └──→ payments (1:N) ──→ levels (N:1)
```

### Quick Reference
| Table | PK | Key Fields | Notes |
|---|---|---|---|
| profiles | id (UUID) | full_name, role, phone, parent_phone | Trigger từ auth.users |
| levels | id (SERIAL) | name, slug, price, subject_count | 3 records (L1,L2,L3) |
| subjects | id (SERIAL) | level_id, name, content (JSONB) | 15 records total |
| enrollments | id (SERIAL) | student_id, level_id, status | UNIQUE(student,level) |
| progress | id (SERIAL) | student_id, subject_id, completed | UNIQUE(student,subject) |
| payments | id (SERIAL) | student_id, level_id, amount, status | |

→ Chi tiết SQL: xem `docs/database-schema.md`

---

## 7. API & DATA FLOW PATTERNS

### Authentication Flow
```
                ┌─────────────┐
                │  Landing    │
                │  Page       │
                └──────┬──────┘
                       │ Click "Đăng ký"
                       ▼
                ┌─────────────┐
                │  Register   │──→ supabase.auth.signUp()
                │  Page       │    → trigger tạo profile
                └──────┬──────┘
                       │ Redirect
                       ▼
                ┌─────────────┐
                │  Login      │──→ supabase.auth.signInWithPassword()
                │  Page       │
                └──────┬──────┘
                       │ Check role
              ┌────────┴────────┐
              ▼                 ▼
        ┌───────────┐    ┌───────────┐
        │  /admin   │    │ /student  │
        │ Dashboard │    │ Dashboard │
        └───────────┘    └───────────┘
```

### Data Fetching Pattern
```
// Server Component (mặc định) — cho read operations
export default async function StudentsPage() {
  const supabase = await createServerClient()
  const { data: students } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false })
  
  return <StudentList students={students} />
}

// Client Component — cho write operations & interactivity
"use client"
export default function EnrollForm({ levels }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  
  async function handleSubmit(formData) {
    setLoading(true)
    const { error } = await supabase
      .from('enrollments')
      .insert({ student_id: userId, level_id: formData.levelId })
    setLoading(false)
  }
  
  return <form>...</form>
}
```

### Middleware Protection Pattern
```
// src/middleware.js
export async function middleware(request) {
  const { pathname } = request.nextUrl
  
  // 1. Lấy session
  const session = await getSession(request)
  
  // 2. Chưa login → redirect /login
  if (!session && (pathname.startsWith('/admin') || pathname.startsWith('/student'))) {
    return redirect('/login')
  }
  
  // 3. Đã login → check role
  if (session) {
    const role = session.user.role
    if (pathname.startsWith('/admin') && role !== 'admin') redirect('/student')
    if (pathname.startsWith('/student') && role !== 'student') redirect('/admin')
    if (pathname === '/login') redirect(role === 'admin' ? '/admin' : '/student')
  }
}
```

---

## 8. COMPONENT SPECS — CHI TIẾT TỪNG COMPONENT

### 8.1 Shared UI Components

#### Button (`src/components/ui/Button.js`)
```
Props: variant('primary'|'secondary'|'accent'|'ghost'), size('sm'|'md'|'lg'),
       children, onClick, href, disabled, loading, fullWidth, icon
State: Client Component (onClick handler)
CSS: Dùng classes từ globals.css (.btn, .btn--primary, etc.)
```

#### Modal (`src/components/ui/Modal.js`)
```
Props: isOpen, onClose, title, children, size('sm'|'md'|'lg')
State: Client Component
Features: ESC to close, click overlay to close, focus trap, body scroll lock
CSS: Fixed overlay + centered card, animation fadeIn
```

#### Toast (`src/components/ui/Toast.js`)
```
Props: message, type('success'|'error'|'warning'|'info'), duration(3000)
State: Client Component (auto dismiss)
Position: Top-right, stacked
CSS: Slide-in animation, color based on type
```

### 8.2 Admin Components

#### Admin Sidebar (`src/components/admin/Sidebar.js`)
```
Props: none (reads pathname for active state)
State: Client Component (usePathname, mobile toggle)
Menu Items:
  - 📊 Dashboard     → /admin
  - 👥 Học sinh      → /admin/students
  - 📚 Khóa học      → /admin/courses
  - 💰 Thanh toán    → /admin/payments
Footer: Admin name + Logout button
CSS: Fixed left 260px, dark theme (#2D3436 bg), white text
Mobile: slide-in overlay (same pattern as Navbar)
```

#### DataTable (`src/components/admin/DataTable.js`)
```
Props: columns[{key, label, render?}], data[], searchKey?, actions[{label, onClick}]?,
       loading?, emptyMessage?
State: Client Component (search, sort, pagination)
Features:
  - Search bar (filter by searchKey)
  - Column sort (click header)
  - Pagination (10 items/page)
  - Row click handler
  - Loading skeleton (5 rows placeholder)
  - Empty state with message
CSS: Striped rows, hover highlight, sticky header
```

#### StatsCard (`src/components/admin/StatsCard.js`)
```
Props: title, value, icon, color('primary'|'success'|'accent'|'warning'), change?
State: Server Component (no interactivity)
CSS: White card, colored left border (4px), icon circle bg, large value text
```

### 8.3 Student Components

#### ProgressRing (`src/components/student/ProgressRing.js`)
```
Props: percentage(0-100), size(120), strokeWidth(8), color?
State: Client Component (animation on mount)
Features: SVG circle, animated stroke-dashoffset, percentage text center
CSS: Inline SVG, CSS transition for animation
```

#### CourseCard (`src/components/student/CourseCard.js`)
```
Props: subject{id, name, level_name}, progress{completed, total}, locked?
State: Server Component
Features:
  - Subject name + level badge
  - Progress bar (completed/total)
  - "Tiếp tục" button (if in progress)
  - "Hoàn thành ✅" badge (if done)
  - Lock overlay + "Đăng ký để mở khóa" (if locked)
CSS: Card with hover lift, progress bar colored by status
```

#### LessonContent (`src/components/student/LessonContent.js`)
```
Props: subject{name, content, video_url, resources[]}, progress, onComplete
State: Client Component (checkbox interaction)
Features:
  - Video embed (YouTube iframe)
  - Markdown-like content rendering (simple HTML)
  - Resource links list
  - "Đánh dấu hoàn thành" checkbox → calls onComplete
  - Previous/Next navigation
CSS: Max-width content area, video responsive (16:9), clean typography
```

---

## 9. PAGE-BY-PAGE SPECIFICATIONS

### 9.1 Auth Pages

#### Login Page (`/login`)
```
Layout: Centered card on gradient background
Sections:
  - AIgenlabs logo + "Đăng nhập" heading
  - Email input (required, type=email)
  - Password input (required, show/hide toggle)
  - "Quên mật khẩu?" link (optional, Phase 6)
  - Submit button "Đăng nhập" (primary, full-width)
  - Divider "hoặc"
  - Google OAuth button (secondary, full-width) [optional]
  - "Chưa có tài khoản? Đăng ký ngay" link → /register
  - Error message display (red alert below form)
```

#### Register Page (`/register`)
```
Layout: Same as login
Fields (all required except noted):
  - Họ và tên (text)
  - Email (email)  
  - Mật khẩu (password, min 6 chars)
  - Xác nhận mật khẩu (password)
  - Số điện thoại (tel, VN format)
  - Tên phụ huynh (text) [optional]
  - Checkbox: "Tôi đồng ý với điều khoản sử dụng"
  - Submit button "Tạo tài khoản" (primary, full-width)
  - "Đã có tài khoản? Đăng nhập" link → /login
Validation:
  - Email format check
  - Password match check
  - Phone format check (starts with 0 or +84)
```

### 9.2 Admin Pages

#### Admin Dashboard (`/admin`)
```
Layout: Sidebar left + content right
Sections:
  1. Welcome header: "Xin chào, [Admin Name]" + current date
  2. KPI Grid (4 cards, 2x2):
     - 👥 Tổng học sinh (count from profiles where role=student)
     - 💰 Doanh thu tháng (sum payments where status=paid, this month)
     - 📚 Khóa đang active (count enrollments where status=active)
     - 🆕 Đăng ký mới (count enrollments, last 7 days)
  3. Recent Enrollments table (5 most recent):
     Columns: Tên, Level, Ngày đăng ký, Trạng thái
  4. Quick Actions buttons:
     - "+ Thêm học sinh" → modal or /admin/students/new
     - "Xem thanh toán" → /admin/payments
```

#### Students List (`/admin/students`)
```
DataTable:
  Columns: Họ tên, Email, Phone, Level hiện tại, Trạng thái, Ngày đăng ký
  Search: by name or email
  Filters: Level (1,2,3,All), Status (active, completed, paused)
  Actions: Click row → /admin/students/[id]
  Button: "+ Thêm học sinh mới" (top right)
```

#### Student Detail (`/admin/students/[id]`)
```
Sections:
  1. Header: Avatar + Name + Status badge + Edit button
  2. Info grid: Email, Phone, Parent phone, Parent name, Registered date
  3. Enrollments table: Level, Status, Ngày đăng ký, Ngày hoàn thành
  4. Progress grid: Subject name | Completed checkbox | Date
  5. Payments table: Level, Amount, Status, Method, Date
  6. Notes textarea (admin-only, free-form)
```

#### Courses Management (`/admin/courses`)
```
Layout: 3 expandable level sections
Each Level:
  - Header: Level name + badge (X môn) + price + Edit price button
  - Subject list: Drag-and-drop with sort_order (optional)
  - Each subject: Name, "Edit" link → /admin/courses/[id]
  - "+ Thêm môn học" button at bottom
```

#### Course Edit (`/admin/courses/[id]`)
```
Form fields:
  - Subject name (text input)
  - Description (textarea)
  - Video URL (text input, YouTube/Vimeo)
  - Content (large textarea, supports simple formatting)
  - Resources (list of {title, url}, add/remove)
  - Save button (primary) + Cancel (secondary)
  - Delete subject button (red, with confirm modal)
```

#### Payments (`/admin/payments`)
```
DataTable:
  Columns: Học sinh, Level, Số tiền, Phương thức, Trạng thái, Ngày tạo
  Filters: Status (pending, paid, refunded), Level
  Actions:
    - "Xác nhận thanh toán" → update status to 'paid'
    - "Hoàn tiền" → update status to 'refunded'
  Summary: Total doanh thu (sum of paid), Chờ thanh toán (sum of pending)
```

### 9.3 Student Pages

#### Student Dashboard (`/student`)
```
Layout: Sidebar left + content right
Sections:
  1. Welcome: "👋 Chào [Name]!" + motivational quote
  2. Current Level card:
     - Level name + badge
     - ProgressRing (overall %)
     - "X/Y môn hoàn thành"
  3. "Bài học tiếp theo" card:
     - Next uncompleted subject name
     - "Tiếp tục học →" button
  4. All levels progress overview:
     - 3 horizontal progress bars (Level 1, 2, 3)
     - Enrolled levels colored, locked levels grayed
```

#### Course List (`/student/courses`)
```
3 tabs: Level 1 | Level 2 | Level 3
Each tab:
  - Grid of CourseCards (enrolled subjects)
  - Locked subjects shown grayed (if not enrolled in that level)
  - "Liên hệ đăng ký Level X" CTA for locked levels
```

#### Course Detail (`/student/courses/[id]`)
```
Layout: Content area with sidebar lesson list
  - Left: LessonContent component (video + text + resources)
  - Right sidebar: Lesson list with checkmarks
  - Bottom: Previous/Next buttons
  - Progress auto-saves when checkbox clicked
```

#### Profile (`/student/profile`)
```
Sections:
  1. Avatar + Name + Email (read-only)
  2. Contact Info: Phone, Parent info
  3. Enrollment History: Level, Status, Date
  4. Portfolio Links: GitHub URL, Website URL (editable)
  5. Certificates: Download PDF for completed levels (optional, Phase 6)
```

---

## 10. HƯỚNG DẪN VIBE CODING HIỆU QUẢ — CHO ANTIGRAVITY IDE

### Nguyên tắc cốt lõi
1. **Mọi thông tin cần thiết nằm trong file này** — không cần nhớ, chỉ cần đọc
2. **Mỗi phiên làm 1 phase** — không trộn phase
3. **Đọc spec → Plan → Code batch nhỏ → Test → Commit**
4. **Cập nhật "Tiến Độ Hiện Tại" (Section 2) sau mỗi milestone**

### Khi bắt đầu phiên mới (prompt template)
```
Hãy đọc file docs/aigenlabs-prd.md (Master Reference Document) để hiểu toàn bộ 
project context. Sau đó cho biết:
1. Tiến độ hiện tại (Phase nào đã xong, Phase nào đang làm)
2. Files nào đã tạo, files nào cần tạo
3. Bước tiếp theo cần làm
```

### Khi code (prompt template)  
```
Đọc Section [N] trong docs/aigenlabs-prd.md. Tạo [file path] theo đúng spec.
Tham khảo pattern từ [file đã có]. Dùng design tokens từ globals.css.
```

### Khi mất kết nối
```
Tất cả context đã được lưu trong docs/aigenlabs-prd.md. AI mới chỉ cần đọc
file đó là có ĐỦ thông tin để tiếp tục. Không cần hỏi lại bất kỳ điều gì.
```
