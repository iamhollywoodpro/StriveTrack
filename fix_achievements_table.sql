-- Fix achievements table by adding missing columns
ALTER TABLE achievements ADD COLUMN category TEXT DEFAULT 'general';
ALTER TABLE achievements ADD COLUMN rarity TEXT DEFAULT 'common';

-- Update existing achievements with proper categories
UPDATE achievements SET category = 'habits' WHERE requirement_type IN ('habits_created', 'total_completions', 'habit_streak');
UPDATE achievements SET category = 'progress' WHERE requirement_type IN ('media_uploads');
UPDATE achievements SET category = 'points' WHERE requirement_type IN ('total_points');

-- Update rarities based on points
UPDATE achievements SET rarity = 'common' WHERE points <= 25;
UPDATE achievements SET rarity = 'uncommon' WHERE points > 25 AND points <= 75;
UPDATE achievements SET rarity = 'rare' WHERE points > 75 AND points <= 150;
UPDATE achievements SET rarity = 'epic' WHERE points > 150;