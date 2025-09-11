// Admin initialization endpoint - creates admin user if it doesn't exist
import { getUserByEmail, createUser } from '../utils/database.js';

export async function onRequestGet(context) {
    const { env } = context;
    
    try {
        // Check if admin user already exists
        const adminUser = await getUserByEmail(env.ADMIN_EMAIL, env);
        
        if (adminUser) {
            return new Response(`
                <html>
                    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                        <h1>✅ Admin User Already Exists</h1>
                        <p><strong>Email:</strong> ${env.ADMIN_EMAIL}</p>
                        <p><strong>Role:</strong> ${adminUser.role}</p>
                        <p><strong>Status:</strong> Ready to login</p>
                        <hr>
                        <p>You can now login with:</p>
                        <ul>
                            <li><strong>Email:</strong> ${env.ADMIN_EMAIL}</li>
                            <li><strong>Password:</strong> ${env.ADMIN_PASSWORD}</li>
                        </ul>
                        <a href="/" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">← Back to StriveTrack</a>
                    </body>
                </html>
            `, {
                status: 200,
                headers: { 'Content-Type': 'text/html' }
            });
        }
        
        // Create admin user
        const userData = {
            email: env.ADMIN_EMAIL,
            password: env.ADMIN_PASSWORD,
            username: 'admin'
        };
        
        const user = await createUser(userData, env);
        
        return new Response(`
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                    <h1>🎉 Admin User Created Successfully!</h1>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Username:</strong> ${user.username || 'admin'}</p>
                    <p><strong>Role:</strong> ${user.role}</p>
                    <p><strong>User ID:</strong> ${user.id}</p>
                    <hr>
                    <p>You can now login with:</p>
                    <ul>
                        <li><strong>Email:</strong> ${env.ADMIN_EMAIL}</li>
                        <li><strong>Password:</strong> ${env.ADMIN_PASSWORD}</li>
                    </ul>
                    <p style="color: #059669;">Admin user has been initialized and is ready to use!</p>
                    <a href="/" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">← Go to StriveTrack Login</a>
                </body>
            </html>
        `, {
            status: 201,
            headers: { 'Content-Type': 'text/html' }
        });
        
    } catch (error) {
        console.error('Admin initialization error:', error);
        return new Response(`
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                    <h1>❌ Admin Initialization Failed</h1>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p>Please check the server logs for more details.</p>
                    <a href="/" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">← Back to StriveTrack</a>
                </body>
            </html>
        `, {
            status: 500,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}