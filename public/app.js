// StriveTrack - CLEAN WORKING VERSION
console.log('🚀 StriveTrack Loading...');

let sessionId = localStorage.getItem('sessionId');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// Initialize app
function initializeApp() {
    console.log('📱 Initializing app...');
    
    // Initialize localStorage
    if (!localStorage.getItem('strivetrack_habits')) {
        localStorage.setItem('strivetrack_habits', JSON.stringify([]));
    }
    if (!localStorage.getItem('strivetrack_completions')) {
        localStorage.setItem('strivetrack_completions', JSON.stringify({}));
    }
    
    // Check if user is logged in
    if (currentUser && sessionId) {
        console.log('✅ User logged in:', currentUser.name);
        showDashboard();
    } else {
        console.log('❌ Not logged in, showing login');
        showLoginScreen();
    }
}

// SIMPLE WORKING LOGIN
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    console.log('🔐 Login attempt:', email);
    
    // Admin login
    if (email === 'iamhollywoodpro@protonmail.com' && password === 'iampassword@1981') {
        sessionId = 'admin_' + Date.now();
        currentUser = {
            id: 'admin',
            email: email,
            name: 'Admin',
            role: 'admin'
        };
        
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showNotification('Welcome Admin! 🎉', 'success');
        showDashboard();
        return;
    }
    
    // Regular user login (any valid email)
    if (email.includes('@') && password.length > 0) {
        sessionId = 'user_' + Date.now();
        currentUser = {
            id: 'user_' + Date.now(),
            email: email,
            name: email.split('@')[0]
        };
        
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showNotification(`Welcome ${currentUser.name}! 🎉`, 'success');
        showDashboard();
        return;
    }
    
    showNotification('Please enter valid credentials', 'error');
}

// Show/hide screens
function showLoginScreen() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    
    // Update welcome text
    if (currentUser) {
        const welcomeText = document.getElementById('welcome-text');
        if (welcomeText) {
            welcomeText.textContent = `Welcome, ${currentUser.name}!`;
        }
    }
    
    // Load default tab
    showTab('habits');
}

// Tab navigation
function showTab(tabId) {
    console.log('📂 Switching to tab:', tabId);
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Remove active from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show target section
    const section = document.getElementById(tabId);
    if (section) {
        section.classList.remove('hidden');
    }
    
    // Add active to clicked tab
    const activeTab = document.querySelector(`[onclick*="${tabId}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Load content
    if (tabId === 'habits') {
        loadHabits();
    } else if (tabId === 'dashboard') {
        loadDashboard();
    } else if (tabId === 'progress-gallery') {
        loadProgressGallery();
    }
}

// Habit management
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

// Calculate total points
function calculateTotalPoints() {
    const completions = getLocalCompletions();
    let points = 0;
    
    Object.values(completions).forEach(habitCompletions => {
        if (habitCompletions) {
            points += Object.values(habitCompletions).filter(Boolean).length * 10;
        }
    });
    
    return points;
}

// Update points display
function updatePointsDisplay() {
    const points = calculateTotalPoints();
    const pointsEl = document.getElementById('user-points');
    if (pointsEl) {
        pointsEl.textContent = `${points} pts`;
    }
}

// Load habits with weekly calendar
function loadHabits() {
    console.log('📚 Loading habits...');
    
    let habits = getLocalHabits();
    
    // Create sample habits if none exist
    if (habits.length === 0) {
        habits = [
            {
                id: 'habit_1',
                name: 'Take Vitamins',
                description: 'Daily vitamin supplement',
                weekly_target: 7,
                created_at: new Date().toISOString()
            },
            {
                id: 'habit_2',
                name: 'Exercise',
                description: '30 minutes of activity',
                weekly_target: 5,
                created_at: new Date().toISOString()
            },
            {
                id: 'habit_3',
                name: 'Read',
                description: '20 minutes of reading',
                weekly_target: 6,
                created_at: new Date().toISOString()
            }
        ];
        saveLocalHabits(habits);
    }
    
    displayHabits(habits);
    updatePointsDisplay();
}

// Display habits with weekly calendar
function displayHabits(habits) {
    const container = document.getElementById('habits-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    habits.forEach(habit => {
        const habitElement = createWeeklyHabitElement(habit);
        container.appendChild(habitElement);
    });
    
    setupHabitClickHandlers();
}

// Create weekly habit element with clickable calendar
function createWeeklyHabitElement(habit) {
    const div = document.createElement('div');
    div.className = 'habit-card';
    
    const completions = getLocalCompletions()[habit.id] || {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    let weeklyCompletedCount = 0;
    const targetFrequency = habit.weekly_target || 7;
    
    const weekCalendar = days.map((dayName, dayIndex) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + dayIndex);
        const dateStr = dayDate.toISOString().split('T')[0];
        
        const isCompleted = completions[dateStr] || false;
        if (isCompleted) weeklyCompletedCount++;
        
        const isToday = dayDate.toDateString() === today.toDateString();
        const isPastDay = dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        return `
            <div class="day-cell ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''} ${isPastDay && !isCompleted ? 'missed' : ''}" 
                 data-habit-id="${habit.id}" 
                 data-date="${dateStr}"
                 style="cursor: pointer; padding: 8px; margin: 2px; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; text-align: center; transition: all 0.3s;"
                 title="Click to ${isCompleted ? 'unmark' : 'mark'} as completed">
                <div style="font-size: 10px; color: rgba(255,255,255,0.7);">${dayName}</div>
                <div style="font-size: 18px; margin: 4px 0;">${isCompleted ? '✅' : (isPastDay ? '❌' : '⭕')}</div>
                <div style="font-size: 10px; color: rgba(255,255,255,0.6);">${dayDate.getDate()}</div>
            </div>
        `;
    }).join('');
    
    const weeklyPercentage = Math.round((weeklyCompletedCount / targetFrequency) * 100);
    
    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div>
                <h3 style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 4px 0;">${habit.name}</h3>
                <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 0;">${habit.description || ''}</p>
                <div style="display: flex; gap: 16px; margin-top: 8px; font-size: 12px; color: rgba(255,255,255,0.7);">
                    <span><span style="color: #10b981; font-weight: 600;">${weeklyCompletedCount}</span>/${targetFrequency} this week</span>
                    <span>🔥 ${calculateStreak(completions)} day streak</span>
                    <span>📊 ${Object.keys(completions).length} total</span>
                </div>
            </div>
            <button class="delete-habit-btn" data-habit-id="${habit.id}" 
                    style="background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;"
                    title="Delete habit">🗑️</button>
        </div>
        
        <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 8px;">
                <span>This Week's Progress</span>
                <span style="font-weight: 600; color: ${weeklyPercentage >= 80 ? '#10b981' : weeklyPercentage >= 60 ? '#f59e0b' : '#ef4444'};">${weeklyPercentage}%</span>
            </div>
            <div style="width: 100%; background: rgba(255,255,255,0.1); border-radius: 4px; height: 8px;">
                <div style="width: ${weeklyPercentage}%; background: ${weeklyPercentage >= 80 ? '#10b981' : weeklyPercentage >= 60 ? '#f59e0b' : '#ef4444'}; height: 8px; border-radius: 4px; transition: all 0.5s;"></div>
            </div>
        </div>
        
        <div style="margin-bottom: 12px;">
            <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 8px;">📅 Weekly Calendar - Click days to track completion</div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">
                ${weekCalendar}
            </div>
        </div>
        
        <div style="text-align: center; font-size: 10px; color: rgba(255,255,255,0.5);">
            ✅ Completed | ⭕ Available | ❌ Missed
        </div>
    `;
    
    return div;
}

// Calculate streak
function calculateStreak(completions) {
    if (!completions || Object.keys(completions).length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        if (completions[dateStr]) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

// Set up click handlers
function setupHabitClickHandlers() {
    const container = document.getElementById('habits-container');
    if (!container) return;
    
    container.removeEventListener('click', handleHabitClick);
    container.addEventListener('click', handleHabitClick);
}

function handleHabitClick(event) {
    // Day cell clicks
    if (event.target.classList.contains('day-cell')) {
        const habitId = event.target.getAttribute('data-habit-id');
        const date = event.target.getAttribute('data-date');
        
        if (habitId && date) {
            toggleHabitCompletion(habitId, date);
        }
    }
    
    // Delete button clicks
    const deleteBtn = event.target.closest('.delete-habit-btn');
    if (deleteBtn) {
        const habitId = deleteBtn.getAttribute('data-habit-id');
        if (habitId && confirm('Delete this habit?')) {
            deleteHabit(habitId);
        }
    }
}

// Toggle habit completion
function toggleHabitCompletion(habitId, date) {
    const completions = getLocalCompletions();
    
    if (!completions[habitId]) {
        completions[habitId] = {};
    }
    
    completions[habitId][date] = !completions[habitId][date];
    
    saveLocalCompletions(completions);
    updatePointsDisplay();
    loadHabits();
    
    const action = completions[habitId][date] ? 'completed' : 'unmarked';
    showNotification(`Habit ${action} for ${date}!`, 'success');
}

// Delete habit
function deleteHabit(habitId) {
    const habits = getLocalHabits().filter(h => h.id !== habitId);
    const completions = getLocalCompletions();
    delete completions[habitId];
    
    saveLocalHabits(habits);
    saveLocalCompletions(completions);
    
    loadHabits();
    showNotification('Habit deleted!', 'success');
}

// Load dashboard
function loadDashboard() {
    console.log('📊 Loading dashboard...');
    updatePointsDisplay();
    
    const habits = getLocalHabits();
    const today = new Date().toISOString().split('T')[0];
    const completions = getLocalCompletions();
    
    let completedToday = 0;
    habits.forEach(habit => {
        if (completions[habit.id] && completions[habit.id][today]) {
            completedToday++;
        }
    });
    
    const totalHabitsEl = document.getElementById('total-habits');
    const completedTodayEl = document.getElementById('completed-today');
    
    if (totalHabitsEl) totalHabitsEl.textContent = habits.length;
    if (completedTodayEl) completedTodayEl.textContent = completedToday;
}

// Load progress gallery
function loadProgressGallery() {
    console.log('📸 Loading progress gallery...');
    
    const media = JSON.parse(localStorage.getItem('strivetrack_media') || '[]');
    
    document.getElementById('total-uploads').textContent = media.length;
    document.getElementById('before-photos').textContent = media.filter(m => m.type === 'before').length;
    document.getElementById('after-photos').textContent = media.filter(m => m.type === 'after').length;
}

// Logout
function logout() {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('currentUser');
    sessionId = null;
    currentUser = null;
    showLoginScreen();
    showNotification('Logged out!', 'info');
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        padding: 12px 20px; border-radius: 8px; color: white; font-weight: 600;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform: translateX(400px); transition: all 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Register function (simple)
function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    if (email.includes('@') && password.length > 0) {
        sessionId = 'user_' + Date.now();
        currentUser = {
            id: sessionId,
            email: email,
            name: email.split('@')[0]
        };
        
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showNotification(`Account created! Welcome ${currentUser.name}!`, 'success');
        showDashboard();
    } else {
        showNotification('Please enter valid information', 'error');
    }
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

// Make functions global
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.showTab = showTab;
window.logout = logout;
window.showModal = showModal;
window.closeModal = closeModal;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeApp);

console.log('✅ StriveTrack loaded successfully!');