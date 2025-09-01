// StriveTrack Frontend JavaScript

let sessionId = localStorage.getItem('sessionId');
let currentUser = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
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
    });
    
    document.getElementById('create-habit-form').addEventListener('submit', createHabit);
    
    // Upload progress card
    document.getElementById('upload-progress-card').addEventListener('click', () => {
        document.getElementById('media-upload').click();
    });
    
    // Media upload
    document.getElementById('upload-media-btn').addEventListener('click', () => {
        document.getElementById('media-upload').click();
    });
    
    document.getElementById('media-upload').addEventListener('change', uploadMedia);
    
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
}

// Authentication functions
async function validateSession() {
    try {
        const response = await fetch('/api/validate-session', {
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
        const response = await fetch('/api/login', {
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
        const response = await fetch('/api/register', {
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
    fetch('/api/logout', {
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

async function loadDashboardData() {
    await Promise.all([
        loadHabits(),
        loadMedia(),
        loadAchievements(),
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
            const habits = await response.json();
            displayHabits(habits);
            displayTodayHabits(habits);
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
    
    habits.forEach(habit => {
        const habitElement = createHabitElement(habit, true);
        container.appendChild(habitElement);
    });
}

function displayTodayHabits(habits) {
    const container = document.getElementById('today-habits-container');
    container.innerHTML = '';
    
    const incompleteHabits = habits.filter(habit => !habit.completed_today);
    
    if (incompleteHabits.length === 0) {
        container.innerHTML = '<p class="text-white/70">All habits completed for today! 🎉</p>';
        return;
    }
    
    incompleteHabits.forEach(habit => {
        const habitElement = createSimpleHabitElement(habit);
        container.appendChild(habitElement);
    });
}

function createHabitElement(habit, showWeekView = false) {
    const div = document.createElement('div');
    div.className = 'habit-card';
    
    const categoryIcons = {
        nutrition: '🥗',
        general: '💪',
        cardio: '🏃',
        strength: '🏋️',
        flexibility: '🧘'
    };
    
    const difficultyColors = {
        easy: 'text-green-400',
        medium: 'text-yellow-400',
        hard: 'text-red-400'
    };
    
    let weekCalendar = '';
    if (showWeekView && habit.week_completions) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        weekCalendar = `
            <div class="week-calendar mt-4">
                ${habit.week_completions.map((completion, index) => `
                    <div class="day-cell ${completion.completed ? 'completed' : ''}" 
                         onclick="toggleHabitDay('${habit.id}', '${completion.date}')">
                        <div class="text-xs text-white/70">${days[index]}</div>
                        <div class="mt-1">${completion.completed ? '✓' : '○'}</div>
                    </div>
                `).join('')}
            </div>
            <div class="flex space-x-2 mt-4">
                <button class="btn-secondary flex-1" onclick="viewHabitHistory(${habit.id})">
                    <i class="fas fa-history mr-2"></i>
                    History
                </button>
                <button class="btn-danger flex-1" onclick="deleteHabit(${habit.id})">
                    <i class="fas fa-trash mr-2"></i>
                    Delete
                </button>
            </div>
        `;
    }
    
    div.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-4">
                <div class="text-2xl">${categoryIcons[habit.category] || '💪'}</div>
                <div>
                    <h3 class="text-white font-semibold text-lg">${habit.name}</h3>
                    <p class="text-white/70 text-sm">${habit.category} • ${habit.difficulty}</p>
                    ${habit.description ? `<p class="text-white/60 text-sm mt-1">${habit.description}</p>` : ''}
                </div>
            </div>
            <div class="text-right">
                <div class="text-white font-semibold">${Math.round(habit.completion_percentage)}%</div>
                <div class="text-white/70 text-sm">1/${habit.target_frequency}</div>
                <div class="text-white/60 text-xs">Goal: ${habit.target_frequency} days</div>
            </div>
        </div>
        
        <div class="mb-4">
            <div class="flex justify-between text-sm text-white/70 mb-2">
                <span>Progress</span>
                <span>${Math.round(habit.completion_percentage)}%</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2">
                <div class="progress-bar h-2 rounded-full" style="width: ${habit.completion_percentage}%"></div>
            </div>
        </div>
        
        ${weekCalendar}
    `;
    
    return div;
}

function createSimpleHabitElement(habit) {
    const div = document.createElement('div');
    div.className = 'habit-card';
    
    const categoryIcons = {
        nutrition: '🥗',
        general: '💪',
        cardio: '🏃',
        strength: '🏋️',
        flexibility: '🧘'
    };
    
    div.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
                <div class="text-2xl">${categoryIcons[habit.category] || '💪'}</div>
                <div>
                    <h3 class="text-white font-semibold">${habit.name}</h3>
                    <p class="text-white/70 text-sm">${habit.category} • ${habit.difficulty}</p>
                </div>
            </div>
            <button class="btn-primary" onclick="toggleHabitCompletion(${habit.id})">
                <i class="fas fa-check mr-2"></i>
                Complete
            </button>
        </div>
    `;
    
    return div;
}

async function toggleHabitCompletion(habitId) {
    try {
        const response = await fetch(`/api/habits/${habitId}/toggle`, {
            method: 'POST',
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.completed) {
                showNotification(`Habit completed! +${data.points_earned} points 💪`, 'success');
                // Update user points
                currentUser.points += data.points_earned;
                document.getElementById('user-points').textContent = `⭐ ${currentUser.points} pts`;
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

async function createHabit(event) {
    event.preventDefault();
    
    const name = document.getElementById('habit-name').value;
    const category = document.getElementById('habit-category').value;
    const difficulty = document.getElementById('habit-difficulty').value;
    const description = document.getElementById('habit-description').value;
    
    try {
        const response = await fetch('/api/habits', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify({ name, category, difficulty, description })
        });
        
        if (response.ok) {
            showNotification('Habit created successfully! 🎯', 'success');
            closeModal('create-habit-modal');
            document.getElementById('create-habit-form').reset();
            loadHabits();
            updateDashboardStats();
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
    if (!confirm('Are you sure you want to delete this habit?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/habits/${habitId}`, {
            method: 'DELETE',
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            showNotification('Habit deleted successfully', 'success');
            loadHabits();
            updateDashboardStats();
        } else {
            const data = await response.json();
            showNotification(data.error || 'Failed to delete habit', 'error');
        }
    } catch (error) {
        console.error('Delete habit error:', error);
        showNotification('Failed to delete habit', 'error');
    }
}

// Media functions
async function uploadMedia(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('media', file);
    
    try {
        const response = await fetch('/api/media/upload', {
            method: 'POST',
            headers: { 'x-session-id': sessionId },
            body: formData
        });
        
        if (response.ok) {
            showNotification('Media uploaded successfully! 📸', 'success');
            loadMedia();
            updateDashboardStats();
        } else {
            const data = await response.json();
            showNotification(data.error || 'Upload failed', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Upload failed', 'error');
    }
    
    event.target.value = '';
}

async function loadMedia() {
    try {
        const response = await fetch('/api/media', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const media = await response.json();
            displayMedia(media);
        }
    } catch (error) {
        console.error('Load media error:', error);
    }
}

function displayMedia(media) {
    const container = document.getElementById('media-container');
    container.innerHTML = '';
    
    if (media.length === 0) {
        container.innerHTML = '<p class="text-white/70 col-span-full text-center">No media uploaded yet. Start documenting your progress!</p>';
        return;
    }
    
    media.forEach(item => {
        const div = document.createElement('div');
        div.className = 'media-item';
        div.onclick = () => showMediaModal(item);
        
        div.innerHTML = `
            <div class="media-preview" id="media-${item.id}">
                <i class="fas fa-image text-2xl"></i>
            </div>
            <div class="p-3">
                <p class="text-sm font-medium text-white">${item.filename}</p>
                <p class="text-xs text-white/60">${new Date(item.upload_date).toLocaleDateString()}</p>
                <p class="text-xs text-white/60">${(item.file_size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
        `;
        
        container.appendChild(div);
        
        // Load the actual image
        loadMediaImage(item.id, `media-${item.id}`);
    });
}

async function loadMediaImage(mediaId, containerId) {
    try {
        const response = await fetch(`/api/media/${mediaId}/view`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `<img src="${imageUrl}" class="w-full h-full object-cover" alt="Progress photo">`;
            }
        }
    } catch (error) {
        console.error('Media image load error:', error);
    }
}

async function showMediaModal(media) {
    const modal = document.getElementById('media-modal');
    const content = document.getElementById('media-modal-content');
    
    try {
        const response = await fetch(`/api/media/${media.id}/view`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const mediaUrl = URL.createObjectURL(blob);
            
            if (media.mime_type.startsWith('image/')) {
                content.innerHTML = `
                    <img src="${mediaUrl}" class="max-w-full max-h-96 mx-auto rounded-lg" alt="${media.filename}">
                    <div class="mt-4 text-center">
                        <p class="text-white font-medium">${media.filename}</p>
                        <p class="text-white/70 text-sm">Uploaded: ${new Date(media.upload_date).toLocaleString()}</p>
                        <p class="text-white/70 text-sm">Size: ${(media.file_size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                `;
            } else if (media.mime_type.startsWith('video/')) {
                content.innerHTML = `
                    <video controls class="max-w-full max-h-96 mx-auto rounded-lg">
                        <source src="${mediaUrl}" type="${media.mime_type}">
                        Your browser does not support the video tag.
                    </video>
                    <div class="mt-4 text-center">
                        <p class="text-white font-medium">${media.filename}</p>
                        <p class="text-white/70 text-sm">Uploaded: ${new Date(media.upload_date).toLocaleString()}</p>
                        <p class="text-white/70 text-sm">Size: ${(media.file_size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                `;
            }
            
            modal.classList.remove('hidden');
        } else {
            showNotification('Failed to load media', 'error');
        }
    } catch (error) {
        console.error('Media modal error:', error);
        showNotification('Failed to load media', 'error');
    }
}

// Achievements functions
async function loadAchievements() {
    try {
        const response = await fetch('/api/achievements/all', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const achievements = await response.json();
            displayAchievements(achievements);
        }
    } catch (error) {
        console.error('Load achievements error:', error);
    }
}

function displayAchievements(achievements) {
    const container = document.getElementById('achievements-container');
    container.innerHTML = '';
    
    achievements.forEach(achievement => {
        const div = document.createElement('div');
        div.className = `achievement-card ${achievement.earned ? '' : 'locked'}`;
        
        div.innerHTML = `
            <div class="text-4xl mb-4">${achievement.icon}</div>
            <h3 class="text-lg font-bold mb-2">${achievement.name}</h3>
            <p class="text-sm mb-4">${achievement.description}</p>
            <div class="text-lg font-semibold">${achievement.points} pts</div>
            ${achievement.earned ? `<div class="text-xs mt-2">Earned ${new Date(achievement.earned_at).toLocaleDateString()}</div>` : ''}
        `;
        
        container.appendChild(div);
    });
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
        const response = await fetch('/api/admin/stats', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const stats = await response.json();
            document.getElementById('admin-total-users').textContent = stats.totalUsers;
            document.getElementById('admin-total-media').textContent = stats.totalMedia;
            document.getElementById('admin-total-habits').textContent = stats.totalHabits;
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
            <td class="py-3 px-4 text-white/70">${new Date(item.upload_date).toLocaleDateString()}</td>
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
        const response = await fetch(`/api/admin/media/${mediaId}/view`, {
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
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
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
}

async function deleteAdminMedia(mediaId) {
    if (!confirm('Are you sure you want to delete this media? This action cannot be undone.')) {
        return;
    }
    
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
        loadHabits();
    } else if (section === 'progress') {
        loadMedia();
    } else if (section === 'achievements') {
        loadAchievements();
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

