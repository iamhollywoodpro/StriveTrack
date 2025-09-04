// StriveTrack Frontend JavaScript

let sessionId = localStorage.getItem('sessionId');
let currentUser = null;
let isInitializing = false;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    if (isInitializing) {
        console.warn('⚠️ App already initializing, skipping duplicate initialization');
        return;
    }
    
    isInitializing = true;
    console.log('🚀 StriveTrack starting up...');
    console.log('📍 Current URL:', window.location.href);
    console.log('🔑 Found sessionId:', sessionId ? 'Yes' : 'No');
    
    // Setup event listeners first
    try {
        setupEventListeners();
    } catch (error) {
        console.error('💥 Error setting up event listeners:', error);
    }
    
    // Check URL validation
    if (!window.location.href.includes('8787-i9yme7bqgef9jzbamql4k-6532622b.e2b.dev')) {
        console.warn('⚠️ Warning: You might not be on the correct development server.');
        console.warn('⚠️ Expected URL should contain: 8787-i9yme7bqgef9jzbamql4k-6532622b.e2b.dev');
        console.warn('⚠️ If API calls fail, try: https://8787-i9yme7bqgef9jzbamql4k-6532622b.e2b.dev');
    }
    
    // Add debug info to help troubleshoot
    console.log('🔧 Debug functions available: debugAuth(), testAdminLogin(), testNetwork(), checkUrl()');
    
    // Authentication flow with error handling
    setTimeout(() => {
        try {
            if (sessionId && sessionId.trim() !== '') {
                console.log('🔍 Validating existing session...');
                validateSession();
            } else {
                console.log('🔑 No valid session found, showing login screen');
                showLoginScreen();
            }
        } catch (error) {
            console.error('💥 Error in authentication flow:', error);
            showLoginScreen();
        } finally {
            isInitializing = false;
        }
    }, 100);
});

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Signup form
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    
    // User type selection change handler
    document.getElementById('signup-user-type').addEventListener('change', updateUserTypeDescription);
    
    // Register buttons
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    
    console.log('Show register button:', showRegisterBtn);
    console.log('Show login button:', showLoginBtn);
    
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Signup button clicked');
            showSignupForm();
        });
        console.log('Event listener attached to show-register button');
    } else {
        console.error('show-register button not found');
    }
    
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', showLoginForm);
    } else {
        console.log('show-login button not found (this is expected on first load)');
    }
    
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
    
    // Habit form handler will be set up by setupHabitEventListeners()
    
    // Emoji preview auto-update
    document.getElementById('habit-name').addEventListener('input', updateEmojiPreview);
    document.getElementById('habit-category').addEventListener('change', updateEmojiPreview);
    
    // Nutrition form
    document.getElementById('nutrition-form').addEventListener('submit', submitNutrition);
    
    // Weight tracking forms
    document.getElementById('weight-log-form').addEventListener('submit', submitWeightLog);
    document.getElementById('weight-goal-form').addEventListener('submit', submitWeightGoal);
    
    // Goal setting forms
    document.getElementById('create-goal-form').addEventListener('submit', submitGoal);
    document.getElementById('goal-progress-form').addEventListener('submit', submitGoalProgress);
    
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
    
    // Admin search and filter functionality (bind when elements exist)
    setTimeout(() => {
        const adminUserSearch = document.getElementById('admin-user-search');
        const adminUserFilter = document.getElementById('admin-user-filter');
        
        if (adminUserSearch) adminUserSearch.addEventListener('input', debounce(filterAdminUsers, 300));
        if (adminUserFilter) adminUserFilter.addEventListener('change', filterAdminUsers);
    }, 100);
    
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
    console.log('🔍 Validating session with ID:', sessionId);
    
    if (!sessionId || sessionId.trim() === '') {
        console.log('❌ No session ID to validate');
        clearSessionAndShowLogin();
        return;
    }
    
    try {
        const response = await fetch('/api/auth/validate-session', {
            headers: { 'x-session-id': sessionId }
        });
        
        console.log('📊 Session validation response:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Session valid, user data:', data.user);
            currentUser = data.user;
            showDashboard();
        } else {
            console.log('❌ Session invalid, clearing and showing login');
            clearSessionAndShowLogin();
        }
    } catch (error) {
        console.error('💥 Session validation error:', error);
        clearSessionAndShowLogin();
    }
}

// Helper function to clear session and show login
function clearSessionAndShowLogin() {
    console.log('🧹 Clearing session and showing login screen');
    localStorage.removeItem('sessionId');
    sessionId = null;
    currentUser = null;
    
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
        showLoginScreen();
    }, 100);
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

function showSignupForm() {
    console.log('showSignupForm called - switching to signup form');
    const loginCard = document.getElementById('login-form-card');
    const signupCard = document.getElementById('signup-form-card');
    
    if (loginCard && signupCard) {
        loginCard.classList.add('hidden');
        signupCard.classList.remove('hidden');
        
        // Focus on the name input after a short delay to ensure it's visible
        setTimeout(() => {
            const nameInput = document.getElementById('signup-name');
            if (nameInput) {
                nameInput.focus();
            }
        }, 100);
        
        console.log('Successfully switched to signup form');
    } else {
        console.error('Could not find required form elements');
        console.error('Login card found:', !!loginCard);
        console.error('Signup card found:', !!signupCard);
    }
}

function showLoginForm() {
    document.getElementById('signup-form-card').classList.add('hidden');
    document.getElementById('login-form-card').classList.remove('hidden');
    document.getElementById('email').focus();
}

function updateUserTypeDescription() {
    const userType = document.getElementById('signup-user-type').value;
    const descriptionDiv = document.getElementById('user-type-description');
    const descriptionText = document.getElementById('description-text');
    
    const descriptions = {
        'beginner': 'Perfect for newcomers! Get guided workouts, learning resources, form tutorials, and connect with other beginners for motivation.',
        'intermediate': 'Level up your fitness! Access advanced analytics, workout variations, challenge creation, and integration with fitness apps.',
        'advanced': 'Maximize performance! Get detailed biometric tracking, custom program builders, mentorship opportunities, and peak performance tools.',
        'competition': 'Compete at your best! Track competitions, plan peak timing, analyze performance data, and manage team relationships.',
        'coach': 'Grow your business! Manage multiple clients, create program templates, track client progress, and access professional business tools.'
    };
    
    if (userType && descriptions[userType]) {
        descriptionText.textContent = descriptions[userType];
        descriptionDiv.classList.remove('hidden');
    } else {
        descriptionDiv.classList.add('hidden');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const password = formData.get('password');
    const phone = formData.get('phone')?.trim();
    const user_type = formData.get('user_type');
    
    // Client-side validation
    if (!name || name.length < 2) {
        showNotification('Please enter your full name (at least 2 characters)', 'error');
        return;
    }
    
    if (!email || !email.includes('@')) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (!password || password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }
    
    if (!user_type) {
        showNotification('Please select your fitness level', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating Account...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone, user_type })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store session and user data
            sessionId = data.sessionId;
            localStorage.setItem('sessionId', data.sessionId);
            currentUser = data.user;
            
            showNotification(`Welcome to StriveTrack, ${data.user.name}! 🎉`, 'success');
            
            // Trigger confetti animation
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            
            // Show dashboard after a short delay
            setTimeout(() => {
                showDashboard();
            }, 1500);
            
        } else {
            showNotification(data.error || 'Registration failed', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Network error. Please check your connection and try again.', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function logout() {
    fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'x-session-id': sessionId }
    });
    
    localStorage.removeItem('sessionId');
    sessionStorage.removeItem('welcomeMessageShown');
    sessionId = null;
    currentUser = null;
    
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    
    showNotification('Logged out successfully', 'info');
}

// UI Navigation functions
function showLoginScreen() {
    console.log('🔑 Showing login screen');
    
    // Wait for DOM elements to be available
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    
    if (!loginScreen) {
        console.error('❌ Login screen element not found');
        console.log('🔍 Available elements:', document.querySelectorAll('[id]').length);
        // Retry after a short delay
        setTimeout(() => {
            const retryLoginScreen = document.getElementById('login-screen');
            if (retryLoginScreen) {
                retryLoginScreen.classList.remove('hidden');
                console.log('✅ Login screen found on retry');
            } else {
                console.error('❌ Login screen still not found after retry');
            }
        }, 500);
        return;
    }
    
    loginScreen.classList.remove('hidden');
    
    if (dashboard) {
        dashboard.classList.add('hidden');
    } else {
        console.warn('⚠️ Dashboard element not found (this might be normal on first load)');
    }
    
    console.log('✅ Login screen should now be visible');
}

// Dashboard functions
async function showDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    
    // Update welcome text and points
    document.getElementById('welcome-text').textContent = `Welcome, ${currentUser.name || currentUser.email.split('@')[0]} ⭐ ${currentUser.points || 0} pts`;
    document.getElementById('user-points').textContent = `⭐ ${currentUser.points || 0} pts`;
    
    // Show admin tab only for designated admin (iamhollywoodpro@protonmail.com)
    const adminTab = document.getElementById('admin-tab');
    if (adminTab) {
        if (currentUser.email === 'iamhollywoodpro@protonmail.com') {
            adminTab.classList.remove('hidden');
        } else {
            // Ensure admin tab stays hidden for all other users
            adminTab.classList.add('hidden');
        }
    }
    
    console.log('✅ Dashboard display completed');
    
    // Load role-based dashboard configuration - DISABLED for clean UI
    // await loadRoleBasedDashboard();
    console.log('Role-based dashboard disabled - using core features only');
    
    // Load initial data
    loadDashboardData();
}

// Load role-based dashboard configuration and UI
async function loadRoleBasedDashboard() {
    try {
        const response = await fetch('/api/user/dashboard-config', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Dashboard config loaded:', data);
            
            // Update current user with detailed info
            currentUser = { ...currentUser, ...data.user };
            
            // Create role-specific navigation tabs
            createRoleBasedNavigation(data.dashboard.sections);
            
            // Create role-specific dashboard sections
            createRoleBasedSections(data.dashboard.sections, data.features);
            
            // Show role-specific welcome message (only once per session)
            if (!sessionStorage.getItem('welcomeMessageShown')) {
                showRoleWelcomeMessage(data.user.user_type);
                sessionStorage.setItem('welcomeMessageShown', 'true');
            }
            
        } else {
            console.error('Failed to load dashboard config');
        }
    } catch (error) {
        console.error('Error loading role-based dashboard:', error);
    }
}

// Create navigation tabs based on user role
function createRoleBasedNavigation(sections) {
    const navContainer = document.querySelector('.flex.space-x-4.overflow-x-auto');
    if (!navContainer) return;
    
    // Clear existing nav items except admin tab
    const adminTab = document.getElementById('admin-tab');
    navContainer.innerHTML = '';
    if (adminTab) navContainer.appendChild(adminTab);
    
    // Add role-specific navigation tabs
    sections.forEach((section, index) => {
        const button = document.createElement('button');
        button.className = `nav-tab ${index === 0 ? 'active' : ''}`;
        button.setAttribute('data-section', section.id);
        button.innerHTML = `
            <i class="${section.icon}"></i>
            ${section.name}
        `;
        
        // Add event listener for tab switching
        button.addEventListener('click', () => {
            showSection(section.id);
        });
        
        navContainer.insertBefore(button, adminTab);
    });
}

// Create dashboard sections based on user role  
function createRoleBasedSections(sections, features) {
    const contentArea = document.querySelector('.max-w-7xl.mx-auto.px-4.py-8');
    if (!contentArea) return;
    
    // Hide all existing sections first
    const existingSections = contentArea.querySelectorAll('.section');
    existingSections.forEach(section => {
        section.classList.add('hidden');
    });
    
    // Create or show role-specific sections
    sections.forEach((section, index) => {
        let sectionDiv = document.getElementById(`${section.id}-section`);
        
        // If section doesn't exist, create it
        if (!sectionDiv) {
            sectionDiv = document.createElement('div');
            sectionDiv.id = `${section.id}-section`;
            sectionDiv.className = `section ${index === 0 ? '' : 'hidden'}`;
            
            // Generate content based on section type  
            sectionDiv.innerHTML = generateSectionContent(section, features);
            
            // Insert before admin section if it exists
            const adminSection = document.getElementById('admin-section');
            if (adminSection) {
                contentArea.insertBefore(sectionDiv, adminSection);
            } else {
                contentArea.appendChild(sectionDiv);
            }
        } else {
            // Section exists, just show it and update active state
            if (index === 0) {
                sectionDiv.classList.remove('hidden');
            } else {
                sectionDiv.classList.add('hidden');
            }
        }
    });
    
    // Setup event listeners for habit functionality after sections are created
    setTimeout(() => {
        setupHabitEventListeners();
    }, 100);
}

// Generate content for each section based on user role
function generateSectionContent(section, features) {
    // Check if this section already exists - if so, don't regenerate
    const existingSection = document.getElementById(`${section.id}-section`);
    if (existingSection && ['habits', 'nutrition', 'achievements', 'progress', 'dashboard'].includes(section.id)) {
        return existingSection.innerHTML;
    }
    
    switch (section.id) {
        case 'dashboard':
            return generateDashboardContent();
        case 'habits':
            return generateDefaultHabitsContent();
        case 'nutrition':
            return generateDefaultNutritionContent();
        case 'achievements':
            return generateDefaultAchievementsContent();
        case 'progress':
            return generateDefaultProgressContent();
        case 'learning_hub':
            return generateLearningHubContent();
        case 'guided_workouts':
            return generateGuidedWorkoutsContent();
        case 'analytics':
            return generateAnalyticsContent();
        case 'workout_variations':
            return generateWorkoutVariationsContent();
        case 'challenges':
            return generateChallengesContent();
        case 'performance':
            return generatePerformanceContent();
        case 'program_builder':
            return generateProgramBuilderContent();
        case 'competitions':
            return generateCompetitionsContent();
        case 'clients':
            return generateClientManagementContent();
        case 'programs':
            return generateProgramTemplatesContent();
        case 'business_tools':
            return generateBusinessToolsContent();
        default:
            return `<div class="text-center py-12 text-white/50">
                <i class="${section.icon} text-4xl mb-4"></i>
                <h3 class="text-xl font-bold mb-2">${section.name}</h3>
                <p>Coming soon! This feature is under development.</p>
            </div>`;
    }
}

function showRoleWelcomeMessage(userType) {
    const welcomeMessages = {
        'beginner': '🔰 Welcome to your fitness journey! Let\'s start with the basics and build healthy habits.',
        'intermediate': '💪 Ready to level up! Access advanced analytics and challenge yourself with new workouts.',
        'advanced': '🚀 Optimize your performance! Track detailed metrics and build custom training programs.',
        'competition': '🏆 Train like a champion! Track competitions and peak at the perfect time.',
        'coach': '👨‍🏫 Grow your coaching business! Manage clients and track their success.'
    };
    
    const message = welcomeMessages[userType] || 'Welcome to StriveTrack!';
    
    // Show welcome notification (dismissible)
    showNotification(message, 'success', true);
    
    // Update dashboard subtitle
    const subtitle = document.querySelector('.text-white\\/70');
    if (subtitle) {
        subtitle.textContent = message;
    }
}

// Content generators for role-specific sections
function generateDashboardContent() {
    return `
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="stats-card">
                <div class="text-2xl font-bold text-white mb-2" id="active-habits">0</div>
                <div class="text-white/70 text-sm">Active Habits</div>
                <div class="text-blue-400 text-xs">Goals set</div>
            </div>
            <div class="stats-card">
                <div class="text-2xl font-bold text-white mb-2" id="today-progress">0/0</div>
                <div class="text-white/70 text-sm">Today's Progress</div>
                <div class="text-green-400 text-xs">Completed</div>
            </div>
            <div class="stats-card">
                <div class="text-2xl font-bold text-white mb-2" id="average-performance">0%</div>
                <div class="text-white/70 text-sm">Average</div>
                <div class="text-yellow-400 text-xs">Performance</div>
            </div>
            <div class="stats-card">
                <div class="text-2xl font-bold text-white mb-2" id="user-points-display">0</div>
                <div class="text-white/70 text-sm">Total Points</div>
                <div class="text-purple-400 text-xs">Earned</div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="glass-card p-6 text-center cursor-pointer hover:bg-white/10 transition-all" onclick="showCreateHabitModal()">
                <i class="fas fa-plus-circle text-3xl text-blue-400 mb-4"></i>
                <h3 class="text-lg font-bold text-white mb-2">Add Habit</h3>
                <p class="text-white/70 text-sm">Create a new fitness goal</p>
            </div>
            <div class="glass-card p-6 text-center cursor-pointer hover:bg-white/10 transition-all" id="upload-progress-card">
                <i class="fas fa-camera text-3xl text-green-400 mb-4"></i>
                <h3 class="text-lg font-bold text-white mb-2">Upload Progress</h3>
                <p class="text-white/70 text-sm">Share your journey</p>
            </div>
            <div class="glass-card p-6 text-center cursor-pointer hover:bg-white/10 transition-all" onclick="showSection('achievements')">
                <i class="fas fa-trophy text-3xl text-yellow-400 mb-4"></i>
                <h3 class="text-lg font-bold text-white mb-2">View Achievements</h3>
                <p class="text-white/70 text-sm">Track your milestones</p>
            </div>
        </div>

        <!-- Dashboard Habits Section -->
        <div class="mb-8">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-white">Your Active Habits</h3>
                <button onclick="showSection('habits')" class="text-blue-400 hover:text-blue-300 text-sm">
                    View All <i class="fas fa-arrow-right ml-1"></i>
                </button>
            </div>
            <div id="dashboard-habits-container">
                <div class="text-center py-8 text-white/50">
                    <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                    <p>Loading your habits...</p>
                </div>
            </div>
        </div>
    `;
}

function generateLearningHubContent() {
    return `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-white mb-4">
                <i class="fas fa-graduation-cap text-blue-400 mr-3"></i>
                Learning Hub - Master the Fundamentals
            </h2>
            <p class="text-white/70 mb-6">Build a strong foundation with expert tutorials, safety tips, and structured programs designed for beginners.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Exercise Tutorials -->
            <div class="glass-card p-6">
                <h3 class="text-xl font-bold text-white mb-4">
                    <i class="fas fa-play-circle text-green-400 mr-2"></i>
                    Exercise Tutorials
                </h3>
                <div class="space-y-4" id="exercise-tutorials">
                    <div class="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 cursor-pointer transition-all">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="font-semibold text-white">Squat Form Fundamentals</h4>
                                <p class="text-white/70 text-sm">Master perfect squat technique • 5:30</p>
                            </div>
                            <i class="fas fa-play text-blue-400"></i>
                        </div>
                    </div>
                    <div class="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 cursor-pointer transition-all">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="font-semibold text-white">Push-Up Progression Guide</h4>
                                <p class="text-white/70 text-sm">Build up to perfect push-ups • 4:15</p>
                            </div>
                            <i class="fas fa-play text-blue-400"></i>
                        </div>
                    </div>
                    <div class="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 cursor-pointer transition-all">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="font-semibold text-white">Plank Form & Variations</h4>
                                <p class="text-white/70 text-sm">Strengthen your core safely • 3:45</p>
                            </div>
                            <i class="fas fa-play text-blue-400"></i>
                        </div>
                    </div>
                </div>
                <button class="btn-primary w-full mt-4" onclick="loadLearningContent()">
                    <i class="fas fa-graduation-cap mr-2"></i>
                    Access Full Learning Hub
                </button>
            </div>

            <!-- Safety Tips -->
            <div class="glass-card p-6">
                <h3 class="text-xl font-bold text-white mb-4">
                    <i class="fas fa-shield-alt text-yellow-400 mr-2"></i>
                    Safety First
                </h3>
                <div class="space-y-4">
                    <div class="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4">
                        <h4 class="font-semibold text-yellow-300 mb-2">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            Warm-Up Importance
                        </h4>
                        <p class="text-white/70 text-sm">Always warm up for 5-10 minutes before exercise to prevent injury and improve performance.</p>
                    </div>
                    <div class="bg-blue-400/10 border border-blue-400/20 rounded-lg p-4">
                        <h4 class="font-semibold text-blue-300 mb-2">
                            <i class="fas fa-lungs mr-2"></i>
                            Proper Breathing
                        </h4>
                        <p class="text-white/70 text-sm">Breathe out during exertion, breathe in during relaxation. Never hold your breath.</p>
                    </div>
                    <div class="bg-green-400/10 border border-green-400/20 rounded-lg p-4">
                        <h4 class="font-semibold text-green-300 mb-2">
                            <i class="fas fa-bed mr-2"></i>
                            Rest & Recovery
                        </h4>
                        <p class="text-white/70 text-sm">Take at least one full rest day per week. Listen to your body.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Beginner Programs -->
        <div class="glass-card p-6">
            <h3 class="text-xl font-bold text-white mb-4">
                <i class="fas fa-rocket text-purple-400 mr-2"></i>
                Starter Programs
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h4 class="font-bold text-white mb-2">7-Day Beginner Starter</h4>
                    <p class="text-white/70 text-sm mb-4">Your first week of structured fitness</p>
                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between text-sm">
                            <span class="text-white/60">Duration:</span>
                            <span class="text-white">1 week</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-white/60">Workouts:</span>
                            <span class="text-white">3 per week</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-white/60">Time:</span>
                            <span class="text-white">20-30 min</span>
                        </div>
                    </div>
                    <button class="btn-secondary w-full">Start Program</button>
                </div>
                <div class="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h4 class="font-bold text-white mb-2">30-Day Home Challenge</h4>
                    <p class="text-white/70 text-sm mb-4">Build strength at home, no equipment needed</p>
                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between text-sm">
                            <span class="text-white/60">Duration:</span>
                            <span class="text-white">30 days</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-white/60">Workouts:</span>
                            <span class="text-white">4 per week</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-white/60">Equipment:</span>
                            <span class="text-white">Bodyweight</span>
                        </div>
                    </div>
                    <button class="btn-secondary w-full">Join Challenge</button>
                </div>
            </div>
        </div>
    `;
}

function generateAnalyticsContent() {
    return `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-white mb-4">
                <i class="fas fa-chart-bar text-blue-400 mr-3"></i>
                Advanced Analytics - Level Up Your Performance
            </h2>
            <p class="text-white/70 mb-6">Deep dive into your fitness data with trend analysis, plateau detection, and personalized insights.</p>
        </div>

        <!-- Analytics Overview -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div class="glass-card p-6">
                <h3 class="text-lg font-bold text-white mb-4">
                    <i class="fas fa-trending-up text-green-400 mr-2"></i>
                    Performance Trend
                </h3>
                <div class="text-center">
                    <div class="text-3xl font-bold text-green-400 mb-2">📈 Improving</div>
                    <p class="text-white/70 text-sm">15% increase over last 30 days</p>
                </div>
            </div>
            <div class="glass-card p-6">
                <h3 class="text-lg font-bold text-white mb-4">
                    <i class="fas fa-percentage text-blue-400 mr-2"></i>
                    Consistency Score
                </h3>
                <div class="text-center">
                    <div class="text-3xl font-bold text-blue-400 mb-2">87%</div>
                    <p class="text-white/70 text-sm">Above average consistency</p>
                </div>
            </div>
            <div class="glass-card p-6">
                <h3 class="text-lg font-bold text-white mb-4">
                    <i class="fas fa-exclamation-triangle text-yellow-400 mr-2"></i>
                    Plateau Detection
                </h3>
                <div class="text-center">
                    <div class="text-3xl font-bold text-green-400 mb-2">✓ Clear</div>
                    <p class="text-white/70 text-sm">No plateaus detected</p>
                </div>
            </div>
        </div>

        <!-- Detailed Analytics -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="glass-card p-6">
                <h3 class="text-xl font-bold text-white mb-4">
                    <i class="fas fa-chart-line text-purple-400 mr-2"></i>
                    Habit Completion Trends
                </h3>
                <div class="bg-white/5 border border-white/10 rounded-lg p-6 mb-4">
                    <div class="text-center text-white/70">
                        <i class="fas fa-chart-line text-4xl mb-4"></i>
                        <p>Interactive chart showing your habit completion rates over time</p>
                    </div>
                </div>
                <button class="btn-primary w-full" onclick="loadAnalyticsData()">
                    <i class="fas fa-sync-alt mr-2"></i>
                    Load Analytics Data
                </button>
            </div>

            <div class="glass-card p-6">
                <h3 class="text-xl font-bold text-white mb-4">
                    <i class="fas fa-lightbulb text-yellow-400 mr-2"></i>
                    AI Insights & Recommendations
                </h3>
                <div class="space-y-4">
                    <div class="bg-green-400/10 border border-green-400/20 rounded-lg p-4">
                        <div class="flex items-start">
                            <i class="fas fa-thumbs-up text-green-400 mr-3 mt-1"></i>
                            <div>
                                <h4 class="font-semibold text-green-300 mb-1">Great Progress!</h4>
                                <p class="text-white/70 text-sm">Your consistency has improved 15% this month. Keep up the momentum!</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-blue-400/10 border border-blue-400/20 rounded-lg p-4">
                        <div class="flex items-start">
                            <i class="fas fa-info-circle text-blue-400 mr-3 mt-1"></i>
                            <div>
                                <h4 class="font-semibold text-blue-300 mb-1">Optimization Tip</h4>
                                <p class="text-white/70 text-sm">Consider adding a rest day between high-intensity workouts for better recovery.</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-purple-400/10 border border-purple-400/20 rounded-lg p-4">
                        <div class="flex items-start">
                            <i class="fas fa-target text-purple-400 mr-3 mt-1"></i>
                            <div>
                                <h4 class="font-semibold text-purple-300 mb-1">Goal Suggestion</h4>
                                <p class="text-white/70 text-sm">Ready for a new challenge? Try increasing your weekly workout frequency by 1 session.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateClientManagementContent() {
    return `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-white mb-4">
                <i class="fas fa-users text-blue-400 mr-3"></i>
                Client Management - Grow Your Coaching Business
            </h2>
            <p class="text-white/70 mb-6">Manage your clients, track their progress, and grow your fitness coaching business with powerful tools.</p>
        </div>

        <!-- Client Overview Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="stats-card">
                <div class="text-2xl font-bold text-white mb-2" id="total-clients">0</div>
                <div class="text-white/70 text-sm">Total Clients</div>
                <div class="text-blue-400 text-xs">Active accounts</div>
            </div>
            <div class="stats-card">
                <div class="text-2xl font-bold text-white mb-2" id="active-clients">0</div>
                <div class="text-white/70 text-sm">Active This Week</div>
                <div class="text-green-400 text-xs">Engaged</div>
            </div>
            <div class="stats-card">
                <div class="text-2xl font-bold text-white mb-2" id="retention-rate">0%</div>
                <div class="text-white/70 text-sm">Retention Rate</div>
                <div class="text-purple-400 text-xs">Success metric</div>
            </div>
            <div class="stats-card">
                <div class="text-2xl font-bold text-white mb-2" id="avg-client-progress">0</div>
                <div class="text-white/70 text-sm">Avg Client Score</div>
                <div class="text-yellow-400 text-xs">Performance</div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="glass-card p-6 text-center cursor-pointer hover:bg-white/10 transition-all" onclick="showAddClientModal()">
                <i class="fas fa-user-plus text-3xl text-green-400 mb-4"></i>
                <h3 class="text-lg font-bold text-white mb-2">Add New Client</h3>
                <p class="text-white/70 text-sm">Invite clients to join your program</p>
            </div>
            <div class="glass-card p-6 text-center cursor-pointer hover:bg-white/10 transition-all" onclick="loadCoachAnalytics()">
                <i class="fas fa-chart-line text-3xl text-blue-400 mb-4"></i>
                <h3 class="text-lg font-bold text-white mb-2">Business Analytics</h3>
                <p class="text-white/70 text-sm">Track your coaching metrics</p>
            </div>
            <div class="glass-card p-6 text-center cursor-pointer hover:bg-white/10 transition-all" onclick="loadProgramTemplates()">
                <i class="fas fa-clipboard-list text-3xl text-purple-400 mb-4"></i>
                <h3 class="text-lg font-bold text-white mb-2">Program Templates</h3>
                <p class="text-white/70 text-sm">Create and manage workouts</p>
            </div>
        </div>

        <!-- Client List -->
        <div class="glass-card p-6">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-white">
                    <i class="fas fa-users mr-2"></i>
                    Your Clients
                </h3>
                <button class="btn-primary" onclick="loadClientsData()">
                    <i class="fas fa-sync-alt mr-2"></i>
                    Refresh Data
                </button>
            </div>
            <div id="clients-list">
                <div class="text-center py-12 text-white/50">
                    <i class="fas fa-users text-4xl mb-4"></i>
                    <p class="mb-4">No clients found</p>
                    <button class="btn-secondary" onclick="showAddClientModal()">Add Your First Client</button>
                </div>
            </div>
        </div>
    `;
}

// Helper functions for role-specific features
async function loadLearningContent() {
    try {
        const response = await fetch('/api/beginner/learning-hub', {
            headers: { 'x-session-id': sessionId }
        });
        if (response.ok) {
            const data = await response.json();
            console.log('Learning content loaded:', data);
            showNotification('Loading interactive tutorials...', 'success');
        } else {
            showNotification('Learning content will be available soon!', 'info');
        }
    } catch (error) {
        console.error('Error loading learning content:', error);
        showNotification('Learning hub features coming soon!', 'info');
    }
}

async function loadAnalyticsData() {
    try {
        const response = await fetch('/api/intermediate/analytics', {
            headers: { 'x-session-id': sessionId }
        });
        if (response.ok) {
            const data = await response.json();
            console.log('Analytics data loaded:', data);
            showNotification('Analytics data refreshed!', 'success');
        } else {
            showNotification('Analytics will be available soon!', 'info');
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        showNotification('Advanced analytics coming soon!', 'info');
    }
}

async function loadClientsData() {
    try {
        const response = await fetch('/api/coach/clients', {
            headers: { 'x-session-id': sessionId }
        });
        if (response.ok) {
            const data = await response.json();
            console.log('Clients data loaded:', data);
            displayClientsData(data);
        } else {
            showNotification('Client management will be available soon!', 'info');
        }
    } catch (error) {
        console.error('Error loading clients:', error);
        showNotification('Client features coming soon!', 'info');
    }
}

function displayClientsData(data) {
    const clientsList = document.getElementById('clients-list');
    const totalClientsEl = document.getElementById('total-clients');
    const activeClientsEl = document.getElementById('active-clients');
    const retentionRateEl = document.getElementById('retention-rate');
    
    if (totalClientsEl) totalClientsEl.textContent = data.summary?.total_clients || 0;
    if (activeClientsEl) activeClientsEl.textContent = data.summary?.active_clients || 0;
    if (retentionRateEl) retentionRateEl.textContent = `${data.coach_stats?.retention_rate || 0}%`;
    
    if (data.clients && data.clients.length > 0) {
        clientsList.innerHTML = data.clients.map(client => `
            <div class="bg-white/5 border border-white/10 rounded-lg p-4 mb-4 hover:bg-white/10 transition-all">
                <div class="flex justify-between items-center">
                    <div>
                        <h4 class="font-semibold text-white">${client.name}</h4>
                        <p class="text-white/70 text-sm">${client.email}</p>
                        <div class="flex space-x-4 mt-2 text-xs">
                            <span class="text-blue-400">
                                <i class="fas fa-calendar mr-1"></i>
                                ${client.total_habits} habits
                            </span>
                            <span class="text-green-400">
                                <i class="fas fa-check mr-1"></i>
                                ${client.weekly_completions} this week
                            </span>
                            <span class="text-purple-400">
                                <i class="fas fa-star mr-1"></i>
                                ${client.points} points
                            </span>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-lg font-bold ${client.engagement_score > 70 ? 'text-green-400' : client.engagement_score > 40 ? 'text-yellow-400' : 'text-red-400'}">
                            ${client.engagement_score}%
                        </div>
                        <div class="text-white/60 text-xs">Engagement</div>
                        ${client.needs_attention ? '<div class="text-red-400 text-xs mt-1"><i class="fas fa-exclamation-triangle mr-1"></i>Needs Attention</div>' : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Add missing content generators
function generateHabitsContent() {
    return generateExistingHabitsContent(); // Use existing habits section
}

function generateNutritionContent() {
    return generateExistingNutritionContent(); // Use existing nutrition section  
}

function generateAchievementsContent() {
    return generateExistingAchievementsContent(); // Use existing achievements section
}

function generateProgressContent() {
    return generateExistingProgressContent(); // Use existing progress section
}

// Placeholder functions for other role-specific sections
function generateGuidedWorkoutsContent() {
    return `<div class="text-center py-12 text-white/50">
        <i class="fas fa-play-circle text-4xl mb-4"></i>
        <h3 class="text-xl font-bold mb-2">Guided Workouts</h3>
        <p>Step-by-step workout instructions coming soon!</p>
    </div>`;
}

function generateWorkoutVariationsContent() {
    return `<div class="text-center py-12 text-white/50">
        <i class="fas fa-exchange-alt text-4xl mb-4"></i>
        <h3 class="text-xl font-bold mb-2">Workout Variations</h3>
        <p>Exercise modifications and progressions coming soon!</p>
    </div>`;
}

function generateChallengesContent() {
    return `<div class="text-center py-12 text-white/50">
        <i class="fas fa-medal text-4xl mb-4"></i>
        <h3 class="text-xl font-bold mb-2">Challenges</h3>
        <p>Create and join fitness challenges coming soon!</p>
    </div>`;
}

function generatePerformanceContent() {
    return `<div class="text-center py-12 text-white/50">
        <i class="fas fa-tachometer-alt text-4xl mb-4"></i>
        <h3 class="text-xl font-bold mb-2">Performance Metrics</h3>
        <p>Advanced performance tracking coming soon!</p>
    </div>`;
}

function generateProgramBuilderContent() {
    return `<div class="text-center py-12 text-white/50">
        <i class="fas fa-cogs text-4xl mb-4"></i>
        <h3 class="text-xl font-bold mb-2">Program Builder</h3>
        <p>Custom workout program creation coming soon!</p>
    </div>`;
}

function generateCompetitionsContent() {
    return `<div class="text-center py-12 text-white/50">
        <i class="fas fa-calendar-alt text-4xl mb-4"></i>
        <h3 class="text-xl font-bold mb-2">Competition Calendar</h3>
        <p>Track competitions and peak timing coming soon!</p>
    </div>`;
}

function generateProgramTemplatesContent() {
    return `<div class="text-center py-12 text-white/50">
        <i class="fas fa-clipboard-list text-4xl mb-4"></i>
        <h3 class="text-xl font-bold mb-2">Program Templates</h3>
        <p>Workout template management coming soon!</p>
    </div>`;
}

function generateBusinessToolsContent() {
    return `<div class="text-center py-12 text-white/50">
        <i class="fas fa-briefcase text-4xl mb-4"></i>
        <h3 class="text-xl font-bold mb-2">Business Tools</h3>
        <p>Scheduling and billing integration coming soon!</p>
    </div>`;
}

// Helper functions to reference existing content
function generateExistingHabitsContent() {
    // Keep the existing habits section content
    const existingHabitsSection = document.getElementById('habits-section');
    return existingHabitsSection ? existingHabitsSection.innerHTML : generateDefaultHabitsContent();
}

function generateExistingNutritionContent() {
    const existingNutritionSection = document.getElementById('nutrition-section');
    return existingNutritionSection ? existingNutritionSection.innerHTML : generateDefaultNutritionContent();
}

function generateExistingAchievementsContent() {
    const existingAchievementsSection = document.getElementById('achievements-section');
    return existingAchievementsSection ? existingAchievementsSection.innerHTML : generateDefaultAchievementsContent();
}

function generateExistingProgressContent() {
    const existingProgressSection = document.getElementById('progress-section');
    return existingProgressSection ? existingProgressSection.innerHTML : generateDefaultProgressContent();
}

function generateDefaultHabitsContent() {
    return `
        <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h3 class="text-2xl font-bold text-white">Your Fitness Habits</h3>
                    <p class="text-white/70">Track your daily habits and build consistency</p>
                </div>
                <button onclick="showCreateHabitModal()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>
                    Add New Habit
                </button>
            </div>
        </div>
        <div id="habits-container">
            <div class="text-center py-12 text-white/50">
                <i class="fas fa-spinner fa-spin text-4xl mb-4"></i>
                <p>Loading your habits...</p>
            </div>
        </div>
    `;
}

function generateDefaultNutritionContent() {
    return `<div class="text-center py-12 text-white/50">
        <i class="fas fa-apple-alt text-4xl mb-4"></i>
        <h3 class="text-xl font-bold mb-2">Nutrition Tracking</h3>
        <p>Monitor your nutrition and fuel your fitness journey</p>
    </div>`;
}

function generateDefaultAchievementsContent() {
    return `<div class="text-center py-12 text-white/50">
        <i class="fas fa-trophy text-4xl mb-4"></i>
        <h3 class="text-xl font-bold mb-2">Achievements</h3>
        <p>Unlock badges and track your milestones</p>
    </div>`;
}

function generateDefaultProgressContent() {
    return `<div class="text-center py-12 text-white/50">
        <i class="fas fa-images text-4xl mb-4"></i>
        <h3 class="text-xl font-bold mb-2">Progress Gallery</h3>
        <p>Upload and track your fitness progress photos</p>
    </div>`;
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
    
    // Use SAME week calculation as habits page - CRITICAL FIX
    const weekStart = getWeekStart(currentWeekOffset || 0);
    const weekDays = Array.from({length: 7}, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        return date;
    });
    
    const completions = habit.completions || [];
    const weekCompletions = weekDays.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        return completions.includes(dateStr);
    });
    
    const completedCount = weekCompletions.filter(Boolean).length;
    const targetCount = habit.weekly_target || 7;
    const progressPercent = Math.round((completedCount / targetCount) * 100);
    
    console.log('📊 Dashboard progress element:', {
        habitName: habit.name,
        completionsFromServer: completions,
        weekDaysGenerated: weekDays.map(d => d.toISOString().split('T')[0]),
        weekCompletionsCalculated: weekCompletions,
        completedCount: completedCount,
        targetCount: targetCount
    });
    
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
        loadHabitsAndUpdateDashboard(), // Load habits and update both sections
        loadDashboardGoals(),          // Load goals for dashboard
        loadDashboardNutrition(),      // Load today's nutrition for dashboard
        loadMedia(),
        loadAchievements(),
        loadDailyChallenges(),
        loadAdminData()
    ]);
    
    // Initialize habits after dashboard data is loaded
    setTimeout(() => {
        initializeHabits();
    }, 100);
}

// ==============================
// DASHBOARD GOALS AND NUTRITION
// ==============================

async function loadDashboardGoals() {
    try {
        const response = await fetch('/api/goals', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayDashboardGoals(data.goals || []);
        } else {
            console.error('Failed to load dashboard goals');
            document.getElementById('dashboard-goals-container').innerHTML = 
                '<div class="text-center py-4 text-white/50"><i class="fas fa-exclamation-triangle mb-2"></i><p>No goals found</p></div>';
        }
    } catch (error) {
        console.error('Dashboard goals error:', error);
        document.getElementById('dashboard-goals-container').innerHTML = 
            '<div class="text-center py-4 text-white/50"><i class="fas fa-exclamation-triangle mb-2"></i><p>Error loading goals</p></div>';
    }
}

async function loadDashboardNutrition() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/nutrition?date=${today}`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayDashboardNutrition(data.logs || []);
        } else {
            console.error('Failed to load dashboard nutrition');
            document.getElementById('dashboard-nutrition-container').innerHTML = 
                '<div class="text-center py-4 text-white/50"><i class="fas fa-utensils mb-2"></i><p>No meals logged today</p></div>';
        }
    } catch (error) {
        console.error('Dashboard nutrition error:', error);
        document.getElementById('dashboard-nutrition-container').innerHTML = 
            '<div class="text-center py-4 text-white/50"><i class="fas fa-exclamation-triangle mb-2"></i><p>Error loading nutrition</p></div>';
    }
}

function displayDashboardGoals(goals) {
    const container = document.getElementById('dashboard-goals-container');
    
    if (goals.length === 0) {
        container.innerHTML = `
            <div class="text-center py-6 text-white/50">
                <i class="fas fa-target text-3xl mb-3"></i>
                <p class="mb-3">No active goals yet</p>
                <button onclick="showSection('goals')" class="btn-secondary text-sm">
                    <i class="fas fa-plus mr-2"></i>Set Your First Goal
                </button>
            </div>
        `;
        return;
    }
    
    // Show first 3 active goals
    const activeGoals = goals.filter(g => g.status === 'active').slice(0, 3);
    
    container.innerHTML = activeGoals.map(goal => `
        <div class="goal-card-mini mb-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold text-white text-sm">${goal.title}</h4>
                <span class="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                    ${Math.round(goal.progress_percentage || 0)}%
                </span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2">
                <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                     style="width: ${Math.min(goal.progress_percentage || 0, 100)}%"></div>
            </div>
            <div class="text-xs text-white/60 mt-1">
                Target: ${new Date(goal.target_date).toLocaleDateString()}
            </div>
        </div>
    `).join('') + (goals.length > 3 ? `
        <div class="text-center mt-3">
            <button onclick="showSection('goals')" class="text-blue-400 hover:text-blue-300 text-sm">
                View all ${goals.length} goals <i class="fas fa-arrow-right ml-1"></i>
            </button>
        </div>
    ` : '');
}

function displayDashboardNutrition(logs) {
    const container = document.getElementById('dashboard-nutrition-container');
    
    if (logs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-6 text-white/50">
                <i class="fas fa-utensils text-3xl mb-3"></i>
                <p class="mb-3">No meals logged today</p>
                <button onclick="showSection('nutrition')" class="btn-secondary text-sm">
                    <i class="fas fa-plus mr-2"></i>Log Your First Meal
                </button>
            </div>
        `;
        return;
    }
    
    // Calculate totals
    const totals = logs.reduce((sum, log) => ({
        calories: sum.calories + (log.calories || 0),
        protein: sum.protein + (log.protein || 0),
        carbs: sum.carbs + (log.carbs || 0),
        fat: sum.fat + (log.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    container.innerHTML = `
        <div class="grid grid-cols-4 gap-4 mb-4">
            <div class="text-center">
                <div class="text-2xl font-bold text-orange-400">${totals.calories}</div>
                <div class="text-xs text-white/60">Calories</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-red-400">${totals.protein}g</div>
                <div class="text-xs text-white/60">Protein</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-yellow-400">${totals.carbs}g</div>
                <div class="text-xs text-white/60">Carbs</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-green-400">${totals.fat}g</div>
                <div class="text-xs text-white/60">Fat</div>
            </div>
        </div>
        <div class="space-y-2">
            ${logs.slice(0, 3).map(log => `
                <div class="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-utensils text-white/40"></i>
                        <div>
                            <div class="text-white font-medium text-sm">${log.food_name}</div>
                            <div class="text-white/60 text-xs">${log.calories || 0} cal • ${log.meal_type || 'meal'}</div>
                        </div>
                    </div>
                    <div class="text-white/60 text-xs">
                        ${new Date(log.logged_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
            `).join('')}
        </div>
        ${logs.length > 3 ? `
            <div class="text-center mt-3">
                <button onclick="showSection('nutrition')" class="text-blue-400 hover:text-blue-300 text-sm">
                    View all ${logs.length} meals <i class="fas fa-arrow-right ml-1"></i>
                </button>
            </div>
        ` : ''}
    `;
}

// ==============================
// LEGACY HABIT CODE CLEANED UP
// ==============================
// This section contained old habit management code that has been replaced 
// by the comprehensive habit management system at the end of this file.



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
                <button class="btn-primary flex-1 complete-habit-btn" data-habit-id="${habit.id}">
                    <i class="fas fa-check mr-2"></i>
                    Mark Complete
                </button>
            ` : `
                <div class="flex-1 bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-2 text-center text-green-400">
                    <i class="fas fa-check-circle mr-2"></i>
                    Completed Today!
                </div>
            `}
            <button class="btn-danger delete-habit-btn" data-habit-id="${habit.id}">
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
    
    // Calculate this week's dates
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    // Get habit completions (use the correct data from API)
    const completions = habit.completions || [];
    
    const weekCalendar = days.map((dayName, dayIndex) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + dayIndex);
        const dateStr = dayDate.toISOString().split('T')[0];
        
        // FIXED: Check if the actual date string is in completions array
        const isCompleted = completions.includes(dateStr);
        const isToday = dayDate.toDateString() === today.toDateString();
        
        return `
            <div class="day-cell habit-day-cell ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}" 
                 data-habit-id="${habit.id}" 
                 data-date="${dateStr}">
                <div class="text-xs text-white/70 font-medium">${dayName}</div>
                <div class="text-lg mt-1">${isCompleted ? '✓' : '○'}</div>
                <div class="text-xs text-white/60">${dayDate.getDate()}</div>
            </div>
        `;
    }).join('');
    
    // Calculate correct stats for this week
    const weekCompletions = days.map((_, dayIndex) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + dayIndex);
        const dateStr = dayDate.toISOString().split('T')[0];
        return completions.includes(dateStr);
    });
    
    const completedCount = weekCompletions.filter(Boolean).length;
    const targetCount = habit.weekly_target || 7;
    
    // DEBUG: Log habit creation details
    console.log('🏗️ Creating habit card:', {
        habitName: habit.name,
        habitId: habit.id,
        completionsArray: completions,
        weekDays: weekDays.map(d => d.toISOString().split('T')[0]),
        weekCompletions: weekCompletions,
        completedCount: completedCount,
        targetCount: targetCount
    });
    
    div.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <div>
                <h3 class="text-white font-semibold text-lg">${habit.name}</h3>
                ${habit.description ? `<p class="text-white/60 text-sm mt-1">${habit.description}</p>` : ''}
                <p class="text-white/70 text-sm mt-2">
                    <span class="text-green-400 font-semibold">${completedCount}</span> / ${targetCount} days this week
                </p>
            </div>
            <button class="btn-danger delete-habit-btn" data-habit-id="${habit.id}" title="Delete habit">
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
                <button class="btn-primary complete-habit-btn" data-habit-id="${habit.id}">
                    <i class="fas fa-check mr-2"></i>
                    Complete
                </button>
                <button class="btn-secondary delete-habit-btn" data-habit-id="${habit.id}" title="Delete habit">
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
            await loadHabitsAndUpdateDashboard(); // Refresh both with same data
            
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
            await loadHabitsAndUpdateDashboard();
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

// Legacy createHabit and deleteHabit functions moved to comprehensive habit system

// Media functions
// Enhanced Media Upload with Modal
function showMediaUploadModal() {
    const modal = document.getElementById('media-upload-modal');
    modal.classList.remove('hidden');
    
    // Reset form
    document.getElementById('media-upload-form').reset();
    
    // Set default media type based on current filter selection, fallback to progress
    const currentFilter = document.getElementById('gallery-filter').value;
    let defaultType = 'progress';
    
    // If user is viewing before/after photos, suggest that type
    if (currentFilter === 'before' || currentFilter === 'after') {
        defaultType = currentFilter;
    }
    
    // Set the default media type
    const defaultRadio = document.querySelector(`input[name="media_type"][value="${defaultType}"]`);
    if (defaultRadio) {
        defaultRadio.checked = true;
    }
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
                const mediaResponse = await fallbackResponse.json();
                // Fix: displayMedia expects an array, but API returns {media: [...]}
                const mediaArray = mediaResponse.media || [];
                displayMedia(mediaArray);
                // Also update stats for the fallback
                const stats = {
                    total: mediaArray.length,
                    before_count: mediaArray.filter(m => m.media_type === 'before').length,
                    after_count: mediaArray.filter(m => m.media_type === 'after').length,
                    comparison_count: 0
                };
                updateMediaStats({ stats });
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
    
    // Store media items globally for reference
    window.mediaItems = window.mediaItems || {};
    data.media.forEach(item => {
        window.mediaItems[item.id] = item;
    });
    
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
        
        const mediaType = item.media_type || 'progress';
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
                
                <!-- Comparison Overlay -->
                <div class="comparison-overlay">
                    <div class="comparison-controls">
                        <button onclick="event.stopPropagation(); addToComparison('${item.id}')" class="btn-compare">
                            <i class="fas fa-plus mr-1"></i>Compare
                        </button>
                        <button onclick="event.stopPropagation(); showEnhancedMediaModal(window.mediaItems['${item.id}'])" class="btn-compare">
                            <i class="fas fa-expand mr-1"></i>View
                        </button>
                    </div>
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
                        ${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} ${isVideo ? 'Video' : 'Photo'} • ${(item.file_size / 1024 / 1024).toFixed(1)}MB
                    </div>
                `}
            </div>
        `;
        
        container.appendChild(div);
        
        // Load the actual media after a brief delay to ensure DOM is ready
        setTimeout(() => {
            loadMediaPreview(item.id, `media-${item.id}`, isVideo);
        }, 100);
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
    const stats = {
        total: media.length,
        before_count: media.filter(m => m.media_type === 'before').length,
        after_count: media.filter(m => m.media_type === 'after').length,
        comparison_count: 0
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
                // Remove the placeholder icon but keep other elements
                const placeholderIcon = container.querySelector('.fas');
                if (placeholderIcon) {
                    placeholderIcon.remove();
                }
                
                // Create the media element
                let mediaElement;
                if (isVideo) {
                    mediaElement = document.createElement('video');
                    mediaElement.style.cssText = 'width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 1;';
                    mediaElement.muted = true;
                    
                    const source = document.createElement('source');
                    source.src = mediaUrl;
                    source.type = blob.type;
                    mediaElement.appendChild(source);
                } else {
                    mediaElement = document.createElement('img');
                    mediaElement.src = mediaUrl;
                    mediaElement.alt = 'Media preview';
                    mediaElement.style.cssText = 'width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 1;';
                }
                
                // Insert the media element as the first child (behind overlays)
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
                        <img src="${mediaUrl}" alt="Media preview" style="width: 100%; max-height: 70vh; object-fit: contain;">
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
    console.log('🗑️ Delete media from modal called for:', mediaId);
    showConfirmationModal(
        'Are you sure you want to delete this media? This action cannot be undone and will deduct points from your account.',
        async function() {
            console.log('🗑️ Confirmation callback executed for:', mediaId);
            await performMediaDeletion(mediaId);
        }
    );
}

// Core media deletion function (no confirmation)
async function performMediaDeletion(mediaId) {
    console.log('🚀 Performing media deletion for:', mediaId);
    try {
        console.log('📡 Sending DELETE request to:', `/api/media/${mediaId}/delete`);
        const response = await fetch(`/api/media/${mediaId}/delete`, {
            method: 'DELETE',
            headers: { 'x-session-id': sessionId }
        });
        
        console.log('📡 Response received:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Delete successful:', data);
            showNotification(`Media deleted successfully! (-${data.points_deducted} pts)`, 'success');
            
            // Close modal first
            document.getElementById('media-modal').classList.add('hidden');
            
            // Reload media gallery and update stats
            loadMedia();
            updateDashboardStats();
        } else {
            const error = await response.json();
            console.error('❌ Delete failed:', error);
            showNotification(error.error || 'Failed to delete media', 'error');
        }
    } catch (error) {
        console.error('💥 Delete media error:', error);
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
        container.innerHTML = '<p class="text-white/70 text-center">No achievements available yet. Keep using StriveTrack to earn achievements automatically!</p>';
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
                ${achievement.is_completed ? '<span style="color: #10b981;">✅</span>' : '<span style="color: rgba(255,255,255,0.4);">⏳</span>'}
            </div>
            
            ${achievement.is_completed && achievement.earned_at ? `
                <div style="color: #10b981; font-size: 10px; margin-top: 4px;">
                    🎉 Earned ${new Date(achievement.earned_at).toLocaleDateString()}
                </div>
            ` : `
                <div style="color: rgba(255,255,255,0.5); font-size: 10px; margin-top: 4px; font-style: italic;">
                    ${achievement.progress_percentage || 0}% progress - Earned automatically!
                </div>
            `}
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

// Achievement unlocking is now 100% automatic - no manual claiming needed!

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
            
            // Show notifications for newly earned achievements
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
            { icon: '🎯', label: 'Remaining', value: achievementStats.total_achievements - achievementStats.earned_achievements, color: '#8b5cf6' }
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
            ${challenge.current_progress >= challenge.requirement_value ? `
                <button onclick="completeChallenge('${challenge.id}')" 
                        class="complete-challenge-btn"
                        style="width: 100%; padding: 8px 16px; background: linear-gradient(135deg, #10b981, #059669); 
                               color: white; border: none; border-radius: 8px; font-weight: 600; 
                               cursor: pointer; margin-bottom: 8px; transition: all 0.2s ease;">
                    🎯 Claim Reward
                </button>
            ` : `
                <div style="text-align: center; padding: 8px; background: rgba(255, 255, 255, 0.1); 
                           border-radius: 8px; font-size: 0.75rem; opacity: 0.7; margin-bottom: 8px;">
                    Complete requirements to claim
                </div>
            `}
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

// Complete Daily Challenge Function
async function completeChallenge(challengeId) {
    const button = event.target;
    const originalText = button.textContent;
    
    try {
        // Disable button and show loading
        button.disabled = true;
        button.textContent = '⏳ Completing...';
        button.style.opacity = '0.6';
        
        const response = await fetch('/api/challenges/daily', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify({ challenge_id: challengeId })
        });

        const result = await response.json();

        if (response.ok && result.completed) {
            // Show success message
            showNotification(`🎉 ${result.message}`, 'success');
            
            // Refresh challenges and other data
            await Promise.all([
                loadDailyChallenges(),
                loadAchievements() // Refresh achievements in case new ones were unlocked
            ]);
        } else {
            // Show error message
            const errorMsg = result.error || 'Failed to complete challenge';
            showNotification(`❌ ${errorMsg}`, 'error');
            
            // Reset button
            button.disabled = false;
            button.textContent = originalText;
            button.style.opacity = '1';
        }
    } catch (error) {
        console.error('Complete challenge error:', error);
        showNotification('❌ Failed to complete challenge', 'error');
        
        // Reset button
        button.disabled = false;
        button.textContent = originalText;
        button.style.opacity = '1';
    }
}

function createStatCard(statCard) {
    const div = document.createElement('div');
    let cardClass = 'streak-card achievement-stat-card';
    
    // Add special styling for progress achievements
    if (statCard.label === 'Progress' && statCard.value > 0) {
        cardClass += ' has-progress';
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
                <button class="edit-nutrition-btn text-blue-400 hover:text-blue-300 text-xs" data-nutrition-id="${log.id}" title="Edit entry">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-nutrition-btn text-red-400 hover:text-red-300 text-xs" data-nutrition-id="${log.id}" title="Delete entry">
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
    
    // Show loading state immediately
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Logging Nutrition...';
    submitBtn.disabled = true;
    
    try {
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
        
        // Validate required fields
        if (!formData.food_name || formData.food_name.trim() === '') {
            showNotification('Food name is required', 'error');
            return;
        }
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
    } finally {
        // Always restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Delete nutrition entry function
async function deleteNutrition(nutritionId) {
    if (!confirm('Are you sure you want to delete this nutrition entry? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/nutrition/${nutritionId}`, {
            method: 'DELETE',
            headers: {
                'x-session-id': sessionId
            }
        });
        
        if (response.ok) {
            showNotification('Nutrition entry deleted successfully', 'success');
            loadNutrition(); // Refresh nutrition data
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Failed to delete nutrition entry', 'error');
        }
    } catch (error) {
        console.error('Nutrition deletion error:', error);
        showNotification('Failed to delete nutrition entry', 'error');
    }
}

// Weight Tracking Functions
async function loadWeight() {
    try {
        const response = await fetch('/api/weight', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayWeightData(data);
        } else {
            console.error('Failed to load weight data');
            displayEmptyWeightState();
        }
    } catch (error) {
        console.error('Load weight error:', error);
        displayEmptyWeightState();
    }
}

function displayWeightData(data) {
    const { weight_logs, current_goal, user_info, stats } = data;
    
    // Update weight stats
    if (stats && Object.keys(stats).length > 0) {
        const weightUnit = user_info?.weight_unit || 'kg';
        // Store globally for other functions to use
        window.currentWeightUnit = weightUnit;
        const currentWeight = weightUnit === 'lbs' 
            ? (stats.current_weight * 2.20462).toFixed(1) 
            : stats.current_weight?.toFixed(1) || '-';
            
        document.getElementById('current-weight').textContent = currentWeight;
        document.getElementById('weight-unit').textContent = weightUnit;
        document.getElementById('current-bmi').textContent = stats.latest_bmi?.toFixed(1) || '-';
        document.getElementById('bmi-category').textContent = stats.bmi_category || '-';
        
        const weightChange = stats.weight_change || 0;
        const changeElement = document.getElementById('weight-change');
        const displayWeightChange = weightUnit === 'lbs' ? (weightChange * 2.20462) : weightChange;
        const changeText = displayWeightChange > 0 ? `+${displayWeightChange.toFixed(1)}` : displayWeightChange.toFixed(1);
        changeElement.textContent = changeText + ' ' + weightUnit;
        changeElement.className = weightChange > 0 ? 'weight-change-positive' : 'weight-change-negative';
        
        document.getElementById('total-logs').textContent = stats.total_logs || 0;
    }
    
    // Display current goal
    displayWeightGoal(current_goal);
    
    // Display weight log history
    displayWeightLogs(weight_logs || []);
    
    // Set default values in modals
    if (user_info) {
        document.getElementById('weight-unit-selector').value = user_info.weight_unit || 'kg';
        document.getElementById('goal-weight-unit').textContent = user_info.weight_unit || 'kg';
        document.getElementById('goal-target-unit').textContent = user_info.weight_unit || 'kg';
        
        if (user_info.current_weight_kg) {
            const displayWeight = user_info.weight_unit === 'lbs' 
                ? (user_info.current_weight_kg * 2.20462).toFixed(1)
                : user_info.current_weight_kg.toFixed(1);
            document.getElementById('current-weight-goal').value = displayWeight;
        }
    }
}

function displayWeightGoal(goal) {
    const goalContent = document.getElementById('weight-goal-content');
    
    if (goal) {
        const progress = calculateGoalProgress(goal);
        const weightUnit = window.currentWeightUnit || 'kg';
        const currentWeight = weightUnit === 'lbs' ? (goal.current_weight_kg * 2.20462).toFixed(1) : goal.current_weight_kg.toFixed(1);
        const targetWeight = weightUnit === 'lbs' ? (goal.target_weight_kg * 2.20462).toFixed(1) : goal.target_weight_kg.toFixed(1);
        
        goalContent.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <div>
                    <div class="text-lg font-bold text-white">${goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)} Weight Goal</div>
                    <div class="text-white/70 text-sm">
                        ${currentWeight} ${weightUnit} → ${targetWeight} ${weightUnit}
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-white">${progress.percentage}%</div>
                    <div class="text-white/60 text-xs">Complete</div>
                </div>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2 mb-3">
                <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
                     style="width: ${Math.min(progress.percentage, 100)}%"></div>
            </div>
            ${goal.target_date ? `
                <div class="text-white/60 text-sm">
                    Target: ${new Date(goal.target_date).toLocaleDateString()}
                    ${goal.weekly_goal_kg ? `• ${goal.weekly_goal_kg.toFixed(1)} kg/week` : ''}
                </div>
            ` : ''}
        `;
    } else {
        goalContent.innerHTML = `
            <div class="text-center py-6 text-white/50">
                <i class="fas fa-bullseye text-2xl mb-2"></i>
                <p>Set a weight goal to track your progress</p>
            </div>
        `;
    }
}

function calculateGoalProgress(goal) {
    // This would need current weight from latest log
    // For now, return a placeholder
    return { percentage: 0 };
}

function displayWeightLogs(logs) {
    const container = document.getElementById('weight-log-container');
    
    if (logs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-white/50">
                <i class="fas fa-weight-hanging text-3xl mb-2"></i>
                <p>No weight entries yet</p>
                <p class="text-sm">Log your first weight to start tracking progress</p>
            </div>
        `;
        return;
    }
    
    // Get user's weight unit preference from the first call to displayWeightData
    const weightUnit = window.currentWeightUnit || 'kg';
    
    container.innerHTML = logs.map(log => {
        const displayWeight = weightUnit === 'lbs' ? (log.weight_kg * 2.20462).toFixed(1) : log.weight_kg.toFixed(1);
        return `
        <div class="weight-log-entry">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <i class="fas fa-weight-hanging text-blue-400"></i>
                    </div>
                    <div>
                        <div class="text-white font-medium">${displayWeight} ${weightUnit}</div>
                        <div class="text-white/60 text-sm">${new Date(log.logged_date).toLocaleDateString()}</div>
                        ${log.bmi ? `<div class="text-white/60 text-xs">BMI: ${log.bmi.toFixed(1)}</div>` : ''}
                    </div>
                </div>
                <div class="text-right">
                    ${log.body_fat_percentage ? `<div class="text-white/80 text-sm">${log.body_fat_percentage}% BF</div>` : ''}
                    ${log.notes ? `<div class="text-white/60 text-xs max-w-32 truncate">${log.notes}</div>` : ''}
                    <button class="delete-weight-btn text-red-400 hover:text-red-300 text-xs mt-1" data-weight-id="${log.id}" title="Delete entry">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function displayEmptyWeightState() {
    document.getElementById('current-weight').textContent = '-';
    document.getElementById('current-bmi').textContent = '-';
    document.getElementById('bmi-category').textContent = '-';
    document.getElementById('weight-change').textContent = '-';
    document.getElementById('total-logs').textContent = '0';
    
    displayWeightLogs([]);
}

function showWeightLogModal() {
    // Set today's date as default
    document.getElementById('log-date').value = new Date().toISOString().split('T')[0];
    showModal('weight-log-modal');
}

function showWeightGoalModal() {
    showModal('weight-goal-modal');
}

async function submitWeightLog(event) {
    event.preventDefault();
    
    // Show loading state immediately
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Logging Weight...';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(event.target);
        const weightData = {
            weight: parseFloat(formData.get('weight')),
            logged_date: formData.get('logged_date'),
            body_fat_percentage: formData.get('body_fat_percentage') ? parseFloat(formData.get('body_fat_percentage')) : null,
            notes: formData.get('notes') || null
        };
        
        const response = await fetch('/api/weight', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify(weightData)
        });
        
        if (response.ok) {
            const data = await response.json();
            showNotification(data.message, 'success');
            closeModal('weight-log-modal');
            document.getElementById('weight-log-form').reset();
            loadWeight(); // Refresh weight data
            
            // Check for achievements
            checkAndAwardAchievements('weight_log');
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Failed to log weight', 'error');
        }
    } catch (error) {
        console.error('Weight log submission error:', error);
        showNotification('Failed to log weight', 'error');
    } finally {
        // Always restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function submitWeightGoal(event) {
    event.preventDefault();
    
    // Show loading state immediately
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Setting Goal...';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(event.target);
        const goalData = {
            goal_type: formData.get('goal_type'),
            current_weight_kg: parseFloat(formData.get('current_weight')),
            target_weight_kg: parseFloat(formData.get('target_weight')),
            target_date: formData.get('target_date') || null
        };
        
        // Convert weights if needed (assuming form shows user's preferred unit)
        const userUnit = document.getElementById('weight-unit-selector').value;
        if (userUnit === 'lbs') {
            goalData.current_weight_kg *= 0.453592;
            goalData.target_weight_kg *= 0.453592;
        }
        
        const response = await fetch('/api/weight/goals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify(goalData)
        });
        
        if (response.ok) {
            const data = await response.json();
            showNotification(data.message, 'success');
            closeModal('weight-goal-modal');
            document.getElementById('weight-goal-form').reset();
            loadWeight(); // Refresh weight data
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Failed to set weight goal', 'error');
        }
    } catch (error) {
        console.error('Weight goal submission error:', error);
        showNotification('Failed to set weight goal', 'error');
    } finally {
        // Always restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Delete weight entry function
async function deleteWeight(weightId) {
    if (!confirm('Are you sure you want to delete this weight entry? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/weight/${weightId}`, {
            method: 'DELETE',
            headers: {
                'x-session-id': sessionId
            }
        });
        
        if (response.ok) {
            showNotification('Weight entry deleted successfully', 'success');
            loadWeight(); // Refresh weight data
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Failed to delete weight entry', 'error');
        }
    } catch (error) {
        console.error('Weight deletion error:', error);
        showNotification('Failed to delete weight entry', 'error');
    }
}

// Goal Setting Functions
async function loadGoals() {
    try {
        const response = await fetch('/api/goals', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayGoals(data);
            populateGoalCategories(data.categories);
        } else {
            console.error('Failed to load goals');
            displayEmptyGoalsState();
        }
    } catch (error) {
        console.error('Load goals error:', error);
        displayEmptyGoalsState();
    }
}

function displayGoals(data) {
    const { goals, stats, categories } = data;
    
    // Update goal stats
    if (stats) {
        document.getElementById('total-goals').textContent = stats.total_goals || 0;
        document.getElementById('active-goals').textContent = stats.active_goals || 0;
        document.getElementById('completed-goals').textContent = stats.completed_goals || 0;
        const completionRate = stats.total_goals > 0 
            ? Math.round((stats.completed_goals / stats.total_goals) * 100) 
            : 0;
        document.getElementById('goal-completion-rate').textContent = completionRate + '%';
    }
    
    // Display goals
    const container = document.getElementById('goals-container');
    const emptyState = document.getElementById('goals-empty-state');
    
    if (goals.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    container.innerHTML = goals.map(goal => createGoalCard(goal)).join('');
}

function createGoalCard(goal) {
    const priorityClass = `goal-priority-${goal.priority}`;
    const statusClass = goal.status === 'completed' ? 'completed' : 
                       (goal.target_date && new Date(goal.target_date) < new Date() && goal.status === 'active') ? 'overdue' : '';
    
    const progressPercentage = goal.progress_percentage || 0;
    const daysLeft = goal.target_date ? Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
    
    return `
        <div class="goal-card ${statusClass}" onclick="showGoalDetails('${goal.id}')">
            <div class="goal-priority-indicator ${priorityClass}"></div>
            
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-2">
                    <span class="text-2xl">${goal.category_icon || '🎯'}</span>
                    <div>
                        <h4 class="font-bold text-white text-lg">${goal.title}</h4>
                        <p class="text-white/60 text-sm">${goal.category_name || goal.category}</p>
                    </div>
                </div>
                <div class="flex flex-col items-end space-y-2">
                    <button class="delete-goal-btn text-red-400 hover:text-red-300 text-sm" data-goal-id="${goal.id}" title="Delete goal" onclick="event.stopPropagation(); handleDeleteGoal(event)">
                        <i class="fas fa-trash"></i>
                    </button>
                    <div class="text-right">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(goal.status)}">
                            ${goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                        </span>
                    </div>
                </div>
            </div>
            
            ${goal.description ? `
                <p class="text-white/70 text-sm mb-3 line-clamp-2">${goal.description}</p>
            ` : ''}
            
            <div class="mb-3">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-white/80 text-sm">Progress</span>
                    <span class="text-white font-medium text-sm">${progressPercentage.toFixed(0)}%</span>
                </div>
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill" style="width: ${Math.min(progressPercentage, 100)}%"></div>
                </div>
            </div>
            
            ${goal.target_value ? `
                <div class="text-white/60 text-sm mb-2">
                    ${goal.current_value || 0} / ${goal.target_value} ${goal.target_unit || ''}
                </div>
            ` : ''}
            
            <div class="flex items-center justify-between text-xs">
                <div class="text-white/60">
                    Started: ${new Date(goal.start_date).toLocaleDateString()}
                </div>
                ${goal.target_date ? `
                    <div class="text-white/60">
                        ${daysLeft !== null ? (daysLeft > 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`) : ''}
                    </div>
                ` : ''}
            </div>
            
            <div class="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                <div class="flex space-x-1">
                    ${[25, 50, 75, 100].map(milestone => `
                        <div class="milestone-badge ${progressPercentage >= milestone ? 'milestone-completed' : 'milestone-pending'}">
                            ${milestone}%
                        </div>
                    `).join('')}
                </div>
                ${goal.status !== 'completed' ? `
                    <button onclick="event.stopPropagation(); showGoalProgressModal('${goal.id}', '${goal.target_unit || ''}')" 
                            class="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        Update Progress
                    </button>
                ` : `
                    <span class="text-green-400 text-sm font-medium">
                        <i class="fas fa-check-circle mr-1"></i>Completed
                    </span>
                `}
            </div>
        </div>
    `;
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'active': return 'bg-blue-100 text-blue-800';
        case 'paused': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function populateGoalCategories(categories) {
    const categorySelect = document.getElementById('goal-category');
    const categoryFilter = document.getElementById('category-filter');
    
    // Populate create goal modal
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Select category</option>' + 
            categories.map(cat => `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`).join('');
    }
    
    // Populate filter dropdown
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="">All Categories</option>' + 
            categories.map(cat => `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`).join('');
    }
}

function displayEmptyGoalsState() {
    const container = document.getElementById('goals-container');
    const emptyState = document.getElementById('goals-empty-state');
    
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    
    // Reset stats
    document.getElementById('total-goals').textContent = '0';
    document.getElementById('active-goals').textContent = '0';
    document.getElementById('completed-goals').textContent = '0';
    document.getElementById('goal-completion-rate').textContent = '0%';
}

function showCreateGoalModal() {
    // Set today's date as default start date
    document.getElementById('goal-start-date').value = new Date().toISOString().split('T')[0];
    showModal('create-goal-modal');
}

function showGoalProgressModal(goalId, unit) {
    document.getElementById('progress-goal-id').value = goalId;
    document.getElementById('progress-unit').textContent = unit || '';
    showModal('goal-progress-modal');
}

function showGoalDetails(goalId) {
    // TODO: Load and display goal details with progress history
    console.log('Show goal details for:', goalId);
    // For now, just show a placeholder
    showNotification('Goal details view coming soon!', 'info');
}

function filterGoals(filter) {
    // Update active filter button
    document.querySelectorAll('.goal-filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`filter-${filter}`).classList.add('active');
    
    // Reload goals with filter
    loadGoals(); // TODO: Add filter parameter to API call
}

async function submitGoal(event) {
    event.preventDefault();
    
    // Show loading state immediately
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating Goal...';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(event.target);
        const goalData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            priority: formData.get('priority'),
            start_date: formData.get('start_date'),
            target_date: formData.get('target_date') || null,
            target_value: formData.get('target_value') ? parseFloat(formData.get('target_value')) : null,
            target_unit: formData.get('target_unit') || null,
            motivation_reason: formData.get('motivation_reason') || null,
            reward_description: formData.get('reward_description') || null,
            is_public: formData.get('is_public') ? true : false,
            share_progress: formData.get('share_progress') ? true : false
        };
        
        const response = await fetch('/api/goals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify(goalData)
        });
        
        if (response.ok) {
            const data = await response.json();
            showNotification(data.message, 'success');
            closeModal('create-goal-modal');
            document.getElementById('create-goal-form').reset();
            loadGoals(); // Refresh goals
            
            // Check for achievements
            checkAndAwardAchievements('goal_created');
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Failed to create goal', 'error');
        }
    } catch (error) {
        console.error('Goal creation error:', error);
        showNotification('Failed to create goal', 'error');
    } finally {
        // Always restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function submitGoalProgress(event) {
    event.preventDefault();
    
    // Show loading state immediately
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Updating Progress...';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(event.target);
        const progressData = {
            goal_id: formData.get('goal_id'),
            progress_value: parseFloat(formData.get('progress_value')),
            progress_percentage: formData.get('progress_percentage') ? parseFloat(formData.get('progress_percentage')) : undefined,
            notes: formData.get('notes') || null
        };
        
        const response = await fetch('/api/goals/progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify(progressData)
        });
        
        if (response.ok) {
            const data = await response.json();
            showNotification(data.message, 'success');
            
            // Show milestone notifications if any
            if (data.new_milestones && data.new_milestones.length > 0) {
                data.new_milestones.forEach((milestone, index) => {
                    setTimeout(() => {
                        showNotification(`🎖️ Milestone reached: ${milestone.title}! +${milestone.points} pts`, 'success');
                    }, (index + 1) * 1000);
                });
            }
            
            closeModal('goal-progress-modal');
            document.getElementById('goal-progress-form').reset();
            loadGoals(); // Refresh goals
            
            // Check for achievements
            if (data.goal_completed) {
                checkAndAwardAchievements('goal_completed');
            }
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Failed to update progress', 'error');
        }
    } catch (error) {
        console.error('Goal progress update error:', error);
        showNotification('Failed to update progress', 'error');
    } finally {
        // Always restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Handle goal deletion
async function handleDeleteGoal(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const btn = event.currentTarget;
    const goalId = btn.getAttribute('data-goal-id');
    
    if (confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
        await deleteGoal(goalId);
    }
}

// Delete goal function
async function deleteGoal(goalId) {
    try {
        const response = await fetch(`/api/goals/${goalId}`, {
            method: 'DELETE',
            headers: {
                'x-session-id': sessionId
            }
        });
        
        if (response.ok) {
            showNotification('Goal deleted successfully', 'success');
            loadGoals(); // Refresh goals
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Failed to delete goal', 'error');
        }
    } catch (error) {
        console.error('Goal deletion error:', error);
        showNotification('Failed to delete goal', 'error');
    }
}

// Admin functions
// Global variable to track current admin user being viewed
let currentAdminUserId = null;

// Show admin user list view
function showAdminUserList() {
    document.getElementById('admin-user-list').classList.remove('hidden');
    document.getElementById('admin-user-detail').classList.add('hidden');
    currentAdminUserId = null;
}

// Show user detail view
function showAdminUserDetail(userId) {
    document.getElementById('admin-user-list').classList.add('hidden');
    document.getElementById('admin-user-detail').classList.remove('hidden');
    currentAdminUserId = userId;
    loadAdminUserDetail(userId);
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
    const grid = document.getElementById('admin-users-grid');
    grid.innerHTML = '';
    
    // Filter out admin account from display (extra security layer)
    const filteredUsers = users.filter(user => user.email !== 'iamhollywoodpro@protonmail.com');
    
    filteredUsers.forEach(user => {
        const joinedDate = new Date(user.created_at).toLocaleDateString();
        const lastSeen = user.last_session ? new Date(user.last_session).toLocaleDateString() : 'Never';
        const isOnline = user.active_sessions > 0;
        
        const card = document.createElement('div');
        card.className = 'bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer';
        card.onclick = () => showAdminUserDetail(user.id);
        
        card.innerHTML = `
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <div class="w-4 h-4 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}" title="${isOnline ? 'Online' : 'Offline'}"></div>
                    <div>
                        <div class="text-white font-medium text-lg cursor-pointer hover:text-blue-400">${user.email.split('@')[0]}</div>
                        <div class="text-white/50 text-sm">${isOnline ? '🟢 Online' : '⚫ Offline'}</div>
                    </div>
                </div>
                ${user.flagged_media > 0 ? `<div class="text-red-400 text-sm font-medium">⚠️ ${user.flagged_media} flagged</div>` : ''}
            </div>
            
            <div class="grid grid-cols-4 gap-2 mb-3 text-xs">
                <div class="bg-white/5 rounded p-2 text-center">
                    <div class="text-white font-medium">${user.points || 0}</div>
                    <div class="text-white/50">Points</div>
                </div>
                <div class="bg-white/5 rounded p-2 text-center">
                    <div class="text-white font-medium">${user.total_habits}</div>
                    <div class="text-white/50">Habits</div>
                </div>
                <div class="bg-white/5 rounded p-2 text-center">
                    <div class="text-white font-medium">${user.total_media}</div>
                    <div class="text-white/50">Media</div>
                </div>
                <div class="bg-white/5 rounded p-2 text-center">
                    <div class="text-white font-medium">${user.total_completions}</div>
                    <div class="text-white/50">Done</div>
                </div>
            </div>
            
            <div class="text-xs text-white/60 text-center">
                Joined ${joinedDate} • Last seen ${lastSeen}
            </div>
            
            <div class="mt-3 text-center">
                <div class="text-blue-400 text-sm">👆 Click to view full profile & media</div>
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    if (filteredUsers.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12 text-white/50">
                <i class="fas fa-users text-4xl mb-4"></i>
                <p>No users found</p>
            </div>
        `;
    }
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
    const searchTerm = document.getElementById('admin-user-search')?.value?.toLowerCase() || '';
    const filterType = document.getElementById('admin-user-filter')?.value || 'all';
    
    let filteredUsers = allAdminUsers.filter(user => {
        // Search filter
        const matchesSearch = user.email.toLowerCase().includes(searchTerm) || 
                             user.email.split('@')[0].toLowerCase().includes(searchTerm);
        
        // Type filter
        let matchesType = true;
        switch (filterType) {
            case 'online':
                matchesType = user.active_sessions > 0;
                break;
            case 'active':
                matchesType = user.total_habits > 0 || user.total_media > 0;
                break;
            case 'flagged':
                matchesType = user.flagged_media > 0;
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

// Load media organized by user
async function loadAdminMediaByUser() {
    try {
        const response = await fetch('/api/admin/media-by-user', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayAdminMediaByUser(data.user_media || [], data.stats || {});
        }
    } catch (error) {
        console.error('Load admin media by user error:', error);
    }
}

// Display media organized by user with expandable sections
function displayAdminMediaByUser(userMediaData, stats) {
    const container = document.getElementById('admin-media-table').parentElement.parentElement;
    
    container.innerHTML = `
        <!-- Stats Overview -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-white">${stats.users_with_media || 0}</div>
                <div class="text-white/60 text-sm">Users with Media</div>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-blue-400">${stats.total_media_files || 0}</div>
                <div class="text-white/60 text-sm">Total Files</div>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-red-400">${stats.total_flagged || 0}</div>
                <div class="text-white/60 text-sm">Flagged</div>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-green-400">${((stats.total_storage_bytes || 0) / 1024 / 1024 / 1024).toFixed(2)} GB</div>
                <div class="text-white/60 text-sm">Storage Used</div>
            </div>
        </div>
        
        <!-- User Media Sections -->
        <div class="space-y-4" id="user-media-sections">
            <!-- User sections will be loaded here -->
        </div>
    `;
    
    const sectionsContainer = document.getElementById('user-media-sections');
    
    userMediaData.forEach((userData, index) => {
        const user = userData.user;
        const media = userData.media;
        const lastUpload = user.last_upload ? new Date(user.last_upload).toLocaleDateString() : 'Never';
        
        const section = document.createElement('div');
        section.className = 'bg-white/5 border border-white/10 rounded-lg overflow-hidden';
        section.innerHTML = `
            <!-- User Header -->
            <div class="p-4 cursor-pointer hover:bg-white/5 transition-colors" onclick="toggleUserMediaSection('user-${user.id}')">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div>
                            <h3 class="text-white font-medium">${user.email.split('@')[0]}</h3>
                            <p class="text-white/60 text-sm">${user.email}</p>
                        </div>
                        <div class="flex space-x-4 text-sm">
                            <span class="text-blue-400">${user.total_images} images</span>
                            <span class="text-purple-400">${user.total_videos} videos</span>
                            ${user.flagged_media > 0 ? `<span class="text-red-400">⚠️ ${user.flagged_media} flagged</span>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="text-right text-xs text-white/50">
                            <div>${user.total_media} total files</div>
                            <div>Last: ${lastUpload}</div>
                        </div>
                        <i class="fas fa-chevron-down text-white/40 transition-transform" id="chevron-user-${user.id}"></i>
                    </div>
                </div>
            </div>
            
            <!-- User Media Grid (Initially Hidden) -->
            <div class="hidden border-t border-white/10" id="user-${user.id}">
                <div class="p-4">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-white/70 text-sm">${media.length} files shown (most recent first)</span>
                        <div class="flex space-x-2">
                            <button onclick="downloadAllUserMedia('${user.id}', '${user.email}')" class="btn-secondary text-xs">
                                <i class="fas fa-download mr-1"></i>Download All
                            </button>
                            <button onclick="flagAllUserMedia('${user.id}')" class="btn-secondary text-xs">
                                <i class="fas fa-flag mr-1"></i>Flag All
                            </button>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3" id="media-grid-${user.id}">
                        <!-- Media items will be loaded here -->
                    </div>
                </div>
            </div>
        `;
        
        sectionsContainer.appendChild(section);
        
        // Load media grid for this user
        const mediaGrid = document.getElementById(`media-grid-${user.id}`);
        media.forEach(item => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'relative group bg-white/5 rounded-lg overflow-hidden aspect-square cursor-pointer hover:bg-white/10 transition-colors';
            
            mediaItem.innerHTML = `
                <div class="w-full h-full flex items-center justify-center" id="media-preview-${item.id}">
                    <i class="fas fa-${item.media_type === 'video' ? 'video' : 'image'} text-2xl text-white/40"></i>
                </div>
                
                <!-- Media Type Badge -->
                <div class="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                    ${item.media_type.toUpperCase()}
                </div>
                
                <!-- Flag Badge -->
                ${item.is_flagged ? '<div class="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"><i class="fas fa-flag text-xs text-white"></i></div>' : ''}
                
                <!-- Hover Actions -->
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button onclick="viewAdminMediaModal('${item.id}')" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors" title="View">
                        <i class="fas fa-eye text-sm text-white"></i>
                    </button>
                    <button onclick="toggleAdminMediaFlag('${item.id}', this)" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors" title="Flag">
                        <i class="fas fa-flag text-sm text-white"></i>
                    </button>
                    <button onclick="downloadAdminMedia('${item.id}', '${item.original_name}')" class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors" title="Download">
                        <i class="fas fa-download text-sm text-white"></i>
                    </button>
                    <button onclick="deleteAdminMedia('${item.id}')" class="w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors" title="Delete">
                        <i class="fas fa-trash text-sm text-white"></i>
                    </button>
                </div>
                
                <!-- File Info -->
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <div class="text-white text-xs truncate">${item.original_name}</div>
                    <div class="text-white/60 text-xs">${(item.file_size / 1024 / 1024).toFixed(1)}MB</div>
                </div>
            `;
            
            mediaGrid.appendChild(mediaItem);
            
            // Load actual media preview
            loadAdminMediaPreview(item.id, `media-preview-${item.id}`, item.media_type === 'video');
        });
    });
    
    if (userMediaData.length === 0) {
        sectionsContainer.innerHTML = `
            <div class="text-center py-12 text-white/50">
                <i class="fas fa-images text-4xl mb-4"></i>
                <p>No media uploads found</p>
            </div>
        `;
    }
}

// Toggle user media section expansion
function toggleUserMediaSection(sectionId) {
    const section = document.getElementById(sectionId);
    const chevron = document.getElementById(`chevron-${sectionId}`);
    
    if (section.classList.contains('hidden')) {
        section.classList.remove('hidden');
        chevron.style.transform = 'rotate(180deg)';
    } else {
        section.classList.add('hidden');
        chevron.style.transform = 'rotate(0deg)';
    }
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

// Load admin user detail view
async function loadAdminUserDetail(userId) {
    try {
        const response = await fetch(`/api/admin/user-detail/${userId}`, {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayAdminUserDetail(data);
        } else {
            showNotification('Failed to load user details', 'error');
            showAdminUserList();
        }
    } catch (error) {
        console.error('Load admin user detail error:', error);
        showNotification('Failed to load user details', 'error');
        showAdminUserList();
    }
}

// Display admin user detail
function displayAdminUserDetail(data) {
    const user = data.user;
    const media = data.media;
    const habits = data.habits;
    const recentActivity = data.recent_activity;
    
    // Update user info header
    const userInfoContainer = document.getElementById('admin-user-info');
    const joinedDate = new Date(user.created_at).toLocaleDateString();
    const lastSeen = user.last_session ? new Date(user.last_session).toLocaleDateString() : 'Never';
    const isOnline = user.active_sessions > 0;
    const lastUpload = user.last_upload ? new Date(user.last_upload).toLocaleDateString() : 'Never';
    const lastCompletion = user.last_completion ? new Date(user.last_completion).toLocaleDateString() : 'Never';
    
    userInfoContainer.innerHTML = `
        <div class="bg-white/5 border border-white/10 rounded-lg p-6">
            <div class="flex items-start justify-between mb-6">
                <div class="flex items-center space-x-4">
                    <div class="w-6 h-6 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}"></div>
                    <div>
                        <h2 class="text-2xl font-bold text-white">${user.email.split('@')[0]}</h2>
                        <p class="text-white/60">${user.email}</p>
                        <p class="text-sm ${isOnline ? 'text-green-400' : 'text-white/50'}">${isOnline ? '🟢 Online Now' : '⚫ Offline'}</p>
                    </div>
                </div>
                ${user.flagged_media > 0 ? `
                    <div class="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
                        <div class="text-red-400 font-bold text-xl">${user.flagged_media}</div>
                        <div class="text-red-400 text-xs">Flagged Media</div>
                    </div>
                ` : ''}
            </div>
            
            <!-- Stats Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-white/5 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-white">${user.points || 0}</div>
                    <div class="text-white/60 text-sm">Total Points</div>
                </div>
                <div class="bg-white/5 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-blue-400">${user.total_habits}</div>
                    <div class="text-white/60 text-sm">Active Habits</div>
                </div>
                <div class="bg-white/5 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-green-400">${user.total_media}</div>
                    <div class="text-white/60 text-sm">Media Files</div>
                </div>
                <div class="bg-white/5 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-purple-400">${user.total_completions}</div>
                    <div class="text-white/60 text-sm">Completions</div>
                </div>
            </div>
            
            <!-- User Timeline -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div class="bg-white/5 rounded-lg p-4">
                    <div class="text-white/60 mb-2">Account Info</div>
                    <div class="text-white">Joined: ${joinedDate}</div>
                    <div class="text-white">Last seen: ${lastSeen}</div>
                </div>
                <div class="bg-white/5 rounded-lg p-4">
                    <div class="text-white/60 mb-2">Media Activity</div>
                    <div class="text-white">${user.total_images} Images • ${user.total_videos} Videos</div>
                    <div class="text-white">Last upload: ${lastUpload}</div>
                </div>
                <div class="bg-white/5 rounded-lg p-4">
                    <div class="text-white/60 mb-2">Habit Activity</div>
                    <div class="text-white">${user.total_habits} Habits created</div>
                    <div class="text-white">Last completion: ${lastCompletion}</div>
                </div>
            </div>
        </div>
    `;
    
    // Display user media
    const mediaGrid = document.getElementById('admin-user-media-grid');
    const mediaEmpty = document.getElementById('admin-user-media-empty');
    
    if (media.length === 0) {
        mediaGrid.classList.add('hidden');
        mediaEmpty.classList.remove('hidden');
    } else {
        mediaGrid.classList.remove('hidden');
        mediaEmpty.classList.add('hidden');
        mediaGrid.innerHTML = '';
        
        media.forEach(item => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'relative group bg-white/5 rounded-lg overflow-hidden aspect-square cursor-pointer hover:bg-white/10 transition-colors';
            
            mediaItem.innerHTML = `
                <div class="w-full h-full flex items-center justify-center" id="media-preview-${item.id}">
                    <i class="fas fa-${item.media_type === 'video' ? 'video' : 'image'} text-2xl text-white/40"></i>
                </div>
                
                <!-- Media Type Badge -->
                <div class="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                    ${item.media_type.toUpperCase()}
                </div>
                
                <!-- Flag Badge -->
                ${item.is_flagged ? '<div class="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"><i class="fas fa-flag text-xs text-white"></i></div>' : ''}
                
                <!-- Hover Actions -->
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button onclick="viewAdminMediaModal('${item.id}')" class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors" title="Full View">
                        <i class="fas fa-eye text-white"></i>
                    </button>
                    <button onclick="toggleAdminMediaFlag('${item.id}', this)" class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors" title="Flag">
                        <i class="fas fa-flag text-white"></i>
                    </button>
                    <button onclick="downloadAdminMedia('${item.id}', '${item.original_name}')" class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors" title="Download">
                        <i class="fas fa-download text-white"></i>
                    </button>
                    <button onclick="deleteAdminMedia('${item.id}')" class="w-10 h-10 bg-red-500/80 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors" title="Delete">
                        <i class="fas fa-trash text-white"></i>
                    </button>
                </div>
                
                <!-- File Info -->
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <div class="text-white text-xs truncate">${item.original_name}</div>
                    <div class="text-white/60 text-xs">${(item.file_size / 1024 / 1024).toFixed(1)}MB • ${new Date(item.uploaded_at).toLocaleDateString()}</div>
                </div>
            `;
            
            mediaGrid.appendChild(mediaItem);
            
            // Load actual media preview
            loadAdminMediaPreview(item.id, `media-preview-${item.id}`, item.media_type === 'video');
        });
    }
}

// Download all media for a specific user
async function downloadAllUserMedia(userId, userEmail) {
    showNotification(`Downloading all media for ${userEmail} - feature coming soon`, 'info');
}

// Flag all media for a specific user
async function flagAllUserMedia(userId) {
    showConfirmationModal(
        'Are you sure you want to flag ALL media files for this user? This will mark all their content for review.',
        async function() {
            showNotification('Bulk flag operation - feature coming soon', 'info');
        }
    );
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

// Load Coming Soon Features
function loadComingSoonFeatures() {
    const container = document.getElementById('coming-soon-container');
    if (!container) return;
    
    const comingSoonFeatures = [
        {
            icon: 'fas fa-graduation-cap',
            name: 'Learning Hub', 
            description: 'Interactive fitness education, form tutorials, and guided learning paths for all levels.',
            category: 'Education',
            eta: 'Q1 2024'
        },
        {
            icon: 'fas fa-dumbbell',
            name: 'Guided Workouts',
            description: 'Step-by-step workout routines with video demonstrations and real-time coaching.',
            category: 'Workouts', 
            eta: 'Q1 2024'
        },
        {
            icon: 'fas fa-chart-line',
            name: 'Advanced Analytics',
            description: 'Deep insights into your performance trends, plateau detection, and optimization suggestions.',
            category: 'Analytics',
            eta: 'Q2 2024'
        },
        {
            icon: 'fas fa-users',
            name: 'Workout Buddy Finder',
            description: 'Connect with fitness partners in your area with similar goals and schedules.',
            category: 'Social',
            eta: 'Q2 2024'
        },
        {
            icon: 'fas fa-trophy',
            name: 'Challenges & Competitions',
            description: 'Join community challenges, compete with friends, and participate in fitness competitions.',
            category: 'Competition',
            eta: 'Q1 2024'
        },
        {
            icon: 'fas fa-heartbeat',
            name: 'Biometric Tracking',
            description: 'Advanced health metrics, heart rate zones, sleep quality, and recovery analysis.',
            category: 'Health',
            eta: 'Q2 2024'
        },
        {
            icon: 'fas fa-puzzle-piece',
            name: 'Fitness App Integration',
            description: 'Connect with popular fitness apps and wearables for seamless data synchronization.',
            category: 'Integration',
            eta: 'Q2 2024'
        },
        {
            icon: 'fas fa-clipboard-list',
            name: 'Custom Program Builder',
            description: 'Create personalized workout programs with periodization and progressive overload.',
            category: 'Programming',
            eta: 'Q3 2024'
        },
        {
            icon: 'fas fa-chalkboard-teacher',
            name: 'Mentorship Platform',
            description: 'Connect with experienced trainers and mentors for personalized guidance.',
            category: 'Coaching',
            eta: 'Q3 2024'
        },
        {
            icon: 'fas fa-briefcase',
            name: 'Coach Business Tools',
            description: 'Client management, program templates, scheduling, and revenue tracking for fitness professionals.',
            category: 'Business',
            eta: 'Q3 2024'
        },
        {
            icon: 'fas fa-medal',
            name: 'Competition Management',
            description: 'Track competitions, plan peak timing, analyze performance data for competitive athletes.',
            category: 'Competition',
            eta: 'Q4 2024'
        },
        {
            icon: 'fas fa-sitemap',
            name: 'Team Management',
            description: 'Manage athletic teams, track group progress, and coordinate training schedules.',
            category: 'Teams',
            eta: 'Q4 2024'
        }
    ];
    
    container.innerHTML = comingSoonFeatures.map(feature => `
        <div class="glass-card p-6 hover:bg-white/10 transition-all">
            <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <i class="${feature.icon} text-white text-lg"></i>
                </div>
                <span class="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">${feature.category}</span>
            </div>
            <h3 class="text-white font-semibold text-lg mb-2">${feature.name}</h3>
            <p class="text-white/70 text-sm mb-4">${feature.description}</p>
            <div class="flex justify-between items-center">
                <span class="text-white/50 text-xs">Estimated: ${feature.eta}</span>
                <button class="btn-secondary text-xs" onclick="showNotification('We\\'ll notify you when ${feature.name} is ready!', 'info')">
                    Notify Me
                </button>
            </div>
        </div>
    `).join('');
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
    } else if (section === 'nutrition') {
        loadNutrition();
    } else if (section === 'weight') {
        loadWeight();
    } else if (section === 'goals') {
        loadGoals();
    } else if (section === 'competitions') {
        loadCompetitions();
    } else if (section === 'achievements') {
        loadAchievements();
        loadDailyChallenges();
        loadLeaderboards();
    } else if (section === 'admin') {
        loadAdminUsers(); // Load users immediately
        showAdminUserList(); // Ensure user list is visible
    }
}

// Remove old showAdminSection function - no longer needed with new design

function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function showNotification(message, type = 'info', persistent = false) {
    const notification = document.getElementById('notification');
    
    // Always show just the message (no close button needed since auto-dismiss)
    notification.innerHTML = `<span>${message}</span>`;
    
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    // Auto-dismiss ALL notifications after 3 seconds
    setTimeout(() => {
        if (notification) {
            notification.classList.remove('show');
            // Clear content after fade out animation
            setTimeout(() => {
                if (notification && !notification.classList.contains('show')) {
                    notification.innerHTML = '';
                }
            }, 500); // Wait for CSS transition to complete
        }
    }, 3000);
}

// Hide notification manually
function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.classList.remove('show');
        // Also clear the content to prevent stale notifications
        setTimeout(() => {
            if (notification && !notification.classList.contains('show')) {
                notification.innerHTML = '';
            }
        }, 500);
    }
}

// Debug function to test basic network connectivity
window.testNetwork = async function() {
    console.log('🌐 Testing basic network connectivity...');
    console.log('📍 Current URL:', window.location.href);
    console.log('🔑 Current sessionId:', sessionId);
    
    // Test 1: Simple GET request to root
    try {
        console.log('📡 Test 1: GET request to root...');
        const response1 = await fetch('/', { method: 'GET' });
        console.log('✅ Root GET:', response1.status, response1.statusText);
        console.log('📊 Root headers:', Object.fromEntries(response1.headers.entries()));
    } catch (error) {
        console.error('❌ Root GET failed:', error);
        console.error('❌ Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    }
    
    // Test 2: Login API (should work since you're logged in)
    try {
        console.log('📡 Test 2: POST to login API...');
        const response2 = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@test.com', password: 'test' })
        });
        console.log('✅ Login API:', response2.status, response2.statusText);
        console.log('📊 Login headers:', Object.fromEntries(response2.headers.entries()));
        const loginData = await response2.text();
        console.log('📄 Login response:', loginData.substring(0, 200));
    } catch (error) {
        console.error('❌ Login API failed:', error);
        console.error('❌ Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    }
    
    // Test 3: Simple habits GET
    try {
        console.log('📡 Test 3: GET habits with session...');
        console.log('🔑 Using sessionId:', sessionId);
        const response3 = await fetch('/api/habits', {
            method: 'GET',
            headers: { 'x-session-id': sessionId || 'no-session' }
        });
        console.log('✅ Habits GET:', response3.status, response3.statusText);
        console.log('📊 Habits headers:', Object.fromEntries(response3.headers.entries()));
        const habitsData = await response3.text();
        console.log('📄 Habits response:', habitsData.substring(0, 200));
    } catch (error) {
        console.error('❌ Habits GET failed:', error);
        console.error('❌ Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    }
    
    // Test 4: Habits toggle API (the problematic one)
    try {
        console.log('📡 Test 4: POST habits toggle...');
        const response4 = await fetch('/api/habits/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId || 'no-session'
            },
            body: JSON.stringify({ habit_id: 'test-id', date: '2025-09-02' })
        });
        console.log('✅ Habits toggle:', response4.status, response4.statusText);
        console.log('📊 Toggle headers:', Object.fromEntries(response4.headers.entries()));
        const toggleData = await response4.text();
        console.log('📄 Toggle response:', toggleData.substring(0, 200));
    } catch (error) {
        console.error('❌ Habits toggle failed:', error);
        console.error('❌ Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    }
    
    console.log('🧪 Network test completed');
    
    // Also test fetch capabilities
    console.log('🔧 Browser fetch support:', typeof fetch !== 'undefined');
    console.log('🔧 XMLHttpRequest support:', typeof XMLHttpRequest !== 'undefined');
    console.log('🔧 Network info:', navigator.onLine ? 'Online' : 'Offline');
    
    // URL analysis
    console.log('🔍 Current URL analysis:');
    console.log('  - Protocol:', window.location.protocol);
    console.log('  - Host:', window.location.host);
    console.log('  - Port:', window.location.port || 'default');
    console.log('  - Origin:', window.location.origin);
    
    // Recommended URL for StriveTrack
    console.log('ℹ️ For StriveTrack development:');
    console.log('  Recommended URL: https://8787-i9yme7bqgef9jzbamql4k-6532622b.e2b.dev');
    console.log('  Current URL:', window.location.href);
    
    if (!window.location.href.includes('8787')) {
        console.warn('⚠️ WARNING: You might not be accessing the correct development server!');
        console.warn('⚠️ Try accessing: https://8787-i9yme7bqgef9jzbamql4k-6532622b.e2b.dev');
    }
};

// Quick URL checker function
window.checkUrl = function() {
    const currentUrl = window.location.href;
    const expectedUrl = 'https://8787-i9yme7bqgef9jzbamql4k-6532622b.e2b.dev';
    
    console.log('🔍 URL Check:');
    console.log('Current URL:', currentUrl);
    console.log('Expected URL:', expectedUrl);
    
    if (currentUrl === expectedUrl || currentUrl.startsWith(expectedUrl)) {
        console.log('✅ URL looks correct!');
        return true;
    } else {
        console.warn('⚠️ URL mismatch detected!');
        console.warn('This might be why API calls are failing.');
        console.warn('Try accessing:', expectedUrl);
        
        if (confirm('Would you like to redirect to the correct URL?')) {
            window.location.href = expectedUrl;
        }
        return false;
    }
};

// Debug function to diagnose login loop issues
window.debugAuth = function() {
    console.log('🔍 Authentication Debug Information:');
    console.log('=================================');
    
    // Check localStorage
    const storedSession = localStorage.getItem('sessionId');
    console.log('📁 localStorage sessionId:', storedSession);
    console.log('🔑 Global sessionId variable:', sessionId);
    console.log('👤 Current user:', currentUser);
    
    // Check DOM elements
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    
    console.log('📺 DOM Elements:');
    console.log('  - login-screen exists:', !!loginScreen);
    console.log('  - login-screen hidden:', loginScreen ? loginScreen.classList.contains('hidden') : 'N/A');
    console.log('  - dashboard exists:', !!dashboard);
    console.log('  - dashboard hidden:', dashboard ? dashboard.classList.contains('hidden') : 'N/A');
    
    // Check which screen is currently visible
    const loginVisible = loginScreen && !loginScreen.classList.contains('hidden');
    const dashboardVisible = dashboard && !dashboard.classList.contains('hidden');
    
    console.log('👁️ Currently Visible:');
    console.log('  - Login screen:', loginVisible);
    console.log('  - Dashboard:', dashboardVisible);
    
    if (loginVisible && dashboardVisible) {
        console.warn('⚠️ Both screens are visible - this might cause issues!');
    } else if (!loginVisible && !dashboardVisible) {
        console.warn('⚠️ No screens are visible - this is a problem!');
    }
    
    // Test login with admin credentials
    console.log('🧪 Quick login test available:');
    console.log('Run: testAdminLogin() to test login with admin credentials');
    
    return {
        sessionId,
        currentUser,
        storedSession,
        loginVisible,
        dashboardVisible
    };
};

// Test function for admin login
// Test function for notification timing
window.testNotifications = function() {
    console.log('🔔 Testing notification auto-dismiss...');
    
    showNotification('This is a test info notification', 'info');
    
    setTimeout(() => {
        showNotification('This is a test success notification', 'success');
    }, 1000);
    
    setTimeout(() => {
        showNotification('This is a test error notification', 'error');
    }, 2000);
    
    console.log('✅ Three notifications sent. Each should auto-dismiss after 3 seconds.');
};

// Clean initialization
console.log('✅ StriveTrack habit system initialized');

// Test function for the new simple habit system
// Debug function to check if habit elements exist
window.debugHabitElements = function() {
    console.log('🔍 Debugging habit elements...');
    
    const habitCells = document.querySelectorAll('.habit-day-cell');
    console.log('📊 Found habit day cells:', habitCells.length);
    
    habitCells.forEach((cell, index) => {
        console.log(`Cell ${index + 1}:`, {
            element: cell,
            habitId: cell.getAttribute('data-habit-id') || cell.dataset.habitId,
            date: cell.getAttribute('data-date') || cell.dataset.date,
            classes: cell.className
        });
    });
    
    if (habitCells.length > 0) {
        console.log('🧪 Testing click on first cell...');
        const firstCell = habitCells[0];
        console.log('📍 Clicking:', firstCell);
        firstCell.click();
    } else {
        console.log('❌ No habit cells found!');
        
        // Check if habits container exists
        const container = document.getElementById('habits-container');
        console.log('📦 Habits container:', container);
        if (container) {
            console.log('📄 Container innerHTML:', container.innerHTML.substring(0, 500));
        }
    }
};

window.testSimpleHabits = async function() {
    console.log('🧪 Testing simple habits system...');
    
    if (!sessionId) {
        console.log('❌ Please log in first');
        return;
    }
    
    // Get first habit
    try {
        const response = await fetch('/api/habits', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (!response.ok) {
            console.log('❌ Failed to fetch habits');
            return;
        }
        
        const data = await response.json();
        if (data.habits && data.habits.length > 0) {
            const habit = data.habits[0];
            const today = new Date().toISOString().split('T')[0];
            
            console.log('🎯 Testing with habit:', habit.name);
            console.log('📅 Date:', today);
            
            await simpleToggleHabit(habit.id, today);
        } else {
            console.log('❌ No habits found');
        }
    } catch (error) {
        console.error('💥 Test error:', error);
    }
};

window.testAdminLogin = async function() {
    console.log('🧪 Testing admin login...');
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: 'iamhollywoodpro@protonmail.com', 
                password: 'password@1981' 
            })
        });
        
        const data = await response.json();
        console.log('📊 Test login response:', data);
        
        if (response.ok && data.sessionId) {
            console.log('✅ Login test successful!');
            console.log('Setting session and showing dashboard...');
            
            sessionId = data.sessionId;
            currentUser = data.user;
            localStorage.setItem('sessionId', sessionId);
            
            showDashboard();
            return true;
        } else {
            console.log('❌ Login test failed:', data.error);
            return false;
        }
    } catch (error) {
        console.error('💥 Login test error:', error);
        return false;
    }
};

// Debug function to test habit toggle from console
window.testHabitToggle = async function(habitId = '25f5c19c-d4d8-4fef-83f7-6cc22deb8613', date = '2025-01-04') {
    console.log('🧪 Testing habit toggle from console...');
    console.log('🧪 Using habitId:', habitId);
    console.log('🧪 Using date:', date);
    console.log('🧪 Current sessionId:', sessionId);
    
    if (!sessionId) {
        console.error('🧪 No session ID available. Please log in first.');
        console.log('📝 To get a session ID:');
        console.log('1. Go to the login page');
        console.log('2. Log in with your credentials');
        console.log('3. Check localStorage.getItem("sessionId")');
        return;
    }
    
    try {
        await toggleHabitDay(habitId, date);
        console.log('🧪 Test completed successfully');
    } catch (error) {
        console.error('🧪 Test failed:', error);
    }
};

function updateDashboardStats() {
    // Get the current habits data to calculate statistics
    loadDashboardStats();
}

async function loadDashboardStats() {
    try {
        const response = await fetch('/api/habits', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            calculateAndDisplayDashboardStats(data.habits);
        }
    } catch (error) {
        console.error('Load dashboard stats error:', error);
    }
}

function calculateAndDisplayDashboardStats(habits) {
    if (!habits) return;
    
    // Calculate stats using SAME logic as habits page - total completions across all habits
    const weekStart = getWeekStart(currentWeekOffset || 0);
    const weekDays = Array.from({length: 7}, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        return date;
    });
    
    let totalCompletionsThisWeek = 0; // Sum all completions across all habits
    let totalTargetThisWeek = 0; // Sum all weekly targets
    let totalHabits = habits.length;
    let totalWeeklyProgress = 0;
    
    // For each habit, sum up all completions and targets
    habits.forEach(habit => {
        const completions = habit.completions || [];
        const weekCompletions = weekDays.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            return completions.includes(dateStr);
        });
        
        const weeklyCompleted = weekCompletions.filter(Boolean).length;
        const weeklyTarget = habit.weekly_target || 7;
        
        // Add to total sums
        totalCompletionsThisWeek += weeklyCompleted;
        totalTargetThisWeek += weeklyTarget;
        
        // Calculate individual habit progress for averaging
        const habitProgress = weeklyTarget > 0 ? (weeklyCompleted / weeklyTarget) * 100 : 0;
        totalWeeklyProgress += habitProgress;
    });
    
    // Calculate average performance
    const averagePerformance = totalHabits > 0 ? Math.round(totalWeeklyProgress / totalHabits) : 0;
    
    // Update dashboard stat cards with calculated values
    console.log('📊 Updating dashboard stats to match habits page (total completions):', {
        activeHabits: totalHabits,
        totalCompletions: totalCompletionsThisWeek,
        totalTargets: totalTargetThisWeek,
        averagePerformance: averagePerformance,
        weekStart: weekStart.toISOString().split('T')[0]
    });
    
    // Update dashboard stats elements
    const activeHabitsEl = document.getElementById('active-habits');
    const todayProgressEl = document.getElementById('today-progress'); 
    const averagePerformanceEl = document.getElementById('average-performance');
    const userPointsDisplayEl = document.getElementById('user-points-display');
    
    if (activeHabitsEl) activeHabitsEl.textContent = totalHabits;
    if (todayProgressEl) todayProgressEl.textContent = `${totalCompletionsThisWeek}/${totalTargetThisWeek}`;
    if (averagePerformanceEl) averagePerformanceEl.textContent = `${averagePerformance}%`;
    if (userPointsDisplayEl) userPointsDisplayEl.textContent = currentUser?.points || 0;
    
    console.log('✅ Dashboard stats updated to show total weekly completions across all habits');
}

// Global Confirmation Modal functions

function showConfirmationModal(message, onConfirm) {
    console.log('🎯 Showing confirmation modal:', message);
    document.getElementById('confirmation-message').textContent = message;
    
    const modal = document.getElementById('confirmation-modal');
    const confirmBtn = document.getElementById('confirm-delete-btn');
    
    // Clear any existing event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Set up the fresh confirm button click handler
    newConfirmBtn.onclick = function() {
        console.log('✅ Confirm button clicked - executing callback immediately');
        closeConfirmationModal();
        if (onConfirm) {
            console.log('🚀 Executing confirmation callback');
            onConfirm();
        } else {
            console.log('❌ No confirmation callback provided');
        }
    };
    
    modal.classList.remove('hidden');
}

function closeConfirmationModal() {
    document.getElementById('confirmation-modal').classList.add('hidden');
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
        new Date(achievement.earned_at).toLocaleDateString() : 'Not earned yet';
    
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

// Achievements are now 100% automatic - no manual unlocking needed!
// Achievements are awarded immediately when requirements are met during user actions.

// ===============================
// HABIT MANAGEMENT FUNCTIONALITY
// ===============================

// Habit Management System
let habits = [];
// currentWeekOffset moved to comprehensive habit system

// Setup additional event listeners for habit functionality
function setupHabitEventListeners() {
    // Create Habit Card Click Handler
    const createHabitCard = document.getElementById('create-habit-card');
    if (createHabitCard) {
        createHabitCard.addEventListener('click', showCreateHabitModal);
    }

    // Create Habit Form Submit Handler
    const createHabitForm = document.getElementById('create-habit-form');
    if (createHabitForm) {
        createHabitForm.addEventListener('submit', handleCreateHabit);
    }

    // Habit Name Input Change Handler for Emoji Preview
    const habitNameInput = document.getElementById('habit-name');
    if (habitNameInput) {
        habitNameInput.addEventListener('input', updateEmojiPreview);
    }

    // Upload Progress Card Click Handler
    const uploadProgressCard = document.getElementById('upload-progress-card');
    if (uploadProgressCard) {
        uploadProgressCard.addEventListener('click', showMediaUploadModal);
    }

    // Clean habit toggle system with immediate visual feedback
    document.addEventListener('click', function(event) {
        // Check for habit day cell click
        const habitCell = event.target.closest('.habit-day-cell');
        if (habitCell) {
            console.log('🎯 Habit cell clicked');
            console.log('📍 Cell element:', habitCell);
            console.log('📍 Cell classes:', habitCell.className);
            event.preventDefault();
            event.stopPropagation();
            
            // Check if the cell is disabled
            if (habitCell.classList.contains('disabled')) {
                console.log('❌ Cell is disabled - weekly target reached');
                showNotification('Weekly target reached for this habit', 'info');
                return;
            }
            
            const habitId = habitCell.getAttribute('data-habit-id') || habitCell.dataset.habitId;
            const date = habitCell.getAttribute('data-date') || habitCell.dataset.date;
            
            console.log('📊 Habit data:', { habitId, date });
            
            if (habitId && date) {
                console.log('🚀 Calling simpleToggleHabit...');
                simpleToggleHabit(habitId, date);
            } else {
                console.error('❌ Missing habit data:', { habitId, date });
                showNotification('Invalid habit data', 'error');
            }
            return;
        }
        
        // Complete button
        const completeBtn = event.target.closest('.complete-habit-btn');
        if (completeBtn) {
            const habitId = completeBtn.getAttribute('data-habit-id') || completeBtn.dataset.habitId;
            if (habitId) {
                simpleCompleteHabit(habitId);
            }
            return;
        }
        
        // Delete habit button  
        const deleteBtn = event.target.closest('.delete-habit-btn');
        if (deleteBtn) {
            const habitId = deleteBtn.getAttribute('data-habit-id') || deleteBtn.dataset.habitId;
            if (habitId && confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
                deleteHabit(habitId);
            }
            return;
        }
        
        // Delete weight button
        const deleteWeightBtn = event.target.closest('.delete-weight-btn');
        if (deleteWeightBtn) {
            const weightId = deleteWeightBtn.getAttribute('data-weight-id') || deleteWeightBtn.dataset.weightId;
            if (weightId) {
                deleteWeight(weightId);
            }
            return;
        }
        
        // Delete nutrition button
        const deleteNutritionBtn = event.target.closest('.delete-nutrition-btn');
        if (deleteNutritionBtn) {
            const nutritionId = deleteNutritionBtn.getAttribute('data-nutrition-id') || deleteNutritionBtn.dataset.nutritionId;
            if (nutritionId) {
                deleteNutrition(nutritionId);
            }
            return;
        }
    });
    
    // Simple touch events for mobile
    document.addEventListener('touchend', function(event) {
        // Prevent double-tap and let click handler deal with it
        if (event.target.closest('.habit-day-cell, .complete-habit-btn, .delete-habit-btn')) {
            // Let the click handler process this
            return;
        }
    });
    
    console.log('Habit event listeners set up successfully');
}

// Delete habit function
// Duplicate deleteHabit function removed - using the correct one at line 7468

// Load habits for dashboard display
async function loadDashboardHabits() {
    try {
        const response = await fetch('/api/habits', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayDashboardHabits(data.habits);
            // Also update dashboard stats with the loaded habits
            updateHabitsStats(data.habits);
        } else {
            console.error('Failed to load dashboard habits');
        }
    } catch (error) {
        console.error('Load dashboard habits error:', error);
    }
}

// Display habits in dashboard
function displayDashboardHabits(habits) {
    console.log('🏠 displayDashboardHabits called with:', habits?.length, 'habits');
    
    const container = document.getElementById('dashboard-habits-container');
    console.log('🏠 Dashboard container found:', !!container);
    
    if (!container) {
        console.error('❌ dashboard-habits-container element not found!');
        return;
    }
    
    if (!habits || habits.length === 0) {
        console.log('🏠 No habits to display, showing empty state');
        container.innerHTML = `
            <div class="text-center py-8 text-white/50">
                <i class="fas fa-target text-3xl mb-4"></i>
                <h3 class="text-lg font-bold mb-2">No Habits Yet</h3>
                <p class="mb-4">Create your first fitness habit to get started!</p>
                <button onclick="showCreateHabitModal()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>
                    Create Your First Habit
                </button>
            </div>
        `;
        return;
    }
    
    // Show up to 3 most recent habits in dashboard
    const recentHabits = habits.slice(0, 3);
    console.log('🏠 Showing', recentHabits.length, 'habits in dashboard');
    
    const habitCards = recentHabits.map(habit => createDashboardHabitCard(habit)).join('');
    console.log('🏠 Generated habit cards HTML length:', habitCards.length);
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${habitCards}
        </div>
        ${habits.length > 3 ? `
            <div class="text-center mt-4">
                <button onclick="showSection('habits')" class="btn-secondary">
                    View All ${habits.length} Habits
                </button>
            </div>
        ` : ''}
    `;
    
    console.log('✅ Dashboard habits updated successfully');
}

// Create compact habit card for dashboard
function createDashboardHabitCard(habit) {
    const emoji = getHabitEmoji(habit.name, habit.category);
    
    // Use SAME week calculation as habits page for consistency
    const weekStart = getWeekStart(currentWeekOffset || 0);
    const weekDays = Array.from({length: 7}, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        return date;
    });
    
    const completions = habit.completions || [];
    const weekCompletions = weekDays.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        return completions.includes(dateStr);
    });
    
    const completionsThisWeek = weekCompletions.filter(Boolean).length;
    
    console.log('🏠 Dashboard habit card:', {
        habitName: habit.name,
        completionsFromServer: completions,
        weekDaysGenerated: weekDays.map(d => d.toISOString().split('T')[0]),
        weekCompletionsCalculated: weekCompletions,
        completedCount: completionsThisWeek,
        target: habit.weekly_target || 7
    });
    
    const progress = Math.round((completionsThisWeek / (habit.weekly_target || 7)) * 100);
    
    return `
        <div class="glass-card p-4">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                    <span class="text-2xl">${emoji}</span>
                    <div>
                        <h4 class="text-white font-medium text-sm">${habit.name}</h4>
                        <p class="text-white/60 text-xs">${completionsThisWeek}/${habit.weekly_target || 7} this week</p>
                    </div>
                </div>
                <button class="delete-habit-btn text-red-400 hover:text-red-300 text-sm" data-habit-id="${habit.id}" title="Delete habit">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2">
                <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all" 
                     style="width: ${progress}%"></div>
            </div>
            <div class="text-right text-xs text-white/60 mt-1">${progress}%</div>
        </div>
    `;
}

// Show Create Habit Modal
function showCreateHabitModal() {
    const modal = document.getElementById('create-habit-modal');
    if (modal) {
        modal.classList.remove('hidden');
        // Reset form
        const form = document.getElementById('create-habit-form');
        if (form) {
            form.reset();
            updateEmojiPreview();
        }
    }
}

// Update Emoji Preview based on habit name
function updateEmojiPreview() {
    const habitName = document.getElementById('habit-name').value.toLowerCase();
    const habitPreviewName = document.getElementById('habit-preview-name');
    const emojiPreview = document.getElementById('emoji-preview');
    
    if (!habitPreviewName || !emojiPreview) return;
    
    habitPreviewName.textContent = habitName || 'Your habit name';
    
    // Emoji selection logic based on habit name
    let emoji = '⭐'; // default
    
    if (habitName.includes('water') || habitName.includes('drink') || habitName.includes('hydrat')) emoji = '💧';
    else if (habitName.includes('run') || habitName.includes('jog') || habitName.includes('cardio')) emoji = '🏃';
    else if (habitName.includes('walk') || habitName.includes('step')) emoji = '🚶';
    else if (habitName.includes('gym') || habitName.includes('workout') || habitName.includes('train')) emoji = '💪';
    else if (habitName.includes('yoga') || habitName.includes('stretch') || habitName.includes('meditat')) emoji = '🧘';
    else if (habitName.includes('sleep') || habitName.includes('rest')) emoji = '😴';
    else if (habitName.includes('read') || habitName.includes('book') || habitName.includes('study')) emoji = '📚';
    else if (habitName.includes('protein') || habitName.includes('eat') || habitName.includes('meal')) emoji = '🍎';
    else if (habitName.includes('push') || habitName.includes('pull')) emoji = '💪';
    else if (habitName.includes('bike') || habitName.includes('cycle')) emoji = '🚴';
    else if (habitName.includes('swim')) emoji = '🏊';
    else if (habitName.includes('climb')) emoji = '🧗';
    else if (habitName.includes('dance')) emoji = '💃';
    else if (habitName.includes('vitamin') || habitName.includes('supplement')) emoji = '💊';
    
    emojiPreview.textContent = emoji;
}

// Handle Create Habit Form Submission
// Get color based on habit category
function getCategoryColor(category) {
    const categoryColors = {
        'nutrition': '#10b981', // Green
        'cardio': '#ef4444',    // Red
        'strength': '#8b5cf6',  // Purple
        'flexibility': '#f59e0b', // Orange
        'general': '#667eea'    // Blue (default)
    };
    return categoryColors[category] || categoryColors.general;
}

async function handleCreateHabit(e) {
    e.preventDefault();
    
    // Show loading state immediately
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating Habit...';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(e.target);
        const habitData = {
            name: formData.get('habit-name') || document.getElementById('habit-name').value,
            description: formData.get('habit-description') || document.getElementById('habit-description').value,
            weekly_target: parseInt(formData.get('weekly-target') || document.getElementById('weekly-target').value),
            target_frequency: 1, // Default frequency - can be enhanced later
            color: getCategoryColor(formData.get('habit-category') || document.getElementById('habit-category').value)
        };

        // Validate required fields
        if (!habitData.name || habitData.name.trim() === '') {
            showNotification('Habit name is required', 'error');
            return;
        }
        
        if (!habitData.weekly_target || habitData.weekly_target < 1 || habitData.weekly_target > 7) {
            showNotification('Weekly target must be between 1 and 7 days', 'error');
            return;
        }

        console.log('Creating habit with data:', habitData);

    try {
        const response = await fetch('/api/habits', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify(habitData)
        });

        if (response.ok) {
            const result = await response.json();
            showNotification('Habit created successfully!', 'success');
            closeModal('create-habit-modal');
            
            // Reload habits and dashboard data
            await loadHabits();
            await loadDashboardHabits();
            updateDashboardStats();
            
            // Check for achievements
            checkAndAwardAchievements('habit_created');
        } else {
            const errorText = await response.text();
            let errorMessage = 'Failed to create habit';
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error || errorMessage;
            } catch (parseError) {
                console.error('Error parsing error response:', parseError);
            }
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Create habit error:', error);
        showNotification('Failed to create habit', 'error');
    } finally {
        // Always restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Load and display habits
async function loadHabits() {
    try {
        const response = await fetch('/api/habits', {
            headers: {
                'x-session-id': sessionId
            }
        });

        if (response.ok) {
            const data = await response.json();
            habits = data.habits || [];
            displayHabits(habits);
            updateHabitsStats(habits);
        } else {
            console.error('Failed to load habits');
        }
    } catch (error) {
        console.error('Load habits error:', error);
    }
}

// Unified function to load habits and update both habits page and dashboard
async function loadHabitsAndUpdateDashboard() {
    console.log('🚀 loadHabitsAndUpdateDashboard called');
    try {
        const response = await fetch('/api/habits', {
            headers: {
                'x-session-id': sessionId
            }
        });

        console.log('📡 Habits API response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            const habitsData = data.habits || [];
            
            console.log('🔄 Loading habits and updating dashboard with same data:', habitsData.length, 'habits');
            console.log('📊 Habit data sample:', habitsData.length > 0 ? habitsData[0] : 'No habits');
            
            // Store globally for other functions  
            habits = habitsData;
            
            // Update habits page (only if habits container exists)
            const habitsContainer = document.getElementById('habits-container');
            if (habitsContainer) {
                console.log('📄 Updating habits page');
                displayHabits(habitsData);
            } else {
                console.log('📄 Habits container not found, skipping habits page update');
            }
            
            // Update dashboard with SAME data
            console.log('🏠 Updating dashboard habits');
            displayDashboardHabits(habitsData);
            
            console.log('📊 Updating dashboard stats');
            updateHabitsStats(habitsData);
            
            console.log('✅ Both habits page and dashboard updated with identical data');
        } else {
            console.error('❌ Failed to load habits, status:', response.status);
        }
    } catch (error) {
        console.error('💥 Load habits and dashboard error:', error);
    }
}

// Update current week display
function updateCurrentWeekDisplay() {
    const weekDisplay = document.getElementById('current-week-display');
    if (weekDisplay) {
        const today = new Date();
        const weekStart = new Date(today);
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Get Monday of this week
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        weekStart.setDate(today.getDate() + mondayOffset);
        
        // Get Sunday of this week
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        // Format dates as "MMM DD"
        const formatOptions = { month: 'short', day: 'numeric' };
        const startStr = weekStart.toLocaleDateString('en-US', formatOptions);
        const endStr = weekEnd.toLocaleDateString('en-US', formatOptions);
        
        weekDisplay.textContent = `${startStr} - ${endStr}`;
    }
}

// Display habits in the UI
function displayHabits(habits) {
    const container = document.getElementById('habits-container');
    if (!container) return;
    
    // Update current week display when showing habits
    updateCurrentWeekDisplay();
    
    if (habits.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-white/50">
                <i class="fas fa-target text-6xl mb-4"></i>
                <h3 class="text-2xl font-bold mb-4">No Habits Yet</h3>
                <p class="mb-6">Create your first fitness habit to start building a healthier lifestyle!</p>
                <button onclick="showCreateHabitModal()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>
                    Create Your First Habit
                </button>
            </div>
        `;
        return;
    }

    // Group habits by category
    const groupedHabits = habits.reduce((groups, habit) => {
        const category = habit.category || 'general';
        if (!groups[category]) groups[category] = [];
        groups[category].push(habit);
        return groups;
    }, {});

    const categoryEmojis = {
        nutrition: '🍎',
        cardio: '❤️',
        strength: '💪',
        flexibility: '🤸',
        general: '⭐'
    };

    const categoryNames = {
        nutrition: 'Nutrition',
        cardio: 'Cardio',
        strength: 'Strength Training',
        flexibility: 'Flexibility & Recovery',
        general: 'General Fitness'
    };

    let html = '';

    Object.entries(groupedHabits).forEach(([category, categoryHabits]) => {
        html += `
            <div class="mb-8">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white flex items-center">
                        ${categoryEmojis[category] || '⭐'} ${categoryNames[category] || category}
                    </h3>
                    <div class="text-white/60 text-sm">
                        ${categoryHabits.length} habit${categoryHabits.length !== 1 ? 's' : ''}
                    </div>
                </div>
                <div class="grid gap-4">
                    ${categoryHabits.map(habit => createHabitCard(habit)).join('')}
                </div>
            </div>
        `;
    });

    // Add button to create new habit
    html += `
        <div class="text-center py-8 border-t border-white/10 mt-8">
            <button onclick="showCreateHabitModal()" class="btn-primary">
                <i class="fas fa-plus mr-2"></i>
                Create New Habit
            </button>
        </div>
    `;

    container.innerHTML = html;
    
    // After rendering habits, update all weekly progress counters to ensure accuracy
    setTimeout(() => {
        habits.forEach(habit => {
            if (habit.id) {
                updateWeeklyProgressForHabit(habit.id);
            }
        });
    }, 100); // Small delay to ensure DOM is updated
}

// Create individual habit card
function createHabitCard(habit) {
    const weekStart = getWeekStart(currentWeekOffset);
    const weekDays = Array.from({length: 7}, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        return date;
    });

    // Calculate progress for this week
    const completions = habit.completions || [];
    const weekCompletions = weekDays.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        return completions.includes(dateStr);
    });

    const completedDays = weekCompletions.filter(Boolean).length;
    const progressPercent = (completedDays / habit.weekly_target) * 100;
    
    // DEBUG: Log habit card creation details
    console.log('🏗️ Creating habit card:', {
        habitName: habit.name,
        habitId: habit.id,
        completionsFromServer: completions,
        weekDaysGenerated: weekDays.map(d => d.toISOString().split('T')[0]),
        weekCompletionsCalculated: weekCompletions,
        completedDaysCount: completedDays,
        targetCount: habit.weekly_target,
        progressPercent: progressPercent
    });

    return `
        <div class="habit-card">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                    <div class="text-3xl mr-3">${habit.emoji || '⭐'}</div>
                    <div>
                        <h4 class="text-white font-bold text-lg">${habit.name}</h4>
                        <div class="text-white/60 text-sm">
                            ${habit.weekly_target} times per week • ${habit.difficulty}
                        </div>
                    </div>
                </div>
                <div class="flex flex-col items-end space-y-2">
                    <button class="delete-habit-btn text-red-400 hover:text-red-300 text-sm" data-habit-id="${habit.id}" title="Delete habit">
                        <i class="fas fa-trash"></i>
                    </button>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-white mb-1">
                            ${completedDays}/${habit.weekly_target}
                        </div>
                        <div class="text-white/60 text-xs">This week</div>
                    </div>
                </div>
            </div>
            
            <!-- Progress Bar -->
            <div class="mb-4">
                <div class="flex justify-between text-sm text-white/60 mb-2">
                    <span>Weekly Progress</span>
                    <span>${Math.round(progressPercent)}%</span>
                </div>
                <div class="w-full bg-white/10 rounded-full h-2">
                    <div class="progress-bar h-2 rounded-full" style="width: ${Math.min(progressPercent, 100)}%"></div>
                </div>
            </div>

            <!-- Week Calendar -->
            <div class="week-calendar">
                ${weekDays.map((date, index) => {
                    const isCompleted = weekCompletions[index];
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isPast = date < new Date().setHours(0, 0, 0, 0);
                    
                    // Calculate total completions for the week
                    const totalCompletedThisWeek = weekCompletions.filter(Boolean).length;
                    const maxCompletions = habit.weekly_target || 7;
                    
                    // Logic for clickability:
                    // - Always allow unchecking (if already completed)
                    // - Only allow checking new days if under weekly target
                    const canCheck = !isCompleted && (totalCompletedThisWeek < maxCompletions);
                    const canUncheck = isCompleted;
                    const isClickable = canCheck || canUncheck;
                    
                    return `
                        <div class="day-cell habit-day-cell ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''} ${!isClickable ? 'disabled' : ''}"
                             data-habit-id="${habit.id}" 
                             data-date="${date.toISOString().split('T')[0]}"
                             ${!isClickable ? 'style="opacity: 0.4; cursor: not-allowed;" title="Weekly target of ' + maxCompletions + ' days reached"' : ''}
                             title="${isCompleted ? 'Click to uncheck (-10 pts)' : (canCheck ? 'Click to check (+10 pts)' : 'Weekly target reached')}">
                            <div class="text-xs font-medium">${date.toLocaleDateString('en', {weekday: 'short'})}</div>
                            <div class="text-lg font-bold">${date.getDate()}</div>
                            ${isCompleted ? '<i class="fas fa-check text-xs mt-1"></i>' : (!isClickable ? '<i class="fas fa-ban text-xs mt-1 text-red-400"></i>' : '')}
                        </div>
                    `;
                }).join('')}
            </div>

            ${habit.description ? `
                <div class="mt-4 pt-4 border-t border-white/10">
                    <p class="text-white/70 text-sm">${habit.description}</p>
                </div>
            ` : ''}
        </div>
    `;
}

// Note: simpleToggleHabit function moved to comprehensive habit management system below

// Function to refresh habits display after toggle to update counters
async function refreshHabitsDisplay() {
    console.log('🔄 Refreshing habits display...');
    
    try {
        // Reload habits data from server
        await loadHabits();
        
        // Always reload dashboard habits to keep dashboard in sync
        await loadDashboardHabits();
        console.log('✅ Dashboard habits also refreshed');
        
        console.log('✅ Habits display refreshed');
    } catch (error) {
        console.error('❌ Failed to refresh habits display:', error);
    }
}

// Function to update weekly progress for a specific habit
function updateWeeklyProgressForHabit(habitId) {
    console.log('📊 Updating weekly progress for habit:', habitId);
    
    try {
        // Find all day cells for this habit
        const dayCells = document.querySelectorAll(`[data-habit-id="${habitId}"]`);
        if (dayCells.length === 0) {
            console.log('❌ No day cells found for habit:', habitId);
            return;
        }
        
        console.log('📍 Found day cells:', dayCells.length);
        
        // Debug each day cell
        dayCells.forEach((cell, index) => {
            console.log(`📅 Day ${index + 1}:`, {
                classes: cell.className,
                hasCompleted: cell.classList.contains('completed'),
                innerHTML: cell.innerHTML.substring(0, 50)
            });
        });
        
        // Get the habit card from the first day cell
        const habitCard = dayCells[0].closest('.habit-card');
        if (!habitCard) {
            console.log('❌ Habit card not found');
            return;
        }
        
        // Count completed days by checking for .completed class on day cells
        const completedCells = Array.from(dayCells).filter(cell => cell.classList.contains('completed'));
        const completedCount = completedCells.length;
        
        console.log('📊 Completed cells analysis:');
        console.log('  - Total day cells:', dayCells.length);
        console.log('  - Cells with .completed class:', completedCount);
        console.log('  - Completed cells:', completedCells);
        
        // Enhanced visual completion detection for createHabitCard structure
        let visualCompletedCount = 0;
        dayCells.forEach(cell => {
            const textContent = cell.textContent || '';
            const innerHTML = cell.innerHTML || '';
            
            // Check for different completion indicators
            const hasCheckmark = textContent.includes('✓') || textContent.includes('✓');
            const hasFasCheck = innerHTML.includes('fas fa-check');
            const hasCompletedClass = cell.classList.contains('completed');
            const hasNumber = /\d/.test(textContent) && !['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].some(day => textContent.includes(day));
            
            const isCompleted = hasCheckmark || hasFasCheck || hasCompletedClass || hasNumber;
            if (isCompleted) visualCompletedCount++;
            
            console.log(`📅 Cell analysis:`, {
                text: textContent.trim(),
                hasCheckmark,
                hasFasCheck,
                hasNumber,
                hasCompletedClass,
                isCompleted,
                innerHTML: innerHTML.substring(0, 100) + (innerHTML.length > 100 ? '...' : '')
            });
        });
        
        console.log('👁️ Visual completed count:', visualCompletedCount);
        console.log('🔢 CSS class completed count:', completedCount);
        
        // Use the higher count to be more accurate
        const finalCompletedCount = Math.max(completedCount, visualCompletedCount);
        
        // Find the weekly counter in the createHabitCard structure (X/Y format)
        const counterElements = habitCard.querySelectorAll('.text-2xl.font-bold.text-white');
        let counterElement = null;
        let target = 7; // default
        
        for (const element of counterElements) {
            if (element.textContent && element.textContent.includes('/')) {
                counterElement = element;
                // Extract target from existing text (format: "3/5")
                const match = element.textContent.match(/(\d+)\/(\d+)/);
                if (match) target = parseInt(match[2]);
                break;
            }
        }
        
        if (counterElement) {
            counterElement.textContent = `${finalCompletedCount}/${target}`;
            console.log('✅ Updated counter to:', `${finalCompletedCount}/${target}`);
        } else {
            // Fallback: look for any element with X/Y pattern
            const allElements = habitCard.querySelectorAll('*');
            for (const element of allElements) {
                if (element.textContent && /^\d+\/\d+$/.test(element.textContent.trim())) {
                    const match = element.textContent.match(/(\d+)\/(\d+)/);
                    if (match) {
                        target = parseInt(match[2]);
                        element.textContent = `${finalCompletedCount}/${target}`;
                        console.log('✅ Updated counter (fallback) to:', `${finalCompletedCount}/${target}`);
                        break;
                    }
                }
            }
        }
        
        // Update progress bar width
        const progressBar = habitCard.querySelector('.progress-bar');
        if (progressBar) {
            const percentage = Math.min((finalCompletedCount / target) * 100, 100);
            progressBar.style.width = `${percentage}%`;
            console.log('✅ Updated progress bar to:', percentage + '%');
        }
        
        // Update percentage display in the weekly progress section  
        const percentageElements = habitCard.querySelectorAll('span');
        for (const span of percentageElements) {
            if (span.textContent && span.textContent.includes('%')) {
                const newPercentage = Math.round((finalCompletedCount / target) * 100);
                span.textContent = `${newPercentage}%`;
                console.log('✅ Updated percentage display to:', newPercentage + '%');
                break;
            }
        }
        
        console.log('✅ Weekly progress update complete for habit:', habitId);
    } catch (error) {
        console.error('❌ Error updating weekly progress:', error);
    }
}

// Function to immediately update day cell visual state
function updateDayCellVisualState(habitId, date, isCompleted) {
    console.log('🎨 Updating visual state:', habitId, date, isCompleted);
    
    // Find the specific day cell
    const dayCell = document.querySelector(`[data-habit-id="${habitId}"][data-date="${date}"]`);
    
    if (dayCell) {
        console.log('📍 Found day cell:', dayCell);
        console.log('📍 Current classes:', dayCell.className);
        
        // Update classes
        if (isCompleted) {
            dayCell.classList.add('completed');
            console.log('✅ Added completed class - new classes:', dayCell.className);
        } else {
            dayCell.classList.remove('completed');
            console.log('⭕ Removed completed class - new classes:', dayCell.className);
        }
        
        // Update the checkmark/circle icon
        const iconElement = dayCell.querySelector('.text-lg');
        if (iconElement) {
            iconElement.textContent = isCompleted ? '✓' : '○';
            console.log('🔄 Updated icon:', isCompleted ? '✓' : '○');
        } else {
            console.log('❌ No .text-lg element found in day cell');
        }
        
        // Update fas fa-check icon if present
        const checkIcon = dayCell.querySelector('.fas.fa-check');
        if (isCompleted && !checkIcon) {
            // Add check icon if completed
            const checkDiv = document.createElement('i');
            checkDiv.className = 'fas fa-check text-xs mt-1';
            dayCell.appendChild(checkDiv);
        } else if (!isCompleted && checkIcon) {
            // Remove check icon if not completed
            checkIcon.remove();
        }
        
        console.log('✅ Visual update complete');
    } else {
        console.error('❌ Day cell not found for:', habitId, date);
    }
}

// Simple habit completion function  
async function simpleCompleteHabit(habitId) {
    console.log('🚀 Starting simple habit complete:', habitId);
    
    if (!sessionId) {
        console.error('❌ No session ID');
        showNotification('Please log in first', 'error');
        return;
    }
    
    try {
        const today = new Date().toISOString().split('T')[0];
        await simpleToggleHabit(habitId, today);
    } catch (error) {
        console.error('💥 Error in complete habit:', error);
        showNotification('Error completing habit: ' + error.message, 'error');
    }
}

// Original toggle function (keeping for compatibility)
// Toggle habit completion for a specific day
async function toggleHabitDay(habitId, date) {
    console.log('🔄 Toggle habit called:', habitId, date);
    console.log('🔑 Session ID:', sessionId);
    console.log('🌍 Current URL:', window.location.href);
    console.log('📍 User agent:', navigator.userAgent);
    console.log('🔧 Network status:', navigator.onLine ? 'Online' : 'Offline');
    
    if (!sessionId) {
        console.error('❌ No session ID available');
        showNotification('Please log in to update habits', 'error');
        return;
    }
    
    // Check if we're on the correct domain/port
    const currentUrl = window.location.href;
    console.log('🔍 Analyzing current URL:', currentUrl);
    
    const requestData = {
        habit_id: habitId,
        date: date
    };
    
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-session-id': sessionId,
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(requestData)
    };
    
    console.log('📤 Request data:', requestData);
    console.log('📤 Request options:', requestOptions);
    
    try {
        console.log('🌐 Making fetch request to /api/habits/toggle');
        
        // Add a timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('/api/habits/toggle', {
            ...requestOptions,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📨 Response received');
        console.log('📊 Response status:', response.status);
        console.log('📊 Response ok:', response.ok);
        console.log('📊 Response URL:', response.url);
        console.log('📊 Response type:', response.type);
        console.log('📊 Response redirected:', response.redirected);
        console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Success response data:', result);
            
            // Show appropriate notification
            if (result.completed) {
                showNotification('Great job! Habit completed for today! 🎉', 'success');
            } else {
                showNotification('Habit unmarked for this date', 'info');
            }
            
            // Reload habits and dashboard with same data
            await loadHabitsAndUpdateDashboard();
            
            // Check for achievements
            checkAndAwardAchievements('habit_created');
        } else {
            const errorText = await response.text();
            console.error('❌ Error response:', response.status, errorText);
            console.error('❌ Response headers on error:', Object.fromEntries(response.headers.entries()));
            let errorMessage = 'Failed to update habit';
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error || errorMessage;
            } catch (parseError) {
                console.error('❌ Error parsing error response:', parseError);
            }
            showNotification(`${errorMessage} (Status: ${response.status})`, 'error');
        }
    } catch (error) {
        console.error('💥 Network error details:', error);
        console.error('💥 Error name:', error.name);
        console.error('💥 Error message:', error.message);
        console.error('💥 Error stack:', error.stack);
        console.error('💥 Error cause:', error.cause);
        
        let errorMsg = 'Network error - failed to update habit';
        
        if (error.name === 'AbortError') {
            errorMsg = 'Request timeout - server took too long to respond';
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            errorMsg = 'Cannot connect to server - check your internet connection';
            console.error('🚑 Connection issue detected. Current URL:', window.location.href);
            console.error('🚑 Suggested fix: Make sure you\'re accessing the app from the correct URL');
        }
        
        showNotification(errorMsg, 'error');
        
        // Offer to run network diagnostics
        setTimeout(() => {
            const runDiagnostics = confirm('Network error detected. Would you like to run diagnostics? (Check browser console after clicking OK)');
            if (runDiagnostics) {
                window.testNetwork();
            }
        }, 2000);
    }
}

// Get the start of the current week (or offset week)
function getWeekStart(offset = 0) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Get Monday
    monday.setDate(monday.getDate() + (offset * 7));
    return monday;
}

// Update habits statistics in dashboard using weekly calculation
function updateHabitsStats(habits) {
    const activeHabitsEl = document.getElementById('active-habits');
    if (activeHabitsEl) {
        activeHabitsEl.textContent = habits.length;
    }

    // Calculate weekly progress to match habits page display - sum all completions
    const weekStart = getWeekStart(currentWeekOffset || 0);
    const weekDays = Array.from({length: 7}, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        return date;
    });
    
    let totalCompletionsThisWeek = 0;
    let totalTargetThisWeek = 0;

    habits.forEach(habit => {
        const completions = habit.completions || [];
        const weekCompletions = weekDays.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            return completions.includes(dateStr);
        });
        
        const weeklyCompleted = weekCompletions.filter(Boolean).length;
        const weeklyTarget = habit.weekly_target || 7;
        
        // Sum all completions and targets across all habits
        totalCompletionsThisWeek += weeklyCompleted;
        totalTargetThisWeek += weeklyTarget;
    });

    const todayProgressEl = document.getElementById('today-progress');
    if (todayProgressEl) {
        todayProgressEl.textContent = `${totalCompletionsThisWeek}/${totalTargetThisWeek}`;
    }
    
    console.log('📊 Updated habits stats (total completions across all habits):', {
        totalCompletions: totalCompletionsThisWeek,
        totalTargets: totalTargetThisWeek,
        weekStart: weekStart.toISOString().split('T')[0]
    });

    // Calculate average performance (last 7 days)
    const avgPerformanceEl = document.getElementById('average-performance');
    if (avgPerformanceEl && habits.length > 0) {
        let totalCompleted = 0;
        let totalPossible = 0;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            habits.forEach(habit => {
                const completions = habit.completions || [];
                totalPossible++;
                if (completions.includes(dateStr)) {
                    totalCompleted++;
                }
            });
        }
        
        const percentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
        avgPerformanceEl.textContent = `${percentage}%`;
    }

    // Calculate current streak
    const currentStreakEl = document.getElementById('current-streak');
    if (currentStreakEl && habits.length > 0) {
        let streak = 0;
        const today = new Date();
        
        // Check backwards from today to find the longest streak
        for (let i = 0; i < 30; i++) { // Check last 30 days
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            let dayCompleted = false;
            habits.forEach(habit => {
                const completions = habit.completions || [];
                if (completions.includes(dateStr)) {
                    dayCompleted = true;
                }
            });
            
            if (dayCompleted) {
                streak++;
            } else {
                break;
            }
        }
        
        currentStreakEl.textContent = streak;
    }
}

// Modal helper functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Enhanced setup function that includes habit event listeners
function setupAllEventListeners() {
    setupEventListeners(); // Original event listeners
    setupHabitEventListeners(); // Habit-specific event listeners
}

// Duplicate function removed - using the updated one above

// Initialize habits when dashboard loads
function initializeHabits() {
    loadHabits();
}

// Call this after role-based dashboard is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup event listeners after DOM is loaded
    setTimeout(() => {
        setupAllEventListeners();
    }, 100);
});

// ===============================================
// COMPREHENSIVE HABIT MANAGEMENT SYSTEM - FIXED
// ===============================================

// Anti-cheat tracking for double-click prevention
const activeToggles = new Set();

// Current week offset for navigation
let currentWeekOffset = 0;

// Unified data loading function to ensure consistency between dashboard and habits page
async function loadHabitsAndUpdateDashboard() {
    console.log('🔄 Loading habits and updating both dashboard and habits page...');
    
    try {
        const response = await fetch('/api/habits', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            const habitsData = data.habits;
            
            console.log('📊 Habits data loaded:', habitsData);
            
            // Update both sections with SAME data
            displayHabits(habitsData);           // Updates habits page
            displayDashboardHabits(habitsData);  // Updates dashboard habits section
            updateHabitsStats(habitsData);       // Updates dashboard stats
            
            console.log('✅ Both dashboard and habits page updated with same data');
        } else {
            console.error('Failed to load habits:', response.status);
            showNotification('Failed to load habits', 'error');
        }
    } catch (error) {
        console.error('Load habits error:', error);
        showNotification('Failed to load habits', 'error');
    }
}

// Display habits in the main habits page
function displayHabits(habits) {
    const container = document.getElementById('habits-container');
    container.innerHTML = '';
    
    if (habits.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-white/50">
                <i class="fas fa-plus-circle text-4xl mb-4"></i>
                <h3 class="text-xl font-bold mb-2">No Habits Yet</h3>
                <p class="mb-4">Create your first fitness habit to start tracking your progress!</p>
                <button onclick="showModal('create-habit-modal')" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>
                    Create Your First Habit
                </button>
            </div>
        `;
        return;
    }
    
    habits.forEach(habit => {
        const habitCard = createWeeklyHabitCard(habit);
        container.appendChild(habitCard);
    });
    
    // Setup event listeners for habit cards
    setupHabitEventListeners();
}

// Display habits in the dashboard section (simplified view)
function displayDashboardHabits(habits) {
    const container = document.getElementById('dashboard-habits-container');
    container.innerHTML = '';
    
    if (habits.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-white/50">
                <i class="fas fa-plus-circle text-2xl mb-2"></i>
                <p class="mb-4">No habits created yet</p>
                <button onclick="showModal('create-habit-modal')" class="btn-primary">
                    Create Your First Habit
                </button>
            </div>
        `;
        return;
    }
    
    // Show first 3 habits in dashboard
    const habitsToShow = habits.slice(0, 3);
    habitsToShow.forEach(habit => {
        const habitCard = createDashboardHabitCard(habit);
        container.appendChild(habitCard);
    });
    
    if (habits.length > 3) {
        const moreCard = document.createElement('div');
        moreCard.className = 'habit-card text-center cursor-pointer';
        moreCard.onclick = () => showSection('habits');
        moreCard.innerHTML = `
            <div class="text-white/70">
                <i class="fas fa-plus text-2xl mb-2"></i>
                <p>+${habits.length - 3} more habits</p>
                <p class="text-sm">View all habits</p>
            </div>
        `;
        container.appendChild(moreCard);
    }
}

// Create weekly habit card with anti-cheat logic
function createWeeklyHabitCard(habit) {
    const div = document.createElement('div');
    div.className = 'habit-card';
    
    const weekStart = getWeekStart(currentWeekOffset || 0);
    const weekDays = Array.from({length: 7}, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        return date;
    });
    
    const completions = habit.completions || [];
    const weekCompletions = weekDays.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        return completions.includes(dateStr);
    });
    
    const completedCount = weekCompletions.filter(Boolean).length;
    const targetCount = habit.weekly_target || 7;
    const progressPercent = Math.round((completedCount / targetCount) * 100);
    
    // Generate week calendar with anti-cheat logic
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekCalendar = weekDays.map((date, index) => {
        const dateStr = date.toISOString().split('T')[0];
        const isCompleted = weekCompletions[index];
        const isToday = date.toDateString() === new Date().toDateString();
        
        // ANTI-CHEAT LOGIC: Prevent clicking more days than weekly target
        const totalCompletedThisWeek = weekCompletions.filter(Boolean).length;
        const maxCompletions = targetCount;
        
        const canCheck = !isCompleted && (totalCompletedThisWeek < maxCompletions);
        const canUncheck = isCompleted;
        const isClickable = canCheck || canUncheck;
        
        return `
            <div class="day-cell habit-day-cell ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''} ${!isClickable ? 'disabled' : ''}" 
                 data-habit-id="${habit.id}" 
                 data-date="${dateStr}"
                 data-clickable="${isClickable}"
                 title="${!isClickable && !isCompleted ? `Limit reached: ${targetCount} days per week` : ''}">
                <div class="text-xs text-white/70 font-medium">${days[index]}</div>
                <div class="text-lg mt-1">${isCompleted ? '✓' : (isClickable ? '○' : '✕')}</div>
                <div class="text-xs text-white/60">${date.getDate()}</div>
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
            <button class="btn-danger delete-habit-btn" data-habit-id="${habit.id}" title="Delete habit">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        
        <div class="mb-4">
            <div class="flex justify-between text-sm text-white/70 mb-2">
                <span>Weekly Progress</span>
                <span>${progressPercent}%</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2">
                <div class="progress-bar h-2 rounded-full" style="width: ${Math.min(progressPercent, 100)}%"></div>
            </div>
        </div>
        
        <div class="week-calendar">
            ${weekCalendar}
        </div>
    `;
    
    return div;
}

// Create simplified dashboard habit card
function createDashboardHabitCard(habit) {
    const div = document.createElement('div');
    div.className = 'habit-card mb-4';
    
    const weekStart = getWeekStart(currentWeekOffset || 0);
    const weekDays = Array.from({length: 7}, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        return date;
    });
    
    const completions = habit.completions || [];
    const weekCompletions = weekDays.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        return completions.includes(dateStr);
    });
    
    const completedCount = weekCompletions.filter(Boolean).length;
    const targetCount = habit.weekly_target || 7;
    const progressPercent = Math.round((completedCount / targetCount) * 100);
    
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

// Set up habit event listeners with double-click protection
function setupHabitEventListeners() {
    // Remove existing listeners to prevent duplicates
    document.querySelectorAll('.habit-day-cell').forEach(cell => {
        cell.removeEventListener('click', handleHabitDayClick);
    });
    
    document.querySelectorAll('.delete-habit-btn').forEach(btn => {
        btn.removeEventListener('click', handleDeleteHabit);
    });
    
    // Add new listeners
    document.querySelectorAll('.habit-day-cell').forEach(cell => {
        cell.addEventListener('click', handleHabitDayClick);
    });
    
    document.querySelectorAll('.delete-habit-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteHabit);
    });
    
    // Create habit form
    const createForm = document.getElementById('create-habit-form');
    if (createForm) {
        createForm.removeEventListener('submit', handleCreateHabit);
        createForm.addEventListener('submit', handleCreateHabit);
    }
}

// Handle habit day cell clicks with anti-cheat protection
async function handleHabitDayClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const cell = event.currentTarget;
    const habitId = cell.getAttribute('data-habit-id');
    const date = cell.getAttribute('data-date');
    const isClickable = cell.getAttribute('data-clickable') === 'true';
    
    if (!isClickable) {
        showNotification('Weekly target reached! Cannot check more days this week.', 'error');
        return;
    }
    
    await simpleToggleHabit(habitId, date);
}

// Enhanced toggle function with double-click protection
async function simpleToggleHabit(habitId, date) {
    const toggleKey = `${habitId}-${date}`;
    
    // Prevent multiple simultaneous toggles
    if (activeToggles.has(toggleKey)) {
        console.log('⚠️ Toggle already in progress for:', toggleKey);
        return;
    }
    
    activeToggles.add(toggleKey);
    
    try {
        console.log('🎯 Toggling habit:', { habitId, date, sessionId });
        
        const response = await fetch('/api/habits/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify({
                habit_id: habitId,
                date: date
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Toggle response:', result);
            
            // Show notification based on result
            if (result.completed) {
                showNotification(`Habit completed! ${result.message}`, 'success');
            } else {
                showNotification(`Habit unchecked! ${result.message}`, 'info');
            }
            
            // Update user points display
            if (result.points !== 0) {
                const userPointsEl = document.getElementById('user-points');
                if (userPointsEl && currentUser) {
                    currentUser.points = (currentUser.points || 0) + result.points;
                    userPointsEl.textContent = `⭐ ${currentUser.points} pts`;
                }
            }
            
            // Reload both sections with same data
            await loadHabitsAndUpdateDashboard();
            
        } else {
            const errorData = await response.json();
            console.error('❌ Toggle error:', errorData);
            showNotification(errorData.error || 'Failed to update habit', 'error');
        }
    } catch (error) {
        console.error('💥 Toggle error:', error);
        showNotification('Failed to update habit', 'error');
    } finally {
        activeToggles.delete(toggleKey);
    }
}

// Handle habit deletion
async function handleDeleteHabit(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const btn = event.currentTarget;
    const habitId = btn.getAttribute('data-habit-id');
    
    if (confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
        await deleteHabit(habitId);
    }
}

// Delete habit function
async function deleteHabit(habitId) {
    try {
        const response = await fetch(`/api/habits/${habitId}`, {
            method: 'DELETE',
            headers: {
                'x-session-id': sessionId
            }
        });
        
        if (response.ok) {
            showNotification('Habit deleted successfully', 'success');
            await loadHabitsAndUpdateDashboard();
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Failed to delete habit', 'error');
        }
    } catch (error) {
        console.error('Delete habit error:', error);
        showNotification('Failed to delete habit', 'error');
    }
}

// Duplicate function removed - using the correct one at line 5382

// Utility function to show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Utility function to show create habit modal (for dashboard buttons)
function showCreateHabitModal() {
    showModal('create-habit-modal');
    updateEmojiPreview(); // Initialize emoji preview
}

// ===== COMPETITION SYSTEM =====

// Global variables for competition filtering
let currentCompetitionFilter = 'all';
let currentCompetitionType = 'all';

// Load competitions with filtering
async function loadCompetitions(filter = null, type = null) {
    try {
        if (filter) currentCompetitionFilter = filter;
        if (type) currentCompetitionType = type;

        // Update filter tab appearances
        document.querySelectorAll('.competition-filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === currentCompetitionFilter);
        });
        
        document.querySelectorAll('.competition-type-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === currentCompetitionType);
        });

        // Build query parameters
        const params = new URLSearchParams();
        if (currentCompetitionFilter !== 'all') {
            if (currentCompetitionFilter === 'joined') {
                params.set('my', 'joined');
            } else if (currentCompetitionFilter === 'created') {
                params.set('my', 'created');
            } else {
                params.set('status', currentCompetitionFilter);
            }
        }
        
        if (currentCompetitionType !== 'all') {
            params.set('type', currentCompetitionType);
        }

        const response = await fetch(`/api/competitions?${params.toString()}`, {
            headers: { 'x-session-id': sessionId }
        });

        if (response.ok) {
            const data = await response.json();
            displayCompetitions(data.competitions || []);
            updateCompetitionStats(data.competitions || []);
        } else {
            console.error('Failed to load competitions');
            showNotification('Failed to load competitions', 'error');
        }
    } catch (error) {
        console.error('Error loading competitions:', error);
        showNotification('Error loading competitions', 'error');
    }
}

// Display competitions in the grid
function displayCompetitions(competitions) {
    const container = document.getElementById('competitions-container');
    
    if (competitions.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-6xl mb-4">🏆</div>
                <h3 class="text-xl text-white mb-2">No competitions found</h3>
                <p class="text-white/70">Be the first to create a competition and challenge others!</p>
                <button onclick="showCreateCompetitionModal()" class="btn-primary mt-4">
                    <i class="fas fa-plus mr-2"></i>Create Competition
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = competitions.map(competition => createCompetitionCard(competition)).join('');
}

// Create individual competition card
function createCompetitionCard(competition) {
    const now = new Date();
    const startDate = new Date(competition.start_date);
    const endDate = new Date(competition.end_date);
    const isStarted = now >= startDate;
    const isEnded = now >= endDate;
    const timeLeft = isStarted ? (endDate - now) : (startDate - now);
    
    const timeLeftText = isEnded ? 'Ended' : 
                        isStarted ? `Ends ${formatTimeLeft(timeLeft)}` : 
                        `Starts ${formatTimeLeft(timeLeft)}`;
    
    // Calculate progress for active competitions
    let progressPercent = 0;
    if (isStarted && !isEnded) {
        const total = endDate - startDate;
        const elapsed = now - startDate;
        progressPercent = Math.min(100, (elapsed / total) * 100);
    } else if (isEnded) {
        progressPercent = 100;
    }

    const cardClasses = ['competition-card'];
    if (competition.user_joined) cardClasses.push('user-joined');
    if (competition.creator_id === currentUser?.id) cardClasses.push('user-created');

    return `
        <div class="${cardClasses.join(' ')}">
            <div class="competition-status-badge competition-status-${competition.status}">
                ${competition.status}
            </div>
            <div class="competition-type-badge competition-type-${competition.competition_type}">
                ${formatCompetitionType(competition.competition_type)}
            </div>
            
            <h3 class="text-lg font-bold text-white mb-2 pr-20">${competition.title}</h3>
            
            ${competition.description ? `
                <p class="text-white/70 text-sm mb-3 line-clamp-2">${competition.description}</p>
            ` : ''}
            
            <div class="competition-participants">
                <i class="fas fa-users"></i>
                <span>${competition.participant_count}/${competition.max_participants} participants</span>
            </div>
            
            <div class="competition-dates">
                <i class="fas fa-calendar"></i>
                ${formatDateRange(competition.start_date, competition.end_date)}
            </div>
            
            <div class="text-sm text-white/60 mb-3">
                <i class="fas fa-clock"></i>
                ${timeLeftText}
            </div>
            
            ${competition.status === 'active' ? `
                <div class="competition-progress-bar">
                    <div class="competition-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
            ` : ''}
            
            ${competition.prize_description ? `
                <div class="text-sm text-green-400 mb-3">
                    <i class="fas fa-gift mr-1"></i>Prize: ${competition.prize_description}
                </div>
            ` : ''}
            
            <div class="text-xs text-white/60 mb-3">
                Created by ${competition.creator_name || 'Unknown'}
            </div>
            
            <div class="competition-actions">
                ${createCompetitionActionButtons(competition, isStarted, isEnded)}
            </div>
        </div>
    `;
}

// Create action buttons for competition card
function createCompetitionActionButtons(competition, isStarted, isEnded) {
    const buttons = [];
    
    // View details button (always available)
    buttons.push(`
        <button onclick="viewCompetitionDetails('${competition.id}')" class="btn-view">
            <i class="fas fa-eye mr-1"></i>Details
        </button>
    `);
    
    if (competition.user_joined) {
        // User is participating
        if (!isStarted) {
            // Can leave before start
            buttons.push(`
                <button onclick="leaveCompetition('${competition.id}')" class="btn-leave">
                    <i class="fas fa-sign-out-alt mr-1"></i>Leave
                </button>
            `);
        } else if (!isEnded) {
            // Can update progress during competition
            buttons.push(`
                <button onclick="showCompetitionProgressModal('${competition.id}')" class="btn-primary">
                    <i class="fas fa-chart-line mr-1"></i>Update Progress
                </button>
            `);
        }
    } else {
        // User is not participating
        if (!isStarted && competition.participant_count < competition.max_participants) {
            // Can join before start if not full
            buttons.push(`
                <button onclick="joinCompetition('${competition.id}')" class="btn-join">
                    <i class="fas fa-plus mr-1"></i>Join
                </button>
            `);
        }
    }
    
    return buttons.join('');
}

// Format competition type for display
function formatCompetitionType(type) {
    const types = {
        'weight_loss': 'Weight Loss',
        'muscle_gain': 'Muscle Gain', 
        'workout_frequency': 'Workout Count',
        'custom': 'Custom'
    };
    return types[type] || type;
}

// Format date range
function formatDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options = { month: 'short', day: 'numeric' };
    
    if (start.getFullYear() === end.getFullYear()) {
        return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    } else {
        return `${start.toLocaleDateString('en-US', { ...options, year: 'numeric' })} - ${end.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
    }
}

// Format time left
function formatTimeLeft(ms) {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
        return `in ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
        return 'soon';
    }
}

// Update competition statistics
function updateCompetitionStats(competitions) {
    const stats = competitions.reduce((acc, comp) => {
        if (comp.user_joined) acc.joined++;
        if (comp.creator_id === currentUser?.id) acc.created++;
        if (comp.status === 'active') acc.active++;
        return acc;
    }, { joined: 0, created: 0, active: 0, won: 0 });
    
    // Get won count from user profile (if available)
    if (currentUser) {
        stats.won = currentUser.competitions_won || 0;
    }

    document.getElementById('competitions-joined').textContent = stats.joined;
    document.getElementById('competitions-won').textContent = stats.won; 
    document.getElementById('competitions-created').textContent = stats.created;
    document.getElementById('active-competitions').textContent = stats.active;
}

// Show create competition modal
function showCreateCompetitionModal() {
    // Set minimum start date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().slice(0, 16);
    
    document.getElementById('comp-start-date').min = minDate;
    document.getElementById('comp-end-date').min = minDate;
    
    showModal('create-competition-modal');
}

// Join competition
async function joinCompetition(competitionId) {
    try {
        const response = await fetch('/api/competitions/participate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify({
                competition_id: competitionId,
                action: 'join'
            })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Successfully joined competition!', 'success');
            loadCompetitions(); // Refresh the list
        } else {
            showNotification(data.error || 'Failed to join competition', 'error');
        }
    } catch (error) {
        console.error('Error joining competition:', error);
        showNotification('Error joining competition', 'error');
    }
}

// Leave competition  
async function leaveCompetition(competitionId) {
    if (!confirm('Are you sure you want to leave this competition?')) {
        return;
    }

    try {
        const response = await fetch('/api/competitions/participate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-session-id': sessionId
            },
            body: JSON.stringify({
                competition_id: competitionId,
                action: 'leave'
            })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Left competition successfully', 'success');
            loadCompetitions(); // Refresh the list
        } else {
            showNotification(data.error || 'Failed to leave competition', 'error');
        }
    } catch (error) {
        console.error('Error leaving competition:', error);
        showNotification('Error leaving competition', 'error');
    }
}

// View competition details
async function viewCompetitionDetails(competitionId) {
    try {
        // Load competition details and leaderboard
        const [compResponse, leaderboardResponse] = await Promise.all([
            fetch(`/api/competitions?competition_id=${competitionId}`, {
                headers: { 'x-session-id': sessionId }
            }),
            fetch(`/api/competitions/participate?competition_id=${competitionId}`, {
                headers: { 'x-session-id': sessionId }
            })
        ]);

        if (compResponse.ok && leaderboardResponse.ok) {
            const compData = await compResponse.json();
            const leaderboardData = await leaderboardResponse.json();
            
            displayCompetitionDetails(compData.competitions[0], leaderboardData.leaderboard);
            showModal('competition-details-modal');
        } else {
            showNotification('Failed to load competition details', 'error');
        }
    } catch (error) {
        console.error('Error loading competition details:', error);
        showNotification('Error loading competition details', 'error');
    }
}

// Display competition details in modal
function displayCompetitionDetails(competition, leaderboard) {
    document.getElementById('comp-details-title').textContent = competition.title;
    
    const content = document.getElementById('competition-details-content');
    content.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <div class="glass-card p-4 mb-4">
                    <h4 class="text-lg font-semibold text-white mb-3">Competition Info</h4>
                    
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-white/70">Type:</span>
                            <span class="text-white">${formatCompetitionType(competition.competition_type)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-white/70">Status:</span>
                            <span class="text-white capitalize">${competition.status}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-white/70">Participants:</span>
                            <span class="text-white">${competition.participant_count}/${competition.max_participants}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-white/70">Creator:</span>
                            <span class="text-white">${competition.creator_name}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-white/70">Start Date:</span>
                            <span class="text-white">${new Date(competition.start_date).toLocaleDateString()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-white/70">End Date:</span>
                            <span class="text-white">${new Date(competition.end_date).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    ${competition.description ? `
                        <div class="mt-4">
                            <h5 class="text-white font-medium mb-2">Description</h5>
                            <p class="text-white/70 text-sm">${competition.description}</p>
                        </div>
                    ` : ''}
                    
                    ${competition.prize_description ? `
                        <div class="mt-4">
                            <h5 class="text-white font-medium mb-2">Prize</h5>
                            <p class="text-green-400 text-sm">${competition.prize_description}</p>
                        </div>
                    ` : ''}
                    
                    ${competition.rules ? `
                        <div class="mt-4">
                            <h5 class="text-white font-medium mb-2">Rules</h5>
                            <p class="text-white/70 text-sm">${competition.rules}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div>
                <div class="glass-card p-4">
                    <h4 class="text-lg font-semibold text-white mb-3">
                        <i class="fas fa-trophy mr-2"></i>Leaderboard
                    </h4>
                    
                    <div class="space-y-2">
                        ${leaderboard.length > 0 ? leaderboard.map((entry, index) => `
                            <div class="leaderboard-entry ${index < 3 ? 'top-3' : ''}">
                                <div class="flex items-center gap-3">
                                    <div class="leaderboard-rank rank-${entry.ranking || index + 1}">
                                        ${entry.ranking || index + 1}
                                    </div>
                                    <div class="flex-1">
                                        <div class="text-white font-medium">${entry.user_name}</div>
                                        <div class="text-white/60 text-xs">
                                            ${entry.progress_entries} progress updates
                                            ${entry.last_update ? `• Last: ${new Date(entry.last_update).toLocaleDateString()}` : ''}
                                        </div>
                                    </div>
                                    <div class="text-white font-bold">
                                        ${entry.final_score || 0}
                                    </div>
                                </div>
                            </div>
                        `).join('') : `
                            <div class="text-center py-8 text-white/70">
                                <i class="fas fa-users text-2xl mb-2"></i>
                                <p>No participants yet</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Show competition progress modal
function showCompetitionProgressModal(competitionId) {
    document.getElementById('comp-progress-competition-id').value = competitionId;
    showModal('competition-progress-modal');
}

// Event listeners for competition system
document.addEventListener('DOMContentLoaded', function() {
    // Competition filter tabs
    document.addEventListener('click', function(e) {
        if (e.target.matches('.competition-filter-tab')) {
            const filter = e.target.dataset.filter;
            loadCompetitions(filter, null);
        }
        
        if (e.target.matches('.competition-type-tab')) {
            const type = e.target.dataset.type;
            loadCompetitions(null, type);
        }
    });
    
    // Create competition form
    const createCompForm = document.getElementById('create-competition-form');
    if (createCompForm) {
        createCompForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading state immediately
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating Competition...';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData(this);
                const data = Object.fromEntries(formData);
                const response = await fetch('/api/competitions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-session-id': sessionId
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    showNotification('Competition created successfully!', 'success');
                    closeModal('create-competition-modal');
                    this.reset();
                    loadCompetitions();
                } else {
                    showNotification(result.error || 'Failed to create competition', 'error');
                }
            } catch (error) {
                console.error('Error creating competition:', error);
                showNotification('Error creating competition', 'error');
            } finally {
                // Always restore button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Competition progress form
    const progressForm = document.getElementById('competition-progress-form');
    if (progressForm) {
        progressForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading state immediately
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Updating Progress...';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData(this);
                const data = Object.fromEntries(formData);
                const response = await fetch('/api/competitions/progress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-session-id': sessionId
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    showNotification('Progress updated successfully!', 'success');
                    closeModal('competition-progress-modal');
                    this.reset();
                    loadCompetitions();
                } else {
                    showNotification(result.error || 'Failed to update progress', 'error');
                }
            } catch (error) {
                console.error('Error updating progress:', error);
                showNotification('Error updating progress', 'error');
            } finally {
                // Always restore button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Date validation for competition form
    const startDateInput = document.getElementById('comp-start-date');
    const endDateInput = document.getElementById('comp-end-date');
    
    if (startDateInput && endDateInput) {
        startDateInput.addEventListener('change', function() {
            endDateInput.min = this.value;
        });
    }
});

console.log('✅ Competition system loaded successfully');

// ===== CALENDAR-BASED MEDIA SELECTION =====

// Global variables for calendar system
let currentCalendarDate = new Date();
let selectedDate = null;
let calendarViewActive = false;
let mediaDataByDate = new Map();
let currentDateFilter = 'all';

// Toggle calendar view
function toggleCalendarView() {
    calendarViewActive = !calendarViewActive;
    const calendarView = document.getElementById('calendar-view');
    const toggleBtn = document.getElementById('calendar-toggle-btn');
    
    if (calendarViewActive) {
        calendarView.classList.remove('hidden');
        toggleBtn.innerHTML = '<i class="fas fa-list mr-2"></i>List View';
        generateCalendar();
    } else {
        calendarView.classList.add('hidden');
        toggleBtn.innerHTML = '<i class="fas fa-calendar mr-2"></i>Calendar View';
        clearDateFilter();
    }
}

// Generate calendar for current month
function generateCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // Update month/year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('calendar-month-year').textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createCalendarDay(day, year, month - 1, true);
        calendarGrid.appendChild(dayElement);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createCalendarDay(day, year, month, false);
        calendarGrid.appendChild(dayElement);
    }
    
    // Next month days to fill grid
    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells; // 6 rows × 7 days
    for (let day = 1; day <= remainingCells && day <= 14; day++) {
        const dayElement = createCalendarDay(day, year, month + 1, true);
        calendarGrid.appendChild(dayElement);
    }
}

// Create individual calendar day element
function createCalendarDay(day, year, month, otherMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    const date = new Date(year, month, day);
    const dateKey = formatDateKey(date);
    const today = new Date();
    
    // Add classes
    if (otherMonth) {
        dayElement.classList.add('other-month');
    }
    
    if (!otherMonth && date.toDateString() === today.toDateString()) {
        dayElement.classList.add('today');
    }
    
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
        dayElement.classList.add('selected');
    }
    
    // Check if date has media
    const mediaCount = getMediaCountForDate(dateKey);
    if (mediaCount > 0) {
        dayElement.classList.add('has-media');
        if (mediaCount > 1) {
            dayElement.classList.add('has-multiple-media');
        }
        dayElement.title = `${mediaCount} photo${mediaCount > 1 ? 's' : ''} on this date`;
    }
    
    // Add click handler for non-other-month days
    if (!otherMonth) {
        dayElement.addEventListener('click', () => selectCalendarDate(date));
    }
    
    return dayElement;
}

// Select a date from calendar
function selectCalendarDate(date) {
    selectedDate = date;
    const dateKey = formatDateKey(date);
    
    // Update calendar display
    generateCalendar();
    
    // Update selected date info
    const selectedInfo = document.getElementById('selected-date-info');
    const selectedText = document.getElementById('selected-date-text');
    const selectedCount = document.getElementById('selected-date-count');
    
    selectedText.textContent = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const mediaCount = getMediaCountForDate(dateKey);
    selectedCount.textContent = `${mediaCount} photo${mediaCount !== 1 ? 's' : ''} found`;
    
    selectedInfo.classList.remove('hidden');
    
    // Filter media by selected date
    filterMediaByDate(dateKey);
}

// Change calendar month
function changeCalendarMonth(direction) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    generateCalendar();
}

// Go to today's date
function goToToday() {
    currentCalendarDate = new Date();
    generateCalendar();
}

// Clear date filter
function clearDateFilter() {
    selectedDate = null;
    currentDateFilter = 'all';
    
    // Hide selected date info
    document.getElementById('selected-date-info').classList.add('hidden');
    
    // Update active filter tab
    document.querySelectorAll('.date-filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.range === 'all');
    });
    
    // Regenerate calendar and reload media
    if (calendarViewActive) {
        generateCalendar();
    }
    loadMedia();
}

// Filter by date range
function filterByDateRange(range) {
    currentDateFilter = range;
    selectedDate = null;
    
    // Update active filter tab
    document.querySelectorAll('.date-filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.range === range);
    });
    
    // Hide selected date info
    document.getElementById('selected-date-info').classList.add('hidden');
    
    // Filter media based on range
    const now = new Date();
    let startDate = null;
    
    switch(range) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'this-week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay());
            break;
        case 'this-month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'last-30-days':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
            break;
        case 'last-3-months':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 3);
            break;
        case 'all':
        default:
            startDate = null;
            break;
    }
    
    filterMediaByDateRange(startDate);
    
    if (calendarViewActive) {
        generateCalendar();
    }
}

// Filter media by specific date
function filterMediaByDate(dateKey) {
    const mediaContainer = document.getElementById('media-container');
    const mediaItems = mediaContainer.querySelectorAll('.media-item');
    
    let visibleCount = 0;
    
    mediaItems.forEach(item => {
        const mediaDate = item.dataset.date;
        if (mediaDate === dateKey) {
            item.style.display = '';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show/hide empty state
    const emptyState = document.getElementById('media-empty-state');
    if (visibleCount === 0) {
        emptyState.classList.remove('hidden');
        emptyState.innerHTML = `
            <div class="text-6xl mb-4">📅</div>
            <h3 class="text-xl font-bold text-white mb-2">No photos on this date</h3>
            <p class="text-white/70 mb-6">Upload a photo for ${selectedDate.toLocaleDateString()} to start tracking your progress.</p>
            <button onclick="showMediaUploadModal()" class="btn-primary">
                <i class="fas fa-camera mr-2"></i>Upload Photo
            </button>
        `;
    } else {
        emptyState.classList.add('hidden');
    }
}

// Filter media by date range
function filterMediaByDateRange(startDate) {
    const mediaContainer = document.getElementById('media-container');
    const mediaItems = mediaContainer.querySelectorAll('.media-item');
    
    let visibleCount = 0;
    
    mediaItems.forEach(item => {
        const mediaDateStr = item.dataset.date;
        if (!mediaDateStr || !startDate) {
            item.style.display = '';
            visibleCount++;
            return;
        }
        
        const mediaDate = new Date(mediaDateStr);
        if (mediaDate >= startDate) {
            item.style.display = '';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show/hide empty state
    const emptyState = document.getElementById('media-empty-state');
    if (visibleCount === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }
}

// Get media count for a specific date
function getMediaCountForDate(dateKey) {
    return mediaDataByDate.get(dateKey) || 0;
}

// Format date as key (YYYY-MM-DD)
function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

// Update media data cache with date information
function updateMediaDateCache(mediaItems) {
    mediaDataByDate.clear();
    
    mediaItems.forEach(item => {
        if (item.created_at) {
            const date = new Date(item.created_at);
            const dateKey = formatDateKey(date);
            const count = mediaDataByDate.get(dateKey) || 0;
            mediaDataByDate.set(dateKey, count + 1);
        }
    });
}

// Enhanced loadMedia function to support calendar features
const originalLoadMedia = loadMedia;
async function loadMediaEnhanced() {
    try {
        const response = await fetch('/api/media/enhanced?stats=true&pairs=true', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Update media date cache
            updateMediaDateCache(data.media || []);
            
            // Use existing display system
            displayEnhancedMedia(data);
            updateMediaStats(data);
            
            // Update calendar if active
            if (calendarViewActive) {
                generateCalendar();
            }
        } else {
            // Fallback to regular media API
            const fallbackResponse = await fetch('/api/media', {
                headers: { 'x-session-id': sessionId }
            });
            if (fallbackResponse.ok) {
                const mediaResponse = await fallbackResponse.json();
                const mediaArray = mediaResponse.media || [];
                
                // Update media date cache
                updateMediaDateCache(mediaArray);
                
                // Use existing display system
                displayMedia(mediaArray);
                
                // Calculate and update stats for the fallback
                const stats = {
                    total: mediaArray.length,
                    before_count: mediaArray.filter(m => m.media_type === 'before').length,
                    after_count: mediaArray.filter(m => m.media_type === 'after').length,
                    comparison_count: 0
                };
                updateMediaStats({ stats });
                
                // Update calendar if active
                if (calendarViewActive) {
                    generateCalendar();
                }
            }
        }
    } catch (error) {
        console.error('Error loading media:', error);
    }
}

// Replace the global loadMedia with enhanced version
window.loadMedia = loadMediaEnhanced;

// Display media items with date badges
function displayMediaWithDates(mediaItems) {
    const container = document.getElementById('media-container');
    const emptyState = document.getElementById('media-empty-state');
    
    if (mediaItems.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    const mediaHTML = mediaItems.map(item => {
        const date = new Date(item.created_at);
        const dateKey = formatDateKey(date);
        const isVideo = item.media_type === 'video' || item.file_type?.startsWith('video/');
        
        return `
            <div class="media-item" data-date="${dateKey}" data-id="${item.id}">
                <div class="media-date-badge">
                    ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                
                ${isVideo ? `
                    <video controls class="media-content">
                        <source src="${item.media_url}" type="${item.file_type}">
                        Your browser does not support video playback.
                    </video>
                ` : `
                    <img src="${item.media_url}" alt="${item.media_type ? item.media_type.charAt(0).toUpperCase() + item.media_type.slice(1) : 'Media'} image" class="media-content" loading="lazy">
                `}
                
                <div class="media-info">
                    <div class="media-type-badge media-type-${item.media_type}">
                        ${item.media_type}
                    </div>
                    ${item.notes ? `<p class="media-notes">${item.notes}</p>` : ''}
                </div>
                
                <div class="comparison-overlay">
                    <div class="comparison-controls">
                        <button onclick="addToComparison('${item.id}')" class="btn-compare">
                            <i class="fas fa-plus mr-1"></i>Compare
                        </button>
                        <button onclick="viewMediaFullscreen('${item.media_url}', '${item.media_type}')" class="btn-compare">
                            <i class="fas fa-expand mr-1"></i>View
                        </button>
                    </div>
                </div>
                
                <div class="media-actions">
                    <button onclick="deleteMedia('${item.id}')" class="delete-btn" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = mediaHTML;
}

// Comparison mode functionality
let comparisonItems = [];

function addToComparison(mediaId) {
    const mediaItem = document.querySelector(`[data-id="${mediaId}"]`);
    if (!mediaItem) return;
    
    if (comparisonItems.includes(mediaId)) {
        // Remove from comparison
        comparisonItems = comparisonItems.filter(id => id !== mediaId);
        mediaItem.classList.remove('selected-for-comparison');
    } else {
        // Add to comparison (limit to 4 items)
        if (comparisonItems.length < 4) {
            comparisonItems.push(mediaId);
            mediaItem.classList.add('selected-for-comparison');
        } else {
            showNotification('Maximum 4 photos can be compared at once', 'warning');
            return;
        }
    }
    
    updateComparisonStatus();
}

function updateComparisonStatus() {
    const comparisonBtn = document.getElementById('comparison-mode-btn');
    if (comparisonItems.length > 1) {
        comparisonBtn.textContent = `Compare (${comparisonItems.length})`;
        comparisonBtn.classList.remove('btn-secondary');
        comparisonBtn.classList.add('btn-primary');
    } else {
        comparisonBtn.textContent = 'Compare Mode';
        comparisonBtn.classList.remove('btn-primary');
        comparisonBtn.classList.add('btn-secondary');
    }
}

function showComparisonMode() {
    if (comparisonItems.length < 2) {
        showNotification('Select at least 2 photos to compare', 'warning');
        return;
    }
    
    // This will be implemented in Feature 5: Media Comparison Tools
    showNotification(`Comparison mode with ${comparisonItems.length} photos - Feature coming next!`, 'info');
}

// Initialize calendar system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize calendar date to today
    currentCalendarDate = new Date();
    
    // Add CSS class for comparison selection
    const style = document.createElement('style');
    style.textContent = `
        .selected-for-comparison {
            border: 3px solid #8b5cf6 !important;
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.5) !important;
        }
    `;
    document.head.appendChild(style);
});

console.log('✅ Calendar-based media selection system loaded successfully');

// ===== MEDIA COMPARISON TOOLS =====

// Global variables for comparison system
let comparisonLayout = 'grid'; // 'grid' or 'side'
let comparisonPhotos = [];
let fullscreenMediaArray = [];
let currentFullscreenIndex = 0;

// Show comprehensive comparison mode
function showComparisonMode() {
    if (comparisonItems.length < 2) {
        showNotification('Select at least 2 photos to compare', 'warning');
        return;
    }
    
    // Load selected photos for comparison
    loadComparisonPhotos();
    showModal('photo-comparison-modal');
}

// Load photos for comparison
async function loadComparisonPhotos() {
    try {
        const response = await fetch('/api/media', {
            headers: { 'x-session-id': sessionId }
        });

        if (response.ok) {
            const data = await response.json();
            const allMedia = data.media || [];
            
            // Filter to selected items
            comparisonPhotos = allMedia.filter(item => comparisonItems.includes(item.id));
            
            // Sort by date (oldest first by default)
            sortComparisonPhotos('date-asc');
            
            displayComparisonPhotos();
            updateComparisonAnalytics();
        } else {
            showNotification('Failed to load comparison photos', 'error');
        }
    } catch (error) {
        console.error('Error loading comparison photos:', error);
        showNotification('Error loading comparison photos', 'error');
    }
}

// Display comparison photos
function displayComparisonPhotos() {
    const container = document.getElementById('comparison-container');
    const countElement = document.getElementById('comparison-count');
    
    countElement.textContent = `${comparisonPhotos.length} photo${comparisonPhotos.length !== 1 ? 's' : ''}`;
    
    if (comparisonPhotos.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-6xl mb-4">🖼️</div>
                <h3 class="text-xl text-white mb-2">No photos selected</h3>
                <p class="text-white/70">Go back and select photos to compare</p>
            </div>
        `;
        return;
    }
    
    // Set container layout class
    container.className = comparisonLayout === 'grid' ? 'comparison-view-grid' : 'comparison-view-side';
    
    const photosHTML = comparisonPhotos.map((photo, index) => {
        const date = new Date(photo.created_at);
        return `
            <div class="comparison-photo" data-id="${photo.id}">
                <button onclick="removeFromComparison('${photo.id}')" class="comparison-remove-btn">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="comparison-photo-header">
                    <div class="comparison-photo-title">
                        Photo ${index + 1}
                    </div>
                    <div class="comparison-photo-date">
                        ${date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                        })}
                    </div>
                </div>
                
                <img src="${photo.media_url}" 
                     alt="${photo.media_type ? photo.media_type.charAt(0).toUpperCase() + photo.media_type.slice(1) : 'Media'} image" 
                     class="comparison-photo-image"
                     onclick="openFullscreenViewer(${index})"
                     loading="lazy">
                
                <div class="comparison-photo-info">
                    <div class="comparison-photo-type media-type-${photo.media_type}">
                        ${photo.media_type}
                    </div>
                    ${photo.notes ? `
                        <div class="comparison-photo-notes">${photo.notes}</div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    // Add empty slots if less than 4 photos
    const emptySlots = Math.max(0, 4 - comparisonPhotos.length);
    const emptySlotsHTML = Array(emptySlots).fill('').map(() => `
        <div class="comparison-empty-slot" onclick="addMoreToComparison()">
            <div class="comparison-empty-icon">
                <i class="fas fa-plus"></i>
            </div>
            <div class="comparison-empty-text">
                Click to add more photos
            </div>
        </div>
    `).join('');
    
    container.innerHTML = photosHTML + emptySlotsHTML;
}

// Toggle comparison layout
function toggleComparisonLayout() {
    comparisonLayout = comparisonLayout === 'grid' ? 'side' : 'grid';
    const toggleBtn = document.getElementById('layout-toggle-btn');
    
    if (comparisonLayout === 'grid') {
        toggleBtn.innerHTML = '<i class="fas fa-th-large mr-2"></i>Grid Layout';
    } else {
        toggleBtn.innerHTML = '<i class="fas fa-columns mr-2"></i>Side by Side';
    }
    
    displayComparisonPhotos();
}

// Sort comparison photos
function sortComparisonPhotos(sortBy) {
    const sortSelect = document.getElementById('comparison-sort');
    if (sortSelect) sortSelect.value = sortBy;
    
    switch(sortBy) {
        case 'date-asc':
            comparisonPhotos.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'date-desc':
            comparisonPhotos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'type':
            comparisonPhotos.sort((a, b) => a.media_type.localeCompare(b.media_type));
            break;
    }
    
    displayComparisonPhotos();
    updateComparisonAnalytics();
}

// Remove photo from comparison
function removeFromComparison(mediaId) {
    comparisonItems = comparisonItems.filter(id => id !== mediaId);
    comparisonPhotos = comparisonPhotos.filter(photo => photo.id !== mediaId);
    
    // Update main UI
    const mediaItem = document.querySelector(`[data-id="${mediaId}"]`);
    if (mediaItem) {
        mediaItem.classList.remove('selected-for-comparison');
    }
    
    updateComparisonStatus();
    displayComparisonPhotos();
    updateComparisonAnalytics();
    
    if (comparisonPhotos.length < 2) {
        showNotification('Need at least 2 photos for comparison', 'warning');
    }
}

// Clear all comparison selections
function clearComparison() {
    comparisonItems = [];
    comparisonPhotos = [];
    
    // Remove selection indicators from UI
    document.querySelectorAll('.selected-for-comparison').forEach(item => {
        item.classList.remove('selected-for-comparison');
    });
    
    updateComparisonStatus();
    displayComparisonPhotos();
    updateComparisonAnalytics();
}

// Add more photos to comparison
function addMoreToComparison() {
    closeModal('photo-comparison-modal');
    showNotification('Select more photos from the gallery, then click Compare again', 'info');
}

// Update comparison analytics
function updateComparisonAnalytics() {
    if (comparisonPhotos.length < 2) {
        document.getElementById('comparison-time-range').textContent = '-';
        document.getElementById('comparison-type-breakdown').innerHTML = '-';
        document.getElementById('comparison-progress-summary').textContent = 'Select at least 2 photos to see analysis';
        return;
    }
    
    // Calculate time range
    const dates = comparisonPhotos.map(photo => new Date(photo.created_at)).sort((a, b) => a - b);
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    const daysDiff = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24));
    
    const timeRange = daysDiff === 0 ? 'Same day' : 
                     daysDiff === 1 ? '1 day apart' : 
                     `${daysDiff} days apart`;
    
    document.getElementById('comparison-time-range').textContent = timeRange;
    
    // Type breakdown
    const typeCount = {};
    comparisonPhotos.forEach(photo => {
        typeCount[photo.media_type] = (typeCount[photo.media_type] || 0) + 1;
    });
    
    const typeColors = {
        'before': '#ef4444',
        'progress': '#3b82f6', 
        'after': '#22c55e'
    };
    
    const typeBreakdown = Object.entries(typeCount).map(([type, count]) => `
        <div class="type-breakdown-item">
            <div class="flex items-center">
                <div class="type-breakdown-color" style="background: ${typeColors[type] || '#8b5cf6'}"></div>
                <span class="capitalize">${type}</span>
            </div>
            <span>${count}</span>
        </div>
    `).join('');
    
    document.getElementById('comparison-type-breakdown').innerHTML = typeBreakdown;
    
    // Progress summary
    const hasBeforeAndAfter = typeCount.before && typeCount.after;
    const progressSummary = hasBeforeAndAfter ? 
        `Transformation tracked over ${timeRange} with ${comparisonPhotos.length} photos` :
        `${comparisonPhotos.length} photos selected for comparison`;
        
    document.getElementById('comparison-progress-summary').textContent = progressSummary;
}

// Fullscreen viewer functions
function openFullscreenViewer(startIndex = 0) {
    fullscreenMediaArray = comparisonPhotos;
    currentFullscreenIndex = startIndex;
    
    document.getElementById('fullscreen-viewer').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    displayFullscreenMedia();
}

function displayFullscreenMedia() {
    if (fullscreenMediaArray.length === 0) return;
    
    const photo = fullscreenMediaArray[currentFullscreenIndex];
    const container = document.getElementById('fullscreen-media-container');
    const counter = document.getElementById('fullscreen-counter');
    
    // Update counter
    counter.textContent = `${currentFullscreenIndex + 1} / ${fullscreenMediaArray.length}`;
    
    // Update navigation buttons
    document.getElementById('prev-btn').style.opacity = currentFullscreenIndex > 0 ? '1' : '0.5';
    document.getElementById('next-btn').style.opacity = currentFullscreenIndex < fullscreenMediaArray.length - 1 ? '1' : '0.5';
    
    // Display media
    const isVideo = photo.media_type === 'video' || photo.file_type?.startsWith('video/');
    
    container.innerHTML = isVideo ? `
        <video controls class="fullscreen-media" autoplay>
            <source src="${photo.media_url}" type="${photo.file_type}">
            Your browser does not support video playback.
        </video>
    ` : `
        <img src="${photo.media_url}" alt="${photo.media_type ? photo.media_type.charAt(0).toUpperCase() + photo.media_type.slice(1) : 'Media'} image" class="fullscreen-media">
    `;
    
    // Update info panel
    updateFullscreenInfo(photo);
}

function updateFullscreenInfo(photo) {
    const date = new Date(photo.created_at);
    const infoDetails = document.getElementById('fullscreen-info-details');
    
    infoDetails.innerHTML = `
        <div><strong>Date:</strong> ${date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}</div>
        <div><strong>Time:</strong> ${date.toLocaleTimeString()}</div>
        <div><strong>Type:</strong> <span class="capitalize">${photo.media_type}</span></div>
        <div><strong>File Size:</strong> ${formatFileSize(photo.file_size || 0)}</div>
        ${photo.notes ? `<div><strong>Notes:</strong> ${photo.notes}</div>` : ''}
    `;
}

function prevFullscreenMedia() {
    if (currentFullscreenIndex > 0) {
        currentFullscreenIndex--;
        displayFullscreenMedia();
    }
}

function nextFullscreenMedia() {
    if (currentFullscreenIndex < fullscreenMediaArray.length - 1) {
        currentFullscreenIndex++;
        displayFullscreenMedia();
    }
}

function toggleFullscreenInfo() {
    const info = document.getElementById('fullscreen-info');
    const toggleBtn = document.getElementById('info-toggle-btn');
    
    if (info.classList.contains('hidden')) {
        info.classList.remove('hidden');
        toggleBtn.innerHTML = '<i class="fas fa-info-circle"></i>';
    } else {
        info.classList.add('hidden');
        toggleBtn.innerHTML = '<i class="far fa-info-circle"></i>';
    }
}

function closeFullscreenViewer() {
    document.getElementById('fullscreen-viewer').classList.add('hidden');
    document.body.style.overflow = '';
}

function closePhotoComparison() {
    closeModal('photo-comparison-modal');
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function downloadComparison() {
    // Create a canvas to combine all comparison photos
    if (comparisonPhotos.length === 0) {
        showNotification('No photos to download', 'warning');
        return;
    }
    
    showNotification('Preparing comparison download...', 'info');
    
    // This would typically involve canvas manipulation to create a collage
    // For now, we'll download individual photos
    comparisonPhotos.forEach((photo, index) => {
        const link = document.createElement('a');
        link.href = photo.media_url;
        link.download = `comparison-${index + 1}-${new Date(photo.created_at).toISOString().split('T')[0]}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    showNotification(`Downloaded ${comparisonPhotos.length} comparison photos`, 'success');
}

function downloadFullscreenMedia() {
    const photo = fullscreenMediaArray[currentFullscreenIndex];
    if (!photo) return;
    
    const link = document.createElement('a');
    link.href = photo.media_url;
    link.download = `progress-photo-${new Date(photo.created_at).toISOString().split('T')[0]}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Photo downloaded successfully', 'success');
}

// Enhanced viewMediaFullscreen function
function viewMediaFullscreen(mediaUrl, mediaType) {
    // Find the media in current media list
    const mediaContainer = document.getElementById('media-container');
    const mediaItems = Array.from(mediaContainer.querySelectorAll('.media-item'));
    
    // Build array of all visible media for navigation
    fullscreenMediaArray = [];
    let startIndex = 0;
    
    mediaItems.forEach((item, index) => {
        if (item.style.display !== 'none') {
            const mediaId = item.dataset.id;
            // Find media data (this would need to be available globally)
            // For now, create minimal object
            fullscreenMediaArray.push({
                id: mediaId,
                media_url: item.querySelector('.media-content').src,
                media_type: mediaType,
                created_at: new Date().toISOString(), // Placeholder
                notes: item.querySelector('.media-notes')?.textContent || ''
            });
            
            if (item.querySelector('.media-content').src === mediaUrl) {
                startIndex = fullscreenMediaArray.length - 1;
            }
        }
    });
    
    currentFullscreenIndex = startIndex;
    
    document.getElementById('fullscreen-viewer').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    displayFullscreenMedia();
}

// Event listeners for comparison system
document.addEventListener('DOMContentLoaded', function() {
    // Comparison sort handler
    const sortSelect = document.getElementById('comparison-sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortComparisonPhotos(this.value);
        });
    }
    
    // Keyboard navigation for fullscreen viewer
    document.addEventListener('keydown', function(e) {
        const fullscreenViewer = document.getElementById('fullscreen-viewer');
        if (!fullscreenViewer.classList.contains('hidden')) {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    prevFullscreenMedia();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextFullscreenMedia();
                    break;
                case 'Escape':
                    e.preventDefault();
                    closeFullscreenViewer();
                    break;
                case 'i':
                case 'I':
                    e.preventDefault();
                    toggleFullscreenInfo();
                    break;
                case 'd':
                case 'D':
                    e.preventDefault();
                    downloadFullscreenMedia();
                    break;
            }
        }
    });
});

console.log('✅ Media comparison tools loaded successfully');

// ===== MOBILE OPTIMIZATION ENHANCEMENTS =====

// Touch and mobile-specific improvements
let touchStartY = 0;
let touchEndY = 0;

// Improved mobile navigation
function initializeMobileOptimizations() {
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isMobile || hasTouch) {
        // Add mobile class to body
        document.body.classList.add('mobile-device');
        
        // Optimize scroll behavior for mobile
        optimizeScrollBehavior();
        
        // Improve modal behavior on mobile
        optimizeMobileModals();
        
        // Enhanced touch navigation for fullscreen viewer
        enhanceTouchNavigation();
        
        // Optimize calendar for touch
        optimizeTouchCalendar();
        
        // Improve form interactions
        optimizeMobileForms();
    }
}

// Optimize scroll behavior for mobile
function optimizeScrollBehavior() {
    // Prevent body scroll when modals are open
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('touchmove', function(e) {
            if (e.target === this) {
                e.preventDefault();
            }
        });
    });
    
    // Smooth scrolling for navigation tabs
    const navContainer = document.querySelector('.flex.space-x-4.overflow-x-auto');
    if (navContainer) {
        navContainer.style.scrollBehavior = 'smooth';
    }
}

// Optimize modals for mobile
function optimizeMobileModals() {
    // Auto-adjust modal heights
    function adjustModalHeights() {
        const modals = document.querySelectorAll('.modal-content');
        modals.forEach(modal => {
            if (!modal.closest('.modal').classList.contains('hidden')) {
                const maxHeight = window.innerHeight - 40; // 20px margin on each side
                modal.style.maxHeight = `${maxHeight}px`;
            }
        });
    }
    
    // Adjust on orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(adjustModalHeights, 100);
    });
    
    // Adjust on resize
    window.addEventListener('resize', adjustModalHeights);
}

// Enhanced touch navigation for fullscreen viewer
function enhanceTouchNavigation() {
    const fullscreenViewer = document.getElementById('fullscreen-viewer');
    if (!fullscreenViewer) return;
    
    fullscreenViewer.addEventListener('touchstart', function(e) {
        if (e.target.closest('.fullscreen-media-container')) {
            touchStartY = e.touches[0].clientY;
        }
    });
    
    fullscreenViewer.addEventListener('touchend', function(e) {
        if (e.target.closest('.fullscreen-media-container')) {
            touchEndY = e.changedTouches[0].clientY;
            handleFullscreenSwipe();
        }
    });
    
    // Add swipe gestures for media navigation
    let touchStartX = 0;
    let touchEndX = 0;
    
    fullscreenViewer.addEventListener('touchstart', function(e) {
        if (e.target.closest('.fullscreen-media-container')) {
            touchStartX = e.touches[0].clientX;
        }
    });
    
    fullscreenViewer.addEventListener('touchend', function(e) {
        if (e.target.closest('.fullscreen-media-container')) {
            touchEndX = e.changedTouches[0].clientX;
            handleHorizontalSwipe();
        }
    });
}

function handleFullscreenSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchStartY - touchEndY;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            // Swipe up - show info
            const infoPanel = document.getElementById('fullscreen-info');
            if (infoPanel.classList.contains('hidden')) {
                toggleFullscreenInfo();
            }
        } else {
            // Swipe down - hide info or close
            const infoPanel = document.getElementById('fullscreen-info');
            if (!infoPanel.classList.contains('hidden')) {
                toggleFullscreenInfo();
            } else {
                closeFullscreenViewer();
            }
        }
    }
}

function handleHorizontalSwipe() {
    const swipeThreshold = 100;
    const swipeDistance = touchStartX - touchEndX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            // Swipe left - next photo
            nextFullscreenMedia();
        } else {
            // Swipe right - previous photo
            prevFullscreenMedia();
        }
    }
}

// Optimize calendar for touch devices
function optimizeTouchCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) return;
    
    // Add touch feedback
    calendarGrid.addEventListener('touchstart', function(e) {
        if (e.target.classList.contains('calendar-day')) {
            e.target.style.transform = 'scale(0.95)';
        }
    });
    
    calendarGrid.addEventListener('touchend', function(e) {
        if (e.target.classList.contains('calendar-day')) {
            e.target.style.transform = '';
        }
    });
}

// Optimize forms for mobile
function optimizeMobileForms() {
    // Prevent zoom on input focus (iOS)
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="number"], textarea, select');
    inputs.forEach(input => {
        if (!input.style.fontSize) {
            input.style.fontSize = '16px';
        }
    });
    
    // Auto-scroll to active input
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            setTimeout(() => {
                this.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 300);
        });
    });
}

// Enhanced media loading for mobile
function optimizeMediaLoading() {
    // Lazy loading for media items
    if ('IntersectionObserver' in window) {
        const mediaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        mediaObserver.unobserve(img);
                    }
                }
            });
        });
        
        // Observe all media images
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => mediaObserver.observe(img));
    }
}

// Progressive Web App enhancements
function initializePWAFeatures() {
    // Add to home screen prompt
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button
        showInstallPrompt();
    });
    
    // Handle app installation
    window.addEventListener('appinstalled', (e) => {
        console.log('PWA was installed');
        hideInstallPrompt();
    });
}

function showInstallPrompt() {
    // Create install prompt UI
    const installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.className = 'fixed bottom-0 left-0 right-0 bg-indigo-600 text-white p-4 z-50';
    installBanner.innerHTML = `
        <div class="flex items-center justify-between max-w-md mx-auto">
            <div>
                <div class="font-semibold">Install StriveTrack</div>
                <div class="text-sm opacity-90">Get quick access from your home screen</div>
            </div>
            <div class="flex space-x-2">
                <button onclick="installPWA()" class="bg-white text-indigo-600 px-3 py-1 rounded font-medium">
                    Install
                </button>
                <button onclick="hideInstallPrompt()" class="text-indigo-100">
                    ×
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(installBanner);
}

function hideInstallPrompt() {
    const installBanner = document.getElementById('install-banner');
    if (installBanner) {
        installBanner.remove();
    }
}

window.installPWA = function() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((result) => {
            if (result.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
            hideInstallPrompt();
        });
    }
};

// Optimize performance for mobile
function optimizeMobilePerformance() {
    // Debounce resize events
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Handle resize logic
            adjustLayoutForOrientation();
        }, 250);
    });
    
    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                // Handle scroll logic
                updateScrollPosition();
                scrollTimeout = null;
            }, 16); // ~60fps
        }
    });
}

function adjustLayoutForOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight;
    document.body.classList.toggle('landscape-mode', isLandscape);
    
    // Adjust modals for landscape
    const modals = document.querySelectorAll('.modal-content');
    modals.forEach(modal => {
        if (isLandscape && window.innerHeight < 500) {
            modal.style.maxHeight = '90vh';
        }
    });
}

function updateScrollPosition() {
    // Add scroll-based optimizations here if needed
    const scrolled = window.pageYOffset > 50;
    document.body.classList.toggle('scrolled', scrolled);
}

// Improve touch feedback
function addTouchFeedback() {
    const interactiveElements = document.querySelectorAll('button, .btn-primary, .btn-secondary, .nav-tab, .calendar-day');
    
    interactiveElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        });
        
        element.addEventListener('touchend', function() {
            this.classList.remove('touch-active');
        });
        
        element.addEventListener('touchcancel', function() {
            this.classList.remove('touch-active');
        });
    });
}

// Initialize all mobile optimizations
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileOptimizations();
    initializePWAFeatures();
    optimizeMobilePerformance();
    addTouchFeedback();
    
    // Add CSS for touch feedback
    const style = document.createElement('style');
    style.textContent = `
        .touch-active {
            opacity: 0.7 !important;
            transform: scale(0.98) !important;
        }
        
        .mobile-device .media-actions {
            opacity: 1;
        }
        
        .mobile-device .comparison-remove-btn {
            opacity: 1;
        }
        
        @media (hover: none) {
            .media-item .media-actions {
                opacity: 1 !important;
            }
        }
    `;
    document.head.appendChild(style);
});

console.log('✅ Mobile optimization enhancements loaded successfully');
console.log('✅ Comprehensive habit management system loaded with anti-cheat protection');

