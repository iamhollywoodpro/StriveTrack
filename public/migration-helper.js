// StriveTrack Migration Helper
// Helps migrate data from localStorage to Supabase

class MigrationHelper {
    static getSupabaseClient() {
        // Get or initialize the Supabase client
        const client = SupabaseServices.initialize();
        if (!client) {
            throw new Error('Supabase client not available');
        }
        return client;
    }

    static async migrateUserData(currentUser) {
        if (!currentUser || !currentUser.id) {
            console.log('No user to migrate');
            return;
        }

        console.log('🔄 Starting migration for user:', currentUser.name);
        
        try {
            // Ensure we have a working Supabase client
            this.getSupabaseClient();

            // 1. Migrate user record
            await this.migrateUser(currentUser);

            // 2. Migrate habits
            await this.migrateHabits(currentUser.id);

            // 3. Migrate goals
            await this.migrateGoals(currentUser.id);

            // 4. Migrate nutrition logs
            await this.migrateNutrition(currentUser.id);

            // 5. Migrate achievements
            await this.migrateAchievements(currentUser.id);

            console.log('✅ Migration completed successfully');
            return true;
        } catch (error) {
            console.error('❌ Migration failed:', error);
            return false;
        }
    }

    static async migrateUser(currentUser) {
        try {
            // Check if user exists
            let user = await SupabaseServices.users.getUserByEmail(currentUser.email);
            
            if (!user) {
                // Create new user
                user = await SupabaseServices.users.createUser(
                    currentUser.email,
                    currentUser.name
                );
                console.log('✅ Created user in Supabase:', user.id);
            } else {
                console.log('✅ User already exists in Supabase:', user.id);
            }

            // Update currentUser with Supabase ID
            currentUser.supabaseId = user.id;
            return user;
        } catch (error) {
            console.error('Failed to migrate user:', error);
            throw error;
        }
    }

    static async migrateHabits(userId) {
        const userPrefix = `user_${userId}`;
        const localHabits = JSON.parse(localStorage.getItem(`${userPrefix}_habits`) || '[]');
        const localCompletions = JSON.parse(localStorage.getItem(`${userPrefix}_completions`) || '{}');

        console.log(`🔄 Migrating ${localHabits.length} habits...`);

        for (const habit of localHabits) {
            try {
                // Create habit in Supabase
                const supabaseHabit = await SupabaseServices.habits.createHabit(
                    currentUser.supabaseId,
                    {
                        name: habit.name,
                        description: habit.description || '',
                        emoji: habit.emoji || '🎯',
                        weekly_target: habit.weekly_target || 7,
                        difficulty: habit.difficulty || 'medium'
                    }
                );

                // Migrate completions for this habit
                const habitCompletions = localCompletions[habit.id] || {};
                for (const [date, completed] of Object.entries(habitCompletions)) {
                    if (completed) {
                        try {
                            await SupabaseServices.habits.toggleHabitCompletion(
                                currentUser.supabaseId,
                                supabaseHabit.id,
                                date
                            );
                        } catch (completionError) {
                            console.warn('Failed to migrate completion:', completionError);
                        }
                    }
                }

                console.log(`✅ Migrated habit: ${habit.name}`);
            } catch (error) {
                console.warn(`Failed to migrate habit ${habit.name}:`, error);
            }
        }
    }

    static async migrateGoals(userId) {
        const userPrefix = `user_${userId}`;
        const localGoals = JSON.parse(localStorage.getItem(`${userPrefix}_goals`) || '[]');

        console.log(`🔄 Migrating ${localGoals.length} goals...`);

        for (const goal of localGoals) {
            try {
                await SupabaseServices.goals.createGoal(
                    currentUser.supabaseId,
                    {
                        name: goal.name,
                        description: goal.description || '',
                        emoji: goal.emoji || '🎯',
                        category: goal.category || 'fitness',
                        current_value: goal.current_value || 0,
                        target_value: goal.target_value,
                        unit: goal.unit || 'units',
                        due_date: goal.due_date || null,
                        completed: goal.completed || false
                    }
                );

                console.log(`✅ Migrated goal: ${goal.name}`);
            } catch (error) {
                console.warn(`Failed to migrate goal ${goal.name}:`, error);
            }
        }
    }

    static async migrateNutrition(userId) {
        const userPrefix = `user_${userId}`;
        const localNutrition = JSON.parse(localStorage.getItem(`${userPrefix}_food_log`) || '[]');

        console.log(`🔄 Migrating ${localNutrition.length} nutrition entries...`);

        for (const entry of localNutrition) {
            try {
                await SupabaseServices.nutrition.addNutritionLog(
                    currentUser.supabaseId,
                    {
                        name: entry.name,
                        emoji: entry.emoji || '🍽️',
                        meal_type: entry.meal_type || 'other',
                        quantity: entry.quantity || 1,
                        unit: entry.unit || 'serving',
                        calories: entry.calories || 0,
                        protein: entry.protein || 0,
                        carbs: entry.carbs || 0,
                        fat: entry.fat || 0,
                        log_date: entry.date
                    }
                );

                console.log(`✅ Migrated nutrition entry: ${entry.name}`);
            } catch (error) {
                console.warn(`Failed to migrate nutrition entry ${entry.name}:`, error);
            }
        }
    }

    static async migrateAchievements(userId) {
        const userPrefix = `user_${userId}`;
        const localAchievements = JSON.parse(localStorage.getItem(`${userPrefix}_achievements`) || '{}');

        console.log(`🔄 Migrating achievements...`);

        for (const [achievementId, achievement] of Object.entries(localAchievements)) {
            if (achievement.unlocked) {
                try {
                    await SupabaseServices.achievements.unlockAchievement(
                        currentUser.supabaseId,
                        achievementId,
                        achievement.progress || 1,
                        achievement.target || 1
                    );

                    console.log(`✅ Migrated achievement: ${achievementId}`);
                } catch (error) {
                    console.warn(`Failed to migrate achievement ${achievementId}:`, error);
                }
            }
        }
    }

    static async clearLocalData(userId) {
        if (!confirm('Are you sure you want to clear local data? Make sure migration was successful first.')) {
            return false;
        }

        const userPrefix = `user_${userId}`;
        const keysToRemove = [
            `${userPrefix}_habits`,
            `${userPrefix}_completions`,
            `${userPrefix}_goals`,
            `${userPrefix}_food_log`,
            `${userPrefix}_media`,
            `${userPrefix}_achievements`,
            `${userPrefix}_points`,
            `${userPrefix}_friends`,
            `${userPrefix}_pending_invites`
        ];

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

        console.log('✅ Local data cleared');
        return true;
    }

    static async testSupabaseConnection() {
        try {
            // Get the initialized Supabase client
            const client = SupabaseServices.initialize();
            if (!client) {
                throw new Error('Failed to initialize Supabase client');
            }

            // Simple test query using the client
            const { data, error } = await client
                .from('users')
                .select('count', { count: 'exact', head: true });

            if (error) throw error;

            console.log('✅ Supabase connection successful');
            return true;
        } catch (error) {
            console.error('❌ Supabase connection failed:', error);
            return false;
        }
    }
}

// Expose migration helper globally
window.MigrationHelper = MigrationHelper;

console.log('✅ Migration helper loaded');