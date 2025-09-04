-- Add media_type column to media_uploads table
-- This enables proper categorization of before/after/progress media

-- Add media_type column with default 'progress'
ALTER TABLE media_uploads ADD COLUMN media_type TEXT DEFAULT 'progress';

-- Update any existing media without a type to 'progress'  
UPDATE media_uploads SET media_type = 'progress' WHERE media_type IS NULL OR media_type = '';

-- Create index for better performance on media_type queries
CREATE INDEX IF NOT EXISTS idx_media_uploads_type ON media_uploads(media_type);
CREATE INDEX IF NOT EXISTS idx_media_uploads_user_type ON media_uploads(user_id, media_type);

-- Display current state for verification
SELECT 'Media uploads after migration:' as status;
SELECT media_type, COUNT(*) as count FROM media_uploads GROUP BY media_type;