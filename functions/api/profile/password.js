// Password change API for StriveTrack
import { getCurrentUser } from '../../utils/auth.js';
import { validatePassword } from '../../utils/database.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const user = await getCurrentUser(request, env);
        if (!user) {
            return new Response(JSON.stringify({ 
                error: 'Authentication required' 
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const body = await request.json();
        const { currentPassword, newPassword, confirmPassword } = body;

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            return new Response(JSON.stringify({ 
                error: 'All password fields are required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (newPassword.length < 6) {
            return new Response(JSON.stringify({ 
                error: 'New password must be at least 6 characters long' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (newPassword !== confirmPassword) {
            return new Response(JSON.stringify({ 
                error: 'New password and confirmation do not match' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get current user with password hash
        const currentUser = await env.DB.prepare(
            'SELECT password_hash FROM users WHERE id = ?'
        ).bind(user.id).first();

        if (!currentUser) {
            return new Response(JSON.stringify({ 
                error: 'User not found' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await validatePassword(currentPassword, currentUser.password_hash);
        if (!isCurrentPasswordValid) {
            return new Response(JSON.stringify({ 
                error: 'Current password is incorrect' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Hash new password
        const bcrypt = await import('bcryptjs');
        const newPasswordHash = await bcrypt.hash(newPassword, 12);

        // Update password
        await env.DB.prepare(`
            UPDATE users 
            SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).bind(newPasswordHash, user.id).run();

        return new Response(JSON.stringify({
            message: 'Password updated successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Password change error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to update password' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}