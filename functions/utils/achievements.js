// Achievement tracking and notification utilities
export async function checkAndAwardAchievements(userId, actionType, actionData, env) {
    try {
        const newAchievements = [];
        
        // Get user stats
        const userStats = await getUserStats(userId, env);
        
        // Get all achievements user hasn't earned yet
        const unearned = await env.DB.prepare(`
            SELECT a.* FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
            WHERE ua.id IS NULL AND (a.is_recurring = 0 OR a.is_recurring IS NULL)
        `).bind(userId).all();
        
        const unearnedAchievements = unearned.results || [];
        
        // Check video and nutrition achievements first
        const videoAchievements = await checkVideoAchievements(env.DB, userId);
        const nutritionAchievements = await checkNutritionAchievements(env.DB, userId);
        
        newAchievements.push(...videoAchievements, ...nutritionAchievements);

        // Check each unearned achievement
        for (const achievement of unearnedAchievements) {
            let shouldUnlock = false;
            
            switch (achievement.requirement_type) {
                case 'account_created':
                    shouldUnlock = true;
                    break;
                    
                case 'habits_created':
                    shouldUnlock = userStats.habits_created >= achievement.requirement_value;
                    break;
                    
                case 'total_completions':
                    shouldUnlock = userStats.total_completions >= achievement.requirement_value;
                    break;
                    
                case 'photos_uploaded':
                    shouldUnlock = userStats.photos_uploaded >= achievement.requirement_value;
                    break;
                    
                case 'videos_uploaded':
                    shouldUnlock = userStats.videos_uploaded >= achievement.requirement_value;
                    break;
                    
                case 'total_media':
                case 'media_uploads':
                    shouldUnlock = userStats.total_media >= achievement.requirement_value;
                    break;
                    
                case 'weight_logs':
                    shouldUnlock = userStats.weight_logs >= achievement.requirement_value;
                    break;
                    
                case 'nutrition_logs':
                    shouldUnlock = userStats.nutrition_logs >= achievement.requirement_value;
                    break;
                    
                case 'before_after_pairs':
                    shouldUnlock = userStats.before_after_pairs >= achievement.requirement_value;
                    break;
                    
                case 'total_points':
                    shouldUnlock = userStats.total_points >= achievement.requirement_value;
                    break;
                    
                case 'habit_streak':
                    // TODO: Implement streak calculation
                    shouldUnlock = false;
                    break;
                    
                case 'weekly_before_after':
                    // Check if user uploaded both before and after photos this week
                    if (actionType === 'media_upload') {
                        shouldUnlock = await checkWeeklyBeforeAfter(userId, env);
                    }
                    break;
                    
                case 'morning_completions':
                    // Check if completion was before 10 AM
                    if (actionType === 'habit_completion' && actionData?.time) {
                        const hour = new Date(actionData.time).getHours();
                        if (hour < 10) {
                            const morningCount = await getMorningCompletions(userId, env);
                            shouldUnlock = morningCount >= achievement.requirement_value;
                        }
                    }
                    break;
                    
                case 'weekend_streaks':
                    if (actionType === 'habit_completion') {
                        shouldUnlock = await checkWeekendStreaks(userId, achievement.requirement_value, env);
                    }
                    break;
                    
                case 'habit_categories':
                    shouldUnlock = await checkHabitVariety(userId, achievement.requirement_value, env);
                    break;
                    
                // Social & Community Achievement Types
                case 'friends_count':
                    shouldUnlock = await checkFriendsCount(userId, achievement.requirement_value, env);
                    break;
                    
                case 'weekly_rank':
                    shouldUnlock = await checkWeeklyRank(userId, achievement.requirement_value, env);
                    break;
                    
                case 'top_5_weeks':
                    shouldUnlock = await checkConsecutiveTopRanking(userId, achievement.requirement_value, env);
                    break;
                    
                // Analytics & Data Achievement Types
                case 'stats_views':
                    shouldUnlock = await checkStatsViews(userId, achievement.requirement_value, env);
                    break;
                    
                case 'progress_views':
                    shouldUnlock = await checkProgressViews(userId, achievement.requirement_value, env);
                    break;
                    
                case 'leaderboard_views':
                    shouldUnlock = await checkLeaderboardViews(userId, achievement.requirement_value, env);
                    break;
                    
                // Enhanced Habit & Routine Achievement Types
                case 'routine_consistency':
                    shouldUnlock = await checkRoutineConsistency(userId, achievement.requirement_value, env);
                    break;
                    
                case 'morning_habit_streak':
                    shouldUnlock = await checkMorningHabitStreak(userId, achievement.requirement_value, env);
                    break;
                    
                case 'evening_habit_streak':
                    shouldUnlock = await checkEveningHabitStreak(userId, achievement.requirement_value, env);
                    break;
                    
                case 'weekend_consistency':
                    shouldUnlock = await checkWeekendConsistency(userId, achievement.requirement_value, env);
                    break;
                    
                // Enhanced Progress Tracking
                case 'monthly_video_comparisons':
                    shouldUnlock = await checkMonthlyVideoComparisons(userId, achievement.requirement_value, env);
                    break;
                    
                case 'described_uploads':
                    shouldUnlock = await checkDescribedUploads(userId, achievement.requirement_value, env);
                    break;
                    
                case 'weekly_photo_streak':
                    shouldUnlock = await checkWeeklyPhotoStreak(userId, achievement.requirement_value, env);
                    break;
                    
                case 'weekly_video_streak':
                    shouldUnlock = await checkWeeklyVideoStreak(userId, achievement.requirement_value, env);
                    break;
                    
                case 'progress_day_streak':
                    shouldUnlock = await checkProgressDayStreak(userId, achievement.requirement_value, env);
                    break;
                    
                // Advanced Nutrition Achievement Types
                case 'macro_perfect_streak':
                    shouldUnlock = await checkMacroPerfectStreak(userId, achievement.requirement_value, env);
                    break;
                    
                case 'hydration_streak':
                    shouldUnlock = await checkHydrationStreak(userId, achievement.requirement_value, env);
                    break;
                    
                case 'custom_recipes':
                    shouldUnlock = await checkCustomRecipes(userId, achievement.requirement_value, env);
                    break;
                    
                case 'nutrition_tracking_streak':
                    shouldUnlock = await checkNutritionTrackingStreak(userId, achievement.requirement_value, env);
                    break;
                    
                case 'balanced_macro_streak':
                    shouldUnlock = await checkBalancedMacroStreak(userId, achievement.requirement_value, env);
                    break;
                    
                // Challenge & Goals Achievement Types
                case 'daily_challenges_completed':
                    shouldUnlock = await checkDailyChallengesCompleted(userId, achievement.requirement_value, env);
                    break;
                    
                case 'perfect_challenge_week':
                    shouldUnlock = await checkPerfectChallengeWeek(userId, achievement.requirement_value, env);
                    break;
                    
                case 'weekly_goals_completed':
                    shouldUnlock = await checkWeeklyGoalsCompleted(userId, achievement.requirement_value, env);
                    break;
                    
                case 'simultaneous_streaks':
                    shouldUnlock = await checkSimultaneousStreaks(userId, achievement.requirement_value, env);
                    break;
                    
                case 'streak_comeback':
                    shouldUnlock = await checkStreakComeback(userId, achievement.requirement_value, env);
                    break;
                    
                // Enhanced Consistency Achievement Types
                case 'login_streak':
                    shouldUnlock = await checkLoginStreak(userId, achievement.requirement_value, env);
                    break;
                    
                case 'single_habit_streak':
                    shouldUnlock = await checkSingleHabitStreak(userId, achievement.requirement_value, env);
                    break;
                    
                case 'multi_habit_streaks':
                    shouldUnlock = await checkMultiHabitStreaks(userId, achievement.requirement_value, env);
                    break;
                    
                case 'yearly_consistency':
                    shouldUnlock = await checkYearlyConsistency(userId, achievement.requirement_value, env);
                    break;
                    
                case 'perfect_consistency':
                    shouldUnlock = await checkPerfectConsistency(userId, achievement.requirement_value, env);
                    break;
                    
                // Enhanced Onboarding Achievement Types
                case 'feature_exploration':
                    shouldUnlock = await checkFeatureExploration(userId, achievement.requirement_value, env);
                    break;
                    
                case 'early_engagement':
                    shouldUnlock = await checkEarlyEngagement(userId, achievement.requirement_value, env);
                    break;
                    
                case 'early_invites':
                    shouldUnlock = await checkEarlyInvites(userId, achievement.requirement_value, env);
                    break;
                    
                case 'fast_achievements':
                    shouldUnlock = await checkFastAchievements(userId, achievement.requirement_value, env);
                    break;
                    
                case 'commitment_streak':
                    shouldUnlock = await checkCommitmentStreak(userId, achievement.requirement_value, env);
                    break;
                    
                // Combo & Streak Achievement Types
                case 'achievement_combo':
                    // These are handled in real-time by the frontend
                    shouldUnlock = false;
                    break;
                    
                case 'daily_achievement_count':
                    shouldUnlock = await checkDailyAchievementCount(userId, achievement.requirement_value, env);
                    break;
                    
                case 'category_mastery':
                    shouldUnlock = await checkCategoryMastery(userId, achievement.category, env);
                    break;
                    
                case 'daily_achievement_streak':
                    shouldUnlock = await checkDailyAchievementStreak(userId, achievement.requirement_value, env);
                    break;
                    
                case 'weekly_achievement_streak':
                    shouldUnlock = await checkWeeklyAchievementStreak(userId, achievement.requirement_value, env);
                    break;
                    
                case 'total_achievements':
                    shouldUnlock = await checkTotalAchievements(userId, achievement.requirement_value, env);
                    break;
                    
                case 'achievements_in_timeframe':
                    shouldUnlock = await checkAchievementsInTimeframe(userId, achievement.requirement_value, env);
                    break;
                    
                case 'seasonal_event':
                    shouldUnlock = await checkSeasonalEvent(userId, achievement.requirement_value, env);
                    break;
                    
                case 'monthly_challenge':
                    shouldUnlock = await checkMonthlyChallenge(userId, achievement.requirement_value, env);
                    break;
                    
                case 'consecutive_monthly':
                    shouldUnlock = await checkConsecutiveMonthly(userId, achievement.requirement_value, env);
                    break;
                    
                case 'achievement_rank':
                    shouldUnlock = await checkAchievementRank(userId, achievement.requirement_value, env);
                    break;
                    
                case 'achievement_leaderboard':
                    shouldUnlock = await checkAchievementLeaderboard(userId, achievement.requirement_value, env);
                    break;
                    
                case 'perfect_category':
                    shouldUnlock = await checkPerfectCategory(userId, achievement.requirement_value, env);
                    break;
                    
                case 'completionist':
                    shouldUnlock = await checkCompletionist(userId, achievement.requirement_value, env);
                    break;
                    
                // Media upload specific achievements
                case 'before_uploads':
                    if (actionType === 'media_upload' && actionData?.media_type === 'before') {
                        shouldUnlock = userStats.before_uploads >= achievement.requirement_value;
                    }
                    break;
                    
                case 'after_uploads':
                    if (actionType === 'media_upload' && actionData?.media_type === 'after') {
                        shouldUnlock = userStats.after_uploads >= achievement.requirement_value;
                    }
                    break;
                    
                case 'progress_uploads':
                    if (actionType === 'media_upload' && actionData?.media_type === 'progress') {
                        shouldUnlock = userStats.progress_uploads >= achievement.requirement_value;
                    }
                    break;
                    
                case 'before_after_pairs':
                    if (actionType === 'media_upload') {
                        shouldUnlock = userStats.before_after_pairs >= achievement.requirement_value;
                    }
                    break;
                    
                case 'weekly_upload_streak':
                    if (actionType === 'media_upload') {
                        shouldUnlock = await checkWeeklyUploadStreak(userId, achievement.requirement_value, env);
                    }
                    break;
                    
                // Nutrition specific achievements
                case 'first_nutrition_log':
                    if (actionType === 'nutrition_log') {
                        shouldUnlock = userStats.nutrition_logs >= achievement.requirement_value;
                    }
                    break;
                    
                case 'calorie_tracking_week':
                    if (actionType === 'nutrition_log') {
                        shouldUnlock = await checkCalorieTrackingWeek(userId, achievement.requirement_value, env);
                    }
                    break;
                    
                case 'water_tracking':
                    if (actionType === 'nutrition_log') {
                        shouldUnlock = await checkWaterTracking(userId, achievement.requirement_value, env);
                    }
                    break;
                    
                case 'fiber_tracking':
                    if (actionType === 'nutrition_log') {
                        shouldUnlock = await checkFiberTracking(userId, achievement.requirement_value, env);
                    }
                    break;
                    
                case 'carb_tracking_streak':
                    if (actionType === 'nutrition_log') {
                        shouldUnlock = await checkCarbTrackingStreak(userId, achievement.requirement_value, env);
                    }
                    break;
                    
                case 'fat_balance_streak':
                    if (actionType === 'nutrition_log') {
                        shouldUnlock = await checkFatBalanceStreak(userId, achievement.requirement_value, env);
                    }
                    break;
                    
                case 'sugar_tracking':
                    if (actionType === 'nutrition_log') {
                        shouldUnlock = await checkSugarTracking(userId, achievement.requirement_value, env);
                    }
                    break;
                    
                case 'nutrition_tracking_month':
                    if (actionType === 'nutrition_log') {
                        shouldUnlock = await checkNutritionTrackingMonth(userId, achievement.requirement_value, env);
                    }
                    break;
                    
                case 'macro_perfection_count':
                    if (actionType === 'nutrition_log') {
                        shouldUnlock = await checkMacroPerfectionCount(userId, achievement.requirement_value, env);
                    }
                    break;
                    
                case 'nutrition_super_streak':
                    if (actionType === 'nutrition_log') {
                        shouldUnlock = await checkNutritionSuperStreak(userId, achievement.requirement_value, env);
                    }
                    break;
                    
                // Challenge specific achievements
                case 'nutrition_challenges':
                    if (actionType === 'challenge_completion') {
                        shouldUnlock = await checkNutritionChallenges(userId, achievement.requirement_value, env);
                    }
                    break;
                    
                // Habit creation achievements
                case 'habits_created':
                    if (actionType === 'habit_creation') {
                        shouldUnlock = userStats.habits_created >= achievement.requirement_value;
                    }
                    break;
            }
            
            if (shouldUnlock) {
                await unlockAchievement(userId, achievement.id, env);
                newAchievements.push(achievement);
            }
        }
        
        // Check recurring achievements
        await checkRecurringAchievements(userId, actionType, actionData, env);
        
        return newAchievements;
        
    } catch (error) {
        console.error('Achievement check error:', error);
        return [];
    }
}

async function getUserStats(userId, env) {
    const result = await env.DB.prepare(`
        SELECT 
            u.points as total_points,
            u.created_at as user_created_at,
            (SELECT COUNT(*) FROM habits WHERE user_id = ?) as habits_created,
            (SELECT COUNT(*) FROM habit_completions WHERE user_id = ?) as total_completions,
            (SELECT COUNT(*) FROM media_uploads WHERE user_id = ? AND file_type LIKE 'image/%') as photos_uploaded,
            (SELECT COUNT(*) FROM media_uploads WHERE user_id = ? AND file_type LIKE 'video/%') as videos_uploaded,
            (SELECT COUNT(*) FROM media_uploads WHERE user_id = ?) as total_media,
            (SELECT COUNT(*) FROM media_uploads WHERE user_id = ? AND media_type = 'before') as before_uploads,
            (SELECT COUNT(*) FROM media_uploads WHERE user_id = ? AND media_type = 'after') as after_uploads,
            (SELECT COUNT(*) FROM media_uploads WHERE user_id = ? AND media_type = 'progress') as progress_uploads,
            (SELECT COUNT(*) FROM user_nutrition_logs WHERE user_id = ?) as nutrition_logs,
            (SELECT COUNT(*) FROM user_weight_logs WHERE user_id = ?) as weight_logs
        FROM users u
        WHERE u.id = ?
    `).bind(userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId).first();
    
    // Calculate before/after pairs
    const pairs = await env.DB.prepare(`
        SELECT COUNT(*) as pair_count
        FROM media_uploads m1
        WHERE m1.user_id = ? 
        AND m1.media_type = 'before'
        AND EXISTS (
            SELECT 1 FROM media_uploads m2
            WHERE m2.user_id = m1.user_id
            AND m2.media_type = 'after'
            AND ABS(julianday(m2.uploaded_at) - julianday(m1.uploaded_at)) <= 7
            AND m2.uploaded_at > m1.uploaded_at
        )
    `).bind(userId).first();
    
    return {
        total_points: result?.total_points || 0,
        habits_created: result?.habits_created || 0,
        total_completions: result?.total_completions || 0,
        photos_uploaded: result?.photos_uploaded || 0,
        videos_uploaded: result?.videos_uploaded || 0,
        total_media: result?.total_media || 0,
        before_uploads: result?.before_uploads || 0,
        after_uploads: result?.after_uploads || 0,
        progress_uploads: result?.progress_uploads || 0,
        nutrition_logs: result?.nutrition_logs || 0,
        weight_logs: result?.weight_logs || 0,
        before_after_pairs: pairs?.pair_count || 0
    };
}

async function unlockAchievement(userId, achievementId, env) {
    try {
        const { v4: uuidv4 } = await import('uuid');
        const userAchievementId = uuidv4();
        
        // Award the achievement
        await env.DB.prepare(`
            INSERT INTO user_achievements (id, user_id, achievement_id)
            VALUES (?, ?, ?)
        `).bind(userAchievementId, userId, achievementId).run();
        
        // Get achievement details for points
        const achievement = await env.DB.prepare(
            'SELECT points FROM achievements WHERE id = ?'
        ).bind(achievementId).first();
        
        // Award points if the achievement has points
        if (achievement && achievement.points > 0) {
            await env.DB.prepare('UPDATE users SET points = points + ? WHERE id = ?')
                .bind(achievement.points, userId).run();
        }
        
        return true;
    } catch (error) {
        console.error('Unlock achievement error:', error);
        return false;
    }
}

async function checkWeeklyBeforeAfter(userId, env) {
    // Get this week's date range (Sunday to Saturday)
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    // Check for photos uploaded this week
    const weeklyPhotos = await env.DB.prepare(`
        SELECT uploaded_at FROM media_uploads 
        WHERE user_id = ? 
        AND file_type LIKE 'image/%' 
        AND uploaded_at >= ? 
        AND uploaded_at <= ?
        ORDER BY uploaded_at
    `).bind(userId, weekStart.toISOString(), weekEnd.toISOString()).all();
    
    const photos = weeklyPhotos.results || [];
    
    // Check if there are photos at the beginning and end of the week
    if (photos.length >= 2) {
        const firstPhoto = new Date(photos[0].uploaded_at);
        const lastPhoto = new Date(photos[photos.length - 1].uploaded_at);
        
        // Check if first photo is in first 3 days and last photo is in last 3 days of week
        const daysDiff = Math.floor((lastPhoto - firstPhoto) / (1000 * 60 * 60 * 24));
        return daysDiff >= 3; // At least 3 days apart for before/after
    }
    
    return false;
}

async function getMorningCompletions(userId, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as count FROM habit_completions 
        WHERE user_id = ? 
        AND strftime('%H', completed_at) < '10'
    `).bind(userId).first();
    
    return result?.count || 0;
}

async function checkWeekendStreaks(userId, targetStreaks, env) {
    // This is a complex calculation - for now return false
    // TODO: Implement weekend streak calculation
    return false;
}

async function checkHabitVariety(userId, targetCategories, env) {
    // Count distinct categories from habit names (based on emojis/keywords)
    const habits = await env.DB.prepare(`
        SELECT name FROM habits WHERE user_id = ?
    `).bind(userId).all();
    
    const habitList = habits.results || [];
    const categories = new Set();
    
    habitList.forEach(habit => {
        const name = habit.name.toLowerCase();
        if (name.includes('💧') || name.includes('water')) categories.add('hydration');
        if (name.includes('🏃') || name.includes('cardio') || name.includes('run')) categories.add('cardio');
        if (name.includes('💪') || name.includes('strength') || name.includes('gym')) categories.add('strength');
        if (name.includes('🍎') || name.includes('nutrition') || name.includes('eat')) categories.add('nutrition');
        if (name.includes('😴') || name.includes('sleep') || name.includes('rest')) categories.add('wellness');
        if (name.includes('📚') || name.includes('read') || name.includes('study')) categories.add('learning');
        if (name.includes('🧘') || name.includes('meditat') || name.includes('mindful')) categories.add('mindfulness');
    });
    
    return categories.size >= targetCategories;
}

async function checkRecurringAchievements(userId, actionType, actionData, env) {
    // TODO: Implement recurring achievement tracking
    // This would check weekly/monthly achievements and reset them as needed
    return [];
}

// Create notification reminders for user
// Video Achievement Tracking
export async function checkVideoAchievements(db, userId) {
    const unlockedAchievements = [];
    
    try {
        // Get video upload stats
        const videoStats = await db.prepare(`
            SELECT 
                COUNT(*) as total_videos,
                COUNT(CASE WHEN video_type = 'progress' THEN 1 END) as progress_videos,
                COUNT(CASE WHEN is_before_after = 1 THEN 1 END) as before_after_videos,
                COUNT(CASE WHEN upload_date >= date('now', 'start of month') THEN 1 END) as this_month_videos,
                COUNT(CASE WHEN upload_date >= date('now', '-7 days') THEN 1 END) as this_week_videos
            FROM user_video_uploads
            WHERE user_id = ?
        `).bind(userId).first();

        // Check weekly video consistency (4 weeks)
        const weeklyConsistency = await db.prepare(`
            SELECT COUNT(DISTINCT week_number) as consistent_weeks
            FROM user_video_uploads
            WHERE user_id = ? AND upload_date >= date('now', '-28 days')
        `).bind(userId).first();

        // Check achievements
        const achievements = [
            { id: 'video_first_upload', check: videoStats.total_videos >= 1 },
            { id: 'video_weekly_creator', check: weeklyConsistency.consistent_weeks >= 4 },
            { id: 'video_monthly_diary', check: videoStats.this_month_videos >= 7 },
            { id: 'video_master', check: videoStats.total_videos >= 30 },
            { id: 'before_after_video', check: videoStats.before_after_videos >= 1 },
            { id: 'video_consistency_pro', check: await checkVideoConsistency(db, userId, 12) }
        ];

        for (const achievement of achievements) {
            if (achievement.check) {
                const unlocked = await unlockAchievementIfNotEarned(db, userId, achievement.id);
                if (unlocked) unlockedAchievements.push(unlocked);
            }
        }

    } catch (error) {
        console.error('Video achievement check error:', error);
    }
    
    return unlockedAchievements;
}

// Nutrition Achievement Tracking
export async function checkNutritionAchievements(db, userId) {
    const unlockedAchievements = [];
    
    try {
        // Get nutrition logging stats
        const nutritionStats = await db.prepare(`
            SELECT COUNT(*) as total_logs FROM user_nutrition_logs WHERE user_id = ?
        `).bind(userId).first();

        // Get daily nutrition streak stats
        const streakStats = await getNutritionStreakStats(db, userId);
        
        // Get unique foods count
        const uniqueFoods = await db.prepare(`
            SELECT COUNT(DISTINCT food_name) as unique_count
            FROM user_nutrition_logs WHERE user_id = ?
        `).bind(userId).first();

        // Get custom recipes count
        const customRecipes = await db.prepare(`
            SELECT COUNT(DISTINCT food_name) as recipe_count
            FROM user_nutrition_logs WHERE user_id = ? AND is_custom_recipe = 1
        `).bind(userId).first();

        // Check achievements
        const achievements = [
            { id: 'nutrition_first_log', check: nutritionStats.total_logs >= 1 },
            { id: 'protein_champion', check: streakStats.protein_streak >= 7 },
            { id: 'carb_counter', check: streakStats.tracking_streak >= 14 },
            { id: 'fat_balance_master', check: streakStats.macro_balance_streak >= 7 },
            { id: 'macro_perfect', check: streakStats.macro_perfect_days >= 3 },
            { id: 'nutrition_ninja', check: streakStats.tracking_streak >= 30 },
            { id: 'calorie_conscious', check: streakStats.calorie_streak >= 7 },
            { id: 'target_hitter', check: streakStats.calorie_streak >= 5 },
            { id: 'sugar_tracker', check: streakStats.tracking_streak >= 14 },
            { id: 'hydration_hero', check: streakStats.water_streak >= 10 },
            { id: 'fiber_focus', check: streakStats.tracking_streak >= 7 },
            { id: 'macro_mastery', check: streakStats.macro_perfect_days >= 10 },
            { id: 'nutrition_consistency', check: streakStats.tracking_streak >= 100 },
            { id: 'meal_variety', check: uniqueFoods.unique_count >= 50 },
            { id: 'recipe_creator', check: customRecipes.recipe_count >= 10 }
        ];

        for (const achievement of achievements) {
            if (achievement.check) {
                const unlocked = await unlockAchievementIfNotEarned(db, userId, achievement.id);
                if (unlocked) unlockedAchievements.push(unlocked);
            }
        }

    } catch (error) {
        console.error('Nutrition achievement check error:', error);
    }
    
    return unlockedAchievements;
}

// Helper functions
async function checkVideoConsistency(db, userId, weeks) {
    const result = await db.prepare(`
        SELECT COUNT(DISTINCT week_number) as consistent_weeks
        FROM user_video_uploads
        WHERE user_id = ? AND upload_date >= date('now', '-' || ? || ' days')
    `).bind(userId, weeks * 7).first();
    
    return result.consistent_weeks >= weeks;
}

async function getNutritionStreakStats(db, userId) {
    const recentDays = await db.prepare(`
        SELECT log_date, macro_balance_score, met_calorie_goal, met_protein_goal, 
               met_carbs_goal, met_fat_goal, total_water_ml
        FROM user_daily_nutrition
        WHERE user_id = ?
        ORDER BY log_date DESC
        LIMIT 100
    `).bind(userId).all();

    let trackingStreak = 0;
    let proteinStreak = 0;
    let calorieStreak = 0;
    let macroBalanceStreak = 0;
    let waterStreak = 0;
    let macroPerfectDays = 0;

    for (const day of recentDays.results || []) {
        if (day.macro_balance_score > 0) trackingStreak++;
        else break;

        if (day.met_protein_goal && proteinStreak === trackingStreak - 1) proteinStreak++;
        if (day.met_calorie_goal && calorieStreak === trackingStreak - 1) calorieStreak++;
        if (day.met_protein_goal && day.met_carbs_goal && day.met_fat_goal) {
            if (macroBalanceStreak === trackingStreak - 1) macroBalanceStreak++;
            macroPerfectDays++;
        }
        if (day.total_water_ml >= 2000 && waterStreak === trackingStreak - 1) waterStreak++;
    }

    return {
        tracking_streak: trackingStreak,
        protein_streak: proteinStreak,
        calorie_streak: calorieStreak,
        macro_balance_streak: macroBalanceStreak,
        water_streak: waterStreak,
        macro_perfect_days: macroPerfectDays
    };
}

async function unlockAchievementIfNotEarned(db, userId, achievementId) {
    // Check if user already has this achievement
    const existing = await db.prepare(`
        SELECT id FROM user_achievements 
        WHERE user_id = ? AND achievement_id = ?
    `).bind(userId, achievementId).first();

    if (existing) return null;

    // Get achievement details
    const achievement = await db.prepare(`
        SELECT * FROM achievements WHERE id = ?
    `).bind(achievementId).first();

    if (!achievement) return null;

    // Award the achievement
    const { v4: uuidv4 } = await import('uuid');
    const userAchievementId = uuidv4();
    
    await db.prepare(`
        INSERT INTO user_achievements (id, user_id, achievement_id, points_earned)
        VALUES (?, ?, ?, ?)
    `).bind(userAchievementId, userId, achievementId, achievement.points).run();

    // Update user points
    await db.prepare(`
        UPDATE users SET points = points + ? WHERE id = ?
    `).bind(achievement.points, userId).run();

    return achievement;
}

export async function createUserReminders(userId, env) {
    try {
        const { v4: uuidv4 } = await import('uuid');
        
        const reminders = [
            {
                id: uuidv4(),
                user_id: userId,
                reminder_type: 'weekly_photo',
                title: '📸 Weekly Before Photo',
                message: 'Time to take your weekly before photo! Document your starting point for this week.',
                trigger_day: 'sunday',
                trigger_time: '09:00'
            },
            {
                id: uuidv4(),
                user_id: userId,
                reminder_type: 'weekly_photo',
                title: '📸 Weekly After Photo',
                message: 'Great week! Time to take your weekly after photo and see your progress.',
                trigger_day: 'saturday',
                trigger_time: '18:00'
            },
            {
                id: uuidv4(),
                user_id: userId,
                reminder_type: 'habit',
                title: '💪 Daily Habit Check',
                message: 'Don\'t forget to complete your daily habits! You\'ve got this!',
                trigger_day: 'daily',
                trigger_time: '10:00'
            },
            {
                id: uuidv4(),
                user_id: userId,
                reminder_type: 'achievement',
                title: '🏆 Weekly Achievement Review',
                message: 'Check your achievements and see what you\'ve accomplished this week!',
                trigger_day: 'sunday',
                trigger_time: '20:00'
            }
        ];
        
        for (const reminder of reminders) {
            await env.DB.prepare(`
                INSERT INTO user_reminders 
                (id, user_id, reminder_type, title, message, trigger_day, trigger_time)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
                reminder.id,
                reminder.user_id,
                reminder.reminder_type,
                reminder.title,
                reminder.message,
                reminder.trigger_day,
                reminder.trigger_time
            ).run();
        }
        
        return reminders;
    } catch (error) {
        console.error('Create reminders error:', error);
        return [];
    }
}

// Enhanced Achievement Helper Functions

// Social & Community Helpers
async function checkFriendsCount(userId, requiredCount, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as friend_count 
        FROM friendships 
        WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'
    `).bind(userId, userId).first();
    return result.friend_count >= requiredCount;
}

async function checkWeeklyRank(userId, maxRank, env) {
    const weekStart = getWeekStart(new Date());
    const result = await env.DB.prepare(`
        SELECT COUNT(*) + 1 as rank
        FROM (
            SELECT u.id, SUM(hc.points) as weekly_points
            FROM users u
            LEFT JOIN habit_completions hc ON u.id = hc.user_id 
                AND date(hc.created_at) >= date(?)
            GROUP BY u.id
            HAVING weekly_points > (
                SELECT SUM(hc2.points) 
                FROM habit_completions hc2 
                WHERE hc2.user_id = ? AND date(hc2.created_at) >= date(?)
            )
        )
    `).bind(weekStart, userId, weekStart).first();
    return result.rank <= maxRank;
}

async function checkConsecutiveTopRanking(userId, requiredWeeks, env) {
    // Check if user has been in top 5 for consecutive weeks
    let consecutiveWeeks = 0;
    const currentDate = new Date();
    
    for (let i = 0; i < requiredWeeks + 5; i++) {
        const weekStart = new Date(currentDate.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
        const rank = await getUserWeeklyRank(userId, weekStart, env);
        
        if (rank <= 5) {
            consecutiveWeeks++;
            if (consecutiveWeeks >= requiredWeeks) return true;
        } else {
            consecutiveWeeks = 0;
        }
    }
    return false;
}

// Analytics & Data Helpers
async function checkStatsViews(userId, requiredViews, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as view_count 
        FROM user_activity_log 
        WHERE user_id = ? AND activity_type = 'stats_view'
    `).bind(userId).first();
    return result.view_count >= requiredViews;
}

async function checkProgressViews(userId, requiredViews, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as view_count 
        FROM user_activity_log 
        WHERE user_id = ? AND activity_type = 'progress_view'
    `).bind(userId).first();
    return result.view_count >= requiredViews;
}

async function checkLeaderboardViews(userId, requiredViews, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as view_count 
        FROM user_activity_log 
        WHERE user_id = ? AND activity_type = 'leaderboard_view'
    `).bind(userId).first();
    return result.view_count >= requiredViews;
}

// Enhanced Habit & Routine Helpers
async function checkRoutineConsistency(userId, requiredDays, env) {
    // Check if user completed the same set of habits for required consecutive days
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as consistent_days
        FROM habit_completions hc1
        WHERE user_id = ? 
        AND date(created_at) >= date('now', '-${requiredDays + 10} days')
        AND EXISTS (
            SELECT 1 FROM habit_completions hc2
            WHERE hc2.user_id = hc1.user_id
            AND date(hc2.created_at) = date(hc1.created_at, '+1 day')
            AND hc2.habit_id = hc1.habit_id
        )
    `).bind(userId).first();
    return result.consistent_days >= requiredDays;
}

async function checkMorningHabitStreak(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as morning_days
        FROM (
            SELECT date(created_at) as completion_date
            FROM habit_completions
            WHERE user_id = ? 
            AND time(created_at) <= '08:00:00'
            AND date(created_at) >= date('now', '-${requiredDays + 5} days')
            GROUP BY date(created_at)
            HAVING COUNT(*) > 0
        )
    `).bind(userId).first();
    return result.morning_days >= requiredDays;
}

async function checkEveningHabitStreak(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as evening_days
        FROM (
            SELECT date(created_at) as completion_date
            FROM habit_completions
            WHERE user_id = ? 
            AND time(created_at) >= '18:00:00'
            AND date(created_at) >= date('now', '-${requiredDays + 5} days')
            GROUP BY date(created_at)
            HAVING COUNT(*) > 0
        )
    `).bind(userId).first();
    return result.evening_days >= requiredDays;
}

async function checkWeekendConsistency(userId, requiredWeekends, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as weekend_count
        FROM (
            SELECT strftime('%Y-%W', created_at) as week_year
            FROM habit_completions
            WHERE user_id = ? 
            AND strftime('%w', created_at) IN ('0', '6')
            GROUP BY strftime('%Y-%W', created_at)
            HAVING COUNT(DISTINCT strftime('%w', created_at)) = 2
        )
    `).bind(userId).first();
    return result.weekend_count >= requiredWeekends;
}

// Enhanced Progress Tracking Helpers
async function checkMonthlyVideoComparisons(userId, requiredMonths, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) as month_count
        FROM media_uploads
        WHERE user_id = ? 
        AND file_type LIKE 'video/%'
        AND video_type IN ('before', 'after')
    `).bind(userId).first();
    return result.month_count >= requiredMonths;
}

async function checkDescribedUploads(userId, requiredCount, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as described_count
        FROM media_uploads
        WHERE user_id = ? 
        AND description IS NOT NULL 
        AND description != ''
    `).bind(userId).first();
    return result.described_count >= requiredCount;
}

async function checkWeeklyPhotoStreak(userId, requiredWeeks, env) {
    let consecutiveWeeks = 0;
    const currentDate = new Date();
    
    for (let i = 0; i < requiredWeeks + 2; i++) {
        const weekStart = new Date(currentDate.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
        const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
        
        const result = await env.DB.prepare(`
            SELECT COUNT(*) as photo_count
            FROM media_uploads
            WHERE user_id = ? 
            AND file_type LIKE 'image/%'
            AND date(created_at) BETWEEN date(?) AND date(?)
        `).bind(userId, weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]).first();
        
        if (result.photo_count > 0) {
            consecutiveWeeks++;
            if (consecutiveWeeks >= requiredWeeks) return true;
        } else {
            consecutiveWeeks = 0;
        }
    }
    return false;
}

async function checkWeeklyVideoStreak(userId, requiredWeeks, env) {
    let consecutiveWeeks = 0;
    const currentDate = new Date();
    
    for (let i = 0; i < requiredWeeks + 2; i++) {
        const weekStart = new Date(currentDate.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
        const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
        
        const result = await env.DB.prepare(`
            SELECT COUNT(*) as video_count
            FROM media_uploads
            WHERE user_id = ? 
            AND file_type LIKE 'video/%'
            AND date(created_at) BETWEEN date(?) AND date(?)
        `).bind(userId, weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]).first();
        
        if (result.video_count > 0) {
            consecutiveWeeks++;
            if (consecutiveWeeks >= requiredWeeks) return true;
        } else {
            consecutiveWeeks = 0;
        }
    }
    return false;
}

async function checkProgressDayStreak(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as upload_days
        FROM media_uploads
        WHERE user_id = ? 
        AND date(created_at) >= date('now', '-${requiredDays + 5} days')
    `).bind(userId).first();
    return result.upload_days >= requiredDays;
}

// Advanced Nutrition Helpers
async function checkMacroPerfectStreak(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT MAX(consecutive_days) as max_streak
        FROM (
            SELECT COUNT(*) as consecutive_days
            FROM user_daily_nutrition udn
            WHERE user_id = ? 
            AND protein_target_met = 1 
            AND carbs_target_met = 1 
            AND fat_target_met = 1
            AND date >= date('now', '-${requiredDays + 10} days')
        )
    `).bind(userId).first();
    return result.max_streak >= requiredDays;
}

async function checkHydrationStreak(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as hydration_days
        FROM user_daily_nutrition
        WHERE user_id = ? 
        AND water_target_met = 1
        AND date >= date('now', '-${requiredDays + 5} days')
    `).bind(userId).first();
    return result.hydration_days >= requiredDays;
}

async function checkCustomRecipes(userId, requiredCount, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT food_name) as recipe_count
        FROM user_nutrition_logs
        WHERE user_id = ? AND is_custom_recipe = 1
    `).bind(userId).first();
    return result.recipe_count >= requiredCount;
}

async function checkNutritionTrackingStreak(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as tracking_days
        FROM user_nutrition_logs
        WHERE user_id = ? 
        AND date(created_at) >= date('now', '-${requiredDays + 5} days')
    `).bind(userId).first();
    return result.tracking_days >= requiredDays;
}

async function checkBalancedMacroStreak(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as balanced_days
        FROM user_daily_nutrition
        WHERE user_id = ? 
        AND ABS(protein_percentage - 25) <= 2.5
        AND ABS(carbs_percentage - 45) <= 4.5
        AND ABS(fat_percentage - 30) <= 3.0
        AND date >= date('now', '-${requiredDays + 5} days')
    `).bind(userId).first();
    return result.balanced_days >= requiredDays;
}

// Challenge & Goals Helpers
async function checkDailyChallengesCompleted(userId, requiredCount, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as completed_count
        FROM daily_challenge_completions dcc
        JOIN daily_challenges dc ON dcc.challenge_id = dc.id
        WHERE dcc.user_id = ?
    `).bind(userId).first();
    return result.completed_count >= requiredCount;
}

async function checkPerfectChallengeWeek(userId, requiredWeeks, env) {
    // Check if user completed 100% of daily challenges in any week
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as perfect_weeks
        FROM (
            SELECT strftime('%Y-%W', dcc.created_at) as week_year,
                   COUNT(*) as completed,
                   (SELECT COUNT(*) FROM daily_challenges 
                    WHERE date BETWEEN date(?, 'weekday 0', '-6 days') AND date(?)) as total
            FROM daily_challenge_completions dcc
            WHERE user_id = ?
            GROUP BY strftime('%Y-%W', dcc.created_at)
            HAVING completed = total AND total > 0
        )
    `).bind(getWeekStart(new Date()).toISOString(), new Date().toISOString(), userId).first();
    return result.perfect_weeks >= requiredWeeks;
}

async function checkWeeklyGoalsCompleted(userId, requiredCount, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as goals_completed
        FROM (
            SELECT strftime('%Y-%W', hc.created_at) as week_year
            FROM habit_completions hc
            JOIN habits h ON hc.habit_id = h.id
            WHERE h.user_id = ?
            GROUP BY h.id, strftime('%Y-%W', hc.created_at)
            HAVING COUNT(*) >= h.weekly_target
        )
    `).bind(userId).first();
    return result.goals_completed >= requiredCount;
}

async function checkSimultaneousStreaks(userId, requiredStreaks, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as active_streaks
        FROM habits h
        WHERE h.user_id = ? AND (
            SELECT COUNT(DISTINCT date(hc.created_at))
            FROM habit_completions hc
            WHERE hc.habit_id = h.id
            AND date(hc.created_at) >= date('now', '-35 days')
        ) >= 30
    `).bind(userId).first();
    return result.active_streaks >= requiredStreaks;
}

async function checkStreakComeback(userId, requiredCount, env) {
    // This is complex - would need streak history tracking
    // For now, return false as placeholder
    return false;
}

// Enhanced Consistency Helpers
async function checkLoginStreak(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as login_days
        FROM user_activity_log
        WHERE user_id = ? 
        AND activity_type = 'login'
        AND date(created_at) >= date('now', '-${requiredDays + 5} days')
    `).bind(userId).first();
    return result.login_days >= requiredDays;
}

async function checkSingleHabitStreak(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT MAX(streak_days) as max_streak
        FROM (
            SELECT habit_id, COUNT(DISTINCT date(created_at)) as streak_days
            FROM habit_completions
            WHERE user_id = ?
            AND date(created_at) >= date('now', '-${requiredDays + 10} days')
            GROUP BY habit_id
        )
    `).bind(userId).first();
    return result.max_streak >= requiredDays;
}

async function checkMultiHabitStreaks(userId, requiredStreaks, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as active_streaks
        FROM (
            SELECT habit_id, COUNT(DISTINCT date(created_at)) as streak_days
            FROM habit_completions
            WHERE user_id = ?
            AND date(created_at) >= date('now', '-20 days')
            GROUP BY habit_id
            HAVING streak_days >= 14
        )
    `).bind(userId).first();
    return result.active_streaks >= requiredStreaks;
}

async function checkYearlyConsistency(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as active_days
        FROM habit_completions
        WHERE user_id = ?
        AND date(created_at) >= date('now', '-366 days')
    `).bind(userId).first();
    return result.active_days >= requiredDays;
}

async function checkPerfectConsistency(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as perfect_days
        FROM habit_completions hc1
        WHERE user_id = ?
        AND date(created_at) >= date('now', '-${requiredDays + 10} days')
        AND NOT EXISTS (
            SELECT 1 FROM habits h
            WHERE h.user_id = hc1.user_id
            AND h.created_at <= date(hc1.created_at)
            AND NOT EXISTS (
                SELECT 1 FROM habit_completions hc2
                WHERE hc2.habit_id = h.id
                AND date(hc2.created_at) = date(hc1.created_at)
            )
        )
    `).bind(userId).first();
    return result.perfect_days >= requiredDays;
}

// Enhanced Onboarding Helpers
async function checkFeatureExploration(userId, requiredCount, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT activity_type) as features_used
        FROM user_activity_log
        WHERE user_id = ?
        AND activity_type IN ('habit_creation', 'media_upload', 'nutrition_log', 'achievement_view')
        AND date(created_at) = date('now')
    `).bind(userId).first();
    return result.features_used >= 4; // All main features
}

async function checkEarlyEngagement(userId, requiredDays, env) {
    const userCreated = await env.DB.prepare(`
        SELECT created_at FROM users WHERE id = ?
    `).bind(userId).first();
    
    if (!userCreated) return false;
    
    const createdDate = new Date(userCreated.created_at);
    const twoWeeksLater = new Date(createdDate.getTime() + (14 * 24 * 60 * 60 * 1000));
    
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as active_days
        FROM user_activity_log
        WHERE user_id = ?
        AND activity_type = 'login'
        AND created_at BETWEEN ? AND ?
    `).bind(userId, createdDate.toISOString(), twoWeeksLater.toISOString()).first();
    
    return result.active_days >= requiredDays;
}

async function checkEarlyInvites(userId, requiredCount, env) {
    const userCreated = await env.DB.prepare(`
        SELECT created_at FROM users WHERE id = ?
    `).bind(userId).first();
    
    if (!userCreated) return false;
    
    const createdDate = new Date(userCreated.created_at);
    const oneMonthLater = new Date(createdDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as invite_count
        FROM friendships
        WHERE user_id = ?
        AND created_at BETWEEN ? AND ?
    `).bind(userId, createdDate.toISOString(), oneMonthLater.toISOString()).first();
    
    return result.invite_count >= requiredCount;
}

async function checkFastAchievements(userId, requiredCount, env) {
    const userCreated = await env.DB.prepare(`
        SELECT created_at FROM users WHERE id = ?
    `).bind(userId).first();
    
    if (!userCreated) return false;
    
    const createdDate = new Date(userCreated.created_at);
    const twoWeeksLater = new Date(createdDate.getTime() + (14 * 24 * 60 * 60 * 1000));
    
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as achievement_count
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ?
        AND ua.created_at BETWEEN ? AND ?
    `).bind(userId, createdDate.toISOString(), twoWeeksLater.toISOString()).first();
    
    return result.achievement_count >= requiredCount;
}

async function checkCommitmentStreak(userId, requiredDays, env) {
    const userCreated = await env.DB.prepare(`
        SELECT created_at FROM users WHERE id = ?
    `).bind(userId).first();
    
    if (!userCreated) return false;
    
    const createdDate = new Date(userCreated.created_at);
    const thirtyDaysLater = new Date(createdDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as login_days
        FROM user_activity_log
        WHERE user_id = ?
        AND activity_type = 'login'
        AND created_at BETWEEN ? AND ?
    `).bind(userId, createdDate.toISOString(), thirtyDaysLater.toISOString()).first();
    
    return result.login_days >= requiredDays;
}

// Helper utility functions
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

async function getUserWeeklyRank(userId, weekStart, env) {
    const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
    
    const result = await env.DB.prepare(`
        SELECT COUNT(*) + 1 as rank
        FROM (
            SELECT u.id, COALESCE(SUM(hc.points), 0) as weekly_points
            FROM users u
            LEFT JOIN habit_completions hc ON u.id = hc.user_id 
                AND date(hc.created_at) BETWEEN date(?) AND date(?)
            GROUP BY u.id
            HAVING weekly_points > (
                SELECT COALESCE(SUM(hc2.points), 0)
                FROM habit_completions hc2 
                WHERE hc2.user_id = ? 
                AND date(hc2.created_at) BETWEEN date(?) AND date(?)
            )
        )
    `).bind(
        weekStart.toISOString().split('T')[0], 
        weekEnd.toISOString().split('T')[0], 
        userId,
        weekStart.toISOString().split('T')[0], 
        weekEnd.toISOString().split('T')[0]
    ).first();
    
    return result.rank;
}

// Combo & Streak Achievement Helpers
async function checkDailyAchievementCount(userId, requiredCount, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as achievement_count
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ?
        AND date(ua.created_at) = date('now')
    `).bind(userId).first();
    return result.achievement_count >= requiredCount;
}

async function checkCategoryMastery(userId, category, env) {
    const categoryAchievements = await env.DB.prepare(`
        SELECT COUNT(*) as total_in_category
        FROM achievements
        WHERE category = ? AND is_hidden = 0
    `).bind(category).first();
    
    const userCategoryAchievements = await env.DB.prepare(`
        SELECT COUNT(*) as earned_in_category
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ? AND a.category = ? AND a.is_hidden = 0
    `).bind(userId, category).first();
    
    return userCategoryAchievements.earned_in_category >= categoryAchievements.total_in_category;
}

async function checkDailyAchievementStreak(userId, requiredDays, env) {
    // Check if user has unlocked at least 1 achievement every day for required days
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(ua.created_at)) as achievement_days
        FROM user_achievements ua
        WHERE ua.user_id = ?
        AND date(ua.created_at) >= date('now', '-${requiredDays} days')
    `).bind(userId).first();
    return result.achievement_days >= requiredDays;
}

async function checkWeeklyAchievementStreak(userId, requiredWeeks, env) {
    // Check if user has unlocked achievements for consecutive weeks
    let consecutiveWeeks = 0;
    const currentDate = new Date();
    
    for (let i = 0; i < requiredWeeks + 2; i++) {
        const weekStart = new Date(currentDate.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
        const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
        
        const result = await env.DB.prepare(`
            SELECT COUNT(*) as weekly_achievements
            FROM user_achievements ua
            WHERE ua.user_id = ?
            AND date(ua.created_at) BETWEEN date(?) AND date(?)
        `).bind(userId, weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]).first();
        
        if (result.weekly_achievements > 0) {
            consecutiveWeeks++;
            if (consecutiveWeeks >= requiredWeeks) return true;
        } else {
            consecutiveWeeks = 0;
        }
    }
    return false;
}

async function checkTotalAchievements(userId, requiredCount, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as total_achievements
        FROM user_achievements
        WHERE user_id = ?
    `).bind(userId).first();
    return result.total_achievements >= requiredCount;
}

async function checkAchievementsInTimeframe(userId, requiredCount, env) {
    const userCreated = await env.DB.prepare(`
        SELECT created_at FROM users WHERE id = ?
    `).bind(userId).first();
    
    if (!userCreated) return false;
    
    const createdDate = new Date(userCreated.created_at);
    const oneMonthLater = new Date(createdDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as achievement_count
        FROM user_achievements ua
        WHERE ua.user_id = ?
        AND ua.created_at BETWEEN ? AND ?
    `).bind(userId, createdDate.toISOString(), oneMonthLater.toISOString()).first();
    
    return result.achievement_count >= requiredCount;
}

async function checkSeasonalEvent(userId, requiredCount, env) {
    // Placeholder for seasonal events - would need event system
    return false;
}

async function checkMonthlyChallenge(userId, requiredCount, env) {
    // Placeholder for monthly challenges - would need challenge system
    return false;
}

async function checkConsecutiveMonthly(userId, requiredCount, env) {
    // Placeholder for consecutive monthly challenges
    return false;
}

async function checkAchievementRank(userId, percentile, env) {
    // Check if user is in top X% for achievement count among friends
    const friendsCount = await env.DB.prepare(`
        SELECT COUNT(*) as friends_count
        FROM friendships
        WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'
    `).bind(userId, userId).first();
    
    if (friendsCount.friends_count === 0) return false;
    
    const userAchievementCount = await env.DB.prepare(`
        SELECT COUNT(*) as user_achievements
        FROM user_achievements
        WHERE user_id = ?
    `).bind(userId).first();
    
    const betterFriends = await env.DB.prepare(`
        SELECT COUNT(DISTINCT f.friend_id) as better_count
        FROM friendships f
        LEFT JOIN user_achievements ua ON (
            f.friend_id = ua.user_id OR 
            (f.user_id = ua.user_id AND f.friend_id = ?)
        )
        WHERE (f.user_id = ? OR f.friend_id = ?) 
        AND f.status = 'accepted'
        GROUP BY f.friend_id
        HAVING COUNT(ua.id) > ?
    `).bind(userId, userId, userId, userAchievementCount.user_achievements).first();
    
    const percentileRank = ((friendsCount.friends_count - (betterFriends?.better_count || 0)) / friendsCount.friends_count) * 100;
    return percentileRank >= percentile;
}

async function checkAchievementLeaderboard(userId, requiredRank, env) {
    // Check if user has the most achievements among friends
    return await checkAchievementRank(userId, 100, env);
}

async function checkPerfectCategory(userId, requiredCount, env) {
    // Check if user completed a category without missing any achievements
    const categories = ['onboarding', 'habits', 'progress', 'nutrition', 'social', 'consistency', 'challenges', 'analytics'];
    
    for (const category of categories) {
        const mastery = await checkCategoryMastery(userId, category, env);
        if (mastery) return true;
    }
    return false;
}

async function checkCompletionist(userId, requiredCount, env) {
    const totalNonHidden = await env.DB.prepare(`
        SELECT COUNT(*) as total_achievements
        FROM achievements
        WHERE is_hidden = 0
    `).first();
    
    const userAchievements = await env.DB.prepare(`
        SELECT COUNT(*) as user_achievements
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ? AND a.is_hidden = 0
    `).bind(userId).first();
    
    return userAchievements.user_achievements >= totalNonHidden.total_achievements * 0.95; // 95% completion
}

// Media Upload Achievement Helpers
async function checkWeeklyUploadStreak(userId, requiredWeeks, env) {
    let consecutiveWeeks = 0;
    const currentDate = new Date();
    
    for (let i = 0; i < requiredWeeks + 2; i++) {
        const weekStart = new Date(currentDate.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
        const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
        
        const result = await env.DB.prepare(`
            SELECT COUNT(*) as upload_count
            FROM media_uploads
            WHERE user_id = ? 
            AND date(uploaded_at) BETWEEN date(?) AND date(?)
        `).bind(userId, weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]).first();
        
        if (result.upload_count > 0) {
            consecutiveWeeks++;
            if (consecutiveWeeks >= requiredWeeks) return true;
        } else {
            consecutiveWeeks = 0;
        }
    }
    return false;
}

// Nutrition Achievement Helpers
async function checkCalorieTrackingWeek(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as tracking_days
        FROM user_nutrition_logs
        WHERE user_id = ? 
        AND calories > 0
        AND date(created_at) >= date('now', '-7 days')
    `).bind(userId).first();
    
    return result.tracking_days >= requiredDays;
}

async function checkWaterTracking(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as water_days
        FROM user_nutrition_logs
        WHERE user_id = ? 
        AND water_ml > 0
        AND date(created_at) >= date('now', '-${requiredDays + 2} days')
    `).bind(userId).first();
    
    return result.water_days >= requiredDays;
}

async function checkFiberTracking(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as fiber_days
        FROM user_nutrition_logs
        WHERE user_id = ? 
        AND fiber_g > 0
        AND date(created_at) >= date('now', '-${requiredDays + 2} days')
    `).bind(userId).first();
    
    return result.fiber_days >= requiredDays;
}

async function checkCarbTrackingStreak(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as carb_days
        FROM user_nutrition_logs
        WHERE user_id = ? 
        AND carbs_g > 0
        AND date(created_at) >= date('now', '-${requiredDays + 2} days')
    `).bind(userId).first();
    
    return result.carb_days >= requiredDays;
}

async function checkFatBalanceStreak(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as fat_days
        FROM user_nutrition_logs
        WHERE user_id = ? 
        AND fat_g > 0
        AND date(created_at) >= date('now', '-${requiredDays + 2} days')
    `).bind(userId).first();
    
    return result.fat_days >= requiredDays;
}

async function checkSugarTracking(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as sugar_days
        FROM user_nutrition_logs
        WHERE user_id = ? 
        AND sugar_g > 0
        AND date(created_at) >= date('now', '-${requiredDays + 2} days')
    `).bind(userId).first();
    
    return result.sugar_days >= requiredDays;
}

async function checkNutritionTrackingMonth(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as tracking_days
        FROM user_nutrition_logs
        WHERE user_id = ? 
        AND date(created_at) >= date('now', '-${requiredDays} days')
    `).bind(userId).first();
    
    return result.tracking_days >= requiredDays;
}

async function checkMacroPerfectionCount(userId, requiredCount, env) {
    // Calculate perfect macro days (hitting all macro targets)
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as perfect_days
        FROM user_nutrition_logs
        WHERE user_id = ? 
        AND protein_g > 20 
        AND carbs_g > 30 
        AND fat_g > 10
    `).bind(userId).first();
    
    return result.perfect_days >= requiredCount;
}

async function checkNutritionSuperStreak(userId, requiredDays, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(DISTINCT date(created_at)) as super_streak_days
        FROM user_nutrition_logs
        WHERE user_id = ? 
        AND date(created_at) >= date('now', '-${requiredDays + 5} days')
    `).bind(userId).first();
    
    return result.super_streak_days >= requiredDays;
}

async function checkNutritionChallenges(userId, requiredCount, env) {
    const result = await env.DB.prepare(`
        SELECT COUNT(*) as nutrition_challenges
        FROM daily_challenge_completions dcc
        JOIN daily_challenges dc ON dcc.challenge_id = dc.id
        WHERE dcc.user_id = ?
        AND dc.category = 'nutrition'
    `).bind(userId).first();
    
    return result.nutrition_challenges >= requiredCount;
}