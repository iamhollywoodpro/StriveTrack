// StriveTrack Supabase Service
// This replaces localStorage functionality with cloud storage

// Import Supabase client (will be loaded from CDN)
let supabase = null;

// Initialize Supabase client
function initializeSupabase() {
    const supabaseUrl = 'https://hilukaxsamucnqdbxlwd.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbHVrYXhzYW11Y25xZGJ4bHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MTE4NzEsImV4cCI6MjA3MzI4Nzg3MX0.fayoHSkZjlqaOSUbbrarRdKGgNI2UReZXMZfgqPzYD4';
    
    if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        window.supabaseClient = supabase; // Store client separately from CDN library
        console.log('✅ Supabase client initialized');
        return supabase;
    } else {
        console.error('❌ Supabase library not loaded');
        return null;
    }
}

// **USER MANAGEMENT**
class SupabaseUserService {
    static async createUser(email, name) {
        const { data, error } = await supabase
            .from('users')
            .insert([{ email, name }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async getUserByEmail(email) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        return error ? null : data;
    }
    
    static async updateUser(userId, updates) {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async updateUserActivity(userId) {
        return this.updateUser(userId, { 
            last_active: new Date().toISOString(),
            is_online: true 
        });
    }
    
    static async getAllUsers() {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    }
    
    static async deleteUser(userId) {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);
        
        if (error) throw error;
    }
}

// **HABITS MANAGEMENT**
class SupabaseHabitsService {
    static async getUserHabits(userId) {
        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    }
    
    static async createHabit(userId, habitData) {
        const { data, error } = await supabase
            .from('habits')
            .insert([{ ...habitData, user_id: userId }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async updateHabit(habitId, updates) {
        const { data, error } = await supabase
            .from('habits')
            .update(updates)
            .eq('id', habitId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async deleteHabit(habitId) {
        const { error } = await supabase
            .from('habits')
            .update({ is_active: false })
            .eq('id', habitId);
        
        if (error) throw error;
    }
    
    static async toggleHabitCompletion(userId, habitId, date = null) {
        const completionDate = date || new Date().toISOString().split('T')[0];
        
        // Check if completion exists
        const { data: existing } = await supabase
            .from('habit_completions')
            .select('id')
            .eq('habit_id', habitId)
            .eq('completion_date', completionDate)
            .single();
        
        if (existing) {
            // Remove completion
            const { error } = await supabase
                .from('habit_completions')
                .delete()
                .eq('id', existing.id);
            
            if (error) throw error;
            return { completed: false };
        } else {
            // Add completion
            const { data, error } = await supabase
                .from('habit_completions')
                .insert([{
                    user_id: userId,
                    habit_id: habitId,
                    completion_date: completionDate
                }])
                .select()
                .single();
            
            if (error) throw error;
            return { completed: true, data };
        }
    }
    
    static async getUserHabitsWithCompletions(userId) {
        const { data: habits, error: habitsError } = await supabase
            .from('habits')
            .select(`
                *,
                habit_completions(completion_date)
            `)
            .eq('user_id', userId)
            .eq('is_active', true);
        
        if (habitsError) throw habitsError;
        
        return habits.map(habit => {
            const completions = {};
            habit.habit_completions.forEach(comp => {
                completions[comp.completion_date] = true;
            });
            
            return {
                ...habit,
                completed_days: completions,
                current_streak: this.calculateStreak(completions),
                total_completions: Object.keys(completions).length
            };
        });
    }
    
    static calculateStreak(completions) {
        if (!completions || Object.keys(completions).length === 0) return 0;
        
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            if (completions[dateStr]) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }
}

// **GOALS MANAGEMENT**
class SupabaseGoalsService {
    static async getUserGoals(userId) {
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    }
    
    static async createGoal(userId, goalData) {
        const { data, error } = await supabase
            .from('goals')
            .insert([{ ...goalData, user_id: userId }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async updateGoal(goalId, updates) {
        const { data, error } = await supabase
            .from('goals')
            .update(updates)
            .eq('id', goalId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async deleteGoal(goalId) {
        const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', goalId);
        
        if (error) throw error;
    }
}

// **NUTRITION MANAGEMENT**
class SupabaseNutritionService {
    static async getUserNutritionLogs(userId, date = null) {
        let query = supabase
            .from('nutrition_logs')
            .select('*')
            .eq('user_id', userId);
        
        if (date) {
            query = query.eq('log_date', date);
        }
        
        const { data, error } = await query.order('logged_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    }
    
    static async addNutritionLog(userId, logData) {
        const { data, error } = await supabase
            .from('nutrition_logs')
            .insert([{ 
                ...logData, 
                user_id: userId,
                log_date: logData.log_date || new Date().toISOString().split('T')[0]
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async deleteNutritionLog(logId) {
        const { error } = await supabase
            .from('nutrition_logs')
            .delete()
            .eq('id', logId);
        
        if (error) throw error;
    }
}

// **MEDIA MANAGEMENT**
class SupabaseMediaService {
    static async uploadMedia(userId, file, mediaType) {
        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/${mediaType}/${Date.now()}.${fileExt}`;
        
        // Upload file to Supabase Storage
        const { data: storageData, error: storageError } = await supabase.storage
            .from('user-media')
            .upload(filePath, file);
        
        if (storageError) throw storageError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('user-media')
            .getPublicUrl(filePath);
        
        // Save media record to database
        const { data, error } = await supabase
            .from('media_uploads')
            .insert([{
                user_id: userId,
                name: file.name,
                file_type: file.type,
                file_size: file.size,
                media_type: mediaType,
                storage_path: filePath,
                public_url: publicUrl
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async getUserMedia(userId) {
        const { data, error } = await supabase
            .from('media_uploads')
            .select('*')
            .eq('user_id', userId)
            .order('uploaded_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    }
    
    static async getAllMedia() {
        const { data, error } = await supabase
            .from('media_uploads')
            .select(`
                *,
                users(name, email)
            `)
            .order('uploaded_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    }
    
    static async deleteMedia(mediaId) {
        // Get media record to find storage path
        const { data: media, error: fetchError } = await supabase
            .from('media_uploads')
            .select('storage_path')
            .eq('id', mediaId)
            .single();
        
        if (fetchError) throw fetchError;
        
        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('user-media')
            .remove([media.storage_path]);
        
        if (storageError) console.warn('Storage deletion failed:', storageError);
        
        // Delete from database
        const { error } = await supabase
            .from('media_uploads')
            .delete()
            .eq('id', mediaId);
        
        if (error) throw error;
    }
    
    static async flagMedia(mediaId, flagged = true) {
        const { data, error } = await supabase
            .from('media_uploads')
            .update({ 
                flagged,
                flagged_at: flagged ? new Date().toISOString() : null
            })
            .eq('id', mediaId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
}

// **ACHIEVEMENTS MANAGEMENT**
class SupabaseAchievementsService {
    static async getUserAchievements(userId) {
        const { data, error } = await supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', userId);
        
        if (error) throw error;
        return data || [];
    }
    
    static async unlockAchievement(userId, achievementId, progress, target) {
        const { data, error } = await supabase
            .from('user_achievements')
            .upsert([{
                user_id: userId,
                achievement_id: achievementId,
                unlocked: true,
                progress,
                target,
                unlocked_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
}

// **SOCIAL FEATURES**
class SupabaseSocialService {
    static async sendFriendInvite(fromUserId, email) {
        const inviteCode = Math.random().toString(36).substring(2, 15);
        
        const { data, error } = await supabase
            .from('friend_invites')
            .insert([{
                from_user_id: fromUserId,
                email,
                invite_code: inviteCode
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async acceptFriendInvite(inviteCode, acceptingUserId) {
        // Get invite
        const { data: invite, error: inviteError } = await supabase
            .from('friend_invites')
            .select('*')
            .eq('invite_code', inviteCode)
            .eq('status', 'pending')
            .single();
        
        if (inviteError) throw inviteError;
        
        // Create friendship
        const { error: friendError } = await supabase
            .from('user_friends')
            .insert([
                { user_id: invite.from_user_id, friend_id: acceptingUserId },
                { user_id: acceptingUserId, friend_id: invite.from_user_id }
            ]);
        
        if (friendError) throw friendError;
        
        // Mark invite as accepted
        const { error: updateError } = await supabase
            .from('friend_invites')
            .update({ status: 'accepted', accepted_at: new Date().toISOString() })
            .eq('id', invite.id);
        
        if (updateError) throw updateError;
    }
    
    static async getUserFriends(userId) {
        const { data, error } = await supabase
            .from('user_friends')
            .select(`
                friend_id,
                users!friend_id(id, name, email, points, last_active, is_online)
            `)
            .eq('user_id', userId)
            .eq('status', 'accepted');
        
        if (error) throw error;
        return data?.map(f => f.users) || [];
    }
}

// **ADMIN SERVICE - Enhanced admin functions for dashboard**
class SupabaseAdminService {
    // Get all platform users with statistics
    static async getAllUsersWithStats() {
        try {
            const { data: users, error } = await supabase
                .from('users')
                .select(`
                    *,
                    habits(count),
                    media_uploads(count),
                    goals(count)
                `);
            
            if (error) throw error;
            
            // Calculate additional stats for each user
            const usersWithStats = await Promise.all(users.map(async (user) => {
                // Calculate total points
                const points = await calculateUserPoints(user.id);
                
                // Check online status (active within last 5 minutes)
                const lastActive = user.last_active ? new Date(user.last_active) : null;
                const isOnline = lastActive && (new Date() - lastActive) < 5 * 60 * 1000;
                
                return {
                    ...user,
                    points,
                    online: isOnline,
                    habits_count: user.habits?.[0]?.count || 0,
                    media_count: user.media?.[0]?.count || 0,
                    goals_count: user.goals?.[0]?.count || 0,
                    joined: user.created_at
                };
            }));
            
            return usersWithStats;
        } catch (error) {
            console.error('❌ Error fetching users with stats:', error);
            return [];
        }
    }
    
    // Get all platform media with user info
    static async getAllMediaWithUserInfo() {
        try {
            const { data, error } = await supabase
                .from('media_uploads')
                .select(`
                    *,
                    users(id, name, email)
                `)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error fetching all media:', error);
            return [];
        }
    }
    
    // Get platform statistics
    static async getPlatformStats() {
        try {
            // Get user counts
            const { count: totalUsers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });
            
            // Get online users (active within last 5 minutes)
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const { count: onlineUsers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .gte('last_active', fiveMinutesAgo);
            
            // Get media count
            const { count: totalMedia } = await supabase
                .from('media_uploads')
                .select('*', { count: 'exact', head: true });
            
            // Get flagged content count (assuming we have a flagged field)
            const { count: flaggedContent } = await supabase
                .from('media_uploads')
                .select('*', { count: 'exact', head: true })
                .eq('flagged', true);
            
            return {
                totalUsers: totalUsers || 0,
                onlineUsers: onlineUsers || 0,
                totalMedia: totalMedia || 0,
                flaggedContent: flaggedContent || 0
            };
        } catch (error) {
            console.error('❌ Error fetching platform stats:', error);
            return {
                totalUsers: 0,
                onlineUsers: 0,
                totalMedia: 0,
                flaggedContent: 0
            };
        }
    }
    
    // Delete user with all related data
    static async deleteUserComplete(userId) {
        try {
            // Delete user (CASCADE will handle related data)
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId);
            
            if (error) throw error;
            
            console.log('✅ User and all related data deleted from Supabase:', userId);
            return true;
        } catch (error) {
            console.error('❌ Error deleting user:', error);
            throw error;
        }
    }
    
    // Suspend/unsuspend user
    static async suspendUser(userId, suspended = true) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ suspended: suspended })
                .eq('id', userId)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error suspending user:', error);
            throw error;
        }
    }
    
    // Update user role
    static async updateUserRole(userId, role) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ role: role })
                .eq('id', userId)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error updating user role:', error);
            throw error;
        }
    }
    
    // Flag/unflag media content
    static async flagMedia(mediaId, flagged = true, reason = null) {
        try {
            const updates = { flagged: flagged };
            if (reason) updates.flag_reason = reason;
            
            const { data, error } = await supabase
                .from('media_uploads')
                .update(updates)
                .eq('id', mediaId)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error flagging media:', error);
            throw error;
        }
    }

    // **SUPABASE STORAGE FUNCTIONS FOR MEDIA**
    static async uploadMediaFile(file, userId, mediaType) {
        try {
            console.log('☁️ Uploading file to Supabase Storage:', file.name);
            
            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            
            // Upload file to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('media-uploads')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('❌ Storage upload error:', uploadError);
                throw uploadError;
            }

            console.log('✅ File uploaded to storage:', uploadData.path);

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('media-uploads')
                .getPublicUrl(fileName);

            // Save media record to database
            const mediaRecord = {
                id: 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                user_id: userId,
                filename: file.name,
                storage_path: fileName,
                public_url: publicUrl,
                media_type: mediaType,
                file_size: file.size,
                file_type: file.type,
                created_at: new Date().toISOString(),
                flagged: false
            };

            const { data: dbData, error: dbError } = await supabase
                .from('media_uploads')
                .insert([mediaRecord])
                .select()
                .single();

            if (dbError) {
                console.error('❌ Database insert error:', dbError);
                // Clean up uploaded file if database insert fails
                await supabase.storage.from('media-uploads').remove([fileName]);
                throw dbError;
            }

            console.log('✅ Media record saved to database:', dbData.id);

            return {
                ...dbData,
                url: publicUrl // For compatibility with existing code
            };

        } catch (error) {
            console.error('❌ Error uploading media to cloud:', error);
            throw error;
        }
    }

    static async getUserMedia(userId) {
        try {
            const { data, error } = await supabase
                .from('media_uploads')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Add url field for compatibility with existing code
            return data.map(item => ({
                ...item,
                url: item.public_url,
                type: item.media_type,
                name: item.filename,
                uploaded_at: item.created_at,
                size: item.file_size,
                file_type: item.file_type
            }));

        } catch (error) {
            console.error('❌ Error fetching user media:', error);
            throw error;
        }
    }

    static async deleteMediaFile(mediaId, userId) {
        try {
            // First get the media record to know the storage path
            const { data: mediaRecord, error: fetchError } = await supabase
                .from('media_uploads')
                .select('storage_path, user_id')
                .eq('id', mediaId)
                .single();

            if (fetchError) throw fetchError;

            // Security check: only allow deletion by owner or admin
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const isAdmin = currentUser.email === 'iamhollywoodpro@protonmail.com';
            const isOwner = mediaRecord.user_id === userId;

            if (!isAdmin && !isOwner) {
                throw new Error('Unauthorized: Cannot delete this media');
            }

            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('media-uploads')
                .remove([mediaRecord.storage_path]);

            if (storageError) {
                console.warn('⚠️ Storage deletion warning:', storageError);
                // Continue with database deletion even if storage deletion fails
            }

            // Delete from database
            const { error: dbError } = await supabase
                .from('media_uploads')
                .delete()
                .eq('id', mediaId);

            if (dbError) throw dbError;

            console.log('✅ Media deleted from cloud:', mediaId);
            return true;

        } catch (error) {
            console.error('❌ Error deleting media from cloud:', error);
            throw error;
        }
    }
    
    // **ADMIN FUNCTIONS FOR MANAGING ALL USER MEDIA**
    static async getAllUserMediaForAdmin() {
        try {
            const { data, error } = await supabase
                .from('media_uploads')
                .select(`
                    *,
                    users(id, name, email)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(item => ({
                ...item,
                url: item.public_url,
                type: item.media_type,
                name: item.filename,
                uploaded_at: item.created_at,
                size: item.file_size,
                file_type: item.file_type,
                user: item.users
            }));

        } catch (error) {
            console.error('❌ Error fetching all user media for admin:', error);
            throw error;
        }
    }

    static async adminDeleteUserMedia(mediaId) {
        try {
            // Admin can delete any media - get the record first
            const { data: mediaRecord, error: fetchError } = await supabase
                .from('media_uploads')
                .select('storage_path, user_id, filename, users(name, email)')
                .eq('id', mediaId)
                .single();

            if (fetchError) throw fetchError;

            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('media-uploads')
                .remove([mediaRecord.storage_path]);

            if (storageError) {
                console.warn('⚠️ Storage deletion warning:', storageError);
            }

            // Delete from database
            const { error: dbError } = await supabase
                .from('media_uploads')
                .delete()
                .eq('id', mediaId);

            if (dbError) throw dbError;

            console.log('✅ Admin deleted media:', mediaRecord.filename, 'from user:', mediaRecord.users.email);
            return {
                success: true,
                deletedFile: mediaRecord.filename,
                fromUser: mediaRecord.users.email
            };

        } catch (error) {
            console.error('❌ Admin error deleting media:', error);
            throw error;
        }
    }

    static async getMediaStorageStats() {
        try {
            // Get storage usage statistics
            const { data, error } = await supabase
                .from('media_uploads')
                .select('file_size, user_id, users(name, email)');

            if (error) throw error;

            const stats = {
                totalFiles: data.length,
                totalSize: data.reduce((sum, item) => sum + (item.file_size || 0), 0),
                userStats: {}
            };

            // Calculate per-user statistics
            data.forEach(item => {
                const userId = item.user_id;
                if (!stats.userStats[userId]) {
                    stats.userStats[userId] = {
                        user: item.users,
                        fileCount: 0,
                        totalSize: 0
                    };
                }
                stats.userStats[userId].fileCount++;
                stats.userStats[userId].totalSize += item.file_size || 0;
            });

            return stats;

        } catch (error) {
            console.error('❌ Error getting storage stats:', error);
            throw error;
        }
    }

    // Get recent user activity
    static async getRecentActivity(limit = 50) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, name, email, last_active, created_at')
                .order('last_active', { ascending: false, nullsFirst: false })
                .limit(limit);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('❌ Error fetching recent activity:', error);
            return [];
        }
    }
    
    // Export user data
    static async exportUserData(userId) {
        try {
            // Get user with all related data
            const { data: user, error: userError } = await supabase
                .from('users')
                .select(`
                    *,
                    habits(*),
                    goals(*),
                    media(*),
                    nutrition_logs(*),
                    achievements(*)
                `)
                .eq('id', userId)
                .single();
            
            if (userError) throw userError;
            
            // Format data for export
            const exportData = {
                user_info: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    points: user.points,
                    created_at: user.created_at,
                    last_login: user.last_login
                },
                habits: user.habits || [],
                goals: user.goals || [],
                media: user.media || [],
                nutrition_logs: user.nutrition_logs || [],
                achievements: user.achievements || [],
                export_date: new Date().toISOString()
            };
            
            return exportData;
        } catch (error) {
            console.error('❌ Error exporting user data:', error);
            throw error;
        }
    }
    
    // Get analytics data for charts
    static async getAnalyticsData() {
        try {
            // Get user registrations by date (last 30 days)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            
            const { data: userGrowth, error: userGrowthError } = await supabase
                .from('users')
                .select('created_at')
                .gte('created_at', thirtyDaysAgo)
                .order('created_at');
            
            // Get daily active users (last 7 days)
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            
            const { data: dailyActivity, error: activityError } = await supabase
                .from('users')
                .select('last_active')
                .gte('last_active', sevenDaysAgo)
                .order('last_active');
            
            // Get content stats
            const { data: mediaStats, error: mediaError } = await supabase
                .from('media_uploads')
                .select('media_type, created_at')
                .order('created_at');
            
            // Get user engagement stats (habits, goals, media per user)
            const { data: engagementStats, error: engagementError } = await supabase
                .from('users')
                .select(`
                    id,
                    habits(count),
                    goals(count),
                    media_uploads(count)
                `);
            
            if (userGrowthError || activityError || mediaError || engagementError) {
                throw userGrowthError || activityError || mediaError || engagementError;
            }
            
            return {
                userGrowth: userGrowth || [],
                dailyActivity: dailyActivity || [],
                mediaStats: mediaStats || [],
                engagementStats: engagementStats || []
            };
        } catch (error) {
            console.error('❌ Error fetching analytics data:', error);
            return {
                userGrowth: [],
                dailyActivity: [],
                mediaStats: [],
                engagementStats: []
            };
        }
    }
}

// **POINTS CALCULATION**
async function calculateUserPoints(userId) {
    const { data, error } = await supabase
        .rpc('calculate_user_points', { user_uuid: userId });
    
    if (error) {
        console.warn('Points calculation error:', error);
        return 0;
    }
    
    return data || 0;
}

// Export services
window.SupabaseServices = {
    initialize: initializeSupabase,
    users: SupabaseUserService,
    habits: SupabaseHabitsService,
    goals: SupabaseGoalsService,
    nutrition: SupabaseNutritionService,
    media: SupabaseMediaService,
    achievements: SupabaseAchievementsService,
    social: SupabaseSocialService,
    admin: SupabaseAdminService,  // ✅ NEW: Admin service for enhanced dashboard
    calculatePoints: calculateUserPoints
};

console.log('✅ Supabase services loaded');

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.supabase && !window.supabase.createClient) {
                // Supabase CDN object exists, initialize client
                initializeSupabase();
            }
        }, 500);
    });
} else {
    // DOM already loaded
    setTimeout(() => {
        if (window.supabase && window.supabase.createClient && !supabase) {
            initializeSupabase();
        }
    }, 500);
}