# Phase 06: Admin Dashboard & DataTable — Session 6

> 1 Session = 1 Phase = tối đa 2 files. Đọc file này là đủ context.

## Mục tiêu
Component DataTable tái sử dụng + trang Dashboard với dữ liệu thực từ Supabase.

## Dependencies
- Session 5 (Admin Layout) phải completed

## Files (2)

### 1. `src/components/admin/DataTable.js`
```
Type: "use client" (search, sort, pagination state)
Props: {
  columns: [{ key, label, render? }],
  data: array,
  searchKey?: string,
  actions?: [{ label, onClick }],
  loading?: boolean,
  emptyMessage?: string
}
Features:
  - Search bar: filter by searchKey (debounce 300ms)
  - Column sort: click header → asc/desc toggle
  - Pagination: 10 items/page, prev/next, "Showing X-Y of Z"
  - Loading skeleton: 5 rows shimmer
  - Empty state: icon + message centered
CSS:
  - Striped rows (odd/even bg)
  - Hover highlight
  - Sticky header
  - Mobile: horizontal scroll
  - BEM: .dataTable, .dataTable__header, .dataTable__row
```

### 2. `src/app/admin/page.js` — Dashboard
```
Type: Server Component
Sections:
  1. "Xin chào, [Admin Name]" + date (dd/mm/yyyy)
  2. KPI Grid (4 StatsCard, 2x2 desktop / 1-col mobile):
     - 👥 Tổng học sinh: count profiles where role=student
     - 💰 Doanh thu tháng: sum payments where status=paid, current month → "1.500.000đ"
     - 📚 Khóa active: count enrollments where status=active
     - 🆕 Đăng ký mới: count enrollments last 7 days
  3. Recent Enrollments (DataTable, 5 rows):
     Columns: Tên, Level, Ngày đăng ký, Trạng thái
  4. Quick Actions: "+ Thêm học sinh", "Xem thanh toán"
```

## Verify
- DataTable: search, sort, pagination hoạt động
- Dashboard: 4 KPI cards với data từ Supabase
- `npm run build` pass

## Commit
`feat(admin): data table + dashboard page`
