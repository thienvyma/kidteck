# Phase 11: Student Learning & Profile — Session 11

> 1 Session = 1 Phase = tối đa 3 files. Đọc file này là đủ context.

## Mục tiêu
Nội dung bài học (video + bài viết + checkbox hoàn thành) + hồ sơ cá nhân.

## Dependencies
- Session 10 (Dashboard + Course List) phải completed

## Files (3)

### 1. `src/app/student/courses/[id]/page.js`
```
Type: Server Component + Client interactions
Layout: Content (left 70%) + Lesson sidebar (right 30%)
Content: LessonContent component
Sidebar: List subjects cùng level, checkmarks cho completed, current highlighted
Bottom: Previous/Next buttons
Query: subjects by id + progress by student_id
```

### 2. `src/components/student/LessonContent.js`
```
Type: "use client" (checkbox, video)
Props: { subject: { name, content: { body, video_url, resources[] } }, progress, onComplete }
Features:
  - Video: YouTube iframe, 16:9 (padding-top 56.25%, position relative/absolute)
  - Nếu video_url trống → ẩn video
  - Content: render body as HTML, max-width 720px, line-height 1.7
  - Resources: links list với external arrow icon
  - "Đánh dấu hoàn thành" checkbox:
    onChange → supabase.from('progress').upsert({ student_id, subject_id, completed: true })
    Optimistic UI: update ngay, rollback nếu error
```

### 3. `src/app/student/profile/page.js`
```
Type: Server Component + Client editable
Sections:
  1. Avatar + Name + Email (read-only)
  2. Contact: Phone, Parent info → "Liên hệ admin để thay đổi"
  3. Enrollment history: Level, Status, Date
  4. Portfolio (editable): GitHub URL, Website URL → save to profiles
  5. Certificates: "Tính năng đang phát triển" placeholder
```

## Edge Cases
- Content trống → "Nội dung đang được cập nhật"
- Video URL invalid → ẩn video
- Chưa enroll → CTA "Đăng ký khóa học"

## Verify
- Video embed responsive 16:9
- Checkbox → progress updates trong DB
- Profile: portfolio links editable + save
- `npm run build` pass

## Commit
`feat(student): lesson content + profile page`
