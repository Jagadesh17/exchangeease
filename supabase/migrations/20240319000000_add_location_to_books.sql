-- Add location column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS location text; 