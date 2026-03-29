# Phase 13 — Security Hardening

> **Session**: S13
> **Module**: Security Fixes (3 lỗ hổng nghiêm trọng)
> **Status**: ✅ Completed
> **Date**: 2026-03-25

---

## Mục tiêu

Fix 3 lỗ hổng bảo mật nghiêm trọng được phát hiện trong audit toàn bộ codebase:

1. **Thiếu server-side role check** — Student có thể truy cập `/admin` qua URL
2. **CreateStudent dùng client-side signUp** — Admin bị logout khi tạo student
3. **XSS trong LessonContent** — `dangerouslySetInnerHTML` không sanitize

---

## Spec Chi Tiết

### 1. Server-side Role Check (middleware.js)

**Trước**: Middleware chỉ check login/not-login, không check role.
**Sau**: Query `profiles.role` → chặn:
- Student → `/admin/*` → redirect `/student`
- Admin → `/student/*` → redirect `/admin`
- Auth pages → redirect theo role

**File**: `src/middleware.js` (MODIFIED)

### 2. CreateStudent API Route

**Trước**: `CreateStudentModal` gọi `supabase.auth.signUp()` từ client → session bị hijack → admin logout.
**Sau**: Tạo API Route `/api/admin/create-student` dùng Supabase Admin API (`service_role` key):
- Verify caller là admin (session + role check)
- `admin.createUser()` không ảnh hưởng session
- Update profile + auto-enroll

**Files**:
- `src/app/api/admin/create-student/route.js` (NEW)
- `src/components/admin/CreateStudentModal.js` (MODIFIED)
- `.env.local` (MODIFIED — thêm `SUPABASE_SERVICE_ROLE_KEY`)

### 3. XSS Sanitization

**Trước**: `dangerouslySetInnerHTML={{ __html: body }}` — XSS nếu content chứa `<script>`.
**Sau**: Dùng DOMPurify sanitize HTML trước khi render.

**Files**:
- `src/lib/sanitize.js` (NEW)
- `src/components/student/LessonContent.js` (MODIFIED)
- `package.json` (MODIFIED — thêm `dompurify`)

---

## Files Tổng Kết

| # | File | Action |
|---|---|---|
| 1 | `src/middleware.js` | MODIFIED |
| 2 | `src/app/api/admin/create-student/route.js` | NEW |
| 3 | `src/components/admin/CreateStudentModal.js` | MODIFIED |
| 4 | `src/lib/sanitize.js` | NEW |
| 5 | `src/components/student/LessonContent.js` | MODIFIED |

**Dependencies thêm**: `dompurify`
**Env vars thêm**: `SUPABASE_SERVICE_ROLE_KEY`

---

## Verification

- ✅ `npm run build` pass — 0 errors, 15 routes (incl. new `/api/admin/create-student`)
- ⬜ Browser verify: Phase 1 role redirect
- ⬜ Browser verify: Phase 2 create student (cần `SUPABASE_SERVICE_ROLE_KEY` thật)
- ⬜ Browser verify: Phase 3 XSS blocked

---

## Cross-references

- `docs/database-schema.md` — `profiles.role` field used in middleware
- `docs/phases/phase-03-auth-core/` — Original auth implementation
- `docs/phases/phase-07-admin-students/` — Original students CRUD
- `docs/phases/phase-11-student-learning/` — Original LessonContent
