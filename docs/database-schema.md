# Database Schema — AIgenlabs

## Supabase Configuration
- Project URL: (set in .env.local as NEXT_PUBLIC_SUPABASE_URL)
- Anon Key: (set in .env.local as NEXT_PUBLIC_SUPABASE_ANON_KEY)

## Tables

### profiles
Extends Supabase `auth.users`. Created via trigger on user signup.
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'student')) DEFAULT 'student',
  phone TEXT,
  parent_phone TEXT,
  parent_name TEXT,
  avatar_url TEXT,
  website_url TEXT,                -- Added S15: student portfolio website
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### levels
```sql
CREATE TABLE levels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,           -- "Khám phá Vibe Coding"
  slug TEXT UNIQUE NOT NULL,    -- "level-1"
  description TEXT,
  price INTEGER NOT NULL,       -- VNĐ, e.g. 1500000
  subject_count INTEGER,
  duration_weeks INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data (tên PHẢI khớp với landing page)
INSERT INTO levels (name, slug, description, price, subject_count, duration_weeks, sort_order) VALUES
  ('Digital Foundation', 'level-1', 'Chuyển con từ tiêu thụ → sáng tạo. Hiểu AI, dùng AI an toàn, tạo sản phẩm đầu tiên.', 1500000, 2, 4, 1),
  ('Problem Solver', 'level-2', 'Rèn luyện tư duy giải quyết vấn đề. Tự build tools, tự học, tự trình bày.', 4000000, 5, 8, 2),
  ('AI Builder', 'level-3', 'Xây dựng nền tảng vững cho tương lai. Hiểu AI sâu, build sản phẩm AI, sẵn sàng cho đại học & nghề nghiệp.', 8500000, 8, 12, 3);

-- Subject seed data (khớp với landing page)
-- Level 1: Digital Foundation (2 môn)
INSERT INTO subjects (level_id, name, description, content, sort_order) VALUES
  (1, 'AI Basics', 'Hiểu AI, dùng AI an toàn', '{}', 1),
  (1, 'Website đầu tiên', 'Tạo web cá nhân live trên internet', '{}', 2);

-- Level 2: Problem Solver (5 môn)
INSERT INTO subjects (level_id, name, description, content, sort_order) VALUES
  (2, 'Tư duy logic & Problem Solving', 'Phân tích vấn đề, chia nhỏ task, tìm giải pháp có hệ thống', '{}', 1),
  (2, 'AI Tools thành thạo', 'Thành thạo 3+ AI Tools cho học tập và sáng tạo', '{}', 2),
  (2, 'Web App hoàn chỉnh', 'Build web app thật chạy trên internet', '{}', 3),
  (2, 'Tự học hiệu quả', 'Cách tìm kiếm, đánh giá nguồn tin, học có phương pháp', '{}', 4),
  (2, 'Teamwork & Thuyết trình', 'Làm việc nhóm, trình bày sản phẩm, Demo Day', '{}', 5);

-- Level 3: AI Builder (8 môn)
INSERT INTO subjects (level_id, name, description, content, sort_order) VALUES
  (3, 'AI Concepts & LLM', 'Hiểu sâu AI, LLM, và cách hoạt động', '{}', 1),
  (3, 'API & Integration', 'Kết nối dịch vụ, xây dựng hệ thống', '{}', 2),
  (3, 'Mobile App', 'Build app thật trên điện thoại', '{}', 3),
  (3, 'AI Agent & Bot', 'Tạo bot tự động 24/7', '{}', 4),
  (3, 'SaaS & Monetization', 'Xây sản phẩm SaaS, hiểu business model', '{}', 5),
  (3, 'Data & Analytics', 'Thu thập, phân tích dữ liệu', '{}', 6),
  (3, 'DevOps & Deployment', 'CI/CD, hosting, monitoring', '{}', 7),
  (3, 'Đồ án tốt nghiệp', 'Portfolio project lớn + Mentor 1-on-1', '{}', 8);
```

### subjects
```sql
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{}',   -- encrypted at rest by server helpers before returning to students
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### enrollments
```sql
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  level_id INTEGER REFERENCES levels(id),
  status TEXT CHECK (status IN ('active','completed','paused','cancelled')) DEFAULT 'active',
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, level_id)
);
```

### progress
```sql
CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(student_id, subject_id)
);
```

### payments
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  level_id INTEGER REFERENCES levels(id),
  amount INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending','paid','refunded')) DEFAULT 'pending',
  method TEXT,                  -- 'bank_transfer', 'momo', 'cash'
  transaction_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### blogs
```sql
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Row Level Security (RLS)

### Helper Function (SECURITY DEFINER — bypasses RLS to avoid infinite recursion)
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Policies
```sql
-- Profiles: users can read own, admin can read all (via is_admin())
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read all profiles" ON profiles FOR SELECT USING (
  auth.uid() = id OR public.is_admin()
);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Levels: public read (catalog)
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read levels" ON levels FOR SELECT TO authenticated, anon USING (true);

-- Subjects: public read remains enabled for catalog metadata,
-- but the `content` payload is stored encrypted at rest.
-- Lesson content must only be decrypted through server routes
-- after checking enrollment status.
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read subjects" ON subjects FOR SELECT TO authenticated, anon USING (true);

-- Enrollments: users read own, admin manage all
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own enrollments" ON enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Admin manage enrollments" ON enrollments FOR ALL USING (public.is_admin());

-- Progress: users read/write own, admin read all
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON progress FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Admin read all progress" ON progress FOR SELECT USING (public.is_admin());

-- Payments: users read own, admin manage all
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own payments" ON payments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Admin manage payments" ON payments FOR ALL USING (public.is_admin());

-- Blogs: public read published, admin manage all
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published blogs" ON blogs FOR SELECT TO authenticated, anon USING (is_published = true);
CREATE POLICY "Admin manage blogs" ON blogs FOR ALL USING (public.is_admin());
```
