// Client management API for coaches/trainers
import { getCurrentUser } from '../../utils/auth.js';

export async function onRequestGet(context) {
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

        // Verify user is a coach
        const userDetails = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
            .bind(user.id).first();
            
        if (userDetails.user_type !== 'coach') {
            return new Response(JSON.stringify({ 
                error: 'Coach access required' 
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get coach's clients with their progress data
        const clients = await env.DB.prepare(`
            SELECT 
                u.id,
                u.name,
                u.email,
                u.user_type,
                u.points,
                u.created_at,
                cr.status as relationship_status,
                cr.start_date,
                cr.notes as coach_notes,
                COUNT(DISTINCT h.id) as total_habits,
                COUNT(DISTINCT hc.id) as total_completions,
                COUNT(DISTINCT m.id) as total_media,
                MAX(hc.completed_at) as last_activity,
                COUNT(DISTINCT CASE WHEN hc.completed_at >= DATE('now', '-7 days') THEN hc.id END) as weekly_completions
            FROM coaching_relationships cr
            JOIN users u ON cr.client_id = u.id
            LEFT JOIN habits h ON u.id = h.user_id
            LEFT JOIN habit_completions hc ON h.id = hc.habit_id
            LEFT JOIN media_uploads m ON u.id = m.user_id
            WHERE cr.coach_id = ? AND cr.status = 'active'
            GROUP BY u.id, cr.id
            ORDER BY cr.start_date DESC
        `).bind(user.id).all();

        const clientsData = clients.results || [];

        // Get coach's performance metrics
        const coachStats = await getCoachStats(user.id, env);

        // Get recent client activities
        const recentActivities = await getRecentClientActivities(user.id, env);

        return new Response(JSON.stringify({
            clients: clientsData.map(client => ({
                ...client,
                engagement_score: calculateEngagementScore(client),
                progress_trend: calculateProgressTrend(client),
                needs_attention: needsAttention(client)
            })),
            coach_stats: coachStats,
            recent_activities: recentActivities,
            summary: {
                total_clients: clientsData.length,
                active_clients: clientsData.filter(c => isActiveClient(c)).length,
                clients_needing_attention: clientsData.filter(c => needsAttention(c)).length
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Client management error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Add a new client
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
        const { client_email, notes } = body;
        
        if (!client_email) {
            return new Response(JSON.stringify({ 
                error: 'Client email is required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if client exists in the system
        const client = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
            .bind(client_email).first();
            
        if (!client) {
            return new Response(JSON.stringify({ 
                error: 'Client not found. They must register first.' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if relationship already exists
        const existingRelationship = await env.DB.prepare(`
            SELECT * FROM coaching_relationships 
            WHERE coach_id = ? AND client_id = ?
        `).bind(user.id, client.id).first();
        
        if (existingRelationship) {
            return new Response(JSON.stringify({ 
                error: 'Client relationship already exists' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create coaching relationship
        const { generateId } = await import('../../utils/id-generator.js');
        const relationshipId = generateId('generic');
        
        await env.DB.prepare(`
            INSERT INTO coaching_relationships (
                id, coach_id, client_id, status, notes, start_date
            ) VALUES (?, ?, ?, 'active', ?, CURRENT_TIMESTAMP)
        `).bind(relationshipId, user.id, client.id, notes || '').run();

        return new Response(JSON.stringify({
            message: 'Client added successfully',
            relationship_id: relationshipId,
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
                user_type: client.user_type
            }
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Add client error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function getCoachStats(coachId, env) {
    try {
        // Get total clients over time
        const clientGrowth = await env.DB.prepare(`
            SELECT 
                DATE(start_date) as date,
                COUNT(*) as new_clients
            FROM coaching_relationships
            WHERE coach_id = ? AND start_date >= DATE('now', '-30 days')
            GROUP BY DATE(start_date)
            ORDER BY date DESC
        `).bind(coachId).all();

        // Get client retention rate
        const totalClients = await env.DB.prepare(`
            SELECT COUNT(*) as count FROM coaching_relationships WHERE coach_id = ?
        `).bind(coachId).first();

        const activeClients = await env.DB.prepare(`
            SELECT COUNT(*) as count FROM coaching_relationships 
            WHERE coach_id = ? AND status = 'active'
        `).bind(coachId).first();

        const retentionRate = totalClients.count > 0 ? 
            (activeClients.count / totalClients.count) * 100 : 0;

        // Get average client progress
        const avgClientProgress = await env.DB.prepare(`
            SELECT 
                AVG(u.points) as avg_points,
                AVG(
                    CASE WHEN hc.completed_at >= DATE('now', '-7 days') THEN 1 ELSE 0 END
                ) as avg_weekly_activity
            FROM coaching_relationships cr
            JOIN users u ON cr.client_id = u.id
            LEFT JOIN habits h ON u.id = h.user_id
            LEFT JOIN habit_completions hc ON h.id = hc.habit_id
            WHERE cr.coach_id = ? AND cr.status = 'active'
        `).bind(coachId).first();

        return {
            total_clients: totalClients.count,
            active_clients: activeClients.count,
            retention_rate: Math.round(retentionRate),
            avg_client_points: Math.round(avgClientProgress.avg_points || 0),
            avg_weekly_activity: Math.round((avgClientProgress.avg_weekly_activity || 0) * 100),
            client_growth: clientGrowth.results || []
        };
        
    } catch (error) {
        console.error('Coach stats error:', error);
        return {
            total_clients: 0,
            active_clients: 0,
            retention_rate: 0,
            avg_client_points: 0,
            avg_weekly_activity: 0,
            client_growth: []
        };
    }
}

async function getRecentClientActivities(coachId, env) {
    try {
        const activities = await env.DB.prepare(`
            SELECT 
                u.name as client_name,
                u.id as client_id,
                'habit_completion' as activity_type,
                h.name as activity_description,
                hc.completed_at as activity_time,
                hc.notes
            FROM coaching_relationships cr
            JOIN users u ON cr.client_id = u.id
            JOIN habits h ON u.id = h.user_id
            JOIN habit_completions hc ON h.id = hc.habit_id
            WHERE cr.coach_id = ? AND cr.status = 'active' 
                AND hc.completed_at >= DATE('now', '-7 days')
            
            UNION ALL
            
            SELECT 
                u.name as client_name,
                u.id as client_id,
                'media_upload' as activity_type,
                'Uploaded ' || m.media_type || ' photo' as activity_description,
                m.uploaded_at as activity_time,
                m.description as notes
            FROM coaching_relationships cr
            JOIN users u ON cr.client_id = u.id
            JOIN media_uploads m ON u.id = m.user_id
            WHERE cr.coach_id = ? AND cr.status = 'active'
                AND m.uploaded_at >= DATE('now', '-7 days')
                
            ORDER BY activity_time DESC
            LIMIT 20
        `).bind(coachId, coachId).all();

        return activities.results || [];
        
    } catch (error) {
        console.error('Recent activities error:', error);
        return [];
    }
}

function calculateEngagementScore(client) {
    const daysActive = Math.min(30, 
        Math.floor((Date.now() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24))
    );
    
    if (daysActive === 0) return 0;
    
    const completionsPerDay = client.total_completions / daysActive;
    const mediaPerWeek = (client.total_media / daysActive) * 7;
    const recentActivity = client.weekly_completions > 0 ? 25 : 0;
    
    let score = (completionsPerDay * 30) + (mediaPerWeek * 10) + recentActivity;
    return Math.min(100, Math.round(score));
}

function calculateProgressTrend(client) {
    const recentActivity = client.weekly_completions;
    const avgActivity = client.total_completions / 
        Math.max(1, Math.floor((Date.now() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24 * 7)));
    
    if (recentActivity > avgActivity * 1.2) return 'improving';
    if (recentActivity < avgActivity * 0.8) return 'declining';
    return 'stable';
}

function needsAttention(client) {
    const daysSinceLastActivity = client.last_activity ? 
        Math.floor((Date.now() - new Date(client.last_activity).getTime()) / (1000 * 60 * 60 * 24)) : 999;
    
    return daysSinceLastActivity > 3 || client.weekly_completions === 0;
}

function isActiveClient(client) {
    const daysSinceLastActivity = client.last_activity ? 
        Math.floor((Date.now() - new Date(client.last_activity).getTime()) / (1000 * 60 * 60 * 24)) : 999;
    
    return daysSinceLastActivity <= 7;
}