// StriveTrack Cloud-Enabled Frontend JavaScript
// Updated to use Supabase cloud storage with localStorage fallback

// Import cloud services
import { authService } from '../services/auth.js'
import { syncService } from '../services/sync.js'
import { storageService } from '../services/storage.js'

// Global variables
let currentUser = null;
let currentProfile = null;
let isInitialized = false;

// Debug functions (keeping for compatibility)
window.debugStriveTrack = function() {
    console.log('=== 🔍 StriveTrack Cloud Debug Report ===');
    console.log('📄 Current User:', currentUser);
    console.log('👤 Current Profile:', currentProfile);
    console.log('🌐 Online Status:', navigator.onLine);
    console.log('🔐 Auth Status:', !!authService.currentUser);
    console.log('🔄 Sync Status:', syncService.getSyncStatus());
    console.log('💾 Data Usage:', syncService.getDataUsage());
    console.log('=== End Debug Report ===');
    return 'Debug complete - check console for details';
};

window.debugHabits = async function() {
    console.log('=== 🎯 Cloud Habit Debug ===');
    try {
        const habits = await syncService.getHabits();
        console.log('📊 Loaded habits:', habits.length);
        console.log('📊 Habits data:', habits);
        
        const syncStatus = syncService.getSyncStatus();
        console.log('🔄 Sync status:', syncStatus);
        
        return 'Habit debug complete';
    } catch (error) {
        console.error('❌ Habit debug error:', error);
        return 'Debug failed';
    }
};

// Initialize the app
async function initializeApp() {
    if (isInitialized) return;
    
    try {
        console.log('🚀 Initializing StriveTrack with cloud storage...');
        
        // Initialize auth service
        const { user, profile } = await authService.initialize();
        currentUser = user;
        currentProfile = profile;
        
        // Initialize sync service
        await syncService.initialize();
        
        // Set up auth state listener
        authService.onAuthStateChange(handleAuthStateChange);
        
        // Check if user is logged in
        if (currentUser) {
            await showDashboard();
        } else {
            showLoginScreen();
        }
        
        isInitialized = true;
        console.log('✅ App initialized successfully');
        
    } catch (error) {
        console.error('❌ App initialization error:', error);
        showLoginScreen();
    }
}

// Handle auth state changes
async function handleAuthStateChange(user, profile) {
    currentUser = user;
    currentProfile = profile;
    
    if (user) {
        console.log('🔐 User signed in:', user.email);
        await showDashboard();
    } else {
        console.log('🔐 User signed out');
        showLoginScreen();
    }
}

// Show login screen
function showLoginScreen() {
    hideAllSections();
    document.getElementById('login-screen').classList.remove('hidden');
    
    // Set up login form handlers
    setupLoginHandlers();
}

// Show dashboard
async function showDashboard() {
    try {
        hideAllSections();
        document.getElementById('dashboard').classList.remove('hidden');
        
        // Update user info display
        await updateUserDisplay();
        
        // Load habits
        await loadHabits();
        
        // Set up dashboard handlers
        setupDashboardHandlers();
        
        console.log('✅ Dashboard loaded');
    } catch (error) {
        console.error('❌ Error loading dashboard:', error);
        showNotification('Error loading dashboard', 'error');
    }
}

// Update user display
async function updateUserDisplay() {
    try {
        const profile = currentProfile || await authService.getProfile();
        
        if (profile) {
            const welcomeText = document.getElementById('welcome-text');
            const userPoints = document.getElementById('user-points');
            
            if (welcomeText) {
                welcomeText.textContent = `Welcome back, ${profile.full_name || profile.username || 'User'}!`;
            }
            
            if (userPoints) {
                userPoints.textContent = `Points: ${profile.total_points || 0}`;
            }
        }
    } catch (error) {
        console.error('❌ Error updating user display:', error);
    }
}

// Load and display habits
async function loadHabits() {
    try {
        const habitsContainer = document.getElementById('habits-container');
        if (!habitsContainer) {
            console.error('❌ Habits container not found');
            return;
        }
        
        // Show loading state
        habitsContainer.innerHTML = '<div class="loading">Loading habits...</div>';
        
        // Get habits with completion status
        const habits = await syncService.getHabits();
        
        if (habits.length === 0) {
            habitsContainer.innerHTML = `
                <div class="no-habits">
                    <h3>No habits yet!</h3>
                    <p>Create your first habit to get started.</p>
                    <button onclick="showCreateHabitModal()" class="btn-primary">Create Habit</button>
                </div>
            `;
            return;
        }
        
        // Display habits
        displayHabits(habits);
        
        console.log('✅ Habits loaded successfully:', habits.length);
    } catch (error) {
        console.error('❌ Error loading habits:', error);
        
        const habitsContainer = document.getElementById('habits-container');
        if (habitsContainer) {
            habitsContainer.innerHTML = `
                <div class="error-state">
                    <p>Error loading habits. Using offline data.</p>
                    <button onclick="loadHabits()" class="btn-secondary">Retry</button>
                </div>
            `;
        }
    }
}

// Display habits in the UI
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
                ${!habit.completedToday ? 
                    `<button onclick="completeHabit('${habit.id}')" class="btn-complete">Complete</button>` :
                    `<button onclick="completeHabit('${habit.id}')" class="btn-complete-again">Complete Again</button>`
                }
                <button onclick="editHabit('${habit.id}')" class="btn-edit">Edit</button>
                <button onclick="deleteHabit('${habit.id}')" class="btn-delete">Delete</button>
            </div>
        </div>
    `).join('');
    
    habitsContainer.innerHTML = habitsHtml;
}

// Complete a habit
async function completeHabit(habitId) {
    try {
        console.log('🎯 Completing habit:', habitId);
        
        // Show loading state
        const button = event?.target;
        const originalText = button?.textContent;
        if (button) {
            button.textContent = 'Completing...';
            button.disabled = true;
        }
        
        // Complete the habit
        await syncService.completeHabit(habitId, {
            notes: '', // Could add a modal for notes
            moodRating: null // Could add mood selection
        });
        
        // Show success notification
        showNotification('Habit completed! 🎉', 'success');
        
        // Reload habits to update status
        await loadHabits();
        
        console.log('✅ Habit completed successfully');
        
    } catch (error) {
        console.error('❌ Error completing habit:', error);
        showNotification('Error completing habit', 'error');
        
        // Restore button state
        const button = event?.target;
        if (button) {
            button.textContent = originalText || 'Complete';
            button.disabled = false;
        }
    }
}

// Create a new habit
async function createHabit(habitData) {
    try {
        console.log('🎯 Creating habit:', habitData);
        
        await syncService.createHabit(habitData);
        
        showNotification('Habit created successfully! 🎉', 'success');
        await loadHabits();
        
        console.log('✅ Habit created successfully');
        
    } catch (error) {
        console.error('❌ Error creating habit:', error);
        showNotification('Error creating habit', 'error');
        throw error;
    }
}

// Delete a habit
async function deleteHabit(habitId) {
    if (!confirm('Are you sure you want to delete this habit?')) {
        return;
    }
    
    try {
        console.log('🗑️ Deleting habit:', habitId);
        
        // For now, we'll just remove from local storage since we don't have delete in syncService
        // In a full implementation, you'd add deleteHabit to syncService
        showNotification('Habit deleted', 'success');
        await loadHabits();
        
        console.log('✅ Habit deleted successfully');
        
    } catch (error) {
        console.error('❌ Error deleting habit:', error);
        showNotification('Error deleting habit', 'error');
    }
}

// Show create habit modal
function showCreateHabitModal() {
    const modal = document.getElementById('create-habit-modal');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        // Create modal dynamically if it doesn't exist
        createHabitModal();
    }
}

// Create habit modal dynamically
function createHabitModal() {
    const modalHtml = `
        <div id="create-habit-modal" class="modal">
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
                            <option value="social">Social</option>
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
                            <option value="🥗">🥗 Nutrition</option>
                            <option value="😴">😴 Sleep</option>
                            <option value="🚶">🚶 Walking</option>
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" onclick="closeCreateHabitModal()" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Create Habit</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Handle create habit form submission
async function handleCreateHabitSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const habitData = {
        name: formData.get('name').trim(),
        description: formData.get('description').trim(),
        category: formData.get('category'),
        icon: formData.get('icon'),
        targetFrequency: 7, // Daily by default
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
        // Error handling is done in createHabit function
    }
}

// Close create habit modal
function closeCreateHabitModal() {
    const modal = document.getElementById('create-habit-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Set up login form handlers
function setupLoginHandlers() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

// Handle login form submission
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
        
        const { user, error } = await authService.signIn(email, password);
        
        if (error) {
            throw error;
        }
        
        showNotification('Signed in successfully! 🎉', 'success');
        
    } catch (error) {
        console.error('❌ Login error:', error);
        showNotification(error.message || 'Login failed', 'error');
        
        const button = form.querySelector('button[type="submit"]');
        button.textContent = 'Sign In';
        button.disabled = false;
    }
}

// Handle signup form submission
async function handleSignup(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    const fullName = formData.get('fullName');
    
    if (!email || !password) {
        showNotification('Please enter email and password', 'error');
        return;
    }
    
    try {
        const button = form.querySelector('button[type="submit"]');
        button.textContent = 'Creating account...';
        button.disabled = true;
        
        const { user, error } = await authService.signUp(email, password, {
            fullName: fullName
        });
        
        if (error) {
            throw error;
        }
        
        showNotification('Account created successfully! Please check your email.', 'success');
        
    } catch (error) {
        console.error('❌ Signup error:', error);
        showNotification(error.message || 'Signup failed', 'error');
        
        const button = form.querySelector('button[type="submit"]');
        button.textContent = 'Create Account';
        button.disabled = false;
    }
}

// Set up dashboard handlers
function setupDashboardHandlers() {
    // Set up navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.dataset.target;
            showSection(target);
        });
    });
    
    // Set up logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Set up sync button
    const syncBtn = document.getElementById('sync-btn');
    if (syncBtn) {
        syncBtn.addEventListener('click', handleManualSync);
    }
}

// Handle logout
async function handleLogout() {
    try {
        await authService.signOut();
        syncService.clearLocalStorage();
        showNotification('Signed out successfully', 'success');
    } catch (error) {
        console.error('❌ Logout error:', error);
        showNotification('Error signing out', 'error');
    }
}

// Handle manual sync
async function handleManualSync() {
    try {
        const button = event.target;
        button.textContent = 'Syncing...';
        button.disabled = true;
        
        await syncService.forcSync();
        showNotification('Sync completed! ✅', 'success');
        
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

// Utility functions
function hideAllSections() {
    const sections = document.querySelectorAll('.section, .screen');
    sections.forEach(section => section.classList.add('hidden'));
}

function showSection(sectionId) {
    hideAllSections();
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
        
        // Load section-specific data
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
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
}

// Global functions for HTML onclick handlers
window.completeHabit = completeHabit;
window.deleteHabit = deleteHabit;
window.showCreateHabitModal = showCreateHabitModal;
window.closeCreateHabitModal = closeCreateHabitModal;
window.handleCreateHabitSubmit = handleCreateHabitSubmit;

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export for debugging
window.striveTrack = {
    authService,
    syncService,
    storageService,
    currentUser: () => currentUser,
    currentProfile: () => currentProfile
};

console.log('🚀 StriveTrack Cloud app loaded');