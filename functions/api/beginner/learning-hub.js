// Learning Hub API for beginner users
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

        // Get learning content organized by category
        const learningContent = {
            exercise_tutorials: [
                {
                    id: 'squat-basics',
                    title: 'Squat Form Fundamentals',
                    description: 'Master the perfect squat with proper form and technique',
                    video_url: '/videos/squat-tutorial.mp4',
                    duration: '5:30',
                    difficulty: 'beginner',
                    muscle_groups: ['legs', 'glutes'],
                    completed: false
                },
                {
                    id: 'pushup-progression',
                    title: 'Push-Up Progression Guide',
                    description: 'Build up to perfect push-ups with this step-by-step guide',
                    video_url: '/videos/pushup-tutorial.mp4',
                    duration: '4:15',
                    difficulty: 'beginner',
                    muscle_groups: ['chest', 'shoulders', 'triceps'],
                    completed: false
                },
                {
                    id: 'plank-hold',
                    title: 'Plank Form and Variations',
                    description: 'Strengthen your core with proper plank technique',
                    video_url: '/videos/plank-tutorial.mp4',
                    duration: '3:45',
                    difficulty: 'beginner',
                    muscle_groups: ['core'],
                    completed: false
                }
            ],
            safety_tips: [
                {
                    id: 'warmup-importance',
                    title: 'Why Warm-Up Matters',
                    description: 'Learn the importance of warming up before exercise',
                    type: 'article',
                    read_time: '3 min',
                    priority: 'high'
                },
                {
                    id: 'proper-breathing',
                    title: 'Breathing Techniques During Exercise',
                    description: 'Master proper breathing for better performance and safety',
                    type: 'article',
                    read_time: '2 min',
                    priority: 'medium'
                },
                {
                    id: 'rest-recovery',
                    title: 'Rest and Recovery Guidelines',
                    description: 'Understanding when and how to rest for optimal results',
                    type: 'article',
                    read_time: '4 min',
                    priority: 'high'
                }
            ],
            nutrition_basics: [
                {
                    id: 'macros-101',
                    title: 'Macronutrients 101',
                    description: 'Understanding carbs, proteins, and fats for beginners',
                    type: 'interactive',
                    duration: '10 min',
                    completed: false
                },
                {
                    id: 'hydration-guide',
                    title: 'Hydration for Fitness',
                    description: 'How much water do you really need?',
                    type: 'article',
                    read_time: '2 min',
                    completed: false
                },
                {
                    id: 'meal-timing',
                    title: 'Pre and Post Workout Nutrition',
                    description: 'What to eat before and after your workouts',
                    type: 'guide',
                    read_time: '5 min',
                    completed: false
                }
            ],
            beginner_programs: [
                {
                    id: 'week-1-starter',
                    title: '7-Day Beginner Starter Program',
                    description: 'Your first week of structured fitness',
                    duration: '1 week',
                    workouts_per_week: 3,
                    time_per_workout: '20-30 min',
                    equipment: 'bodyweight',
                    enrolled: false
                },
                {
                    id: 'home-workout-basics',
                    title: '30-Day Home Workout Challenge',
                    description: 'Build strength at home with no equipment needed',
                    duration: '30 days',
                    workouts_per_week: 4,
                    time_per_workout: '25-35 min',
                    equipment: 'bodyweight',
                    enrolled: false
                }
            ]
        };

        // Get user progress on learning content (create table if it doesn't exist)
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS user_learning_progress (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                content_id TEXT NOT NULL,
                progress_percentage INTEGER DEFAULT 0,
                completed_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                UNIQUE(user_id, content_id)
            )
        `).run();
        
        const userProgress = await env.DB.prepare(`
            SELECT content_id, completed_at, progress_percentage
            FROM user_learning_progress
            WHERE user_id = ?
        `).bind(user.id).all();

        const progressMap = {};
        if (userProgress.results) {
            userProgress.results.forEach(progress => {
                progressMap[progress.content_id] = {
                    completed: !!progress.completed_at,
                    progress: progress.progress_percentage || 0,
                    completed_at: progress.completed_at
                };
            });
        }

        // Update completion status based on user progress
        Object.keys(learningContent).forEach(category => {
            learningContent[category] = learningContent[category].map(item => ({
                ...item,
                ...progressMap[item.id]
            }));
        });

        return new Response(JSON.stringify({
            learning_content: learningContent,
            user_stats: {
                total_tutorials: Object.values(learningContent).flat().length,
                completed_tutorials: Object.values(progressMap).filter(p => p.completed).length,
                total_time_spent: calculateTotalTimeSpent(progressMap),
                current_streak: await getCurrentLearningStreak(user.id, env)
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Learning hub error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Mark learning content as completed
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
        const { content_id, progress_percentage = 100 } = body;
        
        if (!content_id) {
            return new Response(JSON.stringify({ 
                error: 'Content ID is required' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create learning progress table if it doesn't exist
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS user_learning_progress (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                content_id TEXT NOT NULL,
                progress_percentage INTEGER DEFAULT 0,
                completed_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                UNIQUE(user_id, content_id)
            )
        `).run();

        const { generateId } = await import('../../utils/id-generator.js');
        const progressId = generateId('generic');
        const isCompleted = progress_percentage >= 100;
        
        // Insert or update progress
        await env.DB.prepare(`
            INSERT INTO user_learning_progress (
                id, user_id, content_id, progress_percentage, completed_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, content_id) DO UPDATE SET
                progress_percentage = ?,
                completed_at = CASE WHEN ? >= 100 THEN CURRENT_TIMESTAMP ELSE completed_at END,
                updated_at = CURRENT_TIMESTAMP
        `).bind(
            progressId, user.id, content_id, progress_percentage,
            isCompleted ? new Date().toISOString() : null,
            progress_percentage, progress_percentage
        ).run();

        // Award points for completion
        if (isCompleted) {
            await env.DB.prepare('UPDATE users SET points = points + ? WHERE id = ?')
                .bind(5, user.id).run(); // 5 points per tutorial completed
        }

        return new Response(JSON.stringify({
            message: 'Progress updated successfully',
            points_awarded: isCompleted ? 5 : 0
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Learning progress update error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function calculateTotalTimeSpent(progressMap) {
    // Calculate estimated time spent based on progress
    const timeEstimates = {
        'squat-basics': 5.5,
        'pushup-progression': 4.25,
        'plank-hold': 3.75,
        'macros-101': 10,
        'week-1-starter': 150, // 20-30 min * 7 days
        'home-workout-basics': 900 // 25-35 min * 30 days
    };
    
    let totalMinutes = 0;
    Object.entries(progressMap).forEach(([contentId, progress]) => {
        const timeEstimate = timeEstimates[contentId] || 3;
        totalMinutes += (timeEstimate * (progress.progress || 0)) / 100;
    });
    
    return Math.round(totalMinutes);
}

async function getCurrentLearningStreak(userId, env) {
    try {
        // Get learning activity for the last 30 days
        const activity = await env.DB.prepare(`
            SELECT DATE(updated_at) as activity_date
            FROM user_learning_progress
            WHERE user_id = ? AND updated_at >= DATE('now', '-30 days')
            GROUP BY DATE(updated_at)
            ORDER BY activity_date DESC
        `).bind(userId).all();
        
        if (!activity.results || activity.results.length === 0) return 0;
        
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        for (const entry of activity.results) {
            const activityDate = new Date(entry.activity_date);
            const daysDiff = Math.floor((currentDate - activityDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === streak) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    } catch (error) {
        console.error('Error calculating learning streak:', error);
        return 0;
    }
}