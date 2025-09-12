// Media Storage Service for StriveTrack
import { supabase, STORAGE_BUCKETS, TABLES, getCurrentUser } from '../config/supabase.js'

/**
 * Storage Service
 * Handles file uploads, downloads, and media management for progress photos and videos
 */
export class StorageService {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024 // 10MB
    this.allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    this.allowedVideoTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi']
  }

  /**
   * Upload progress photo
   */
  async uploadProgressPhoto(file, metadata = {}) {
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      // Validate file
      this.validateImageFile(file)

      const fileName = this.generateFileName(file, 'progress')
      const filePath = `${user.id}/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.PROGRESS_PHOTOS)
        .upload(filePath, file)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKETS.PROGRESS_PHOTOS)
        .getPublicUrl(filePath)

      // Save metadata to database
      const progressPhoto = {
        user_id: user.id,
        title: metadata.title || '',
        description: metadata.description || '',
        image_url: publicUrl,
        image_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        body_part: metadata.bodyPart || '',
        weight_lbs: metadata.weight || null,
        measurements: metadata.measurements || null,
        created_at: new Date().toISOString()
      }

      const { data: dbData, error: dbError } = await supabase
        .from(TABLES.PROGRESS_PHOTOS)
        .insert(progressPhoto)
        .select()
        .single()

      if (dbError) throw dbError

      console.log('✅ Progress photo uploaded:', fileName)
      return { ...dbData, publicUrl }
    } catch (error) {
      console.error('❌ Error uploading progress photo:', error.message)
      throw error
    }
  }

  /**
   * Upload workout video
   */
  async uploadWorkoutVideo(file, metadata = {}) {
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      // Validate file
      this.validateVideoFile(file)

      const fileName = this.generateFileName(file, 'workout')
      const filePath = `${user.id}/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.WORKOUT_VIDEOS)
        .upload(filePath, file)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKETS.WORKOUT_VIDEOS)
        .getPublicUrl(filePath)

      console.log('✅ Workout video uploaded:', fileName)
      return { path: filePath, publicUrl, fileName }
    } catch (error) {
      console.error('❌ Error uploading workout video:', error.message)
      throw error
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file) {
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      // Validate file
      this.validateImageFile(file)

      const fileName = `avatar.${file.name.split('.').pop()}`
      const filePath = `${user.id}/${fileName}`

      // Delete existing avatar if it exists
      await supabase.storage
        .from(STORAGE_BUCKETS.AVATARS)
        .remove([filePath])

      // Upload new avatar
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.AVATARS)
        .upload(filePath, file)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKETS.AVATARS)
        .getPublicUrl(filePath)

      console.log('✅ Avatar uploaded:', fileName)
      return { path: filePath, publicUrl, fileName }
    } catch (error) {
      console.error('❌ Error uploading avatar:', error.message)
      throw error
    }
  }

  /**
   * Get user's progress photos
   */
  async getProgressPhotos(limit = 50, offset = 0) {
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from(TABLES.PROGRESS_PHOTOS)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      console.log('✅ Loaded progress photos:', data.length)
      return data || []
    } catch (error) {
      console.error('❌ Error loading progress photos:', error.message)
      throw error
    }
  }

  /**
   * Delete progress photo
   */
  async deleteProgressPhoto(photoId) {
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      // Get photo details first
      const { data: photo, error: getError } = await supabase
        .from(TABLES.PROGRESS_PHOTOS)
        .select('*')
        .eq('id', photoId)
        .eq('user_id', user.id)
        .single()

      if (getError) throw getError

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKETS.PROGRESS_PHOTOS)
        .remove([photo.image_path])

      if (storageError) {
        console.warn('Warning: Could not delete file from storage:', storageError.message)
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from(TABLES.PROGRESS_PHOTOS)
        .delete()
        .eq('id', photoId)
        .eq('user_id', user.id)

      if (dbError) throw dbError

      console.log('✅ Progress photo deleted:', photoId)
      return true
    } catch (error) {
      console.error('❌ Error deleting progress photo:', error.message)
      throw error
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(bucket, filePath) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

      if (error) throw error

      console.log('✅ File deleted from storage:', filePath)
      return true
    } catch (error) {
      console.error('❌ Error deleting file:', error.message)
      throw error
    }
  }

  /**
   * Get file public URL
   */
  getPublicUrl(bucket, filePath) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  /**
   * Create signed URL for private files
   */
  async createSignedUrl(bucket, filePath, expiresIn = 3600) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn)

      if (error) throw error

      return data.signedUrl
    } catch (error) {
      console.error('❌ Error creating signed URL:', error.message)
      throw error
    }
  }

  /**
   * Validate image file
   */
  validateImageFile(file) {
    if (!file) {
      throw new Error('No file provided')
    }

    if (!this.allowedImageTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed: ${this.allowedImageTypes.join(', ')}`)
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File too large. Maximum size: ${this.maxFileSize / 1024 / 1024}MB`)
    }
  }

  /**
   * Validate video file
   */
  validateVideoFile(file) {
    if (!file) {
      throw new Error('No file provided')
    }

    if (!this.allowedVideoTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed: ${this.allowedVideoTypes.join(', ')}`)
    }

    if (file.size > this.maxFileSize * 5) { // 50MB for videos
      throw new Error(`File too large. Maximum size: ${this.maxFileSize * 5 / 1024 / 1024}MB`)
    }
  }

  /**
   * Generate unique filename
   */
  generateFileName(file, prefix = '') {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    
    return `${prefix}_${timestamp}_${random}.${extension}`
  }

  /**
   * Resize image before upload (using canvas)
   */
  async resizeImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        // Set canvas dimensions and draw image
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }))
            } else {
              reject(new Error('Failed to resize image'))
            }
          },
          file.type,
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Batch upload multiple files
   */
  async batchUpload(files, type = 'progress', metadata = []) {
    const results = []
    const errors = []

    for (let i = 0; i < files.length; i++) {
      try {
        let result
        const fileMetadata = metadata[i] || {}

        if (type === 'progress') {
          result = await this.uploadProgressPhoto(files[i], fileMetadata)
        } else if (type === 'video') {
          result = await this.uploadWorkoutVideo(files[i], fileMetadata)
        } else if (type === 'avatar') {
          result = await this.uploadAvatar(files[i])
        }

        results.push(result)
      } catch (error) {
        errors.push({ file: files[i].name, error: error.message })
      }
    }

    return { results, errors }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats() {
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      // Count progress photos
      const { count: photoCount } = await supabase
        .from(TABLES.PROGRESS_PHOTOS)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Get total file sizes
      const { data: photos, error } = await supabase
        .from(TABLES.PROGRESS_PHOTOS)
        .select('file_size')
        .eq('user_id', user.id)

      if (error) throw error

      const totalSize = (photos || []).reduce((sum, photo) => sum + (photo.file_size || 0), 0)

      return {
        photoCount: photoCount || 0,
        totalSize: totalSize,
        formattedSize: this.formatFileSize(totalSize)
      }
    } catch (error) {
      console.error('❌ Error getting storage stats:', error.message)
      return {
        photoCount: 0,
        totalSize: 0,
        formattedSize: '0 B'
      }
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Create and export singleton instance
export const storageService = new StorageService()
export default storageService