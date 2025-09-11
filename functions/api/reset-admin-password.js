// Admin password reset endpoint - fixes admin authentication
export async function onRequestGet(context) {
    const { env } = context;
    
    try {
        // Get current admin user
        const adminUser = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
            .bind(env.ADMIN_EMAIL).first();
            
        if (!adminUser) {
            return new Response(`
                <html>
                    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                        <h1>❌ Admin User Not Found</h1>
                        <p>No admin user found with email: ${env.ADMIN_EMAIL}</p>
                        <p>Please run <a href="/api/init-admin">Admin Initialization</a> first.</p>
                        <a href="/" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">← Back to StriveTrack</a>
                    </body>
                </html>
            `, {
                status: 404,
                headers: { 'Content-Type': 'text/html' }
            });
        }
        
        // Hash the new password
        const bcrypt = await import('bcryptjs');
        const newPasswordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
        
        // Update the admin user's password
        await env.DB.prepare(`
            UPDATE users 
            SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
            WHERE email = ?
        `).bind(newPasswordHash, env.ADMIN_EMAIL).run();
        
        // Verify the update worked
        const updatedUser = await env.DB.prepare('SELECT id, email, role, updated_at FROM users WHERE email = ?')
            .bind(env.ADMIN_EMAIL).first();
            
        return new Response(`
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                    <h1>🎉 Admin Password Reset Successful!</h1>
                    
                    <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3>✅ Password Updated</h3>
                        <p><strong>Admin ID:</strong> ${updatedUser.id}</p>
                        <p><strong>Email:</strong> ${updatedUser.email}</p>
                        <p><strong>Role:</strong> ${updatedUser.role}</p>
                        <p><strong>Updated:</strong> ${updatedUser.updated_at}</p>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3>🔑 New Login Credentials</h3>
                        <p><strong>Email:</strong> ${env.ADMIN_EMAIL}</p>
                        <p><strong>Password:</strong> ${env.ADMIN_PASSWORD}</p>
                        <p><em>Password hash has been updated with bcrypt.</em></p>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <a href="/" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">Go to Login</a>
                        <a href="/api/debug-users" style="background: #17a2b8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">Debug Users</a>
                    </div>
                </body>
            </html>
        `, {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });
        
    } catch (error) {
        console.error('Admin password reset error:', error);
        return new Response(`
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                    <h1>❌ Password Reset Failed</h1>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <pre>${error.stack}</pre>
                    <a href="/" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">← Back to StriveTrack</a>
                </body>
            </html>
        `, {
            status: 500,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}