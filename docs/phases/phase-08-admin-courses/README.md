# Phase 08: Admin Courses & Payments — Session 8

> 1 Session = 1 Phase = tối đa 3 files. Đọc file này là đủ context.

## Mục tiêu
Quản trị khóa học + theo dõi thanh toán.

## Dependencies
- Session 7 (Students CRUD) phải completed

## Files (3)

### 1. `src/app/admin/courses/page.js`
```
Type: Server Component + Client expand/collapse
Layout: 3 expandable level sections (accordion)
Each Level:
  - Header: Level name + badge (X môn) + price (VNĐ)
  - Subject list: Name + "Chỉnh sửa" link → /admin/courses/[id]
  - "+ Thêm môn học" button
Query: supabase.from('levels').select('*, subjects(*)').order('sort_order')
```

### 2. `src/app/admin/courses/[id]/page.js`
```
Type: "use client" (form editing)
Form:
  - Subject name (text, required)
  - Description (textarea)
  - Video URL (text, YouTube/Vimeo)
  - Content (large textarea, 10+ rows)
  - Resources (dynamic list {title, url}, add/remove)
  - Save (primary) + Cancel (secondary)
  - Delete (red, confirm dialog → tạo `src/components/ui/Modal.js` nếu chưa có, xem PRD §8.1)
Save: supabase.from('subjects').update({ name, description, content }).eq('id', id)
Delete: supabase.from('subjects').delete().eq('id', id) → redirect /admin/courses
```

### 3. `src/app/admin/payments/page.js`
```
Type: Server Component + Client actions
DataTable Columns: Học sinh, Level, Số tiền (VNĐ), Phương thức, Trạng thái, Ngày
Query: supabase.from('payments').select('*, profiles(full_name), levels(name)').order('created_at', { ascending: false })
Filters: Status (pending/paid/refunded)
Actions:
  - "Xác nhận" → update status='paid', paid_at=now()
  - "Hoàn tiền" → update status='refunded'
Summary: Total doanh thu + Chờ thanh toán
```

## Verify
- Courses: 3 levels expand/collapse, edit + save + delete
- Payments: filter, actions update DB
- `npm run build` pass

## Commit
`feat(admin): courses management + payments page`
