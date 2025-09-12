// StriveTrack Simple Cloud-Enabled Frontend JavaScript
// Using vanilla JS without ES modules for compatibility

console.log('🚀 Loading StriveTrack Cloud app...');

// Supabase configuration (will be replaced with environment variables)
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};

// Global state
let currentUser = null;
let currentProfile = null;
let isOnline = navigator.onLine;
let syncQueue = [];

// Simple storage service
const StorageService = {
    save: function(key, data) {
        try {
            localStorage.setItem(`strivetrack_${key}`, JSON.stringify(data));
            console.log(`✅ Saved ${key} to localStorage`);
        } catch (error) {
            console.error(`❌ Error saving ${key}:`, error);
        }
    },
    
    load: function(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(`strivetrack_${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`❌ Error loading ${key}:`, error);
            return defaultValue;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(`strivetrack_${key}`);
            console.log(`🗑️ Removed ${key} from localStorage`);
        } catch (error) {
            console.error(`❌ Error removing ${key}:`, error);
        }
    }
};

// Simple auth service
const AuthService = {
    isAuthenticated: function() {
        return !!currentUser;
    },
    
    signIn: async function(email, password) {
        // Simulate sign in (replace with real Supabase auth)
        console.log('🔐 Simulating sign in for:', email);
        
        // Simulate successful login
        currentUser = {
            id: 'demo_user_123',
            email: email,
            created_at: new Date().toISOString()
        };
        
        currentProfile = {
            id: currentUser.id,
            email: email,
            full_name: email.split('@')[0],
            total_points: 150,
            current_streak: 3,
            created_at: new Date().toISOString()
        };
        
        StorageService.save('currentUser', currentUser);
        StorageService.save('currentProfile', currentProfile);
        
        console.log('✅ Demo sign in successful');
        return { user: currentUser, error: null };
    },
    
    signUp: async function(email, password, userData) {
        // Simulate sign up (replace with real Supabase auth)
        console.log('🔐 Simulating sign up for:', email);
        
        // Simulate successful signup
        return this.signIn(email, password);
    },
    
    signOut: async function() {
        console.log('🔐 Signing out...');
        currentUser = null;
        currentProfile = null;
        
        StorageService.remove('currentUser');
        StorageService.remove('currentProfile');
        
        console.log('✅ Signed out successfully');
        return { error: null };
    },
    
    initialize: async function() {
        console.log('🔐 Initializing auth service...');
        
        // Load from storage
        currentUser = StorageService.load('currentUser');
        currentProfile = StorageService.load('currentProfile');
        
        console.log('🔐 Auth initialized, user:', currentUser ? currentUser.email : 'None');
        return { user: currentUser, profile: currentProfile };
    }
};

// Simple habits service
const HabitsService = {
    getUserHabits: async function() {
        if (isOnline && currentUser) {
            // Simulate cloud fetch
            console.log('☁️ Fetching habits from cloud...');
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        }
        
        // Load from localStorage (offline or fallback)
        const habits = StorageService.load('habits', []);
        console.log(`📊 Loaded ${habits.length} habits`);
        
        return habits;
    },
    
    createHabit: async function(habitData) {
        console.log('🎯 Creating habit:', habitData.name);
        
        const habit = {
            id: Date.now().toString(),
            user_id: currentUser?.id || 'demo',
            name: habitData.name,
            description: habitData.description || '',
            category: habitData.category || 'general',
            icon: habitData.icon || '🎯',
            color: habitData.color || '#3B82F6',
            points_per_completion: habitData.pointsPerCompletion || 10,
            created_at: new Date().toISOString(),
            is_active: true
        };
        
        // Add to local storage
        const habits = this.getUserHabits();
        const updatedHabits = [habit, ...(await habits)];
        StorageService.save('habits', updatedHabits);
        
        if (isOnline && currentUser) {
            // Add to sync queue for cloud sync
            syncQueue.push({
                type: 'habit_create',
                data: habit,
                timestamp: new Date().toISOString()
            });
            StorageService.save('syncQueue', syncQueue);
            console.log('📤 Added habit to sync queue');
        }
        
        console.log('✅ Habit created:', habit.name);
        return habit;
    },
    
    completeHabit: async function(habitId, completionData = {}) {
        console.log('🎯 Completing habit:', habitId);
        
        const completion = {
            id: Date.now().toString(),
            habit_id: habitId,
            user_id: currentUser?.id || 'demo',
            completed_at: completionData.completedAt || new Date().toISOString(),
            notes: completionData.notes || '',
            points_earned: 10
        };
        
        // Add to local storage
        const completions = StorageService.load('completions', []);
        completions.unshift(completion);
        StorageService.save('completions', completions);
        
        // Update user points
        if (currentProfile) {
            currentProfile.total_points += completion.points_earned;
            StorageService.save('currentProfile', currentProfile);
        }
        
        if (isOnline && currentUser) {
            // Add to sync queue
            syncQueue.push({
                type: 'habit_complete',
                habitId: habitId,
                data: completion,
                timestamp: new Date().toISOString()
            });
            StorageService.save('syncQueue', syncQueue);
            console.log('📤 Added completion to sync queue');
        }
        
        console.log('✅ Habit completed');
        return completion;
    },
    
    getHabitsWithTodayStatus: async function() {
        const habits = await this.getUserHabits();
        const completions = StorageService.load('completions', []);
        const today = new Date().toISOString().split('T')[0];
        
        // Filter today's completions
        const todayCompletions = completions.filter(completion => {
            const completionDate = new Date(completion.completed_at).toISOString().split('T')[0];
            return completionDate === today;
        });
        
        // Add completion status to habits
        return habits.map(habit => ({
            ...habit,
            completedToday: todayCompletions.some(c => c.habit_id === habit.id),
            todayCompletions: todayCompletions.filter(c => c.habit_id === habit.id),
            completionCount: todayCompletions.filter(c => c.habit_id === habit.id).length
        }));
    }
};

// Simple sync service
const SyncService = {
    getSyncStatus: function() {
        return {
            isOnline: isOnline,
            isAuthenticated: !!currentUser,
            queueLength: syncQueue.length,
            lastSync: StorageService.load('lastSync')
        };
    },
    
    syncToCloud: async function() {
        if (!isOnline || !currentUser) {
            console.log('⏭️ Skipping sync - offline or not authenticated');
            return false;
        }
        
        console.log('☁️ Syncing to cloud...');
        
        // Simulate cloud sync
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Clear sync queue
        syncQueue = [];
        StorageService.save('syncQueue', syncQueue);
        StorageService.save('lastSync', new Date().toISOString());
        
        console.log('✅ Sync completed');
        return true;
    }
};

// UI Functions
function hideAllSections() {
    const sections = document.querySelectorAll('.section, .screen');
    sections.forEach(section => section.classList.add('hidden'));
}

function showSection(sectionId) {
    hideAllSections();
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
        
        if (sectionId === 'habits-section') {
            loadHabits();
        }
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
}

function updateUserDisplay() {
    if (currentProfile) {
        const welcomeText = document.getElementById('welcome-text');
        const userPoints = document.getElementById('user-points');
        const userStreak = document.getElementById('user-streak');
        
        if (welcomeText) {
            welcomeText.textContent = `Welcome back, ${currentProfile.full_name || 'User'}!`;
        }
        
        if (userPoints) {
            userPoints.textContent = `Points: ${currentProfile.total_points || 0}`;
        }
        
        if (userStreak) {
            userStreak.textContent = `Streak: ${currentProfile.current_streak || 0} days`;
        }
    }
}

function updateSyncStatus() {
    const syncIndicator = document.getElementById('sync-indicator');
    const syncStatus = document.getElementById('sync-status');
    const connectionIndicator = document.getElementById('connection-indicator');
    const connectionStatus = document.getElementById('connection-status');
    
    if (syncIndicator && syncStatus) {
        const status = SyncService.getSyncStatus();
        
        if (status.isOnline && status.isAuthenticated) {
            syncIndicator.className = 'sync-indicator';
            syncStatus.textContent = status.queueLength > 0 ? `${status.queueLength} pending` : 'Synced';
        } else if (!status.isOnline) {
            syncIndicator.className = 'sync-indicator offline';
            syncStatus.textContent = 'Offline';
        } else {
            syncIndicator.className = 'sync-indicator error';
            syncStatus.textContent = 'Not signed in';
        }
    }
    
    if (connectionIndicator && connectionStatus) {
        if (isOnline) {
            connectionIndicator.className = 'sync-indicator';
            connectionStatus.textContent = 'Online';
        } else {
            connectionIndicator.className = 'sync-indicator offline';
            connectionStatus.textContent = 'Offline';
        }
    }
}

async function loadHabits() {
    try {
        const habitsContainer = document.getElementById('habits-container');
        if (!habitsContainer) return;
        
        habitsContainer.innerHTML = '<div class="loading">Loading habits...</div>';
        
        const habits = await HabitsService.getHabitsWithTodayStatus();
        
        if (habits.length === 0) {
            habitsContainer.innerHTML = `
                <div class="no-habits">
                    <h3>No habits yet!</h3>
                    <p>Create your first habit to get started.</p>
                    <button onclick="showCreateHabitModal()" class="btn btn-primary">Create Habit</button>
                </div>
            `;
            return;
        }
        
        displayHabits(habits);
        console.log('✅ Habits loaded successfully');
    } catch (error) {
        console.error('❌ Error loading habits:', error);
        showNotification('Error loading habits', 'error');
    }
}

function displayHabits(habits) {
    const habitsContainer = document.getElementById('habits-container');
    if (!habitsContainer) return;
    
    const habitsHtml = habits.map(habit => `
        <div class="habit-card" data-habit-id="${habit.id}">
            <div class="habit-header">
                <span class="habit-icon">${habit.icon || '🎯'}</span>
                <h3 class="habit-name">${habit.name}</h3>
                <span class="habit-status ${habit.completedToday ? 'completed' : 'pending'}">
                    ${habit.completedToday ? '✅' : '⏳'}
                </span>
            </div>
            
            ${habit.description ? `<p class="habit-description">${habit.description}</p>` : ''}
            
            <div class="habit-stats">
                <span class="completion-count">Today: ${habit.completionCount || 0}</span>
                <span class="points">+${habit.points_per_completion || 10} pts</span>
            </div>
            
            <div class="habit-actions">
                <button onclick="completeHabit('${habit.id}')" class="btn btn-complete">
                    ${habit.completedToday ? 'Complete Again' : 'Complete'}
                </button>
            </div>
        </div>
    `).join('');
    
    habitsContainer.innerHTML = habitsHtml;
}

// Habit actions
async function completeHabit(habitId) {
    try {
        console.log('🎯 Completing habit:', habitId);
        
        const button = event?.target;
        if (button) {
            button.textContent = 'Completing...';
            button.disabled = true;
        }
        
        await HabitsService.completeHabit(habitId);
        showNotification('Habit completed! 🎉', 'success');
        updateUserDisplay();
        updateSyncStatus();
        await loadHabits();
        
    } catch (error) {
        console.error('❌ Error completing habit:', error);
        showNotification('Error completing habit', 'error');
    }
}

async function createHabit(habitData) {
    try {
        await HabitsService.createHabit(habitData);
        showNotification('Habit created! 🎉', 'success');
        await loadHabits();
        
    } catch (error) {
        console.error('❌ Error creating habit:', error);
        showNotification('Error creating habit', 'error');
        throw error;
    }
}

// Modal functions
function showCreateHabitModal() {
    let modal = document.getElementById('create-habit-modal');
    if (!modal) {
        createHabitModal();
        modal = document.getElementById('create-habit-modal');
    }
    modal.classList.remove('hidden');
}

function closeCreateHabitModal() {
    const modal = document.getElementById('create-habit-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function createHabitModal() {
    const modalHtml = `
        <div id="create-habit-modal" class="modal hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Create New Habit</h2>
                    <button onclick="closeCreateHabitModal()" class="close-btn">&times;</button>
                </div>
                
                <form id="create-habit-form" onsubmit="handleCreateHabitSubmit(event)">
                    <div class="form-group">
                        <label for="habit-name">Habit Name *</label>
                        <input type="text" id="habit-name" name="name" required maxlength="100" 
                               placeholder="e.g., Morning Workout">
                    </div>
                    
                    <div class="form-group">
                        <label for="habit-description">Description</label>
                        <textarea id="habit-description" name="description" maxlength="500" 
                                  placeholder="Optional description..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="habit-category">Category</label>
                        <select id="habit-category" name="category">
                            <option value="general">General</option>
                            <option value="fitness">Fitness</option>
                            <option value="health">Health</option>
                            <option value="productivity">Productivity</option>
                            <option value="mindfulness">Mindfulness</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="habit-icon">Icon</label>
                        <select id="habit-icon" name="icon">
                            <option value="🎯">🎯 Target</option>
                            <option value="💪">💪 Fitness</option>
                            <option value="🧘">🧘 Mindfulness</option>
                            <option value="📚">📚 Learning</option>
                            <option value="💧">💧 Hydration</option>
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" onclick="closeCreateHabitModal()" class="btn btn-secondary">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Habit</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function handleCreateHabitSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const habitData = {
        name: formData.get('name').trim(),
        description: formData.get('description').trim(),
        category: formData.get('category'),
        icon: formData.get('icon'),
        pointsPerCompletion: 10
    };
    
    if (!habitData.name) {
        showNotification('Please enter a habit name', 'error');
        return;
    }
    
    try {
        await createHabit(habitData);
        closeCreateHabitModal();
        form.reset();
    } catch (error) {
        console.error('Form submission error:', error);
    }
}

// Auth functions
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    
    if (!email || !password) {
        showNotification('Please enter email and password', 'error');
        return;
    }
    
    try {
        const button = form.querySelector('button[type="submit"]');
        button.textContent = 'Signing in...';
        button.disabled = true;
        
        const { user, error } = await AuthService.signIn(email, password);
        
        if (error) throw error;
        
        showNotification('Signed in successfully! 🎉', 'success');
        showDashboard();
        
    } catch (error) {
        console.error('❌ Login error:', error);
        showNotification(error.message || 'Login failed', 'error');
        
        const button = form.querySelector('button[type="submit"]');
        button.textContent = 'Sign In';
        button.disabled = false;
    }
}

async function handleSignup(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    const fullName = formData.get('fullName');
    
    try {
        const button = form.querySelector('button[type="submit"]');
        button.textContent = 'Creating account...';
        button.disabled = true;
        
        const { user, error } = await AuthService.signUp(email, password, { fullName });
        
        if (error) throw error;
        
        showNotification('Account created! 🎉', 'success');
        showDashboard();
        
    } catch (error) {
        console.error('❌ Signup error:', error);
        showNotification(error.message || 'Signup failed', 'error');
        
        const button = form.querySelector('button[type="submit"]');
        button.textContent = 'Create Account';
        button.disabled = false;
    }
}

async function handleLogout() {
    try {
        await AuthService.signOut();
        showNotification('Signed out successfully', 'success');
        showLoginScreen();
        
    } catch (error) {
        console.error('❌ Logout error:', error);
        showNotification('Error signing out', 'error');
    }
}

async function handleManualSync() {
    try {
        const button = event.target;
        button.textContent = 'Syncing...';
        button.disabled = true;
        
        await SyncService.syncToCloud();
        showNotification('Sync completed! ✅', 'success');
        updateSyncStatus();
        
        button.textContent = 'Sync';
        button.disabled = false;
        
    } catch (error) {
        console.error('❌ Sync error:', error);
        showNotification('Sync failed', 'error');
        
        const button = event.target;
        button.textContent = 'Sync';
        button.disabled = false;
    }
}

// Screen management
function showLoginScreen() {
    hideAllSections();
    document.getElementById('login-screen').classList.remove('hidden');
    updateSyncStatus();
}

async function showDashboard() {
    hideAllSections();
    document.getElementById('dashboard').classList.remove('hidden');
    
    updateUserDisplay();
    updateSyncStatus();
    await loadHabits();
    
    // Set up navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const target = btn.dataset.target;
            showSection(target);
        });
    });
}

// Auth form switching
function showAuthForm(type) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const tabs = document.querySelectorAll('#auth-tabs .nav-btn');
    
    if (type === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    }
    
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
}

// Debug functions
window.debugStriveTrack = function() {
    console.log('=== 🔍 StriveTrack Simple Cloud Debug ===');
    console.log('👤 Current User:', currentUser);
    console.log('👤 Current Profile:', currentProfile);
    console.log('🌐 Online:', isOnline);
    console.log('🔄 Sync Status:', SyncService.getSyncStatus());
    console.log('💾 Storage Usage:', {
        habits: StorageService.load('habits', []).length,
        completions: StorageService.load('completions', []).length,
        syncQueue: StorageService.load('syncQueue', []).length
    });
    return 'Debug complete';
};

// Online/offline handling
window.addEventListener('online', () => {
    isOnline = true;
    console.log('🌐 Back online');
    updateSyncStatus();
    showNotification('Back online! 🌐', 'success');
});

window.addEventListener('offline', () => {
    isOnline = false;
    console.log('📱 Gone offline');
    updateSyncStatus();
    showNotification('Working offline 📱', 'warning');
});

// Initialize app
async function initializeApp() {
    console.log('🚀 Initializing StriveTrack Simple Cloud app...');
    
    try {
        // Initialize auth
        const { user, profile } = await AuthService.initialize();
        
        // Set up event listeners
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        
        if (loginForm) loginForm.addEventListener('submit', handleLogin);
        if (signupForm) signupForm.addEventListener('submit', handleSignup);
        
        const logoutBtn = document.getElementById('logout-btn');
        const syncBtn = document.getElementById('sync-btn');
        
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        if (syncBtn) syncBtn.addEventListener('click', handleManualSync);
        
        // Load sync queue
        syncQueue = StorageService.load('syncQueue', []);
        
        // Show appropriate screen
        if (user) {
            await showDashboard();
        } else {
            showLoginScreen();
        }
        
        updateSyncStatus();
        console.log('✅ App initialized successfully');
        
    } catch (error) {
        console.error('❌ App initialization error:', error);
        showLoginScreen();
    }
}

// Global function access
window.showCreateHabitModal = showCreateHabitModal;
window.closeCreateHabitModal = closeCreateHabitModal;
window.handleCreateHabitSubmit = handleCreateHabitSubmit;
window.completeHabit = completeHabit;
window.showAuthForm = showAuthForm;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

console.log('✅ StriveTrack Simple Cloud app loaded');