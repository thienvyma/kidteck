-- Add responsive mobile cover support for existing blog tables.

ALTER TABLE blogs
ADD COLUMN IF NOT EXISTS cover_image_mobile_url TEXT;
