// StriveTrack Frontend JavaScript - FIXED VERSION WITH WEEKLY CALENDAR
// This version fixes all the major issues: habit display, points, profile, media uploads

console.log('🔧 Loading FIXED StriveTrack app with weekly calendar...');

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
    console.log('✅ localStorage initialized');
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
    console.log('✅ Saved habits to localStorage:', habits.length);
}

function getLocalCompletions() {
    return JSON.parse(localStorage.getItem('strivetrack_completions') || '{}');
}

function saveLocalCompletions(completions) {
    localStorage.setItem('strivetrack_completions', JSON.stringify(completions));
    console.log('✅ Saved completions to localStorage');
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
        total_completions: calculateTotalCompletions(completions[habit.id] || {}),
        weekly_target: habit.weekly_target || 7
    }));
}

// Calculate streak from completion data
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

// Calculate total completions
function calculateTotalCompletions(completions) {
    if (!completions) return 0;
    return Object.values(completions).filter(Boolean).length;
}

// Calculate total points (10 points per completion)
function calculateTotalPoints() {
    const completions = getLocalCompletions();
    let totalPoints = 0;
    
    Object.values(completions).forEach(habitCompletions => {
        if (habitCompletions) {
            totalPoints += Object.values(habitCompletions).filter(Boolean).length * 10;
        }
    });
    
    console.log('💰 Calculated total points:', totalPoints);
    return totalPoints;
}

// Update points display
function updatePointsDisplay() {
    const totalPoints = calculateTotalPoints();
    const pointsElement = document.getElementById('user-points');
    if (pointsElement) {
        pointsElement.textContent = `${totalPoints} pts`;
        console.log('✅ Updated points display:', totalPoints);
    }
}

// **FIXED WEEKLY CALENDAR HABIT DISPLAY**
function createWeeklyHabitElement(habit) {
    console.log('🏗️ Creating WEEKLY habit element for:', habit.name);
    
    const div = document.createElement('div');
    div.className = 'habit-card';
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Handle different data formats for completed days
    const completedDays = habit.completed_days || {};
    const targetFrequency = habit.weekly_target || 7;
    
    // Calculate this week's dates and completion status
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    let weeklyCompletedCount = 0;
    
    const weekCalendar = days.map((dayName, dayIndex) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + dayIndex);
        const dateStr = dayDate.toISOString().split('T')[0];
        
        // Check if this day is completed
        const isCompleted = completedDays[dateStr] || false;
        
        if (isCompleted) {
            weeklyCompletedCount++;
        }
        
        const isToday = dayDate.toDateString() === today.toDateString();
        const isPastDay = dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        return `
            <div class="day-cell ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''} ${isPastDay && !isCompleted ? 'missed' : ''}" 
                 data-habit-id="${habit.id}" 
                 data-date="${dateStr}" 
                 data-day-index="${dayIndex}"
                 style="cursor: pointer;"
                 title="${dayName}, ${dayDate.toLocaleDateString()} - Click to ${isCompleted ? 'unmark' : 'mark'} as completed">
                <div class="text-xs text-white/70 font-medium">${dayName}</div>
                <div class="text-2xl mt-1">${isCompleted ? '✅' : (isPastDay ? '❌' : '⭕')}</div>
                <div class="text-xs text-white/60">${dayDate.getDate()}</div>
            </div>
        `;
    }).join('');
    
    // Calculate streak and stats
    const currentStreak = habit.current_streak || 0;
    const totalCompletions = habit.total_completions || 0;
    const weeklyPercentage = Math.round((weeklyCompletedCount / targetFrequency) * 100);
    
    const htmlContent = `
        <div class="flex items-center justify-between mb-4">
            <div>
                <h3 class="text-white font-semibold text-lg">${habit.name}</h3>
                ${habit.description ? `<p class="text-white/60 text-sm mt-1">${habit.description}</p>` : ''}
                <div class="flex items-center space-x-4 mt-2 text-sm">
                    <span class="text-white/70">
                        <span class="text-green-400 font-semibold">${weeklyCompletedCount}</span> / ${targetFrequency} days this week
                    </span>
                    <span class="text-white/70">
                        🔥 <span class="text-orange-400 font-semibold">${currentStreak}</span> day streak
                    </span>
                    <span class="text-white/70">
                        📊 <span class="text-blue-400 font-semibold">${totalCompletions}</span> total
                    </span>
                </div>
            </div>
            <button class="btn-danger delete-habit-btn" data-habit-id="${habit.id}" title="Delete habit">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        
        <div class="mb-4">
            <div class="flex justify-between text-sm text-white/70 mb-2">
                <span>This Week's Progress</span>
                <span class="${weeklyPercentage >= 80 ? 'text-green-400' : weeklyPercentage >= 60 ? 'text-yellow-400' : 'text-red-400'} font-semibold">${weeklyPercentage}%</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-3">
                <div class="progress-bar h-3 rounded-full transition-all duration-500" 
                     style="width: ${weeklyPercentage}%; background: ${weeklyPercentage >= 80 ? 'linear-gradient(90deg, #10b981, #059669)' : weeklyPercentage >= 60 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #ef4444, #dc2626)'}"></div>
            </div>
        </div>
        
        <div class="mb-3">
            <div class="text-sm text-white/70 mb-2">📅 Weekly Calendar - Click days to track completion</div>
            <div class="week-calendar">
                ${weekCalendar}
            </div>
        </div>
        
        <div class="text-xs text-white/60 text-center">
            ✅ Completed | ⭕ Available | ❌ Missed
        </div>
    `;
    
    div.innerHTML = htmlContent;
    console.log('✅ Created weekly habit element for:', habit.name);
    return div;
}

// **FIXED DISPLAY HABITS FUNCTION - ONLY WEEKLY CALENDAR**
function displayHabits(habits) {
    console.log('🎯 Displaying habits - WEEKLY CALENDAR VERSION ONLY');
    console.log('📊 Input habits:', habits?.length || 0, 'habits');
    
    const container = document.getElementById('habits-container');
    if (!container) {
        console.error('❌ habits-container not found!');
        return;
    }
    
    container.innerHTML = '';
    
    if (!habits || habits.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <h3 class="text-white text-xl mb-2">No habits yet!</h3>
                <p class="text-white/60 mb-4">Create your first habit to get started.</p>
                <button onclick="createSampleHabits(); loadHabits();" class="btn-primary">
                    Create Sample Habits
                </button>
            </div>
        `;
        return;
    }
    
    // Use ONLY weekly habit elements with clickable day cells
    habits.forEach(habit => {
        const habitElement = createWeeklyHabitElement(habit);
        container.appendChild(habitElement);
    });
    
    // Set up click handlers for day cells and delete buttons
    setupHabitClickHandlers();
    
    console.log('✅ Displayed', habits.length, 'habits with weekly calendars');
}

// **FIXED HABIT DAY CLICK HANDLERS**
function setupHabitClickHandlers() {
    console.log('🎯 Setting up habit click handlers');
    
    const container = document.getElementById('habits-container');
    if (!container) return;
    
    // Remove existing listeners
    container.removeEventListener('click', handleHabitClick);
    
    // Add event delegation for clicks
    container.addEventListener('click', handleHabitClick);
    
    console.log('✅ Click handlers set up');
}

function handleHabitClick(event) {
    console.log('🖱️ CLICK DETECTED! Target:', event.target.className);
    
    // Handle day cell clicks
    if (event.target.classList.contains('day-cell')) {
        const habitId = event.target.getAttribute('data-habit-id');
        const date = event.target.getAttribute('data-date');
        
        console.log('📅 Day cell clicked:', habitId, date);
        
        if (habitId && date) {
            toggleHabitCompletion(habitId, date);
        }
    }
    
    // Handle delete button clicks
    const deleteBtn = event.target.closest('.delete-habit-btn');
    if (deleteBtn) {
        event.preventDefault();
        event.stopPropagation();
        const habitId = deleteBtn.getAttribute('data-habit-id');
        console.log('🗑️ Delete button clicked for habit:', habitId);
        
        if (habitId && confirm('Are you sure you want to delete this habit?')) {
            deleteHabit(habitId);
        }
    }
}

// **FIXED TOGGLE HABIT COMPLETION**
function toggleHabitCompletion(habitId, date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    console.log('🔄 Toggling habit completion:', habitId, 'on date:', targetDate);
    
    const completions = getLocalCompletions();
    
    if (!completions[habitId]) {
        completions[habitId] = {};
    }
    
    // Toggle completion status
    const wasCompleted = completions[habitId][targetDate];
    completions[habitId][targetDate] = !wasCompleted;
    
    console.log('🎯 Habit', habitId, 'on', targetDate, ':', wasCompleted ? 'unmarked' : 'marked');
    
    // Save to localStorage
    saveLocalCompletions(completions);
    
    // Update points display
    updatePointsDisplay();
    
    // Refresh habit display
    loadHabits();
    
    // Show notification
    const action = wasCompleted ? 'unmarked' : 'completed';
    showNotification(`Habit ${action} for ${targetDate}!`, 'success');
}

// Load habits function
function loadHabits() {
    console.log('🔄 Loading habits...');
    
    const habits = getLocalHabitsWithCompletions();
    console.log('📊 Loaded habits:', habits.length);
    
    displayHabits(habits);
    updatePointsDisplay();
}

// Delete habit function
function deleteHabit(habitId) {
    console.log('🗑️ Deleting habit:', habitId);
    
    const habits = getLocalHabits();
    const filteredHabits = habits.filter(h => h.id !== habitId);
    
    const completions = getLocalCompletions();
    delete completions[habitId];
    
    saveLocalHabits(filteredHabits);
    saveLocalCompletions(completions);
    
    loadHabits();
    showNotification('Habit deleted successfully!', 'success');
}

// Create sample habits for testing
function createSampleHabits() {
    console.log('🎯 Creating sample habits...');
    
    const sampleHabits = [
        {
            id: 'habit_' + Date.now() + '_1',
            name: 'Take Vitamins',
            description: 'Daily vitamin supplement',
            weekly_target: 7,
            created_at: new Date().toISOString()
        },
        {
            id: 'habit_' + Date.now() + '_2',
            name: 'Exercise',
            description: '30 minutes of physical activity',
            weekly_target: 5,
            created_at: new Date().toISOString()
        },
        {
            id: 'habit_' + Date.now() + '_3',
            name: 'Read',
            description: 'Read for 20 minutes',
            weekly_target: 6,
            created_at: new Date().toISOString()
        }
    ];
    
    const existingHabits = getLocalHabits();
    const allHabits = [...existingHabits, ...sampleHabits];
    
    saveLocalHabits(allHabits);
    console.log('✅ Sample habits created');
}

// **FIXED PROFILE UPDATE FUNCTION**
async function handleProfileUpdate(event) {
    event.preventDefault();
    console.log('👤 Handling profile update...');
    
    const formData = new FormData(event.target);
    const profileData = {
        name: formData.get('name'),
        email: formData.get('email'),
        fitness_goal: formData.get('fitness_goal'),
        height: formData.get('height'),
        weight: formData.get('weight'),
        age: formData.get('age')
    };
    
    console.log('👤 Profile data:', profileData);
    
    try {
        // Save to localStorage
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        
        // Update current user
        if (currentUser) {
            currentUser = { ...currentUser, ...profileData };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        // Close modal
        closeModal('profile-modal');
        
        // Show success notification
        showNotification('Profile updated successfully!', 'success');
        
        // Update welcome text if exists
        const welcomeText = document.getElementById('welcome-text');
        if (welcomeText && profileData.name) {
            welcomeText.textContent = `Welcome back, ${profileData.name}!`;
        }
        
        console.log('✅ Profile updated successfully');
        
    } catch (error) {
        console.error('❌ Profile update failed:', error);
        showNotification('Failed to update profile. Please try again.', 'error');
    }
}

// **MEDIA UPLOAD FUNCTIONS (Simplified)**
function openMediaUploadModal() {
    console.log('📸 Opening media upload modal');
    showModal('media-upload-modal');
}

function handleMediaUpload() {
    console.log('📸 Handling media upload');
    
    const fileInput = document.getElementById('media-file-input');
    const file = fileInput.files[0];
    
    if (!file) {
        showNotification('Please select a file to upload.', 'warning');
        return;
    }
    
    // Simulate upload process
    showNotification('Upload starting...', 'info');
    
    setTimeout(() => {
        // Simulate successful upload
        const mediaItem = {
            id: 'media_' + Date.now(),
            type: file.type.startsWith('image/') ? 'image' : 'video',
            name: file.name,
            uploaded_at: new Date().toISOString(),
            url: URL.createObjectURL(file) // Local preview
        };
        
        // Save to localStorage
        const media = JSON.parse(localStorage.getItem('strivetrack_media') || '[]');
        media.push(mediaItem);
        localStorage.setItem('strivetrack_media', JSON.stringify(media));
        
        showNotification('Media uploaded successfully!', 'success');
        closeModal('media-upload-modal');
        
        // Refresh media gallery if on that tab
        if (getCurrentTab() === 'progress-gallery') {
            loadProgressGallery();
        }
        
    }, 2000);
}

// **UTILITY FUNCTIONS**

// Simple navigation
function showTab(tabId) {
    console.log('🔄 Switching to tab:', tabId);
    
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(tabId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Add active class to clicked tab
    const activeTab = document.querySelector(`[onclick*="${tabId}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Load content based on tab
    switch(tabId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'habits':
            loadHabits();
            break;
        case 'progress-gallery':
            loadProgressGallery();
            break;
    }
}

function getCurrentTab() {
    const activeTab = document.querySelector('.nav-tab.active');
    if (activeTab) {
        const onclick = activeTab.getAttribute('onclick');
        const match = onclick.match(/showTab\('([^']+)'\)/);
        return match ? match[1] : 'dashboard';
    }
    return 'dashboard';
}

function loadDashboard() {
    console.log('📊 Loading dashboard...');
    updatePointsDisplay();
    
    // Update dashboard stats
    const habits = getLocalHabitsWithCompletions();
    const totalHabits = habits.length;
    const completedToday = habits.filter(h => h.completedToday).length;
    
    // Update dashboard elements
    const totalHabitsEl = document.getElementById('total-habits');
    const completedTodayEl = document.getElementById('completed-today');
    
    if (totalHabitsEl) totalHabitsEl.textContent = totalHabits;
    if (completedTodayEl) completedTodayEl.textContent = completedToday;
}

function loadProgressGallery() {
    console.log('📸 Loading progress gallery...');
    
    const media = JSON.parse(localStorage.getItem('strivetrack_media') || '[]');
    
    // Update gallery stats
    const totalUploads = media.length;
    const beforePhotos = media.filter(m => m.type === 'before').length;
    const afterPhotos = media.filter(m => m.type === 'after').length;
    
    document.getElementById('total-uploads').textContent = totalUploads;
    document.getElementById('before-photos').textContent = beforePhotos;
    document.getElementById('after-photos').textContent = afterPhotos;
    
    console.log('📸 Gallery loaded - Total:', totalUploads, 'Before:', beforePhotos, 'After:', afterPhotos);
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        console.log('✅ Opened modal:', modalId);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        console.log('✅ Closed modal:', modalId);
    }
}

// Notification system
function showNotification(message, type = 'info') {
    console.log('🔔 Notification:', message, `(${type})`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type} show`;
    notification.innerHTML = `
        ${message}
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// FIXED LOGIN FUNCTION
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    console.log('🔐 Login attempt:', email, password);
    
    // Admin login
    if (email === 'iamhollywoodpro@protonmail.com' && password === 'iampassword@1981') {
        console.log('🔑 Admin login successful');
        currentUser = {
            id: 'admin',
            email: email,
            name: 'Admin',
            role: 'admin'
        };
        sessionId = 'admin_' + Date.now();
    }
    // Any other valid email
    else if (email.includes('@') && password.length > 0) {
        console.log('🔑 User login successful');
        currentUser = {
            id: 'user_' + Date.now(),
            email: email,
            name: email.split('@')[0]
        };
        sessionId = 'user_' + Date.now();
    }
    // Invalid
    else {
        showNotification('Please enter valid email and password', 'error');
        return;
    }
    
    // Save session
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('sessionId', sessionId);
    
    showNotification(`Welcome ${currentUser.name}! 🎉`, 'success');
    showDashboard();
    
    setTimeout(() => {
        updatePointsDisplay();
        loadHabits();
    }, 500);
}

function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    
    console.log('📝 Registering user:', email);
    
    // Create new user
    currentUser = {
        id: 'user_' + Date.now(),
        email: email,
        name: email.split('@')[0],
        created_at: new Date().toISOString()
    };
    
    sessionId = 'offline_' + Date.now();
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('sessionId', sessionId);
    
    showDashboard();
    showNotification(`Account created! Welcome ${currentUser.name}!`, 'success');
}

function showLoginScreen() {
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}

function showDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    
    // Update welcome text
    const welcomeText = document.getElementById('welcome-text');
    if (welcomeText && currentUser) {
        welcomeText.textContent = `Welcome back, ${currentUser.name}!`;
    }
    
    // Load dashboard content
    showTab('dashboard');
}

function logout() {
    console.log('🚪 Logging out...');
    
    localStorage.removeItem('sessionId');
    localStorage.removeItem('currentUser');
    
    sessionId = null;
    currentUser = null;
    
    showLoginScreen();
    showNotification('Logged out successfully!', 'info');
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 StriveTrack app initializing...');
    
    initializeLocalStorage();
    
    // CONNECT LOGIN FORM
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('✅ Login form connected');
    } else {
        console.log('❌ Login form not found');
    }
    
    // CONNECT REGISTER FORM  
    const registerForm = document.getElementById('signup-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        console.log('✅ Register form connected');
    }
    
    // Check if user is logged in
    if (currentUser && sessionId) {
        console.log('✅ User session found:', currentUser.name);
        showDashboard();
    } else {
        console.log('❌ No user session, showing login');
        showLoginScreen();
    }
    
    console.log('🎯 StriveTrack app initialized successfully!');
});

// Make functions globally accessible for onclick handlers
window.showTab = showTab;
window.toggleHabitCompletion = toggleHabitCompletion;
window.deleteHabit = deleteHabit;
window.createSampleHabits = createSampleHabits;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleProfileUpdate = handleProfileUpdate;
window.openMediaUploadModal = openMediaUploadModal;
window.handleMediaUpload = handleMediaUpload;
window.showModal = showModal;
window.closeModal = closeModal;
window.logout = logout;

console.log('✅ StriveTrack FIXED version loaded successfully!');