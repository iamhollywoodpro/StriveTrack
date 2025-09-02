// StriveTrack Frontend JavaScript

let sessionId = localStorage.getItem('sessionId');
let currentUser = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // CRITICAL FIX: Always show login screen first, then validate session
    showLoginScreen();
    
    if (sessionId) {
        validateSession();
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
    
    // Admin search and filter functionality (bind when elements exist)
    const adminUserSearch = document.getElementById('admin-user-search');
    const adminUserFilter = document.getElementById('admin-user-filter');
    const adminMediaSearch = document.getElementById('admin-media-search');
    const adminMediaFilter = document.getElementById('admin-media-filter');
    
    if (adminUserSearch) adminUserSearch.addEventListener('input', debounce(filterAdminUsers, 300));
    if (adminUserFilter) adminUserFilter.addEventListener('change', filterAdminUsers);
    if (adminMediaSearch) adminMediaSearch.addEventListener('input', debounce(filterAdminMediaBySearch, 300));
    if (adminMediaFilter) adminMediaFilter.addEventListener('change', () => loadAdminMedia(adminMediaFilter.value));
    
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
    try {
        const response = await fetch('/api/habits', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            const habits = data.habits || [];
            displayHabits(habits);
        }
    } catch (error) {
        console.error('Load habits error:', error);
    }
}

function displayHabits(habits) {
    const container = document.getElementById('habits-container');
    container.innerHTML = '';
    
    if (habits.length === 0) {
        container.innerHTML = '<p class="text-white/70">No habits created yet. Create your first habit to get started!</p>';
        return;
    }
    
    // Load weekly data and display habits with weekly view
    loadWeeklyHabits();
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
                <button onclick="event.stopPropagation(); deleteMediaWithConfirmation('${item.id}')" 
                        class="delete-button-gallery" 
                        title="Delete media"
                        aria-label="Delete media">
                    <i class="fas fa-trash"></i>
                </button>
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
                
                <!-- Delete Button -->
                <div class="mt-6 pt-4 border-t border-white/10">
                    <button onclick="deleteMediaFromModal('${media.id}')" class="btn-danger w-full">
                        <i class="fas fa-trash mr-2"></i>
                        Delete Media
                    </button>
                    <div class="text-white/50 text-xs text-center mt-2">
                        This action cannot be undone. Points will be deducted.
                    </div>
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

// Delete media function with confirmation (for modal button)
async function deleteMediaFromModal(mediaId) {
    showConfirmationModal(
        'Are you sure you want to delete this media? This action cannot be undone and will deduct points from your account.',
        async function() {
            await performMediaDeletion(mediaId);
        }
    );
}

// Core media deletion function (no confirmation)
async function performMediaDeletion(mediaId) {
    try {
        const response = await fetch(`/api/media/${mediaId}/delete`, {
            method: 'DELETE',
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            showNotification(`Media deleted successfully! (-${data.points_deducted} pts)`, 'success');
            
            // Close modal first
            document.getElementById('media-modal').classList.add('hidden');
            
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

// Global delete media function with confirmation modal
function deleteMediaWithConfirmation(mediaId) {
    showConfirmationModal(
        'Are you sure you want to delete this media? This action cannot be undone and will deduct points from your account.',
        async function() {
            await performMediaDeletion(mediaId);
        }
    );
}

// Legacy delete media function (for hover buttons if needed)
async function deleteMedia(mediaId) {
    return deleteMediaFromModal(mediaId);
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
    try {
        const response = await fetch('/api/achievements', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayAchievements(data);
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
    
    // Enhanced achievement categories with 8 distinct categories
    const categories = [
        { key: 'onboarding', title: '🚀 Getting Started', description: 'First steps on your fitness journey' },
        { key: 'habits', title: '🔥 Habit Building', description: 'Building and maintaining consistent routines' },
        { key: 'progress', title: '📸 Progress Tracking', description: 'Document your transformation journey' },
        { key: 'nutrition', title: '🍎 Nutrition & Health', description: 'Fueling your body for success' },
        { key: 'social', title: '👥 Social & Community', description: 'Connect and compete with others' },
        { key: 'consistency', title: '⚡ Consistency & Streaks', description: 'Dedication through time' },
        { key: 'challenges', title: '🏆 Challenges & Goals', description: 'Push your limits and achieve more' },
        { key: 'analytics', title: '📊 Data & Analytics', description: 'Understanding your patterns and progress' }
    ];
    
    // Get filter value
    const filterSelect = document.getElementById('achievement-category-filter');
    const selectedFilter = filterSelect ? filterSelect.value : 'all';
    
    categories.forEach(category => {
        const categoryAchievements = data.grouped_achievements[category.key] || [];
        if (categoryAchievements.length === 0) return;
        
        // Apply filter
        if (selectedFilter !== 'all' && selectedFilter !== category.key) return;
        
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'mb-8 achievement-category';
        categoryDiv.setAttribute('data-category', category.key);
        
        const earnedCount = categoryAchievements.filter(a => a.is_completed).length;
        const totalPoints = categoryAchievements.reduce((sum, a) => sum + (a.is_completed ? a.points : 0), 0);
        
        categoryDiv.innerHTML = `
            <div class="mb-4 p-4 bg-gradient-to-r from-slate-800/30 to-slate-700/30 rounded-lg border border-white/10">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-xl font-bold text-white">${category.title}</h3>
                    <div class="text-right">
                        <div class="text-yellow-400 font-semibold">⭐ ${totalPoints} pts</div>
                        <div class="text-white/60 text-sm">${earnedCount}/${categoryAchievements.length}</div>
                    </div>
                </div>
                <p class="text-white/70 text-sm mb-2">${category.description}</p>
                <div class="w-full bg-white/10 rounded-full h-2">
                    <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
                         style="width: ${categoryAchievements.length > 0 ? (earnedCount / categoryAchievements.length) * 100 : 0}%"></div>
                </div>
            </div>
            <div class="achievement-grid" id="category-${category.key}">
            </div>
        `;
        
        container.appendChild(categoryDiv);
        
        const categoryContainer = document.getElementById(`category-${category.key}`);
        categoryAchievements.forEach(achievement => {
            const achievementElement = createAchievementElement(achievement);
            categoryContainer.appendChild(achievementElement);
        });
    });
    
    if (Object.keys(data.grouped_achievements).length === 0) {
        container.innerHTML = '<p class="text-white/70 text-center">No achievements available yet. Keep using StriveTrack to unlock achievements!</p>';
    }
    
    // Add event listener for category filter
    const categoryFilter = document.getElementById('achievement-category-filter');
    if (categoryFilter && !categoryFilter.hasAttribute('data-listener')) {
        categoryFilter.setAttribute('data-listener', 'true');
        categoryFilter.addEventListener('change', () => {
            displayAchievements(data);
        });
    }
}

function createAchievementElement(achievement) {
    const div = document.createElement('div');
    
    // Use our custom achievement-card class with status-based styling
    let cardClass = 'achievement-card';
    let pulseClass = '';
    
    if (achievement.is_completed) {
        // Keep the gradient for completed achievements
        cardClass = 'achievement-card';
    } else if (achievement.is_unlockable) {
        cardClass = 'achievement-card';
        pulseClass = 'achievement-pulse';
    } else {
        cardClass = 'achievement-card locked';
    }
    
    div.className = `${cardClass} ${pulseClass}`;
    
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
                    <span class="px-2 py-1 rounded" style="background-color: ${difficultyColors[achievement.difficulty]}; color: white; font-size: 10px;">
                        ${achievement.difficulty.toUpperCase()}
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
            loadAdminUsers(),
            loadAdminMedia()
        ]);
    }
}

// Admin stats are now loaded as part of loadAdminUsers()

async function loadAdminUsers() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            allAdminUsers = data.users || [];
            displayAdminUsers(allAdminUsers);
            updateAdminStats(data.stats || {});
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
        
        const joinedDate = new Date(user.created_at).toLocaleDateString();
        const hasActivity = (user.total_habits > 0 || user.total_media > 0);
        
        row.innerHTML = `
            <td class="py-3 px-4">
                <div class="text-white font-medium">${user.email.split('@')[0]}</div>
                <div class="text-white/50 text-xs">Joined ${joinedDate}</div>
                ${user.flagged_media > 0 ? `<div class="text-red-400 text-xs">⚠️ ${user.flagged_media} flagged</div>` : ''}
            </td>
            <td class="py-3 px-4 text-white/70">${user.email}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'} text-white">
                    ${user.role}
                </span>
            </td>
            <td class="py-3 px-4">
                <div class="text-white font-medium">${user.points || 0} pts</div>
                <div class="text-white/50 text-xs">
                    ${user.total_habits}H • ${user.total_media}M • ${user.total_completions}C
                </div>
            </td>
            <td class="py-3 px-4">
                <div class="flex space-x-2">
                    ${user.role !== 'admin' ? `
                        <button onclick="viewAdminUserDetails('${user.id}')" class="btn-secondary text-xs">View</button>
                        <button onclick="deleteAdminUser('${user.id}')" class="btn-danger text-xs">Delete</button>
                    ` : '<span class="text-white/40 text-xs">Protected</span>'}
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// loadAdminMedia function moved below with filtering support

function displayAdminMedia(media) {
    const tbody = document.getElementById('admin-media-table');
    tbody.innerHTML = '';
    
    media.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'border-b border-white/5 hover:bg-white/5';
        
        const isVideo = item.media_type === 'video';
        const uploadDate = new Date(item.uploaded_at).toLocaleDateString();
        const fileSize = (item.file_size / 1024 / 1024).toFixed(2);
        
        row.innerHTML = `
            <td class="py-3 px-4">
                <div class="w-16 h-16 bg-gray-700 rounded flex items-center justify-center cursor-pointer" 
                     id="admin-media-${item.id}" 
                     onclick="viewAdminMediaModal('${item.id}')">
                    <i class="fas fa-${isVideo ? 'video' : 'image'} text-gray-400"></i>
                </div>
            </td>
            <td class="py-3 px-4">
                <div class="text-white font-medium">${item.original_name}</div>
                <div class="text-white/50 text-xs">${item.file_type}</div>
                ${item.description ? `<div class="text-white/60 text-xs mt-1">${item.description.substring(0, 50)}${item.description.length > 50 ? '...' : ''}</div>` : ''}
            </td>
            <td class="py-3 px-4">
                <div class="text-white/70">${item.userEmail.split('@')[0]}</div>
                <div class="text-white/50 text-xs">${item.userEmail}</div>
            </td>
            <td class="py-3 px-4 text-white/70">${uploadDate}</td>
            <td class="py-3 px-4 text-white/70">${fileSize} MB</td>
            <td class="py-3 px-4">
                <button onclick="toggleAdminMediaFlag('${item.id}', this)" 
                        class="btn-secondary text-xs ${item.is_flagged ? 'bg-red-600 text-white' : ''}">
                    ${item.is_flagged ? 'Unflag' : 'Flag'}
                </button>
            </td>
            <td class="py-3 px-4">
                <div class="flex space-x-1">
                    <button onclick="viewAdminMediaModal('${item.id}')" class="btn-secondary text-xs" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="downloadAdminMedia('${item.id}', '${item.original_name}')" class="btn-secondary text-xs" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button onclick="deleteAdminMedia('${item.id}')" class="btn-danger text-xs" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
        
        // Load media preview
        loadAdminMediaPreview(item.id, `admin-media-${item.id}`, isVideo);
    });
}

async function loadAdminMediaPreview(mediaId, containerId, isVideo = false) {
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
                        <video class="w-full h-full object-cover rounded" muted>
                            <source src="${mediaUrl}" type="${blob.type}">
                        </video>
                    `;
                } else {
                    container.innerHTML = `<img src="${mediaUrl}" class="w-full h-full object-cover rounded" alt="Media preview">`;
                }
            }
        }
    } catch (error) {
        console.error('Admin media preview load error:', error);
    }
}

// Update admin stats display
function updateAdminStats(stats) {
    document.getElementById('admin-total-users').textContent = stats.total_users || 0;
    document.getElementById('admin-total-media').textContent = stats.total_media || 0;
    document.getElementById('admin-total-habits').textContent = stats.total_habits || 0;
    document.getElementById('admin-flagged-media').textContent = stats.flagged_media || 0;
}

// View user details modal
async function viewAdminUserDetails(userId) {
    try {
        // For now, show basic user info - can be expanded later
        showNotification('User details view - feature coming soon', 'info');
    } catch (error) {
        console.error('View user details error:', error);
        showNotification('Failed to load user details', 'error');
    }
}

// View media in modal
async function viewAdminMediaModal(mediaId) {
    try {
        const response = await fetch(`/api/media/file/${mediaId}`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const mediaUrl = URL.createObjectURL(blob);
            const isVideo = blob.type.startsWith('video/');
            
            const modal = document.getElementById('media-modal');
            const content = document.getElementById('media-modal-content');
            
            content.innerHTML = `
                <div class="mb-4">
                    <h3 class="text-xl font-bold text-white mb-2">Admin Media View</h3>
                    ${isVideo ? `
                        <video controls class="w-full max-h-96 rounded-lg">
                            <source src="${mediaUrl}" type="${blob.type}">
                        </video>
                    ` : `
                        <img src="${mediaUrl}" class="w-full max-h-96 object-contain rounded-lg" alt="Media preview">
                    `}
                    <div class="flex space-x-4 mt-4">
                        <button onclick="downloadAdminMedia('${mediaId}', 'media')" class="btn-primary">
                            <i class="fas fa-download mr-2"></i>Download
                        </button>
                        <button onclick="toggleAdminMediaFlag('${mediaId}', this)" class="btn-secondary">
                            <i class="fas fa-flag mr-2"></i>Toggle Flag
                        </button>
                        <button onclick="deleteAdminMedia('${mediaId}')" class="btn-danger">
                            <i class="fas fa-trash mr-2"></i>Delete
                        </button>
                    </div>
                </div>
            `;
            
            modal.classList.remove('hidden');
        }
    } catch (error) {
        console.error('View admin media modal error:', error);
        showNotification('Failed to load media', 'error');
    }
}

// Utility function for debouncing search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Store original data for client-side filtering
let allAdminUsers = [];
let allAdminMedia = [];

// Filter admin users
function filterAdminUsers() {
    const searchTerm = document.getElementById('admin-user-search').value.toLowerCase();
    const filterType = document.getElementById('admin-user-filter').value;
    
    let filteredUsers = allAdminUsers.filter(user => {
        // Search filter
        const matchesSearch = user.email.toLowerCase().includes(searchTerm) || 
                             user.email.split('@')[0].toLowerCase().includes(searchTerm);
        
        // Type filter
        let matchesType = true;
        switch (filterType) {
            case 'active':
                matchesType = user.total_habits > 0 || user.total_media > 0;
                break;
            case 'flagged':
                matchesType = user.flagged_media > 0;
                break;
            case 'admin':
                matchesType = user.role === 'admin';
                break;
            default:
                matchesType = true;
        }
        
        return matchesSearch && matchesType;
    });
    
    displayAdminUsers(filteredUsers);
}

// Filter admin media with server-side filtering
async function filterAdminMedia() {
    const filterType = document.getElementById('admin-media-filter').value;
    await loadAdminMedia(filterType);
}

// Update loadAdminMedia to support filtering  
async function loadAdminMedia(filter = 'all') {
    try {
        let url = '/api/admin/media';
        if (filter && filter !== 'all') {
            url += `?filter=${filter}`;
        }
        
        const response = await fetch(url, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            allAdminMedia = data.media || [];
            displayAdminMedia(allAdminMedia);
            
            // Apply client-side search if there's a search term
            const searchTerm = document.getElementById('admin-media-search')?.value;
            if (searchTerm) {
                filterAdminMediaBySearch();
            }
        }
    } catch (error) {
        console.error('Load admin media error:', error);
    }
}

// Client-side media search filtering
function filterAdminMediaBySearch() {
    const searchTerm = document.getElementById('admin-media-search').value.toLowerCase();
    
    const filteredMedia = allAdminMedia.filter(item => 
        item.original_name.toLowerCase().includes(searchTerm) ||
        item.userEmail.toLowerCase().includes(searchTerm) ||
        (item.description && item.description.toLowerCase().includes(searchTerm))
    );
    
    displayAdminMedia(filteredMedia);
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
                loadAdminMedia(); // Refresh media list as user's media was deleted
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
                loadAdminUsers(); // Refresh to update stats
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
            button.className = `btn-secondary text-xs ${data.flagged ? 'bg-red-600 text-white' : ''}`;
            showNotification(data.flagged ? 'Media flagged' : 'Media unflagged', 'success');
            loadAdminUsers(); // Refresh to update flagged media count
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
        loadWeeklyHabits();
    } else if (section === 'progress') {
        loadMedia();
    } else if (section === 'nutrition') {
        loadNutrition();
    } else if (section === 'achievements') {
        loadAchievements();
        loadDailyChallenges();
        loadLeaderboards();
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

