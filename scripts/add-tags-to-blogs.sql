-- Bổ sung cột Tags (dạng mảng chuỗi) cho bảng blogs
ALTER TABLE blogs 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
