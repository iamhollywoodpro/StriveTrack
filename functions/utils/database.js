// Database utilities for StriveTrack

export async function getUserByEmail(email, env) {
    return await env.DB.prepare('SELECT * FROM users WHERE email = ?')
        .bind(email).first();
}

export async function getUserById(id, env) {
    return await env.DB.prepare('SELECT * FROM users WHERE id = ?')
        .bind(id).first();
}

export async function createUser(userData, env) {
    const { v4: uuidv4 } = await import('uuid');
    const bcrypt = await import('bcryptjs');
    
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    // Set admin role for specific email, otherwise use provided user_type
    const role = userData.email === env.ADMIN_EMAIL ? 'admin' : 'user';
    const userType = userData.user_type || 'beginner';
    
    // Validate user_type
    const validTypes = ['beginner', 'intermediate', 'advanced', 'competition', 'coach'];
    if (!validTypes.includes(userType)) {
        throw new Error(`Invalid user type: ${userType}`);
    }
    
    // Create profile data object
    const profileData = {
        fitness_level: userType,
        goals: [],
        preferences: {},
        onboarding_step: 1,
        dashboard_layout: getRoleBasedDashboardConfig(userType)
    };
    
    await env.DB.prepare(`
        INSERT INTO users (
            id, email, password_hash, role, points, 
            name, phone, user_type, onboarding_completed, 
            profile_data, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, 0, ?, ?, ?, 0, ?, datetime('now'), datetime('now'))
    `).bind(
        userId, 
        userData.email, 
        hashedPassword, 
        role, 
        userData.name || '', 
        userData.phone || '', 
        userType, 
        JSON.stringify(profileData)
    ).run();
    
    return await getUserById(userId, env);
}

/**
 * Get dashboard configuration based on user role
 */
function getRoleBasedDashboardConfig(userType) {
    const baseDashboard = {
        sections: ['habits', 'nutrition', 'achievements', 'progress'],
        widgets: []
    };
    
    switch (userType) {
        case 'beginner':
            return {
                ...baseDashboard,
                sections: [...baseDashboard.sections, 'learning_hub', 'guided_workouts', 'milestones'],
                widgets: ['progress_streak', 'next_milestone', 'daily_tip']
            };
            
        case 'intermediate':
            return {
                ...baseDashboard,
                sections: [...baseDashboard.sections, 'analytics', 'challenges', 'integrations'],
                widgets: ['trend_analysis', 'plateau_detection', 'goal_optimizer']
            };
            
        case 'advanced':
            return {
                ...baseDashboard,
                sections: [...baseDashboard.sections, 'performance', 'program_builder', 'biometrics', 'mentorship'],
                widgets: ['performance_metrics', 'recovery_status', 'training_load']
            };
            
        case 'competition':
            return {
                ...baseDashboard,
                sections: [...baseDashboard.sections, 'competitions', 'peak_timing', 'team_management'],
                widgets: ['next_competition', 'performance_prediction', 'training_phase']
            };
            
        case 'coach':
            return {
                ...baseDashboard,
                sections: [...baseDashboard.sections, 'clients', 'programs', 'business_tools', 'resources'],
                widgets: ['client_overview', 'schedule', 'revenue_metrics']
            };
            
        default:
            return baseDashboard;
    }
}

export async function validatePassword(password, hash) {
    const bcrypt = await import('bcryptjs');
    return await bcrypt.compare(password, hash);
}

export async function updateUserPoints(userId, points, env) {
    await env.DB.prepare('UPDATE users SET points = points + ? WHERE id = ?')
        .bind(points, userId).run();
}

export async function getUserHabits(userId, env) {
    // Get habits
    const habitsResult = await env.DB.prepare(`
        SELECT h.*, 
               COUNT(hc.id) as total_completions
        FROM habits h
        LEFT JOIN habit_completions hc ON h.id = hc.habit_id
        WHERE h.user_id = ?
        GROUP BY h.id
        ORDER BY h.created_at DESC
    `).bind(userId).all();
    
    const habits = habitsResult.results || [];
    
    // Get completions for each habit
    for (const habit of habits) {
        const completionsResult = await env.DB.prepare(`
            SELECT DATE(completed_at) as completion_date
            FROM habit_completions
            WHERE habit_id = ? AND user_id = ?
            ORDER BY completed_at DESC
        `).bind(habit.id, userId).all();
        
        habit.completions = (completionsResult.results || []).map(c => c.completion_date);
        
        // Parse emoji and name if stored together
        if (habit.name && habit.name.includes(' ')) {
            const parts = habit.name.split(' ');
            if (parts[0].length <= 2) { // Likely an emoji
                habit.emoji = parts[0];
                habit.name = parts.slice(1).join(' ');
            }
        }
        
        if (!habit.emoji) {
            habit.emoji = '⭐'; // Default emoji
        }
    }
    
    return habits;
}

export async function createHabit(habitData, env) {
    const { v4: uuidv4 } = await import('uuid');
    
    const habitId = uuidv4();
    await env.DB.prepare(`
        INSERT INTO habits (id, user_id, name, description, target_frequency, color, weekly_target)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
        habitId, 
        habitData.user_id, 
        habitData.name, 
        habitData.description || '', 
        habitData.target_frequency || 1,
        habitData.color || '#667eea',
        habitData.weekly_target || 7
    ).run();
    
    return habitId;
}

export async function markHabitComplete(habitId, userId, notes, env) {
    const { v4: uuidv4 } = await import('uuid');
    
    // Check if already completed today
    const existingCompletion = await env.DB.prepare(`
        SELECT id FROM habit_completions 
        WHERE habit_id = ? AND user_id = ? AND date(completed_at) = date('now')
    `).bind(habitId, userId).first();
    
    if (existingCompletion) {
        return { error: 'Habit already completed today' };
    }
    
    const completionId = uuidv4();
    await env.DB.prepare(`
        INSERT INTO habit_completions (id, habit_id, user_id, notes)
        VALUES (?, ?, ?, ?)
    `).bind(completionId, habitId, userId, notes || '').run();
    
    // Award points
    await updateUserPoints(userId, 10, env);
    
    return { success: true, completionId, points: 10 };
}

export async function getUserMedia(userId, env) {
    const result = await env.DB.prepare(`
        SELECT * FROM media_uploads 
        WHERE user_id = ? 
        ORDER BY uploaded_at DESC
    `).bind(userId).all();
    return result.results || [];
}

export async function getAllMedia(env) {
    const result = await env.DB.prepare(`
        SELECT m.*, u.email as user_email
        FROM media_uploads m
        JOIN users u ON m.user_id = u.id
        ORDER BY m.uploaded_at DESC
    `).all();
    return result.results || [];
}

export async function getUserAchievements(userId, env) {
    const result = await env.DB.prepare(`
        SELECT a.*, ua.earned_at
        FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
        ORDER BY ua.earned_at DESC, a.points ASC
    `).bind(userId).all();
    return result.results || [];
}

export async function checkAndAwardAchievements(userId, env) {
    // Import and use the enhanced achievement system
    try {
        const { checkAndAwardAchievements: enhancedCheck } = await import('./achievements.js');
        return await enhancedCheck(userId, 'general', {}, env);
    } catch (error) {
        console.error('Enhanced achievement check error:', error);
        return [];
    }
}