-- StriveTrack Database Schema for Supabase
-- This schema replaces the Cloudflare D1 database with Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security (RLS) for all tables
-- This ensures users can only access their own data

-- =====================================
-- PROFILES TABLE (User Profiles)
-- =====================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    profile_picture TEXT,
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    weekly_target INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================
-- HABITS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS habits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    icon TEXT DEFAULT '🎯',
    color TEXT DEFAULT '#3B82F6',
    target_frequency INTEGER DEFAULT 7, -- times per week
    points_per_completion INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Habits policies
CREATE POLICY "Users can manage own habits" ON habits
    FOR ALL USING (auth.uid() = user_id);

-- =====================================
-- HABIT COMPLETIONS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS habit_completions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
    points_earned INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

-- Habit completions policies
CREATE POLICY "Users can manage own completions" ON habit_completions
    FOR ALL USING (auth.uid() = user_id);

-- =====================================
-- WORKOUTS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS workouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'general', -- cardio, strength, flexibility, etc.
    duration_minutes INTEGER,
    calories_burned INTEGER,
    exercises JSONB, -- Store exercise data as JSON
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Workouts policies
CREATE POLICY "Users can manage own workouts" ON workouts
    FOR ALL USING (auth.uid() = user_id);

-- =====================================
-- PROGRESS PHOTOS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS progress_photos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    image_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    body_part TEXT, -- front, back, side, etc.
    weight_lbs DECIMAL(5,2),
    measurements JSONB, -- Store body measurements as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

-- Progress photos policies
CREATE POLICY "Users can manage own progress photos" ON progress_photos
    FOR ALL USING (auth.uid() = user_id);

-- =====================================
-- ACHIEVEMENTS TABLE (System-wide)
-- =====================================
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '🏆',
    category TEXT DEFAULT 'general',
    points_value INTEGER DEFAULT 50,
    requirement_type TEXT NOT NULL, -- 'streak', 'total_completions', 'points', etc.
    requirement_value INTEGER NOT NULL,
    badge_color TEXT DEFAULT '#FFD700',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- No RLS on achievements - they're global

-- =====================================
-- USER ACHIEVEMENTS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_value INTEGER, -- Current progress toward achievement
    UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements" ON user_achievements
    FOR INSERT WITH CHECK (true);

-- =====================================
-- POINTS HISTORY TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS points_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    points_change INTEGER NOT NULL,
    reason TEXT NOT NULL, -- 'habit_completion', 'achievement', 'bonus', etc.
    reference_id UUID, -- ID of related habit, achievement, etc.
    reference_type TEXT, -- 'habit', 'achievement', 'workout', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

-- Points history policies
CREATE POLICY "Users can view own points history" ON points_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert points" ON points_history
    FOR INSERT WITH CHECK (true);

-- =====================================
-- STORAGE BUCKETS SETUP
-- =====================================
-- Create storage buckets for media files
INSERT INTO storage.buckets (id, name, public) VALUES
    ('avatars', 'avatars', true),
    ('progress-photos', 'progress-photos', true),
    ('workout-videos', 'workout-videos', true),
    ('user-media', 'user-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for progress photos bucket
CREATE POLICY "Users can view own progress photos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'progress-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can upload progress photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'progress-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for workout videos bucket
CREATE POLICY "Users can view own workout videos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'workout-videos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can upload workout videos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'workout-videos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for user media bucket
CREATE POLICY "Users can view own media" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'user-media' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can upload media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-media' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================
-- TRIGGERS AND FUNCTIONS
-- =====================================

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_habits_updated_at
    BEFORE UPDATE ON habits
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Function to update user points when habits are completed
CREATE OR REPLACE FUNCTION public.update_user_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Add points to user's total
    UPDATE profiles 
    SET total_points = total_points + NEW.points_earned
    WHERE id = NEW.user_id;
    
    -- Record points history
    INSERT INTO points_history (user_id, points_change, reason, reference_id, reference_type)
    VALUES (NEW.user_id, NEW.points_earned, 'habit_completion', NEW.habit_id, 'habit');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update points when habit is completed
CREATE TRIGGER on_habit_completion
    AFTER INSERT ON habit_completions
    FOR EACH ROW EXECUTE FUNCTION update_user_points();

-- =====================================
-- SAMPLE ACHIEVEMENTS DATA
-- =====================================
INSERT INTO achievements (name, description, icon, category, points_value, requirement_type, requirement_value) VALUES
    ('First Steps', 'Complete your first habit', '🥉', 'milestone', 25, 'total_completions', 1),
    ('Getting Started', 'Complete 5 habits', '🎯', 'milestone', 50, 'total_completions', 5),
    ('Habit Builder', 'Complete 10 habits', '⚡', 'milestone', 100, 'total_completions', 10),
    ('Dedicated', 'Complete 25 habits', '💪', 'milestone', 200, 'total_completions', 25),
    ('Committed', 'Complete 50 habits', '🏃', 'milestone', 400, 'total_completions', 50),
    ('Unstoppable', 'Complete 100 habits', '🔥', 'milestone', 800, 'total_completions', 100),
    ('Consistency King', 'Maintain a 7-day streak', '👑', 'streak', 150, 'streak', 7),
    ('Streak Master', 'Maintain a 14-day streak', '🏆', 'streak', 300, 'streak', 14),
    ('Habit Legend', 'Maintain a 30-day streak', '🌟', 'streak', 600, 'streak', 30),
    ('Point Collector', 'Earn 500 points', '💎', 'points', 100, 'points', 500),
    ('Point Master', 'Earn 1000 points', '💰', 'points', 200, 'points', 1000),
    ('Point Legend', 'Earn 2500 points', '👑', 'points', 500, 'points', 2500)
ON CONFLICT DO NOTHING;

-- =====================================
-- INDEXES FOR PERFORMANCE
-- =====================================
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_active ON habits(is_active);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_id ON habit_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_id ON progress_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);