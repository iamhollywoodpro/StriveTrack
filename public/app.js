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
    weekStart.setHours(0, 0, 0, 0); // Reset time to midnight
    
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
    console.log('🖱️ CLICK DETECTED! Target:', event.target);
    console.log('🖱️ Target classes:', event.target.className);
    console.log('🖱️ Target parent:', event.target.parentElement);
    
    // Handle day cell clicks - check target and parent
    let dayCell = null;
    
    if (event.target.classList.contains('day-cell')) {
        dayCell = event.target;
    } else if (event.target.parentElement && event.target.parentElement.classList.contains('day-cell')) {
        dayCell = event.target.parentElement;
    } else if (event.target.closest && event.target.closest('.day-cell')) {
        dayCell = event.target.closest('.day-cell');
    }
    
    if (dayCell) {
        const habitId = dayCell.getAttribute('data-habit-id');
        const date = dayCell.getAttribute('data-date');
        
        console.log('📅 Day cell clicked:', habitId, date);
        
        if (habitId && date) {
            event.preventDefault();
            event.stopPropagation();
            toggleHabitCompletion(habitId, date);
            return;
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

// **FIXED TOGGLE HABIT COMPLETION WITH POINTS**
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
    
    const newStatus = !wasCompleted;
    console.log('🎯 Habit', habitId, 'on', targetDate, ':', wasCompleted ? 'unmarked' : 'marked');
    
    // Save to localStorage
    saveLocalCompletions(completions);
    
    // Calculate points change
    const pointsChange = newStatus ? 10 : -10;
    console.log('💰 Points change:', pointsChange);
    
    // Update points display immediately
    updatePointsDisplay();
    
    // Refresh habit display to show new status
    loadHabits();
    
    // Show notification with points
    const action = wasCompleted ? 'unmarked' : 'completed';
    const pointsText = newStatus ? ' (+10 pts)' : ' (-10 pts)';
    showNotification(`Habit ${action}${pointsText} 🎉`, newStatus ? 'success' : 'info');
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

// MISSING HABIT CREATION FUNCTIONS
function openCreateHabitModal() {
    console.log('📝 Opening create habit modal');
    showModal('create-habit-modal');
}

function handleCreateHabit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const habit = {
        id: 'habit_' + Date.now(),
        name: formData.get('habit-name') || document.getElementById('habit-name').value,
        description: formData.get('habit-description') || document.getElementById('habit-description').value,
        weekly_target: parseInt(formData.get('habit-target') || document.getElementById('habit-target')?.value || 7),
        difficulty: formData.get('habit-difficulty') || document.getElementById('habit-difficulty')?.value || 'medium',
        created_at: new Date().toISOString()
    };
    
    console.log('🎯 Creating habit:', habit);
    
    const habits = getLocalHabits();
    habits.push(habit);
    saveLocalHabits(habits);
    
    closeModal('create-habit-modal');
    loadHabits();
    updatePointsDisplay();
    
    showNotification(`Habit "${habit.name}" created successfully! 🎉`, 'success');
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

// **FIXED MEDIA UPLOAD FUNCTIONS**
function openMediaUploadModal() {
    console.log('📸 Opening media upload modal');
    showModal('media-upload-modal');
}

function handleMediaUpload() {
    console.log('📸 Handling media upload');
    
    const fileInput = document.getElementById('media-file-input');
    if (!fileInput) {
        console.log('❌ File input not found');
        showNotification('Upload interface not ready. Please try again.', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    if (!file) {
        showNotification('Please select a file to upload.', 'warning');
        return;
    }
    
    console.log('📸 Uploading file:', file.name, file.type);
    
    // Show upload progress
    showNotification('Upload starting...', 'info');
    
    setTimeout(() => {
        // Create media item
        const mediaItem = {
            id: 'media_' + Date.now(),
            type: file.type.startsWith('image/') ? 'before' : 'progress', // Default type
            name: file.name,
            uploaded_at: new Date().toISOString(),
            url: URL.createObjectURL(file),
            size: file.size
        };
        
        console.log('📸 Created media item:', mediaItem);
        
        // Save to localStorage
        const media = JSON.parse(localStorage.getItem('strivetrack_media') || '[]');
        media.push(mediaItem);
        localStorage.setItem('strivetrack_media', JSON.stringify(media));
        
        showNotification('Media uploaded successfully! 📸', 'success');
        closeModal('media-upload-modal');
        
        // Clear file input
        fileInput.value = '';
        
        // Refresh media gallery
        loadProgressGallery();
        
    }, 1500);
}

// Add media upload button handlers
function setupMediaUploadButtons() {
    const uploadButtons = document.querySelectorAll('[onclick*="openMediaUploadModal"], #upload-media-btn, .upload-btn');
    uploadButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            openMediaUploadModal();
        });
    });
    
    console.log('✅ Media upload buttons connected:', uploadButtons.length);
}

// **UTILITY FUNCTIONS**

// Simple navigation
function showTab(sectionName) {
    console.log('🔄 Switching to section:', sectionName);
    
    // Hide all content sections
    const sections = ['dashboard-section', 'habits-section', 'progress-section', 'nutrition-section', 
                     'goals-section', 'achievements-section', 'social-section', 'coming-soon-section', 'admin-section'];
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('hidden');
        }
    });
    
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show target section (add -section suffix)
    const targetSectionId = sectionName + '-section';
    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        console.log('✅ Showing section:', targetSectionId);
    } else {
        console.log('❌ Section not found:', targetSectionId);
    }
    
    // Add active class to clicked tab
    const activeTab = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Show admin tab if admin user
    if (currentUser && currentUser.role === 'admin') {
        const adminTab = document.getElementById('admin-tab');
        if (adminTab) {
            adminTab.classList.remove('hidden');
        }
    }
    
    // Load content based on section
    switch(sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'habits':
            loadHabits();
            break;
        case 'progress':
            loadProgressGallery();
            break;
        case 'achievements':
            loadAchievements();
            break;
        case 'admin':
            loadAdminDashboard();
            break;
        case 'goals':
            loadGoals();
            break;
        case 'nutrition':
            loadNutrition();
            break;
        case 'social':
            loadSocialHub();
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
    
    // Show admin tab if admin
    if (currentUser && currentUser.role === 'admin') {
        const adminTab = document.getElementById('admin-tab');
        if (adminTab) {
            adminTab.classList.remove('hidden');
            console.log('✅ Admin tab shown for:', currentUser.email);
        }
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
    
    // CONNECT NAVIGATION TABS
    document.querySelectorAll('.nav-tab[data-section]').forEach(tab => {
        tab.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showTab(section);
        });
    });
    console.log('✅ Navigation tabs connected');
    
    // CONNECT HABIT CREATION BUTTONS
    const createHabitCard = document.getElementById('create-habit-card');
    if (createHabitCard) {
        createHabitCard.addEventListener('click', openCreateHabitModal);
    }
    
    const addHabitBtn = document.getElementById('add-habit-btn');
    if (addHabitBtn) {
        addHabitBtn.addEventListener('click', openCreateHabitModal);
    }
    
    const createHabitForm = document.getElementById('create-habit-form');
    if (createHabitForm) {
        createHabitForm.addEventListener('submit', handleCreateHabit);
    }
    
    console.log('✅ Habit creation buttons connected');
    
    // CONNECT MEDIA UPLOAD BUTTONS
    setupMediaUploadButtons();
    
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
// Missing load functions
function loadAchievements() {
    console.log('🏆 Loading achievements...');
    // Show placeholder content
    const container = document.getElementById('achievements-container');
    if (container) {
        container.innerHTML = '<div class="text-center text-white p-8">🏆 Achievements feature coming soon!</div>';
    }
}

function loadAdminDashboard() {
    console.log('⚡ Loading admin dashboard...');
    if (currentUser && currentUser.role === 'admin') {
        console.log('✅ Admin dashboard loaded for:', currentUser.email);
        // Show admin-specific content
        const adminContainer = document.getElementById('admin-container');
        if (adminContainer) {
            adminContainer.innerHTML = `
                <div class="text-center text-white p-8">
                    <h2 class="text-2xl mb-4">⚡ Admin Dashboard</h2>
                    <p>Welcome, Admin ${currentUser.name}!</p>
                    <p class="text-white/60 mt-2">Admin features are being developed.</p>
                </div>
            `;
        }
    }
}

function loadGoals() {
    console.log('🎯 Loading goals...');
    const container = document.getElementById('goals-container');
    if (container) {
        container.innerHTML = '<div class="text-center text-white p-8">🎯 Goals feature coming soon!</div>';
    }
}

function loadNutrition() {
    console.log('🍎 Loading nutrition...');
    const container = document.getElementById('nutrition-container');
    if (container) {
        container.innerHTML = '<div class="text-center text-white p-8">🍎 Nutrition tracking coming soon!</div>';
    }
}

function loadSocialHub() {
    console.log('👥 Loading social hub...');
    const container = document.getElementById('social-container');
    if (container) {
        container.innerHTML = '<div class="text-center text-white p-8">👥 Social features coming soon!</div>';
    }
}

// Make functions globally accessible
window.showTab = showTab;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleProfileUpdate = handleProfileUpdate;
window.openMediaUploadModal = openMediaUploadModal;
window.handleMediaUpload = handleMediaUpload;
window.openCreateHabitModal = openCreateHabitModal;
window.handleCreateHabit = handleCreateHabit;
window.toggleHabitCompletion = toggleHabitCompletion;
window.deleteHabit = deleteHabit;
window.createSampleHabits = createSampleHabits;
window.showModal = showModal;
window.closeModal = closeModal;
window.logout = logout;

console.log('✅ StriveTrack FIXED version loaded successfully!');