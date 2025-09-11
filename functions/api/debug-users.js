// Debug endpoint to check user database - TEMPORARY
export async function onRequestGet(context) {
    const { env } = context;
    
    try {
        // Get all users from database
        const users = await env.DB.prepare('SELECT id, email, username, role, created_at FROM users').all();
        
        // Count users
        const userCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
        
        // Check if admin user exists specifically
        const adminUser = await env.DB.prepare('SELECT id, email, username, role, created_at FROM users WHERE email = ?')
            .bind(env.ADMIN_EMAIL).first();
            
        return new Response(`
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px;">
                    <h1>🔍 Database Debug Information</h1>
                    
                    <h2>User Count: ${userCount?.count || 0}</h2>
                    
                    <h2>Admin User Check</h2>
                    <p><strong>Looking for:</strong> ${env.ADMIN_EMAIL}</p>
                    ${adminUser ? `
                        <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0;">
                            <h3>✅ Admin User Found</h3>
                            <p><strong>ID:</strong> ${adminUser.id}</p>
                            <p><strong>Email:</strong> ${adminUser.email}</p>
                            <p><strong>Username:</strong> ${adminUser.username || 'NULL'}</p>
                            <p><strong>Role:</strong> ${adminUser.role}</p>
                            <p><strong>Created:</strong> ${adminUser.created_at}</p>
                        </div>
                    ` : `
                        <div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 10px 0;">
                            <h3>❌ Admin User NOT Found</h3>
                            <p>No user found with email: ${env.ADMIN_EMAIL}</p>
                        </div>
                    `}
                    
                    <h2>All Users in Database</h2>
                    ${users.results && users.results.length > 0 ? `
                        <table border="1" style="border-collapse: collapse; width: 100%;">
                            <tr>
                                <th style="padding: 8px;">ID</th>
                                <th style="padding: 8px;">Email</th>
                                <th style="padding: 8px;">Username</th>
                                <th style="padding: 8px;">Role</th>
                                <th style="padding: 8px;">Created</th>
                            </tr>
                            ${users.results.map(user => `
                                <tr>
                                    <td style="padding: 8px;">${user.id}</td>
                                    <td style="padding: 8px;">${user.email}</td>
                                    <td style="padding: 8px;">${user.username || 'NULL'}</td>
                                    <td style="padding: 8px;">${user.role}</td>
                                    <td style="padding: 8px;">${user.created_at}</td>
                                </tr>
                            `).join('')}
                        </table>
                    ` : '<p>No users found in database.</p>'}
                    
                    <hr>
                    <p><strong>Environment:</strong> ${env.ENVIRONMENT || 'Unknown'}</p>
                    <p><strong>Admin Email Config:</strong> ${env.ADMIN_EMAIL}</p>
                    <p><strong>Database ID:</strong> ${env.DB ? 'Connected' : 'Not Connected'}</p>
                    
                    <a href="/" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">← Back to StriveTrack</a>
                </body>
            </html>
        `, {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });
        
    } catch (error) {
        console.error('Debug users error:', error);
        return new Response(`
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                    <h1>❌ Database Debug Failed</h1>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p>Stack: <pre>${error.stack}</pre></p>
                    <a href="/" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">← Back to StriveTrack</a>
                </body>
            </html>
        `, {
            status: 500,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}