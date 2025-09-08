// Custom ID Generator for Cloudflare Workers Edge Runtime
// Replaces UUID package which has compatibility issues

/**
 * Generates a UUID-style random string
 * @returns {string} UUID-style identifier
 */
export function generateId() {
    const chars = '0123456789abcdef';
    const pattern = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    
    return pattern.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return chars[v];
    });
}

/**
 * Generates a user ID
 * @returns {string} User identifier
 */
export function generateUserId() {
    return 'user_' + generateId();
}

/**
 * Generates a session ID
 * @returns {string} Session identifier  
 */
export function generateSessionId() {
    return 'sess_' + generateId();
}

/**
 * Generates a habit ID
 * @returns {string} Habit identifier
 */
export function generateHabitId() {
    return 'habit_' + generateId();
}

/**
 * Generates a media ID
 * @returns {string} Media identifier
 */
export function generateMediaId() {
    return 'media_' + generateId();
}

/**
 * Generates an achievement ID
 * @returns {string} Achievement identifier
 */
export function generateAchievementId() {
    return 'ach_' + generateId();
}

/**
 * Generates a nutrition entry ID
 * @returns {string} Nutrition identifier
 */
export function generateNutritionId() {
    return 'nutr_' + generateId();
}