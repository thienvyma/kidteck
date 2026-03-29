# Phase 14 — Admin CRUD Completion

> **Session**: S14
> **Module**: Admin CRUD (Level, Subject, Student Edit)
> **Status**: 🔲 Not Started
> **Effort**: ~1.5 ngày

---

## Mục tiêu

Hoàn thiện CRUD đầy đủ cho Admin Portal. Hiện tại admin chỉ:
- Students: view list, view detail, create (✅) — **thiếu edit/delete**
- Courses: view levels, edit/delete subject (✅) — **thiếu create Level, create Subject**

## Spec Chi Tiết

### 1. Tạo Level mới (Admin Courses)

**File**: `src/app/admin/courses/page.js` (MODIFY)

- Thêm nút "➕ Tạo Level mới" ở đầu accordion
- Mở modal/inline form với fields:
  - `name` (text, required) — e.g. "Advanced Builder"
  - `slug` (text, auto-generate từ name) — e.g. "level-4"
  - `description` (textarea)
  - `price` (number, VNĐ) — e.g. 12000000
  - `duration_weeks` (number)
  - `sort_order` (number)
- Submit: `supabase.from('levels').insert({...})`
- Refresh danh sách sau khi tạo

**Schema reference** (`docs/database-schema.md`):
```sql
levels: id, name, slug, description, price, subject_count, duration_weeks, sort_order, is_active
```

### 2. Tạo Subject mới (Admin Courses)

**File**: `src/app/admin/courses/page.js` (MODIFY)

- Trong mỗi level accordion, thêm nút "➕ Thêm môn học"
- Inline form hoặc modal:
  - `name` (text, required)
  - `description` (textarea)
  - `sort_order` (number)
- Submit: `supabase.from('subjects').insert({ level_id, name, description, sort_order })`
- Refresh accordion sau khi tạo

**Schema reference**:
```sql
subjects: id, level_id, name, description, content (JSONB), sort_order
```

### 3. Edit Student Profile (Admin)

**File**: `src/app/admin/students/[id]/page.js` (MODIFY)

Thêm khả năng edit student từ trang detail:

- **Edit profile fields**: full_name, phone, parent_name, parent_phone
- **Change enrollment status**: active ↔ paused ↔ completed ↔ cancelled
- **Delete student**: Xóa profile + cascade enrollments/progress/payments
- UI: Inline edit mode (click "✏️ Chỉnh sửa" → fields thành editable → nút Lưu/Hủy)

**Cần API route mới**: `src/app/api/admin/update-student/route.js` (NEW)
- Verify admin session
- Update profile fields
- Returns JSON response

### 4. Fix Middleware comment lỗi thời

**File**: `src/middleware.js` (MODIFY — minor)

Cập nhật comment lines 4-12 cho đúng logic hiện tại (query profiles.role).

---

## Files Tổng Kết

| # | File | Action | Lines est. |
|---|---|---|---|
| 1 | `src/app/admin/courses/page.js` | MODIFY — add create Level + Subject | +80 |
| 2 | `src/app/admin/students/[id]/page.js` | MODIFY — add edit/delete | +60 |
| 3 | `src/app/api/admin/update-student/route.js` | NEW — admin edit API | ~60 |
| 4 | `src/middleware.js` | MODIFY — fix comments | ~5 |

**Tổng**: 3 file sửa, 1 file mới (≤4 files — đúng RULES.md)

---

## Verification

- [ ] `npm run build` pass
- [ ] Browser: Tạo Level mới → hiển thị trong accordion
- [ ] Browser: Tạo Subject mới trong Level → hiển thị trong accordion
- [ ] Browser: Edit student profile → data cập nhật
- [ ] Browser: Delete student → redirect về danh sách
- [ ] Responsive check (375px)

---

## Cross-references

- `docs/database-schema.md` — Schema cho levels, subjects, profiles
- `docs/phases/phase-07-admin-students/` — Original students CRUD
- `docs/phases/phase-08-admin-courses/` — Original courses page
