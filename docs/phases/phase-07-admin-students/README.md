# Phase 07: Admin Students CRUD — Session 7

> 1 Session = 1 Phase = tối đa 2 files. Đọc file này là đủ context.

## Mục tiêu
Quản lý học sinh: danh sách + chi tiết.

## Dependencies
- Session 6 (DataTable + Dashboard) phải completed

## Files (2)

### 1. `src/app/admin/students/page.js`
```
Type: Server Component + DataTable (client)
DataTable Columns: Họ tên, Email, Phone, Level hiện tại, Trạng thái, Ngày đăng ký
Query: supabase.from('profiles').select('*, enrollments(status, levels(name))').eq('role', 'student').order('created_at', { ascending: false })
Search: by name or email
Actions: Click row → /admin/students/[id]
Button: "+ Thêm học sinh mới" (top right)
```

### 2. `src/app/admin/students/[id]/page.js`
```
Type: Server Component + Client editable sections
Sections:
  1. Header: Avatar + Name + Status badge
  2. Info grid: Email, Phone, Parent phone, Parent name, Date (dd/mm/yyyy)
  3. Enrollments table: Level, Status, Ngày đăng ký, Ngày hoàn thành
     Query: supabase.from('enrollments').select('*, levels(name)').eq('student_id', id)
  4. Progress grid: Subject name | Completed checkbox | Date
     Query: supabase.from('progress').select('*, subjects(name)').eq('student_id', id)
  5. Payments table: Level, Amount (VNĐ), Status, Method, Date
     Query: supabase.from('payments').select('*, levels(name)').eq('student_id', id)
  6. Notes textarea
```

## Verify
- Student list loads, search by name/email hoạt động
- Click row → navigate /admin/students/[id]
- Detail: 5 sections hiển thị đầy đủ
- `npm run build` pass

## Commit
`feat(admin): students list + detail pages`
