// Supabase Configuration for StriveTrack
import { createClient } from '@supabase/supabase-js'

// Supabase connection details
// In production, these should be environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Storage bucket names
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  PROGRESS_PHOTOS: 'progress-photos',
  WORKOUT_VIDEOS: 'workout-videos',
  MEDIA: 'user-media'
}

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  HABITS: 'habits', 
  HABIT_COMPLETIONS: 'habit_completions',
  WORKOUTS: 'workouts',
  PROGRESS_PHOTOS: 'progress_photos',
  ACHIEVEMENTS: 'achievements',
  USER_ACHIEVEMENTS: 'user_achievements',
  POINTS: 'points_history'
}

// Helper function to get authenticated user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  return user
}

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const user = await getCurrentUser()
  return !!user
}

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
    return false
  }
  return true
}

// Helper function to get user profile
export const getUserProfile = async (userId = null) => {
  const user = userId || await getCurrentUser()
  if (!user) return null
  
  const { data, error } = await supabase
    .from(TABLES.PROFILES)
    .select('*')
    .eq('id', user.id)
    .single()
    
  if (error) {
    console.error('Error getting user profile:', error)
    return null
  }
  
  return data
}

// Helper function to create or update user profile
export const upsertUserProfile = async (profileData) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')
  
  const { data, error } = await supabase
    .from(TABLES.PROFILES)
    .upsert({
      id: user.id,
      email: user.email,
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
    
  if (error) {
    console.error('Error upserting user profile:', error)
    throw error
  }
  
  return data
}

export default supabase