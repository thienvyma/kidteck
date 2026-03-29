-- ============================================================
-- KidTech Seed Data Script
-- Run this in Supabase SQL Editor to populate test data
-- ============================================================

-- ============================================================
-- 1. Create test users in auth.users (Supabase Auth)
-- ============================================================
-- NOTE: Admin account (thienvyma@gmail.com / 151194Vy@) already exists via UI.
-- For student accounts, use the Supabase Dashboard → Authentication → Users → "Add user"
-- or run from Supabase Auth API. Below we seed profiles + data AFTER users exist.

-- ============================================================
-- 2. Update admin profile with full info
-- ============================================================
UPDATE profiles SET
  full_name = 'Thiện Vy (Admin)',
  phone = '0901234567',
  parent_phone = NULL,
  parent_name = NULL,
  role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'thienvyma@gmail.com' LIMIT 1);

-- ============================================================
-- 3. Create student profiles (after creating users in Auth)
-- ============================================================
-- Student 1: Minh Anh (Level 1 - Digital Foundation)
-- Student 2: Bảo Ngọc (Level 2 - Problem Solver) 
-- Student 3: Đức Huy (Level 3 - AI Builder)
--
-- CREATE THESE USERS FIRST via Supabase Auth Dashboard:
--   Email: minhanh.student@kidtech.test  / Pass: KidTech@2026
--   Email: baongoc.student@kidtech.test  / Pass: KidTech@2026
--   Email: duchuy.student@kidtech.test   / Pass: KidTech@2026
--
-- Then run the SQL below:

-- Update student profiles with Vietnamese info
UPDATE profiles SET
  full_name = 'Nguyễn Minh Anh',
  phone = '0912345001',
  parent_phone = '0901111222',
  parent_name = 'Nguyễn Văn Hùng'
WHERE id = (SELECT id FROM auth.users WHERE email = 'minhanh.student@kidtech.test' LIMIT 1);

UPDATE profiles SET
  full_name = 'Trần Bảo Ngọc',
  phone = '0912345002',
  parent_phone = '0902222333',
  parent_name = 'Trần Thị Lan'
WHERE id = (SELECT id FROM auth.users WHERE email = 'baongoc.student@kidtech.test' LIMIT 1);

UPDATE profiles SET
  full_name = 'Lê Đức Huy',
  phone = '0912345003',
  parent_phone = '0903333444',
  parent_name = 'Lê Minh Tuấn'
WHERE id = (SELECT id FROM auth.users WHERE email = 'duchuy.student@kidtech.test' LIMIT 1);

-- ============================================================
-- 4. Enrollments
-- ============================================================
-- Minh Anh → Level 1 (active)
INSERT INTO enrollments (student_id, level_id, status) VALUES
  ((SELECT id FROM auth.users WHERE email = 'minhanh.student@kidtech.test'), 1, 'active')
ON CONFLICT (student_id, level_id) DO NOTHING;

-- Bảo Ngọc → Level 1 (completed) + Level 2 (active)
INSERT INTO enrollments (student_id, level_id, status, completed_at) VALUES
  ((SELECT id FROM auth.users WHERE email = 'baongoc.student@kidtech.test'), 1, 'completed', NOW() - INTERVAL '30 days')
ON CONFLICT (student_id, level_id) DO NOTHING;

INSERT INTO enrollments (student_id, level_id, status) VALUES
  ((SELECT id FROM auth.users WHERE email = 'baongoc.student@kidtech.test'), 2, 'active')
ON CONFLICT (student_id, level_id) DO NOTHING;

-- Đức Huy → Level 1 (completed) + Level 2 (completed) + Level 3 (active)
INSERT INTO enrollments (student_id, level_id, status, completed_at) VALUES
  ((SELECT id FROM auth.users WHERE email = 'duchuy.student@kidtech.test'), 1, 'completed', NOW() - INTERVAL '90 days'),
  ((SELECT id FROM auth.users WHERE email = 'duchuy.student@kidtech.test'), 2, 'completed', NOW() - INTERVAL '30 days')
ON CONFLICT (student_id, level_id) DO NOTHING;

INSERT INTO enrollments (student_id, level_id, status) VALUES
  ((SELECT id FROM auth.users WHERE email = 'duchuy.student@kidtech.test'), 3, 'active')
ON CONFLICT (student_id, level_id) DO NOTHING;

-- ============================================================
-- 5. Progress (subject completion)
-- ============================================================
-- Minh Anh: completed 1/2 subjects in Level 1
INSERT INTO progress (student_id, subject_id, completed, completed_at) VALUES
  ((SELECT id FROM auth.users WHERE email = 'minhanh.student@kidtech.test'), 1, TRUE, NOW() - INTERVAL '7 days')
ON CONFLICT (student_id, subject_id) DO NOTHING;

-- Bảo Ngọc: completed ALL Level 1 + 3/5 Level 2
INSERT INTO progress (student_id, subject_id, completed, completed_at) VALUES
  ((SELECT id FROM auth.users WHERE email = 'baongoc.student@kidtech.test'), 1, TRUE, NOW() - INTERVAL '45 days'),
  ((SELECT id FROM auth.users WHERE email = 'baongoc.student@kidtech.test'), 2, TRUE, NOW() - INTERVAL '30 days'),
  ((SELECT id FROM auth.users WHERE email = 'baongoc.student@kidtech.test'), 3, TRUE, NOW() - INTERVAL '20 days'),
  ((SELECT id FROM auth.users WHERE email = 'baongoc.student@kidtech.test'), 4, TRUE, NOW() - INTERVAL '10 days'),
  ((SELECT id FROM auth.users WHERE email = 'baongoc.student@kidtech.test'), 5, TRUE, NOW() - INTERVAL '5 days')
ON CONFLICT (student_id, subject_id) DO NOTHING;

-- Đức Huy: completed ALL Level 1 + ALL Level 2 + 3/8 Level 3
INSERT INTO progress (student_id, subject_id, completed, completed_at) VALUES
  ((SELECT id FROM auth.users WHERE email = 'duchuy.student@kidtech.test'), 1, TRUE, NOW() - INTERVAL '120 days'),
  ((SELECT id FROM auth.users WHERE email = 'duchuy.student@kidtech.test'), 2, TRUE, NOW() - INTERVAL '100 days'),
  ((SELECT id FROM auth.users WHERE email = 'duchuy.student@kidtech.test'), 3, TRUE, NOW() - INTERVAL '80 days'),
  ((SELECT id FROM auth.users WHERE email = 'duchuy.student@kidtech.test'), 4, TRUE, NOW() - INTERVAL '70 days'),
  ((SELECT id FROM auth.users WHERE email = 'duchuy.student@kidtech.test'), 5, TRUE, NOW() - INTERVAL '60 days'),
  ((SELECT id FROM auth.users WHERE email = 'duchuy.student@kidtech.test'), 6, TRUE, NOW() - INTERVAL '50 days'),
  ((SELECT id FROM auth.users WHERE email = 'duchuy.student@kidtech.test'), 7, TRUE, NOW() - INTERVAL '40 days'),
  ((SELECT id FROM auth.users WHERE email = 'duchuy.student@kidtech.test'), 8, TRUE, NOW() - INTERVAL '30 days'),
  ((SELECT id FROM auth.users WHERE email = 'duchuy.student@kidtech.test'), 9, TRUE, NOW() - INTERVAL '20 days'),
  ((SELECT id FROM auth.users WHERE email = 'duchuy.student@kidtech.test'), 10, TRUE, NOW() - INTERVAL '10 days')
ON CONFLICT (student_id, subject_id) DO NOTHING;

-- ============================================================
-- 6. Payments
-- ============================================================
-- Minh Anh: 1 payment (paid)
INSERT INTO payments (student_id, level_id, amount, status, method, paid_at) VALUES
  ((SELECT id FROM auth.users WHERE email = 'minhanh.student@kidtech.test'), 1, 1500000, 'paid', 'bank_transfer', NOW() - INTERVAL '14 days');

-- Bảo Ngọc: 2 payments (both paid)
INSERT INTO payments (student_id, level_id, amount, status, method, paid_at) VALUES
  ((SELECT id FROM auth.users WHERE email = 'baongoc.student@kidtech.test'), 1, 1500000, 'paid', 'momo', NOW() - INTERVAL '60 days'),
  ((SELECT id FROM auth.users WHERE email = 'baongoc.student@kidtech.test'), 2, 4000000, 'paid', 'bank_transfer', NOW() - INTERVAL '30 days');

-- Đức Huy: 3 payments (2 paid + 1 pending for Level 3)
INSERT INTO payments (student_id, level_id, amount, status, method, paid_at) VALUES
  ((SELECT id FROM auth.users WHERE email = 'duchuy.student@kidtech.test'), 1, 1500000, 'paid', 'cash', NOW() - INTERVAL '120 days'),
  ((SELECT id FROM auth.users WHERE email = 'duchuy.student@kidtech.test'), 2, 4000000, 'paid', 'bank_transfer', NOW() - INTERVAL '60 days');

INSERT INTO payments (student_id, level_id, amount, status, method) VALUES
  ((SELECT id FROM auth.users WHERE email = 'duchuy.student@kidtech.test'), 3, 8500000, 'pending', 'bank_transfer');

-- ============================================================
-- Summary of test accounts:
-- ============================================================
-- ADMIN:   thienvyma@gmail.com        / 151194Vy@       → /admin
-- STUDENT: minhanh.student@kidtech.test / KidTech@2026  → /student (Level 1, 50% progress)
-- STUDENT: baongoc.student@kidtech.test / KidTech@2026  → /student (Level 2, 60% progress)
-- STUDENT: duchuy.student@kidtech.test  / KidTech@2026  → /student (Level 3, 37% progress)
-- ============================================================
