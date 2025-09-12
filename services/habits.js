// Habits Cloud Storage Service for StriveTrack
import { supabase, TABLES, getCurrentUser } from '../config/supabase.js'

/**
 * Habits Service
 * Handles CRUD operations for habits and habit completions
 */
export class HabitsService {
  constructor() {
    this.cache = new Map()
    this.cacheTTL = 5 * 60 * 1000 // 5 minutes
  }

  /**
   * Get all user habits
   */
  async getUserHabits() {
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from(TABLES.HABITS)
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('✅ Loaded habits from cloud:', data.length)
      return data || []
    } catch (error) {
      console.error('❌ Error loading habits:', error.message)
      throw error
    }
  }

  /**
   * Create a new habit
   */
  async createHabit(habitData) {
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const habit = {
        user_id: user.id,
        name: habitData.name.trim(),
        description: habitData.description || '',
        category: habitData.category || 'general',
        icon: habitData.icon || '🎯',
        color: habitData.color || '#3B82F6',
        target_frequency: habitData.targetFrequency || 7,
        points_per_completion: habitData.pointsPerCompletion || 10,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from(TABLES.HABITS)
        .insert(habit)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Habit created in cloud:', data.name)
      return data
    } catch (error) {
      console.error('❌ Error creating habit:', error.message)
      throw error
    }
  }

  /**
   * Update an existing habit
   */
  async updateHabit(habitId, updates) {
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from(TABLES.HABITS)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', habitId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Habit updated in cloud:', data.name)
      return data
    } catch (error) {
      console.error('❌ Error updating habit:', error.message)
      throw error
    }
  }

  /**
   * Delete a habit (soft delete by setting is_active to false)
   */
  async deleteHabit(habitId) {
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from(TABLES.HABITS)
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', habitId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Habit deleted in cloud:', data.name)
      return data
    } catch (error) {
      console.error('❌ Error deleting habit:', error.message)
      throw error
    }
  }

  /**
   * Complete a habit
   */
  async completeHabit(habitId, completionData = {}) {
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      // Get habit details for points
      const { data: habit, error: habitError } = await supabase
        .from(TABLES.HABITS)
        .select('points_per_completion')
        .eq('id', habitId)
        .eq('user_id', user.id)
        .single()

      if (habitError) throw habitError

      const completion = {
        user_id: user.id,
        habit_id: habitId,
        completed_at: completionData.completedAt || new Date().toISOString(),
        notes: completionData.notes || '',
        mood_rating: completionData.moodRating || null,
        points_earned: habit.points_per_completion,
      }

      const { data, error } = await supabase
        .from(TABLES.HABIT_COMPLETIONS)
        .insert(completion)
        .select()
        .single()

      if (error) throw error

      console.log('✅ Habit completed in cloud:', habitId)
      return data
    } catch (error) {
      console.error('❌ Error completing habit:', error.message)
      throw error
    }
  }

  /**
   * Get habit completions for a date range
   */
  async getHabitCompletions(startDate, endDate) {
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      let query = supabase
        .from(TABLES.HABIT_COMPLETIONS)
        .select(`
          *,
          habits:habit_id (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      if (startDate) {
        query = query.gte('completed_at', startDate)
      }
      if (endDate) {
        query = query.lte('completed_at', endDate)
      }

      const { data, error } = await query

      if (error) throw error

      console.log('✅ Loaded completions from cloud:', data.length)
      return data || []
    } catch (error) {
      console.error('❌ Error loading completions:', error.message)
      throw error
    }
  }

  /**
   * Get weekly habit completions (last 7 days)
   */
  async getWeeklyCompletions() {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000))
    
    return this.getHabitCompletions(startDate.toISOString(), endDate.toISOString())
  }

  /**
   * Get habits with completion status for today
   */
  async getHabitsWithTodayStatus() {
    try {
      const habits = await this.getUserHabits()
      const today = new Date().toISOString().split('T')[0]
      
      const completions = await this.getHabitCompletions(
        `${today}T00:00:00Z`,
        `${today}T23:59:59Z`
      )

      // Map completions by habit_id
      const completionMap = new Map()
      completions.forEach(completion => {
        if (!completionMap.has(completion.habit_id)) {
          completionMap.set(completion.habit_id, [])
        }
        completionMap.get(completion.habit_id).push(completion)
      })

      // Add completion status to habits
      const habitsWithStatus = habits.map(habit => ({
        ...habit,
        completedToday: completionMap.has(habit.id),
        todayCompletions: completionMap.get(habit.id) || [],
        completionCount: (completionMap.get(habit.id) || []).length
      }))

      return habitsWithStatus
    } catch (error) {
      console.error('❌ Error loading habits with status:', error.message)
      throw error
    }
  }

  /**
   * Get user's habit statistics
   */
  async getHabitStats() {
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      // Get total habits count
      const { count: totalHabits } = await supabase
        .from(TABLES.HABITS)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true)

      // Get total completions count
      const { count: totalCompletions } = await supabase
        .from(TABLES.HABIT_COMPLETIONS)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Get this week's completions
      const weeklyCompletions = await this.getWeeklyCompletions()

      // Calculate streak (consecutive days with at least one completion)
      const streak = await this.calculateCurrentStreak()

      return {
        totalHabits: totalHabits || 0,
        totalCompletions: totalCompletions || 0,
        weeklyCompletions: weeklyCompletions.length,
        currentStreak: streak
      }
    } catch (error) {
      console.error('❌ Error loading habit stats:', error.message)
      return {
        totalHabits: 0,
        totalCompletions: 0,
        weeklyCompletions: 0,
        currentStreak: 0
      }
    }
  }

  /**
   * Calculate current habit streak
   */
  async calculateCurrentStreak() {
    try {
      const user = await getCurrentUser()
      if (!user) return 0

      // Get completions for the last 60 days to calculate streak
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - (60 * 24 * 60 * 60 * 1000))
      
      const { data: completions, error } = await supabase
        .from(TABLES.HABIT_COMPLETIONS)
        .select('completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', startDate.toISOString())
        .order('completed_at', { ascending: false })

      if (error) throw error

      if (!completions || completions.length === 0) return 0

      // Group completions by date
      const completionDates = new Set()
      completions.forEach(completion => {
        const date = new Date(completion.completed_at).toISOString().split('T')[0]
        completionDates.add(date)
      })

      // Calculate consecutive days from today backwards
      let streak = 0
      const today = new Date()
      
      for (let i = 0; i < 60; i++) {
        const checkDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000))
        const dateString = checkDate.toISOString().split('T')[0]
        
        if (completionDates.has(dateString)) {
          streak++
        } else if (i > 0) {
          // If it's not today and we don't have a completion, break the streak
          break
        }
      }

      return streak
    } catch (error) {
      console.error('❌ Error calculating streak:', error.message)
      return 0
    }
  }

  /**
   * Search habits by name or category
   */
  async searchHabits(query) {
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from(TABLES.HABITS)
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('❌ Error searching habits:', error.message)
      throw error
    }
  }

  /**
   * Sync habits with localStorage (for offline support)
   */
  async syncWithLocalStorage() {
    try {
      const habits = await this.getUserHabits()
      const completions = await this.getWeeklyCompletions()
      
      // Store in localStorage as backup
      localStorage.setItem('strivetrack_habits_backup', JSON.stringify(habits))
      localStorage.setItem('strivetrack_completions_backup', JSON.stringify(completions))
      
      console.log('✅ Habits synced with localStorage backup')
      return { habits, completions }
    } catch (error) {
      console.error('❌ Error syncing with localStorage:', error.message)
      throw error
    }
  }

  /**
   * Load habits from localStorage backup (offline mode)
   */
  loadFromLocalStorage() {
    try {
      const habits = JSON.parse(localStorage.getItem('strivetrack_habits_backup') || '[]')
      const completions = JSON.parse(localStorage.getItem('strivetrack_completions_backup') || '[]')
      
      console.log('📱 Loaded habits from localStorage backup:', habits.length)
      return { habits, completions }
    } catch (error) {
      console.error('❌ Error loading from localStorage backup:', error.message)
      return { habits: [], completions: [] }
    }
  }
}

// Create and export singleton instance
export const habitsService = new HabitsService()
export default habitsService