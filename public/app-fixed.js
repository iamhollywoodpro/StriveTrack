// StriveTrack - FIXED VERSION
// Focus on core functionality that actually works

console.log('🔧 Loading FIXED StriveTrack app...');

// Simple, working storage
const storage = {
    save: function(key, data) {
        localStorage.setItem(`strivetrack_${key}`, JSON.stringify(data));
        console.log(`✅ Saved ${key}:`, data);
    },
    
    load: function(key, defaultValue = []) {
        try {
            const data = localStorage.getItem(`strivetrack_${key}`);
            const result = data ? JSON.parse(data) : defaultValue;
            console.log(`📖 Loaded ${key}:`, result);
            return result;
        } catch (error) {
            console.error(`❌ Error loading ${key}:`, error);
            return defaultValue;
        }
    }
};

// Current user state
let currentUser = null;

// Initialize app with sample data if empty
function initializeApp() {
    console.log('🚀 Initializing fixed app...');
    
    // Load or create sample user
    currentUser = storage.load('user', {
        id: 'demo_user',
        email: 'demo@strivetrack.com',
        name: 'Demo User',
        points: 150,
        streak: 3
    });
    
    storage.save('user', currentUser);
    
    // Load or create sample habits
    let habits = storage.load('habits', []);
    
    if (habits.length === 0) {
        habits = [
            {
                id: '1',
                name: 'Morning Workout',
                description: '30 minutes of exercise',
                icon: '💪',
                category: 'fitness',
                points: 10,
                created: new Date().toISOString()
            },
            {
                id: '2', 
                name: 'Drink Water',
                description: '8 glasses throughout the day',
                icon: '💧',
                category: 'health',
                points: 5,
                created: new Date().toISOString()
            },
            {
                id: '3',
                name: 'Read Daily',
                description: 'Read for 20 minutes',
                icon: '📚',
                category: 'learning',
                points: 8,
                created: new Date().toISOString()
            }
        ];
        
        storage.save('habits', habits);
        console.log('🎯 Created sample habits:', habits);
    }
    
    // Show dashboard
    showDashboard();
}

function showDashboard() {
    console.log('🏠 Showing dashboard...');
    
    // Hide login screen
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
        loginScreen.classList.add('hidden');
    }
    
    // Show dashboard
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.classList.remove('hidden');
    }
    
    // Update user info
    updateUserInfo();
    
    // Load and display habits
    loadHabits();
}

function updateUserInfo() {
    console.log('👤 Updating user info...');
    
    const welcomeText = document.getElementById('welcome-text');
    const userPoints = document.getElementById('user-points');
    const userStreak = document.getElementById('user-streak');
    
    if (welcomeText) {
        welcomeText.textContent = `Welcome back, ${currentUser.name}!`;
    }
    
    if (userPoints) {
        userPoints.textContent = `Points: ${currentUser.points}`;
    }
    
    if (userStreak) {
        userStreak.textContent = `Streak: ${currentUser.streak} days`;
    }
}

function loadHabits() {
    console.log('📊 Loading habits...');
    
    const habitsContainer = document.getElementById('habits-container');
    if (!habitsContainer) {
        console.error('❌ habits-container not found!');
        return;
    }
    
    // Get habits from storage
    const habits = storage.load('habits', []);
    const completions = storage.load('completions', []);
    
    console.log('📊 Found habits:', habits.length);
    console.log('📊 Found completions:', completions.length);
    
    if (habits.length === 0) {
        habitsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #CBD5E1;">
                <h3>No habits yet!</h3>
                <p>Create your first habit to get started.</p>
                <button onclick="createSampleHabit()" style="background: #3B82F6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; margin-top: 1rem;">
                    Create Sample Habit
                </button>
            </div>
        `;
        return;
    }
    
    // Check today's completions
    const today = new Date().toISOString().split('T')[0];
    const todayCompletions = completions.filter(c => c.date === today);
    
    // Generate HTML for each habit
    const habitsHtml = habits.map(habit => {
        const completedToday = todayCompletions.some(c => c.habitId === habit.id);
        
        return `
            <div class="habit-card" style="background: #1E293B; padding: 1.5rem; border-radius: 12px; border: 1px solid #334155; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <span style="font-size: 2rem;">${habit.icon}</span>
                    <div style="flex: 1;">
                        <h3 style="color: #F8FAFC; margin: 0;">${habit.name}</h3>
                        <p style="color: #CBD5E1; margin: 0; font-size: 0.875rem;">${habit.description}</p>
                    </div>
                    <span style="padding: 0.25rem 0.5rem; border-radius: 20px; font-size: 0.875rem; ${completedToday ? 'background: rgba(16, 185, 129, 0.2); color: #10B981;' : 'background: rgba(251, 191, 36, 0.2); color: #F59E0B;'}">
                        ${completedToday ? '✅ Done' : '⏳ Pending'}
                    </span>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; color: #CBD5E1; font-size: 0.875rem;">
                    <span>Category: ${habit.category}</span>
                    <span>+${habit.points} pts</span>
                </div>
                
                <button onclick="completeHabit('${habit.id}')" 
                        style="width: 100%; padding: 0.75rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; ${completedToday ? 'background: #F59E0B; color: white;' : 'background: #10B981; color: white;'}"
                        ${completedToday ? 'disabled' : ''}>
                    ${completedToday ? 'Completed Today!' : 'Complete Habit'}
                </button>
            </div>
        `;
    }).join('');
    
    habitsContainer.innerHTML = habitsHtml;
    console.log('✅ Habits displayed successfully');
}

function completeHabit(habitId) {
    console.log('🎯 Completing habit:', habitId);
    
    const today = new Date().toISOString().split('T')[0];
    const completions = storage.load('completions', []);
    
    // Check if already completed today
    const alreadyCompleted = completions.some(c => c.habitId === habitId && c.date === today);
    
    if (alreadyCompleted) {
        showNotification('Habit already completed today!', 'warning');
        return;
    }
    
    // Find the habit
    const habits = storage.load('habits', []);
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit) {
        console.error('❌ Habit not found:', habitId);
        return;
    }
    
    // Add completion
    completions.push({
        id: Date.now().toString(),
        habitId: habitId,
        date: today,
        timestamp: new Date().toISOString()
    });
    
    storage.save('completions', completions);
    
    // Update user points
    currentUser.points += habit.points;
    storage.save('user', currentUser);
    
    // Show success message
    showNotification(`Great! You earned ${habit.points} points! 🎉`, 'success');
    
    // Refresh display
    updateUserInfo();
    loadHabits();
}

function createSampleHabit() {
    console.log('🎯 Creating sample habit...');
    
    const habits = storage.load('habits', []);
    
    const newHabit = {
        id: Date.now().toString(),
        name: 'Sample Habit',
        description: 'A new habit to track',
        icon: '⭐',
        category: 'general',
        points: 10,
        created: new Date().toISOString()
    };
    
    habits.push(newHabit);
    storage.save('habits', habits);
    
    showNotification('Sample habit created!', 'success');
    loadHabits();
}

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

// Show navigation tabs
function showSection(sectionId) {
    console.log('📄 Showing section:', sectionId);
    
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.add('hidden'));
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Update nav buttons
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.querySelector(`[data-target="${sectionId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Load section data
    if (sectionId === 'habits-section') {
        loadHabits();
    }
}

// Debug function
window.debugApp = function() {
    console.log('=== 🔍 DEBUG INFO ===');
    console.log('Current User:', currentUser);
    console.log('Habits:', storage.load('habits', []));
    console.log('Completions:', storage.load('completions', []));
    console.log('DOM Elements:', {
        'habits-container': !!document.getElementById('habits-container'),
        'dashboard': !!document.getElementById('dashboard'),
        'welcome-text': !!document.getElementById('welcome-text')
    });
    return 'Debug complete - check console';
};

// Global functions
window.completeHabit = completeHabit;
window.createSampleHabit = createSampleHabit;
window.showSection = showSection;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Set up navigation after DOM loads
document.addEventListener('DOMContentLoaded', function() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.dataset.target;
            if (target) {
                showSection(target);
            }
        });
    });
});

console.log('✅ FIXED StriveTrack app loaded - this will work!');