// Hybrid Storage Sync Service for StriveTrack
// Handles cloud-first storage with localStorage fallback for offline use
import { authService } from './auth.js'
import { habitsService } from './habits.js'
import { storageService } from './storage.js'

/**
 * Sync Service
 * Manages hybrid storage: cloud primary, localStorage fallback
 */
export class SyncService {
  constructor() {
    this.isOnline = navigator.onLine
    this.syncQueue = []
    this.syncInProgress = false
    this.lastSyncTime = null
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())
    
    // Auto-sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && authService.currentUser) {
        this.syncToCloud()
      }
    }, 5 * 60 * 1000)
  }

  /**
   * Initialize sync service
   */
  async initialize() {
    this.isOnline = navigator.onLine
    
    if (this.isOnline && await authService.isAuthenticated()) {
      await this.syncFromCloud()
    } else {
      this.loadFromLocalStorage()
    }
  }

  /**
   * Handle coming online
   */
  async handleOnline() {
    console.log('🌐 Back online - starting sync...')
    this.isOnline = true
    
    if (await authService.isAuthenticated()) {
      await this.syncToCloud()
      await this.syncFromCloud()
    }
  }

  /**
   * Handle going offline
   */
  handleOffline() {
    console.log('📱 Gone offline - switching to localStorage')
    this.isOnline = false
  }

  /**
   * Check if we're in online mode
   */
  isOnlineMode() {
    return this.isOnline && authService.currentUser
  }

  /**
   * Sync data from cloud to localStorage
   */
  async syncFromCloud() {
    if (!this.isOnlineMode()) return

    try {
      console.log('⬇️ Syncing from cloud...')
      
      // Sync habits and completions
      const habits = await habitsService.getUserHabits()
      const completions = await habitsService.getWeeklyCompletions()
      const profile = await authService.getProfile()
      
      // Store in localStorage as backup
      this.saveToLocalStorage('habits', habits)
      this.saveToLocalStorage('completions', completions)
      this.saveToLocalStorage('profile', profile)
      
      this.lastSyncTime = new Date().toISOString()
      this.saveToLocalStorage('lastSync', this.lastSyncTime)
      
      console.log('✅ Cloud sync complete')
      return { habits, completions, profile }
    } catch (error) {
      console.error('❌ Error syncing from cloud:', error.message)
      return this.loadFromLocalStorage()
    }
  }

  /**
   * Sync pending changes to cloud
   */
  async syncToCloud() {
    if (!this.isOnlineMode() || this.syncInProgress) return

    this.syncInProgress = true
    
    try {
      console.log('⬆️ Syncing to cloud...')
      
      // Process sync queue
      const processed = []
      
      for (const item of this.syncQueue) {
        try {
          await this.processSyncItem(item)
          processed.push(item)
        } catch (error) {
          console.error('❌ Error syncing item:', item, error.message)
          // Keep failed items in queue for retry
        }
      }
      
      // Remove processed items from queue
      this.syncQueue = this.syncQueue.filter(item => !processed.includes(item))
      
      // Save updated queue
      this.saveToLocalStorage('syncQueue', this.syncQueue)
      
      console.log('✅ Cloud upload complete')
      return true
    } catch (error) {
      console.error('❌ Error syncing to cloud:', error.message)
      return false
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Process individual sync item
   */
  async processSyncItem(item) {
    switch (item.type) {
      case 'habit_create':
        return await habitsService.createHabit(item.data)
      
      case 'habit_update':
        return await habitsService.updateHabit(item.id, item.data)
      
      case 'habit_delete':
        return await habitsService.deleteHabit(item.id)
      
      case 'habit_complete':
        return await habitsService.completeHabit(item.habitId, item.data)
      
      case 'profile_update':
        return await authService.updateProfile(item.data)
      
      default:
        console.warn('Unknown sync item type:', item.type)
    }
  }

  /**
   * Create a habit (hybrid mode)
   */
  async createHabit(habitData) {
    try {
      if (this.isOnlineMode()) {
        // Create in cloud immediately
        const habit = await habitsService.createHabit(habitData)
        
        // Update localStorage backup
        const habits = this.getFromLocalStorage('habits', [])
        habits.unshift(habit)
        this.saveToLocalStorage('habits', habits)
        
        return habit
      } else {
        // Create offline with temporary ID
        const tempHabit = {
          id: 'temp_' + Date.now(),
          ...habitData,
          created_at: new Date().toISOString(),
          is_active: true,
          user_id: 'offline'
        }
        
        // Store in localStorage
        const habits = this.getFromLocalStorage('habits', [])
        habits.unshift(tempHabit)
        this.saveToLocalStorage('habits', habits)
        
        // Add to sync queue
        this.addToSyncQueue({
          type: 'habit_create',
          data: habitData,
          tempId: tempHabit.id
        })
        
        return tempHabit
      }
    } catch (error) {
      console.error('❌ Error creating habit:', error.message)
      throw error
    }
  }

  /**
   * Complete a habit (hybrid mode)
   */
  async completeHabit(habitId, completionData = {}) {
    try {
      if (this.isOnlineMode()) {
        // Complete in cloud immediately
        const completion = await habitsService.completeHabit(habitId, completionData)
        
        // Update localStorage backup
        const completions = this.getFromLocalStorage('completions', [])
        completions.unshift(completion)
        this.saveToLocalStorage('completions', completions)
        
        return completion
      } else {
        // Complete offline with temporary ID
        const tempCompletion = {
          id: 'temp_' + Date.now(),
          habit_id: habitId,
          ...completionData,
          completed_at: completionData.completedAt || new Date().toISOString(),
          points_earned: 10 // Default points
        }
        
        // Store in localStorage
        const completions = this.getFromLocalStorage('completions', [])
        completions.unshift(tempCompletion)
        this.saveToLocalStorage('completions', completions)
        
        // Add to sync queue
        this.addToSyncQueue({
          type: 'habit_complete',
          habitId,
          data: completionData,
          tempId: tempCompletion.id
        })
        
        return tempCompletion
      }
    } catch (error) {
      console.error('❌ Error completing habit:', error.message)
      throw error
    }
  }

  /**
   * Get habits (hybrid mode)
   */
  async getHabits() {
    try {
      if (this.isOnlineMode()) {
        const habits = await habitsService.getHabitsWithTodayStatus()
        
        // Update localStorage backup
        this.saveToLocalStorage('habits', habits)
        
        return habits
      } else {
        // Load from localStorage
        return this.getHabitsFromLocalStorage()
      }
    } catch (error) {
      console.error('❌ Error getting habits:', error.message)
      
      // Fallback to localStorage
      return this.getHabitsFromLocalStorage()
    }
  }

  /**
   * Get habits from localStorage with completion status
   */
  getHabitsFromLocalStorage() {
    const habits = this.getFromLocalStorage('habits', [])
    const completions = this.getFromLocalStorage('completions', [])
    const today = new Date().toISOString().split('T')[0]
    
    // Filter today's completions
    const todayCompletions = completions.filter(completion => {
      const completionDate = new Date(completion.completed_at).toISOString().split('T')[0]
      return completionDate === today
    })
    
    // Add completion status to habits
    return habits.map(habit => ({
      ...habit,
      completedToday: todayCompletions.some(c => c.habit_id === habit.id),
      todayCompletions: todayCompletions.filter(c => c.habit_id === habit.id),
      completionCount: todayCompletions.filter(c => c.habit_id === habit.id).length
    }))
  }

  /**
   * Add item to sync queue
   */
  addToSyncQueue(item) {
    item.timestamp = new Date().toISOString()
    this.syncQueue.push(item)
    this.saveToLocalStorage('syncQueue', this.syncQueue)
    
    console.log('📝 Added to sync queue:', item.type)
  }

  /**
   * Get data from localStorage
   */
  getFromLocalStorage(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(`strivetrack_${key}`)
      return data ? JSON.parse(data) : defaultValue
    } catch (error) {
      console.error('❌ Error reading from localStorage:', error.message)
      return defaultValue
    }
  }

  /**
   * Save data to localStorage
   */
  saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(`strivetrack_${key}`, JSON.stringify(data))
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error.message)
    }
  }

  /**
   * Load all data from localStorage
   */
  loadFromLocalStorage() {
    return {
      habits: this.getFromLocalStorage('habits', []),
      completions: this.getFromLocalStorage('completions', []),
      profile: this.getFromLocalStorage('profile', null),
      syncQueue: this.getFromLocalStorage('syncQueue', []),
      lastSync: this.getFromLocalStorage('lastSync', null)
    }
  }

  /**
   * Clear all localStorage data
   */
  clearLocalStorage() {
    const keys = ['habits', 'completions', 'profile', 'syncQueue', 'lastSync']
    keys.forEach(key => {
      localStorage.removeItem(`strivetrack_${key}`)
    })
    console.log('🧹 Local storage cleared')
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isAuthenticated: !!authService.currentUser,
      syncInProgress: this.syncInProgress,
      queueLength: this.syncQueue.length,
      lastSync: this.lastSyncTime,
      hasOfflineData: this.syncQueue.length > 0
    }
  }

  /**
   * Force sync now
   */
  async forcSync() {
    if (!this.isOnlineMode()) {
      throw new Error('Cannot sync while offline or unauthenticated')
    }
    
    await this.syncToCloud()
    await this.syncFromCloud()
    
    return this.getSyncStatus()
  }

  /**
   * Get estimated data usage
   */
  getDataUsage() {
    const data = this.loadFromLocalStorage()
    const jsonString = JSON.stringify(data)
    const sizeInBytes = new Blob([jsonString]).size
    
    return {
      sizeInBytes,
      formattedSize: storageService.formatFileSize(sizeInBytes),
      itemCounts: {
        habits: data.habits?.length || 0,
        completions: data.completions?.length || 0,
        queueItems: data.syncQueue?.length || 0
      }
    }
  }

  /**
   * Clean up old data
   */
  cleanupOldData() {
    // Clean completions older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const completions = this.getFromLocalStorage('completions', [])
    const filteredCompletions = completions.filter(completion => {
      return new Date(completion.completed_at) > thirtyDaysAgo
    })
    
    if (filteredCompletions.length !== completions.length) {
      this.saveToLocalStorage('completions', filteredCompletions)
      console.log(`🧹 Cleaned up ${completions.length - filteredCompletions.length} old completions`)
    }
  }
}

// Create and export singleton instance
export const syncService = new SyncService()
export default syncService