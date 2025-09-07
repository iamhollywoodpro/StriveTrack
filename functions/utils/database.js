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
    const { generateUserId } = await import('./id-generator.js');
    const bcrypt = await import('bcryptjs');
    
    const userId = generateUserId();
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    // Set admin role for specific email
    const role = userData.email === env.ADMIN_EMAIL ? 'admin' : 'user';
    
    await env.DB.prepare(`
        INSERT INTO users (id, email, password_hash, role, points)
        VALUES (?, ?, ?, ?, 0)
    `).bind(userId, userData.email, hashedPassword, role).run();
    
    return await getUserById(userId, env);
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
    const result = await env.DB.prepare(`
        SELECT h.*, 
               COUNT(hc.id) as total_completions,
               COUNT(CASE WHEN date(hc.completed_at) = date('now') THEN 1 END) as today_completed
        FROM habits h
        LEFT JOIN habit_completions hc ON h.id = hc.habit_id
        WHERE h.user_id = ?
        GROUP BY h.id
        ORDER BY h.created_at DESC
    `).bind(userId).all();
    return result.results || [];
}

export async function createHabit(habitData, env) {
    const { generateUserId } = await import('./id-generator.js');
    
    const habitId = generateUserId();
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
    const { generateUserId } = await import('./id-generator.js');
    
    // Check if already completed today
    const existingCompletion = await env.DB.prepare(`
        SELECT id FROM habit_completions 
        WHERE habit_id = ? AND user_id = ? AND date(completed_at) = date('now')
    `).bind(habitId, userId).first();
    
    if (existingCompletion) {
        return { error: 'Habit already completed today' };
    }
    
    const completionId = generateUserId();
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