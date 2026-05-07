-- Schema Setup cho hệ thống Blog / Tin tức (Supabase)

CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  cover_image_mobile_url TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật RLS (Row Level Security) cho bảng blogs
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Chính sách 1: Mọi người (Public) đều có thể ĐỌC các bài blog ĐÃ XUẤT BẢN
CREATE POLICY "Public read published blogs" 
ON blogs FOR SELECT 
TO authenticated, anon 
USING (is_published = true);

-- Chính sách 2: Chỉ Admin được phép thiết lập toàn bộ quyền (Đọc, Sửa, Xóa nháp)
CREATE POLICY "Admin manage blogs" 
ON blogs FOR ALL 
USING (public.is_admin());

-- Tuỳ chọn phụ: Lệnh này thiết lập tự động chèn updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blogs_modtime
BEFORE UPDATE ON blogs
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
