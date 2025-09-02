// Advanced analytics API for intermediate users
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

        const url = new URL(request.url);
        const timeframe = url.searchParams.get('timeframe') || '30d'; // 7d, 30d, 90d, 1y
        
        // Get habit completion analytics
        const habitAnalytics = await getHabitAnalytics(user.id, timeframe, env);
        
        // Get progress photo analytics
        const progressAnalytics = await getProgressAnalytics(user.id, timeframe, env);
        
        // Get nutrition analytics (if available)
        const nutritionAnalytics = await getNutritionAnalytics(user.id, timeframe, env);
        
        // Detect plateaus and trends
        const insights = await generateInsights(user.id, timeframe, env);
        
        return new Response(JSON.stringify({
            timeframe: timeframe,
            analytics: {
                habits: habitAnalytics,
                progress: progressAnalytics,
                nutrition: nutritionAnalytics,
                insights: insights
            },
            summary: {
                total_workouts: habitAnalytics.total_completions,
                consistency_score: habitAnalytics.consistency_percentage,
                trend: insights.overall_trend,
                plateau_detected: insights.plateau_detected
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Analytics error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function getHabitAnalytics(userId, timeframe, env) {
    const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const days = daysMap[timeframe] || 30;
    
    try {
        // Get habit completion data
        const completionData = await env.DB.prepare(`
            SELECT 
                DATE(hc.completed_at) as completion_date,
                h.name as habit_name,
                h.id as habit_id,
                COUNT(*) as completions_count
            FROM habit_completions hc
            JOIN habits h ON hc.habit_id = h.id
            WHERE hc.user_id = ? 
                AND hc.completed_at >= DATE('now', '-${days} days')
            GROUP BY DATE(hc.completed_at), h.id
            ORDER BY completion_date DESC
        `).bind(userId).all();
        
        // Get total habits for consistency calculation
        const totalHabits = await env.DB.prepare(`
            SELECT COUNT(*) as count FROM habits WHERE user_id = ?
        `).bind(userId).first();
        
        const results = completionData.results || [];
        const totalCompletions = results.reduce((sum, row) => sum + row.completions_count, 0);
        
        // Calculate daily completion rates
        const dailyStats = {};
        const last7Days = [];
        const currentDate = new Date();
        
        for (let i = 0; i < Math.min(days, 30); i++) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayCompletions = results.filter(r => r.completion_date === dateStr);
            const completionsCount = dayCompletions.reduce((sum, r) => sum + r.completions_count, 0);
            
            dailyStats[dateStr] = {
                date: dateStr,
                completions: completionsCount,
                consistency_rate: totalHabits.count > 0 ? (completionsCount / totalHabits.count) * 100 : 0
            };
            
            if (i < 7) {
                last7Days.push(dailyStats[dateStr]);
            }
        }
        
        // Calculate weekly averages
        const weeklyAverages = calculateWeeklyAverages(Object.values(dailyStats));
        
        // Calculate consistency percentage
        const activeDays = Object.values(dailyStats).filter(day => day.completions > 0).length;
        const consistencyPercentage = (activeDays / days) * 100;
        
        return {
            total_completions: totalCompletions,
            consistency_percentage: Math.round(consistencyPercentage),
            daily_stats: Object.values(dailyStats).reverse(), // Oldest to newest
            weekly_averages: weeklyAverages,
            last_7_days: last7Days.reverse(),
            best_day: getBestDay(dailyStats),
            habit_breakdown: getHabitBreakdown(results)
        };
        
    } catch (error) {
        console.error('Habit analytics error:', error);
        return { error: 'Failed to load habit analytics' };
    }
}

async function getProgressAnalytics(userId, timeframe, env) {
    const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const days = daysMap[timeframe] || 30;
    
    try {
        const progressData = await env.DB.prepare(`
            SELECT 
                DATE(uploaded_at) as upload_date,
                media_type,
                COUNT(*) as uploads_count,
                file_size
            FROM media_uploads
            WHERE user_id = ? 
                AND uploaded_at >= DATE('now', '-${days} days')
            GROUP BY DATE(uploaded_at), media_type
            ORDER BY upload_date DESC
        `).bind(userId).all();
        
        const results = progressData.results || [];
        
        // Analyze upload frequency and types
        const typeBreakdown = {};
        let totalUploads = 0;
        
        results.forEach(row => {
            totalUploads += row.uploads_count;
            if (!typeBreakdown[row.media_type]) {
                typeBreakdown[row.media_type] = 0;
            }
            typeBreakdown[row.media_type] += row.uploads_count;
        });
        
        // Calculate upload frequency trend
        const uploadTrend = calculateUploadTrend(results, days);
        
        return {
            total_uploads: totalUploads,
            upload_frequency: Math.round((totalUploads / days) * 7), // Weekly average
            media_type_breakdown: typeBreakdown,
            upload_trend: uploadTrend,
            most_active_day: getMostActiveUploadDay(results)
        };
        
    } catch (error) {
        console.error('Progress analytics error:', error);
        return { error: 'Failed to load progress analytics' };
    }
}

async function getNutritionAnalytics(userId, timeframe, env) {
    // Placeholder for nutrition analytics
    // In a real implementation, this would analyze nutrition logs
    return {
        entries_logged: Math.floor(Math.random() * 50) + 10,
        avg_calories: 2150,
        macro_balance: {
            protein: 25,
            carbs: 45,
            fats: 30
        },
        consistency_score: Math.floor(Math.random() * 30) + 70
    };
}

async function generateInsights(userId, timeframe, env) {
    try {
        // Analyze trends and detect plateaus
        const recentCompletions = await env.DB.prepare(`
            SELECT 
                DATE(completed_at) as date,
                COUNT(*) as completions
            FROM habit_completions
            WHERE user_id = ? 
                AND completed_at >= DATE('now', '-30 days')
            GROUP BY DATE(completed_at)
            ORDER BY date ASC
        `).bind(userId).all();
        
        const results = recentCompletions.results || [];
        
        if (results.length < 7) {
            return {
                overall_trend: 'insufficient_data',
                plateau_detected: false,
                recommendations: ['Keep logging your activities to get better insights!']
            };
        }
        
        // Calculate trend
        const trend = calculateTrend(results.map(r => r.completions));
        
        // Detect plateau (consistency without improvement)
        const plateauDetected = detectPlateau(results);
        
        // Generate recommendations
        const recommendations = generateRecommendations(trend, plateauDetected, results);
        
        return {
            overall_trend: trend,
            plateau_detected: plateauDetected,
            recommendations: recommendations,
            next_milestone: 'Maintain consistency for 7 more days',
            performance_score: calculatePerformanceScore(results)
        };
        
    } catch (error) {
        console.error('Insights generation error:', error);
        return {
            overall_trend: 'error',
            plateau_detected: false,
            recommendations: ['Unable to generate insights at this time']
        };
    }
}

function calculateWeeklyAverages(dailyStats) {
    const weeks = [];
    const sortedStats = dailyStats.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    for (let i = 0; i < sortedStats.length; i += 7) {
        const weekData = sortedStats.slice(i, i + 7);
        const avgCompletions = weekData.reduce((sum, day) => sum + day.completions, 0) / weekData.length;
        const avgConsistency = weekData.reduce((sum, day) => sum + day.consistency_rate, 0) / weekData.length;
        
        weeks.push({
            week_start: weekData[0].date,
            week_end: weekData[weekData.length - 1].date,
            avg_completions: Math.round(avgCompletions * 10) / 10,
            avg_consistency: Math.round(avgConsistency)
        });
    }
    
    return weeks;
}

function getBestDay(dailyStats) {
    const days = Object.values(dailyStats);
    if (days.length === 0) return null;
    
    return days.reduce((best, current) => 
        current.completions > best.completions ? current : best
    );
}

function getHabitBreakdown(results) {
    const breakdown = {};
    results.forEach(row => {
        if (!breakdown[row.habit_name]) {
            breakdown[row.habit_name] = 0;
        }
        breakdown[row.habit_name] += row.completions_count;
    });
    return breakdown;
}

function calculateUploadTrend(results, days) {
    if (results.length < 2) return 'stable';
    
    const firstHalf = results.slice(0, Math.floor(results.length / 2));
    const secondHalf = results.slice(Math.floor(results.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.uploads_count, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.uploads_count, 0) / secondHalf.length;
    
    const change = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    if (change > 20) return 'increasing';
    if (change < -20) return 'decreasing';
    return 'stable';
}

function getMostActiveUploadDay(results) {
    if (results.length === 0) return null;
    
    return results.reduce((most, current) => 
        current.uploads_count > most.uploads_count ? current : most
    );
}

function calculateTrend(values) {
    if (values.length < 2) return 'insufficient_data';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 15) return 'improving';
    if (change < -15) return 'declining';
    return 'stable';
}

function detectPlateau(results) {
    if (results.length < 14) return false;
    
    // Check if last 14 days show little variation (plateau indicator)
    const last14 = results.slice(-14).map(r => r.completions);
    const avg = last14.reduce((a, b) => a + b, 0) / last14.length;
    const variance = last14.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / last14.length;
    const stdDev = Math.sqrt(variance);
    
    // Low standard deviation indicates plateau
    return stdDev < 1 && avg > 0;
}

function generateRecommendations(trend, plateauDetected, results) {
    const recommendations = [];
    
    if (trend === 'declining') {
        recommendations.push('Consider reducing workout intensity or taking a rest day');
        recommendations.push('Review your goals and make them more achievable');
    } else if (trend === 'improving') {
        recommendations.push('Great progress! Keep up the momentum');
        recommendations.push('Consider adding new challenges to continue growing');
    } else if (plateauDetected) {
        recommendations.push('Mix up your routine with new exercises or variations');
        recommendations.push('Consider increasing workout intensity or duration');
        recommendations.push('Set a new goal to break through the plateau');
    } else {
        recommendations.push('Maintain your current routine - consistency is key');
        recommendations.push('Track additional metrics like sleep or nutrition for better insights');
    }
    
    return recommendations;
}

function calculatePerformanceScore(results) {
    if (results.length === 0) return 0;
    
    const recentAvg = results.slice(-7).reduce((sum, r) => sum + r.completions, 0) / 7;
    const overallAvg = results.reduce((sum, r) => sum + r.completions, 0) / results.length;
    const consistency = results.filter(r => r.completions > 0).length / results.length;
    
    // Score based on recent performance vs overall average and consistency
    const performanceRatio = overallAvg > 0 ? recentAvg / overallAvg : 1;
    const score = (performanceRatio * 50) + (consistency * 50);
    
    return Math.min(100, Math.max(0, Math.round(score)));
}