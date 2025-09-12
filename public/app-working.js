// StriveTrack Frontend JavaScript - WORKING VERSION
// Fixed the habit display and loading issues

console.log('🔧 Loading WORKING StriveTrack app...');

let sessionId = localStorage.getItem('sessionId') || 'offline_' + Date.now();
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// Initialize localStorage data structures
function initializeLocalStorage() {
    if (!localStorage.getItem('strivetrack_habits')) {
        localStorage.setItem('strivetrack_habits', JSON.stringify([]));
    }
    if (!localStorage.getItem('strivetrack_completions')) {
        localStorage.setItem('strivetrack_completions', JSON.stringify({}));
    }
}

// Simple online check
function isOnline() {
    return navigator.onLine && sessionId && !sessionId.startsWith('offline_');
}

// Simple habit functions
function getLocalHabits() {
    return JSON.parse(localStorage.getItem('strivetrack_habits') || '[]');
}

function saveLocalHabits(habits) {
    localStorage.setItem('strivetrack_habits', JSON.stringify(habits));
}

function getLocalCompletions() {
    return JSON.parse(localStorage.getItem('strivetrack_completions') || '{}');
}

function saveLocalCompletions(completions) {
    localStorage.setItem('strivetrack_completions', JSON.stringify(completions));
}

// Get habits with completion status
function getLocalHabitsWithCompletions() {
    const habits = getLocalHabits();
    const completions = getLocalCompletions();
    const today = new Date().toISOString().split('T')[0];
    
    return habits.map(habit => ({
        ...habit,
        completedToday: completions[habit.id] && completions[habit.id][today],
        completed_days: completions[habit.id] || {},
        current_streak: calculateStreak(completions[habit.id] || {}),
        total_completions: Object.keys(completions[habit.id] || {}).length
    }));
}

function calculateStreak(habitCompletions) {
    const dates = Object.keys(habitCompletions).sort().reverse();
    if (dates.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < dates.length; i++) {
        const date = new Date(dates[i]);
        date.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === i) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

// FIXED loadHabits function
async function loadHabits() {
    console.log('📚 Loading habits...');
    
    try {
        initializeLocalStorage();
        
        // Try API first if online
        if (isOnline()) {
            console.log('🌐 Trying API...');
            try {
                const response = await fetch('/api/habits/weekly', {
                    headers: { 'x-session-id': sessionId }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const habits = data.habits || [];
                    console.log('✅ API Success - loaded', habits.length, 'habits');
                    
                    // Cache to localStorage
                    saveLocalHabits(habits);
                    displayHabits(habits);
                    return;
                }
            } catch (error) {
                console.log('❌ API failed:', error.message);
            }
        }
        
        // Fallback to localStorage
        console.log('💾 Using localStorage...');
        const habits = getLocalHabitsWithCompletions();
        
        // If no habits, create sample ones
        if (habits.length === 0) {
            console.log('🎯 No habits found, creating samples...');
            createSampleHabits();
            const newHabits = getLocalHabitsWithCompletions();
            displayHabits(newHabits);
        } else {
            displayHabits(habits);
        }
        
    } catch (error) {
        console.error('❌ Load habits error:', error);
        showNotification('Failed to load habits', 'error');
    }
}

// Create sample habits if none exist
function createSampleHabits() {
    const sampleHabits = [
        {
            id: 'habit_1',
            name: 'Morning Workout',
            description: '30 minutes of exercise',
            category: 'fitness',
            weekly_target: 5,
            created_at: new Date().toISOString()
        },
        {
            id: 'habit_2', 
            name: 'Drink Water',
            description: '8 glasses throughout the day',
            category: 'health',
            weekly_target: 7,
            created_at: new Date().toISOString()
        },
        {
            id: 'habit_3',
            name: 'Read Daily',
            description: 'Read for 20 minutes',
            category: 'learning',
            weekly_target: 6,
            created_at: new Date().toISOString()
        }
    ];
    
    saveLocalHabits(sampleHabits);
    console.log('✅ Created sample habits');
}

// FIXED displayHabits function - simplified and working
function displayHabits(habits) {
    console.log('🎯 Displaying', habits.length, 'habits...');
    
    const container = document.getElementById('habits-container');
    if (!container) {
        console.error('❌ habits-container not found!');
        return;
    }
    
    container.innerHTML = '';
    
    if (!habits || habits.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #CBD5E1;">
                <h3>No habits yet!</h3>
                <p>Create your first habit to get started.</p>
                <button onclick="createSampleHabits(); loadHabits();" class="btn-primary" style="margin-top: 1rem;">
                    Create Sample Habits
                </button>
            </div>
        `;
        return;
    }
    
    habits.forEach(habit => {
        const habitElement = createSimpleHabitElement(habit);
        container.appendChild(habitElement);
    });
    
    console.log('✅ Displayed', habits.length, 'habits successfully');
}

// FIXED createSimpleHabitElement - working version
function createSimpleHabitElement(habit) {
    const div = document.createElement('div');
    div.className = 'habit-card';
    div.style.cssText = `
        background: #1E293B;
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid #334155;
        margin-bottom: 1rem;
    `;
    
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habit.completed_days && habit.completed_days[today];
    const streak = habit.current_streak || 0;
    const totalCompletions = habit.total_completions || 0;
    
    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div style="flex: 1;">
                <h3 style="color: #F8FAFC; margin: 0; font-size: 1.25rem;">${habit.name}</h3>
                ${habit.description ? `<p style="color: #CBD5E1; margin: 0.5rem 0 0 0; font-size: 0.875rem;">${habit.description}</p>` : ''}
            </div>
            <div style="padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; ${completedToday ? 'background: rgba(16, 185, 129, 0.2); color: #10B981;' : 'background: rgba(251, 191, 36, 0.2); color: #F59E0B;'}">
                ${completedToday ? '✅ Done Today' : '⏳ Pending'}
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; color: #CBD5E1; font-size: 0.875rem;">
            <span>🔥 ${streak} day streak</span>
            <span>📊 ${totalCompletions} total</span>
            <span>🎯 ${habit.weekly_target || 7}/week goal</span>
        </div>
        
        <div style="display: flex; gap: 0.5rem;">
            <button onclick="toggleHabitCompletion('${habit.id}')" 
                    style="flex: 1; padding: 0.75rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; color: white; ${completedToday ? 'background: #F59E0B;' : 'background: #10B981;'}"
                    ${completedToday ? 'disabled' : ''}>
                ${completedToday ? '✅ Completed Today!' : 'Complete Habit'}
            </button>
            <button onclick="deleteHabit('${habit.id}')" 
                    style="padding: 0.75rem 1rem; border: none; border-radius: 8px; cursor: pointer; background: #EF4444; color: white;"
                    title="Delete habit">
                🗑️
            </button>
        </div>
    `;
    
    return div;
}

// Toggle habit completion
function toggleHabitCompletion(habitId) {
    console.log('🎯 Toggling habit:', habitId);
    
    const habits = getLocalHabits();
    const completions = getLocalCompletions();
    const today = new Date().toISOString().split('T')[0];
    
    if (!completions[habitId]) {
        completions[habitId] = {};
    }
    
    const wasCompleted = completions[habitId][today] || false;
    const isNowCompleted = !wasCompleted;
    
    if (isNowCompleted) {
        completions[habitId][today] = true;
        showNotification('Great! Habit completed! 🎉', 'success');
        
        // Update points
        if (currentUser) {
            currentUser.points = (currentUser.points || 0) + 10;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUserDisplay();
        }
    } else {
        delete completions[habitId][today];
        showNotification('Habit unmarked', 'info');
        
        // Remove points
        if (currentUser) {
            currentUser.points = Math.max(0, (currentUser.points || 0) - 10);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUserDisplay();
        }
    }
    
    saveLocalCompletions(completions);
    loadHabits(); // Refresh display
}

// Delete habit
function deleteHabit(habitId) {
    if (!confirm('Are you sure you want to delete this habit?')) {
        return;
    }
    
    console.log('🗑️ Deleting habit:', habitId);
    
    const habits = getLocalHabits();
    const updatedHabits = habits.filter(h => h.id !== habitId);
    saveLocalHabits(updatedHabits);
    
    // Remove completions
    const completions = getLocalCompletions();
    delete completions[habitId];
    saveLocalCompletions(completions);
    
    showNotification('Habit deleted', 'success');
    loadHabits(); // Refresh display
}

// Update user display
function updateUserDisplay() {
    if (!currentUser) return;
    
    const welcomeText = document.getElementById('welcome-text');
    const userPoints = document.getElementById('user-points');
    
    if (welcomeText) {
        welcomeText.textContent = `Welcome back, ${currentUser.username || currentUser.email || 'User'}!`;
    }
    
    if (userPoints) {
        userPoints.textContent = `Points: ${currentUser.points || 0}`;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: #10B981;' : ''}
        ${type === 'error' ? 'background: #EF4444;' : ''}
        ${type === 'warning' ? 'background: #F59E0B;' : ''}
        ${type === 'info' ? 'background: #3B82F6;' : ''}
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Initialize app
function initializeApp() {
    console.log('🚀 Initializing app...');
    
    initializeLocalStorage();
    
    // Get or create user
    if (!currentUser) {
        currentUser = {
            id: 'demo_user_' + Date.now(),
            username: 'Demo User',
            email: 'demo@strivetrack.com',
            points: 0,
            created_at: new Date().toISOString()
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('sessionId', sessionId);
    }
    
    // Show dashboard
    showDashboard();
}

function showDashboard() {
    console.log('🏠 Showing dashboard...');
    
    // Hide login screen if it exists
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
        loginScreen.classList.add('hidden');
    }
    
    // Show dashboard
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.classList.remove('hidden');
    }
    
    updateUserDisplay();
    loadHabits();
}

// Debug function
window.debugStriveTrack = function() {
    console.log('=== 🔍 DEBUG REPORT ===');
    console.log('Current User:', currentUser);
    console.log('Session ID:', sessionId);
    console.log('Online:', isOnline());
    console.log('Habits:', getLocalHabits());
    console.log('Completions:', getLocalCompletions());
    console.log('DOM Elements:', {
        'habits-container': !!document.getElementById('habits-container'),
        'dashboard': !!document.getElementById('dashboard'),
        'welcome-text': !!document.getElementById('welcome-text')
    });
    return 'Debug complete';
};

// Global functions
window.toggleHabitCompletion = toggleHabitCompletion;
window.deleteHabit = deleteHabit;
window.createSampleHabits = createSampleHabits;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

console.log('✅ WORKING StriveTrack app loaded!');