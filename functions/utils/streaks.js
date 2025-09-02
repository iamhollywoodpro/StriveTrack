// Streak tracking utilities

export async function updateStreak(db, userId, streakType) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    try {
        // Get current streak data
        const currentStreak = await db.prepare(`
            SELECT * FROM user_streaks 
            WHERE user_id = ? AND streak_type = ?
        `).bind(userId, streakType).first();

        if (!currentStreak) {
            // Create new streak
            await db.prepare(`
                INSERT INTO user_streaks (id, user_id, streak_type, current_streak, best_streak, last_update_date)
                VALUES (?, ?, ?, 1, 1, ?)
            `).bind(`streak_${userId}_${streakType}_${Date.now()}`, userId, streakType, today).run();
            
            return { current_streak: 1, best_streak: 1, is_new_record: true };
        } else {
            const lastUpdate = new Date(currentStreak.last_update_date);
            const todayDate = new Date(today);
            const daysDifference = Math.floor((todayDate - lastUpdate) / (1000 * 60 * 60 * 24));

            let newStreak;
            let isNewRecord = false;

            if (daysDifference === 1) {
                // Consecutive day - increment streak
                newStreak = currentStreak.current_streak + 1;
            } else if (daysDifference === 0) {
                // Same day - no change
                newStreak = currentStreak.current_streak;
            } else {
                // Broken streak - reset to 1
                newStreak = 1;
            }

            const newBestStreak = Math.max(newStreak, currentStreak.best_streak);
            isNewRecord = newBestStreak > currentStreak.best_streak;

            await db.prepare(`
                UPDATE user_streaks 
                SET current_streak = ?, best_streak = ?, last_update_date = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND streak_type = ?
            `).bind(newStreak, newBestStreak, today, userId, streakType).run();

            return { 
                current_streak: newStreak, 
                best_streak: newBestStreak, 
                is_new_record: isNewRecord,
                days_difference: daysDifference
            };
        }
    } catch (error) {
        console.error('Streak update error:', error);
        return null;
    }
}

export async function checkStreakBreak(db, userId, streakType) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    try {
        const streak = await db.prepare(`
            SELECT * FROM user_streaks 
            WHERE user_id = ? AND streak_type = ?
        `).bind(userId, streakType).first();

        if (streak && streak.last_update_date < yesterdayStr && streak.current_streak > 0) {
            // Streak is broken - reset to 0
            await db.prepare(`
                UPDATE user_streaks 
                SET current_streak = 0, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND streak_type = ?
            `).bind(userId, streakType).run();
            
            return { streak_broken: true, previous_streak: streak.current_streak };
        }
        
        return { streak_broken: false };
    } catch (error) {
        console.error('Streak check error:', error);
        return { streak_broken: false };
    }
}

export async function updateDailyChallengeProgress(db, userId, challengeType, progressAmount = 1) {
    const today = new Date().toISOString().split('T')[0];
    
    try {
        // Get relevant challenges for today
        const challenges = await db.prepare(`
            SELECT dc.* FROM daily_challenges dc
            WHERE dc.is_active = 1 AND dc.requirement_type = ?
        `).bind(challengeType).all();

        const results = [];

        for (const challenge of challenges.results || []) {
            // Get or create user challenge progress
            let userChallenge = await db.prepare(`
                SELECT * FROM user_daily_challenges
                WHERE user_id = ? AND challenge_id = ? AND challenge_date = ?
            `).bind(userId, challenge.id, today).first();

            if (!userChallenge) {
                // Create new progress entry
                const challengeId = `udc_${userId}_${challenge.id}_${today}_${Date.now()}`;
                await db.prepare(`
                    INSERT INTO user_daily_challenges 
                    (id, user_id, challenge_id, challenge_date, progress_count)
                    VALUES (?, ?, ?, ?, ?)
                `).bind(challengeId, userId, challenge.id, today, progressAmount).run();
                
                userChallenge = { progress_count: progressAmount, is_completed: 0 };
            } else {
                // Update existing progress
                const newProgress = userChallenge.progress_count + progressAmount;
                await db.prepare(`
                    UPDATE user_daily_challenges 
                    SET progress_count = ?
                    WHERE user_id = ? AND challenge_id = ? AND challenge_date = ?
                `).bind(newProgress, userId, challenge.id, today).run();
                
                userChallenge.progress_count = newProgress;
            }

            // Check if challenge is completed
            if (userChallenge.progress_count >= challenge.requirement_value && !userChallenge.is_completed) {
                await db.prepare(`
                    UPDATE user_daily_challenges 
                    SET is_completed = 1, completed_at = CURRENT_TIMESTAMP, points_earned = ?
                    WHERE user_id = ? AND challenge_id = ? AND challenge_date = ?
                `).bind(challenge.points_reward, userId, challenge.id, today).run();

                // Add points to user
                await db.prepare(`
                    UPDATE users SET points = points + ? WHERE id = ?
                `).bind(challenge.points_reward, userId).run();

                results.push({
                    challenge: challenge,
                    completed: true,
                    points_earned: challenge.points_reward
                });
            }
        }

        return results;
    } catch (error) {
        console.error('Daily challenge progress error:', error);
        return [];
    }
}