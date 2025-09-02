// User dashboard configuration endpoint - returns role-specific layout
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

        // Get user details including profile data
        const userDetails = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
            .bind(user.id).first();
        
        if (!userDetails) {
            return new Response(JSON.stringify({ 
                error: 'User not found' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const userType = userDetails.user_type || 'beginner';
        const dashboardConfig = getRoleBasedDashboardConfig(userType);
        
        return new Response(JSON.stringify({
            user: {
                id: userDetails.id,
                name: userDetails.name,
                email: userDetails.email,
                user_type: userType,
                points: userDetails.points,
                onboarding_completed: userDetails.onboarding_completed
            },
            dashboard: dashboardConfig,
            features: getRoleBasedFeatures(userType)
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Dashboard config error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function getRoleBasedDashboardConfig(userType) {
    const baseSections = [
        { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-chart-line' },
        { id: 'habits', name: 'Habits & Goals', icon: 'fas fa-target' },
        { id: 'nutrition', name: 'Nutrition', icon: 'fas fa-apple-alt' },
        { id: 'achievements', name: 'Achievements', icon: 'fas fa-trophy' },
        { id: 'progress', name: 'Progress Gallery', icon: 'fas fa-images' }
    ];
    
    let additionalSections = [];
    let widgets = [];
    
    switch (userType) {
        case 'beginner':
            additionalSections = [
                { id: 'learning_hub', name: 'Learning Hub', icon: 'fas fa-graduation-cap' },
                { id: 'guided_workouts', name: 'Guided Workouts', icon: 'fas fa-play-circle' },
                { id: 'milestones', name: 'Milestones', icon: 'fas fa-flag-checkered' },
                { id: 'buddy_system', name: 'Find Workout Buddy', icon: 'fas fa-users' }
            ];
            widgets = [
                { id: 'progress_streak', name: 'Current Streak', type: 'counter' },
                { id: 'next_milestone', name: 'Next Milestone', type: 'progress' },
                { id: 'daily_tip', name: 'Daily Tip', type: 'info' },
                { id: 'form_check', name: 'Form Check', type: 'action' }
            ];
            break;
            
        case 'intermediate':
            additionalSections = [
                { id: 'analytics', name: 'Advanced Analytics', icon: 'fas fa-chart-bar' },
                { id: 'workout_variations', name: 'Workout Variations', icon: 'fas fa-exchange-alt' },
                { id: 'challenges', name: 'Challenges', icon: 'fas fa-medal' },
                { id: 'integrations', name: 'App Integrations', icon: 'fas fa-link' }
            ];
            widgets = [
                { id: 'trend_analysis', name: 'Trend Analysis', type: 'chart' },
                { id: 'plateau_detection', name: 'Plateau Alert', type: 'warning' },
                { id: 'goal_optimizer', name: 'Goal Optimizer', type: 'suggestion' },
                { id: 'weekly_summary', name: 'Weekly Summary', type: 'stats' }
            ];
            break;
            
        case 'advanced':
            additionalSections = [
                { id: 'performance', name: 'Performance Metrics', icon: 'fas fa-tachometer-alt' },
                { id: 'program_builder', name: 'Program Builder', icon: 'fas fa-cogs' },
                { id: 'biometrics', name: 'Biometric Tracking', icon: 'fas fa-heartbeat' },
                { id: 'mentorship', name: 'Mentorship', icon: 'fas fa-chalkboard-teacher' }
            ];
            widgets = [
                { id: 'performance_metrics', name: 'Performance Dashboard', type: 'metrics' },
                { id: 'recovery_status', name: 'Recovery Status', type: 'health' },
                { id: 'training_load', name: 'Training Load', type: 'gauge' },
                { id: 'vo2_max', name: 'VO2 Max Tracking', type: 'trend' }
            ];
            break;
            
        case 'competition':
            additionalSections = [
                { id: 'competitions', name: 'Competition Calendar', icon: 'fas fa-calendar-alt' },
                { id: 'peak_timing', name: 'Peak Timing', icon: 'fas fa-mountain' },
                { id: 'performance_prediction', name: 'Performance Prediction', icon: 'fas fa-crystal-ball' },
                { id: 'team_management', name: 'Team Management', icon: 'fas fa-users-cog' }
            ];
            widgets = [
                { id: 'next_competition', name: 'Next Competition', type: 'countdown' },
                { id: 'performance_prediction', name: 'Meet Predictions', type: 'prediction' },
                { id: 'training_phase', name: 'Training Phase', type: 'phase' },
                { id: 'competition_history', name: 'Competition History', type: 'timeline' }
            ];
            break;
            
        case 'coach':
            additionalSections = [
                { id: 'clients', name: 'Client Management', icon: 'fas fa-users' },
                { id: 'programs', name: 'Program Templates', icon: 'fas fa-clipboard-list' },
                { id: 'business_tools', name: 'Business Tools', icon: 'fas fa-briefcase' },
                { id: 'resources', name: 'Coaching Resources', icon: 'fas fa-book-open' }
            ];
            widgets = [
                { id: 'client_overview', name: 'Client Overview', type: 'summary' },
                { id: 'schedule', name: 'Today\'s Schedule', type: 'calendar' },
                { id: 'revenue_metrics', name: 'Revenue Metrics', type: 'financial' },
                { id: 'client_progress', name: 'Client Progress', type: 'multi_progress' }
            ];
            break;
    }
    
    return {
        sections: [...baseSections, ...additionalSections],
        widgets: widgets,
        layout: {
            primary_sections: baseSections.map(s => s.id),
            secondary_sections: additionalSections.map(s => s.id),
            widget_layout: getWidgetLayout(userType)
        }
    };
}

function getRoleBasedFeatures(userType) {
    const baseFeatures = [
        'habit_tracking', 'goal_setting', 'nutrition_logging', 
        'progress_photos', 'achievement_system', 'social_features'
    ];
    
    const roleFeatures = {
        'beginner': [...baseFeatures, 'guided_tutorials', 'form_assistance', 'milestone_tracking', 'buddy_matching'],
        'intermediate': [...baseFeatures, 'advanced_analytics', 'workout_variations', 'challenge_creation', 'app_integrations'],
        'advanced': [...baseFeatures, 'performance_analytics', 'program_creation', 'biometric_sync', 'mentorship_tools'],
        'competition': [...baseFeatures, 'competition_tracking', 'peak_timing', 'performance_prediction', 'team_features'],
        'coach': [...baseFeatures, 'client_management', 'program_templates', 'business_analytics', 'coaching_tools']
    };
    
    return roleFeatures[userType] || baseFeatures;
}

function getWidgetLayout(userType) {
    // Define responsive widget layouts for different user types
    const layouts = {
        'beginner': { columns: 2, priority: ['progress_streak', 'next_milestone', 'daily_tip'] },
        'intermediate': { columns: 3, priority: ['trend_analysis', 'plateau_detection', 'goal_optimizer'] },
        'advanced': { columns: 4, priority: ['performance_metrics', 'recovery_status', 'training_load'] },
        'competition': { columns: 2, priority: ['next_competition', 'performance_prediction', 'training_phase'] },
        'coach': { columns: 3, priority: ['client_overview', 'schedule', 'revenue_metrics'] }
    };
    
    return layouts[userType] || layouts['beginner'];
}