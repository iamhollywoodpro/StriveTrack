// Database migration utilities for StriveTrack
// Handles schema updates and data migrations

/**
 * Migrate user table to include enhanced signup fields
 * Adds: name, phone, user_type, onboarding_completed, profile data
 */
export async function migrateUserTableV2(env) {
    try {
        console.log('Starting user table migration to v2...');
        
        // Check if migration is needed by looking for the new columns
        const tableInfo = await env.DB.prepare(`
            PRAGMA table_info(users)
        `).all();
        
        const existingColumns = tableInfo.results.map(col => col.name);
        const newColumns = ['name', 'phone', 'user_type', 'onboarding_completed', 'profile_data'];
        
        const needsMigration = newColumns.some(col => !existingColumns.includes(col));
        
        if (!needsMigration) {
            console.log('User table already migrated to v2');
            return { success: true, message: 'Already migrated' };
        }
        
        // Add new columns
        const migrations = [
            `ALTER TABLE users ADD COLUMN name TEXT`,
            `ALTER TABLE users ADD COLUMN phone TEXT`,
            `ALTER TABLE users ADD COLUMN user_type TEXT DEFAULT 'beginner'`,
            `ALTER TABLE users ADD COLUMN onboarding_completed INTEGER DEFAULT 0`,
            `ALTER TABLE users ADD COLUMN profile_data TEXT DEFAULT '{}'`,
            `ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
            `ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`
        ];
        
        for (const migration of migrations) {
            try {
                await env.DB.prepare(migration).run();
                console.log(`✅ Executed: ${migration}`);
            } catch (error) {
                // Column might already exist, which is fine
                if (!error.message.includes('duplicate column name')) {
                    console.error(`❌ Migration error: ${error.message}`);
                }
            }
        }
        
        // Update existing users with default values where needed
        await env.DB.prepare(`
            UPDATE users 
            SET user_type = 'beginner', 
                onboarding_completed = 0,
                profile_data = '{}',
                updated_at = CURRENT_TIMESTAMP
            WHERE user_type IS NULL
        `).run();
        
        console.log('✅ User table migration to v2 completed successfully');
        return { success: true, message: 'Migration completed' };
        
    } catch (error) {
        console.error('❌ User table migration failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create user_preferences table for role-specific settings
 */
export async function createUserPreferencesTable(env) {
    try {
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS user_preferences (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                preference_key TEXT NOT NULL,
                preference_value TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                UNIQUE(user_id, preference_key)
            )
        `).run();
        
        console.log('✅ User preferences table created');
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to create user preferences table:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create coaching_relationships table for coach/trainer features
 */
export async function createCoachingTables(env) {
    try {
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS coaching_relationships (
                id TEXT PRIMARY KEY,
                coach_id TEXT NOT NULL,
                client_id TEXT NOT NULL,
                status TEXT DEFAULT 'active',
                start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                end_date DATETIME,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (coach_id) REFERENCES users (id),
                FOREIGN KEY (client_id) REFERENCES users (id),
                UNIQUE(coach_id, client_id)
            )
        `).run();
        
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS workout_programs (
                id TEXT PRIMARY KEY,
                created_by TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                difficulty_level TEXT DEFAULT 'beginner',
                duration_weeks INTEGER,
                program_data TEXT,
                is_public INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users (id)
            )
        `).run();
        
        console.log('✅ Coaching tables created');
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to create coaching tables:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Run all necessary migrations
 */
export async function runAllMigrations(env) {
    console.log('🚀 Starting database migrations...');
    
    const results = [];
    
    // Migrate user table
    const userMigration = await migrateUserTableV2(env);
    results.push({ table: 'users', ...userMigration });
    
    // Create preferences table
    const prefsMigration = await createUserPreferencesTable(env);
    results.push({ table: 'user_preferences', ...prefsMigration });
    
    // Create coaching tables
    const coachingMigration = await createCoachingTables(env);
    results.push({ table: 'coaching_tables', ...coachingMigration });
    
    console.log('🎉 All migrations completed');
    return results;
}