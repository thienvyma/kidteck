# Phase 15 — UX Polish

> **Session**: S15
> **Module**: UX Improvements (Confirm Dialog, Skeleton, Profile fix)
> **Status**: 🔲 Not Started
> **Effort**: ~1 ngày

---

## Mục tiêu

Polish UX trên cả 2 portals: thay `window.confirm()` bằng custom dialog, thêm skeleton loading cho student pages, và fix bug website field không lưu.

## Spec Chi Tiết

### 1. Custom Confirm Dialog Component

**File**: `src/components/ui/ConfirmDialog.js` (NEW)

Thay thế `window.confirm()` native bằng modal chuyên nghiệp:

```jsx
// Usage:
<ConfirmDialog
  isOpen={showConfirm}
  title="Xác nhận hành động"
  message="Bạn có chắc muốn xóa môn học này?"
  confirmText="Xóa"
  cancelText="Hủy"
  variant="danger"  // "danger" (red) | "warning" (orange) | "default" (primary)
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
/>
```

**Features**:
- Overlay + centered modal (tái sử dụng pattern từ `CreateStudentModal`)
- 3 variants: danger (đỏ), warning (cam), default (tím)
- Keyboard: Enter → confirm, Escape → cancel
- Focus trap + close on overlay click

**Áp dụng vào**:
- `admin/payments/page.js` — Confirm/Refund actions (hiện dùng `window.confirm`)
- `admin/courses/[id]/page.js` — Delete subject (hiện dùng `window.confirm`)
- Phase 14: Delete student (nếu áp dụng)

### 2. Skeleton Loading cho Student Pages

**File**: `src/components/student/PageSkeleton.js` (NEW)

Student pages hiện chỉ hiển thị `<p>Đang tải...</p>`. Cần skeleton shimmer giống `DataTable`:

```jsx
// Generic skeleton component
<PageSkeleton variant="dashboard" />  // ProgressRing + cards
<PageSkeleton variant="courses" />    // Tab + grid
<PageSkeleton variant="profile" />    // Avatar + cards
```

**Áp dụng vào**:
- `student/page.js` — Dashboard skeleton (ring + stats)
- `student/courses/page.js` — Courses skeleton (tabs + card grid)
- `student/courses/[id]/page.js` — Lesson skeleton (video + content)
- `student/profile/page.js` — Profile skeleton (avatar + info cards)

**CSS**: Tái sử dụng `@keyframes shimmer` từ `globals.css` (đã có sẵn)

### 3. Fix Profile Website Field

**File**: `src/app/student/profile/page.js` (MODIFY)

**Bug hiện tại**:
- Line 30: `setWebsite('')` — hardcoded empty, không load từ DB
- Line 56: `handleSave` chỉ cập nhật `avatar_url: github` — bỏ qua website
- Schema `profiles` KHÔNG có column `website`

**Giải pháp**: Mở rộng `avatar_url` field thành JSON metadata hoặc tạo 2 fields riêng.

**Option A** *(recommended)* — Dùng `avatar_url` cho GitHub, thêm column `website_url`:
```sql
ALTER TABLE profiles ADD COLUMN website_url TEXT;
```
Update `handleSave`:
```js
.update({ avatar_url: github, website_url: website })
```
Update useEffect:
```js
setWebsite(prof?.website_url || '')
```

**Option B** — Dùng JSONB metadata:
```sql
ALTER TABLE profiles ADD COLUMN metadata JSONB DEFAULT '{}';
```
Riskier — cần migration + update nhiều nơi.

→ **Chọn Option A** (đơn giản, 1 column, backward compatible)

---

## Files Tổng Kết

| # | File | Action | Lines est. |
|---|---|---|---|
| 1 | `src/components/ui/ConfirmDialog.js` | NEW — Custom dialog | ~80 |
| 2 | `src/components/student/PageSkeleton.js` | NEW — Skeleton variants | ~60 |
| 3 | `src/app/student/profile/page.js` | MODIFY — fix website save | ~10 |
| 4 | `src/app/admin/payments/page.js` | MODIFY — use ConfirmDialog | ~15 |

**Tổng**: 2 file mới, 2 file sửa (≤4 files — đúng RULES.md)

**Database migration**: `ALTER TABLE profiles ADD COLUMN website_url TEXT;`

---

## Verification

- [ ] `npm run build` pass
- [ ] Browser: Payments confirm → custom dialog hiển thị (không còn native alert)
- [ ] Browser: Course delete → custom dialog đỏ hiển thị
- [ ] Browser: Student dashboard → skeleton shimmer khi loading
- [ ] Browser: Profile → nhập website → lưu → refresh → website vẫn còn
- [ ] Responsive check (375px)

---

## Cross-references

- `docs/database-schema.md` — Cần add `website_url` column
- `docs/phases/phase-08-admin-courses/` — Payments + Course edit
- `docs/phases/phase-11-student-learning/` — Profile page
- `src/app/globals.css` — `@keyframes shimmer` (line ~370)
