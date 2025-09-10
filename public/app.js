// StriveTrack Frontend JavaScript

let sessionId = localStorage.getItem('sessionId');
let currentUser = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('StriveTrack app initializing...');
    console.log('Initial sessionId from localStorage:', sessionId);
    
    // CRITICAL FIX: Always show login screen first, then validate session
    showLoginScreen();
    
    if (sessionId) {
        console.log('Found session, validating...');
        validateSession();
    } else {
        console.log('No session found, showing login screen');
    }
    
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Register button
    document.getElementById('show-register').addEventListener('click', showRegisterForm);
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const section = tab.dataset.section;
            showSection(section);
        });
    });
    
    // Create habit card and modal
    document.getElementById('create-habit-card').addEventListener('click', () => {
        showModal('create-habit-modal');
        updateEmojiPreview(); // Initialize emoji preview
    });
    
    document.getElementById('create-habit-form').addEventListener('submit', createHabit);
    
    // Emoji preview auto-update
    document.getElementById('habit-name').addEventListener('input', updateEmojiPreview);
    document.getElementById('habit-category').addEventListener('change', updateEmojiPreview);
    
    // Nutrition form
    document.getElementById('nutrition-form').addEventListener('submit', submitNutrition);
    
    // Upload progress card
    document.getElementById('upload-progress-card').addEventListener('click', () => {
        showMediaUploadModal();
    });
    
    // Media upload
    document.getElementById('upload-media-btn').addEventListener('click', () => {
        showMediaUploadModal();
    });
    
    // Connect media upload form to submit handler
    document.getElementById('media-upload-form').addEventListener('submit', submitMediaUpload);
    
    // Admin tabs
    document.getElementById('admin-users-tab').addEventListener('click', () => {
        showAdminSection('users');
    });
    
    document.getElementById('admin-media-tab').addEventListener('click', () => {
        showAdminSection('media');
    });
    
    // Install app
    document.getElementById('install-app').addEventListener('click', installPWA);
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.classList.add('hidden');
        }
    });
    
    // Social Hub event listeners (will be added once DOM elements are created)
    setTimeout(() => {
        const addFriendBtn = document.getElementById('add-friend-btn');
        const friendsListBtn = document.getElementById('friends-list-btn');
        const leaderboardFilter = document.getElementById('leaderboard-filter');
        
        if (addFriendBtn) {
            addFriendBtn.addEventListener('click', showFriendsModal);
        }
        
        if (friendsListBtn) {
            friendsListBtn.addEventListener('click', showFriendsModal);
        }
        
        if (leaderboardFilter) {
            leaderboardFilter.addEventListener('change', (e) => {
                loadLeaderboards(e.target.value);
            });
        }
    }, 1000);
}

// Authentication functions
async function validateSession() {
    try {
        const response = await fetch('/api/auth/validate-session', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showDashboard();
        } else {
            localStorage.removeItem('sessionId');
            sessionId = null;
        }
    } catch (error) {
        console.error('Session validation error:', error);
        localStorage.removeItem('sessionId');
        sessionId = null;
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            sessionId = data.sessionId;
            currentUser = data.user;
            localStorage.setItem('sessionId', sessionId);
            showNotification('Welcome back! 🎉', 'success');
            showDashboard();
            
            // Check for achievements on login (onboarding, daily login, etc.)
            setTimeout(() => {
                checkAndAwardAchievements('login');
            }, 1000);
        } else {
            showNotification(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

function showRegisterForm() {
    const email = prompt('Enter your email address:');
    if (!email) return;
    
    const password = prompt('Create a password (min 6 characters):');
    if (!password || password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    register(email, password);
}

async function register(email, password) {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Account created successfully! Please log in.', 'success');
            document.getElementById('email').value = email;
        } else {
            showNotification(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    }
}

function logout() {
    fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'x-session-id': sessionId }
    });
    
    localStorage.removeItem('sessionId');
    sessionId = null;
    currentUser = null;
    
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    
    showNotification('Logged out successfully', 'info');
}

// UI Navigation functions
function showLoginScreen() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
}

// Dashboard functions
function showDashboard() {
    console.log('Showing dashboard for user:', currentUser);
    console.log('Current sessionId:', sessionId);
    
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    
    // Update welcome text and points
    document.getElementById('welcome-text').textContent = `Welcome, ${currentUser.email.split('@')[0]} ⭐ ${currentUser.points || 0} pts`;
    document.getElementById('user-points').textContent = `⭐ ${currentUser.points || 0} pts`;
    
    // Show admin tab if user is admin
    if (currentUser.role === 'admin') {
        document.getElementById('admin-tab').classList.remove('hidden');
    }
    
    // Load initial data
    console.log('Loading dashboard data...');
    loadDashboardData();
}

async function loadDashboardWeeklyProgress() {
    try {
        const response = await fetch('/api/habits/weekly', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayDashboardWeeklyProgress(data.habits);
        }
    } catch (error) {
        console.error('Load dashboard weekly progress error:', error);
    }
}

function displayDashboardWeeklyProgress(habits) {
    const container = document.getElementById('dashboard-weekly-progress');
    container.innerHTML = '';
    
    if (habits.length === 0) {
        container.innerHTML = '<p class="text-white/70">No habits created yet. Create your first habit to start tracking!</p>';
        return;
    }
    
    habits.forEach(habit => {
        const progressElement = createDashboardProgressElement(habit);
        container.appendChild(progressElement);
    });
}

function createDashboardProgressElement(habit) {
    const div = document.createElement('div');
    div.className = 'mb-4 p-4 bg-white/5 border border-white/10 rounded-lg';
    
    const completedCount = habit.completedCount || 0;
    const targetCount = habit.targetCount || 7;
    const progressPercent = Math.round((completedCount / targetCount) * 100);
    
    // Status color based on progress
    let statusColor = 'text-red-400';
    if (progressPercent >= 100) statusColor = 'text-green-400';
    else if (progressPercent >= 70) statusColor = 'text-yellow-400';
    
    div.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
                <div class="text-lg text-white font-medium">${habit.name}</div>
            </div>
            <div class="text-right">
                <div class="${statusColor} font-semibold">${completedCount}/${targetCount} days</div>
                <div class="text-white/60 text-sm">${progressPercent}%</div>
            </div>
        </div>
        <div class="relative">
            <div class="w-full bg-white/10 rounded-full h-3">
                <div class="progress-bar h-3 rounded-full transition-all duration-300" 
                     style="width: ${Math.min(progressPercent, 100)}%"></div>
            </div>
        </div>
        <div class="flex justify-between text-xs text-white/60 mt-2">
            <span>This week's target: ${targetCount} days</span>
            <span>${targetCount - completedCount > 0 ? `${targetCount - completedCount} more to go` : 'Target achieved! 🎉'}</span>
        </div>
    `;
    
    return div;
}

async function loadDashboardData() {
    await Promise.all([
        loadDashboardWeeklyProgress(),
        loadHabits(),
        loadMedia(),
        loadAchievements(),
        loadDailyChallenges(),
        loadAdminData()
    ]);
    
    updateDashboardStats();
}

// Habits functions
async function loadHabits() {
    console.log('Loading habits with sessionId:', sessionId);
    try {
        const response = await fetch('/api/habits', {
            headers: { 'x-session-id': sessionId }
        });
        
        console.log('Habits response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            const habits = data.habits || [];
            console.log('Loaded habits:', habits.length);
            displayHabits(habits);
        } else {
            console.error('Habits API failed:', response.status, await response.text());
        }
    } catch (error) {
        console.error('Load habits error:', error);
    }
}

function displayHabits(habits) {
    const container = document.getElementById('habits-container');
    
    if (!container) {
        console.error('habits-container element not found!');
        return;
    }
    
    container.innerHTML = '';
    
    if (habits.length === 0) {
        container.innerHTML = '<p class="text-white/70">No habits created yet. Create your first habit to get started!</p>';
        return;
    }
    
    // Display habits using the proper createHabitElement function
    habits.forEach(habit => {
        const habitElement = createHabitElement(habit, false);
        container.appendChild(habitElement);
    });
}

async function loadWeeklyHabits() {
    try {
        const response = await fetch('/api/habits/weekly', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayWeeklyHabits(data.habits);
        } else {
            // Fallback to regular habits if weekly endpoint fails
            loadHabits();
        }
    } catch (error) {
        console.error('Load weekly habits error:', error);
        // Fallback to regular habits
        loadHabits();
    }
}

function displayWeeklyHabits(habits) {
    const container = document.getElementById('habits-container');
    container.innerHTML = '';
    
    if (habits.length === 0) {
        container.innerHTML = '<p class="text-white/70">No habits created yet. Create your first habit to get started!</p>';
        return;
    }
    
    habits.forEach(habit => {
        const habitElement = createWeeklyHabitElement(habit);
        container.appendChild(habitElement);
    });
}

function updateCurrentWeekDisplay() {
    const weekDisplay = document.getElementById('current-week-display');
    if (!weekDisplay) return;
    
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start from Sunday
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End on Saturday
    
    const options = { month: 'short', day: 'numeric' };
    const startStr = weekStart.toLocaleDateString('en-US', options);
    const endStr = weekEnd.toLocaleDateString('en-US', options);
    
    weekDisplay.textContent = `${startStr} - ${endStr}`;
}

function createHabitElement(habit, showWeekView = false) {
    const div = document.createElement('div');
    div.className = 'habit-card';
    
    if (showWeekView) {
        return createWeeklyHabitElement(habit);
    }
    
    // Calculate completion percentage based on actual data
    const completionPercentage = habit.total_completions > 0 ? 
        Math.min(100, (habit.total_completions / habit.target_frequency) * 100) : 0;
    
    // Action buttons - always show delete, show complete if not completed today
    const actionButtons = `
        <div class="flex space-x-2 mt-4">
            ${habit.today_completed === 0 ? `
                <button class="btn-primary flex-1" onclick="toggleHabitCompletion('${habit.id}')">
                    <i class="fas fa-check mr-2"></i>
                    Mark Complete
                </button>
            ` : `
                <div class="flex-1 bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-2 text-center text-green-400">
                    <i class="fas fa-check-circle mr-2"></i>
                    Completed Today!
                </div>
            `}
            <button class="btn-danger" onclick="deleteHabit('${habit.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    div.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-4">
                <div>
                    <h3 class="text-white font-semibold text-lg">${habit.name}</h3>
                    ${habit.description ? `<p class="text-white/60 text-sm mt-1">${habit.description}</p>` : ''}
                </div>
            </div>
            <div class="text-right">
                <div class="text-white font-semibold">${habit.total_completions}</div>
                <div class="text-white/70 text-sm">Completions</div>
                <div class="text-white/60 text-xs">Streak: ${habit.current_streak || 0}</div>
            </div>
        </div>
        
        <div class="mb-4">
            <div class="flex justify-between text-sm text-white/70 mb-2">
                <span>Progress</span>
                <span>${Math.round(completionPercentage)}%</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2">
                <div class="progress-bar h-2 rounded-full" style="width: ${completionPercentage}%"></div>
            </div>
        </div>
        
        ${actionButtons}
    `;
    
    return div;
}

function createWeeklyHabitElement(habit) {
    const div = document.createElement('div');
    div.className = 'habit-card';
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const completedDays = habit.completedDays || [];
    const targetCount = habit.targetCount || 7;
    const completedCount = habit.completedCount || 0;
    
    // Calculate this week's dates
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weekCalendar = days.map((dayName, dayIndex) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + dayIndex);
        const dateStr = dayDate.toISOString().split('T')[0];
        const isCompleted = completedDays.includes(dayIndex);
        const isToday = dayDate.toDateString() === today.toDateString();
        
        return `
            <div class="day-cell ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}" 
                 onclick="toggleWeeklyHabit('${habit.id}', '${dateStr}', ${dayIndex})">
                <div class="text-xs text-white/70 font-medium">${dayName}</div>
                <div class="text-lg mt-1">${isCompleted ? '✓' : '○'}</div>
                <div class="text-xs text-white/60">${dayDate.getDate()}</div>
            </div>
        `;
    }).join('');
    
    div.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <div>
                <h3 class="text-white font-semibold text-lg">${habit.name}</h3>
                ${habit.description ? `<p class="text-white/60 text-sm mt-1">${habit.description}</p>` : ''}
                <p class="text-white/70 text-sm mt-2">
                    <span class="text-green-400 font-semibold">${completedCount}</span> / ${targetCount} days this week
                </p>
            </div>
            <button class="btn-danger" onclick="deleteHabit('${habit.id}')" title="Delete habit">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        
        <div class="mb-4">
            <div class="flex justify-between text-sm text-white/70 mb-2">
                <span>Weekly Progress</span>
                <span>${Math.round((completedCount / targetCount) * 100)}%</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2">
                <div class="progress-bar h-2 rounded-full" style="width: ${(completedCount / targetCount) * 100}%"></div>
            </div>
        </div>
        
        <div class="week-calendar">
            ${weekCalendar}
        </div>
    `;
    
    return div;
}

function createSimpleHabitElement(habit) {
    const div = document.createElement('div');
    div.className = 'habit-card';
    
    div.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
                <div>
                    <h3 class="text-white font-semibold">${habit.name}</h3>
                    ${habit.description ? `<p class="text-white/70 text-sm">${habit.description}</p>` : ''}
                    <p class="text-white/60 text-xs">${habit.total_completions} completions</p>
                </div>
            </div>
            <div class="flex space-x-2">
                <button class="btn-primary" onclick="toggleHabitCompletion('${habit.id}')">
                    <i class="fas fa-check mr-2"></i>
                    Complete
                </button>
                <button class="btn-secondary" onclick="deleteHabit('${habit.id}')" title="Delete habit">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    return div;
}

async function toggleWeeklyHabit(habitId, date, dayOfWeek) {
    try {
        const response = await fetch('/api/habits/weekly', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-session-id': sessionId 
            },
            body: JSON.stringify({ habitId, date, dayOfWeek })
        });
        
        if (response.ok) {
            const data = await response.json();
            showNotification(data.completed ? 
                `Day completed! +${data.points} pts` : 
                'Day unmarked', 'success');
            loadWeeklyHabits(); // Refresh the weekly view
            loadDashboardWeeklyProgress(); // Refresh dashboard progress
            updateDashboardStats();
            
            // Check for achievements after habit completion
            if (data.completed) {
                checkAndAwardAchievements('habit_completion');
            }
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Failed to toggle completion', 'error');
        }
    } catch (error) {
        console.error('Toggle weekly habit error:', error);
        showNotification('Failed to toggle completion', 'error');
    }
}

async function toggleHabitCompletion(habitId) {
    try {
        const response = await fetch('/api/habits/complete', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-session-id': sessionId 
            },
            body: JSON.stringify({ habitId })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.completed) {
                showNotification(`Habit completed! +${data.points_earned} points 💪`, 'success');
                // Update user points
                currentUser.points += data.points_earned;
                document.getElementById('user-points').textContent = `⭐ ${currentUser.points} pts`;
                
                // Check for achievements after habit completion
                checkAndAwardAchievements('habit_completion');
            } else {
                showNotification('Habit uncompleted', 'info');
            }
            loadHabits();
            updateDashboardStats();
        } else {
            const data = await response.json();
            showNotification(data.error || 'Failed to update habit', 'error');
        }
    } catch (error) {
        console.error('Toggle habit error:', error);
        showNotification('Failed to update habit', 'error');
    }
}

// Automatic emoji mapping system
function getHabitEmoji(habitName, category) {
    const name = habitName.toLowerCase();
    
    // Specific habit patterns
    const emojiMap = {
        // Water & Hydration
        'water': '💧', 'drink water': '💧', 'hydrate': '💧', 'hydration': '💧',
        
        // Exercise & Fitness
        'run': '🏃', 'jog': '🏃', 'running': '🏃', 'jogging': '🏃',
        'walk': '🚶', 'walking': '🚶', 'steps': '👟',
        'gym': '💪', 'workout': '💪', 'exercise': '💪', 'fitness': '💪',
        'cardio': '❤️', 'cycling': '🚴', 'bike': '🚴', 'swimming': '🏊',
        'yoga': '🧘', 'meditation': '🧘', 'stretch': '🤸', 'stretching': '🤸',
        'push up': '💪', 'pushup': '💪', 'squats': '🍑', 'squat': '🍑',
        
        // Nutrition & Diet
        'eat': '🍎', 'meal': '🍽️', 'breakfast': '🥞', 'lunch': '🥗', 'dinner': '🍽️',
        'fruit': '🍎', 'vegetable': '🥬', 'salad': '🥗', 'smoothie': '🥤',
        'protein': '🥩', 'vitamin': '💊', 'supplement': '💊',
        
        // Health & Wellness
        'sleep': '😴', 'rest': '😴', 'nap': '😴', 'bedtime': '🌙',
        'brush teeth': '🦷', 'dental': '🦷', 'floss': '🦷',
        'skincare': '🧴', 'sunscreen': '☀️',
        
        // Productivity & Learning
        'read': '📚', 'book': '📚', 'study': '📖', 'learn': '🎓',
        'write': '✍️', 'journal': '📝', 'note': '📝', 'blog': '💻',
        'code': '💻', 'programming': '💻', 'develop': '💻',
        
        // Mindfulness & Mental Health
        'gratitude': '🙏', 'pray': '🙏', 'mindful': '🧘',
        'breathe': '🌬️', 'breathing': '🌬️',
        
        // Hobbies & Skills
        'music': '🎵', 'guitar': '🎸', 'piano': '🎹', 'sing': '🎤',
        'draw': '🎨', 'art': '🎨', 'paint': '🎨', 'create': '✨',
        'cook': '👨‍🍳', 'bake': '👨‍🍳', 'recipe': '📝',
        
        // Social & Relationships
        'call': '📞', 'family': '👨‍👩‍👧‍👦', 'friend': '👫', 'social': '👥',
        
        // Environment & Sustainability
        'recycle': '♻️', 'plant': '🌱', 'garden': '🌿', 'nature': '🌳',
        
        // Finance & Career
        'budget': '💰', 'save': '💰', 'money': '💰', 'invest': '📈',
        'work': '💼', 'meeting': '💼', 'email': '📧'
    };
    
    // Check for exact matches or partial matches
    for (const [keyword, emoji] of Object.entries(emojiMap)) {
        if (name.includes(keyword)) {
            return emoji;
        }
    }
    
    // Category-based fallbacks
    const categoryEmojis = {
        'nutrition': '🍎',
        'cardio': '❤️',
        'strength': '💪',
        'flexibility': '🤸',
        'general': '⭐'
    };
    
    return categoryEmojis[category] || '⭐';
}

function updateEmojiPreview() {
    const nameInput = document.getElementById('habit-name');
    const categorySelect = document.getElementById('habit-category');
    const emojiPreview = document.getElementById('emoji-preview');
    const habitPreviewName = document.getElementById('habit-preview-name');
    
    const name = nameInput.value || 'Your habit name';
    const category = categorySelect.value;
    
    // Get the emoji using our existing function
    const emoji = getHabitEmoji(name, category);
    
    // Update preview
    emojiPreview.textContent = emoji;
    habitPreviewName.textContent = `${emoji} ${name}`;
}

async function createHabit(event) {
    event.preventDefault();
    
    const name = document.getElementById('habit-name').value;
    const category = document.getElementById('habit-category').value;
    const difficulty = document.getElementById('habit-difficulty').value;
    const description = document.getElementById('habit-description').value;
    const weeklyTarget = parseInt(document.getElementById('weekly-target').value);
    
    // Generate automatic emoji
    const emoji = getHabitEmoji(name, category);
    const displayName = `${emoji} ${name}`;
    
    try {
        const response = await fetch('/api/habits', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify({ 
                name: displayName, 
                description: description || `${category} habit - ${difficulty} difficulty`,
                weekly_target: weeklyTarget
            })
        });
        
        if (response.ok) {
            showNotification('Habit created successfully! 🎯', 'success');
            closeModal('create-habit-modal');
            document.getElementById('create-habit-form').reset();
            updateEmojiPreview(); // Reset preview
            loadHabits();
            loadDashboardWeeklyProgress(); // Refresh dashboard progress bars
            updateDashboardStats();
            
            // Check for achievements after habit creation
            checkAndAwardAchievements('habit_creation');
        } else {
            const data = await response.json();
            showNotification(data.error || 'Failed to create habit', 'error');
        }
    } catch (error) {
        console.error('Create habit error:', error);
        showNotification('Failed to create habit', 'error');
    }
}

async function deleteHabit(habitId) {
    showConfirmationModal('Are you sure you want to delete this habit? This action cannot be undone.', async function() {
        try {
            const response = await fetch(`/api/habits/${habitId}`, {
                method: 'DELETE',
                headers: { 'x-session-id': sessionId }
            });
            
            if (response.ok) {
                showNotification('Habit deleted successfully', 'success');
                loadHabits();
                loadDashboardWeeklyProgress(); // Refresh dashboard progress bars
                updateDashboardStats();
            } else {
                const data = await response.json();
                showNotification(data.error || 'Failed to delete habit', 'error');
            }
        } catch (error) {
            console.error('Delete habit error:', error);
            showNotification('Failed to delete habit', 'error');
        }
    });
}

// Media functions
// Enhanced Media Upload with Modal
function showMediaUploadModal() {
    const modal = document.getElementById('media-upload-modal');
    modal.classList.remove('hidden');
    
    // Reset form
    document.getElementById('media-upload-form').reset();
    
    // Set default media type to progress
    document.querySelector('input[name="media_type"][value="progress"]').checked = true;
}

async function submitMediaUpload(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const file = formData.get('file');
    
    if (!file) {
        showNotification('Please select a file to upload', 'error');
        return;
    }
    
    // Show upload progress
    const progressContainer = document.getElementById('upload-progress');
    const progressBar = document.getElementById('upload-progress-bar');
    const progressText = document.getElementById('upload-progress-text');
    
    progressContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    
    try {
        // Use enhanced media API for all uploads
        const isVideo = file.type.startsWith('video/');
        const endpoint = '/api/media/enhanced';
        
        // The media_type is already in the form data from the modal
        // No need to append video_type or image_type separately
        
        const xhr = new XMLHttpRequest();
        
        // Set session header for authentication
        xhr.open('POST', endpoint);
        xhr.setRequestHeader('x-session-id', sessionId);
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressBar.style.width = `${percentComplete}%`;
                progressText.textContent = `${Math.round(percentComplete)}%`;
            }
        });
        
        xhr.onload = function() {
            progressContainer.classList.add('hidden');
            
            if (xhr.status === 200 || xhr.status === 201) {
                const data = JSON.parse(xhr.responseText);
                const mediaTypeText = isVideo ? '🎥 Video' : '📸 Image';
                const mediaType = data.media_type || 'progress';
                const pointsText = data.total_points ? `+${data.total_points} pts` : `+${data.points || 10} pts`;
                showNotification(`${mediaTypeText} (${mediaType.toUpperCase()}) uploaded successfully! (${pointsText})`, 'success');
                
                // Show pair bonus notification if applicable
                if (data.pair_bonus && data.pair_bonus > 0) {
                    setTimeout(() => {
                        showNotification(`🎉 Before/After pair completed! Bonus +${data.pair_bonus} pts!`, 'success');
                    }, 1500);
                }
                
                // Close modal and reload media
                closeModal('media-upload-modal');
                loadMedia();
                updateDashboardStats();
                
                // Check for achievements
                const trigger = isVideo ? 'video_upload' : 'media_upload';
                checkAndAwardAchievements(trigger);
                
            } else {
                const error = JSON.parse(xhr.responseText);
                showNotification(error.error || 'Upload failed', 'error');
            }
        };
        
        xhr.onerror = function() {
            progressContainer.classList.add('hidden');
            showNotification('Upload failed', 'error');
        };
        
        xhr.send(formData);
        
    } catch (error) {
        console.error('Upload error:', error);
        progressContainer.classList.add('hidden');
        showNotification('Upload failed', 'error');
    }
}

// Legacy upload handler for compatibility
async function uploadMedia(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Trigger the new upload modal
    showMediaUploadModal();
    
    // Pre-fill the file input in the modal
    const modalFileInput = document.getElementById('media-file');
    modalFileInput.files = event.target.files;
    
    event.target.value = '';
}

async function loadMedia() {
    try {
        const response = await fetch('/api/media/enhanced?stats=true&pairs=true', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayEnhancedMedia(data);
            updateMediaStats(data);
        } else {
            // Fallback to regular media API
            const fallbackResponse = await fetch('/api/media', {
                headers: { 'x-session-id': sessionId }
            });
            if (fallbackResponse.ok) {
                const media = await fallbackResponse.json();
                displayMedia(media);
            }
        }
    } catch (error) {
        console.error('Load media error:', error);
    }
}

function displayEnhancedMedia(data) {
    const container = document.getElementById('media-container');
    const emptyState = document.getElementById('media-empty-state');
    
    container.innerHTML = '';
    
    if (!data.media || data.media.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    // Apply filters
    const filter = document.getElementById('gallery-filter').value;
    let filteredMedia = data.media;
    
    if (filter !== 'all') {
        if (filter === 'comparisons') {
            displayBeforeAfterPairs(data.comparisons || []);
            return;
        } else {
            filteredMedia = data.media.filter(item => 
                (item.media_type || item.video_type || item.image_type) === filter
            );
        }
    }
    
    // Sort by date (newest first)
    filteredMedia.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
    
    filteredMedia.forEach(item => {
        const div = document.createElement('div');
        div.className = 'media-item';
        div.onclick = () => showEnhancedMediaModal(item);
        
        const mediaType = item.media_type || item.video_type || item.image_type || 'progress';
        const isVideo = item.file_type && item.file_type.startsWith('video/');
        const isPaired = item.paired_with_id;
        
        div.innerHTML = `
            <div class="media-preview" id="media-${item.id}">
                <i class="fas fa-${isVideo ? 'video' : 'image'} text-2xl text-white/40"></i>
                <div class="media-type-badge ${mediaType}">
                    ${mediaType.toUpperCase()}
                </div>
                ${isPaired ? '<div class="pairing-indicator">📊 Paired</div>' : ''}
                <div class="media-actions">
                    <button onclick="event.stopPropagation(); deleteMedia('${item.id}')" class="delete-btn" title="Delete media">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="media-info">
                <div class="media-date">
                    ${new Date(item.uploaded_at).toLocaleDateString()}
                </div>
                ${item.description ? `
                    <div class="media-description">
                        ${item.description.length > 60 ? item.description.substring(0, 60) + '...' : item.description}
                    </div>
                ` : `
                    <div class="media-description">
                        ${isVideo ? 'Progress Video' : 'Progress Photo'} • ${(item.file_size / 1024 / 1024).toFixed(1)}MB
                    </div>
                `}
            </div>
        `;
        
        container.appendChild(div);
        
        // Load the actual media
        loadMediaPreview(item.id, `media-${item.id}`, isVideo);
    });
}

function displayBeforeAfterPairs(comparisons) {
    const container = document.getElementById('media-container');
    container.innerHTML = '';
    
    if (comparisons.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-6xl mb-4">📊</div>
                <h3 class="text-xl font-bold text-white mb-2">No Comparisons Yet</h3>
                <p class="text-white/70 mb-4">Upload before and after photos to see amazing comparisons!</p>
                <button onclick="showMediaUploadModal()" class="btn-primary">
                    Upload Before/After Photos
                </button>
            </div>
        `;
        return;
    }
    
    comparisons.forEach(comparison => {
        const div = document.createElement('div');
        div.className = 'media-item';
        div.onclick = () => showComparisonModal(comparison);
        
        div.innerHTML = `
            <div class="media-preview comparison-preview">
                <div style="display: grid; grid-template-columns: 1fr 1fr; height: 100%; gap: 2px;">
                    <div id="before-${comparison.before.id}" style="background: rgba(59, 130, 246, 0.1); display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-image text-blue-400"></i>
                    </div>
                    <div id="after-${comparison.after.id}" style="background: rgba(16, 185, 129, 0.1); display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-image text-green-400"></i>
                    </div>
                </div>
                <div class="pairing-indicator">📊 Comparison</div>
            </div>
            <div class="media-info">
                <div class="media-date">
                    ${new Date(comparison.before.uploaded_at).toLocaleDateString()} → ${new Date(comparison.after.uploaded_at).toLocaleDateString()}
                </div>
                <div class="media-description">
                    Before & After • Week ${comparison.week_number || 'N/A'}
                </div>
            </div>
        `;
        
        container.appendChild(div);
        
        // Load preview images
        loadMediaPreview(comparison.before.id, `before-${comparison.before.id}`, false);
        loadMediaPreview(comparison.after.id, `after-${comparison.after.id}`, false);
    });
}

function updateMediaStats(data) {
    const stats = data.stats || {
        total: 0,
        before_count: 0,
        after_count: 0,
        comparison_count: 0
    };
    
    document.getElementById('total-uploads').textContent = stats.total;
    document.getElementById('before-count').textContent = stats.before_count;
    document.getElementById('after-count').textContent = stats.after_count;
    document.getElementById('comparison-count').textContent = stats.comparison_count;
}

// Legacy display function for compatibility
function displayMedia(media) {
    displayEnhancedMedia({ media, stats: { total: media.length, before_count: 0, after_count: 0, comparison_count: 0 } });
}

async function loadMediaPreview(mediaId, containerId, isVideo = false) {
    try {
        const response = await fetch(`/api/media/file/${mediaId}`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const mediaUrl = URL.createObjectURL(blob);
            
            const container = document.getElementById(containerId);
            if (container) {
                if (isVideo) {
                    container.innerHTML = `
                        <video style="width: 100%; height: 100%; object-fit: cover;" muted>
                            <source src="${mediaUrl}" type="${blob.type}">
                        </video>
                    `;
                } else {
                    container.innerHTML = `
                        <img src="${mediaUrl}" alt="Progress media" style="width: 100%; height: 100%; object-fit: cover;">
                    `;
                }
            }
        }
    } catch (error) {
        console.error('Load media preview error:', error);
    }
}

// Legacy function for compatibility
async function loadMediaImage(mediaId, containerId) {
    return loadMediaPreview(mediaId, containerId, false);
}

async function showEnhancedMediaModal(media) {
    const modal = document.getElementById('media-modal');
    const content = document.getElementById('media-modal-content');
    
    try {
        const response = await fetch(`/api/media/file/${media.id}`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const mediaUrl = URL.createObjectURL(blob);
            const isVideo = (media.file_type || media.mime_type || '').startsWith('video/');
            const mediaType = media.media_type || media.video_type || media.image_type || 'progress';
            
            content.innerHTML = `
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <div class="media-type-badge ${mediaType}">
                            ${mediaType.toUpperCase()}
                        </div>
                        <div class="text-white/60 text-sm">
                            ${new Date(media.uploaded_at).toLocaleDateString()}
                        </div>
                    </div>
                    ${media.description ? `
                        <div class="bg-white/5 border border-white/10 rounded-lg p-3 mb-4">
                            <div class="text-white/90 text-sm">${media.description}</div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="media-display mb-4" style="max-height: 70vh; overflow: hidden; border-radius: 12px;">
                    ${isVideo ? `
                        <video controls style="width: 100%; max-height: 70vh; object-fit: contain;">
                            <source src="${mediaUrl}" type="${blob.type}">
                        </video>
                    ` : `
                        <img src="${mediaUrl}" alt="Progress media" style="width: 100%; max-height: 70vh; object-fit: contain;">
                    `}
                </div>
                
                <div class="flex items-center justify-between text-sm text-white/60">
                    <div>${media.filename}</div>
                    <div>${(media.file_size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                
                ${media.paired_with_id ? `
                    <div class="mt-4">
                        <button onclick="showPairedComparison('${media.id}')" class="btn-primary w-full">
                            <i class="fas fa-exchange-alt mr-2"></i>
                            View Before/After Comparison
                        </button>
                    </div>
                ` : ''}
            `;
            
            modal.classList.remove('hidden');
        } else {
            showNotification('Failed to load media', 'error');
        }
    } catch (error) {
        console.error('Media modal error:', error);
        showNotification('Failed to load media', 'error');
    }
}

// Legacy function for compatibility
async function showMediaModal(media) {
    return showEnhancedMediaModal(media);
}

// Delete media function
async function deleteMedia(mediaId) {
    if (!confirm('Are you sure you want to delete this media? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/media/${mediaId}/delete`, {
            method: 'DELETE',
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            showNotification(`Media deleted successfully! (-${data.points_deducted} pts)`, 'success');
            
            // Reload media gallery and update stats
            loadMedia();
            updateDashboardStats();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to delete media', 'error');
        }
    } catch (error) {
        console.error('Delete media error:', error);
        showNotification('Failed to delete media', 'error');
    }
}

async function showComparisonModal(comparison) {
    const modal = document.getElementById('comparison-modal');
    const content = document.getElementById('comparison-content');
    
    try {
        // Load both before and after media
        const beforeResponse = await fetch(`/api/media/file/${comparison.before.id}`, {
            headers: { 'x-session-id': sessionId }
        });
        const afterResponse = await fetch(`/api/media/file/${comparison.after.id}`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (beforeResponse.ok && afterResponse.ok) {
            const beforeBlob = await beforeResponse.blob();
            const afterBlob = await afterResponse.blob();
            const beforeUrl = URL.createObjectURL(beforeBlob);
            const afterUrl = URL.createObjectURL(afterBlob);
            
            const beforeIsVideo = (comparison.before.file_type || '').startsWith('video/');
            const afterIsVideo = (comparison.after.file_type || '').startsWith('video/');
            
            content.innerHTML = `
                <div class="comparison-item">
                    <div class="comparison-header">
                        <h4 class="text-lg font-semibold text-white">📅 Before</h4>
                        <div class="text-white/60 text-sm">${new Date(comparison.before.uploaded_at).toLocaleDateString()}</div>
                    </div>
                    <div class="comparison-media">
                        ${beforeIsVideo ? `
                            <video controls style="width: 100%; height: 100%; object-fit: cover;">
                                <source src="${beforeUrl}" type="${beforeBlob.type}">
                            </video>
                        ` : `
                            <img src="${beforeUrl}" alt="Before" style="width: 100%; height: 100%; object-fit: cover;">
                        `}
                    </div>
                    ${comparison.before.description ? `
                        <div class="p-4 text-white/80 text-sm border-t border-white/10">
                            ${comparison.before.description}
                        </div>
                    ` : ''}
                </div>
                
                <div class="comparison-item">
                    <div class="comparison-header">
                        <h4 class="text-lg font-semibold text-white">🎯 After</h4>
                        <div class="text-white/60 text-sm">${new Date(comparison.after.uploaded_at).toLocaleDateString()}</div>
                    </div>
                    <div class="comparison-media">
                        ${afterIsVideo ? `
                            <video controls style="width: 100%; height: 100%; object-fit: cover;">
                                <source src="${afterUrl}" type="${afterBlob.type}">
                            </video>
                        ` : `
                            <img src="${afterUrl}" alt="After" style="width: 100%; height: 100%; object-fit: cover;">
                        `}
                    </div>
                    ${comparison.after.description ? `
                        <div class="p-4 text-white/80 text-sm border-t border-white/10">
                            ${comparison.after.description}
                        </div>
                    ` : ''}
                </div>
            `;
            
            modal.classList.remove('hidden');
        } else {
            showNotification('Failed to load comparison', 'error');
        }
    } catch (error) {
        console.error('Comparison modal error:', error);
        showNotification('Failed to load comparison', 'error');
    }
}

// Enhanced Achievements functions
async function loadAchievements() {
    console.log('Loading achievements with sessionId:', sessionId);
    try {
        const response = await fetch('/api/achievements', {
            headers: { 'x-session-id': sessionId }
        });
        
        console.log('Achievements response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Loaded achievements:', data?.achievements?.length || 0);
            displayAchievements(data);
        } else {
            console.error('Achievements API failed:', response.status, await response.text());
        }
    } catch (error) {
        console.error('Load achievements error:', error);
    }
}

function displayAchievements(data) {
    const container = document.getElementById('achievements-container');
    container.innerHTML = '';
    
    // Store achievement stats globally for use in displayDailyChallenges
    window.achievementStats = data.stats;
    
    // Handle both grouped and flat achievement data
    const achievements = data.achievements || [];
    
    if (achievements.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="text-6xl mb-4">🏆</div>
                <h3 class="text-xl font-bold text-white mb-2">No Achievements Yet</h3>
                <p class="text-white/70">Start completing habits to unlock your first achievements!</p>
            </div>
        `;
        return;
    }
    
    // Get filter value
    const filterSelect = document.getElementById('achievement-category-filter');
    const selectedFilter = filterSelect ? filterSelect.value : 'all';
    
    // Filter achievements based on selected category
    const filteredAchievements = selectedFilter === 'all' 
        ? achievements 
        : achievements.filter(achievement => achievement.category === selectedFilter);
    
    // Create enhanced grid display for filtered achievements
    container.innerHTML = filteredAchievements.map(achievement => 
        createEnhancedAchievementCard(achievement)
    ).join('');
    
    // Add event listener for filter changes if not already added
    if (filterSelect && !filterSelect.hasAttribute('data-listener-added')) {
        filterSelect.setAttribute('data-listener-added', 'true');
        filterSelect.addEventListener('change', () => {
            loadAchievements(); // Reload achievements with new filter
        });
    }
}

function createAchievementElement(achievement) {
    const div = document.createElement('div');
    
    // Use enhanced achievement card design
    let cardClass = 'enhanced-achievement-card';
    
    if (achievement.is_completed) {
        cardClass += ' unlocked';
    } else {
        cardClass += ' locked';
    }
    
    div.className = cardClass;
    
    // Get achievement icon and color based on category
    const { icon, color } = getAchievementVisuals(achievement);
    
    // Add click handler to show achievement details
    div.style.cursor = 'pointer';
    div.addEventListener('click', () => showAchievementShowcase(achievement));
    
    // Difficulty badge colors
    const difficultyColors = {
        'easy': '#10b981',
        'medium': '#f59e0b', 
        'hard': '#ef4444',
        'legendary': '#8b5cf6'
    };
    
    div.innerHTML = `
        <div class="achievement-icon">
            ${getAchievementIcon(achievement)}
        </div>
        
        <div class="achievement-title">
            ${achievement.name}
        </div>
        
        <div class="achievement-description">
            ${achievement.description}
        </div>
        
        ${!achievement.is_completed ? `
            <div class="achievement-progress">
                <div class="text-xs opacity-70 mb-1">
                    Progress: ${achievement.current_progress}/${achievement.requirement_value}
                </div>
                <div class="achievement-progress-bar">
                    <div class="bg-white opacity-80 h-full rounded-full transition-all duration-300" 
                         style="width: ${achievement.progress_percentage}%"></div>
                </div>
            </div>
        ` : ''}
        
        <div class="achievement-footer" style="margin-top: auto;">
            <div class="flex justify-between items-center text-xs">
                <div class="flex items-center space-x-2">
                    ${achievement.points > 0 ? `<span>🏆 ${achievement.points} pts</span>` : ''}
                    <span class="px-2 py-1 rounded" style="background-color: ${difficultyColors[achievement.difficulty] || '#666666'}; color: white; font-size: 10px;">
                        ${(achievement.difficulty || 'STANDARD').toUpperCase()}
                    </span>
                </div>
                ${achievement.is_completed ? '<span style="color: #10b981;">✅</span>' : ''}
                ${achievement.is_unlockable ? '<span style="color: #f59e0b;">⭐</span>' : ''}
                ${!achievement.is_completed && !achievement.is_unlockable ? '<span style="color: rgba(255,255,255,0.4);">🔒</span>' : ''}
            </div>
            
            ${achievement.is_completed && achievement.earned_at ? `
                <div style="color: #10b981; font-size: 10px; margin-top: 4px;">
                    Earned ${new Date(achievement.earned_at).toLocaleDateString()}
                </div>
            ` : ''}
            
            ${achievement.is_unlockable ? `
                <button onclick="unlockAchievement('${achievement.id}')" 
                        style="width: 100%; margin-top: 8px; padding: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; font-size: 11px; cursor: pointer;">
                    🎉 Claim Achievement!
                </button>
            ` : ''}
        </div>
    `;
    
    return div;
}

function getAchievementIcon(achievement) {
    // Extract icon from the achievement or use default based on category
    if (achievement.name.includes('🚀')) return '🚀';
    if (achievement.name.includes('📝')) return '📝';
    if (achievement.name.includes('👣')) return '👣';
    if (achievement.name.includes('📸')) return '📸';
    if (achievement.name.includes('🎬')) return '🎬';
    if (achievement.name.includes('🔥')) return '🔥';
    if (achievement.name.includes('👑')) return '👑';
    if (achievement.name.includes('🏆')) return '🏆';
    if (achievement.name.includes('🌅')) return '🌅';
    if (achievement.name.includes('💪')) return '💪';
    if (achievement.name.includes('💯')) return '💯';
    if (achievement.name.includes('🎯')) return '🎯';
    if (achievement.name.includes('🌟')) return '🌟';
    if (achievement.name.includes('🎨')) return '🎨';
    if (achievement.name.includes('🎥')) return '🎥';
    if (achievement.name.includes('🏅')) return '🏅';
    if (achievement.name.includes('📷')) return '📷';
    if (achievement.name.includes('🦋')) return '🦋';
    
    // Default based on category
    return '⭐';
}

async function unlockAchievement(achievementId) {
    try {
        const response = await fetch('/api/achievements', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-session-id': sessionId 
            },
            body: JSON.stringify({ achievement_id: achievementId })
        });
        
        if (response.ok) {
            const data = await response.json();
            showNotification(`🎉 Achievement Unlocked: ${data.achievement.name}! +${data.points_awarded} pts`, 'success');
            
            // Update user points in header
            if (currentUser && data.points_awarded > 0) {
                currentUser.points += data.points_awarded;
                document.getElementById('user-points').textContent = `⭐ ${currentUser.points} pts`;
            }
            
            // Refresh achievements display
            loadAchievements();
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Failed to unlock achievement', 'error');
        }
    } catch (error) {
        console.error('Unlock achievement error:', error);
        showNotification('Failed to unlock achievement', 'error');
    }
}

// Achievement Notification System
function showAchievementNotification(achievement) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    
    notification.innerHTML = `
        <div class="achievement-notification-header">
            <div class="achievement-notification-icon">${getAchievementIcon(achievement)}</div>
            <div class="achievement-notification-title">🏆 Achievement Unlocked!</div>
        </div>
        <div class="achievement-notification-name">${achievement.name}</div>
        <div class="achievement-notification-description">${achievement.description}</div>
        <div class="achievement-notification-points">
            <span>🎯 ${achievement.points} points earned!</span>
            <span style="color: #fbbf24;">${achievement.difficulty.toUpperCase()}</span>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
        notification.classList.add('celebration');
    }, 100);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 5000);
    
    // Add click to dismiss
    notification.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    });
}

function showProgressHint(achievement, currentProgress, requiredProgress) {
    // Don't show hints too frequently
    const lastHintKey = `hint_${achievement.id}`;
    const lastHint = localStorage.getItem(lastHintKey);
    const now = Date.now();
    
    if (lastHint && (now - parseInt(lastHint)) < 300000) { // 5 minutes cooldown
        return;
    }
    
    localStorage.setItem(lastHintKey, now.toString());
    
    const notification = document.createElement('div');
    notification.className = 'progress-hint-notification';
    
    const progressPercentage = Math.round((currentProgress / requiredProgress) * 100);
    const remaining = requiredProgress - currentProgress;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 1.5rem; margin-right: 8px;">${getAchievementIcon(achievement)}</span>
            <div style="font-weight: 600; color: #fbbf24;">Almost there!</div>
        </div>
        <div style="font-size: 0.9rem; margin-bottom: 6px;">${achievement.name}</div>
        <div style="font-size: 0.8rem; opacity: 0.9;">
            ${remaining} more to unlock! (${progressPercentage}% complete)
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, 3000);
}

// Automatic Achievement Tracking System
async function checkAndAwardAchievements(triggerAction = 'general') {
    try {
        const response = await fetch('/api/achievements/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify({ trigger: triggerAction })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Show notifications for newly unlocked achievements
            if (data.unlocked_achievements && data.unlocked_achievements.length > 0) {
                data.unlocked_achievements.forEach((achievement, index) => {
                    setTimeout(() => {
                        showAchievementNotification(achievement);
                    }, index * 1000); // Stagger notifications
                });
            }
            
            // Show progress hints for achievements close to completion
            if (data.progress_hints && data.progress_hints.length > 0) {
                data.progress_hints.forEach((hint, index) => {
                    setTimeout(() => {
                        showProgressHint(hint.achievement, hint.current_progress, hint.required_progress);
                    }, (data.unlocked_achievements?.length || 0) * 1000 + index * 2000);
                });
            }
            
            // Show streak notifications
            if (data.streaks && data.streaks.length > 0) {
                data.streaks.forEach((streak, index) => {
                    setTimeout(() => {
                        showStreakNotification(streak);
                    }, (data.unlocked_achievements?.length || 0) * 1000 + (data.progress_hints?.length || 0) * 2000 + index * 1500);
                });
            }
            
            // Refresh achievements display if we're on that section
            const currentSection = document.querySelector('.content-section:not(.hidden)');
            if (currentSection && currentSection.id === 'achievements-section') {
                loadAchievements();
                loadDailyChallenges(); // Also refresh daily challenges
            }
            
            return data;
        }
    } catch (error) {
        console.error('Achievement check error:', error);
    }
}

// Daily Challenges and Streaks System
async function loadDailyChallenges() {
    try {
        const response = await fetch('/api/challenges/daily', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayDailyChallenges(data);
        }
    } catch (error) {
        console.error('Load daily challenges error:', error);
    }
}

function displayDailyChallenges(data) {
    // Update date display
    const dateDisplay = document.getElementById('challenge-date');
    const challengeDate = new Date(data.date);
    dateDisplay.textContent = challengeDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Display challenges
    const challengesContainer = document.getElementById('daily-challenges-container');
    challengesContainer.innerHTML = '';

    data.challenges.forEach(challenge => {
        const challengeElement = createDailyChallengeElement(challenge);
        challengesContainer.appendChild(challengeElement);
    });

    // Display achievement stats and streaks in unified container
    const statsAndStreaksContainer = document.getElementById('stats-and-streaks-container');
    statsAndStreaksContainer.innerHTML = '';
    
    // Add achievement stats cards (if available from global state)
    const achievementStats = window.achievementStats;
    if (achievementStats) {
        const achievementStatCards = [
            { icon: '🏆', label: 'Unlocked', value: achievementStats.earned_achievements, total: achievementStats.total_achievements, color: '#10b981' },
            { icon: '📈', label: 'Progress', value: `${achievementStats.completion_percentage}%`, color: '#3b82f6' },
            { icon: '⭐', label: 'Points', value: achievementStats.achievement_points, color: '#f59e0b' },
            { icon: '🎯', label: 'Ready', value: achievementStats.unlockable_count, color: '#8b5cf6' }
        ];
        
        achievementStatCards.forEach(statCard => {
            const statElement = createStatCard(statCard);
            statsAndStreaksContainer.appendChild(statElement);
        });
    }
    
    // Add streak cards
    const streakTypes = [
        { type: 'daily_login', icon: '🔥', name: 'Login Streak', color: '#f59e0b' },
        { type: 'habit_completion', icon: '💪', name: 'Habit Streak', color: '#10b981' },
        { type: 'weekly_goals', icon: '⭐', name: 'Weekly Goals', color: '#3b82f6' },
        { type: 'achievement_hunter', icon: '🏆', name: 'Achievement Hunter', color: '#8b5cf6' }
    ];

    streakTypes.forEach(streakType => {
        const streakData = data.streaks.find(s => s.streak_type === streakType.type);
        const streakElement = createStreakElement(streakType, streakData);
        statsAndStreaksContainer.appendChild(streakElement);
    });
}

function createDailyChallengeElement(challenge) {
    const div = document.createElement('div');
    const rarityClass = challenge.rarity || 'common';
    const completedClass = challenge.is_completed ? 'completed' : '';
    
    div.className = `daily-challenge-card ${rarityClass} ${completedClass}`;
    
    div.innerHTML = `
        <div class="rarity-badge rarity-${rarityClass}">${rarityClass}</div>
        <div style="font-size: 2.5rem; margin-bottom: 12px;">${challenge.icon}</div>
        <h4 style="font-weight: 600; margin-bottom: 8px; color: white;">${challenge.name}</h4>
        <p style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 12px; line-height: 1.4;">${challenge.description}</p>
        
        ${!challenge.is_completed ? `
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px; opacity: 0.8;">
                    <span>Progress</span>
                    <span>${challenge.current_progress}/${challenge.requirement_value}</span>
                </div>
                <div style="width: 100%; background: rgba(255, 255, 255, 0.2); border-radius: 10px; height: 6px; overflow: hidden;">
                    <div style="background: white; height: 100%; border-radius: 10px; transition: width 0.3s ease; width: ${challenge.progress_percentage}%;"></div>
                </div>
            </div>
        ` : `
            <div style="color: #10b981; font-weight: 600; margin-bottom: 8px;">✅ Completed!</div>
        `}
        
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem;">
            <span style="color: #fbbf24;">🏆 ${challenge.points_reward} pts</span>
            ${challenge.completed_at ? `<span style="font-size: 0.75rem; opacity: 0.8;">Completed ${new Date(challenge.completed_at).toLocaleTimeString()}</span>` : ''}
        </div>
    `;
    
    return div;
}

function createStatCard(statCard) {
    const div = document.createElement('div');
    let cardClass = 'streak-card achievement-stat-card';
    
    // Add special styling for unlockable achievements
    if (statCard.label === 'Ready' && statCard.value > 0) {
        cardClass += ' has-unlockable';
    }
    
    div.className = cardClass;
    
    div.innerHTML = `
        <div class="streak-number" style="color: ${statCard.color};">
            ${statCard.value}
        </div>
        <div style="color: white; font-weight: 600; font-size: 0.875rem; margin-bottom: 2px;">
            ${statCard.icon} ${statCard.label}
        </div>
        ${statCard.total ? `
            <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">
                of ${statCard.total}
            </div>
        ` : statCard.label === 'Ready' && statCard.value > 0 ? `
            <div style="color: #8b5cf6; font-size: 0.75rem; font-weight: 600;">
                Click to unlock!
            </div>
        ` : ''}
    `;
    
    return div;
}

function createStreakElement(streakType, streakData) {
    const div = document.createElement('div');
    div.className = 'streak-card';
    
    const currentStreak = streakData ? streakData.current_streak : 0;
    const bestStreak = streakData ? streakData.best_streak : 0;
    
    div.innerHTML = `
        <div class="streak-number ${currentStreak > 0 ? 'streak-fire' : ''}" style="color: ${streakType.color};">
            ${currentStreak}
        </div>
        <div style="color: white; font-weight: 600; font-size: 0.875rem; margin-bottom: 2px;">
            ${streakType.icon} ${streakType.name}
        </div>
        <div style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">
            Best: ${bestStreak}
        </div>
    `;
    
    return div;
}

// Enhanced achievement checking with streak notifications
function showStreakNotification(streakData) {
    if (streakData.is_new_record) {
        showNotification(`🔥 New ${streakData.type.replace('_', ' ')} record: ${streakData.current_streak} days!`, 'success');
    } else if (streakData.current_streak > 1) {
        showNotification(`🔥 ${streakData.type.replace('_', ' ')} streak: ${streakData.current_streak} days!`, 'info');
    }
}

// Leaderboards and Friends System
async function loadLeaderboards(type = 'weekly') {
    try {
        const response = await fetch(`/api/leaderboards?type=${type}`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayLeaderboards(data);
            
            // Also load achievement leaderboard if showing achievements filter
            if (type === 'achievements') {
                loadAchievementLeaderboard();
            }
        }
    } catch (error) {
        console.error('Load leaderboards error:', error);
    }
}

async function loadAchievementLeaderboard() {
    try {
        const response = await fetch('/api/leaderboards/achievements', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayAchievementLeaderboard(data);
        }
    } catch (error) {
        console.error('Load achievement leaderboard error:', error);
    }
}

function displayAchievementLeaderboard(data) {
    const container = document.getElementById('leaderboard-container');
    
    // Add achievement leaderboard card
    const achievementBoard = createLeaderboardCard(
        '🏆 Weekly Achievement Leaders', 
        data.leaderboard, 
        'achievements',
        'Most achievements unlocked this week'
    );
    
    container.appendChild(achievementBoard);
}

function displayLeaderboards(data) {
    const container = document.getElementById('leaderboard-container');
    container.innerHTML = '';
    
    // Friends Leaderboard
    const friendsBoard = createLeaderboardCard('👥 Friends Ranking', data.leaderboard, data.leaderboard_type);
    container.appendChild(friendsBoard);
    
    // Quick Stats Card
    const statsCard = createQuickStatsCard(data);
    container.appendChild(statsCard);
}

function createLeaderboardCard(title, leaderboard, type) {
    const div = document.createElement('div');
    div.className = 'leaderboard-card';
    
    const typeLabels = {
        'weekly': 'Weekly Points',
        'achievements': 'Total Achievements', 
        'streaks': 'Current Streak',
        'challenges': 'Challenges Today'
    };
    
    div.innerHTML = `
        <h4 style="color: white; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center;">
            ${title}
            <span style="margin-left: auto; font-size: 0.75rem; opacity: 0.7;">${typeLabels[type] || type}</span>
        </h4>
        <div id="leaderboard-entries">
            ${leaderboard.length === 0 ? `
                <div style="text-align: center; color: rgba(255,255,255,0.6); padding: 20px;">
                    <div style="font-size: 2rem; margin-bottom: 8px;">👥</div>
                    <div>Add friends to see rankings!</div>
                </div>
            ` : leaderboard.map(entry => `
                <div class="leaderboard-entry ${entry.is_current_user ? 'current-user' : ''}">
                    <div class="leaderboard-rank ${getRankClass(entry.rank)}">
                        ${getRankDisplay(entry.rank)}
                    </div>
                    <div class="leaderboard-user">
                        <div style="color: white; font-weight: 500;">
                            ${entry.display_name} ${entry.is_current_user ? '(You)' : ''}
                        </div>
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.8rem;">
                            ${entry.total_achievements} achievements • ${entry.weekly_points} weekly pts
                        </div>
                    </div>
                    <div class="leaderboard-score">${entry.score}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    return div;
}

function createQuickStatsCard(data) {
    const div = document.createElement('div');
    div.className = 'leaderboard-card';
    
    div.innerHTML = `
        <h4 style="color: white; font-weight: 600; margin-bottom: 16px;">📊 Your Stats</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div style="text-align: center;">
                <div style="color: #10b981; font-size: 1.5rem; font-weight: bold;">#${data.user_rank || 'N/A'}</div>
                <div style="color: rgba(255,255,255,0.7); font-size: 0.8rem;">Your Rank</div>
            </div>
            <div style="text-align: center;">
                <div style="color: #3b82f6; font-size: 1.5rem; font-weight: bold;">${data.friends_count}</div>
                <div style="color: rgba(255,255,255,0.7); font-size: 0.8rem;">Friends</div>
            </div>
        </div>
        <button onclick="showFriendsModal()" style="width: 100%; margin-top: 16px; padding: 8px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;">
            👥 Manage Friends
        </button>
    `;
    
    return div;
}

function getRankClass(rank) {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
}

function getRankDisplay(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
}

async function showFriendsModal() {
    try {
        const response = await fetch('/api/friends', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayFriendsModal(data);
        }
    } catch (error) {
        console.error('Load friends error:', error);
    }
}

function displayFriendsModal(data) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content friends-modal">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="color: white; margin: 0;">👥 Friends & Requests</h3>
                <button onclick="this.closest('.modal').remove()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">×</button>
            </div>
            
            <!-- Add Friend Section -->
            <div style="margin-bottom: 24px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <h4 style="color: white; margin-bottom: 12px;">Add New Friend</h4>
                <div style="display: flex; gap: 8px;">
                    <input type="email" id="friend-email-input" placeholder="Enter email address..." 
                           style="flex: 1; padding: 8px 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: white;">
                    <button onclick="sendFriendRequest()" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;">
                        Send Request
                    </button>
                </div>
            </div>
            
            <!-- Pending Requests -->
            ${data.pending_requests.length > 0 ? `
                <div style="margin-bottom: 24px;">
                    <h4 style="color: white; margin-bottom: 12px;">📬 Pending Requests (${data.pending_requests.length})</h4>
                    ${data.pending_requests.map(request => `
                        <div class="friend-request-card">
                            <div>
                                <div style="color: white; font-weight: 500;">${request.email}</div>
                                <div style="color: rgba(255,255,255,0.6); font-size: 0.8rem;">${new Date(request.created_at).toLocaleDateString()}</div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button onclick="respondToFriendRequest('${request.id}', 'accept')" 
                                        style="padding: 4px 12px; background: #10b981; color: white; border: none; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">
                                    Accept
                                </button>
                                <button onclick="respondToFriendRequest('${request.id}', 'decline')" 
                                        style="padding: 4px 12px; background: #ef4444; color: white; border: none; border-radius: 4px; font-size: 0.8rem; cursor: pointer;">
                                    Decline
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <!-- Friends List -->
            <div>
                <h4 style="color: white; margin-bottom: 12px;">👫 Friends (${data.friends.length})</h4>
                ${data.friends.length === 0 ? `
                    <div style="text-align: center; color: rgba(255,255,255,0.6); padding: 20px;">
                        No friends yet. Start by adding some friends above!
                    </div>
                ` : data.friends.map(friend => `
                    <div class="friend-request-card">
                        <div>
                            <div style="color: white; font-weight: 500;">${friend.email}</div>
                            <div style="color: rgba(255,255,255,0.6); font-size: 0.8rem;">
                                ${friend.total_achievements} achievements • ${friend.weekly_points} weekly points
                            </div>
                        </div>
                        <div style="color: #10b981; font-weight: 600;">Friends since ${new Date(friend.friendship_date).toLocaleDateString()}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function sendFriendRequest() {
    const email = document.getElementById('friend-email-input').value.trim();
    if (!email) {
        showNotification('Please enter an email address', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/friends', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify({ action: 'send_request', email })
        });
        
        const data = await response.json();
        if (response.ok) {
            showNotification(data.message, 'success');
            document.getElementById('friend-email-input').value = '';
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        showNotification('Failed to send friend request', 'error');
    }
}

async function respondToFriendRequest(requestId, action) {
    try {
        const response = await fetch('/api/friends', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify({ 
                action: action === 'accept' ? 'accept_request' : 'decline_request', 
                request_id: requestId 
            })
        });
        
        const data = await response.json();
        if (response.ok) {
            showNotification(data.message, 'success');
            // Refresh the friends modal
            setTimeout(() => {
                document.querySelector('.modal')?.remove();
                showFriendsModal();
                loadLeaderboards(); // Refresh leaderboards
            }, 1000);
        } else {
            showNotification(data.error, 'error');
        }
    } catch (error) {
        showNotification('Failed to respond to request', 'error');
    }
}

// Nutrition Tracking Functions
async function loadNutrition() {
    try {
        const response = await fetch('/api/nutrition', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayNutrition(data);
        }
    } catch (error) {
        console.error('Load nutrition error:', error);
    }
}

function displayNutrition(data) {
    // Display nutrition summary
    const summaryContainer = document.getElementById('nutrition-stats');
    summaryContainer.innerHTML = '';
    
    if (data.daily_summary) {
        const summary = data.daily_summary;
        const stats = [
            { label: 'Calories', value: summary.total_calories, goal: summary.calorie_goal, unit: 'kcal', color: '#f59e0b' },
            { label: 'Protein', value: Math.round(summary.total_protein_g), goal: Math.round(summary.protein_goal_g), unit: 'g', color: '#10b981' },
            { label: 'Carbs', value: Math.round(summary.total_carbs_g), goal: Math.round(summary.carbs_goal_g), unit: 'g', color: '#3b82f6' },
            { label: 'Fat', value: Math.round(summary.total_fat_g), goal: Math.round(summary.fat_goal_g), unit: 'g', color: '#8b5cf6' }
        ];
        
        stats.forEach(stat => {
            const statElement = document.createElement('div');
            statElement.className = 'text-center p-3 bg-white/5 rounded-lg';
            statElement.innerHTML = `
                <div class="text-2xl font-bold" style="color: ${stat.color};">${stat.value}</div>
                <div class="text-white text-sm">${stat.label}</div>
                <div class="text-white/60 text-xs">Goal: ${stat.goal}${stat.unit}</div>
                <div class="w-full bg-white/10 rounded-full h-1 mt-2">
                    <div class="h-1 rounded-full" style="background-color: ${stat.color}; width: ${Math.min((stat.value / stat.goal) * 100, 100)}%;"></div>
                </div>
            `;
            summaryContainer.appendChild(statElement);
        });
    } else {
        summaryContainer.innerHTML = '<div class="col-span-4 text-center text-white/60 py-8">No nutrition data logged today. Start by logging your first meal!</div>';
    }
    
    // Display food log
    const logContainer = document.getElementById('food-log-container');
    logContainer.innerHTML = '';
    
    if (data.logs && data.logs.length > 0) {
        data.logs.forEach(log => {
            const logElement = createFoodLogElement(log);
            logContainer.appendChild(logElement);
        });
    } else {
        logContainer.innerHTML = '<div class="text-center text-white/60 py-8 bg-white/5 rounded-lg">No food logged today. Click "Log Food" to get started!</div>';
    }
}

function createFoodLogElement(log) {
    const div = document.createElement('div');
    div.className = 'mb-4 p-4 bg-white/5 border border-white/10 rounded-lg';
    
    const mealTypeColors = {
        breakfast: '#f59e0b',
        lunch: '#10b981', 
        dinner: '#3b82f6',
        snack: '#8b5cf6'
    };
    
    div.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <div>
                <h4 class="text-white font-medium">${log.food_name}</h4>
                <span class="inline-block px-2 py-1 rounded text-xs text-white" style="background-color: ${mealTypeColors[log.meal_type]};">
                    ${log.meal_type.charAt(0).toUpperCase() + log.meal_type.slice(1)}
                </span>
                ${log.is_custom_recipe ? '<span class="ml-2 text-xs bg-purple-600 text-white px-2 py-1 rounded">Custom Recipe</span>' : ''}
            </div>
            <div class="text-white/70 text-sm">${new Date(log.created_at).toLocaleTimeString()}</div>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            ${log.calories > 0 ? `<div class="text-center"><div class="text-white font-medium">${log.calories}</div><div class="text-white/60 text-xs">calories</div></div>` : ''}
            ${log.protein_g > 0 ? `<div class="text-center"><div class="text-white font-medium">${Math.round(log.protein_g)}g</div><div class="text-white/60 text-xs">protein</div></div>` : ''}
            ${log.carbs_g > 0 ? `<div class="text-center"><div class="text-white font-medium">${Math.round(log.carbs_g)}g</div><div class="text-white/60 text-xs">carbs</div></div>` : ''}
            ${log.fat_g > 0 ? `<div class="text-center"><div class="text-white font-medium">${Math.round(log.fat_g)}g</div><div class="text-white/60 text-xs">fat</div></div>` : ''}
        </div>
    `;
    
    return div;
}

function showNutritionModal() {
    showModal('nutrition-modal');
}

async function submitNutrition(event) {
    event.preventDefault();
    
    const formData = {
        food_name: document.getElementById('food-name').value,
        meal_type: document.getElementById('meal-type').value,
        calories: parseFloat(document.getElementById('calories').value) || 0,
        protein_g: parseFloat(document.getElementById('protein').value) || 0,
        carbs_g: parseFloat(document.getElementById('carbs').value) || 0,
        fat_g: parseFloat(document.getElementById('fat').value) || 0,
        sugar_g: parseFloat(document.getElementById('sugar').value) || 0,
        fiber_g: parseFloat(document.getElementById('fiber').value) || 0,
        water_ml: parseFloat(document.getElementById('water-ml').value) || 0,
        is_custom_recipe: document.getElementById('is-custom-recipe').checked
    };
    
    try {
        const response = await fetch('/api/nutrition', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const data = await response.json();
            showNotification(data.message + ` (+${data.points_earned} pts)`, 'success');
            closeModal('nutrition-modal');
            document.getElementById('nutrition-form').reset();
            loadNutrition(); // Refresh the nutrition display
            
            // Check for achievements
            checkAndAwardAchievements('nutrition_log');
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Failed to log nutrition', 'error');
        }
    } catch (error) {
        console.error('Nutrition submission error:', error);
        showNotification('Failed to log nutrition', 'error');
    }
}

// Admin functions
async function loadAdminData() {
    if (currentUser && currentUser.role === 'admin') {
        await Promise.all([
            loadAdminStats(),
            loadAdminUsers(),
            loadAdminMedia()
        ]);
    }
}

async function loadAdminStats() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            const stats = data.stats;
            document.getElementById('admin-total-users').textContent = stats.total_users;
            document.getElementById('admin-total-media').textContent = stats.total_media;
            document.getElementById('admin-total-habits').textContent = stats.total_habits;
            document.getElementById('admin-flagged-media').textContent = stats.flaggedMedia;
        }
    } catch (error) {
        console.error('Load admin stats error:', error);
    }
}

async function loadAdminUsers() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const users = await response.json();
            displayAdminUsers(users);
        }
    } catch (error) {
        console.error('Load admin users error:', error);
    }
}

function displayAdminUsers(users) {
    const tbody = document.getElementById('admin-users-table');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.className = 'border-b border-white/5 hover:bg-white/5';
        
        row.innerHTML = `
            <td class="py-3 px-4 text-white">${user.email.split('@')[0]}</td>
            <td class="py-3 px-4 text-white/70">${user.email}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'} text-white">
                    ${user.role}
                </span>
            </td>
            <td class="py-3 px-4 text-white/70">${user.points || 0} pts</td>
            <td class="py-3 px-4">
                ${user.role !== 'admin' ? `<button onclick="deleteAdminUser(${user.id})" class="btn-danger text-xs">Delete</button>` : ''}
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

async function loadAdminMedia() {
    try {
        const response = await fetch('/api/admin/media', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const media = await response.json();
            displayAdminMedia(media);
        }
    } catch (error) {
        console.error('Load admin media error:', error);
    }
}

function displayAdminMedia(media) {
    const tbody = document.getElementById('admin-media-table');
    tbody.innerHTML = '';
    
    media.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'border-b border-white/5 hover:bg-white/5';
        
        row.innerHTML = `
            <td class="py-3 px-4">
                <div class="w-16 h-16 bg-gray-700 rounded flex items-center justify-center" id="admin-media-${item.id}">
                    <i class="fas fa-image text-gray-400"></i>
                </div>
            </td>
            <td class="py-3 px-4 text-white">${item.filename}</td>
            <td class="py-3 px-4 text-white/70">${item.userEmail}</td>
            <td class="py-3 px-4 text-white/70">${new Date(item.uploaded_at).toLocaleDateString()}</td>
            <td class="py-3 px-4 text-white/70">${(item.file_size / 1024 / 1024).toFixed(2)} MB</td>
            <td class="py-3 px-4">
                <button onclick="toggleAdminMediaFlag(${item.id}, this)" 
                        class="btn-secondary text-xs ${item.flagged ? 'bg-red-600' : ''}">
                    ${item.flagged ? 'Unflag' : 'Flag'}
                </button>
            </td>
            <td class="py-3 px-4">
                <button onclick="downloadAdminMedia(${item.id}, '${item.filename}')" class="btn-secondary text-xs mr-2">Download</button>
                <button onclick="deleteAdminMedia(${item.id})" class="btn-danger text-xs">Delete</button>
            </td>
        `;
        
        tbody.appendChild(row);
        
        // Load media preview
        loadAdminMediaImage(item.id, `admin-media-${item.id}`);
    });
}

async function loadAdminMediaImage(mediaId, containerId) {
    try {
        const response = await fetch(`/api/media/file/${mediaId}`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `<img src="${imageUrl}" class="w-full h-full object-cover rounded" alt="Media preview">`;
            }
        }
    } catch (error) {
        console.error('Admin media image load error:', error);
    }
}

async function deleteAdminUser(userId) {
    showConfirmationModal('Are you sure you want to delete this user? This action cannot be undone and will permanently remove all their data.', async function() {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'x-session-id': sessionId }
            });
            
            if (response.ok) {
                showNotification('User deleted successfully', 'success');
                loadAdminUsers();
                loadAdminStats();
            } else {
                const data = await response.json();
                showNotification(data.error || 'Failed to delete user', 'error');
            }
        } catch (error) {
            console.error('Delete user error:', error);
            showNotification('Failed to delete user', 'error');
        }
    });
}

async function deleteAdminMedia(mediaId) {
    showConfirmationModal('Are you sure you want to delete this media file? This action cannot be undone.', async function() {
        try {
            const response = await fetch(`/api/admin/media/${mediaId}`, {
                method: 'DELETE',
                headers: { 'x-session-id': sessionId }
            });
            
            if (response.ok) {
                showNotification('Media deleted successfully', 'success');
                loadAdminMedia();
                loadAdminStats();
            } else {
                const data = await response.json();
                showNotification(data.error || 'Failed to delete media', 'error');
            }
        } catch (error) {
            console.error('Delete media error:', error);
            showNotification('Failed to delete media', 'error');
        }
    });
}

async function toggleAdminMediaFlag(mediaId, button) {
    try {
        const response = await fetch(`/api/admin/media/${mediaId}/flag`, {
            method: 'POST',
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            button.textContent = data.flagged ? 'Unflag' : 'Flag';
            button.className = `btn-secondary text-xs ${data.flagged ? 'bg-red-600' : ''}`;
            showNotification(data.flagged ? 'Media flagged' : 'Media unflagged', 'success');
            loadAdminStats();
        } else {
            const data = await response.json();
            showNotification(data.error || 'Failed to update flag', 'error');
        }
    } catch (error) {
        console.error('Toggle flag error:', error);
        showNotification('Failed to update media flag', 'error');
    }
}

async function downloadAdminMedia(mediaId, filename) {
    try {
        const response = await fetch(`/api/admin/media/${mediaId}/download`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showNotification('File downloaded successfully! 📥', 'success');
        } else {
            const errorData = await response.json();
            showNotification('Download failed: ' + (errorData.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Admin download error:', error);
        showNotification('Download failed: ' + error.message, 'error');
    }
}

// UI functions
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    
    // Reset all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected section and highlight tab
    document.getElementById(`${section}-section`).classList.remove('hidden');
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Load section-specific data
    if (section === 'habits') {
        updateCurrentWeekDisplay();
        loadHabits();
    } else if (section === 'progress') {
        loadMedia();
    } else if (section === 'nutrition') {
        loadNutrition();
    } else if (section === 'goals') {
        loadGoals();
    } else if (section === 'achievements') {
        loadAchievements();
        loadDailyChallenges();
        loadWeeklyChallenges();
        setupChallengeNavigation();
    } else if (section === 'social') {
        loadSocialHub();
    } else if (section === 'admin') {
        loadAdminData();
    }
}

function showAdminSection(section) {
    document.getElementById('admin-users-section').classList.add('hidden');
    document.getElementById('admin-media-section').classList.add('hidden');
    
    document.getElementById('admin-users-tab').classList.remove('active');
    document.getElementById('admin-media-tab').classList.remove('active');
    
    document.getElementById(`admin-${section}-section`).classList.remove('hidden');
    document.getElementById(`admin-${section}-tab`).classList.add('active');
}

function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function updateDashboardStats() {
    // This will be called after loading habits to update the dashboard stats
    // Implementation depends on the loaded data
}

// Global Confirmation Modal functions
let confirmationCallback = null;

function showConfirmationModal(message, onConfirm) {
    document.getElementById('confirmation-message').textContent = message;
    confirmationCallback = onConfirm;
    document.getElementById('confirmation-modal').classList.remove('hidden');
    
    // Set up the confirm button click handler
    document.getElementById('confirm-delete-btn').onclick = function() {
        closeConfirmationModal();
        if (confirmationCallback) {
            confirmationCallback();
            confirmationCallback = null;
        }
    };
}

function closeConfirmationModal() {
    document.getElementById('confirmation-modal').classList.add('hidden');
    confirmationCallback = null;
}

// PWA functions
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showNotification('StriveTrack installed successfully! 📱', 'success');
            }
            deferredPrompt = null;
        });
    } else {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        if (isIOS) {
            showNotification('📱 To install: Tap Share button → Add to Home Screen', 'info');
        } else if (isAndroid) {
            showNotification('📱 To install: Open menu (⋮) → Add to Home Screen', 'info');
        } else {
            showNotification('📱 To install: Click browser menu → Install app', 'info');
        }
    }
}

// ============================================================================
// ENHANCED ACHIEVEMENT CELEBRATION SYSTEM
// ============================================================================

// Achievement Celebration Functions
function celebrateAchievement(achievement) {
    // Show enhanced notification
    showAchievementNotification(achievement);
    
    // Play rarity-based confetti
    playAchievementConfetti(achievement.rarity);
    
    // Play achievement sound
    playAchievementSound(achievement.rarity);
    
    // Update achievement counters
    updateAchievementCounters();
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = `notification achievement ${achievement.rarity} show`;
    
    const iconEmoji = getAchievementIcon(achievement);
    
    notification.innerHTML = `
        <div class="achievement-notification-icon">${iconEmoji}</div>
        <div class="achievement-notification-title">${achievement.name}</div>
        <div class="achievement-notification-desc">${achievement.description}</div>
        <div class="achievement-notification-rarity">${achievement.rarity} Achievement</div>
        <div style="margin-top: 8px; font-weight: 600;">+${achievement.points} points 🏆</div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function playAchievementConfetti(rarity) {
    const confettiConfig = {
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    };
    
    switch (rarity) {
        case 'common':
            confetti({
                ...confettiConfig,
                particleCount: 50,
                colors: ['#9ca3af', '#6b7280']
            });
            break;
            
        case 'rare':
            confetti({
                ...confettiConfig,
                particleCount: 75,
                colors: ['#3b82f6', '#60a5fa', '#93c5fd']
            });
            break;
            
        case 'epic':
            // Double burst for epic
            confetti({
                ...confettiConfig,
                particleCount: 100,
                colors: ['#8b5cf6', '#a78bfa', '#c4b5fd']
            });
            setTimeout(() => {
                confetti({
                    ...confettiConfig,
                    particleCount: 50,
                    colors: ['#8b5cf6', '#a78bfa']
                });
            }, 300);
            break;
            
        case 'legendary':
            // Triple burst with golden colors
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    confetti({
                        ...confettiConfig,
                        particleCount: 150,
                        colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#ef4444', '#f87171']
                    });
                }, i * 200);
            }
            break;
    }
}

function playAchievementSound(rarity) {
    // Create audio context for achievement sounds
    if (!window.audioContext) {
        try {
            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio context not supported');
            return;
        }
    }
    
    const audioContext = window.audioContext;
    
    // Different frequencies for different rarities
    const soundConfig = {
        common: { frequency: 440, duration: 0.2 },
        rare: { frequency: 523, duration: 0.3 },
        epic: { frequency: 659, duration: 0.4 },
        legendary: { frequency: 880, duration: 0.5 }
    };
    
    const config = soundConfig[rarity] || soundConfig.common;
    
    // Create oscillator for achievement sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    // Envelope for natural sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + config.duration);
}

// Achievement Showcase Modal Functions
function showAchievementShowcase(achievement) {
    const modal = document.getElementById('achievement-showcase-modal');
    
    // Populate achievement details
    document.getElementById('achievement-showcase-icon').textContent = getAchievementIcon(achievement);
    document.getElementById('achievement-showcase-title').textContent = achievement.name;
    document.getElementById('achievement-showcase-desc').textContent = achievement.description;
    
    // Set rarity styling
    const rarityElement = document.getElementById('achievement-showcase-rarity');
    rarityElement.textContent = achievement.rarity.toUpperCase();
    rarityElement.className = `achievement-showcase-rarity ${achievement.rarity}`;
    
    // Update rarity styling
    const rarityColors = {
        common: 'background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);',
        rare: 'background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);',
        epic: 'background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);',
        legendary: 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);'
    };
    rarityElement.style.cssText = rarityColors[achievement.rarity] || rarityColors.common;
    
    // Populate stats
    document.getElementById('achievement-points').textContent = achievement.points;
    document.getElementById('achievement-progress').textContent = achievement.is_completed ? '100%' : `${achievement.progress_percentage}%`;
    document.getElementById('achievement-rarity-percent').textContent = getRarityPercentage(achievement.rarity);
    document.getElementById('achievement-unlock-date').textContent = achievement.earned_at ? 
        new Date(achievement.earned_at).toLocaleDateString() : 'Not unlocked';
    
    // Populate timeline
    populateAchievementTimeline(achievement);
    
    modal.classList.remove('hidden');
}

function closeAchievementShowcase() {
    const modal = document.getElementById('achievement-showcase-modal');
    modal.classList.add('hidden');
}

function populateAchievementTimeline(achievement) {
    const timelineContainer = document.getElementById('achievement-timeline-content');
    
    const timelineEvents = [];
    
    if (achievement.is_completed && achievement.earned_at) {
        timelineEvents.push({
            date: achievement.earned_at,
            title: 'Achievement Unlocked! 🎉',
            description: `Earned this ${achievement.rarity} achievement`
        });
    }
    
    // Add progress milestones
    if (achievement.current_progress > 0) {
        const milestones = [25, 50, 75, 100];
        milestones.forEach(milestone => {
            if (achievement.progress_percentage >= milestone) {
                timelineEvents.push({
                    date: new Date().toISOString(), // Placeholder - would need actual tracking
                    title: `${milestone}% Progress`,
                    description: `Reached ${milestone}% completion`
                });
            }
        });
    }
    
    // Sort by date (newest first)
    timelineEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (timelineEvents.length === 0) {
        timelineContainer.innerHTML = `
            <div class="text-white/60 text-center py-4">
                <i class="fas fa-clock text-2xl mb-2 block"></i>
                No progress recorded yet. Start working towards this achievement!
            </div>
        `;
        return;
    }
    
    timelineContainer.innerHTML = timelineEvents.map(event => `
        <div class="achievement-timeline-item">
            <div>
                <div class="text-white font-medium">${event.title}</div>
                <div class="text-white/70 text-sm">${event.description}</div>
                <div class="text-white/50 text-xs mt-1">${new Date(event.date).toLocaleDateString()}</div>
            </div>
        </div>
    `).join('');
}

function getRarityPercentage(rarity) {
    // Simulate rarity percentages
    const rarityStats = {
        common: '65%',
        rare: '25%', 
        epic: '8%',
        legendary: '2%'
    };
    return rarityStats[rarity] || '0%';
}

// Achievement Combo & Streak System
let achievementComboCount = 0;
let achievementComboTimer = null;

function checkAchievementCombos() {
    achievementComboCount++;
    
    // Reset combo timer
    if (achievementComboTimer) {
        clearTimeout(achievementComboTimer);
    }
    
    // Check for combo achievements
    if (achievementComboCount >= 3) {
        triggerComboAchievement('achievement_spree', 'Achievement Spree!', 'Unlocked 3 achievements in quick succession');
    }
    
    if (achievementComboCount >= 5) {
        triggerComboAchievement('achievement_frenzy', 'Achievement Frenzy!', 'Unlocked 5 achievements in a short time');
    }
    
    // Reset combo after 30 seconds of inactivity
    achievementComboTimer = setTimeout(() => {
        achievementComboCount = 0;
    }, 30000);
}

function triggerComboAchievement(id, name, description) {
    const comboAchievement = {
        id: id,
        name: name,
        description: description,
        rarity: 'epic',
        points: 100,
        is_completed: true,
        earned_at: new Date().toISOString()
    };
    
    celebrateAchievement(comboAchievement);
}

function updateAchievementCounters() {
    // Update the achievement counters in the UI
    setTimeout(() => {
        loadAchievements();
        if (typeof loadLeaderboards === 'function') {
            loadLeaderboards();
        }
    }, 1000);
}

// Enhanced unlock achievement function with celebrations
async function unlockAchievement(achievementId) {
    try {
        const response = await fetch('/api/achievements/unlock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify({ achievement_id: achievementId })
        });

        if (response.ok) {
            const result = await response.json();
            
            // Celebrate the achievement
            celebrateAchievement(result.achievement);
            
            // Check for combos
            checkAchievementCombos();
            
            // Reload achievements to update UI
            loadAchievements();
            
        } else {
            showNotification('Failed to unlock achievement', 'error');
        }
    } catch (error) {
        console.error('Unlock achievement error:', error);
        showNotification('Failed to unlock achievement', 'error');
    }
}


// Goals functionality
async function loadGoals() {
    console.log('Loading goals...');
    
    // For now, display placeholder goals since we don't have backend API yet
    displayGoals([
        {
            id: 'goal-1',
            name: '🏃‍♂️ Run 5K',
            description: 'Complete a 5K run in under 30 minutes',
            category: 'endurance',
            target_value: 30,
            current_value: 0,
            unit: 'minutes',
            status: 'active',
            progress_percentage: 0,
            deadline: '2024-12-31',
            created_at: '2024-09-09'
        },
        {
            id: 'goal-2',
            name: '💪 Bench Press 100kg',
            description: 'Increase bench press to 100kg',
            category: 'strength',
            target_value: 100,
            current_value: 75,
            unit: 'kg',
            status: 'active',
            progress_percentage: 75,
            deadline: '2024-11-30',
            created_at: '2024-08-15'
        },
        {
            id: 'goal-3',
            name: '🔥 30-Day Habit Streak',
            description: 'Maintain daily workout habit for 30 days',
            category: 'habit',
            target_value: 30,
            current_value: 30,
            unit: 'days',
            status: 'completed',
            progress_percentage: 100,
            deadline: '2024-09-01',
            created_at: '2024-08-01'
        }
    ]);
}

function displayGoals(goals) {
    const activeContainer = document.getElementById('active-goals-container');
    const completedContainer = document.getElementById('completed-goals-container');
    
    if (!activeContainer || !completedContainer) {
        console.error('Goals containers not found');
        return;
    }
    
    activeContainer.innerHTML = '';
    completedContainer.innerHTML = '';
    
    const activeGoals = goals.filter(goal => goal.status === 'active');
    const completedGoals = goals.filter(goal => goal.status === 'completed');
    
    // Display active goals
    if (activeGoals.length === 0) {
        activeContainer.innerHTML = '<p class="text-white/70 col-span-full text-center">No active goals. Create your first goal to get started!</p>';
    } else {
        activeGoals.forEach(goal => {
            const goalElement = createGoalElement(goal);
            activeContainer.appendChild(goalElement);
        });
    }
    
    // Display completed goals
    if (completedGoals.length === 0) {
        completedContainer.innerHTML = '<p class="text-white/70 col-span-full text-center">No completed goals yet.</p>';
    } else {
        completedGoals.forEach(goal => {
            const goalElement = createGoalElement(goal);
            completedContainer.appendChild(goalElement);
        });
    }
    
    // Update statistics
    updateGoalStats(goals);
}

function createGoalElement(goal) {
    const div = document.createElement('div');
    div.className = 'bg-white/5 border border-white/10 rounded-lg p-6 transition-all hover:bg-white/10';
    
    const isCompleted = goal.status === 'completed';
    const progressColor = isCompleted ? 'bg-green-500' : 'bg-blue-500';
    const statusIcon = isCompleted ? '✅' : '🎯';
    
    div.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div>
                <h4 class="text-lg font-bold text-white mb-2">${goal.name}</h4>
                <p class="text-white/70 text-sm">${goal.description}</p>
            </div>
            <span class="text-2xl">${statusIcon}</span>
        </div>
        
        <div class="mb-4">
            <div class="flex justify-between items-center mb-2">
                <span class="text-white/70 text-sm">Progress</span>
                <span class="text-white font-semibold">${goal.current_value}/${goal.target_value} ${goal.unit}</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2">
                <div class="${progressColor} h-2 rounded-full transition-all duration-300" 
                     style="width: ${goal.progress_percentage}%"></div>
            </div>
            <div class="text-right text-white/60 text-xs mt-1">${goal.progress_percentage}%</div>
        </div>
        
        <div class="flex justify-between items-center text-sm">
            <div class="text-white/60">
                <i class="fas fa-calendar mr-1"></i>
                ${isCompleted ? 'Completed' : 'Target'}: ${new Date(goal.deadline).toLocaleDateString()}
            </div>
            <div class="flex space-x-2">
                ${!isCompleted ? `
                    <button class="btn-secondary text-xs px-2 py-1" onclick="updateGoalProgress('${goal.id}')">
                        Update
                    </button>
                ` : ''}
                <button class="btn-secondary text-xs px-2 py-1" onclick="viewGoalDetails('${goal.id}')">
                    Details
                </button>
            </div>
        </div>
    `;
    
    return div;
}

function updateGoalStats(goals) {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const activeGoals = goals.filter(g => g.status === 'active').length;
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    
    document.getElementById('total-goals').textContent = totalGoals;
    document.getElementById('completed-goals-count').textContent = completedGoals;
    document.getElementById('active-goals-count').textContent = activeGoals;
    document.getElementById('goals-completion-rate').textContent = `${completionRate}%`;
}

function showCreateGoalModal() {
    // Placeholder for now
    showNotification('Create Goal feature coming soon! 🎯', 'info');
}

function updateGoalProgress(goalId) {
    // Placeholder for now
    showNotification('Update progress for goal - coming soon!', 'info');
}

function viewGoalDetails(goalId) {
    // Placeholder for now
    showNotification('View goal details - coming soon!', 'info');
}

// Daily challenges functionality
async function loadDailyChallenges() {
    console.log('Loading daily challenges...');
    
    // For now, use placeholder daily challenges data
    const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Update challenge date
    document.getElementById('challenge-date').textContent = currentDate;
    
    // Generate daily challenges based on current date
    const challenges = generateDailyChallenges();
    displayDailyChallenges(challenges);
    
    // Load user progress and stats
    loadUserProgressStats();
}

function generateDailyChallenges() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Define different challenges for each day of the week
    const challengeTemplates = {
        0: [ // Sunday - Recovery day
            { id: 'sunday_1', type: 'habits', title: 'Morning Routine', description: 'Complete your morning routine habit', points: 10, icon: '☀️' },
            { id: 'sunday_2', type: 'social', title: 'Connect & Share', description: 'Share your weekly progress with friends', points: 15, icon: '📱' },
            { id: 'sunday_3', type: 'planning', title: 'Weekly Planning', description: 'Set goals for the upcoming week', points: 20, icon: '📋' }
        ],
        1: [ // Monday - Fresh start
            { id: 'monday_1', type: 'habits', title: 'Monday Motivation', description: 'Log your first habit of the week', points: 15, icon: '🚀' },
            { id: 'monday_2', type: 'progress', title: 'Progress Photo', description: 'Take a progress photo to track changes', points: 25, icon: '📸' },
            { id: 'monday_3', type: 'goals', title: 'Goal Check-in', description: 'Update progress on one of your goals', points: 20, icon: '🎯' }
        ],
        2: [ // Tuesday
            { id: 'tuesday_1', type: 'habits', title: 'Consistency Builder', description: 'Complete 3 different habits today', points: 25, icon: '🔥' },
            { id: 'tuesday_2', type: 'nutrition', title: 'Nutrition Tracking', description: 'Log your meals for today', points: 20, icon: '🍎' },
            { id: 'tuesday_3', type: 'social', title: 'Motivation Boost', description: 'Encourage a friend on their journey', points: 15, icon: '💪' }
        ],
        3: [ // Wednesday - Hump day
            { id: 'wednesday_1', type: 'habits', title: 'Midweek Push', description: 'Complete habits for 3 days in a row', points: 30, icon: '⚡' },
            { id: 'wednesday_2', type: 'achievement', title: 'Achievement Hunter', description: 'Unlock a new achievement today', points: 35, icon: '🏆' },
            { id: 'wednesday_3', type: 'data', title: 'Analytics Review', description: 'Check your weekly progress stats', points: 15, icon: '📊' }
        ],
        4: [ // Thursday
            { id: 'thursday_1', type: 'habits', title: 'Habit Streak', description: 'Maintain your longest habit streak', points: 20, icon: '🔥' },
            { id: 'thursday_2', type: 'challenge', title: 'Personal Challenge', description: 'Push yourself beyond comfort zone', points: 40, icon: '💯' },
            { id: 'thursday_3', type: 'media', title: 'Document Journey', description: 'Upload a transformation video or photo', points: 25, icon: '🎥' }
        ],
        5: [ // Friday
            { id: 'friday_1', type: 'habits', title: 'Week Strong Finish', description: 'Complete all planned habits today', points: 30, icon: '🏁' },
            { id: 'friday_2', type: 'social', title: 'Weekend Planning', description: 'Plan active weekend with friends', points: 20, icon: '🎉' },
            { id: 'friday_3', type: 'reflection', title: 'Weekly Reflection', description: 'Reflect on this week\'s progress', points: 25, icon: '🤔' }
        ],
        6: [ // Saturday - Active day
            { id: 'saturday_1', type: 'habits', title: 'Weekend Warrior', description: 'Complete active habits on weekend', points: 25, icon: '⚔️' },
            { id: 'saturday_2', type: 'challenge', title: 'Weekend Challenge', description: 'Try a new fitness activity', points: 35, icon: '🏃‍♂️' },
            { id: 'saturday_3', type: 'social', title: 'Community Support', description: 'Help or motivate 2 community members', points: 30, icon: '🤝' }
        ]
    };
    
    return challengeTemplates[dayOfWeek] || challengeTemplates[1];
}

function displayDailyChallenges(challenges) {
    const container = document.getElementById('daily-challenges-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    challenges.forEach(challenge => {
        const challengeElement = createDailyChallengeElement(challenge);
        container.appendChild(challengeElement);
    });
}

function createDailyChallengeElement(challenge) {
    const div = document.createElement('div');
    div.className = 'daily-challenge-card bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer';
    
    // Generate random completion status for demo (in real app, this would come from backend)
    const isCompleted = Math.random() > 0.7;
    const completedClass = isCompleted ? 'opacity-60' : '';
    const completedIcon = isCompleted ? '✅' : '';
    
    div.innerHTML = `
        <div class="flex items-start justify-between mb-3 ${completedClass}">
            <div class="flex items-center space-x-3">
                <div class="text-2xl">${challenge.icon}</div>
                <div>
                    <h4 class="text-white font-semibold text-sm">${challenge.title}</h4>
                    <p class="text-white/70 text-xs mt-1">${challenge.description}</p>
                </div>
            </div>
            <div class="text-right">
                <div class="text-yellow-400 font-bold text-sm">+${challenge.points}pts</div>
                ${completedIcon ? `<div class="text-green-400 text-lg">${completedIcon}</div>` : ''}
            </div>
        </div>
        <div class="flex items-center justify-between">
            <span class="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80 capitalize">${challenge.type}</span>
            ${!isCompleted ? `
                <button class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                        onclick="completeDailyChallenge('${challenge.id}')">
                    Complete
                </button>
            ` : `
                <span class="text-green-400 text-xs font-semibold">Completed!</span>
            `}
        </div>
    `;
    
    return div;
}

function completeDailyChallenge(challengeId) {
    // Show completion animation and update UI
    showNotification('Challenge completed! +Points earned 🎉', 'success');
    
    // In a real app, this would make an API call to mark the challenge as completed
    // For now, we'll just reload the challenges to show updated state
    setTimeout(() => {
        loadDailyChallenges();
    }, 1000);
}

// User progress and stats functionality
function loadUserProgressStats() {
    // Generate demo stats based on achievement data if available
    const baseStats = {
        total_earned: 12,
        total_available: 40,
        points_earned: 1250,
        current_streak: 5,
        longest_streak: 12,
        weekly_points: 230,
        level: 3
    };
    
    // Merge with any existing achievement stats, ensuring no undefined values
    const stats = {};
    Object.keys(baseStats).forEach(key => {
        stats[key] = (window.achievementStats && window.achievementStats[key] !== undefined) 
            ? window.achievementStats[key] 
            : baseStats[key];
    });
    
    displayUserProgressStats(stats);
}

function displayUserProgressStats(stats) {
    const container = document.getElementById('stats-and-streaks-container');
    if (!container) return;
    
    const completionRate = Math.round((stats.total_earned / stats.total_available) * 100);
    
    container.innerHTML = `
        <div class="stats-card text-center">
            <div class="text-xl font-bold text-white">${stats.total_earned}</div>
            <div class="text-white/60 text-xs">Achievements</div>
            <div class="text-yellow-400 text-xs">${completionRate}% Complete</div>
        </div>
        
        <div class="stats-card text-center">
            <div class="text-xl font-bold text-yellow-400">${stats.points_earned}</div>
            <div class="text-white/60 text-xs">Total Points</div>
            <div class="text-green-400 text-xs">Level ${stats.level}</div>
        </div>
        
        <div class="stats-card text-center">
            <div class="text-xl font-bold text-orange-400">${stats.current_streak}</div>
            <div class="text-white/60 text-xs">Current Streak</div>
            <div class="text-white/40 text-xs">Days</div>
        </div>
        
        <div class="stats-card text-center">
            <div class="text-xl font-bold text-purple-400">${stats.longest_streak}</div>
            <div class="text-white/60 text-xs">Best Streak</div>
            <div class="text-white/40 text-xs">Days</div>
        </div>
        
        <div class="stats-card text-center">
            <div class="text-xl font-bold text-blue-400">${stats.weekly_points}</div>
            <div class="text-white/60 text-xs">This Week</div>
            <div class="text-green-400 text-xs">Points</div>
        </div>
        
        <div class="stats-card text-center">
            <div class="text-xl font-bold text-pink-400">#${Math.floor(Math.random() * 50) + 1}</div>
            <div class="text-white/60 text-xs">Rank</div>
            <div class="text-white/40 text-xs">Weekly</div>
        </div>
        
        <div class="stats-card text-center">
            <div class="text-xl font-bold text-indigo-400">${Math.floor(Math.random() * 15) + 1}</div>
            <div class="text-white/60 text-xs">Friends</div>
            <div class="text-white/40 text-xs">Active</div>
        </div>
        
        <div class="stats-card text-center">
            <div class="text-xl font-bold text-teal-400">${Math.floor(Math.random() * 5) + 1}</div>
            <div class="text-white/60 text-xs">Completed</div>
            <div class="text-white/40 text-xs">Today</div>
        </div>
    `;
}

// Leaderboards functionality
async function loadLeaderboards() {
    console.log('Loading leaderboards...');
    
    // Generate demo leaderboard data
    const leaderboardData = generateLeaderboardData();
    displayLeaderboards(leaderboardData);
    displayUserRankCard();
}

function generateLeaderboardData() {
    const names = ['Alex Thunder', 'Sarah Storm', 'Mike Blaze', 'Emma Fire', 'Jake Lightning', 'Luna Star', 'Ryan Swift', 'Maya Power', 'Leo Force', 'Zoe Flash'];
    const avatars = ['🔥', '⚡', '💪', '🚀', '⭐', '💎', '👑', '🏆', '⚔️', '🌟'];
    
    return {
        weekly: names.slice(0, 5).map((name, index) => ({
            rank: index + 1,
            name: name,
            avatar: avatars[index],
            points: 500 - (index * 50) + Math.floor(Math.random() * 50),
            change: Math.floor(Math.random() * 10) - 5
        })),
        achievements: names.slice(2, 7).map((name, index) => ({
            rank: index + 1,
            name: name,
            avatar: avatars[index + 2],
            achievements: 25 - (index * 3) + Math.floor(Math.random() * 5),
            change: Math.floor(Math.random() * 6) - 3
        })),
        streaks: names.slice(1, 6).map((name, index) => ({
            rank: index + 1,
            name: name,
            avatar: avatars[index + 1],
            streak: 15 - (index * 2) + Math.floor(Math.random() * 3),
            change: Math.floor(Math.random() * 4) - 2
        })),
        challenges: names.slice(3, 8).map((name, index) => ({
            rank: index + 1,
            name: name,
            avatar: avatars[index + 3],
            challenges: 12 - index + Math.floor(Math.random() * 3),
            change: Math.floor(Math.random() * 3) - 1
        }))
    };
}

function displayUserRankCard() {
    const container = document.getElementById('user-rank-card');
    if (!container) return;
    
    const userRank = Math.floor(Math.random() * 20) + 1;
    const weeklyPoints = Math.floor(Math.random() * 300) + 100;
    
    container.innerHTML = `
        <div class="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span class="text-white font-bold text-lg">🎯</span>
                    </div>
                    <div>
                        <h4 class="text-white font-semibold">Your Ranking</h4>
                        <p class="text-white/70 text-sm">Keep pushing to climb higher!</p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-white">#{userRank}</div>
                    <div class="text-green-400 text-sm">+3 this week</div>
                </div>
            </div>
            <div class="mt-4 flex justify-between text-sm">
                <span class="text-white/70">Weekly Points:</span>
                <span class="text-yellow-400 font-semibold">${weeklyPoints}</span>
            </div>
        </div>
    `;
}

function displayLeaderboards(data) {
    const container = document.getElementById('leaderboard-container');
    if (!container) return;
    
    // Get current filter
    const filterSelect = document.getElementById('leaderboard-filter');
    const currentFilter = filterSelect ? filterSelect.value : 'weekly';
    
    const leaderboardData = data[currentFilter] || data.weekly;
    
    container.innerHTML = `
        <div class="leaderboard-section">
            <h4 class="text-lg font-semibold text-white mb-4 capitalize">${currentFilter} Leaderboard</h4>
            <div class="space-y-3">
                ${leaderboardData.map(entry => createLeaderboardEntry(entry, currentFilter)).join('')}
            </div>
        </div>
        
        <div class="friends-ranking-section">
            <h4 class="text-lg font-semibold text-white mb-4">🥇 Friends Ranking</h4>
            <div class="text-center py-6 bg-white/5 rounded-lg border border-white/10">
                <div class="text-4xl mb-2">👥</div>
                <p class="text-white/70 text-sm mb-3">Connect with friends to see rankings</p>
                <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                    Add Friends
                </button>
            </div>
        </div>
    `;
    
    // Add event listener for filter changes
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            displayLeaderboards(data);
        });
    }
}

function createLeaderboardEntry(entry, type) {
    const rankColors = {
        1: 'text-yellow-400',
        2: 'text-gray-300',
        3: 'text-amber-600'
    };
    
    const rankColor = rankColors[entry.rank] || 'text-white';
    
    const changeIcon = entry.change > 0 ? '↗️' : entry.change < 0 ? '↘️' : '➡️';
    const changeColor = entry.change > 0 ? 'text-green-400' : entry.change < 0 ? 'text-red-400' : 'text-white/60';
    
    let valueDisplay;
    switch(type) {
        case 'weekly':
            valueDisplay = `${entry.points} pts`;
            break;
        case 'achievements':
            valueDisplay = `${entry.achievements} 🏆`;
            break;
        case 'streaks':
            valueDisplay = `${entry.streak} days`;
            break;
        case 'challenges':
            valueDisplay = `${entry.challenges} completed`;
            break;
        default:
            valueDisplay = entry.points + ' pts';
    }
    
    return `
        <div class="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 ${rankColor} font-bold text-lg flex items-center justify-center">
                    #${entry.rank}
                </div>
                <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span class="text-white text-lg">${entry.avatar}</span>
                </div>
                <div>
                    <div class="text-white font-semibold text-sm">${entry.name}</div>
                    <div class="text-white/60 text-xs">${valueDisplay}</div>
                </div>
            </div>
            <div class="text-right">
                <div class="${changeColor} text-sm flex items-center space-x-1">
                    <span>${changeIcon}</span>
                    <span>${Math.abs(entry.change)}</span>
                </div>
            </div>
        </div>
    `;
}

// Social Hub functionality - Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for social hub buttons
    const addFriendBtn = document.getElementById('add-friend-btn');
    const friendsListBtn = document.getElementById('friends-list-btn');
    
    if (addFriendBtn) {
        addFriendBtn.addEventListener('click', showAddFriendModal);
    }
    
    if (friendsListBtn) {
        friendsListBtn.addEventListener('click', showFriendsListModal);
    }
});

function showAddFriendModal() {
    // Create a simple add friend modal
    const modalHtml = `
        <div id="add-friend-modal" class="modal">
            <div class="modal-content max-w-md">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-white">👥 Add Friend</h2>
                    <button onclick="closeModal('add-friend-modal')" class="text-white/70 hover:text-white text-2xl">×</button>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-white/70 text-sm mb-2">Search by username or email</label>
                        <input type="text" id="friend-search-input" 
                               placeholder="Enter username or email..." 
                               class="input-field w-full">
                    </div>
                    
                    <div class="flex space-x-3">
                        <button onclick="sendFriendRequest()" 
                                class="flex-1 btn-primary">
                            <i class="fas fa-user-plus mr-2"></i>Send Request
                        </button>
                        <button onclick="closeModal('add-friend-modal')" 
                                class="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('add-friend-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Focus on input
    setTimeout(() => {
        document.getElementById('friend-search-input').focus();
    }, 100);
}

function showFriendsListModal() {
    // Create friends list modal with demo data
    const modalHtml = `
        <div id="friends-list-modal" class="modal">
            <div class="modal-content max-w-lg">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-white">📋 Friends List</h2>
                    <button onclick="closeModal('friends-list-modal')" class="text-white/70 hover:text-white text-2xl">×</button>
                </div>
                
                <div class="space-y-4">
                    ${generateFriendsList()}
                </div>
                
                <div class="mt-6 pt-4 border-t border-white/10">
                    <button onclick="showAddFriendModal(); closeModal('friends-list-modal');" 
                            class="w-full btn-primary">
                        <i class="fas fa-user-plus mr-2"></i>Add New Friend
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('friends-list-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function generateFriendsList() {
    const friends = [
        { name: 'Alex Thunder', avatar: '🔥', status: 'online', streak: 12, points: 450 },
        { name: 'Sarah Storm', avatar: '⚡', status: 'offline', streak: 8, points: 380 },
        { name: 'Mike Blaze', avatar: '💪', status: 'online', streak: 15, points: 520 },
        { name: 'Emma Fire', avatar: '🚀', status: 'away', streak: 6, points: 290 }
    ];
    
    if (friends.length === 0) {
        return `
            <div class="text-center py-8">
                <div class="text-4xl mb-4">👥</div>
                <h3 class="text-lg font-semibold text-white mb-2">No friends yet</h3>
                <p class="text-white/70 text-sm">Start building your fitness community!</p>
            </div>
        `;
    }
    
    return friends.map(friend => `
        <div class="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
            <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center relative">
                    <span class="text-white text-lg">${friend.avatar}</span>
                    <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white/20
                        ${friend.status === 'online' ? 'bg-green-400' : 
                          friend.status === 'away' ? 'bg-yellow-400' : 'bg-gray-400'}">
                    </div>
                </div>
                <div>
                    <div class="text-white font-semibold text-sm">${friend.name}</div>
                    <div class="text-white/60 text-xs">
                        ${friend.streak} day streak • ${friend.points} pts
                    </div>
                </div>
            </div>
            <div class="flex space-x-2">
                <button class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                        onclick="viewFriendProfile('${friend.name}')">
                    View
                </button>
                <button class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                        onclick="challengeFriend('${friend.name}')">
                    Challenge
                </button>
            </div>
        </div>
    `).join('');
}

function sendFriendRequest() {
    const input = document.getElementById('friend-search-input');
    const searchValue = input.value.trim();
    
    if (!searchValue) {
        showNotification('Please enter a username or email', 'error');
        return;
    }
    
    // Simulate sending friend request
    showNotification(`Friend request sent to ${searchValue}! 🤝`, 'success');
    closeModal('add-friend-modal');
}

function viewFriendProfile(friendName) {
    showNotification(`Viewing ${friendName}'s profile - coming soon! 👤`, 'info');
    closeModal('friends-list-modal');
}

function challengeFriend(friendName) {
    showNotification(`Challenge sent to ${friendName}! 🏆 They have been notified`, 'success');
    closeModal('friends-list-modal');
}

// Social Hub Section Functionality
async function loadSocialHub() {
    console.log('Loading Social Hub...');
    
    // Initialize with friends section by default
    showSocialSection('friends');
    
    // Load initial data
    loadSocialFriends();
    loadSocialLeaderboards();
    loadSocialChallenges();
    loadCommunityFeed();
    
    // Setup social navigation
    setupSocialNavigation();
}

function setupSocialNavigation() {
    const tabs = document.querySelectorAll('.social-nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const section = e.target.getAttribute('data-social-section');
            if (section) {
                showSocialSection(section);
            }
        });
    });
    
    // Setup social action buttons
    const addFriendBtn = document.getElementById('social-add-friend-btn');
    const createChallengeBtn = document.getElementById('social-create-challenge-btn');
    
    if (addFriendBtn) {
        addFriendBtn.addEventListener('click', showAddFriendModal);
    }
    
    if (createChallengeBtn) {
        createChallengeBtn.addEventListener('click', showCreateChallengeModal);
    }
}

function showSocialSection(section) {
    // Hide all social content sections
    const sections = document.querySelectorAll('.social-content-section');
    sections.forEach(s => s.classList.add('hidden'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.social-nav-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(`social-${section}-section`);
    const targetTab = document.querySelector(`[data-social-section="${section}"]`);
    
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

function loadSocialFriends() {
    const friendsList = document.getElementById('social-friends-list');
    const activityFeed = document.getElementById('friend-activity-feed');
    
    if (friendsList) {
        const friends = [
            { name: 'Alex Thunder', avatar: '🔥', status: 'online', streak: 12, points: 450, level: 4 },
            { name: 'Sarah Storm', avatar: '⚡', status: 'offline', streak: 8, points: 380, level: 3 },
            { name: 'Mike Blaze', avatar: '💪', status: 'online', streak: 15, points: 520, level: 5 },
            { name: 'Emma Fire', avatar: '🚀', status: 'away', streak: 6, points: 290, level: 2 }
        ];
        
        friendsList.innerHTML = friends.map(friend => `
            <div class="friend-card">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center relative">
                            <span class="text-white text-lg">${friend.avatar}</span>
                            <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white/20
                                ${friend.status === 'online' ? 'bg-green-400' : 
                                  friend.status === 'away' ? 'bg-yellow-400' : 'bg-gray-400'}">
                            </div>
                        </div>
                        <div>
                            <div class="text-white font-semibold">${friend.name}</div>
                            <div class="text-white/60 text-sm">
                                Level ${friend.level} • ${friend.streak} day streak
                            </div>
                            <div class="text-yellow-400 text-xs">${friend.points} points</div>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                                onclick="viewFriendProfile('${friend.name}')">
                            View
                        </button>
                        <button class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors"
                                onclick="challengeFriend('${friend.name}')">
                            Challenge
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    if (activityFeed) {
        const activities = [
            { user: 'Alex Thunder', action: 'completed a 5K run', time: '2 hours ago', type: 'achievement' },
            { user: 'Sarah Storm', action: 'unlocked "Consistency King" achievement', time: '4 hours ago', type: 'achievement' },
            { user: 'Mike Blaze', action: 'started a new habit streak', time: '6 hours ago', type: 'habit' },
            { user: 'Emma Fire', action: 'completed daily challenge', time: '1 day ago', type: 'challenge' }
        ];
        
        activityFeed.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span class="text-white text-xs">
                            ${activity.type === 'achievement' ? '🏆' : 
                              activity.type === 'habit' ? '🔥' : '⚡'}
                        </span>
                    </div>
                    <div class="flex-1">
                        <p class="text-white text-sm">
                            <span class="font-semibold">${activity.user}</span> ${activity.action}
                        </p>
                        <p class="text-white/60 text-xs">${activity.time}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function loadSocialLeaderboards() {
    const leaderboardContainer = document.getElementById('social-leaderboard-container');
    const userStatsContainer = document.getElementById('social-user-stats');
    
    if (leaderboardContainer) {
        const leaderboardData = generateLeaderboardData();
        displaySocialLeaderboard(leaderboardData.weekly);
    }
    
    if (userStatsContainer) {
        userStatsContainer.innerHTML = `
            <div class="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <div class="text-xl font-bold text-blue-400">1,250</div>
                <div class="text-white/60 text-sm">Total Points</div>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <div class="text-xl font-bold text-green-400">12</div>
                <div class="text-white/60 text-sm">Achievements</div>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <div class="text-xl font-bold text-orange-400">5</div>
                <div class="text-white/60 text-sm">Day Streak</div>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <div class="text-xl font-bold text-purple-400">#25</div>
                <div class="text-white/60 text-sm">Global Rank</div>
            </div>
        `;
    }
}

function displaySocialLeaderboard(entries) {
    const container = document.getElementById('social-leaderboard-container');
    if (!container) return;
    
    container.innerHTML = entries.map(entry => createLeaderboardEntry(entry, 'weekly')).join('');
}

function loadSocialChallenges() {
    const activeChallenges = document.getElementById('social-active-challenges');
    const challengeInvites = document.getElementById('social-challenge-invites');
    
    if (activeChallenges) {
        activeChallenges.innerHTML = `
            <div class="challenge-card">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="text-white font-semibold">🏃‍♂️ 7-Day Running Streak</h4>
                    <span class="text-green-400 text-sm">3/7 days</span>
                </div>
                <p class="text-white/70 text-sm mb-3">Run at least 1 mile every day for 7 days</p>
                <div class="flex items-center justify-between">
                    <div class="text-yellow-400 text-sm">+100 pts reward</div>
                    <button class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg">
                        Log Run
                    </button>
                </div>
            </div>
            
            <div class="challenge-card">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="text-white font-semibold">💪 Strength Challenge</h4>
                    <span class="text-blue-400 text-sm">5/10 workouts</span>
                </div>
                <p class="text-white/70 text-sm mb-3">Complete 10 strength training sessions this month</p>
                <div class="flex items-center justify-between">
                    <div class="text-yellow-400 text-sm">+200 pts reward</div>
                    <button class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg">
                        Log Workout
                    </button>
                </div>
            </div>
        `;
    }
    
    if (challengeInvites) {
        challengeInvites.innerHTML = `
            <div class="challenge-card border-l-4 border-purple-500">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="text-white font-semibold">Alex Thunder invited you</h4>
                    <span class="text-purple-400 text-sm">New</span>
                </div>
                <p class="text-white/70 text-sm mb-3">30-Day Habit Building Challenge</p>
                <div class="flex space-x-2">
                    <button class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg">
                        Accept
                    </button>
                    <button class="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg">
                        Decline
                    </button>
                </div>
            </div>
        `;
    }
}

function loadCommunityFeed() {
    const communityFeed = document.getElementById('community-feed');
    
    if (communityFeed) {
        const feedItems = [
            { type: 'achievement', user: 'Top Performer', content: '🏆 Sarah Storm just unlocked "Marathon Master" - completed 26.2 miles!', time: '1 hour ago' },
            { type: 'milestone', user: 'Community', content: '🎉 StriveTrack community just hit 1,000 active members this week!', time: '3 hours ago' },
            { type: 'challenge', user: 'Weekly Challenge', content: '⚡ New weekly challenge: "Hydration Hero" - drink 8 glasses of water daily', time: '1 day ago' },
            { type: 'success', user: 'Success Story', content: '💪 Mike Blaze shares: "Lost 20 pounds in 3 months thanks to consistent habit tracking!"', time: '2 days ago' }
        ];
        
        communityFeed.innerHTML = feedItems.map(item => `
            <div class="activity-item border-l-4 border-blue-500">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            <span class="text-blue-400 font-semibold text-sm">${item.user}</span>
                            <span class="text-white/40 text-xs">${item.time}</span>
                        </div>
                        <p class="text-white/80 text-sm">${item.content}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function showCreateChallengeModal() {
    showNotification('Create Challenge feature coming soon! 🏆', 'info');
}

// Enhanced Achievements Section Functionality
function setupChallengeNavigation() {
    const tabs = document.querySelectorAll('.challenge-nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const challengeType = e.target.getAttribute('data-challenge-type');
            if (challengeType) {
                showChallengeSection(challengeType);
            }
        });
    });
}

function showChallengeSection(type) {
    // Hide all challenge content sections
    const sections = document.querySelectorAll('.challenge-content-section');
    sections.forEach(s => s.classList.add('hidden'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.challenge-nav-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(`${type}-challenges-section`);
    const targetTab = document.querySelector(`[data-challenge-type="${type}"]`);
    
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

// Enhanced Daily Challenges
async function loadDailyChallenges() {
    console.log('Loading enhanced daily challenges...');
    
    const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.getElementById('daily-challenge-date').textContent = currentDate;
    
    const challenges = generateEnhancedDailyChallenges();
    displayEnhancedDailyChallenges(challenges);
    
    // Update completion count
    const completedCount = challenges.filter(c => c.completed).length;
    document.getElementById('daily-completed-count').textContent = `${completedCount}/${challenges.length}`;
    
    loadUserProgressStats();
}

function generateEnhancedDailyChallenges() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    const challengeTemplates = {
        0: [ // Sunday
            { 
                id: 'sunday_1', 
                type: 'recovery', 
                title: 'Rest Day Reflection', 
                description: 'Complete a 10-minute meditation or stretching session', 
                points: 15, 
                icon: '🧘‍♂️',
                color: 'purple',
                difficulty: 'Easy'
            },
            { 
                id: 'sunday_2', 
                type: 'planning', 
                title: 'Weekly Goal Setting', 
                description: 'Set 3 fitness goals for the upcoming week', 
                points: 20, 
                icon: '📝',
                color: 'blue',
                difficulty: 'Easy'
            },
            { 
                id: 'sunday_3', 
                type: 'nutrition', 
                title: 'Meal Prep Master', 
                description: 'Prepare healthy meals or snacks for tomorrow', 
                points: 25, 
                icon: '🥗',
                color: 'green',
                difficulty: 'Medium'
            }
        ],
        1: [ // Monday
            { 
                id: 'monday_1', 
                type: 'motivation', 
                title: 'Monday Momentum', 
                description: 'Complete your morning workout or habit', 
                points: 20, 
                icon: '🚀',
                color: 'orange',
                difficulty: 'Medium'
            },
            { 
                id: 'monday_2', 
                type: 'hydration', 
                title: 'Hydration Hero', 
                description: 'Drink 8 glasses of water throughout the day', 
                points: 15, 
                icon: '💧',
                color: 'blue',
                difficulty: 'Easy'
            },
            { 
                id: 'monday_3', 
                type: 'steps', 
                title: 'Step Champion', 
                description: 'Take 10,000 steps or walk for 30 minutes', 
                points: 25, 
                icon: '👟',
                color: 'green',
                difficulty: 'Medium'
            }
        ],
        2: [ // Tuesday
            { 
                id: 'tuesday_1', 
                type: 'strength', 
                title: 'Strength Builder', 
                description: 'Complete 20 push-ups (can be modified)', 
                points: 30, 
                icon: '💪',
                color: 'red',
                difficulty: 'Medium'
            },
            { 
                id: 'tuesday_2', 
                type: 'nutrition', 
                title: 'Protein Power', 
                description: 'Include protein in every meal today', 
                points: 20, 
                icon: '🍗',
                color: 'orange',
                difficulty: 'Easy'
            },
            { 
                id: 'tuesday_3', 
                type: 'habit', 
                title: 'Consistency King', 
                description: 'Complete 3 different healthy habits', 
                points: 35, 
                icon: '🔥',
                color: 'purple',
                difficulty: 'Hard'
            }
        ],
        3: [ // Wednesday
            { 
                id: 'wednesday_1', 
                type: 'cardio', 
                title: 'Cardio Crusher', 
                description: '20-minute cardio session (any activity)', 
                points: 30, 
                icon: '🏃‍♂️',
                color: 'blue',
                difficulty: 'Medium'
            },
            { 
                id: 'wednesday_2', 
                type: 'mindfulness', 
                title: 'Mindful Wednesday', 
                description: 'Practice 5 minutes of deep breathing', 
                points: 15, 
                icon: '🌸',
                color: 'pink',
                difficulty: 'Easy'
            },
            { 
                id: 'wednesday_3', 
                type: 'social', 
                title: 'Workout Buddy', 
                description: 'Exercise with a friend or share your progress', 
                points: 25, 
                icon: '👫',
                color: 'green',
                difficulty: 'Medium'
            }
        ],
        4: [ // Thursday
            { 
                id: 'thursday_1', 
                type: 'flexibility', 
                title: 'Flexibility Focus', 
                description: '15-minute stretching or yoga session', 
                points: 20, 
                icon: '🤸‍♀️',
                color: 'purple',
                difficulty: 'Easy'
            },
            { 
                id: 'thursday_2', 
                type: 'nutrition', 
                title: 'Veggie Victory', 
                description: 'Eat 5 servings of fruits and vegetables', 
                points: 25, 
                icon: '🥕',
                color: 'orange',
                difficulty: 'Medium'
            },
            { 
                id: 'thursday_3', 
                type: 'challenge', 
                title: 'Personal Best', 
                description: 'Try to beat a personal fitness record', 
                points: 40, 
                icon: '🏆',
                color: 'gold',
                difficulty: 'Hard'
            }
        ],
        5: [ // Friday
            { 
                id: 'friday_1', 
                type: 'endurance', 
                title: 'Friday Finisher', 
                description: 'Complete a 30-minute workout session', 
                points: 35, 
                icon: '⚡',
                color: 'yellow',
                difficulty: 'Medium'
            },
            { 
                id: 'friday_2', 
                type: 'recovery', 
                title: 'Recovery Ready', 
                description: 'Take an ice bath, sauna, or hot shower', 
                points: 15, 
                icon: '🛁',
                color: 'blue',
                difficulty: 'Easy'
            },
            { 
                id: 'friday_3', 
                type: 'planning', 
                title: 'Weekend Warrior Prep', 
                description: 'Plan an active weekend activity', 
                points: 20, 
                icon: '📅',
                color: 'green',
                difficulty: 'Easy'
            }
        ],
        6: [ // Saturday
            { 
                id: 'saturday_1', 
                type: 'adventure', 
                title: 'Adventure Seeker', 
                description: 'Try a new outdoor activity or sport', 
                points: 40, 
                icon: '🏔️',
                color: 'green',
                difficulty: 'Medium'
            },
            { 
                id: 'saturday_2', 
                type: 'strength', 
                title: 'Weekend Warrior', 
                description: 'Complete a full-body strength workout', 
                points: 35, 
                icon: '⚔️',
                color: 'red',
                difficulty: 'Hard'
            },
            { 
                id: 'saturday_3', 
                type: 'fun', 
                title: 'Active Fun', 
                description: 'Play a sport or active game with others', 
                points: 30, 
                icon: '🎮',
                color: 'purple',
                difficulty: 'Medium'
            }
        ]
    };
    
    const todayChallenges = challengeTemplates[dayOfWeek] || challengeTemplates[1];
    
    // Add random completion status for demo
    return todayChallenges.map(challenge => ({
        ...challenge,
        completed: Math.random() > 0.7,
        progress: Math.floor(Math.random() * 100)
    }));
}

function displayEnhancedDailyChallenges(challenges) {
    const container = document.getElementById('daily-challenges-container');
    if (!container) return;
    
    container.innerHTML = challenges.map(challenge => createEnhancedChallengeCard(challenge)).join('');
}

function createEnhancedChallengeCard(challenge) {
    const completedClass = challenge.completed ? 'completed' : '';
    const difficultyColors = {
        'Easy': 'text-green-400',
        'Medium': 'text-yellow-400', 
        'Hard': 'text-red-400'
    };
    
    return `
        <div class="enhanced-challenge-card ${completedClass}">
            <div class="flex items-start justify-between mb-4">
                <div class="text-4xl">${challenge.icon}</div>
                <div class="text-right">
                    <div class="text-yellow-400 font-bold">+${challenge.points}</div>
                    <div class="text-white/60 text-xs">points</div>
                </div>
            </div>
            
            <h4 class="text-white font-bold text-lg mb-2">${challenge.title}</h4>
            <p class="text-white/80 text-sm mb-4 leading-relaxed">${challenge.description}</p>
            
            <div class="flex items-center justify-between mb-4">
                <span class="px-2 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium">
                    ${challenge.type.toUpperCase()}
                </span>
                <span class="${difficultyColors[challenge.difficulty]} text-xs font-semibold">
                    ${challenge.difficulty}
                </span>
            </div>
            
            ${!challenge.completed ? `
                <button class="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                        onclick="completeEnhancedChallenge('${challenge.id}')">
                    Complete Challenge
                </button>
            ` : `
                <div class="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg text-center">
                    <i class="fas fa-check mr-2"></i>Completed!
                </div>
            `}
        </div>
    `;
}

function completeEnhancedChallenge(challengeId) {
    showNotification('🎉 Challenge completed! Points earned!', 'success');
    
    // Add celebration effect
    celebrateChallenge();
    
    setTimeout(() => {
        loadDailyChallenges();
    }, 1000);
}

function celebrateChallenge() {
    // Simple celebration effect (you can enhance this with animations)
    const body = document.body;
    body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    setTimeout(() => {
        body.style.background = '';
    }, 500);
}

// Weekly Challenges
async function loadWeeklyChallenges() {
    console.log('Loading weekly challenges (including upload challenges)...');
    
    const challenges = generateWeeklyChallenges();
    displayWeeklyChallenges(challenges);
    
    const completedCount = challenges.filter(c => c.completed).length;
    document.getElementById('weekly-completed-count').textContent = `${completedCount}/${challenges.length}`;
}

function generateWeeklyChallenges() {
    return [
        {
            id: 'weekly_1',
            title: '🏃‍♂️ 5K Running Challenge',
            description: 'Complete a total of 5 kilometers of running this week (can be split across multiple days)',
            points: 100,
            icon: '🏃‍♂️',
            progress: 65,
            target: '5K',
            current: '3.2K',
            difficulty: 'Medium',
            daysLeft: 3,
            completed: false,
            type: 'fitness'
        },
        {
            id: 'weekly_2',
            title: '💪 Strength Streak',
            description: 'Complete strength training workouts on 4 different days this week',
            points: 150,
            icon: '💪',
            progress: 50,
            target: '4 days',
            current: '2 days',
            difficulty: 'Hard',
            daysLeft: 3,
            completed: false,
            type: 'fitness'
        },
        {
            id: 'weekly_3',
            title: '🥗 Nutrition Master',
            description: 'Log your meals every day this week and hit your macro targets',
            points: 120,
            icon: '🥗',
            progress: 85,
            target: '7 days',
            current: '6 days',
            difficulty: 'Medium',
            daysLeft: 3,
            completed: false,
            type: 'nutrition'
        },
        {
            id: 'weekly_4',
            title: '📷 Weekly Progress Photos',
            description: 'Capture your fitness journey! Upload 2 progress photos this week - before/after workouts, transformation shots, or gym selfies to document your amazing progress.',
            points: 50,
            icon: '📷',
            progress: 50,
            target: '2 photos',
            current: '1 photo',
            difficulty: 'Easy',
            daysLeft: 3,
            completed: false,
            type: 'upload',
            uploads: [
                { type: 'image', name: 'Pre-Workout Energy', date: '2 days ago', url: '#' }
            ]
        },
        {
            id: 'weekly_5',
            title: '🎬 Progress Video',
            description: 'Share your fitness knowledge! Upload a video demonstrating proper form, showcasing a new exercise, or recording your workout routine to inspire others.',
            points: 75,
            icon: '🎬',
            progress: 0,
            target: '1 video',
            current: '0 videos',
            difficulty: 'Medium',
            daysLeft: 3,
            completed: false,
            type: 'upload',
            uploads: []
        },
        {
            id: 'weekly_6',
            title: '🧘‍♀️ Mindfulness Week',
            description: 'Practice meditation or mindfulness for at least 10 minutes on 5 days',
            points: 80,
            icon: '🧘‍♀️',
            progress: 100,
            target: '5 days',
            current: '5 days',
            difficulty: 'Easy',
            daysLeft: 3,
            completed: true,
            type: 'wellness'
        }
    ];
}

function displayWeeklyChallenges(challenges) {
    const container = document.getElementById('weekly-challenges-container');
    if (!container) return;
    
    container.innerHTML = challenges.map(challenge => {
        // Use different card types based on challenge type
        if (challenge.type === 'upload') {
            return createUploadChallengeCard(challenge);
        } else {
            return createWeeklyChallengeCard(challenge);
        }
    }).join('');
}

function createWeeklyChallengeCard(challenge) {
    const completedClass = challenge.completed ? 'completed' : '';
    
    return `
        <div class="weekly-challenge-card ${completedClass}">
            <div class="flex items-start justify-between mb-4">
                <div class="text-5xl">${challenge.icon}</div>
                <div class="text-right">
                    <div class="text-yellow-400 font-bold text-lg">+${challenge.points}</div>
                    <div class="text-white/60 text-xs">points</div>
                    <div class="text-purple-400 text-xs mt-1">${challenge.daysLeft} days left</div>
                </div>
            </div>
            
            <h4 class="text-white font-bold text-xl mb-3">${challenge.title}</h4>
            <p class="text-white/80 text-sm mb-4 leading-relaxed">${challenge.description}</p>
            
            <!-- Progress Bar -->
            <div class="mb-4">
                <div class="flex justify-between text-sm mb-2">
                    <span class="text-white/80">Progress: ${challenge.current}/${challenge.target}</span>
                    <span class="text-purple-400 font-semibold">${challenge.progress}%</span>
                </div>
                <div class="w-full bg-white/20 rounded-full h-3">
                    <div class="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500" 
                         style="width: ${challenge.progress}%"></div>
                </div>
            </div>
            
            <div class="flex items-center justify-between">
                <span class="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30">
                    ${challenge.difficulty} • Weekly
                </span>
                
                ${!challenge.completed ? `
                    <button class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300"
                            onclick="updateWeeklyProgress('${challenge.id}')">
                        Update Progress
                    </button>
                ` : `
                    <div class="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg">
                        <i class="fas fa-trophy mr-2"></i>Completed!
                    </div>
                `}
            </div>
        </div>
    `;
}

function updateWeeklyProgress(challengeId) {
    showNotification('📈 Progress updated! Keep going!', 'success');
    
    setTimeout(() => {
        loadWeeklyChallenges();
    }, 1000);
}

// Upload challenges are now integrated into weekly challenges

function createUploadChallengeCard(challenge) {
    const progress = challenge.progress || Math.round((challenge.current / challenge.target) * 100);
    const completedClass = challenge.completed ? 'completed' : '';
    
    // For weekly upload challenges, determine target number from the current/target strings
    let targetNumber = 2; // default
    if (challenge.target && typeof challenge.target === 'string') {
        const match = challenge.target.match(/(\d+)/);
        if (match) targetNumber = parseInt(match[1]);
    }
    
    // Create visual upload slots
    const uploadSlots = Array.from({ length: targetNumber }, (_, index) => {
        const isUploaded = index < challenge.current;
        return `
            <div class="upload-slot ${isUploaded ? 'uploaded' : 'empty'}">
                ${isUploaded ? 
                    `<div class="uploaded-indicator">
                        <i class="fas fa-${challenge.uploads[index]?.type === 'video' ? 'video' : 'image'} text-white text-lg"></i>
                    </div>` : 
                    `<div class="empty-indicator">
                        <i class="fas fa-plus text-white/40 text-lg"></i>
                    </div>`
                }
                <div class="slot-label">${isUploaded ? 'Uploaded' : 'Empty'}</div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="enhanced-upload-challenge-card ${completedClass}">
            <!-- Header Section -->
            <div class="upload-card-header">
                <div class="upload-icon-container">
                    <div class="upload-icon">${challenge.icon}</div>
                    <div class="upload-glow"></div>
                </div>
                <div class="upload-info">
                    <div class="upload-points">+${challenge.points}</div>
                    <div class="upload-points-label">points</div>
                    <div class="upload-timer">⏰ ${challenge.daysLeft} days left</div>
                </div>
            </div>
            
            <!-- Title and Description -->
            <div class="upload-content">
                <h4 class="upload-title">${challenge.title}</h4>
                <p class="upload-description">${challenge.description}</p>
                
                <!-- Progress Bar (consistent with weekly challenges) -->
                <div class="mb-4">
                    <div class="flex justify-between text-sm mb-2">
                        <span class="text-white/80">Progress: ${challenge.current}/${challenge.target}</span>
                        <span class="text-purple-400 font-semibold">${progress}%</span>
                    </div>
                    <div class="w-full bg-white/20 rounded-full h-3">
                        <div class="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500" 
                             style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <!-- Visual Upload Slots -->
                <div class="upload-slots-container">
                    <div class="upload-slots-grid">
                        ${uploadSlots}
                    </div>
                </div>
                
                <!-- Recent Uploads Preview -->
                ${challenge.uploads.length > 0 ? `
                    <div class="recent-uploads">
                        <div class="recent-uploads-header">📂 Recent Uploads</div>
                        <div class="recent-uploads-list">
                            ${challenge.uploads.slice(0, 2).map(upload => `
                                <div class="recent-upload-item">
                                    <div class="upload-thumbnail">
                                        <i class="fas fa-${upload.type === 'video' ? 'video' : 'image'}"></i>
                                    </div>
                                    <div class="upload-details">
                                        <div class="upload-name">${upload.name}</div>
                                        <div class="upload-date">${upload.date}</div>
                                    </div>
                                    <div class="upload-status">
                                        <i class="fas fa-check-circle text-green-400"></i>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="empty-uploads">
                        <div class="empty-uploads-icon">📤</div>
                        <div class="empty-uploads-text">No uploads yet - be the first!</div>
                    </div>
                `}
                
                <!-- Action Buttons -->
                <div class="upload-actions">
                    ${!challenge.completed ? `
                        <button class="upload-primary-btn" onclick="openUploadModal('${challenge.id}')">
                            <i class="fas fa-camera mr-2"></i>
                            <span>Start Upload</span>
                            <div class="btn-glow"></div>
                        </button>
                        
                        ${challenge.current > 0 ? `
                            <button class="upload-secondary-btn" onclick="viewUploads('${challenge.id}')">
                                <i class="fas fa-eye mr-2"></i>View Gallery
                            </button>
                        ` : `
                            <button class="upload-secondary-btn" onclick="showUploadTips()">
                                <i class="fas fa-lightbulb mr-2"></i>Upload Tips
                            </button>
                        `}
                    ` : `
                        <div class="upload-completed-state">
                            <i class="fas fa-trophy mr-2"></i>
                            Challenge Completed!
                        </div>
                        <button class="upload-view-btn" onclick="viewUploads('${challenge.id}')">
                            <i class="fas fa-images mr-2"></i>View Your Gallery
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
}

function openUploadModal(challengeId) {
    // Create an engaging upload modal
    const modalHtml = `
        <div id="upload-modal" class="modal">
            <div class="modal-content max-w-lg">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-white">📸 Upload Your Progress</h2>
                    <button onclick="closeModal('upload-modal')" class="text-white/70 hover:text-white text-2xl">×</button>
                </div>
                
                <div class="space-y-6">
                    <!-- Upload Options -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="upload-option-card" onclick="selectUploadType('photo')">
                            <div class="text-4xl mb-3">📸</div>
                            <h3 class="text-white font-semibold mb-2">Progress Photo</h3>
                            <p class="text-white/70 text-sm">Upload before/after shots or gym selfies</p>
                        </div>
                        
                        <div class="upload-option-card" onclick="selectUploadType('video')">
                            <div class="text-4xl mb-3">🎥</div>
                            <h3 class="text-white font-semibold mb-2">Workout Video</h3>
                            <p class="text-white/70 text-sm">Share exercise demos or routines</p>
                        </div>
                    </div>
                    
                    <!-- Upload Tips -->
                    <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <h4 class="text-blue-400 font-semibold mb-2">💡 Upload Tips</h4>
                        <ul class="text-white/80 text-sm space-y-1">
                            <li>• Good lighting makes a huge difference</li>
                            <li>• Keep videos under 60 seconds for best results</li>
                            <li>• Show proper form and technique</li>
                            <li>• Add motivational captions to inspire others</li>
                        </ul>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex space-x-3">
                        <button onclick="simulateUpload()" class="flex-1 btn-primary">
                            <i class="fas fa-camera mr-2"></i>Start Upload
                        </button>
                        <button onclick="closeModal('upload-modal')" class="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal
    const existingModal = document.getElementById('upload-modal');
    if (existingModal) existingModal.remove();
    
    // Add new modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function selectUploadType(type) {
    showNotification(`📱 ${type === 'photo' ? 'Photo' : 'Video'} upload selected! Integration with camera coming soon.`, 'info');
}

function simulateUpload() {
    showNotification('🎉 Upload successful! +50 points earned for documenting your progress!', 'success');
    closeModal('upload-modal');
    
    // Simulate progress update
    setTimeout(() => {
        loadUploadChallenges();
    }, 1000);
}

function viewUploads(challengeId) {
    const modalHtml = `
        <div id="uploads-gallery-modal" class="modal">
            <div class="modal-content max-w-4xl">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-white">📂 Your Upload Gallery</h2>
                    <button onclick="closeModal('uploads-gallery-modal')" class="text-white/70 hover:text-white text-2xl">×</button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Sample uploads -->
                    <div class="upload-gallery-item">
                        <div class="upload-preview">
                            <i class="fas fa-image text-4xl text-blue-400"></i>
                        </div>
                        <div class="upload-info">
                            <h4 class="text-white font-semibold">Pre-Workout Energy</h4>
                            <p class="text-white/60 text-sm">2 days ago • 45 likes</p>
                        </div>
                    </div>
                    
                    <div class="upload-gallery-item">
                        <div class="upload-preview">
                            <i class="fas fa-video text-4xl text-purple-400"></i>
                        </div>
                        <div class="upload-info">
                            <h4 class="text-white font-semibold">Deadlift Form Check</h4>
                            <p class="text-white/60 text-sm">5 days ago • 82 likes</p>
                        </div>
                    </div>
                    
                    <div class="upload-placeholder">
                        <div class="placeholder-icon">➕</div>
                        <div class="placeholder-text">Upload more content</div>
                    </div>
                </div>
                
                <div class="mt-6 flex justify-center">
                    <button onclick="openUploadModal('${challengeId}')" class="btn-primary">
                        <i class="fas fa-plus mr-2"></i>Add New Upload
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('uploads-gallery-modal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function showUploadTips() {
    const modalHtml = `
        <div id="upload-tips-modal" class="modal">
            <div class="modal-content max-w-md">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-white">💡 Upload Tips & Tricks</h2>
                    <button onclick="closeModal('upload-tips-modal')" class="text-white/70 hover:text-white text-2xl">×</button>
                </div>
                
                <div class="space-y-4">
                    <div class="tip-card">
                        <div class="tip-icon">📸</div>
                        <div class="tip-content">
                            <h4 class="text-white font-semibold">Perfect Progress Photos</h4>
                            <p class="text-white/80 text-sm">Use consistent lighting, angles, and clothing. Take photos at the same time of day for best comparison results.</p>
                        </div>
                    </div>
                    
                    <div class="tip-card">
                        <div class="tip-icon">🎥</div>
                        <div class="tip-content">
                            <h4 class="text-white font-semibold">Engaging Videos</h4>
                            <p class="text-white/80 text-sm">Keep videos short (30-60s), focus on proper form, and add encouraging commentary to help others learn.</p>
                        </div>
                    </div>
                    
                    <div class="tip-card">
                        <div class="tip-icon">⭐</div>
                        <div class="tip-content">
                            <h4 class="text-white font-semibold">Earn More Points</h4>
                            <p class="text-white/80 text-sm">Regular uploads, quality content, and helping others with form tips earn bonus points and achievements!</p>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6">
                    <button onclick="closeModal('upload-tips-modal'); openUploadModal('upload_1');" class="w-full btn-primary">
                        <i class="fas fa-camera mr-2"></i>Start Uploading
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('upload-tips-modal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Achievement Visual Enhancements
function getAchievementVisuals(achievement) {
    const categoryVisuals = {
        'onboarding': { 
            icons: ['🚀', '🎯', '⭐', '🎊', '🎉', '🌟', '✨', '🎈'],
            color: 'blue'
        },
        'habits': { 
            icons: ['🔥', '⚡', '💪', '🏃‍♂️', '💯', '⚔️', '🏋️‍♀️', '🎖️'],
            color: 'red'
        },
        'progress': { 
            icons: ['📸', '📹', '📊', '📈', '🎥', '📱', '🖼️', '🎬'],
            color: 'green'
        },
        'nutrition': { 
            icons: ['🥗', '🍎', '🥕', '🥑', '🍓', '🥤', '🍽️', '🥙'],
            color: 'orange'
        },
        'social': { 
            icons: ['👥', '🤝', '💬', '👫', '🌍', '🎪', '🎭', '🎨'],
            color: 'purple'
        },
        'consistency': { 
            icons: ['⏰', '📅', '🎯', '🔄', '⚡', '💎', '🏆', '🎪'],
            color: 'yellow'
        },
        'challenges': { 
            icons: ['🏆', '🥇', '🎯', '⚔️', '🏅', '👑', '💰', '🎖️'],
            color: 'gold'
        },
        'analytics': { 
            icons: ['📊', '📈', '📉', '🔍', '📋', '💹', '🎲', '🔢'],
            color: 'cyan'
        }
    };
    
    const category = achievement.category || 'onboarding';
    const visuals = categoryVisuals[category] || categoryVisuals['onboarding'];
    
    // Select icon based on achievement ID for consistency
    const iconIndex = achievement.id ? achievement.id.charCodeAt(achievement.id.length - 1) % visuals.icons.length : 0;
    
    return {
        icon: visuals.icons[iconIndex],
        color: visuals.color
    };
}

// Enhanced Achievement Card Creation
function createEnhancedAchievementCard(achievement) {
    const { icon, color } = getAchievementVisuals(achievement);
    const progress = achievement.progress || 0;
    const isCompleted = achievement.is_completed;
    const isUnlockable = achievement.is_unlockable;
    
    let statusClass = '';
    let statusText = '';
    let progressBar = '';
    
    if (isCompleted) {
        statusClass = 'unlocked';
        statusText = '<div class="text-green-400 font-semibold text-sm"><i class="fas fa-check mr-1"></i>Unlocked</div>';
    } else if (isUnlockable) {
        statusClass = '';
        statusText = '<div class="text-yellow-400 font-semibold text-sm"><i class="fas fa-star mr-1"></i>Ready to Unlock</div>';
        progressBar = `
            <div class="progress-ring mt-4" style="--progress: ${progress}">
                <div class="progress-text">${progress}%</div>
            </div>
        `;
    } else {
        statusClass = 'locked';
        statusText = '<div class="text-gray-400 font-semibold text-sm"><i class="fas fa-lock mr-1"></i>Locked</div>';
        if (progress > 0) {
            progressBar = `
                <div class="progress-ring mt-4" style="--progress: ${progress}">
                    <div class="progress-text">${progress}%</div>
                </div>
            `;
        }
    }
    
    const difficultyColor = {
        'STANDARD': 'text-blue-400',
        'BRONZE': 'text-amber-600', 
        'SILVER': 'text-gray-300',
        'GOLD': 'text-yellow-400',
        'PLATINUM': 'text-purple-400',
        'DIAMOND': 'text-cyan-400'
    };
    
    const difficulty = (achievement.difficulty || 'STANDARD').toUpperCase();
    
    return `
        <div class="enhanced-achievement-card ${statusClass}" onclick="showAchievementShowcase(${JSON.stringify(achievement).replace(/"/g, '&quot;')})">
            <div class="achievement-icon-large">${icon}</div>
            
            <h4 class="text-white font-bold text-lg mb-2 text-center">${achievement.name}</h4>
            <p class="text-white/80 text-sm mb-4 text-center leading-relaxed min-h-[60px] flex items-center justify-center">${achievement.description}</p>
            
            <div class="flex items-center justify-between mb-4">
                <span class="px-2 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium">
                    ${(achievement.category || 'general').toUpperCase()}
                </span>
                <span class="${difficultyColor[difficulty]} text-xs font-bold">
                    ${difficulty}
                </span>
            </div>
            
            ${progressBar}
            
            <div class="flex items-center justify-between mt-4">
                <div class="text-yellow-400 font-bold">+${achievement.points || 0} pts</div>
                ${statusText}
            </div>
        </div>
    `;
}
