// StriveTrack 2.0 - Realistic Daily & Weekly Challenges
// Challenges users will actually want to complete and have fun doing

function generateRealisticDailyChallenges() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Realistic, engaging challenges based on actual app features
    const challengeTemplates = {
        0: [ // Sunday - Reflection & Planning
            { 
                id: 'sunday_1', 
                type: 'planning', 
                title: 'Week Ahead Planning', 
                description: 'Set 3 specific goals for the upcoming week', 
                points: 25, 
                icon: '📋',
                color: 'blue',
                difficulty: 'Easy',
                category: 'planning',
                actionable: true
            },
            { 
                id: 'sunday_2', 
                type: 'progress', 
                title: 'Weekly Check-In Photo', 
                description: 'Take a progress photo to document this week', 
                points: 30, 
                icon: '📸',
                color: 'green',
                difficulty: 'Easy',
                category: 'progress',
                actionable: true
            },
            { 
                id: 'sunday_3', 
                type: 'habit', 
                title: 'Habit Review', 
                description: 'Complete at least 2 habits today (rest day routine)', 
                points: 20, 
                icon: '✅',
                color: 'purple',
                difficulty: 'Easy',
                category: 'habits',
                actionable: true
            },
            { 
                id: 'sunday_4', 
                type: 'recovery', 
                title: 'Active Recovery', 
                description: 'Do 15 minutes of stretching, walking, or light activity', 
                points: 25, 
                icon: '🧘‍♂️',
                color: 'teal',
                difficulty: 'Easy',
                category: 'recovery',
                actionable: true
            },
            { 
                id: 'sunday_5', 
                type: 'social', 
                title: 'Motivation Sunday', 
                description: 'Share your week\'s progress or motivate a friend', 
                points: 20, 
                icon: '💬',
                color: 'orange',
                difficulty: 'Easy',
                category: 'social',
                actionable: true
            }
        ],
        1: [ // Monday - Fresh Start Motivation  
            { 
                id: 'monday_1', 
                type: 'habit', 
                title: 'Monday Momentum', 
                description: 'Complete your first 3 habits of the week', 
                points: 35, 
                icon: '🚀',
                color: 'red',
                difficulty: 'Medium',
                category: 'habits',
                actionable: true
            },
            { 
                id: 'monday_2', 
                type: 'progress', 
                title: 'New Week, New You', 
                description: 'Upload a motivational progress photo or video', 
                points: 30, 
                icon: '💪',
                color: 'green',
                difficulty: 'Easy',
                category: 'progress',
                actionable: true
            },
            { 
                id: 'monday_3', 
                type: 'goal', 
                title: 'Goal Check-In', 
                description: 'Update progress on one of your active goals', 
                points: 25, 
                icon: '🎯',
                color: 'blue',
                difficulty: 'Easy',
                category: 'goals',
                actionable: true
            },
            { 
                id: 'monday_4', 
                type: 'workout', 
                title: 'Monday Mover', 
                description: 'Complete a 20+ minute workout or physical activity', 
                points: 40, 
                icon: '🏋️‍♂️',
                color: 'orange',
                difficulty: 'Medium',
                category: 'fitness',
                actionable: true
            },
            { 
                id: 'monday_5', 
                type: 'mindset', 
                title: 'Positive Monday', 
                description: 'Write down 3 things you\'re grateful for or excited about', 
                points: 15, 
                icon: '😊',
                color: 'yellow',
                difficulty: 'Easy',
                category: 'mindset',
                actionable: true
            }
        ],
        2: [ // Tuesday - Consistency Building
            { 
                id: 'tuesday_1', 
                type: 'habit', 
                title: 'Consistency Champion', 
                description: 'Complete ALL your scheduled habits for today', 
                points: 50, 
                icon: '🔥',
                color: 'red',
                difficulty: 'Hard',
                category: 'habits',
                actionable: true
            },
            { 
                id: 'tuesday_2', 
                type: 'nutrition', 
                title: 'Protein Power', 
                description: 'Include protein in at least 3 meals/snacks today', 
                points: 25, 
                icon: '🥚',
                color: 'orange',
                difficulty: 'Medium',
                category: 'nutrition',
                actionable: true
            },
            { 
                id: 'tuesday_3', 
                type: 'cardio', 
                title: 'Heart Rate Hero', 
                description: 'Do 25+ minutes of cardio (running, cycling, dancing, etc.)', 
                points: 35, 
                icon: '❤️',
                color: 'red',
                difficulty: 'Medium',
                category: 'fitness',
                actionable: true
            },
            { 
                id: 'tuesday_4', 
                type: 'hydration', 
                title: 'Hydration Station', 
                description: 'Drink 8+ glasses of water throughout the day', 
                points: 20, 
                icon: '💧',
                color: 'blue',
                difficulty: 'Easy',
                category: 'health',
                actionable: true
            },
            { 
                id: 'tuesday_5', 
                type: 'progress', 
                title: 'Workout Selfie', 
                description: 'Take a photo before, during, or after your workout', 
                points: 20, 
                icon: '🤳',
                color: 'green',
                difficulty: 'Easy',
                category: 'progress',
                actionable: true
            }
        ],
        3: [ // Wednesday - Midweek Push
            { 
                id: 'wednesday_1', 
                type: 'strength', 
                title: 'Midweek Muscle', 
                description: 'Complete a strength training session (weights, bodyweight, resistance)', 
                points: 40, 
                icon: '💪',
                color: 'orange',
                difficulty: 'Medium',
                category: 'fitness',
                actionable: true
            },
            { 
                id: 'wednesday_2', 
                type: 'habit', 
                title: 'Habit Streak Builder', 
                description: 'Complete habits for 3 consecutive days (including today)', 
                points: 45, 
                icon: '⚡',
                color: 'purple',
                difficulty: 'Medium',
                category: 'habits',
                actionable: true
            },
            { 
                id: 'wednesday_3', 
                type: 'achievement', 
                title: 'Achievement Hunter', 
                description: 'Unlock a new achievement today through your activities', 
                points: 50, 
                icon: '🏆',
                color: 'gold',
                difficulty: 'Hard',
                category: 'achievements',
                actionable: true
            },
            { 
                id: 'wednesday_4', 
                type: 'steps', 
                title: 'Step Counter', 
                description: 'Take 8,000+ steps today (walk, run, or daily activities)', 
                points: 30, 
                icon: '👣',
                color: 'green',
                difficulty: 'Medium',
                category: 'fitness',
                actionable: true
            },
            { 
                id: 'wednesday_5', 
                type: 'video', 
                title: 'Progress Video', 
                description: 'Record a short progress video showing your improvement', 
                points: 35, 
                icon: '🎬',
                color: 'purple',
                difficulty: 'Medium',
                category: 'progress',
                actionable: true
            }
        ],
        4: [ // Thursday - Challenge Yourself
            { 
                id: 'thursday_1', 
                type: 'personal_best', 
                title: 'Personal Best Push', 
                description: 'Try to beat a personal record (reps, time, distance, weight)', 
                points: 60, 
                icon: '🏅',
                color: 'gold',
                difficulty: 'Hard',
                category: 'fitness',
                actionable: true
            },
            { 
                id: 'thursday_2', 
                type: 'new_activity', 
                title: 'Try Something New', 
                description: 'Do a workout or activity you haven\'t done in 2+ weeks', 
                points: 35, 
                icon: '🆕',
                color: 'teal',
                difficulty: 'Medium',
                category: 'fitness',
                actionable: true
            },
            { 
                id: 'thursday_3', 
                type: 'flexibility', 
                title: 'Flexibility Focus', 
                description: 'Spend 15+ minutes on stretching, yoga, or mobility work', 
                points: 25, 
                icon: '🤸‍♀️',
                color: 'purple',
                difficulty: 'Easy',
                category: 'fitness',
                actionable: true
            },
            { 
                id: 'thursday_4', 
                type: 'meal_prep', 
                title: 'Healthy Prep', 
                description: 'Prepare a healthy meal or snack for tomorrow', 
                points: 25, 
                icon: '🥗',
                color: 'green',
                difficulty: 'Easy',
                category: 'nutrition',
                actionable: true
            },
            { 
                id: 'thursday_5', 
                type: 'motivation', 
                title: 'Inspire Others', 
                description: 'Share a tip, photo, or encouragement with the community', 
                points: 20, 
                icon: '💫',
                color: 'yellow',
                difficulty: 'Easy',
                category: 'social',
                actionable: true
            }
        ],
        5: [ // Friday - Strong Finish
            { 
                id: 'friday_1', 
                type: 'habit', 
                title: 'Week Strong Finish', 
                description: 'Complete all your remaining weekly habits', 
                points: 50, 
                icon: '🏁',
                color: 'red',
                difficulty: 'Hard',
                category: 'habits',
                actionable: true
            },
            { 
                id: 'friday_2', 
                type: 'energy', 
                title: 'Energy Boost', 
                description: 'Do 30+ minutes of high-energy exercise (dancing, HIIT, sports)', 
                points: 45, 
                icon: '⚡',
                color: 'orange',
                difficulty: 'Medium',
                category: 'fitness',
                actionable: true
            },
            { 
                id: 'friday_3', 
                type: 'transformation', 
                title: 'Weekly Transformation', 
                description: 'Upload a before/after comparison from this week', 
                points: 40, 
                icon: '🔄',
                color: 'green',
                difficulty: 'Medium',
                category: 'progress',
                actionable: true
            },
            { 
                id: 'friday_4', 
                type: 'social', 
                title: 'Weekend Planner', 
                description: 'Plan an active weekend activity or invite a friend to join you', 
                points: 25, 
                icon: '🎉',
                color: 'purple',
                difficulty: 'Easy',
                category: 'social',
                actionable: true
            },
            { 
                id: 'friday_5', 
                type: 'celebration', 
                title: 'Weekly Wins', 
                description: 'Document 3 things you accomplished this week', 
                points: 20, 
                icon: '🎊',
                color: 'yellow',
                difficulty: 'Easy',
                category: 'mindset',
                actionable: true
            }
        ],
        6: [ // Saturday - Active Fun
            { 
                id: 'saturday_1', 
                type: 'outdoor', 
                title: 'Great Outdoors', 
                description: 'Spend 30+ minutes doing outdoor physical activity', 
                points: 35, 
                icon: '🌞',
                color: 'orange',
                difficulty: 'Medium',
                category: 'fitness',
                actionable: true
            },
            { 
                id: 'saturday_2', 
                type: 'fun_fitness', 
                title: 'Fun Fitness', 
                description: 'Do a fun physical activity (sports, dancing, hiking, swimming)', 
                points: 40, 
                icon: '🎯',
                color: 'teal',
                difficulty: 'Medium',
                category: 'fitness',
                actionable: true
            },
            { 
                id: 'saturday_3', 
                type: 'social_workout', 
                title: 'Social Sweat', 
                description: 'Exercise with a friend, family member, or group', 
                points: 45, 
                icon: '👫',
                color: 'purple',
                difficulty: 'Medium',
                category: 'social',
                actionable: true
            },
            { 
                id: 'saturday_4', 
                type: 'long_workout', 
                title: 'Saturday Warrior', 
                description: 'Complete a 45+ minute workout session', 
                points: 50, 
                icon: '⚔️',
                color: 'red',
                difficulty: 'Hard',
                category: 'fitness',
                actionable: true
            },
            { 
                id: 'saturday_5', 
                type: 'adventure', 
                title: 'Weekend Adventure', 
                description: 'Try a new location for your workout (park, trail, gym, etc.)', 
                points: 30, 
                icon: '🗺️',
                color: 'blue',
                difficulty: 'Easy',
                category: 'fitness',
                actionable: true
            }
        ]
    };
    
    return challengeTemplates[dayOfWeek] || challengeTemplates[1];
}

function generateRealisticWeeklyChallenges() {
    return [
        {
            id: 'weekly_consistency',
            title: '🔥 7-Day Habit Streak',
            description: 'Complete at least 2 habits every day for 7 consecutive days. Build that consistency muscle!',
            points: 200,
            icon: '🔥',
            progress: 0,
            target: '7 days',
            current: '0 days',
            difficulty: 'Medium',
            daysLeft: 7,
            completed: false,
            type: 'habits',
            actionable: true,
            motivating: true
        },
        {
            id: 'weekly_documenter',
            title: '📸 Progress Photo Challenge',
            description: 'Upload 3 progress photos this week - workout selfies, transformation shots, or achievement moments!',
            points: 150,
            icon: '📸',
            progress: 0,
            target: '3 photos',
            current: '0 photos',
            difficulty: 'Easy',
            daysLeft: 7,
            completed: false,
            type: 'progress',
            actionable: true,
            motivating: true
        },
        {
            id: 'weekly_strength',
            title: '💪 Strength Week Challenge',
            description: 'Complete 4 strength training sessions this week (weights, bodyweight, resistance bands)',
            points: 250,
            icon: '💪',
            progress: 0,
            target: '4 sessions',
            current: '0 sessions',
            difficulty: 'Hard',
            daysLeft: 7,
            completed: false,
            type: 'fitness',
            actionable: true,
            motivating: true
        },
        {
            id: 'weekly_cardio',
            title: '❤️ Cardio Champion',
            description: 'Get your heart pumping! Complete 150+ minutes of cardio this week (any type counts)',
            points: 200,
            icon: '❤️',
            progress: 0,
            target: '150 minutes',
            current: '0 minutes',
            difficulty: 'Medium',
            daysLeft: 7,
            completed: false,
            type: 'fitness',
            actionable: true,
            motivating: true
        },
        {
            id: 'weekly_social',
            title: '🤝 Social Fitness Challenge',
            description: 'Work out with others! Exercise with friends, join a class, or motivate 3 community members',
            points: 180,
            icon: '🤝',
            progress: 0,
            target: '3 interactions',
            current: '0 interactions',
            difficulty: 'Medium',
            daysLeft: 7,
            completed: false,
            type: 'social',
            actionable: true,
            motivating: true
        },
        {
            id: 'weekly_goals',
            title: '🎯 Goal Achiever',
            description: 'Make significant progress on 2 of your goals - update them daily and push forward!',
            points: 220,
            icon: '🎯',
            progress: 0,
            target: '2 goals',
            current: '0 goals',
            difficulty: 'Medium',
            daysLeft: 7,
            completed: false,
            type: 'goals',
            actionable: true,
            motivating: true
        },
        {
            id: 'weekly_transformation',
            title: '🔄 Transformation Documentation',
            description: 'Document your weekly transformation! Upload before/after workout photos or weekly comparison',
            points: 300,
            icon: '🔄',
            progress: 0,
            target: '1 transformation set',
            current: '0 sets',
            difficulty: 'Hard',
            daysLeft: 7,
            completed: false,
            type: 'progress',
            actionable: true,
            motivating: true
        },
        {
            id: 'weekly_explorer',
            title: '🗺️ Fitness Explorer',
            description: 'Try 3 different types of physical activities this week - mix it up and have fun!',
            points: 175,
            icon: '🗺️',
            progress: 0,
            target: '3 activities',
            current: '0 activities',
            difficulty: 'Medium',
            daysLeft: 7,
            completed: false,
            type: 'fitness',
            actionable: true,
            motivating: true
        }
    ];
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateRealisticDailyChallenges,
        generateRealisticWeeklyChallenges
    };
}