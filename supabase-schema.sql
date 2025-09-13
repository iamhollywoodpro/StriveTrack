-- StriveTrack Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    points INTEGER DEFAULT 0,
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    last_active TIMESTAMP WITH TIME ZONE,
    is_online BOOLEAN DEFAULT false
);

-- Habits table
CREATE TABLE habits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    emoji VARCHAR(10),
    weekly_target INTEGER DEFAULT 7,
    difficulty VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Habit completions table
CREATE TABLE habit_completions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
    completion_date DATE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(habit_id, completion_date)
);

-- Goals table
CREATE TABLE goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    emoji VARCHAR(10),
    category VARCHAR(50) DEFAULT 'fitness',
    current_value DECIMAL(10,2) DEFAULT 0,
    target_value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'units',
    due_date DATE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition logs table
CREATE TABLE nutrition_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    emoji VARCHAR(10),
    meal_type VARCHAR(50) DEFAULT 'other',
    quantity DECIMAL(8,2) DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'serving',
    calories DECIMAL(8,2) DEFAULT 0,
    protein DECIMAL(8,2) DEFAULT 0,
    carbs DECIMAL(8,2) DEFAULT 0,
    fat DECIMAL(8,2) DEFAULT 0,
    log_date DATE NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media uploads table
CREATE TABLE media_uploads (
    id TEXT PRIMARY KEY, -- Using TEXT for compatibility with existing JS IDs
    user_id TEXT NOT NULL, -- Using TEXT for user IDs to match localStorage format
    filename VARCHAR(300) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    media_type VARCHAR(50) NOT NULL, -- before, progress, after
    storage_path TEXT NOT NULL, -- Supabase Storage path
    public_url TEXT, -- Public URL from Supabase Storage
    flagged BOOLEAN DEFAULT false,
    flag_reason TEXT,
    flagged_at TIMESTAMP WITH TIME ZONE,
    flagged_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(100) NOT NULL,
    unlocked BOOLEAN DEFAULT false,
    progress INTEGER DEFAULT 0,
    target INTEGER DEFAULT 1,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, achievement_id)
);

-- Friends relationship table
CREATE TABLE user_friends (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'accepted', -- pending, accepted, blocked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- Friend invites table
CREATE TABLE friend_invites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    invite_code VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, expired
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Social posts table (for activity feed)
CREATE TABLE social_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_type VARCHAR(50) NOT NULL, -- habit_completion, goal_achieved, media_upload, achievement
    content TEXT,
    metadata JSONB, -- Additional data like habit_id, achievement_id, etc.
    visibility VARCHAR(20) DEFAULT 'friends', -- public, friends, private
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitions table
CREATE TABLE competitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- step_challenge, habit_streak, points_race
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rules JSONB,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competition participants table
CREATE TABLE competition_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_score INTEGER DEFAULT 0,
    UNIQUE(competition_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_completions_user_id ON habit_completions(user_id);
CREATE INDEX idx_habit_completions_date ON habit_completions(completion_date);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_nutrition_logs_user_id ON nutrition_logs(user_id);
CREATE INDEX idx_nutrition_logs_date ON nutrition_logs(log_date);
CREATE INDEX idx_media_uploads_user_id ON media_uploads(user_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_friends_user_id ON user_friends(user_id);
CREATE INDEX idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX idx_social_posts_created_at ON social_posts(created_at);

-- **SUPABASE STORAGE SETUP FOR MEDIA UPLOADS**
-- Create storage bucket for media uploads (run this in Supabase Dashboard -> Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media-uploads', 'media-uploads', true);

-- Storage policies for media uploads bucket (run after bucket creation)
-- CREATE POLICY "Users can upload to their own folder" ON storage.objects 
-- FOR INSERT WITH CHECK (bucket_id = 'media-uploads');

-- CREATE POLICY "Users can view all media" ON storage.objects 
-- FOR SELECT USING (bucket_id = 'media-uploads');

-- CREATE POLICY "Users can delete their own media" ON storage.objects 
-- FOR DELETE USING (bucket_id = 'media-uploads');

-- CREATE POLICY "Admins can manage all media" ON storage.objects 
-- FOR ALL USING (bucket_id = 'media-uploads');

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for habits
CREATE POLICY "Users can manage their own habits" ON habits
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for habit completions
CREATE POLICY "Users can manage their own habit completions" ON habit_completions
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for goals
CREATE POLICY "Users can manage their own goals" ON goals
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for nutrition logs
CREATE POLICY "Users can manage their own nutrition logs" ON nutrition_logs
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for media uploads
CREATE POLICY "Users can manage their own media" ON media_uploads
    FOR ALL USING (user_id = auth.uid()::text OR flagged_by = auth.uid()::text);

-- Admin policy for media uploads (iamhollywoodpro@protonmail.com can manage all media)
CREATE POLICY "Admin can manage all media" ON media_uploads
    FOR ALL USING (auth.jwt() ->> 'email' = 'iamhollywoodpro@protonmail.com');

-- RLS Policies for achievements
CREATE POLICY "Users can manage their own achievements" ON user_achievements
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for friends
CREATE POLICY "Users can view their friend relationships" ON user_friends
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can manage their friend relationships" ON user_friends
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for social posts
CREATE POLICY "Users can view relevant social posts" ON social_posts
    FOR SELECT USING (
        auth.uid() = user_id OR
        visibility = 'public' OR
        (visibility = 'friends' AND EXISTS (
            SELECT 1 FROM user_friends 
            WHERE (user_id = auth.uid() AND friend_id = social_posts.user_id)
               OR (friend_id = auth.uid() AND user_id = social_posts.user_id)
        ))
    );

CREATE POLICY "Users can create their own posts" ON social_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create storage buckets (run these in Supabase Storage interface or via client)
-- These will need to be created manually in the Supabase dashboard:
-- 1. user-media bucket (for progress photos/videos)
-- 2. user-avatars bucket (for profile pictures)

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user points
CREATE OR REPLACE FUNCTION calculate_user_points(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    habit_points INTEGER := 0;
    media_points INTEGER := 0;
    achievement_points INTEGER := 0;
    total_points INTEGER := 0;
BEGIN
    -- Points from habit completions (10 points each)
    SELECT COUNT(*) * 10 INTO habit_points
    FROM habit_completions 
    WHERE user_id = user_uuid;
    
    -- Points from media uploads (50 points each)
    SELECT COUNT(*) * 50 INTO media_points
    FROM media_uploads 
    WHERE user_id = user_uuid;
    
    -- Achievement points would need to be calculated based on achievement definitions
    -- This is a placeholder - you'd need to implement based on your achievement system
    achievement_points := 0;
    
    total_points := habit_points + media_points + achievement_points;
    
    -- Update user's points
    UPDATE users SET points = total_points WHERE id = user_uuid;
    
    RETURN total_points;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update points when habits are completed
CREATE OR REPLACE FUNCTION update_user_points_on_completion()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_user_points(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_points_on_habit_completion 
    AFTER INSERT OR DELETE ON habit_completions
    FOR EACH ROW EXECUTE FUNCTION update_user_points_on_completion();

CREATE TRIGGER update_points_on_media_upload 
    AFTER INSERT OR DELETE ON media_uploads
    FOR EACH ROW EXECUTE FUNCTION update_user_points_on_completion();

-- Insert admin user (you can modify the email to match your admin account)
INSERT INTO users (id, email, name, role, created_at) 
VALUES (
    uuid_generate_v4(),
    'iamhollywoodpro@protonmail.com',
    'Admin',
    'admin',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 'StriveTrack database schema created successfully! 🎉' AS message;