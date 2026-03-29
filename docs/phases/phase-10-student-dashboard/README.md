# Phase 10: Student Dashboard & Course List — Session 10

> 1 Session = 1 Phase = tối đa 3 files. Đọc file này là đủ context.

## Mục tiêu
Dashboard tổng quan + danh sách khóa học.

## Dependencies
- Session 9 (Student Layout) phải completed

## Files (3)

### 1. `src/components/student/CourseCard.js`
```
Type: Server Component
Props: { subject: { id, name, level_name }, progress: { completed, total }, locked? }
States:
  - In-progress: "Tiếp tục →" link → /student/courses/[id]
  - Done: "Hoàn thành ✅" badge (green)
  - Locked: gray overlay + "Đăng ký để mở khóa"
CSS: Card hover lift, progress bar 6px, locked opacity 0.5
```

### 2. `src/app/student/page.js` — Dashboard
```
Type: Server Component
Sections:
  1. "👋 Chào [Name]!" + motivational quote
  2. Current Level card + ProgressRing (overall %)
  3. "Bài học tiếp theo" card + "Tiếp tục học →"
  4. All levels: 3 horizontal progress bars
Query: profiles, enrollments, progress (joined)
```

### 3. `src/app/student/courses/page.js`
```
Type: Server Component + Client tabs
3 tabs: Level 1 | Level 2 | Level 3
Each tab: Grid of CourseCards (2-col desktop, 1-col mobile)
Locked levels: grayed + "Liên hệ đăng ký Level X"
Query: subjects by level_id + progress by student_id
```

## Verify
- Dashboard: progress đúng cho logged-in student
- CourseCard 3 states hoạt động
- Course list: 3 tabs, locked grayed
- `npm run build` pass

## Commit
`feat(student): dashboard + course card + course list`
