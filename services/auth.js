// Supabase Authentication Service for StriveTrack
import { supabase, getCurrentUser, getUserProfile, upsertUserProfile } from '../config/supabase.js'

/**
 * Authentication Service
 * Handles user registration, login, logout, and session management
 */
export class AuthService {
  constructor() {
    this.currentUser = null
    this.currentProfile = null
    this.authStateListeners = new Set()
    
    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.handleAuthStateChange(event, session)
    })
  }

  /**
   * Handle authentication state changes
   */
  async handleAuthStateChange(event, session) {
    console.log('🔐 Auth state changed:', event, session?.user?.email)
    
    if (session?.user) {
      this.currentUser = session.user
      // Load user profile
      try {
        this.currentProfile = await getUserProfile(session.user.id)
      } catch (error) {
        console.error('Error loading user profile:', error)
      }
    } else {
      this.currentUser = null
      this.currentProfile = null
    }
    
    // Notify listeners
    this.authStateListeners.forEach(listener => {
      try {
        listener(this.currentUser, this.currentProfile)
      } catch (error) {
        console.error('Error in auth state listener:', error)
      }
    })
  }

  /**
   * Add auth state change listener
   */
  onAuthStateChange(callback) {
    this.authStateListeners.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.authStateListeners.delete(callback)
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName || '',
            username: userData.username || ''
          }
        }
      })

      if (error) throw error

      // If user is created, update profile with additional data
      if (data.user && !error) {
        console.log('✅ User created successfully:', data.user.email)
        
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Update profile with additional data
        if (userData.username || userData.fullName) {
          await upsertUserProfile({
            username: userData.username,
            full_name: userData.fullName
          })
        }
      }

      return { user: data.user, error: null }
    } catch (error) {
      console.error('❌ Sign up error:', error.message)
      return { user: null, error }
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      console.log('✅ User signed in successfully:', data.user.email)
      return { user: data.user, error: null }
    } catch (error) {
      console.error('❌ Sign in error:', error.message)
      return { user: null, error }
    }
  }

  /**
   * Sign in with magic link
   */
  async signInWithMagicLink(email) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      console.log('✅ Magic link sent successfully to:', email)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Magic link error:', error.message)
      return { data: null, error }
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error

      // Clear local data
      this.currentUser = null
      this.currentProfile = null
      
      console.log('✅ User signed out successfully')
      return { error: null }
    } catch (error) {
      console.error('❌ Sign out error:', error.message)
      return { error }
    }
  }

  /**
   * Get current authenticated user
   */
  async getUser() {
    if (this.currentUser) {
      return this.currentUser
    }
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      
      this.currentUser = user
      return user
    } catch (error) {
      console.error('❌ Get user error:', error.message)
      return null
    }
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    if (this.currentProfile) {
      return this.currentProfile
    }
    
    try {
      const user = await this.getUser()
      if (!user) return null
      
      this.currentProfile = await getUserProfile(user.id)
      return this.currentProfile
    } catch (error) {
      console.error('❌ Get profile error:', error.message)
      return null
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    try {
      const profile = await upsertUserProfile(updates)
      this.currentProfile = profile
      
      console.log('✅ Profile updated successfully')
      return { profile, error: null }
    } catch (error) {
      console.error('❌ Update profile error:', error.message)
      return { profile: null, error }
    }
  }

  /**
   * Change user password
   */
  async changePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      console.log('✅ Password changed successfully')
      return { error: null }
    } catch (error) {
      console.error('❌ Change password error:', error.message)
      return { error }
    }
  }

  /**
   * Reset password via email
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      console.log('✅ Password reset email sent to:', email)
      return { error: null }
    } catch (error) {
      console.error('❌ Reset password error:', error.message)
      return { error }
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    const user = await this.getUser()
    return !!user
  }

  /**
   * Initialize auth service (call on app startup)
   */
  async initialize() {
    try {
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error
      
      if (session?.user) {
        this.currentUser = session.user
        this.currentProfile = await getUserProfile(session.user.id)
      }
      
      console.log('🔐 Auth service initialized')
      return { user: this.currentUser, profile: this.currentProfile }
    } catch (error) {
      console.error('❌ Auth initialization error:', error.message)
      return { user: null, profile: null }
    }
  }
}

// Create and export singleton instance
export const authService = new AuthService()
export default authService