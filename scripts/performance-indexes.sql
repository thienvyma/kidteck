-- AIgenlabs performance indexes
-- Run this once in Supabase SQL Editor (production + staging).

create index if not exists profiles_role_idx
  on public.profiles (role);

create index if not exists levels_sort_order_idx
  on public.levels (sort_order);

create index if not exists subjects_level_sort_idx
  on public.subjects (level_id, sort_order);

create index if not exists enrollments_student_status_level_idx
  on public.enrollments (student_id, status, level_id);

create index if not exists enrollments_student_enrolled_at_idx
  on public.enrollments (student_id, enrolled_at desc);

create index if not exists progress_student_completed_idx
  on public.progress (student_id, completed, completed_at desc);

create index if not exists payments_student_level_created_idx
  on public.payments (student_id, level_id, created_at desc);

create index if not exists payments_status_paid_at_idx
  on public.payments (status, paid_at desc);
