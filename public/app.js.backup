// StriveTrack Frontend JavaScript

// Global function test - ensure deleteHabit is accessible
window.testDeleteHabit = function() {
    console.log('🧪 Testing deleteHabit function availability:', typeof deleteHabit);
    if (typeof deleteHabit === 'function') {
        console.log('✅ deleteHabit function is available globally');
    } else {
        console.log('❌ deleteHabit function is NOT available globally');
    }
};

// Debug function to help diagnose issues
window.debugStriveTrack = function() {
    console.log('=== 🔍 StriveTrack Debug Report ===');
    console.log('📄 Current User:', currentUser);
    console.log('🎫 Session ID:', sessionId);
    console.log('🌐 Online Status:', isOnline());
    console.log('📱 Navigator Online:', navigator.onLine);
    
    // Check elements
    const elements = {
        'habits-container': document.getElementById('habits-container'),
        'user-points': document.getElementById('user-points'),
        'welcome-text': document.getElementById('welcome-text'),
        'dashboard': document.getElementById('dashboard'),
        'login-screen': document.getElementById('login-screen')
    };
    
    console.log('🏠 DOM Elements:', Object.entries(elements).map(([key, el]) => `${key}: ${el ? '✅' : '❌'}`).join(', '));
    
    // Check localStorage
    const storage = {
        currentUser: localStorage.getItem('currentUser'),
        sessionId: localStorage.getItem('sessionId'),
        habits: localStorage.getItem('strivetrack_habits'),
        completions: localStorage.getItem('strivetrack_completions')
    };
    
    console.log('💾 localStorage:', Object.entries(storage).map(([key, val]) => `${key}: ${val ? '✅' : '❌'}`).join(', '));
    
    // Parse and show actual localStorage data
    try {
        const habits = JSON.parse(localStorage.getItem('strivetrack_habits') || '[]');
        console.log('📊 Parsed habits from localStorage:', habits);
        console.log('📊 Habits count:', habits.length);
        
        const completions = JSON.parse(localStorage.getItem('strivetrack_completions') || '{}');
        console.log('📊 Parsed completions from localStorage:', completions);
    } catch (e) {
        console.error('❌ Error parsing localStorage data:', e);
    }
    
    // Test API connectivity
    if (sessionId) {
        fetch('/api/profile', { headers: { 'x-session-id': sessionId } })
            .then(r => console.log('🌐 Profile API Status:', r.status, r.ok ? '✅' : '❌'))
            .catch(e => console.log('❌ Profile API Error:', e.message));
            
        fetch('/api/habits/weekly', { headers: { 'x-session-id': sessionId } })
            .then(r => console.log('🌐 Habits API Status:', r.status, r.ok ? '✅' : '❌'))
            .catch(e => console.log('❌ Habits API Error:', e.message));
    } else {
        console.log('⚠️ No session ID - cannot test API connectivity');
    }
    
    console.log('=== End Debug Report ===');
    return 'Debug complete - check console for details';
};

// Quick habit debugging function
window.debugHabits = function() {
    console.log('=== 🎯 Habit-Specific Debug ===');
    const habits = getLocalHabits();
    console.log('📊 Raw localStorage habits:', habits);
    console.log('📊 Habits count:', habits.length);
    
    const habitsWithCompletions = getLocalHabitsWithCompletions();
    console.log('📊 Habits with completions:', habitsWithCompletions);
    console.log('📊 Habits with completions count:', habitsWithCompletions.length);
    
    // Force reload habits
    console.log('🔄 Force reloading habits...');
    loadHabits();
    
    return 'Habit debug complete - check console for details';
};

// Auto-run debug on critical errors
window.addEventListener('error', function(e) {
    console.error('🚨 Critical error detected:', e.error);
    if (e.error?.message?.includes('TypeError') || e.error?.message?.includes('ReferenceError')) {
        console.log('🔍 Running auto-debug due to critical error...');
        setTimeout(() => window.debugStriveTrack(), 1000);
    }
});

let sessionId = localStorage.getItem('sessionId');
let currentUser = null;

// ===== HYBRID STORAGE SYSTEM: CLOUDFLARE API + LOCALSTORAGE FALLBACK =====
// Primary: Use Cloudflare API when online | Fallback: Use localStorage when offline/API fails

// Initialize localStorage data structures for offline fallback
function initializeLocalStorage() {
    if (!localStorage.getItem('strivetrack_habits')) {
        localStorage.setItem('strivetrack_habits', JSON.stringify([]));
    }
    if (!localStorage.getItem('strivetrack_completions')) {
        localStorage.setItem('strivetrack_completions', JSON.stringify({}));
    }
    if (!localStorage.getItem('strivetrack_achievements')) {
        localStorage.setItem('strivetrack_achievements', JSON.stringify([]));
    }
    if (!localStorage.getItem('strivetrack_media')) {
        localStorage.setItem('strivetrack_media', JSON.stringify([]));
    }
    if (!localStorage.getItem('strivetrack_pending_sync')) {
        localStorage.setItem('strivetrack_pending_sync', JSON.stringify([]));
    }
}

// Online/Offline detection with enhanced validation
function isOnline() {
    const hasNetwork = navigator.onLine;
    const hasSession = sessionId && sessionId.trim() !== '';
    const isOfflineSession = sessionId && sessionId.startsWith('offline_');
    const result = hasNetwork && hasSession && !isOfflineSession;
    console.log(`🌐 Online check: network=${hasNetwork}, session=${hasSession}, offline=${isOfflineSession}, result=${result}`);
    return result;
}

// Queue actions for sync when offline
function queueForSync(action) {
    const pending = JSON.parse(localStorage.getItem('strivetrack_pending_sync') || '[]');
    pending.push({
        ...action,
        timestamp: Date.now()
    });
    localStorage.setItem('strivetrack_pending_sync', JSON.stringify(pending));
}

// Sync user points and profile from server with enhanced error handling
async function syncUserPointsFromServer() {
    if (!isOnline()) {
        console.log('⏸️ Skipping server sync - offline mode');
        return;
    }
    
    try {
        console.log('🔄 Syncing user data from server...');
        const response = await fetch('/api/profile', {
            headers: { 
                'x-session-id': sessionId,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const serverUser = data.user || data; // Handle different response structures
            
            if (serverUser && currentUser) {
                console.log('📊 Server user data:', serverUser);
                
                // Update points from server (authoritative)
                if (serverUser.points !== undefined) {
                    const oldPoints = currentUser.points;
                    currentUser.points = serverUser.points;
                    console.log(`💰 Points updated: ${oldPoints} → ${serverUser.points}`);
                }
                
                // Update profile info
                if (serverUser.username) {
                    currentUser.username = serverUser.username;
                }
                
                if (serverUser.profile_picture_url) {
                    currentUser.profile_picture_url = serverUser.profile_picture_url;
                }
                
                // Save updated user data
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                console.log('✅ User data synced from server:', serverUser.points, 'points');
                
                // Update display immediately
                updatePointsDisplay();
            }
        } else {
            console.log('❌ Profile API response not OK:', response.status, response.statusText);
            if (response.status === 401) {
                console.log('🔐 Session expired, showing login screen');
                showLoginScreen();
            }
        }
    } catch (error) {
        console.error('❌ Failed to sync user data from server:', error);
    }
}

// Set up online/offline sync monitoring
function setupOnlineOfflineSync() {
    // Monitor online/offline status
    window.addEventListener('online', async () => {
        console.log('🌐 Back online - processing pending sync...');
        showNotification('Back online! Syncing data...', 'info');
        await processPendingSync();
    });
    
    window.addEventListener('offline', () => {
        console.log('📱 Gone offline - will queue changes for sync');
        showNotification('Offline mode - changes will sync when back online', 'info');
    });
    
    // Periodic sync check (every 30 seconds when online)
    setInterval(async () => {
        if (isOnline()) {
            const pending = JSON.parse(localStorage.getItem('strivetrack_pending_sync') || '[]');
            if (pending.length > 0) {
                console.log(`🔄 Periodic sync check - ${pending.length} items pending`);
                await processPendingSync();
            }
        }
    }, 30000);
}

// Process sync queue when back online
async function processPendingSync() {
    if (!isOnline()) return;
    
    const pending = JSON.parse(localStorage.getItem('strivetrack_pending_sync') || '[]');
    const processed = [];
    
    for (const action of pending) {
        try {
            switch (action.type) {
                case 'create_habit':
                    await createHabitAPI(action.data);
                    break;
                case 'toggle_habit':
                    await toggleHabitAPI(action.data);
                    break;
                case 'delete_habit':
                    await deleteHabitAPI(action.data.habitId);
                    break;
            }
            processed.push(action);
        } catch (error) {
            console.error('Sync failed for action:', action, error);
        }
    }
    
    // Remove successfully processed actions
    const remaining = pending.filter(p => !processed.includes(p));
    localStorage.setItem('strivetrack_pending_sync', JSON.stringify(remaining));
    
    if (processed.length > 0) {
        console.log(`✅ Synced ${processed.length} pending actions`);
        // Refresh data after sync
        loadHabits();
        updatePointsDisplay();
    }
}

// Habit Management Functions
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

function createLocalHabit(habitData) {
    console.log('💾 ===== CREATE LOCAL HABIT DEBUG START =====');
    console.log('📊 Input habit data:', habitData);
    
    const habits = getLocalHabits();
    console.log('📊 Current habits count before creation:', habits.length);
    console.log('📊 Current habits before creation:', habits);
    
    const newHabit = {
        id: Date.now().toString(),
        name: habitData.name,
        description: habitData.description,
        category: habitData.category || 'general',
        weekly_target: habitData.weekly_target || 7,
        created_at: new Date().toISOString(),
        current_streak: 0,
        total_completions: 0,
        completed_days: []
    };
    
    console.log('📊 Created new habit object:', newHabit);
    
    habits.push(newHabit);
    console.log('📊 Habits count after adding:', habits.length);
    console.log('📊 All habits after adding:', habits);
    
    saveLocalHabits(habits);
    console.log('📊 Habits saved to localStorage');
    
    // Verify save
    const savedHabits = getLocalHabits();
    console.log('📊 Verification - habits count after save:', savedHabits.length);
    console.log('📊 Verification - all habits after save:', savedHabits);
    
    console.log('💾 ===== CREATE LOCAL HABIT DEBUG END =====');
    return newHabit;
}

function deleteLocalHabit(habitId) {
    const habits = getLocalHabits();
    const updatedHabits = habits.filter(h => h.id !== habitId);
    saveLocalHabits(updatedHabits);
    
    // Also remove completions for this habit
    const completions = getLocalCompletions();
    delete completions[habitId];
    saveLocalCompletions(completions);
}

function toggleLocalHabitCompletion(habitId, date, dayOfWeek) {
    const habits = getLocalHabits();
    const completions = getLocalCompletions();
    
    if (!completions[habitId]) {
        completions[habitId] = {};
    }
    
    const wasCompleted = completions[habitId][date] || false;
    const isNowCompleted = !wasCompleted;
    
    if (isNowCompleted) {
        completions[habitId][date] = true;
    } else {
        delete completions[habitId][date];
    }
    
    // Update habit stats
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
        // Recalculate total completions
        habit.total_completions = Object.keys(completions[habitId] || {}).length;
        
        // Calculate current streak
        habit.current_streak = calculateStreak(completions[habitId] || {});
        
        // Update points
        const pointsAwarded = isNowCompleted ? 10 : -10;
        if (!currentUser.points) currentUser.points = 0;
        currentUser.points = Math.max(0, currentUser.points + pointsAwarded);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    saveLocalHabits(habits);
    saveLocalCompletions(completions);
    
    return {
        completed: isNowCompleted,
        points: isNowCompleted ? 10 : -10,
        habit: habit
    };
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

function getLocalHabitsWithCompletions() {
    const habits = getLocalHabits();
    const completions = getLocalCompletions();
    
    return habits.map(habit => {
        const habitCompletions = completions[habit.id] || {};
        
        // Calculate this week's completions
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        
        const weeklyCompletedDays = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            if (habitCompletions[dateStr]) {
                weeklyCompletedDays[dateStr] = true;
            }
        }
        
        return {
            ...habit,
            completed_days: weeklyCompletedDays,
            completedDays: weeklyCompletedDays
        };
    });
}

// API Helper Functions
async function createHabitAPI(habitData) {
    const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-session-id': sessionId
        },
        body: JSON.stringify(habitData)
    });
    
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
}

async function toggleHabitAPI(data) {
    const response = await fetch('/api/habits/weekly', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-session-id': sessionId 
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
}

async function deleteHabitAPI(habitId) {
    const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
        headers: { 'x-session-id': sessionId }
    });
    
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
}

function updateLocalCompletionsFromAPI(apiHabits) {
    const completions = {};
    
    apiHabits.forEach(habit => {
        if (habit.completed_days || habit.completedDays) {
            completions[habit.id] = habit.completed_days || habit.completedDays;
        }
    });
    
    saveLocalCompletions(completions);
}

function updateLocalHabitId(oldId, newId) {
    const habits = getLocalHabits();
    const habitIndex = habits.findIndex(h => h.id === oldId);
    
    if (habitIndex !== -1) {
        habits[habitIndex].id = newId;
        saveLocalHabits(habits);
        
        // Also update completions
        const completions = getLocalCompletions();
        if (completions[oldId]) {
            completions[newId] = completions[oldId];
            delete completions[oldId];
            saveLocalCompletions(completions);
        }
    }
}

// Achievement System
function checkLocalAchievements(type, data = {}) {
    const achievements = JSON.parse(localStorage.getItem('strivetrack_achievements') || '[]');
    const habits = getLocalHabits();
    const completions = getLocalCompletions();
    
    const newAchievements = [];
    
    // First habit achievement
    if (type === 'habit_creation' && habits.length === 1) {
        const achievement = {
            id: Date.now().toString(),
            title: '🎯 First Step',
            description: 'Created your first habit!',
            points: 50,
            earned_at: new Date().toISOString()
        };
        achievements.push(achievement);
        newAchievements.push(achievement);
        currentUser.points = (currentUser.points || 0) + achievement.points;
    }
    
    // Streak achievements
    if (type === 'habit_completion') {
        const totalCompletions = Object.values(completions).reduce((acc, habit) => 
            acc + Object.keys(habit).length, 0);
        
        if (totalCompletions === 7 && !achievements.find(a => a.title.includes('Week Warrior'))) {
            const achievement = {
                id: Date.now().toString(),
                title: '🔥 Week Warrior',
                description: 'Completed 7 habit days!',
                points: 100,
                earned_at: new Date().toISOString()
            };
            achievements.push(achievement);
            newAchievements.push(achievement);
            currentUser.points = (currentUser.points || 0) + achievement.points;
        }
    }
    
    localStorage.setItem('strivetrack_achievements', JSON.stringify(achievements));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Show achievement notifications
    newAchievements.forEach(achievement => {
        setTimeout(() => {
            showNotification(`🏆 Achievement Unlocked: ${achievement.title}! +${achievement.points} pts`, 'success');
        }, 500);
    });
    
    return newAchievements;
}

// Compare mode functionality
let compareMode = false;
let selectedMedia = [];
const MAX_COMPARE_ITEMS = 2;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('StriveTrack app initializing...');
    console.log('Initial sessionId from localStorage:', sessionId);
    
    // CHECK FOR LOCAL TEST MODE
    const urlParams = new URLSearchParams(window.location.search);
    const localTestMode = localStorage.getItem('localTestMode') === 'true' || urlParams.has('localTest');
    
    if (localTestMode) {
        console.log('🧪 LOCAL TEST MODE ACTIVATED');
        const localTestUser = JSON.parse(localStorage.getItem('localTestUser') || '{}');
        if (localTestUser.email) {
            currentUser = localTestUser;
            sessionId = 'local-test-session';
            showDashboard();
            setupEventListeners();
            return;
        }
    }
    
    // CRITICAL FIX: Always show login screen first, then validate session
    showLoginScreen();
    
    if (sessionId) {
        console.log('Found session, validating...');
        
        // Check if this is an offline session
        if (sessionId.startsWith('offline_')) {
            console.log('📱 Offline session detected');
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                currentUser = JSON.parse(storedUser);
                console.log('✅ Offline user loaded:', currentUser.email);
                showDashboard();
                setupEventListeners();
                return;
            }
        } else {
            // Online session - validate with server
            validateSession();
        }
    } else {
        console.log('No session found, checking for stored user...');
        
        // Check if we have a stored user from previous offline sessions
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                currentUser = JSON.parse(storedUser);
                console.log('🔄 Found stored user, creating new offline session:', currentUser.email);
                sessionId = `offline_${Date.now()}`;
                localStorage.setItem('sessionId', sessionId);
                showDashboard();
                setupEventListeners();
                return;
            } catch (e) {
                console.log('❌ Invalid stored user data, clearing...');
                localStorage.removeItem('currentUser');
            }
        }
        
        console.log('No valid user data found, showing login screen');
    }
    
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Register button
    document.getElementById('show-register').addEventListener('click', showRegisterForm);
    
    // Signup form
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    
    // Show login from signup screen
    document.getElementById('show-login').addEventListener('click', () => {
        document.getElementById('signup-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
    });
    
    // Profile form event listeners
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
    
    // Logout button (only exists when logged in)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Navigation tabs (only exist when logged in)
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const section = tab.dataset.section;
            showSection(section);
        });
    });
    
    // Create habit card and modal (only exists when logged in)
    const createHabitCard = document.getElementById('create-habit-card');
    if (createHabitCard) {
        createHabitCard.addEventListener('click', () => {
            showModal('create-habit-modal');
            updateEmojiPreview(); // Initialize emoji preview
        });
    }
    
    // Add habit button in habits section (only exists when logged in)
    const addHabitBtn = document.getElementById('add-habit-btn');
    if (addHabitBtn) {
        addHabitBtn.addEventListener('click', () => {
            showModal('create-habit-modal');
            updateEmojiPreview(); // Initialize emoji preview
        });
    }
    
    // Create habit form (only exists when logged in) - DISABLED: Using simple habit system
    // const createHabitForm = document.getElementById('create-habit-form');
    // if (createHabitForm) {
    //     createHabitForm.addEventListener('submit', createHabit);
    // }
    
    // Emoji preview auto-update (only exists when logged in)
    const habitName = document.getElementById('habit-name');
    const habitCategory = document.getElementById('habit-category');
    if (habitName) {
        habitName.addEventListener('input', updateEmojiPreview);
    }
    if (habitCategory) {
        habitCategory.addEventListener('change', updateEmojiPreview);
    }
    
    // Nutrition form (only exists when logged in)
    const nutritionForm = document.getElementById('nutrition-form');
    if (nutritionForm) {
        nutritionForm.addEventListener('submit', submitNutrition);
    }
    
    // Upload progress card (only exists when logged in)
    const uploadProgressCard = document.getElementById('upload-progress-card');
    if (uploadProgressCard) {
        uploadProgressCard.addEventListener('click', () => {
            showMediaUploadModal();
        });
    }
    
    // Media upload (only exists when logged in)
    const uploadMediaBtn = document.getElementById('upload-media-btn');
    if (uploadMediaBtn) {
        uploadMediaBtn.addEventListener('click', () => {
            showMediaUploadModal();
        });
    }
    
    // Connect media upload form to submit handler (only exists when logged in)
    const mediaUploadForm = document.getElementById('media-upload-form');
    if (mediaUploadForm) {
        mediaUploadForm.addEventListener('submit', submitMediaUpload);
    }
    
    // Admin tabs (only exist for admin users)
    const adminUsersTab = document.getElementById('admin-users-tab');
    const adminMediaTab = document.getElementById('admin-media-tab');
    if (adminUsersTab) {
        adminUsersTab.addEventListener('click', () => {
            showAdminSection('users');
        });
    }
    if (adminMediaTab) {
        adminMediaTab.addEventListener('click', () => {
            showAdminSection('media');
        });
    }
    
    // Install app (only exists when logged in)
    const installApp = document.getElementById('install-app');
    if (installApp) {
        installApp.addEventListener('click', installPWA);
    }
    
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

// Setup event listeners for elements that are created after login
function setupDashboardEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn && !logoutBtn.hasEventListener) {
        logoutBtn.addEventListener('click', logout);
        logoutBtn.hasEventListener = true;
    }
    
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        if (!tab.hasEventListener) {
            tab.addEventListener('click', () => {
                const section = tab.dataset.section;
                showSection(section);
            });
            tab.hasEventListener = true;
        }
    });
    
    // Create habit card and modal
    const createHabitCard = document.getElementById('create-habit-card');
    if (createHabitCard && !createHabitCard.hasEventListener) {
        createHabitCard.addEventListener('click', () => {
            showModal('create-habit-modal');
            updateEmojiPreview();
        });
        createHabitCard.hasEventListener = true;
    }
    
    // Add habit button in habits section
    const addHabitBtn = document.getElementById('add-habit-btn');
    if (addHabitBtn && !addHabitBtn.hasEventListener) {
        addHabitBtn.addEventListener('click', () => {
            showModal('create-habit-modal');
            updateEmojiPreview();
        });
        addHabitBtn.hasEventListener = true;
    }
    
    // Create habit form - DISABLED: Using simple habit system
    // const createHabitForm = document.getElementById('create-habit-form');
    // if (createHabitForm && !createHabitForm.hasEventListener) {
    //     createHabitForm.addEventListener('submit', createHabit);
    //     createHabitForm.hasEventListener = true;
    // }
    
    // Emoji preview auto-update
    const habitName = document.getElementById('habit-name');
    const habitCategory = document.getElementById('habit-category');
    if (habitName && !habitName.hasEventListener) {
        habitName.addEventListener('input', updateEmojiPreview);
        habitName.hasEventListener = true;
    }
    if (habitCategory && !habitCategory.hasEventListener) {
        habitCategory.addEventListener('change', updateEmojiPreview);
        habitCategory.hasEventListener = true;
    }
    
    // Nutrition form
    const nutritionForm = document.getElementById('nutrition-form');
    if (nutritionForm && !nutritionForm.hasEventListener) {
        nutritionForm.addEventListener('submit', submitNutrition);
        nutritionForm.hasEventListener = true;
    }
    
    // Upload progress card
    const uploadProgressCard = document.getElementById('upload-progress-card');
    if (uploadProgressCard && !uploadProgressCard.hasEventListener) {
        uploadProgressCard.addEventListener('click', () => {
            showMediaUploadModal();
        });
        uploadProgressCard.hasEventListener = true;
    }
    
    // Media upload
    const uploadMediaBtn = document.getElementById('upload-media-btn');
    if (uploadMediaBtn && !uploadMediaBtn.hasEventListener) {
        uploadMediaBtn.addEventListener('click', () => {
            showMediaUploadModal();
        });
        uploadMediaBtn.hasEventListener = true;
    }
    
    // Connect media upload form to submit handler
    const mediaUploadForm = document.getElementById('media-upload-form');
    if (mediaUploadForm && !mediaUploadForm.hasEventListener) {
        mediaUploadForm.addEventListener('submit', submitMediaUpload);
        mediaUploadForm.hasEventListener = true;
    }
    
    // Admin tabs (only for admin users)
    const adminUsersTab = document.getElementById('admin-users-tab');
    const adminMediaTab = document.getElementById('admin-media-tab');
    if (adminUsersTab && !adminUsersTab.hasEventListener) {
        adminUsersTab.addEventListener('click', () => {
            showAdminSection('users');
        });
        adminUsersTab.hasEventListener = true;
    }
    if (adminMediaTab && !adminMediaTab.hasEventListener) {
        adminMediaTab.addEventListener('click', () => {
            showAdminSection('media');
        });
        adminMediaTab.hasEventListener = true;
    }
    
    // Install app
    const installApp = document.getElementById('install-app');
    if (installApp && !installApp.hasEventListener) {
        installApp.addEventListener('click', installPWA);
        installApp.hasEventListener = true;
    }
    
    // Social Hub event listeners
    const addFriendBtn = document.getElementById('add-friend-btn');
    const friendsListBtn = document.getElementById('friends-list-btn');
    const leaderboardFilter = document.getElementById('leaderboard-filter');
    
    if (addFriendBtn && !addFriendBtn.hasEventListener) {
        addFriendBtn.addEventListener('click', showFriendsModal);
        addFriendBtn.hasEventListener = true;
    }
    
    if (friendsListBtn && !friendsListBtn.hasEventListener) {
        friendsListBtn.addEventListener('click', showFriendsModal);
        friendsListBtn.hasEventListener = true;
    }
    
    if (leaderboardFilter && !leaderboardFilter.hasEventListener) {
        leaderboardFilter.addEventListener('change', (e) => {
            loadLeaderboards(e.target.value);
        });
        leaderboardFilter.hasEventListener = true;
    }
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
            
            // CRITICAL FIX: Ensure points are properly loaded from server
            if (currentUser && typeof currentUser.points !== 'number') {
                currentUser.points = 0; // Initialize if missing
            }
            console.log('Session validated - User points:', currentUser.points);
            
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
        console.log('🔐 Attempting login with API...');
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // ✅ API LOGIN SUCCESS
            sessionId = data.sessionId;
            currentUser = data.user;
            localStorage.setItem('sessionId', sessionId);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            console.log('✅ API login successful');
            showNotification('Welcome back! 🎉', 'success');
            showDashboard();
            
            // Check for achievements on login
            setTimeout(() => {
                checkLocalAchievements('login');
            }, 1000);
        } else {
            console.log('❌ API login failed, trying offline mode...');
            // API login failed, try offline mode
            tryOfflineLogin(email, password);
        }
    } catch (error) {
        console.error('Login API error:', error);
        console.log('🔄 API unavailable, using offline mode...');
        // API is unavailable, use offline mode
        tryOfflineLogin(email, password);
    } finally {
        // Always update points display after login attempt
        setTimeout(() => {
            updatePointsDisplay();
        }, 500);
    }
}

// Offline login fallback
function tryOfflineLogin(email, password) {
    console.log('📱 Using offline login mode');
    
    // Check if user exists in localStorage
    const existingUser = localStorage.getItem(`offline_user_${email}`);
    
    if (existingUser) {
        // Existing offline user
        const userData = JSON.parse(existingUser);
        if (userData.password === password) {
            // ✅ OFFLINE LOGIN SUCCESS
            currentUser = userData;
            sessionId = `offline_${Date.now()}`;
            localStorage.setItem('sessionId', sessionId);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            console.log('✅ Offline login successful');
            showNotification('Welcome back! (Offline Mode) 📱', 'success');
            showDashboard();
            
            // Update points display after offline login
            setTimeout(() => {
                updatePointsDisplay();
            }, 500);
        } else {
            showNotification('Invalid password', 'error');
        }
    } else {
        // New user - create offline account
        console.log('👤 Creating new offline user');
        const newUser = {
            id: `offline_${Date.now()}`,
            email: email,
            password: password, // In production, this would be hashed
            username: email.split('@')[0],
            role: email === 'iamhollywoodpro@protonmail.com' ? 'admin' : 'user',
            points: 0,
            profile_picture_url: null,
            created_at: new Date().toISOString()
        };
        
        // Save offline user
        localStorage.setItem(`offline_user_${email}`, JSON.stringify(newUser));
        currentUser = newUser;
        sessionId = `offline_${Date.now()}`;
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        console.log('✅ Offline account created');
        showNotification('Account created! (Offline Mode) 🎯', 'success');
        showDashboard();
        
        // Update points display after offline registration
        setTimeout(() => {
            updatePointsDisplay();
        }, 500);
    }
}

function showRegisterForm() {
    // Hide login screen and show signup screen
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('signup-screen').classList.remove('hidden');
}

async function register(formData) {
    try {
        console.log('🔐 Attempting registration with API...');
        
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // ✅ API REGISTRATION SUCCESS
            sessionId = data.sessionId;
            localStorage.setItem('sessionId', sessionId);
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            console.log('✅ API registration successful');
            showNotification('Registration successful! Welcome to StriveTrack! 🎉', 'success');
            showDashboard();
            
            setTimeout(() => {
                checkLocalAchievements('login');
            }, 1000);
        } else {
            console.log('❌ API registration failed, trying offline mode...');
            tryOfflineRegistration(formData);
        }
    } catch (error) {
        console.error('Registration API error:', error);
        console.log('🔄 API unavailable, using offline mode...');
        tryOfflineRegistration(formData);
    }
}

// Offline registration fallback  
function tryOfflineRegistration(formData) {
    console.log('📱 Using offline registration mode');
    
    // Check if user already exists
    const existingUser = localStorage.getItem(`offline_user_${formData.email}`);
    
    if (existingUser) {
        showNotification('Account already exists. Please login instead.', 'error');
        return;
    }
    
    // Create new offline user
    const newUser = {
        id: `offline_${Date.now()}`,
        email: formData.email,
        username: formData.username,
        password: formData.password, // In production, this would be hashed
        role: formData.email === 'iamhollywoodpro@protonmail.com' ? 'admin' : 'user',
        points: 0,
        profile_picture_url: null,
        created_at: new Date().toISOString()
    };
    
    // Save offline user
    localStorage.setItem(`offline_user_${formData.email}`, JSON.stringify(newUser));
    
    console.log('✅ Offline registration successful');
    showNotification('Registration successful! (Offline Mode) 🎯', 'success');
    
    // Auto-login the new user
    currentUser = newUser;
    sessionId = `offline_${Date.now()}`;
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showDashboard();
}

function handleSignup(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const username = formData.get('username').trim();
    const email = formData.get('email').trim();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const agreeTerms = document.getElementById('agree-terms').checked;
    
    // Validation
    if (!username || username.length < 3) {
        showNotification('Username must be at least 3 characters long', 'error');
        return;
    }
    
    if (!email || !password) {
        showNotification('All fields are required', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showNotification('You must agree to the Terms of Service and Privacy Policy', 'error');
        return;
    }
    
    // Submit registration
    register({
        username,
        email,
        password,
        confirmPassword
    });
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
    
    // Initialize and load user progress from localStorage
    loadUserProgress();
    
    // Update header with user data including profile picture
    const username = currentUser.username || currentUser.email.split('@')[0];
    updateHeaderProfilePicture(currentUser.profile_picture_url, username);
    
    // Ensure currentUser is loaded from localStorage if needed
    if (!currentUser) {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            console.log('🔄 Loaded currentUser from localStorage:', currentUser.email);
        }
    }
    
    // Update points display and sync from server if online
    await syncUserPointsFromServer();
    updatePointsDisplay();
    
    // Show admin tab ONLY for iamhollywoodpro@protonmail.com
    if (currentUser.role === 'admin' && currentUser.email === 'iamhollywoodpro@protonmail.com') {
        document.getElementById('admin-tab').classList.remove('hidden');
    } else {
        // Ensure admin tab is always hidden for non-admin users
        const adminTab = document.getElementById('admin-tab');
        if (adminTab) {
            adminTab.classList.add('hidden');
            adminTab.style.display = 'none'; // Extra security
        }
    }
    
    // Initialize hybrid storage system 
    initializeLocalStorage();
    
    // Set up online/offline sync
    setupOnlineOfflineSync();
    
    // Load initial data
    console.log('Loading dashboard data...');
    loadDashboardData();
    
    // Re-setup event listeners now that dashboard elements are available
    setupDashboardEventListeners();
}

async function loadDashboardWeeklyProgress() {
    try {
        console.log('📊 Loading dashboard weekly progress with hybrid storage...');
        
        // Initialize localStorage for fallback
        initializeLocalStorage();
        
        if (isOnline()) {
            try {
                console.log('🌐 Fetching dashboard data from API...');
                
                const response = await fetch('/api/habits/weekly', {
                    headers: { 'x-session-id': sessionId }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const habits = data.habits || [];
                    console.log('✅ Dashboard API success');
                    
                    // Cache to localStorage
                    saveLocalHabits(habits);
                    updateLocalCompletionsFromAPI(habits);
                    
                    displayDashboardWeeklyProgress(habits);
                    return;
                }
            } catch (apiError) {
                console.log('❌ Dashboard API failed, using localStorage');
            }
        }
        
        // Fallback to localStorage
        const habits = getLocalHabitsWithCompletions();
        displayDashboardWeeklyProgress(habits);
        
    } catch (error) {
        console.error('Load dashboard weekly progress error:', error);
        // Final fallback
        const habits = getLocalHabitsWithCompletions();
        displayDashboardWeeklyProgress(habits);
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
        // loadHabits(), // DISABLED: Using simple habit system
        loadMedia(),
        loadAchievements(),
        loadDailyChallenges(),
        loadAdminData(),
        syncUserPointsFromServer() // CRITICAL FIX: Sync points from server
    ]);
    
    // Initialize working habits
    setupWorkingHabits();
    
    updateDashboardStats();
}

// CRITICAL FIX: Function to sync user points from server
async function syncUserPointsFromServer() {
    try {
        const response = await fetch('/api/user/profile', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.user && typeof data.user.points === 'number') {
                const serverPoints = data.user.points;
                const currentPoints = currentUser.points || 0;
                
                // Update currentUser points from server
                currentUser.points = serverPoints;
                
                // Update header display
                const userPointsDisplay = document.getElementById('user-points');
                if (userPointsDisplay) {
                    userPointsDisplay.textContent = `⭐ ${serverPoints} pts`;
                }
                
                console.log(`Points synced: ${currentPoints} -> ${serverPoints}`);
            }
        }
    } catch (error) {
        console.warn('Failed to sync points from server:', error);
        // Don't show error to user - this is not critical
    }
}

// Habits functions
async function loadHabits() {
    console.log('🔄 ===== LOAD HABITS DEBUG START =====');
    console.log('📚 Loading habits with hybrid storage...');
    console.log('📊 Session ID:', sessionId);
    console.log('📊 Is Online:', isOnline());
    
    try {
        // Initialize localStorage for fallback
        initializeLocalStorage();
        console.log('📊 LocalStorage initialized');
        
        // Check current localStorage state
        const currentLocalHabits = getLocalHabits();
        console.log('📊 Current localStorage habits count:', currentLocalHabits.length);
        console.log('📊 Current localStorage habits:', currentLocalHabits);
        
        // Process any pending sync items first
        await processPendingSync();
        console.log('📊 Pending sync processed');
        
        let useLocalStorage = false;
        
        if (isOnline()) {
            console.log('🌐 Online - fetching from Cloudflare API...');
            
            // Sync user points first to ensure accurate data
            try {
                await syncUserPointsFromServer();
                console.log('📊 User points synced');
            } catch (syncError) {
                console.log('⚠️ Failed to sync user points:', syncError);
            }
            
            // Try API first
            console.log('📊 Making API request to /api/habits/weekly...');
            const response = await fetch('/api/habits/weekly', {
                headers: { 
                    'x-session-id': sessionId,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📊 API Response status:', response.status);
            console.log('📊 API Response ok:', response.ok);
            console.log('📊 API Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (response.ok) {
                const responseText = await response.text();
                console.log('📊 Raw API response:', responseText.substring(0, 500) + '...');
                
                let data;
                try {
                    data = JSON.parse(responseText);
                    console.log('📊 Parsed API response:', data);
                } catch (parseError) {
                    console.error('❌ Failed to parse API response as JSON:', parseError);
                    console.log('📊 JSON parse failed - falling back to localStorage');
                    useLocalStorage = true;
                }
                
                if (!useLocalStorage) {
                    const habits = data.habits || [];
                    console.log('✅ API Success - loaded', habits.length, 'habits');
                    console.log('📊 API habits data:', habits);
                    
                    // Cache to localStorage for offline access
                    saveLocalHabits(habits);
                    updateLocalCompletionsFromAPI(habits);
                    console.log('📊 Habits cached to localStorage');
                    
                    displayHabits(habits);
                    console.log('🔄 ===== LOAD HABITS DEBUG END (API SUCCESS) =====');
                    return;
                }
            } else {
                const errorText = await response.text();
                console.log('❌ API failed, status:', response.status, response.statusText);
                console.log('❌ API error response:', errorText.substring(0, 500));
                
                if (response.status === 401) {
                    console.log('🔐 Session expired, redirecting to login');
                    showLoginScreen();
                    return;
                }
                
                console.log('📊 API failed with status', response.status, '- forcing localStorage fallback...');
                useLocalStorage = true;
            }
        } else {
            console.log('📊 Offline or no session - using localStorage directly');
            useLocalStorage = true;
        }
        
        // Fallback to localStorage (offline or API failed)
        if (useLocalStorage) {
            console.log('💾 Using localStorage fallback...');
        } else {
            console.log('💾 Direct localStorage access...');
        }
        
        const habits = getLocalHabitsWithCompletions();
        console.log('📱 Loaded', habits.length, 'habits from localStorage');
        console.log('📊 localStorage habits data:', habits);
        
        displayHabits(habits);
        
    } catch (error) {
        console.error('❌ Load habits error:', error);
        console.error('📊 Error details:', error.stack);
        
        // Show error notification
        showNotification('Failed to load habits. Using offline data.', 'warning');
        
        // Final fallback to localStorage
        const habits = getLocalHabitsWithCompletions();
        console.log('🔄 Final fallback: loaded', habits.length, 'habits from localStorage after error');
        displayHabits(habits);
    }
}

function displayHabits(habits) {
    console.log('🎯 ===== DISPLAY HABITS DEBUG START =====');
    console.log('📊 Input habits array:', habits);
    console.log('📊 Habits array length:', habits ? habits.length : 'NULL/undefined');
    console.log('📊 Habits array type:', typeof habits);
    
    const container = document.getElementById('habits-container');
    const emptyState = document.getElementById('habits-empty-state');
    
    console.log('📊 Container element:', container ? '✅ Found' : '❌ Not found');
    console.log('📊 Empty state element:', emptyState ? '✅ Found' : '❌ Not found');
    
    if (!container) {
        console.error('❌ CRITICAL: habits-container element not found!');
        return;
    }
    
    container.innerHTML = '';
    console.log('📊 Container cleared, current children count:', container.children.length);
    
    if (!habits || habits.length === 0) {
        console.log('📊 No habits to display - showing empty state');
        // Show empty state
        if (emptyState) {
            emptyState.classList.remove('hidden');
            console.log('📊 Empty state shown');
        }
        container.innerHTML = '';
        console.log('🎯 ===== DISPLAY HABITS DEBUG END (EMPTY) =====');
        return;
    } else {
        console.log('📊 Habits found - hiding empty state');
        // Hide empty state
        if (emptyState) {
            emptyState.classList.add('hidden');
            console.log('📊 Empty state hidden');
        }
    }
    
    console.log('⚙️ Processing', habits.length, 'habits for display');
    
    // Display habits using the enhanced createHabitElement function
    habits.forEach((habit, index) => {
        try {
            console.log(`🔩 Creating element for habit ${index}:`, habit?.name, 'ID:', habit?.id);
            console.log(`🔩 Full habit data ${index}:`, habit);
            
            const habitElement = createHabitElement(habit, false);
            console.log(`🔩 Created element result:`, habitElement ? '✅ Success' : '❌ Failed');
            
            if (habitElement) {
                container.appendChild(habitElement);
                console.log(`✅ Added habit ${index} to container`);
                console.log(`📊 Container children count after adding:`, container.children.length);
            } else {
                console.warn(`⚠️ createHabitElement returned null for habit ${index}:`, habit);
            }
        } catch (error) {
            console.error(`❌ Error creating habit element ${index}:`, error, habit);
            console.error('❌ Error stack:', error.stack);
        }
    });
    
    console.log('✅ Successfully processed all habits');
    console.log('📋 Final container children count:', container.children.length);
    console.log('📋 Container innerHTML length:', container.innerHTML.length);
    console.log('📋 Container innerHTML preview:', container.innerHTML.substring(0, 200) + '...');
    
    // CRITICAL: Add event delegation for day cell clicks
    try {
        setupHabitDayClickHandlers(container);
        console.log('✅ Event handlers set up successfully');
    } catch (error) {
        console.error('❌ Failed to set up event handlers:', error);
    }
    
    console.log('🎯 ===== DISPLAY HABITS DEBUG END =====');
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
    
    // Add event delegation for day cell clicks
    setupHabitDayClickHandlers(container);
    
    // Event listeners are now properly set up
}

function setupHabitDayClickHandlers(container) {
    console.log('🎯 Setting up habit click handlers on:', container);
    
    // Remove any existing listeners to prevent duplicates
    container.removeEventListener('click', handleHabitDayClick);
    
    // Add event delegation for both day cell clicks and delete buttons
    container.addEventListener('click', handleHabitDayClick);
    
    console.log('✅ Click handler attached - ready to detect day cells and delete buttons');
}

function handleHabitDayClick(event) {
    console.log('🖱️ CLICK DETECTED! Target:', event.target);
    console.log('🖱️ Target classes:', event.target.className);
    console.log('🖱️ Target tag:', event.target.tagName);
    console.log('🖱️ Target parent:', event.target.parentElement);
    
    // Handle button clicks in habits container
    if (event.target.tagName === 'BUTTON' || event.target.closest('button')) {
        console.log('Button click detected:', event.target.tagName, event.target.className);
    }
    
    // Check various ways the delete button might be clicked
    let deleteBtn = null;
    
    // Method 1: Direct delete button click
    if (event.target.classList.contains('delete-habit-btn')) {
        deleteBtn = event.target;
        console.log('🗑️ Method 1: Direct delete button click');
    }
    
    // Method 2: Clicked child element (like the trash icon)
    if (!deleteBtn) {
        deleteBtn = event.target.closest('.delete-habit-btn');
        if (deleteBtn) {
            console.log('🗑️ Method 2: Child element of delete button clicked');
        }
    }
    
    // Method 3: Check if parent has delete button class
    if (!deleteBtn && event.target.parentElement && event.target.parentElement.classList.contains('delete-habit-btn')) {
        deleteBtn = event.target.parentElement;
        console.log('🗑️ Method 3: Parent is delete button');
    }
    
    if (deleteBtn) {
        event.preventDefault();
        event.stopPropagation();
        const habitId = deleteBtn.getAttribute('data-habit-id');
        console.log('🗑️ DELETE BUTTON FOUND! Habit ID:', habitId);
        console.log('🗑️ Button element:', deleteBtn);
        console.log('🗑️ Button classes:', deleteBtn.className);
        console.log('Delete button clicked for habit ID:', habitId);
        console.log('🗑️ About to call deleteHabit function...');
        deleteHabit(habitId);
        console.log('🗑️ deleteHabit function called');
        return;
    }
    
    console.log('🚫 No delete button found, checking for day cell...');
    
    // Find the clicked day cell - handle both direct clicks and child element clicks
    let dayCell = event.target.closest('.day-cell');
    
    // If not found, check if the target itself is a day-cell
    if (!dayCell && event.target.classList.contains('day-cell')) {
        dayCell = event.target;
    }
    
    console.log('📅 Day cell found:', dayCell);
    
    if (!dayCell) {
        console.log('❌ Not a day cell click, ignoring');
        return; // Not a day cell click
    }
    
    // Get the data attributes
    const habitId = dayCell.getAttribute('data-habit-id');
    const date = dayCell.getAttribute('data-date');
    const dayIndex = parseInt(dayCell.getAttribute('data-day-index'));
    
    console.log('📊 Day cell data:', { habitId, date, dayIndex });
    
    // Validate data
    if (!habitId || !date || isNaN(dayIndex)) {
        console.error('❌ Invalid day cell data:', { habitId, date, dayIndex });
        return;
    }
    
    console.log('✅ Valid day cell click - calling toggleWeeklyHabit');
    
    // Add visual feedback immediately
    dayCell.style.opacity = '0.7';
    dayCell.style.transform = 'scale(0.95)';
    
    // Call the toggle function
    toggleWeeklyHabit(habitId, date, dayIndex).then(() => {
        // Reset visual feedback
        dayCell.style.opacity = '';
        dayCell.style.transform = '';
    }).catch(() => {
        // Reset visual feedback on error
        dayCell.style.opacity = '';
        dayCell.style.transform = '';
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

function createHabitElement(habit, showWeekView = true) {
    // Always use weekly view for habits in the main habits section
    return createWeeklyHabitElement(habit);
}

// Delete habit function - removed duplicate, keeping the modal version below

function createWeeklyHabitElement(habit) {
    console.log('🏗️ Creating habit element for:', habit.name, 'ID:', habit.id);
    
    const div = document.createElement('div');
    div.className = 'habit-card';
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Handle different data formats for completed days
    const completedDays = habit.completed_days || habit.completedDays || [];
    // Use weekly_target first, then targetCount from weekly API, then default to 7
    const targetFrequency = habit.weekly_target || habit.targetCount || 7;
    
    // Calculate this week's dates and completion status
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    let weeklyCompletedCount = 0;
    
    const weekCalendar = days.map((dayName, dayIndex) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + dayIndex);
        const dateStr = dayDate.toISOString().split('T')[0];
        
        // Check if this day is completed (handle different formats)
        let isCompleted = false;
        if (Array.isArray(completedDays)) {
            // If completedDays is array of day indices
            isCompleted = completedDays.includes(dayIndex);
        } else if (typeof completedDays === 'object') {
            // If completedDays is object with dates
            isCompleted = completedDays[dateStr] || false;
        }
        
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
    
    console.log('🏗️ Habit element created. Delete button check:');
    console.log('   - Habit ID:', habit.id);
    console.log('   - Delete button exists:', div.querySelector('.delete-habit-btn') !== null);
    console.log('   - Delete button data-habit-id:', div.querySelector('.delete-habit-btn')?.getAttribute('data-habit-id'));
    
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
        console.log('🔄 Toggling habit completion with hybrid storage:', { habitId, date, dayOfWeek });
        
        // Always update localStorage immediately for instant UI feedback
        const localResult = toggleLocalHabitCompletion(habitId, date, dayOfWeek);
        
        // Update UI immediately
        const userPointsDisplay = document.getElementById('user-points');
        if (userPointsDisplay) {
            userPointsDisplay.textContent = `⭐ ${currentUser.points} pts`;
        }
        updatePointsDisplay();
        
        const pointsText = localResult.points > 0 ? `+${localResult.points}` : localResult.points;
        
        if (isOnline()) {
            try {
                console.log('🌐 Syncing to API...');
                
                // Sync to API
                const apiResult = await toggleHabitAPI({ habitId, date, dayOfWeek });
                
                // Update user points from API response (authoritative)
                if (apiResult.points !== undefined && currentUser) {
                    // Adjust for any difference between local and API points
                    const pointsDiff = apiResult.points - localResult.points;
                    if (pointsDiff !== 0) {
                        currentUser.points += pointsDiff;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        updatePointsDisplay();
                    }
                }
                
                if (localResult.completed) {
                    showNotification(`Day completed! ${pointsText} pts`, 'success');
                } else {
                    showNotification(`Day unmarked! ${pointsText} pts`, 'error');
                }
                
                console.log('✅ API sync successful');
                
            } catch (apiError) {
                console.log('❌ API sync failed, queuing for later:', apiError);
                
                // Queue for sync when back online
                queueForSync({
                    type: 'toggle_habit',
                    data: { habitId, date, dayOfWeek }
                });
                
                // Still show success notification for offline mode
                if (localResult.completed) {
                    showNotification(`Day completed! ${pointsText} pts (Offline - will sync)`, 'success');
                } else {
                    showNotification(`Day unmarked! ${pointsText} pts (Offline - will sync)`, 'warning');
                }
            }
        } else {
            console.log('📱 Offline - queuing for sync');
            
            // Queue for sync when back online
            queueForSync({
                type: 'toggle_habit',
                data: { habitId, date, dayOfWeek }
            });
            
            // Show appropriate offline notification
            if (localResult.completed) {
                showNotification(`Day completed! ${pointsText} pts (Offline Mode)`, 'success');
            } else {
                showNotification(`Day unmarked! ${pointsText} pts (Offline Mode)`, 'warning');
            }
        }
        
        // Refresh views
        loadHabits(); 
        loadDashboardWeeklyProgress(); 
        updateDashboardStats();
        
        // Check for achievements
        if (localResult.completed) {
            checkLocalAchievements('habit_completion', { habitId, habit: localResult.habit });
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
                checkLocalAchievements('habit_completion');
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
    
    const habitData = {
        name: displayName, 
        description: description || `${category} habit - ${difficulty} difficulty`,
        category: category,
        weekly_target: weeklyTarget
    };
    
    try {
        console.log('🎯 ===== CREATE HABIT DEBUG START =====');
        console.log('🎯 Creating habit with hybrid storage:', displayName);
        console.log('📊 Habit data to create:', habitData);
        
        // Create habit locally for immediate UI feedback
        console.log('📊 Creating local habit...');
        const localHabit = createLocalHabit(habitData);
        console.log('📊 Local habit created:', localHabit);
        
        // Update UI immediately
        console.log('📊 Updating UI...');
        showNotification('Habit created successfully! 🎯', 'success');
        closeModal('create-habit-modal');
        document.getElementById('create-habit-form').reset();
        updateEmojiPreview();
        
        console.log('📊 Calling loadHabits() to refresh display...');
        loadHabits();
        loadDashboardWeeklyProgress(); 
        updateDashboardStats();
        console.log('📊 UI update completed');
        
        if (isOnline()) {
            try {
                console.log('🌐 Syncing habit to API...');
                
                // Sync to API
                const apiResult = await createHabitAPI(habitData);
                console.log('✅ Habit synced to API successfully');
                
                // Update local habit with API ID if different
                if (apiResult.habitId && apiResult.habitId !== localHabit.id) {
                    updateLocalHabitId(localHabit.id, apiResult.habitId);
                }
                
                // Check for API-side achievements
                if (apiResult.newAchievements && apiResult.newAchievements.length > 0) {
                    apiResult.newAchievements.forEach(achievement => {
                        setTimeout(() => {
                            showNotification(`🏆 Achievement: ${achievement.name}! +${achievement.points} pts`, 'success');
                        }, 1000);
                    });
                }
                
            } catch (apiError) {
                console.log('❌ API sync failed, queuing for later:', apiError);
                
                // Queue for sync when back online
                queueForSync({
                    type: 'create_habit',
                    data: habitData,
                    localId: localHabit.id
                });
            }
        } else {
            console.log('📱 Offline - queuing habit for sync');
            
            // Queue for sync when back online
            queueForSync({
                type: 'create_habit',
                data: habitData,
                localId: localHabit.id
            });
        }
        
        // Check for local achievements
        checkLocalAchievements('habit_creation', { habit: localHabit });
        
    } catch (error) {
        console.error('Create habit error:', error);
        showNotification('Failed to create habit', 'error');
    }
}

async function deleteHabit(habitId) {
    showConfirmationModal('Are you sure you want to delete this habit? This action cannot be undone.', async function() {
        try {
            console.log('🗑️ Deleting habit with hybrid storage:', habitId);
            
            // Delete locally for immediate UI feedback
            deleteLocalHabit(habitId);
            
            // Update UI immediately
            showNotification('Habit deleted successfully', 'success');
            loadHabits();
            loadDashboardWeeklyProgress();
            updateDashboardStats();
            
            if (isOnline()) {
                try {
                    console.log('🌐 Syncing deletion to API...');
                    
                    // Sync to API
                    await deleteHabitAPI(habitId);
                    console.log('✅ Habit deletion synced to API');
                    
                } catch (apiError) {
                    console.log('❌ API deletion failed, queuing for later:', apiError);
                    
                    // Queue for sync when back online
                    queueForSync({
                        type: 'delete_habit',
                        data: { habitId }
                    });
                }
            } else {
                console.log('📱 Offline - queuing deletion for sync');
                
                // Queue for sync when back online
                queueForSync({
                    type: 'delete_habit',
                    data: { habitId }
                });
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
                const totalPointsEarned = data.total_points || data.points || 10;
                const pointsText = `+${totalPointsEarned} pts`;
                showNotification(`${mediaTypeText} (${mediaType.toUpperCase()}) uploaded successfully! (${pointsText})`, 'success');
                
                // CRITICAL FIX: Update currentUser points immediately
                if (currentUser && totalPointsEarned > 0) {
                    currentUser.points = (currentUser.points || 0) + totalPointsEarned;
                    // Update header points display immediately
                    const userPointsDisplay = document.getElementById('user-points');
                    if (userPointsDisplay) {
                        userPointsDisplay.textContent = `⭐ ${currentUser.points} pts`;
                    }
                    console.log('Points updated after media upload:', currentUser.points);
                }
                
                // Show pair bonus notification if applicable
                if (data.pair_bonus && data.pair_bonus > 0) {
                    setTimeout(() => {
                        showNotification(`🎉 Before/After pair completed! Bonus +${data.pair_bonus} pts!`, 'success');
                        // Update points for pair bonus too
                        if (currentUser) {
                            currentUser.points = (currentUser.points || 0) + data.pair_bonus;
                            const userPointsDisplay = document.getElementById('user-points');
                            if (userPointsDisplay) {
                                userPointsDisplay.textContent = `⭐ ${currentUser.points} pts`;
                            }
                        }
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

// Removed setupProgressEventListeners - compare functionality is always available
// Gallery filter is set up automatically via HTML onchange attribute

async function loadMedia() {
    try {
        const response = await fetch('/api/media/enhanced?stats=true&pairs=true', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Enhanced API response:', data);
            displayEnhancedMedia(data);
            updateMediaStats(data);
        } else {
            console.log('⚠️ Enhanced API failed, using fallback. Status:', response.status);
            // Fallback to regular media API
            const fallbackResponse = await fetch('/api/media', {
                headers: { 'x-session-id': sessionId }
            });
            if (fallbackResponse.ok) {
                const media = await fallbackResponse.json();
                console.log('📷 Fallback API response:', media);
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
        div.onclick = (e) => {
            // Always show media modal on click, compare happens via + button
            showEnhancedMediaModal(item);
        };
        
        const mediaType = item.media_type || 'progress';
        const isVideo = item.file_type && item.file_type.startsWith('video/');
        const isPaired = item.paired_with_id;
        
        // Clean media type determination
        
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
                <div class="compare-actions" style="position: absolute; bottom: 8px; left: 8px; z-index: 200;" data-media-id="${item.id}">
                    <button onclick="event.stopPropagation(); selectMediaForComparison('${item.id}', this.closest('.media-item'))" class="btn-compare" title="Select for comparison">
                        <i class="fas fa-plus"></i>
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
    
    // FRONTEND FIX: Update stats after all media items are rendered
    setTimeout(() => {
        updateMediaStats(data);
        
        // Compare buttons are always visible now
    }, 100);
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
    // Count based on the actual media data, not DOM elements
    let totalCount = 0;
    let beforeCount = 0;
    let afterCount = 0;
    
    if (data && data.media && Array.isArray(data.media)) {
        totalCount = data.media.length;
        
        data.media.forEach(item => {
            // Use only media_type from API (which includes fallback to 'progress')
            const type = item.media_type;
            
            if (type === 'before') beforeCount++;
            else if (type === 'after') afterCount++;
        });
    }
    
    // Update stats with calculated counts
    
    // Update the display
    document.getElementById('total-uploads').textContent = totalCount;
    document.getElementById('before-count').textContent = beforeCount;
    document.getElementById('after-count').textContent = afterCount;
    document.getElementById('comparison-count').textContent = '0';
}

// Legacy display function for compatibility
function displayMedia(media) {
    console.log('📷 Raw media data for stats calculation:', media);
    
    // Calculate proper stats from the media array
    const beforeCount = media.filter(item => (item.media_type || item.image_type || item.video_type) === 'before').length;
    const afterCount = media.filter(item => (item.media_type || item.image_type || item.video_type) === 'after').length;
    const progressCount = media.filter(item => (item.media_type || item.image_type || item.video_type) === 'progress').length;
    
    console.log('📊 Stats calculation debug:', {
        total: media.length,
        beforeCount,
        afterCount, 
        progressCount,
        sampleItem: media[0] // Show first item structure
    });
    
    const stats = {
        total: media.length,
        before_count: beforeCount,
        after_count: afterCount,
        progress_count: progressCount,
        comparison_count: 0 // Will be calculated separately
    };
    
    displayEnhancedMedia({ media, stats });
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
                // Remove the placeholder icon
                const placeholderIcon = container.querySelector('.fas.fa-image, .fas.fa-video');
                if (placeholderIcon) {
                    placeholderIcon.remove();
                }
                
                // Create media element without replacing existing content
                const mediaElement = document.createElement(isVideo ? 'video' : 'img');
                if (isVideo) {
                    mediaElement.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1;';
                    mediaElement.muted = true;
                    mediaElement.innerHTML = `<source src="${mediaUrl}" type="${blob.type}">`;
                } else {
                    mediaElement.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1;';
                    mediaElement.src = mediaUrl;
                    mediaElement.alt = 'Progress media';
                }
                
                // Ensure container is positioned relative
                container.style.position = 'relative';
                
                // Insert media element as first child (behind buttons)
                container.insertBefore(mediaElement, container.firstChild);
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

// Compare functionality - always available, no mode toggle needed

function selectMediaForComparison(mediaId, element) {
    // Compare functionality is always available
    
    // Check if already selected
    const index = selectedMedia.indexOf(mediaId);
    
    if (index > -1) {
        // Deselect
        selectedMedia.splice(index, 1);
        element.classList.remove('selected');
    } else {
        // Select (max 2 items)
        if (selectedMedia.length >= MAX_COMPARE_ITEMS) {
            showNotification(`You can only select ${MAX_COMPARE_ITEMS} items for comparison`, 'warning');
            return;
        }
        
        selectedMedia.push(mediaId);
        element.classList.add('selected');
        
        // If we have 2 items, show comparison
        if (selectedMedia.length === MAX_COMPARE_ITEMS) {
            showUserSelectedComparison();
        }
    }
    
    // Show notification about selection count
    if (selectedMedia.length === 1) {
        showNotification('1 item selected. Click + on another item to compare.', 'info');
    }
}

async function showUserSelectedComparison() {
    if (selectedMedia.length !== 2) {
        showNotification('Please select exactly 2 items to compare', 'warning');
        return;
    }
    
    try {
        // Fetch both media items
        const [mediaId1, mediaId2] = selectedMedia;
        
        const [response1, response2] = await Promise.all([
            fetch(`/api/media/file/${mediaId1}`, { headers: { 'x-session-id': sessionId }}),
            fetch(`/api/media/file/${mediaId2}`, { headers: { 'x-session-id': sessionId }})
        ]);
        
        if (response1.ok && response2.ok) {
            const [blob1, blob2] = await Promise.all([
                response1.blob(),
                response2.blob()
            ]);
            
            const url1 = URL.createObjectURL(blob1);
            const url2 = URL.createObjectURL(blob2);
            
            // Find media info from current loaded media
            const allMediaItems = document.querySelectorAll('.media-item');
            let media1Info = null, media2Info = null;
            
            allMediaItems.forEach(item => {
                const preview = item.querySelector('.media-preview');
                if (preview && preview.id === `media-${mediaId1}`) {
                    const dateEl = item.querySelector('.media-date');
                    const descEl = item.querySelector('.media-description');
                    media1Info = {
                        date: dateEl ? dateEl.textContent : 'Unknown date',
                        description: descEl ? descEl.textContent : 'No description',
                        isVideo: blob1.type.startsWith('video/')
                    };
                }
                if (preview && preview.id === `media-${mediaId2}`) {
                    const dateEl = item.querySelector('.media-date');
                    const descEl = item.querySelector('.media-description');
                    media2Info = {
                        date: dateEl ? dateEl.textContent : 'Unknown date', 
                        description: descEl ? descEl.textContent : 'No description',
                        isVideo: blob2.type.startsWith('video/')
                    };
                }
            });
            
            showCustomComparison(url1, url2, media1Info, media2Info);
        } else {
            showNotification('Failed to load selected media for comparison', 'error');
        }
    } catch (error) {
        console.error('Comparison error:', error);
        showNotification('Failed to create comparison', 'error');
    }
}

function showCustomComparison(url1, url2, media1Info, media2Info) {
    const modal = document.getElementById('comparison-modal');
    const content = document.getElementById('comparison-content');
    
    content.innerHTML = `
        <div class="comparison-item">
            <div class="comparison-header">
                <h4 class="text-lg font-semibold text-white">📷 Media 1</h4>
                <div class="text-white/60 text-sm">${media1Info.date}</div>
            </div>
            <div class="comparison-media">
                ${media1Info.isVideo ? `
                    <video controls style="width: 100%; height: 100%; object-fit: cover;">
                        <source src="${url1}" type="video/*">
                    </video>
                ` : `
                    <img src="${url1}" alt="Media 1" style="width: 100%; height: 100%; object-fit: cover;">
                `}
            </div>
            <div class="p-4 text-white/80 text-sm border-t border-white/10">
                ${media1Info.description}
            </div>
        </div>
        
        <div class="comparison-item">
            <div class="comparison-header">
                <h4 class="text-lg font-semibold text-white">📷 Media 2</h4>
                <div class="text-white/60 text-sm">${media2Info.date}</div>
            </div>
            <div class="comparison-media">
                ${media2Info.isVideo ? `
                    <video controls style="width: 100%; height: 100%; object-fit: cover;">
                        <source src="${url2}" type="video/*">
                    </video>
                ` : `
                    <img src="${url2}" alt="Media 2" style="width: 100%; height: 100%; object-fit: cover;">
                `}
            </div>
            <div class="p-4 text-white/80 text-sm border-t border-white/10">
                ${media2Info.description}
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    
    // Reset selection after showing comparison
    setTimeout(() => {
        selectedMedia = [];
        document.querySelectorAll('.media-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        showNotification('Selection cleared', 'info');
    }, 1000);
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
            <div class="flex items-center space-x-2">
                <div class="text-white/70 text-sm">${new Date(log.created_at).toLocaleTimeString()}</div>
                <button class="btn-danger text-xs px-2 py-1" onclick="deleteNutritionEntry('${log.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
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

// Delete nutrition entry function
async function deleteNutritionEntry(entryId) {
    if (!confirm('Are you sure you want to delete this nutrition entry? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/nutrition/${entryId}`, {
            method: 'DELETE',
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            showNotification('Nutrition entry deleted successfully', 'success');
            loadNutrition(); // Reload nutrition data
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Failed to delete nutrition entry', 'error');
        }
    } catch (error) {
        console.error('Delete nutrition entry error:', error);
        showNotification('Failed to delete nutrition entry', 'error');
    }
}

// Admin Security Check Function
function isCurrentUserAdmin() {
    return currentUser && 
           currentUser.role === 'admin' && 
           currentUser.email === 'iamhollywoodpro@protonmail.com';
}

function enforceAdminAccess() {
    if (!isCurrentUserAdmin()) {
        showNotification('🚫 Access Denied: Admin privileges required', 'error');
        showSection('dashboard');
        
        // Hide admin tab immediately
        const adminTab = document.getElementById('admin-tab');
        if (adminTab) {
            adminTab.classList.add('hidden');
            adminTab.style.display = 'none';
        }
        
        return false;
    }
    return true;
}

// Admin functions
// DUPLICATE FUNCTION DISABLED - Using the newer version at line 7391
/* async function loadAdminData() {
    if (!enforceAdminAccess()) return;
    
    try {
        await Promise.all([
            loadAdminStats(),
            loadAdminUsers(),
            loadAdminMedia()
        ]);
    } catch (error) {
        console.error('Admin data loading error:', error);
        showNotification('Failed to load admin data', 'error');
    }
} */

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

// DUPLICATE FUNCTION DISABLED - Using the newer grid-based version at line 7404
/* async function loadAdminUsers() {
    if (!enforceAdminAccess()) return;
    
    try {
        const response = await fetch('/api/admin/users', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.status === 403) {
            showNotification('🚫 Admin access denied', 'error');
            showSection('dashboard');
            return;
        }
        
        if (response.ok) {
            const data = await response.json();
            displayAdminUsers(data.users);
        } else {
            throw new Error('Failed to fetch users');
        }
    } catch (error) {
        console.error('Load admin users error:', error);
        const tbody = document.getElementById('admin-users-table');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-8 text-white/60">
                        Error loading users
                        <button onclick="loadAdminUsers()" class="mt-2 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded">
                            Try Again
                        </button>
                    </td>
                </tr>
            `;
        }
    }
} */

function displayAdminUsers(users) {
    const tbody = document.getElementById('admin-users-table');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.className = 'border-b border-white/5 hover:bg-white/5';
        
        // Show online/offline status
        const statusIcon = user.status === 'online' ? 
            '<span class="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>' :
            '<span class="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>';
        
        row.innerHTML = `
            <td class="py-3 px-4 text-white">
                ${statusIcon}${user.email.split('@')[0]}
                <div class="text-xs text-white/50">${user.status}</div>
            </td>
            <td class="py-3 px-4 text-white/70">${user.email}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'} text-white">
                    ${user.role}
                </span>
            </td>
            <td class="py-3 px-4 text-white/70">${user.points || 0} pts</td>
            <td class="py-3 px-4">
                ${user.role !== 'admin' ? `<button onclick="deleteAdminUser('${user.id}')" class="btn-danger text-xs">Delete</button>` : '<span class="text-purple-400 text-xs">Protected</span>'}
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
        // Load working habits
        setupWorkingHabits();
    } else if (section === 'progress') {
        loadMedia();
        // Set up compare mode event listener
        // Progress section loaded - compare functionality is always available
    } else if (section === 'nutrition') {
        loadNutrition();
    } else if (section === 'goals') {
        loadGoals();
    } else if (section === 'achievements') {
        // Always update points when entering achievements section
        updatePointsDisplay();
        loadAchievements();
        loadDailyChallenges();
        loadWeeklyChallenges();
        setupChallengeNavigation();
    } else if (section === 'social') {
        loadSocialHub();
    } else if (section === 'profile') {
        loadProfileData();
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
    
    // Clear any existing timeouts to prevent conflicts
    if (notification.hideTimeout) {
        clearTimeout(notification.hideTimeout);
    }
    
    // Force remove show class first to reset animation
    notification.classList.remove('show');
    
    // Set content with close button
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="closeNotification()">×</button>
    `;
    notification.className = `notification ${type}`;
    
    // Use requestAnimationFrame to ensure CSS reset before showing
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    // Set timeout to hide notification after 3 seconds
    notification.hideTimeout = setTimeout(() => {
        closeNotification();
    }, 3000);
}

function closeNotification() {
    const notification = document.getElementById('notification');
    
    // Clear timeout if exists
    if (notification.hideTimeout) {
        clearTimeout(notification.hideTimeout);
        notification.hideTimeout = null;
    }
    
    // Remove show class to trigger hide animation
    notification.classList.remove('show');
    
    // Clear content after animation completes
    setTimeout(() => {
        if (!notification.classList.contains('show')) {
            notification.innerHTML = '';
        }
    }, 300);
}

// Test function for notifications (can be called from browser console)
function testNotifications() {
    showNotification('🎉 Success notification test!', 'success');
    
    setTimeout(() => {
        showNotification('⚠️ Warning notification test!', 'warning');
    }, 1000);
    
    setTimeout(() => {
        showNotification('ℹ️ Info notification test!', 'info');
    }, 2000);
    
    setTimeout(() => {
        showNotification('❌ Error notification test!', 'error');
    }, 3000);
}

function updateDashboardStats() {
    // This will be called after loading habits to update the dashboard stats
    // Implementation depends on the loaded data
}

// Global Confirmation Modal functions
let currentConfirmHandler = null;

function showConfirmationModal(message, onConfirm) {
    const messageEl = document.getElementById('confirmation-message');
    const modalEl = document.getElementById('confirmation-modal');
    const confirmBtn = document.getElementById('confirm-delete-btn');
    
    if (!messageEl || !modalEl || !confirmBtn) {
        console.error('Modal elements not found, falling back to browser confirm');
        if (confirm(message)) {
            onConfirm();
        }
        return;
    }
    
    // Set message
    messageEl.textContent = message;
    
    // Clean up any existing handlers
    if (currentConfirmHandler) {
        confirmBtn.removeEventListener('click', currentConfirmHandler);
    }
    
    // Create new handler that properly executes the callback
    currentConfirmHandler = function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        // Close modal immediately
        closeConfirmationModal();
        
        // Execute callback after a brief delay to ensure modal is closed
        setTimeout(() => {
            if (onConfirm && typeof onConfirm === 'function') {
                onConfirm();
            }
        }, 50);
    };
    
    // Add event listener
    confirmBtn.addEventListener('click', currentConfirmHandler);
    
    // Show modal
    modalEl.classList.remove('hidden');
    
    // Focus the modal for accessibility
    modalEl.focus();
}

function closeConfirmationModal() {
    const modalEl = document.getElementById('confirmation-modal');
    const confirmBtn = document.getElementById('confirm-delete-btn');
    
    if (modalEl) {
        modalEl.classList.add('hidden');
    }
    
    // Clean up handlers
    if (currentConfirmHandler && confirmBtn) {
        confirmBtn.removeEventListener('click', currentConfirmHandler);
        currentConfirmHandler = null;
    }
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
    
    try {
        const response = await fetch('/api/goals', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayGoals(data.goals || []);
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to load goals', 'error');
            displayGoals([]); // Show empty state
        }
    } catch (error) {
        console.error('Load goals error:', error);
        showNotification('Failed to load goals', 'error');
        displayGoals([]); // Show empty state
    }
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
                <button class="btn-danger text-xs px-2 py-1" onclick="deleteGoal('${goal.id}')">
                    <i class="fas fa-trash"></i>
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
    const modal = document.getElementById('create-goal-modal');
    if (!modal) {
        showNotification('Create Goal modal not found', 'error');
        return;
    }
    
    modal.classList.remove('hidden');
    
    // Reset form
    document.getElementById('goal-form').reset();
    
    // Set default deadline to 1 month from now
    const defaultDeadline = new Date();
    defaultDeadline.setMonth(defaultDeadline.getMonth() + 1);
    document.getElementById('goal-deadline').value = defaultDeadline.toISOString().split('T')[0];
}

async function deleteGoal(goalId) {
    showConfirmationModal('Are you sure you want to delete this goal? This action cannot be undone.', async function() {
        try {
            const response = await fetch(`/api/goals/${goalId}`, {
                method: 'DELETE',
                headers: { 'x-session-id': sessionId }
            });
            
            if (response.ok) {
                showNotification('Goal deleted successfully', 'success');
                loadGoals();
            } else {
                const data = await response.json();
                showNotification(data.error || 'Failed to delete goal', 'error');
            }
        } catch (error) {
            console.error('Delete goal error:', error);
            showNotification('Failed to delete goal', 'error');
        }
    });
}

async function createGoal(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const goalData = {
        name: formData.get('name'),
        description: formData.get('description'),
        category: formData.get('category'),
        target_value: parseFloat(formData.get('target_value')),
        unit: formData.get('unit'),
        deadline: formData.get('deadline')
    };
    
    try {
        const response = await fetch('/api/goals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify(goalData)
        });
        
        if (response.ok) {
            showNotification('Goal created successfully!', 'success');
            closeCreateGoalModal();
            loadGoals();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to create goal', 'error');
        }
    } catch (error) {
        console.error('Create goal error:', error);
        showNotification('Failed to create goal', 'error');
    }
}

function closeCreateGoalModal() {
    const modal = document.getElementById('create-goal-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function updateGoalProgress(goalId) {
    // Placeholder for now - could be enhanced later
    showNotification('Update progress feature coming soon!', 'info');
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

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user progress system early
    loadUserProgress();
    
    // Set up a timer to regularly update points display
    setInterval(() => {
        if (document.getElementById('dashboard') && !document.getElementById('dashboard').classList.contains('hidden')) {
            updatePointsDisplay();
        }
    }, 5000); // Update every 5 seconds when dashboard is visible
    
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
    loadSocialUserStats();
    
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

async function loadSocialFriends() {
    const friendsList = document.getElementById('social-friends-list');
    const activityFeed = document.getElementById('friend-activity-feed');
    
    try {
        // Load friends from API
        const response = await fetch('/api/friends', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayFriendsList(data.friends || [], friendsList);
        } else {
            console.error('Failed to load friends');
            if (friendsList) {
                friendsList.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-white/60">No friends yet</p>
                        <p class="text-white/40 text-sm mt-2">Add friends to see them here!</p>
                        <button onclick="showAddFriendModal()" class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                            👥 Add Your First Friend
                        </button>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Load friends error:', error);
        if (friendsList) {
            friendsList.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-white/60">Unable to load friends</p>
                    <button onclick="loadSocialFriends()" class="mt-2 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded">
                        🔄 Retry
                    </button>
                </div>
            `;
        }
    }
    
    // Load friend activity (placeholder for now)
    if (activityFeed) {
        activityFeed.innerHTML = `
            <div class="text-center py-8">
                <p class="text-white/60">Friend activity feed</p>
                <p class="text-white/40 text-sm mt-2">Coming soon!</p>
            </div>
        `;
    }
}

function displayFriendsList(friends, container) {
    if (!container) return;
    
    if (friends.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <p class="text-white/60">No friends yet</p>
                <p class="text-white/40 text-sm mt-2">Add friends to see them here!</p>
                <button onclick="showAddFriendModal()" class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                    👥 Add Your First Friend
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = friends.map(friend => {
        const avatar = friend.email.charAt(0).toUpperCase();
        const level = Math.floor(friend.points / 100) + 1;
        
        return `
            <div class="friend-card bg-white/5 rounded-lg p-4 border border-white/10">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span class="text-white text-lg font-bold">${avatar}</span>
                        </div>
                        <div>
                            <div class="text-white font-semibold">${friend.email.split('@')[0]}</div>
                            <div class="text-white/60 text-sm">
                                Level ${level} • ${friend.total_achievements} achievements
                            </div>
                            <div class="text-yellow-400 text-xs">${friend.points || 0} points</div>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                                onclick="removeFriend('${friend.id}')">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function loadSocialLeaderboards() {
    const leaderboardContainer = document.getElementById('social-leaderboard-container');
    const userStatsContainer = document.getElementById('social-user-stats');
    
    try {
        // Load leaderboard from API
        const response = await fetch('/api/leaderboards?type=weekly', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displaySocialLeaderboard(data.leaderboard || [], leaderboardContainer);
            displayUserStats(data.currentUser, userStatsContainer);
        } else {
            console.error('Failed to load leaderboards');
            if (leaderboardContainer) {
                leaderboardContainer.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-white/60">Unable to load leaderboard</p>
                        <button onclick="loadSocialLeaderboards()" class="mt-2 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded">
                            🔄 Retry
                        </button>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Load leaderboards error:', error);
        if (leaderboardContainer) {
            leaderboardContainer.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-white/60">Unable to load leaderboard</p>
                    <button onclick="loadSocialLeaderboards()" class="mt-2 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded">
                        🔄 Retry
                    </button>
                </div>
            `;
        }
    }
}

function displayUserStats(user, container) {
    if (!container || !user) return;
    
    container.innerHTML = `
        <div class="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <div class="text-xl font-bold text-blue-400">${user.points || 0}</div>
            <div class="text-white/60 text-sm">Total Points</div>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <div class="text-xl font-bold text-green-400">${user.achievements || 0}</div>
            <div class="text-white/60 text-sm">Achievements</div>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <div class="text-xl font-bold text-orange-400">${user.weekly_points || 0}</div>
            <div class="text-white/60 text-sm">This Week</div>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <div class="text-xl font-bold text-purple-400">#${user.rank || 'N/A'}</div>
            <div class="text-white/60 text-sm">Rank</div>
        </div>
    `;
}

function displaySocialLeaderboard(entries, container) {
    if (!container) return;
    
    if (!entries || entries.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <p class="text-white/60">No leaderboard data</p>
                <p class="text-white/40 text-sm mt-2">Add friends to compete!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = entries.map((entry, index) => {
        const avatar = entry.email.charAt(0).toUpperCase();
        const rank = index + 1;
        const rankColor = rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-orange-400' : 'text-white';
        const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
        
        return `
            <div class="leaderboard-entry bg-white/5 rounded-lg p-4 border border-white/10 flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <div class="${rankColor} text-lg font-bold w-8 text-center">${rankIcon}</div>
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span class="text-white font-bold">${avatar}</span>
                    </div>
                    <div>
                        <div class="text-white font-semibold">${entry.email.split('@')[0]}</div>
                        <div class="text-white/60 text-sm">${entry.achievements || 0} achievements</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-white font-bold">${entry.weekly_points || entry.points || 0}</div>
                    <div class="text-white/60 text-xs">points</div>
                </div>
            </div>
        `;
    }).join('');
}

async function loadSocialChallenges() {
    await Promise.all([
        loadActiveChallenges(),
        loadChallengeInvitations()
    ]);
}

async function loadActiveChallenges() {
    const container = document.getElementById('social-active-challenges');
    if (!container) return;
    
    try {
        const response = await fetch('/api/challenges?type=active', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.challenges && data.challenges.length > 0) {
                container.innerHTML = data.challenges.map(challenge => createChallengeCard(challenge)).join('');
            } else {
                container.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-white/60">No active challenges</p>
                        <p class="text-white/40 text-sm mt-2">Create challenges with friends!</p>
                        <button onclick="showCreateChallengeModal()" class="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">
                            🏆 Create Challenge
                        </button>
                    </div>
                `;
            }
        } else {
            throw new Error('Failed to load challenges');
        }
    } catch (error) {
        console.error('Load active challenges error:', error);
        container.innerHTML = `
            <div class="text-center py-8">
                <p class="text-white/60">Error loading challenges</p>
                <button onclick="loadActiveChallenges()" class="mt-2 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded">
                    Try Again
                </button>
            </div>
        `;
    }
}

async function loadChallengeInvitations() {
    const container = document.getElementById('social-challenge-invites');
    if (!container) return;
    
    try {
        const response = await fetch('/api/challenges/invitations', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.invitations && data.invitations.length > 0) {
                container.innerHTML = data.invitations.map(invitation => createChallengeInvitationCard(invitation)).join('');
            } else {
                container.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-white/60">No challenge invites</p>
                        <p class="text-white/40 text-sm mt-2">Challenge invitations will appear here</p>
                    </div>
                `;
            }
        } else {
            throw new Error('Failed to load invitations');
        }
    } catch (error) {
        console.error('Load challenge invitations error:', error);
        container.innerHTML = `
            <div class="text-center py-8">
                <p class="text-white/60">Error loading invitations</p>
                <button onclick="loadChallengeInvitations()" class="mt-2 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded">
                    Try Again
                </button>
            </div>
        `;
    }
}

// Social Hub Helper Functions
function showAddFriendModal() {
    const email = prompt('Enter your friend\'s email address:');
    if (email && email.trim()) {
        addFriend(email.trim());
    }
}

async function addFriend(email) {
    try {
        const response = await fetch('/api/friends', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify({ email })
        });
        
        if (response.ok) {
            showNotification('Friend request sent!', 'success');
            loadSocialFriends();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to send friend request', 'error');
        }
    } catch (error) {
        console.error('Add friend error:', error);
        showNotification('Failed to send friend request', 'error');
    }
}

async function removeFriend(friendId) {
    showConfirmationModal('Are you sure you want to remove this friend?', async function() {
        try {
            const response = await fetch(`/api/friends/${friendId}`, {
                method: 'DELETE',
                headers: { 'x-session-id': sessionId }
            });
            
            if (response.ok) {
                showNotification('Friend removed successfully', 'success');
                loadSocialFriends();
            } else {
                const error = await response.json();
                showNotification(error.error || 'Failed to remove friend', 'error');
            }
        } catch (error) {
            console.error('Remove friend error:', error);
            showNotification('Failed to remove friend', 'error');
        }
    });
}

function showCreateChallengeModal() {
    // Clear previous form data
    const form = document.getElementById('challenge-form');
    if (form) form.reset();
    
    // Clear invited friends list
    const invitedList = document.getElementById('invited-friends-list');
    if (invitedList) invitedList.innerHTML = '';
    
    invitedFriends.length = 0; // Clear the array
    
    // Show modal
    showModal('create-challenge-modal');
}

// Array to store invited friends for challenge
let invitedFriends = [];

function addFriendToInvite() {
    const emailInput = document.getElementById('invite-friend-email');
    const email = emailInput.value.trim();
    
    if (!email) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (invitedFriends.includes(email)) {
        showNotification('Friend already invited', 'error');
        return;
    }
    
    invitedFriends.push(email);
    emailInput.value = '';
    
    updateInvitedFriendsList();
}

function removeInvitedFriend(email) {
    const index = invitedFriends.indexOf(email);
    if (index > -1) {
        invitedFriends.splice(index, 1);
        updateInvitedFriendsList();
    }
}

function updateInvitedFriendsList() {
    const container = document.getElementById('invited-friends-list');
    if (!container) return;
    
    container.innerHTML = invitedFriends.map(email => `
        <div class="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <span class="text-white/80 text-sm">${email}</span>
            <button onclick="removeInvitedFriend('${email}')" class="text-red-400 hover:text-red-300 text-sm">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

async function createChallenge(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const challengeData = {
        title: formData.get('title'),
        description: formData.get('description'),
        type: formData.get('type'),
        category: formData.get('category'),
        target_value: parseInt(formData.get('target_value')),
        target_unit: formData.get('target_unit'),
        duration_days: parseInt(formData.get('duration_days')),
        max_participants: parseInt(formData.get('max_participants')),
        reward_points: parseInt(formData.get('reward_points')),
        privacy: formData.get('privacy'),
        invitees: invitedFriends
    };
    
    try {
        const response = await fetch('/api/challenges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify(challengeData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification(`Challenge "${challengeData.title}" created successfully! 🏆`, 'success');
            closeModal('create-challenge-modal');
            
            // Reload challenges to show the new one
            loadSocialChallenges();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to create challenge', 'error');
        }
    } catch (error) {
        console.error('Create challenge error:', error);
        showNotification('Failed to create challenge', 'error');
    }
}

function createChallengeCard(challenge) {
    const categoryIcons = {
        fitness: '💪',
        nutrition: '🍎',
        habits: '🔥',
        steps: '👟',
        mindfulness: '🧘',
        other: '⭐'
    };
    
    const typeColors = {
        group: 'bg-blue-500/20 border-blue-400',
        versus: 'bg-red-500/20 border-red-400',
        individual: 'bg-green-500/20 border-green-400'
    };
    
    const isCreator = challenge.creator_id === (currentUser ? currentUser.id : null);
    const isParticipating = challenge.participation_status === 'accepted';
    const progressPercentage = challenge.progress_percentage || 0;
    
    return `
        <div class="challenge-card ${typeColors[challenge.type] || 'bg-purple-500/20 border-purple-400'}">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-2">
                    <div class="text-2xl">${categoryIcons[challenge.category] || '⭐'}</div>
                    <div>
                        <h4 class="font-bold text-white">${challenge.title}</h4>
                        <div class="text-white/60 text-sm">by ${challenge.creator_username || challenge.creator_email}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-yellow-400 font-bold">+${challenge.reward_points}</div>
                    <div class="text-white/60 text-xs">points</div>
                </div>
            </div>
            
            <p class="text-white/80 text-sm mb-3">${challenge.description || 'No description'}</p>
            
            <div class="flex items-center justify-between text-sm mb-3">
                <div class="text-white/60">
                    Target: ${challenge.target_value} ${challenge.target_unit}
                </div>
                <div class="text-white/60">
                    ${challenge.participant_count}/${challenge.max_participants} participants
                </div>
            </div>
            
            ${isParticipating ? `
                <div class="mb-3">
                    <div class="flex items-center justify-between text-sm mb-1">
                        <span class="text-white/70">Your Progress</span>
                        <span class="text-white">${progressPercentage.toFixed(0)}%</span>
                    </div>
                    <div class="bg-white/10 rounded-full h-2">
                        <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" 
                             style="width: ${progressPercentage}%"></div>
                    </div>
                </div>
            ` : ''}
            
            <div class="flex space-x-2">
                ${!isParticipating && !isCreator ? `
                    <button onclick="joinChallenge('${challenge.id}')" 
                            class="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">
                        🚀 Join Challenge
                    </button>
                ` : ''}
                
                ${isParticipating ? `
                    <button onclick="updateChallengeProgress('${challenge.id}')" 
                            class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                        📈 Update Progress
                    </button>
                ` : ''}
                
                <button onclick="viewChallenge('${challenge.id}')" 
                        class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors">
                    👁️ View
                </button>
                
                ${isCreator ? `
                    <button onclick="deleteChallenge('${challenge.id}')" 
                            class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
                        🗑️
                    </button>
                ` : ''}
            </div>
            
            <div class="flex items-center justify-between text-xs text-white/50 mt-2">
                <span>Ends: ${new Date(challenge.end_date).toLocaleDateString()}</span>
                <span class="capitalize">${challenge.type} • ${challenge.category}</span>
            </div>
        </div>
    `;
}

function createChallengeInvitationCard(invitation) {
    const categoryIcons = {
        fitness: '💪',
        nutrition: '🍎',
        habits: '🔥',
        steps: '👟',
        mindfulness: '🧘',
        other: '⭐'
    };
    
    return `
        <div class="challenge-card bg-yellow-500/20 border-yellow-400">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-2">
                    <div class="text-2xl">${categoryIcons[invitation.challenge_category] || '⭐'}</div>
                    <div>
                        <h4 class="font-bold text-white">${invitation.challenge_title}</h4>
                        <div class="text-white/60 text-sm">Invited by ${invitation.inviter_username}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-yellow-400 font-bold">+${invitation.reward_points}</div>
                    <div class="text-white/60 text-xs">points</div>
                </div>
            </div>
            
            <p class="text-white/80 text-sm mb-3">${invitation.challenge_description || 'No description'}</p>
            
            <div class="flex items-center justify-between text-sm mb-3">
                <div class="text-white/60">
                    Target: ${invitation.target_value} ${invitation.target_unit}
                </div>
                <div class="text-white/60">
                    Duration: ${invitation.duration_days} days
                </div>
            </div>
            
            <div class="flex space-x-2">
                <button onclick="respondToChallenge('${invitation.id}', 'accept')" 
                        class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
                    ✅ Accept
                </button>
                <button onclick="respondToChallenge('${invitation.id}', 'decline')" 
                        class="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
                    ❌ Decline
                </button>
            </div>
            
            <div class="flex items-center justify-between text-xs text-white/50 mt-2">
                <span>Invited: ${new Date(invitation.created_at).toLocaleDateString()}</span>
                <span class="capitalize">${invitation.challenge_type} • ${invitation.challenge_category}</span>
            </div>
        </div>
    `;
}

async function joinChallenge(challengeId) {
    try {
        const response = await fetch(`/api/challenges/${challengeId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify({ action: 'join' })
        });
        
        if (response.ok) {
            showNotification('Successfully joined challenge! 🎉', 'success');
            loadSocialChallenges();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to join challenge', 'error');
        }
    } catch (error) {
        console.error('Join challenge error:', error);
        showNotification('Failed to join challenge', 'error');
    }
}

async function updateChallengeProgress(challengeId) {
    const progressValue = prompt('Enter your current progress value:');
    if (!progressValue || isNaN(progressValue)) return;
    
    const progressNotes = prompt('Add notes about your progress (optional):') || '';
    
    try {
        const response = await fetch(`/api/challenges/${challengeId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify({ 
                action: 'update_progress', 
                progress_value: parseInt(progressValue),
                progress_notes: progressNotes
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification(`Progress updated to ${result.progress_percentage.toFixed(0)}%! 📈`, 'success');
            loadSocialChallenges();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to update progress', 'error');
        }
    } catch (error) {
        console.error('Update progress error:', error);
        showNotification('Failed to update progress', 'error');
    }
}

async function respondToChallenge(invitationId, response) {
    try {
        const apiResponse = await fetch('/api/challenges/invitations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify({ 
                invitation_id: invitationId, 
                response: response 
            })
        });
        
        if (apiResponse.ok) {
            const message = response === 'accept' ? 'Challenge accepted! 🎉' : 'Challenge declined';
            showNotification(message, 'success');
            loadSocialChallenges();
        } else {
            const error = await apiResponse.json();
            showNotification(error.error || 'Failed to respond to challenge', 'error');
        }
    } catch (error) {
        console.error('Respond to challenge error:', error);
        showNotification('Failed to respond to challenge', 'error');
    }
}

function viewChallenge(challengeId) {
    showNotification('Challenge details view coming soon! 👁️', 'info');
}

async function deleteChallenge(challengeId) {
    showConfirmationModal('Are you sure you want to delete this challenge? This action cannot be undone.', async function() {
        try {
            const response = await fetch(`/api/challenges/${challengeId}`, {
                method: 'DELETE',
                headers: { 'x-session-id': sessionId }
            });
            
            if (response.ok) {
                showNotification('Challenge deleted successfully', 'success');
                loadSocialChallenges();
            } else {
                const error = await response.json();
                showNotification(error.error || 'Failed to delete challenge', 'error');
            }
        } catch (error) {
            console.error('Delete challenge error:', error);
            showNotification('Failed to delete challenge', 'error');
        }
    });
}

function loadCommunityFeed() {
    const communityFeed = document.getElementById('community-feed');
    
    if (communityFeed) {
        // Generate some sample community activity
        const activities = generateCommunityActivities();
        
        if (activities.length > 0) {
            communityFeed.innerHTML = activities.map(activity => createCommunityActivityCard(activity)).join('');
        } else {
            communityFeed.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-white/60">Community feed</p>
                    <p class="text-white/40 text-sm mt-2">Community updates coming soon!</p>
                </div>
            `;
        }
    }
}

function generateCommunityActivities() {
    const activityTypes = [
        { type: 'challenge_complete', icon: '🏆', color: 'text-yellow-400' },
        { type: 'habit_streak', icon: '🔥', color: 'text-orange-400' },
        { type: 'goal_achieved', icon: '🎯', color: 'text-green-400' },
        { type: 'level_up', icon: '🎆', color: 'text-purple-400' },
        { type: 'challenge_created', icon: '✨', color: 'text-blue-400' }
    ];
    
    const users = ['FitnessPro', 'HealthyHero', 'WorkoutWarrior', 'NutritionNinja', 'StriveSeeker'];
    const achievements = [
        'completed a 30-day push-up challenge',
        'achieved a 15-day workout streak',
        'reached their weight loss goal',
        'leveled up to Fitness Master',
        'created a new community challenge',
        'completed 10,000 steps for 7 days straight',
        'achieved their first 5K run',
        'unlocked the "Consistency Champion" badge'
    ];
    
    return Array.from({ length: 6 }, (_, i) => {
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        const achievement = achievements[Math.floor(Math.random() * achievements.length)];
        const timeAgo = [`${Math.floor(Math.random() * 12) + 1}h ago`, `${Math.floor(Math.random() * 7) + 1}d ago`][Math.floor(Math.random() * 2)];
        
        return {
            id: `activity_${i}`,
            user,
            achievement,
            timeAgo,
            ...activityType
        };
    });
}

function createCommunityActivityCard(activity) {
    return `
        <div class="bg-white/5 border border-white/10 rounded-lg p-4 mb-3 hover:bg-white/8 transition-colors">
            <div class="flex items-start space-x-3">
                <div class="text-2xl ${activity.color}">${activity.icon}</div>
                <div class="flex-1">
                    <div class="text-white font-medium">${activity.user}</div>
                    <div class="text-white/70 text-sm mt-1">${activity.achievement}</div>
                    <div class="text-white/50 text-xs mt-2">${activity.timeAgo}</div>
                </div>
                <button class="text-white/60 hover:text-white transition-colors">
                    <i class="fas fa-thumbs-up text-sm"></i>
                </button>
            </div>
        </div>
    `;
}

function loadSocialUserStats() {
    const container = document.getElementById('social-user-stats');
    if (!container) return;
    
    // Generate user performance stats
    const stats = [
        { label: 'Weekly Points', value: Math.floor(Math.random() * 500) + 200, icon: '⭐', color: 'text-yellow-400' },
        { label: 'Current Streak', value: Math.floor(Math.random() * 30) + 5, icon: '🔥', color: 'text-orange-400' },
        { label: 'Challenges Won', value: Math.floor(Math.random() * 15) + 2, icon: '🏆', color: 'text-green-400' },
        { label: 'Community Rank', value: `#${Math.floor(Math.random() * 50) + 10}`, icon: '📊', color: 'text-blue-400' }
    ];
    
    container.innerHTML = stats.map(stat => `
        <div class="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <div class="text-2xl mb-2 ${stat.color}">${stat.icon}</div>
            <div class="text-xl font-bold text-white">${stat.value}</div>
            <div class="text-white/60 text-sm">${stat.label}</div>
        </div>
    `).join('');
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

// Global user progress and achievement state
let userProgress = {
    points: 0,
    completedChallenges: new Set(),
    completedAchievements: new Set(),
    streaks: {
        daily: 0,
        weekly: 0
    },
    lastActivity: null
};

// Load user progress from localStorage (per user)
function loadUserProgress() {
    const userId = currentUser ? currentUser.id || currentUser.email : 'guest';
    const saved = localStorage.getItem(`strivetrack_user_progress_${userId}`);
    if (saved) {
        const parsed = JSON.parse(saved);
        userProgress = {
            ...userProgress,
            ...parsed,
            completedChallenges: new Set(parsed.completedChallenges || []),
            completedAchievements: new Set(parsed.completedAchievements || [])
        };
    }
}

// Save user progress to localStorage (per user)
function saveUserProgress() {
    const userId = currentUser ? currentUser.id || currentUser.email : 'guest';
    const toSave = {
        ...userProgress,
        completedChallenges: Array.from(userProgress.completedChallenges),
        completedAchievements: Array.from(userProgress.completedAchievements)
    };
    localStorage.setItem(`strivetrack_user_progress_${userId}`, JSON.stringify(toSave));
}

function generateEnhancedDailyChallenges() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    const challengeTemplates = {
        0: [ // Sunday - 5 challenges
            { 
                id: 'sunday_1', 
                type: 'planning', 
                title: 'Week Ahead Goals', 
                description: 'Create or update 3 specific goals for the upcoming week in StriveTrack', 
                points: 30, 
                icon: '🎯',
                color: 'blue',
                difficulty: 'Easy',
                category: 'goals'
            },
            { 
                id: 'sunday_2', 
                type: 'progress', 
                title: 'Weekly Progress Photo', 
                description: 'Upload a progress photo to document this week in your StriveTrack journey', 
                points: 35, 
                icon: '📸',
                color: 'green',
                difficulty: 'Easy',
                category: 'media'
            },
            { 
                id: 'sunday_3', 
                type: 'habit', 
                title: 'Habit Review & Setup', 
                description: 'Review your habits and create or adjust one for better consistency', 
                points: 25, 
                icon: '✅',
                color: 'purple',
                difficulty: 'Easy',
                category: 'habits'
            },
            { 
                id: 'sunday_4', 
                type: 'reflection', 
                title: 'Weekly Reflection', 
                description: 'Complete at least 2 habits today and reflect on your week', 
                points: 20, 
                icon: '🤔',
                color: 'indigo',
                difficulty: 'Easy',
                category: 'mindfulness'
            },
            { 
                id: 'sunday_5', 
                type: 'social', 
                title: 'Community Connect', 
                description: 'Add a friend or engage with community members in StriveTrack', 
                points: 25, 
                icon: '👥',
                color: 'yellow',
                difficulty: 'Easy',
                category: 'social'
            }
        ],
        1: [ // Monday - 5 challenges
            { 
                id: 'monday_1', 
                type: 'habit', 
                title: 'Monday Momentum', 
                description: 'Complete your most important habit within the first 2 hours of waking', 
                points: 30, 
                icon: '🚀',
                color: 'orange',
                difficulty: 'Medium',
                category: 'habits'
            },
            { 
                id: 'monday_2', 
                type: 'progress', 
                title: 'Fresh Start Photo', 
                description: 'Take a "before workout" photo to capture Monday motivation', 
                points: 25, 
                icon: '📱',
                color: 'blue',
                difficulty: 'Easy',
                category: 'media'
            },
            { 
                id: 'monday_3', 
                type: 'workout', 
                title: 'Week Starter Workout', 
                description: 'Complete a 20+ minute workout to start the week strong', 
                points: 40, 
                icon: '💪',
                color: 'red',
                difficulty: 'Medium',
                category: 'fitness'
            },
            { 
                id: 'monday_4', 
                type: 'goals', 
                title: 'Goal Progress Update', 
                description: 'Update progress on at least one of your active goals in StriveTrack', 
                points: 20, 
                icon: '📊',
                color: 'green',
                difficulty: 'Easy',
                category: 'goals'
            },
            { 
                id: 'monday_5', 
                type: 'achievement', 
                title: 'Achievement Hunter', 
                description: 'Work toward unlocking a new achievement today', 
                points: 35, 
                icon: '🏆',
                color: 'gold',
                difficulty: 'Medium',
                category: 'achievement'
            }
        ],
        2: [ // Tuesday - 5 challenges
            { 
                id: 'tuesday_1', 
                type: 'habit', 
                title: 'Consistency Champion', 
                description: 'Complete ALL your scheduled habits for today', 
                points: 50, 
                icon: '🔥',
                color: 'red',
                difficulty: 'Hard',
                category: 'habits'
            },
            { 
                id: 'tuesday_2', 
                type: 'media', 
                title: 'Workout Documentation', 
                description: 'Upload a photo or video of your workout in action', 
                points: 30, 
                icon: '🎥',
                color: 'purple',
                difficulty: 'Easy',
                category: 'media'
            },
            { 
                id: 'tuesday_3', 
                type: 'strength', 
                title: 'Strength Builder', 
                description: 'Focus on strength training for 25+ minutes', 
                points: 35, 
                icon: '🏋️‍♂️',
                color: 'orange',
                difficulty: 'Medium',
                category: 'fitness'
            },
            { 
                id: 'tuesday_4', 
                type: 'challenge', 
                title: 'Create Personal Challenge', 
                description: 'Set up a custom challenge for yourself in StriveTrack', 
                points: 25, 
                icon: '⚡',
                color: 'yellow',
                difficulty: 'Easy',
                category: 'challenge'
            },
            { 
                id: 'tuesday_5', 
                type: 'sleep', 
                title: 'Sleep Optimizer', 
                description: 'Set a bedtime and avoid screens 1 hour before', 
                points: 20, 
                icon: '🌙',
                color: 'indigo',
                difficulty: 'Medium',
                category: 'recovery'
            }
        ],
        3: [ // Wednesday - 5 challenges
            { 
                id: 'wednesday_1', 
                type: 'streak', 
                title: 'Midweek Streak Power', 
                description: 'Maintain your longest habit streak - complete key habits today', 
                points: 40, 
                icon: '🎯',
                color: 'purple',
                difficulty: 'Medium',
                category: 'habits'
            },
            { 
                id: 'wednesday_2', 
                type: 'transformation', 
                title: 'Transformation Video', 
                description: 'Create a short video showing your fitness progress or workout', 
                points: 45, 
                icon: '🎬',
                color: 'red',
                difficulty: 'Medium',
                category: 'media'
            },
            { 
                id: 'wednesday_3', 
                type: 'cardio', 
                title: 'Cardio Crusher', 
                description: 'Complete 30+ minutes of cardio activity', 
                points: 35, 
                icon: '❤️',
                color: 'red',
                difficulty: 'Medium',
                category: 'fitness'
            },
            { 
                id: 'wednesday_4', 
                type: 'social', 
                title: 'Motivate Others', 
                description: 'Encourage friends or community members in their fitness journey', 
                points: 20, 
                icon: '💬',
                color: 'blue',
                difficulty: 'Easy',
                category: 'social'
            },
            { 
                id: 'wednesday_5', 
                type: 'goal', 
                title: 'Milestone Marker', 
                description: 'Work toward completing one of your goals this week', 
                points: 30, 
                icon: '🏁',
                color: 'green',
                difficulty: 'Medium',
                category: 'goals'
            }
        ],
        4: [ // Thursday - 5 challenges
            { 
                id: 'thursday_1', 
                type: 'quality', 
                title: 'Perfect Form Focus', 
                description: 'Focus on perfect form and technique in your workout', 
                points: 30, 
                icon: '⚖️',
                color: 'orange',
                difficulty: 'Medium',
                category: 'fitness'
            },
            { 
                id: 'thursday_2', 
                type: 'nutrition', 
                title: 'Nutrition Champion', 
                description: 'Plan and prepare a healthy meal, document with photo', 
                points: 25, 
                icon: '🥗',
                color: 'green',
                difficulty: 'Easy',
                category: 'nutrition'
            },
            { 
                id: 'thursday_3', 
                type: 'achievement', 
                title: 'Personal Best Attempt', 
                description: 'Try to achieve a personal best or unlock a new achievement', 
                points: 50, 
                icon: '🏆',
                color: 'gold',
                difficulty: 'Hard',
                category: 'achievement'
            },
            { 
                id: 'thursday_4', 
                type: 'habit', 
                title: 'Habit Mastery', 
                description: 'Complete your most challenging habit with extra focus', 
                points: 35, 
                icon: '🎓',
                color: 'purple',
                difficulty: 'Medium',
                category: 'habits'
            },
            { 
                id: 'thursday_5', 
                type: 'inspiration', 
                title: 'Inspire Others', 
                description: 'Share your workout or progress to inspire others', 
                points: 25, 
                icon: '✨',
                color: 'yellow',
                difficulty: 'Easy',
                category: 'social'
            }
        ],
        5: [ // Friday - 5 challenges
            { 
                id: 'friday_1', 
                type: 'completion', 
                title: 'Week Strong Finish', 
                description: 'Complete all your planned habits and workouts for today', 
                points: 45, 
                icon: '🏁',
                color: 'red',
                difficulty: 'Hard',
                category: 'habits'
            },
            { 
                id: 'friday_2', 
                type: 'celebration', 
                title: 'Progress Celebration', 
                description: 'Upload a photo celebrating this week\'s fitness wins', 
                points: 30, 
                icon: '🎉',
                color: 'rainbow',
                difficulty: 'Easy',
                category: 'media'
            },
            { 
                id: 'friday_3', 
                type: 'planning', 
                title: 'Weekend Warrior Prep', 
                description: 'Plan active weekend activities and set goals for next week', 
                points: 25, 
                icon: '📅',
                color: 'blue',
                difficulty: 'Easy',
                category: 'planning'
            },
            { 
                id: 'friday_4', 
                type: 'reflection', 
                title: 'Weekly Wins Review', 
                description: 'Reflect on your achievements and progress this week', 
                points: 20, 
                icon: '📝',
                color: 'purple',
                difficulty: 'Easy',
                category: 'reflection'
            },
            { 
                id: 'friday_5', 
                type: 'goal', 
                title: 'Goal Completion Push', 
                description: 'Make significant progress toward completing a goal', 
                points: 40, 
                icon: '🎯',
                color: 'green',
                difficulty: 'Medium',
                category: 'goals'
            }
        ],
        6: [ // Saturday - 5 challenges
            { 
                id: 'saturday_1', 
                type: 'adventure', 
                title: 'Weekend Adventure', 
                description: 'Try a new workout style or outdoor activity', 
                points: 40, 
                icon: '🏔️',
                color: 'green',
                difficulty: 'Medium',
                category: 'fitness'
            },
            { 
                id: 'saturday_2', 
                type: 'media', 
                title: 'Adventure Documentation', 
                description: 'Capture your weekend fitness adventure with photos/videos', 
                points: 35, 
                icon: '📸',
                color: 'blue',
                difficulty: 'Easy',
                category: 'media'
            },
            { 
                id: 'saturday_3', 
                type: 'social', 
                title: 'Fitness Friend Challenge', 
                description: 'Workout with friends or invite someone to join your fitness journey', 
                points: 30, 
                icon: '👥',
                color: 'yellow',
                difficulty: 'Medium',
                category: 'social'
            },
            { 
                id: 'saturday_4', 
                type: 'creativity', 
                title: 'Creative Movement', 
                description: 'Try dance, martial arts, or any creative physical activity', 
                points: 30, 
                icon: '💃',
                color: 'pink',
                difficulty: 'Medium',
                category: 'creative'
            },
            { 
                id: 'saturday_5', 
                type: 'habit', 
                title: 'Weekend Consistency', 
                description: 'Maintain your habits even on weekend - complete 2+ habits', 
                points: 25, 
                icon: '⚔️',
                color: 'orange',
                difficulty: 'Medium',
                category: 'habits'
            }
        ]
    };
    
    const todayChallenges = challengeTemplates[dayOfWeek] || challengeTemplates[1];
    
    // Use actual user progress instead of random completion
    return todayChallenges.map(challenge => ({
        ...challenge,
        completed: userProgress.completedChallenges.has(challenge.id),
        progress: userProgress.completedChallenges.has(challenge.id) ? 100 : 0
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
                <button class="complete-challenge-btn w-full px-4 py-2 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                        onclick="completeEnhancedChallenge('${challenge.id}')">
                    <i class="fas fa-trophy mr-2"></i>Complete Challenge
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
    // Load user progress
    loadUserProgress();
    
    // Check if already completed
    if (userProgress.completedChallenges.has(challengeId)) {
        showNotification('⚠️ Challenge already completed!', 'warning');
        return;
    }
    
    // Anti-cheat verification
    if (!verifyChallengeCompletion(challengeId)) {
        return; // Verification failed, don't award points
    }
    
    // Get points from the challenge card
    const challengeCard = document.querySelector(`button[onclick="completeEnhancedChallenge('${challengeId}')"]`).closest('.enhanced-challenge-card');
    const pointsText = challengeCard.querySelector('.text-yellow-400').textContent;
    const points = parseInt(pointsText.replace('+', ''));
    
    // Add to completed challenges with timestamp
    userProgress.completedChallenges.add(challengeId);
    userProgress.points += points;
    userProgress.lastActivity = new Date().toISOString();
    
    // Store completion time for verification
    if (!userProgress.challengeCompletionTimes) {
        userProgress.challengeCompletionTimes = {};
    }
    userProgress.challengeCompletionTimes[challengeId] = new Date().toISOString();
    
    // Save progress
    saveUserProgress();
    
    // Show notification with points
    showNotification(`🎉 Challenge completed! +${points} points earned!`, 'success');
    
    // Add celebration effect
    celebrateChallenge(points);
    
    // Check for achievements
    checkAchievements();
    
    // Update displays immediately
    updatePointsDisplay();
    
    // Reload challenges to show completion state
    setTimeout(() => {
        loadDailyChallenges();
        updateDashboardStats();
    }, 1000);
}

// Anti-cheat verification system
function verifyChallengeCompletion(challengeId) {
    // Get challenge details
    const challengeCard = document.querySelector(`button[onclick="completeEnhancedChallenge('${challengeId}')"]`).closest('.enhanced-challenge-card');
    const challengeTitle = challengeCard.querySelector('h4').textContent;
    const challengeType = challengeCard.querySelector('.px-2.py-1').textContent.toLowerCase();
    
    // Time-based verification (prevent rapid clicking)
    const lastCompletion = userProgress.lastChallengeCompletion || 0;
    const now = Date.now();
    if (now - lastCompletion < 3000) { // 3 second cooldown
        showNotification('⚠️ Please wait before completing another challenge!', 'warning');
        return false;
    }
    userProgress.lastChallengeCompletion = now;
    
    // Challenge-specific verification
    if (requiresVerification(challengeId, challengeType)) {
        return showChallengeVerification(challengeId, challengeTitle);
    }
    
    return true;
}

function requiresVerification(challengeId, challengeType) {
    // High-point challenges require verification
    const challengeCard = document.querySelector(`button[onclick="completeEnhancedChallenge('${challengeId}')"]`).closest('.enhanced-challenge-card');
    const points = parseInt(challengeCard.querySelector('.text-yellow-400').textContent.replace('+', ''));
    
    // Require verification for high-value challenges (30+ points) or certain types
    return points >= 30 || 
           challengeType.includes('strength') || 
           challengeType.includes('endurance') || 
           challengeType.includes('challenge');
}

function showChallengeVerification(challengeId, challengeTitle) {
    const verificationQuestions = [
        "How many reps did you complete?",
        "How do you feel after completing this challenge?",
        "What was the most difficult part?",
        "Rate your effort level (1-10):",
        "How long did this challenge take you?"
    ];
    
    const randomQuestion = verificationQuestions[Math.floor(Math.random() * verificationQuestions.length)];
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl max-w-md mx-4 text-center border border-white/10">
            <div class="text-4xl mb-4">💪</div>
            <h2 class="text-xl font-bold text-white mb-4">Challenge Verification</h2>
            <p class="text-white/80 mb-4">${challengeTitle}</p>
            <p class="text-white/70 mb-4">${randomQuestion}</p>
            <textarea class="w-full p-3 bg-slate-700 text-white rounded-lg border border-white/20 mb-4" 
                     placeholder="Your answer..." id="verification-answer" rows="3"></textarea>
            <div class="flex gap-3">
                <button onclick="cancelVerification()" class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                    Cancel
                </button>
                <button onclick="confirmVerification('${challengeId}')" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Confirm Completion
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('verification-answer').focus();
    return false; // Don't complete immediately, wait for verification
}

function confirmVerification(challengeId) {
    const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-75');
    const answer = document.getElementById('verification-answer').value.trim();
    
    if (answer.length < 3) {
        showNotification('⚠️ Please provide a meaningful answer to verify completion!', 'warning');
        return;
    }
    
    // Store verification answer
    if (!userProgress.verificationAnswers) {
        userProgress.verificationAnswers = {};
    }
    userProgress.verificationAnswers[challengeId] = {
        answer: answer,
        timestamp: new Date().toISOString()
    };
    
    modal.remove();
    
    // Now actually complete the challenge
    completeVerifiedChallenge(challengeId);
}

function cancelVerification() {
    const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-75');
    if (modal) modal.remove();
    showNotification('Challenge completion cancelled', 'info');
}

function completeVerifiedChallenge(challengeId) {
    // Get points from the challenge card
    const challengeCard = document.querySelector(`button[onclick="completeEnhancedChallenge('${challengeId}')"]`).closest('.enhanced-challenge-card');
    const pointsText = challengeCard.querySelector('.text-yellow-400').textContent;
    const points = parseInt(pointsText.replace('+', ''));
    
    // Add to completed challenges with timestamp
    userProgress.completedChallenges.add(challengeId);
    userProgress.points += points;
    userProgress.lastActivity = new Date().toISOString();
    
    // Store completion time for verification
    if (!userProgress.challengeCompletionTimes) {
        userProgress.challengeCompletionTimes = {};
    }
    userProgress.challengeCompletionTimes[challengeId] = new Date().toISOString();
    
    // Save progress
    saveUserProgress();
    
    // Show notification with points
    showNotification(`✅ Challenge verified and completed! +${points} points earned!`, 'success');
    
    // Add celebration effect
    celebrateChallenge(points);
    
    // Check for achievements
    checkAchievements();
    
    // Update displays immediately
    updatePointsDisplay();
    
    // Reload challenges to show completion state
    setTimeout(() => {
        loadDailyChallenges();
        updateDashboardStats();
    }, 1000);
}

function celebrateChallenge(points = 0) {
    // Enhanced celebration effect with particles and animations
    createCelebrationParticles();
    
    // Show floating points animation
    if (points > 0) {
        createFloatingPoints(points);
    }
    
    // Pulse effect on the achievement section
    const achievementSection = document.getElementById('achievements-section');
    if (achievementSection) {
        achievementSection.classList.add('celebration-pulse');
        setTimeout(() => {
            achievementSection.classList.remove('celebration-pulse');
        }, 1000);
    }
}

function createCelebrationParticles() {
    // Create confetti-like particles
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'celebration-particle';
            particle.innerHTML = ['🎉', '⭐', '🏆', '💪', '🔥'][Math.floor(Math.random() * 5)];
            particle.style.cssText = `
                position: fixed;
                top: 20%;
                left: ${Math.random() * 100}%;
                font-size: 2rem;
                z-index: 10000;
                pointer-events: none;
                animation: celebrationFloat 2s ease-out forwards;
            `;
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 2000);
        }, i * 100);
    }
}

function createFloatingPoints(points) {
    const pointsElement = document.createElement('div');
    pointsElement.textContent = `+${points} pts`;
    pointsElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 2rem;
        font-weight: bold;
        color: #ffd700;
        z-index: 10000;
        pointer-events: none;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        animation: floatingPoints 2s ease-out forwards;
    `;
    document.body.appendChild(pointsElement);
    
    setTimeout(() => {
        pointsElement.remove();
    }, 2000);
}

// Achievement System
function checkAchievements() {
    const achievements = [
        {
            id: 'first_challenge',
            title: '🎯 First Steps',
            description: 'Complete your first daily challenge',
            condition: () => userProgress.completedChallenges.size >= 1,
            points: 50
        },
        {
            id: 'challenge_streak_3',
            title: '🔥 Getting Consistent',
            description: 'Complete challenges on 3 different days',
            condition: () => userProgress.completedChallenges.size >= 3,
            points: 100
        },
        {
            id: 'challenge_streak_7',
            title: '⚡ Weekly Warrior',
            description: 'Complete challenges for 7 days',
            condition: () => userProgress.completedChallenges.size >= 7,
            points: 200
        },
        {
            id: 'points_100',
            title: '💯 Century Club',
            description: 'Earn 100 total points',
            condition: () => userProgress.points >= 100,
            points: 75
        },
        {
            id: 'points_500',
            title: '🏆 Point Master',
            description: 'Earn 500 total points',
            condition: () => userProgress.points >= 500,
            points: 150
        },
        {
            id: 'daily_complete',
            title: '🌟 Daily Dominator',
            description: 'Complete all 5 daily challenges in one day',
            condition: () => {
                const today = new Date().toDateString();
                const todaysChallenges = Array.from(userProgress.completedChallenges).filter(id => 
                    id.includes(getDayPrefix(new Date().getDay()))
                );
                return todaysChallenges.length >= 5;
            },
            points: 200
        }
    ];
    
    achievements.forEach(achievement => {
        if (!userProgress.completedAchievements.has(achievement.id) && achievement.condition()) {
            unlockAchievement(achievement);
        }
    });
}

function getDayPrefix(dayOfWeek) {
    const prefixes = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return prefixes[dayOfWeek];
}

function unlockAchievement(achievement) {
    // Mark as unlocked
    userProgress.completedAchievements.add(achievement.id);
    userProgress.points += achievement.points;
    saveUserProgress();
    
    // Show achievement notification
    setTimeout(() => {
        showAchievementModal(achievement);
    }, 1500);
}

function showAchievementModal(achievement) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gradient-to-br from-purple-800 to-blue-900 p-8 rounded-xl max-w-md mx-4 text-center transform scale-100 animate-pulse">
            <div class="text-6xl mb-4">${achievement.title.split(' ')[0]}</div>
            <h2 class="text-2xl font-bold text-white mb-2">Achievement Unlocked!</h2>
            <h3 class="text-xl text-yellow-400 mb-4">${achievement.title.slice(2)}</h3>
            <p class="text-white/80 mb-6">${achievement.description}</p>
            <div class="text-3xl text-green-400 font-bold mb-4">+${achievement.points} Points!</div>
            <button onclick="closeAchievementModal()" class="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all">
                Claim Reward
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-close after 10 seconds
    setTimeout(() => {
        closeAchievementModal();
    }, 10000);
}

function closeAchievementModal() {
    const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-75');
    if (modal) {
        modal.remove();
        updatePointsDisplay();
        updateDashboardStats();
    }
}

function updatePointsDisplay() {
    // Ensure currentUser exists and has points
    if (!currentUser) {
        console.log('❌ No currentUser - cannot update points display');
        return;
    }
    
    if (!currentUser.points) currentUser.points = 0;
    
    console.log('📊 Updating points display:', currentUser.points);
    
    // Update main points display in achievements section
    const totalPointsDisplay = document.getElementById('total-points-display');
    if (totalPointsDisplay) {
        totalPointsDisplay.textContent = currentUser.points.toLocaleString();
        totalPointsDisplay.classList.add('points-display');
    }
    
    // CRITICAL: Update header points display
    const headerPointsDisplay = document.getElementById('user-points');
    if (headerPointsDisplay) {
        headerPointsDisplay.textContent = `⭐ ${currentUser.points.toLocaleString()} pts`;
        console.log('✅ Header points updated:', headerPointsDisplay.textContent);
    }
    
    // Update other points displays
    const pointsElements = document.querySelectorAll('.points-display, [data-points]');
    pointsElements.forEach(el => {
        el.textContent = `${currentUser.points.toLocaleString()} pts`;
    });
    
    // Update welcome text with username
    const welcomeText = document.getElementById('welcome-text');
    if (welcomeText && currentUser) {
        const username = currentUser.username || currentUser.email?.split('@')[0] || 'User';
        welcomeText.textContent = `Welcome, ${username}`;
    }
    
    // Ensure currentUser is persisted
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    console.log('✅ Points display updated:', currentUser.points, 'for user:', currentUser?.email);
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

// Profile Management Functions
let profileData = null;

async function loadProfileData() {
    try {
        const response = await fetch('/api/profile', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            profileData = data.user;
            
            // Update profile form fields
            document.getElementById('profile-username').value = profileData.username || '';
            document.getElementById('profile-email').value = profileData.email || '';
            
            // Update profile picture
            updateProfilePictureDisplay(profileData.profile_picture_url);
            
            // Update statistics
            document.getElementById('stats-total-points').textContent = data.stats.total_points;
            document.getElementById('stats-habits-count').textContent = data.stats.habits_count;
            document.getElementById('stats-achievements-count').textContent = data.stats.achievements_count;
            document.getElementById('stats-days-active').textContent = data.stats.days_active;
            
            // Update points display in header
            document.getElementById('profile-points-display').textContent = `${data.stats.total_points} Points`;
            
        } else {
            throw new Error('Failed to load profile');
        }
    } catch (error) {
        console.error('Profile load error:', error);
        showNotification('Failed to load profile data', 'error');
    }
}

function updateProfilePictureDisplay(profilePictureUrl) {
    const profilePicElement = document.getElementById('current-profile-pic');
    const removeButton = document.getElementById('remove-profile-pic');
    
    if (profilePictureUrl && profilePictureUrl.trim()) {
        // Test image loading before displaying
        const testImg = new Image();
        testImg.onload = function() {
            profilePicElement.innerHTML = `
                <img src="${profilePictureUrl}" alt="Profile Picture" class="w-full h-full object-cover rounded-full">
            `;
            if (removeButton) removeButton.classList.remove('hidden');
        };
        testImg.onerror = function() {
            console.log('❌ Profile picture failed to load in display:', profilePictureUrl);
            profilePicElement.innerHTML = `
                <i class="fas fa-user text-white text-2xl"></i>
            `;
            if (removeButton) removeButton.classList.add('hidden');
            
            // Clear broken URL from user data
            if (currentUser && currentUser.profile_picture_url === profilePictureUrl) {
                currentUser.profile_picture_url = null;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
        };
        testImg.src = profilePictureUrl;
    } else {
        profilePicElement.innerHTML = `
            <i class="fas fa-user text-white text-2xl"></i>
        `;
        if (removeButton) removeButton.classList.add('hidden');
    }
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const username = document.getElementById('profile-username').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    
    if (!username || !email) {
        showNotification('Username and email are required', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify({ username, email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Profile updated successfully! 🎉', 'success');
            // Update current user data
            if (currentUser) {
                currentUser.username = username;
                currentUser.email = email;
                // Update header display
                updateHeaderProfilePicture(currentUser.profile_picture_url, username);
            }
        } else {
            showNotification(data.error || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showNotification('Failed to update profile', 'error');
    }
}

async function handlePasswordChange(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('All password fields are required', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/profile/password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify({
                currentPassword,
                newPassword,
                confirmPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Password updated successfully! 🔒', 'success');
            // Clear form fields
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-new-password').value = '';
        } else {
            showNotification(data.error || 'Failed to update password', 'error');
        }
    } catch (error) {
        console.error('Password change error:', error);
        showNotification('Failed to update password', 'error');
    }
}

async function handleProfilePicture(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Invalid file type. Only JPEG, PNG, and WebP are allowed', 'error');
        input.value = '';
        return;
    }
    
    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
        showNotification('File too large. Maximum size is 2MB', 'error');
        input.value = '';
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('profilePicture', file);
        
        showNotification('Uploading profile picture...', 'info');
        
        if (isOnline()) {
            try {
                console.log('🌐 Syncing profile picture to API...');
                
                // Try API upload first
                const formData = new FormData();
                formData.append('profilePicture', file);
                
                const response = await fetch('/api/profile/picture', {
                    method: 'POST',
                    headers: {
                        'x-session-id': sessionId
                    },
                    body: formData
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showNotification('Profile picture updated successfully! 📷', 'success');
                    updateProfilePictureDisplay(data.profilePictureUrl);
                    if (currentUser) {
                        currentUser.profile_picture_url = data.profilePictureUrl;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        updateHeaderProfilePicture(data.profilePictureUrl, currentUser.username || currentUser.email.split('@')[0]);
                    }
                    return;
                }
            } catch (apiError) {
                console.log('❌ API upload failed, using localStorage fallback');
            }
        }
        
        // Fallback: Convert image to base64 for localStorage storage
        console.log('💾 Using localStorage for profile picture');
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Image = e.target.result;
            
            // Save to localStorage and update currentUser
            if (currentUser) {
                currentUser.profile_picture_url = base64Image;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                showNotification('Profile picture updated successfully! 📷 (Offline)', 'success');
                updateProfilePictureDisplay(base64Image);
                
                // Update header profile picture
                const username = currentUser.username || currentUser.email.split('@')[0];
                updateHeaderProfilePicture(base64Image, username);
            }
        };
        
        reader.onerror = function() {
            showNotification('Failed to process profile picture', 'error');
        };
        
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Profile picture upload error:', error);
        showNotification('Failed to upload profile picture', 'error');
    }
    
    // Clear the input
    input.value = '';
}

async function removeProfilePicture() {
    try {
        const response = await fetch('/api/profile/picture', {
            method: 'DELETE',
            headers: {
                'x-session-id': sessionId
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Profile picture removed successfully! 🗑️', 'success');
            updateProfilePictureDisplay(null);
            if (profileData) {
                profileData.profile_picture_url = null;
            }
            // Update header profile picture
            if (currentUser) {
                currentUser.profile_picture_url = null;
                updateHeaderProfilePicture(null, currentUser.username || currentUser.email.split('@')[0]);
            }
        } else {
            showNotification(data.error || 'Failed to remove profile picture', 'error');
        }
    } catch (error) {
        console.error('Profile picture removal error:', error);
        showNotification('Failed to remove profile picture', 'error');
    }
}

function confirmDeleteAccount() {
    if (confirm('⚠️ Are you sure you want to delete your account?\n\nThis action cannot be undone and will permanently delete:\n• All your habits and progress\n• Your achievements and points\n• Your uploaded media\n• All account data\n\nType "DELETE" to confirm:')) {
        const confirmation = prompt('Type "DELETE" to confirm account deletion:');
        if (confirmation === 'DELETE') {
            deleteAccount();
        } else {
            showNotification('Account deletion cancelled', 'info');
        }
    }
}

async function deleteAccount() {
    try {
        const response = await fetch('/api/profile/delete', {
            method: 'DELETE',
            headers: {
                'x-session-id': sessionId
            }
        });
        
        if (response.ok) {
            showNotification('Account deleted successfully. Goodbye! 👋', 'success');
            setTimeout(() => {
                logout();
            }, 2000);
        } else {
            const data = await response.json();
            showNotification(data.error || 'Failed to delete account', 'error');
        }
    } catch (error) {
        console.error('Account deletion error:', error);
        showNotification('Failed to delete account', 'error');
    }
}

// CRITICAL FIX: Enhanced Header Profile Picture Management with error handling
function updateHeaderProfilePicture(profilePictureUrl, username) {
    console.log('🖼️ Updating header profile picture:', profilePictureUrl);
    
    const profilePictureElement = document.getElementById('header-profile-pic');
    const usernameElement = document.getElementById('welcome-text');
    
    // Update username display
    if (usernameElement) {
        usernameElement.textContent = `Welcome, ${username || 'User'}`;
    }
    
    // Handle profile picture
    if (profilePictureElement) {
        if (profilePictureUrl && profilePictureUrl.trim()) {
            // Create a new image to test loading
            const testImg = new Image();
            
            testImg.onload = function() {
                // Image loaded successfully
                profilePictureElement.innerHTML = `
                    <img src="${profilePictureUrl}" alt="Profile" class="w-full h-full object-cover rounded-full">
                `;
                console.log('✅ Profile picture loaded successfully');
            };
            
            testImg.onerror = function() {
                // Image failed to load - use attractive fallback
                console.log('❌ Profile picture failed to load, using fallback');
                setProfilePictureFallback(profilePictureElement, username);
            };
            
            // Start loading the image
            testImg.src = profilePictureUrl;
        } else {
            // No URL provided - use attractive fallback
            console.log('📷 No profile picture URL, using fallback');
            setProfilePictureFallback(profilePictureElement, username);
        }
    }
}

// Helper function for attractive profile picture fallback
function setProfilePictureFallback(element, username) {
    // Create attractive gradient avatar with initials
    const initials = username ? username.charAt(0).toUpperCase() : 'U';
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];
    const colorIndex = (username || 'U').charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];
    
    // Create canvas for gradient avatar
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 100, 100);
    gradient.addColorStop(0, bgColor);
    gradient.addColorStop(1, bgColor + '80');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 100, 100);
    
    // Add initials
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 50, 50);
    
    // Convert to data URL and set as image source
    const dataUrl = canvas.toDataURL();
    element.innerHTML = `
        <img src="${dataUrl}" alt="Profile" class="w-full h-full object-cover rounded-full">
    `;
}

// Enhanced show app function to load user profile data
function showApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('signup-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    
    // Update header with user data
    if (currentUser) {
        updateHeaderProfilePicture(currentUser.profile_picture_url, currentUser.username || currentUser.email.split('@')[0]);
        document.getElementById('user-points').textContent = `⭐ ${currentUser.points || 0} pts`;
    }
}

// Modern Admin Dashboard Functions
let currentUsers = [];
let selectedUser = null;
let selectedAdminMedia = [];

async function loadAdminData() {
    try {
        // Load users and stats
        await Promise.all([
            loadAdminUsers(),
            loadAdminStats()
        ]);
    } catch (error) {
        console.error('Error loading admin data:', error);
        showNotification('Failed to load admin data', 'error');
    }
}

async function loadAdminUsers() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUsers = data.users || [];
            renderUserGrid(currentUsers);
            
            // Setup admin search and filter event listeners after DOM is updated
            setupAdminEventListeners();
        } else {
            throw new Error('Failed to load users');
        }
    } catch (error) {
        console.error('Error loading admin users:', error);
        document.getElementById('admin-users-grid').innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-white/60">Failed to load users</p>
                <button onclick="loadAdminUsers()" class="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded">
                    Try Again
                </button>
            </div>
        `;
    }
}

async function loadAdminStats() {
    try {
        const [usersResponse, mediaResponse] = await Promise.all([
            fetch('/api/admin/users', { headers: { 'x-session-id': sessionId } }),
            fetch('/api/admin/media', { headers: { 'x-session-id': sessionId } })
        ]);

        if (usersResponse.ok) {
            const userData = await usersResponse.json();
            const totalUsers = userData.users?.length || 0;
            const onlineUsers = userData.users?.filter(user => isUserOnline(user)).length || 0;
            
            document.getElementById('admin-total-users').textContent = totalUsers;
            document.getElementById('admin-online-users').textContent = onlineUsers;
        }

        if (mediaResponse.ok) {
            const mediaData = await mediaResponse.json();
            const totalMedia = mediaData.media?.length || 0;
            const flaggedMedia = mediaData.media?.filter(media => media.is_flagged).length || 0;
            
            document.getElementById('admin-total-media').textContent = totalMedia;
            document.getElementById('admin-flagged-media').textContent = flaggedMedia;
        }
    } catch (error) {
        console.error('Error loading admin stats:', error);
    }
}

function renderUserGrid(users) {
    const grid = document.getElementById('admin-users-grid');
    
    if (!users || users.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-users text-white/30 text-4xl mb-4"></i>
                <p class="text-white/60">No users found</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = users.map(user => createUserCard(user)).join('');
}

function createUserCard(user) {
    const isOnline = isUserOnline(user);
    const statusColor = isOnline ? 'text-green-400' : 'text-gray-400';
    const statusIcon = isOnline ? 'fas fa-circle' : 'far fa-circle';
    const statusText = isOnline ? 'Online' : 'Offline';
    
    const displayName = user.username || user.email.split('@')[0];
    const profilePic = user.profile_picture_url 
        ? `<img src="${user.profile_picture_url}" alt="Profile" class="w-full h-full object-cover rounded-full">`
        : `<i class="fas fa-user text-white text-lg"></i>`;

    return `
        <div class="glass-card p-4 cursor-pointer hover:bg-white/5 transition-all" onclick="openUserDetail('${user.id}')">
            <div class="flex items-center space-x-3 mb-3">
                <div class="relative">
                    <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        ${profilePic}
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-4 h-4 ${isOnline ? 'bg-green-500' : 'bg-gray-500'} rounded-full border-2 border-gray-900"></div>
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="text-white font-semibold truncate">${displayName}</h4>
                    <p class="text-white/60 text-sm truncate">${user.email}</p>
                </div>
            </div>
            
            <div class="flex items-center justify-between text-sm mb-2">
                <span class="${statusColor}">
                    <i class="${statusIcon} text-xs mr-1"></i>
                    ${statusText}
                </span>
                <span class="text-white/70">
                    ${user.points || 0} pts
                </span>
            </div>
            
            <div class="flex items-center justify-between mb-3">
                <span class="px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-600 text-purple-100' : 'bg-blue-600 text-blue-100'} font-semibold">
                    ${user.role === 'admin' ? '👑 ADMIN' : '👤 USER'}
                </span>
                <span class="text-xs text-white/50">
                    ID: ${user.id}
                </span>
            </div>
            
            <div class="flex items-center justify-between text-xs text-white/50">
                <span>${user.habits_count || 0} habits</span>
                <span>${user.media_count || 0} files</span>
            </div>
        </div>
    `;
}

function isUserOnline(user) {
    // Simple online detection - you could enhance this with real-time data
    // For now, consider users online if they've been active in the last 15 minutes
    if (!user.updated_at) return false;
    
    const lastActivity = new Date(user.updated_at);
    const now = new Date();
    const diffMinutes = (now - lastActivity) / (1000 * 60);
    
    return diffMinutes < 15;
}

async function openUserDetail(userId) {
    selectedUser = currentUsers.find(user => user.id === userId);
    if (!selectedUser) return;

    // Show modal
    document.getElementById('user-detail-modal').classList.remove('hidden');
    
    // Populate user info
    populateUserDetail(selectedUser);
    
    // Load user's media
    await loadUserMedia(userId);
}

function populateUserDetail(user) {
    const displayName = user.username || user.email.split('@')[0];
    const isOnline = isUserOnline(user);
    
    // Update avatar
    const avatar = document.getElementById('user-detail-avatar');
    if (user.profile_picture_url) {
        avatar.innerHTML = `<img src="${user.profile_picture_url}" alt="Profile" class="w-full h-full object-cover rounded-full">`;
    } else {
        avatar.innerHTML = `<i class="fas fa-user text-white text-2xl"></i>`;
    }
    
    // Update info
    document.getElementById('user-detail-name').textContent = displayName;
    document.getElementById('user-detail-email').textContent = user.email;
    document.getElementById('user-detail-points').textContent = user.points || 0;
    document.getElementById('user-detail-habits').textContent = user.habits_count || 0;
    document.getElementById('user-detail-media-count').textContent = user.media_count || 0;
    
    // Update status
    const statusElement = document.getElementById('user-detail-status');
    statusElement.innerHTML = `
        <span class="px-2 py-1 ${isOnline ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'} text-xs rounded-full">
            <i class="fas fa-circle mr-1"></i>${isOnline ? 'Online' : 'Offline'}
        </span>
    `;
    
    // Update joined date
    if (user.created_at) {
        const joinDate = new Date(user.created_at).toLocaleDateString();
        document.getElementById('user-detail-joined').textContent = joinDate;
    }
    
    // Update suspend/unsuspend button (handle missing column gracefully)
    const toggleBtn = document.getElementById('toggle-user-btn');
    if (toggleBtn) {
        const isSuspended = user.is_suspended || false;
        if (isSuspended) {
            toggleBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Unsuspend Account';
            toggleBtn.className = 'w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors';
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-ban mr-2"></i>Suspend Account';
            toggleBtn.className = 'w-full btn-secondary';
        }
    }
    
    // Load admin notes (handle missing column gracefully)
    const notesTextarea = document.getElementById('user-admin-notes');
    if (notesTextarea) {
        notesTextarea.value = user.admin_notes || '';
    }
}

async function loadUserMedia(userId) {
    try {
        const response = await fetch(`/api/admin/users/${userId}/media`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            renderUserMedia(data.media || []);
        } else {
            throw new Error('Failed to load user media');
        }
    } catch (error) {
        console.error('Error loading user media:', error);
        document.getElementById('user-media-grid').innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-white/60">Failed to load media</p>
            </div>
        `;
    }
}

function renderUserMedia(media) {
    const grid = document.getElementById('user-media-grid');
    const noMediaState = document.getElementById('no-media-state');
    
    // Store media data globally for the media viewer
    window.currentMediaData = media;
    
    if (!media || media.length === 0) {
        grid.classList.add('hidden');
        noMediaState.classList.remove('hidden');
        return;
    }
    
    grid.classList.remove('hidden');
    noMediaState.classList.add('hidden');
    
    grid.innerHTML = media.map(item => createMediaCard(item)).join('');
}

function createMediaCard(media) {
    const isImage = media.media_type === 'image' || media.file_type?.startsWith('image/') || media.type === 'image';
    const isVideo = media.media_type === 'video' || media.file_type?.startsWith('video/') || media.type === 'video';
    const isFlagged = media.is_flagged;
    const fileName = media.display_name || media.original_name || media.filename || 'Unknown file';
    const fileSize = media.size_display || '';
    
    // Debug log to see what data we're getting
    console.log('Creating media card for:', { 
        id: media.id, 
        fileName, 
        mediaType: media.media_type, 
        fileType: media.file_type,
        url: media.url,
        preview_url: media.preview_url 
    });
    
    // Use preview_url if available, otherwise try url, otherwise show placeholder
    const mediaUrl = media.preview_url || media.url;
    
    return `
        <div class="relative group">
            <div class="aspect-square bg-gray-800 rounded-lg overflow-hidden ${isFlagged ? 'ring-2 ring-red-500' : ''}">
                ${isImage ? 
                    mediaUrl ?
                        `<img src="${mediaUrl}" alt="${fileName}" class="w-full h-full object-cover" 
                              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" 
                              onload="console.log('✅ Image loaded:', '${fileName}');"
                              title="${fileName} (${fileSize})">
                         <div class="w-full h-full flex flex-col items-center justify-center text-center p-2" style="display:none;">
                            <i class="fas fa-image text-white/50 text-2xl mb-2"></i>
                            <span class="text-white/70 text-xs">${fileName}</span>
                            <span class="text-gray-400 text-xs mt-1">${fileSize}</span>
                            <span class="text-red-400 text-xs mt-1">Image load failed</span>
                         </div>`
                    :
                        `<div class="w-full h-full flex flex-col items-center justify-center text-center p-2">
                            <i class="fas fa-image text-white/50 text-2xl mb-2"></i>
                            <span class="text-white/70 text-xs">${fileName}</span>
                            <span class="text-gray-400 text-xs mt-1">${fileSize}</span>
                            <span class="text-yellow-400 text-xs mt-1">No preview available</span>
                         </div>`
                 : isVideo ?
                    `<div class="w-full h-full flex flex-col items-center justify-center text-center p-2">
                        <i class="fas fa-play-circle text-white/50 text-3xl mb-2"></i>
                        <span class="text-white/70 text-xs">${fileName}</span>
                        <span class="text-gray-400 text-xs mt-1">${fileSize}</span>
                        <span class="text-blue-400 text-xs mt-1">Video File</span>
                     </div>`
                 :
                    `<div class="w-full h-full flex flex-col items-center justify-center text-center p-2">
                        <i class="fas fa-file text-white/50 text-2xl mb-2"></i>
                        <span class="text-white/70 text-xs">${fileName}</span>
                        <span class="text-gray-400 text-xs mt-1">${fileSize}</span>
                        <span class="text-gray-400 text-xs mt-1">${media.media_type || 'File'}</span>
                    </div>`
                }
                
                <!-- Overlay -->
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div class="flex space-x-2">
                        <button onclick="viewMedia('${media.id}')" class="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full" title="View">
                            <i class="fas fa-eye text-sm"></i>
                        </button>
                        <button onclick="toggleMediaFlag('${media.id}')" class="p-2 ${isFlagged ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white rounded-full" title="${isFlagged ? 'Unflag' : 'Flag'}">
                            <i class="fas fa-flag text-sm"></i>
                        </button>
                        <button onclick="downloadMedia('${media.id}')" class="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full" title="Download">
                            <i class="fas fa-download text-sm"></i>
                        </button>
                        <button onclick="deleteMedia('${media.id}')" class="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full" title="Delete">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Selection checkbox -->
                <div class="absolute top-2 left-2">
                    <input type="checkbox" class="media-select" data-media-id="${media.id}" onchange="toggleMediaSelection('${media.id}')">
                </div>
                
                ${isFlagged ? '<div class="absolute top-2 right-2 text-red-500"><i class="fas fa-flag text-sm"></i></div>' : ''}
            </div>
            
            <div class="mt-2 text-xs text-white/70">
                <div class="truncate" title="${fileName}">${fileName}</div>
                <div class="text-white/50 mt-1">${media.media_type || 'progress'} • ${fileSize}</div>
                <div class="text-white/40 text-xs">Uploaded: ${new Date(media.uploaded_at).toLocaleDateString()}</div>
            </div>
        </div>
    `;
}

function closeUserDetailModal() {
    document.getElementById('user-detail-modal').classList.add('hidden');
    selectedUser = null;
    selectedAdminMedia = [];
}

function refreshAdminData() {
    showNotification('Refreshing admin data...', 'info');
    loadAdminData();
}

// Media management functions
async function viewMedia(mediaId) {
    try {
        showNotification('Opening media viewer...', 'info');
        
        // Find the media item in the current loaded data for metadata
        let mediaItem = null;
        if (window.currentMediaData) {
            mediaItem = window.currentMediaData.find(item => item.id === mediaId);
        }
        
        console.log('📸 Creating media viewer for:', mediaId, mediaItem);
        
        // Fetch the image with proper authentication headers and create blob URL
        let mediaUrl = '';
        try {
            const response = await fetch(`/api/media/file/${mediaId}`, {
                headers: { 'x-session-id': sessionId }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                mediaUrl = URL.createObjectURL(blob);
                console.log('📸 Created blob URL for image:', mediaUrl);
            } else {
                throw new Error(`Failed to load image: ${response.status}`);
            }
        } catch (fetchError) {
            console.error('📸 Error fetching image:', fetchError);
            mediaUrl = `/api/media/file/${mediaId}`; // Fallback to direct URL
        }
        
        // Create media viewer modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 flex items-center justify-center';
        modal.style.cssText = 'background: rgba(0, 0, 0, 0.9); z-index: 9999;';
        modal.onclick = (e) => {
            if (e.target === modal) {
                // Clean up blob URL to prevent memory leaks
                if (mediaUrl && mediaUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(mediaUrl);
                }
                document.body.removeChild(modal);
            }
        };
        
        modal.innerHTML = `
            <div class="relative mx-4" style="max-width: 90vw; max-height: 90vh;">
                <!-- Close button -->
                <button onclick="
                    const modal = this.closest('[data-modal]');
                    const img = modal.querySelector('img');
                    if (img && img.src.startsWith('blob:')) {
                        URL.revokeObjectURL(img.src);
                    }
                    modal.remove();
                " 
                        class="absolute top-4 right-4 text-white rounded-full p-2"
                        style="z-index: 10000; background: rgba(0, 0, 0, 0.7);">
                    <i class="fas fa-times text-xl"></i>
                </button>
                
                <!-- Media content -->
                <div class="bg-gray-800 rounded-lg overflow-hidden">
                    <div class="flex items-center justify-center" style="min-height: 400px;">
                        <img src="${mediaUrl}" 
                             alt="${mediaItem?.display_name || 'Media'}" 
                             class="object-contain"
                             style="max-width: 100%; max-height: 70vh;"
                             onerror="console.error('📸 Image failed to load:', this.src); this.style.display='none'; this.nextElementSibling.style.display='flex';"
                             onload="console.log('📸 Image loaded successfully in modal');">
                        <div class="flex flex-col items-center justify-center p-8" style="display:none;">
                            <i class="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
                            <p class="text-white text-lg">Failed to load media</p>
                            <p class="text-gray-400">${mediaItem?.display_name || 'Unknown file'}</p>
                            <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Reload Page</button>
                        </div>
                    </div>
                    
                    ${mediaItem ? `
                        <div class="p-4 bg-gray-700">
                            <h3 class="text-white font-semibold text-lg mb-2">${mediaItem.display_name}</h3>
                            <div class="grid grid-cols-2 gap-4 text-sm text-gray-300">
                                <div><strong>Type:</strong> ${mediaItem.media_type || 'Unknown'}</div>
                                <div><strong>Size:</strong> ${mediaItem.size_display || 'Unknown'}</div>
                                <div><strong>Uploaded:</strong> ${new Date(mediaItem.uploaded_at).toLocaleDateString()}</div>
                                <div><strong>User:</strong> ${mediaItem.email || 'Unknown'}</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Add data attribute for easy identification and removal
        modal.setAttribute('data-modal', 'media-viewer');
        
        // Add debugging
        console.log('📸 Creating media viewer modal for:', mediaId);
        console.log('📸 Media URL:', mediaUrl);
        console.log('📸 Media Item:', mediaItem);
        
        document.body.appendChild(modal);
        
        // Add session ID header for authenticated image requests
        if (sessionId) {
            const img = modal.querySelector('img');
            if (img) {
                // For authenticated requests, we might need to handle this differently
                console.log('📸 Image element created, session ID available:', !!sessionId);
            }
        }
        
    } catch (error) {
        console.error('Error opening media viewer:', error);
        showNotification('Failed to open media viewer', 'error');
    }
}

async function toggleMediaFlag(mediaId) {
    try {
        const response = await fetch(`/api/admin/media/${mediaId}/flag`, {
            method: 'POST',
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            showNotification('Media flag status updated', 'success');
            // Reload user media
            if (selectedUser) {
                await loadUserMedia(selectedUser.id);
            }
        } else {
            throw new Error('Failed to update flag status');
        }
    } catch (error) {
        console.error('Error toggling media flag:', error);
        showNotification('Failed to update flag status', 'error');
    }
}

async function downloadMedia(mediaId) {
    try {
        const response = await fetch(`/api/admin/media/${mediaId}/download`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `media-${mediaId}`;
            a.click();
            window.URL.revokeObjectURL(url);
        } else {
            throw new Error('Failed to download media');
        }
    } catch (error) {
        console.error('Error downloading media:', error);
        showNotification('Failed to download media', 'error');
    }
}

async function deleteMedia(mediaId) {
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
            // Reload user media
            if (selectedUser) {
                await loadUserMedia(selectedUser.id);
            }
        } else {
            throw new Error('Failed to delete media');
        }
    } catch (error) {
        console.error('Error deleting media:', error);
        showNotification('Failed to delete media', 'error');
    }
}

function toggleMediaSelection(mediaId) {
    const index = selectedAdminMedia.indexOf(mediaId);
    if (index > -1) {
        selectedAdminMedia.splice(index, 1);
    } else {
        selectedAdminMedia.push(mediaId);
    }
}

function selectAllMedia() {
    const checkboxes = document.querySelectorAll('.media-select');
    const allSelected = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = !allSelected;
        const mediaId = checkbox.dataset.mediaId;
        if (!allSelected && !selectedAdminMedia.includes(mediaId)) {
            selectedAdminMedia.push(mediaId);
        } else if (allSelected) {
            const index = selectedAdminMedia.indexOf(mediaId);
            if (index > -1) selectedAdminMedia.splice(index, 1);
        }
    });
}

// Missing Admin User Management Functions
async function viewUserProfile() {
    if (!selectedUser) {
        showNotification('No user selected', 'error');
        return;
    }
    
    // Create a detailed profile view modal or redirect
    showNotification(`Viewing full profile for ${selectedUser.username || selectedUser.email}`, 'info');
    
    // For now, we'll show detailed user info in a simple alert
    // In a full implementation, this would open a comprehensive user profile view
    const profileInfo = `
        User Profile Details:
        Name: ${selectedUser.username || 'Not Set'}
        Email: ${selectedUser.email}
        Status: ${selectedUser.is_suspended ? 'Suspended' : 'Active'}
        Created: ${selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : 'Unknown'}
        Last Login: ${selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}
        Total Points: ${selectedUser.total_points || 0}
        Habit Count: ${selectedUser.habit_count || 0}
        Media Count: ${selectedUser.media_count || 0}
        Admin Notes: ${selectedUser.admin_notes || 'None'}
    `;
    
    // Show in a better modal later, for now use alert
    alert(profileInfo);
}

async function sendUserMessage() {
    if (!selectedUser) {
        showNotification('No user selected', 'error');
        return;
    }
    
    const message = prompt(`Send message to ${selectedUser.username || selectedUser.email}:`);
    if (!message || message.trim() === '') {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/users/message', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-session-id': sessionId 
            },
            body: JSON.stringify({
                userId: selectedUser.id,
                message: message.trim()
            })
        });
        
        if (response.ok) {
            showNotification('Message sent successfully', 'success');
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Failed to send message - feature not implemented yet', 'error');
    }
}

async function resetUserPassword() {
    if (!selectedUser) {
        showNotification('No user selected', 'error');
        return;
    }
    
    if (!confirm(`Reset password for ${selectedUser.username || selectedUser.email}? They will receive an email with reset instructions.`)) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/users/reset-password', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-session-id': sessionId 
            },
            body: JSON.stringify({
                userId: selectedUser.id
            })
        });
        
        if (response.ok) {
            showNotification('Password reset email sent', 'success');
        } else {
            throw new Error('Failed to reset password');
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        showNotification('Failed to reset password - feature not implemented yet', 'error');
    }
}

async function toggleUserStatus() {
    if (!selectedUser) {
        showNotification('No user selected', 'error');
        return;
    }
    
    const action = selectedUser.is_suspended ? 'unsuspend' : 'suspend';
    const confirmMsg = `${action.charAt(0).toUpperCase() + action.slice(1)} user ${selectedUser.username || selectedUser.email}?`;
    
    if (!confirm(confirmMsg)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/${selectedUser.id}/toggle-status`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-session-id': sessionId 
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            selectedUser.is_suspended = data.suspended;
            
            // Update the button text
            const toggleBtn = document.getElementById('toggle-user-btn');
            if (toggleBtn) {
                if (selectedUser.is_suspended) {
                    toggleBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Unsuspend Account';
                    toggleBtn.className = 'w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors';
                } else {
                    toggleBtn.innerHTML = '<i class="fas fa-ban mr-2"></i>Suspend Account';
                    toggleBtn.className = 'w-full btn-secondary';
                }
            }
            
            // Update status display
            populateUserDetail(selectedUser);
            
            showNotification(`User ${action}ed successfully`, 'success');
            
            // Refresh user grid
            loadAdminUsers();
        } else if (response.status === 501) {
            // Feature not available due to missing database columns
            const errorData = await response.json();
            showNotification(errorData.error || 'Feature requires database migration', 'error');
        } else {
            throw new Error(`Failed to ${action} user`);
        }
    } catch (error) {
        console.error(`Error ${action}ing user:`, error);
        showNotification(`Failed to ${action} user`, 'error');
    }
}

async function confirmDeleteUser() {
    if (!selectedUser) {
        showNotification('No user selected', 'error');
        return;
    }
    
    const userName = selectedUser.username || selectedUser.email;
    const confirmText = `DELETE ${userName.toUpperCase()}`;
    const userInput = prompt(`⚠️ DANGER: This will permanently delete ALL user data including:\n\n• Profile and account\n• All habits and progress\n• All uploaded media\n• All achievement data\n• All social connections\n\nType "${confirmText}" to confirm deletion:`);
    
    if (userInput !== confirmText) {
        showNotification('User deletion cancelled', 'info');
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
            method: 'DELETE',
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            showNotification('User deleted successfully', 'success');
            closeUserDetailModal();
            loadAdminUsers();
        } else {
            const errorData = await response.json();
            console.error('Delete user error:', errorData);
            showNotification(errorData.error || 'Failed to delete user', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Failed to delete user', 'error');
    }
}

async function saveUserNotes() {
    if (!selectedUser) {
        showNotification('No user selected', 'error');
        return;
    }
    
    const notesTextarea = document.getElementById('user-admin-notes');
    const notes = notesTextarea.value.trim();
    
    try {
        const response = await fetch(`/api/admin/users/${selectedUser.id}/notes`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-session-id': sessionId 
            },
            body: JSON.stringify({ notes })
        });
        
        if (response.ok) {
            selectedUser.admin_notes = notes;
            showNotification('Admin notes saved successfully', 'success');
        } else if (response.status === 501) {
            // Feature not available due to missing database columns
            const errorData = await response.json();
            showNotification(errorData.error || 'Feature requires database migration', 'error');
        } else {
            throw new Error('Failed to save notes');
        }
    } catch (error) {
        console.error('Error saving admin notes:', error);
        showNotification('Failed to save notes - feature not implemented yet', 'error');
    }
}

async function bulkDeleteMedia() {
    if (selectedAdminMedia.length === 0) {
        showNotification('No media selected', 'error');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedAdminMedia.length} selected media files? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const deletePromises = selectedAdminMedia.map(mediaId => 
            fetch(`/api/admin/media/${mediaId}`, {
                method: 'DELETE',
                headers: { 'x-session-id': sessionId }
            })
        );
        
        await Promise.all(deletePromises);
        showNotification(`${selectedAdminMedia.length} media files deleted successfully`, 'success');
        
        selectedAdminMedia = [];
        if (selectedUser) {
            await loadUserMedia(selectedUser.id);
        }
    } catch (error) {
        console.error('Error bulk deleting media:', error);
        showNotification('Failed to delete some media files', 'error');
    }
}

// Search and filter functions - Event listeners will be attached when admin section loads
function setupAdminEventListeners() {
    const searchInput = document.getElementById('admin-search-users');
    const filterSelect = document.getElementById('admin-filter-users');
    
    if (searchInput) {
        // Remove any existing listeners to prevent duplicates
        searchInput.removeEventListener('input', filterUsers);
        searchInput.addEventListener('input', filterUsers);
    }
    
    if (filterSelect) {
        // Remove any existing listeners to prevent duplicates
        filterSelect.removeEventListener('change', filterUsers);
        filterSelect.addEventListener('change', filterUsers);
    }
}

function filterUsers() {
    const searchTerm = document.getElementById('admin-search-users')?.value.toLowerCase() || '';
    const filterType = document.getElementById('admin-filter-users')?.value || 'all';
    
    let filteredUsers = currentUsers.filter(user => {
        const matchesSearch = !searchTerm || 
            user.username?.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm);
            
        const matchesFilter = filterType === 'all' ||
            (filterType === 'online' && isUserOnline(user)) ||
            (filterType === 'offline' && !isUserOnline(user)) ||
            (filterType === 'flagged' && user.is_flagged);
            
        return matchesSearch && matchesFilter;
    });
    
    renderUserGrid(filteredUsers);
}

// WORKING HABIT SYSTEM - DIRECT AND SIMPLE
function workingCreateHabit(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('habit-name');
    if (!nameInput || !nameInput.value.trim()) return;
    
    // Get existing habits
    let habits = JSON.parse(localStorage.getItem('strivetrack_habits') || '[]');
    
    // Create new habit
    const habit = {
        id: Date.now().toString(),
        name: nameInput.value.trim(),
        created: new Date().toISOString()
    };
    
    // Save habit
    habits.push(habit);
    localStorage.setItem('strivetrack_habits', JSON.stringify(habits));
    
    // Show habit immediately
    workingDisplayHabits();
    
    // Close modal
    const modal = document.getElementById('create-habit-modal');
    if (modal) modal.classList.add('hidden');
    
    // Reset form
    nameInput.value = '';
    
    // Show notification
    showNotification('Habit created successfully!', 'success');
}

function workingDisplayHabits() {
    const container = document.getElementById('habits-container');
    const emptyState = document.getElementById('habits-empty-state');
    
    if (!container) return;
    
    let habits = JSON.parse(localStorage.getItem('strivetrack_habits') || '[]');
    
    container.innerHTML = '';
    
    if (habits.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    habits.forEach(habit => {
        const habitDiv = document.createElement('div');
        habitDiv.className = 'habit-card';
        habitDiv.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-white font-semibold text-lg">${habit.name}</h3>
                    <p class="text-white/60 text-sm">Created: ${new Date(habit.created).toLocaleDateString()}</p>
                </div>
                <button onclick="workingDeleteHabit('${habit.id}')" class="btn-danger">Delete</button>
            </div>
        `;
        container.appendChild(habitDiv);
    });
}

function workingDeleteHabit(habitId) {
    let habits = JSON.parse(localStorage.getItem('strivetrack_habits') || '[]');
    habits = habits.filter(h => h.id !== habitId);
    localStorage.setItem('strivetrack_habits', JSON.stringify(habits));
    workingDisplayHabits();
}

// Override form handler
function setupWorkingHabits() {
    const form = document.getElementById('create-habit-form');
    if (form) {
        form.onsubmit = workingCreateHabit;
    }
    workingDisplayHabits();
}
