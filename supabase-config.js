// StriveTrack Supabase Configuration
import { createClient } from '@supabase/supabase-js'

// Supabase credentials
const supabaseUrl = 'https://hilukaxsamucnqdbxlwd.supabase.co'
// Use anon public key (you'll need to get this from your Supabase dashboard)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbHVrYXhzYW11Y25xZGJ4bHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYxNjg5NTgsImV4cCI6MjA0MTc0NDk1OH0.uBaJt7nnJNOLJAtsOjFrQvdzcG7BJ5-LopQ1ITMzhH4'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Database configuration
export const SUPABASE_CONFIG = {
    url: supabaseUrl,
    key: supabaseKey,
    
    // Storage buckets
    buckets: {
        media: 'user-media',
        avatars: 'user-avatars'
    },
    
    // Tables
    tables: {
        users: 'users',
        habits: 'habits',
        habit_completions: 'habit_completions',
        goals: 'goals',
        nutrition_logs: 'nutrition_logs',
        media_uploads: 'media_uploads',
        achievements: 'user_achievements',
        friends: 'user_friends',
        friend_invites: 'friend_invites',
        social_posts: 'social_posts',
        competitions: 'competitions'
    }
}

console.log('✅ Supabase configuration loaded')