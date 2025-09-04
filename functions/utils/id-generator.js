// Simple ID generator to replace UUID in Cloudflare Workers
// UUIDs don't work reliably in Edge Runtime, so we use simple but unique IDs

/**
 * Generate a unique ID with a prefix
 * @param {string} prefix - Prefix for the ID (e.g., 'user', 'habit', 'session')
 * @returns {string} Unique ID
 */
export function generateId(prefix = 'id') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}`;
}

/**
 * Generate a session ID
 * @returns {string} Session ID
 */
export function generateSessionId() {
    return generateId('sess');
}

/**
 * Generate a user ID
 * @returns {string} User ID
 */
export function generateUserId() {
    return generateId('u');
}

/**
 * Generate a habit ID
 * @returns {string} Habit ID
 */
export function generateHabitId() {
    return generateId('habit');
}

/**
 * Generate a nutrition log ID
 * @returns {string} Nutrition log ID
 */
export function generateNutritionId() {
    return generateId('nutri');
}

/**
 * Generate a weight log ID
 * @returns {string} Weight log ID
 */
export function generateWeightId() {
    return generateId('weight');
}

/**
 * Generate a media ID
 * @returns {string} Media ID
 */
export function generateMediaId() {
    return generateId('media');
}

/**
 * Generate a goal ID
 * @returns {string} Goal ID
 */
export function generateGoalId() {
    return generateId('goal');
}

/**
 * Generate an achievement unlock ID
 * @returns {string} Achievement unlock ID
 */
export function generateAchievementUnlockId() {
    return generateId('ach');
}

/**
 * Generate a competition ID
 * @returns {string} Competition ID
 */
export function generateCompetitionId() {
    return generateId('comp');
}

/**
 * Generate a generic UUID-like ID for backward compatibility
 * @returns {string} UUID-like ID
 */
export function generateUUID() {
    return generateId('uuid');
}