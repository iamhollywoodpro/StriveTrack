// Secure Admin Authentication Utility
// Only iamhollywoodpro@protonmail.com has admin access

export function getAdminCredentials(env) {
    return {
        email: env.ADMIN_EMAIL || 'iamhollywoodpro@protonmail.com',
        password: env.ADMIN_PASSWORD || 'password@1981'
    };
}

/**
 * Check if user has admin privileges
 * @param {Object} user - User object from database
 * @returns {boolean} - True if user is the designated admin
 */
export function isAdmin(user, env) {
    const { email } = getAdminCredentials(env);
    return user && user.email === email;
}

/**
 * Verify admin session and return admin user
 * @param {string} sessionId - Session ID from request
 * @param {Object} env - Environment with DB access
 * @returns {Object|null} - Admin user object or null if not admin
 */
export async function verifyAdminSession(sessionId, env) {
    if (!sessionId) {
        return null;
    }

    try {
        // Get session
        const session = await env.DB.prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")').bind(sessionId).first();
        if (!session) {
            return null;
        }

        // Get user
        const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(session.user_id).first();
        if (!user) {
            return null;
        }

        // Check if user is the designated admin
        if (!isAdmin(user, env)) {
            return null;
        }

        return user;
    } catch (error) {
        console.error('Admin session verification error:', error);
        return null;
    }
}

/**
 * Ensure admin account exists in database
 * This should be called during app initialization
 * @param {Object} env - Environment with DB access
 */
export async function ensureAdminAccountExists(env) {
    try {
        const { email, password } = getAdminCredentials(env);
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Check if admin account exists
        const existingAdmin = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
        
        if (!existingAdmin) {
            // Create admin account
            const adminId = crypto.randomUUID();
            await env.DB.prepare(`
                INSERT INTO users (id, email, password_hash, role, points, created_at, updated_at)
                VALUES (?, ?, ?, 'admin', 0, datetime('now'), datetime('now'))
            `).bind(adminId, email, hashedPassword).run();
            
            console.log('Admin account created successfully');
        } else {
            // Ensure existing account has admin role and correct password
            await env.DB.prepare(`
                UPDATE users 
                SET role = 'admin', password_hash = ?, updated_at = datetime('now')
                WHERE email = ?
            `).bind(hashedPassword, email).run();
            
            console.log('Admin account updated with correct password hash');
        }
    } catch (error) {
        console.error('Ensure admin account error:', error);
    }
}

/**
 * Filter users to hide admin from regular users
 * @param {Array} users - Array of user objects
 * @param {Object} requestingUser - User making the request
 * @returns {Array} - Filtered users array
 */
export function filterUsersForDisplay(users, requestingUser, env) {
    if (isAdmin(requestingUser, env)) {
        // Admin can see all users including themselves
        return users;
    } else {
        // Regular users cannot see admin account at all
        return users.filter(user => !isAdmin(user, env));
    }
}