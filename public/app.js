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
    
    // Load role-based dashboard configuration
    await loadRoleBasedDashboard();
    
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
        loadDashboardHabits(), // Load habits for dashboard display
        loadMedia(),
        loadAchievements(),
        loadDailyChallenges(),
        loadAdminData()
    ]);
    
    updateDashboardStats();
    
    // Initialize habits after dashboard data is loaded
    setTimeout(() => {
        initializeHabits();
    }, 100);
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
            <div class="day-cell habit-day-cell ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}" 
                 data-habit-id="${habit.id}" 
                 data-date="${dateStr}">
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
            loadHabits(); // Refresh the habits view
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

// Legacy createHabit and deleteHabit functions moved to comprehensive habit system

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

// Test function for the new simple habit system
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

// ===============================
// HABIT MANAGEMENT FUNCTIONALITY
// ===============================

// Habit Management System
let habits = [];
let currentWeekOffset = 0;

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

    // Simple and reliable habit toggle system
    document.addEventListener('click', function(event) {
        // Handle habit day toggle
        if (event.target.closest('.habit-day-cell')) {
            const cell = event.target.closest('.habit-day-cell');
            const habitId = cell.dataset.habitId;
            const date = cell.dataset.date;
            
            if (habitId && date) {
                console.log('🎯 Simple habit toggle:', habitId, date);
                simpleToggleHabit(habitId, date);
                return;
            }
        }
        
        // Handle complete habit button
        if (event.target.closest('.complete-habit-btn')) {
            const btn = event.target.closest('.complete-habit-btn');
            const habitId = btn.dataset.habitId;
            
            if (habitId) {
                console.log('✅ Simple habit complete:', habitId);
                simpleCompleteHabit(habitId);
                return;
            }
        }
        
        // Handle delete habit button  
        if (event.target.closest('.delete-habit-btn')) {
            const btn = event.target.closest('.delete-habit-btn');
            const habitId = btn.dataset.habitId;
            
            if (habitId) {
                console.log('🗑️ Simple habit delete:', habitId);
                deleteHabit(habitId);
                return;
            }
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
async function deleteHabit(habitId) {
    if (!confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/habits/${habitId}`, {
            method: 'DELETE',
            headers: {
                'x-session-id': sessionId
            }
        });

        if (response.ok) {
            showNotification('Habit deleted successfully!', 'success');
            // Refresh both dashboard and habits sections
            await loadHabits();
            await loadDashboardHabits();
            updateDashboardStats();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to delete habit', 'error');
        }
    } catch (error) {
        console.error('Delete habit error:', error);
        showNotification('Failed to delete habit', 'error');
    }
}

// Load habits for dashboard display
async function loadDashboardHabits() {
    try {
        const response = await fetch('/api/habits', {
            headers: { 'x-session-id': sessionId }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayDashboardHabits(data.habits);
        } else {
            console.error('Failed to load dashboard habits');
        }
    } catch (error) {
        console.error('Load dashboard habits error:', error);
    }
}

// Display habits in dashboard
function displayDashboardHabits(habits) {
    const container = document.getElementById('dashboard-habits-container');
    if (!container) return;
    
    if (!habits || habits.length === 0) {
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
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${recentHabits.map(habit => createDashboardHabitCard(habit)).join('')}
        </div>
        ${habits.length > 3 ? `
            <div class="text-center mt-4">
                <button onclick="showSection('habits')" class="btn-secondary">
                    View All ${habits.length} Habits
                </button>
            </div>
        ` : ''}
    `;
}

// Create compact habit card for dashboard
function createDashboardHabitCard(habit) {
    const emoji = getHabitEmoji(habit.name, habit.category);
    const completionsThisWeek = habit.completions ? habit.completions.filter(date => {
        const completionDate = new Date(date);
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return completionDate >= weekStart;
    }).length : 0;
    
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
            checkAchievements();
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

// Display habits in the UI
function displayHabits(habits) {
    const container = document.getElementById('habits-container');
    if (!container) return;
    
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
                    
                    return `
                        <div class="day-cell habit-day-cell ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}"
                             data-habit-id="${habit.id}" 
                             data-date="${date.toISOString().split('T')[0]}">
                            <div class="text-xs font-medium">${date.toLocaleDateString('en', {weekday: 'short'})}</div>
                            <div class="text-lg font-bold">${date.getDate()}</div>
                            ${isCompleted ? '<i class="fas fa-check text-xs mt-1"></i>' : ''}
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

// Simple and reliable habit toggle function
async function simpleToggleHabit(habitId, date) {
    console.log('🚀 Starting simple habit toggle:', habitId, date);
    
    if (!sessionId) {
        console.error('❌ No session ID');
        showNotification('Please log in first', 'error');
        return;
    }
    
    if (!habitId || !date) {
        console.error('❌ Missing habit ID or date');
        showNotification('Invalid habit data', 'error');
        return;
    }
    
    try {
        console.log('📡 Making API request...');
        
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
        
        console.log('📊 API Response Status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('❌ API Error:', errorData);
            showNotification('Failed to toggle habit: ' + errorData, 'error');
            return;
        }
        
        const result = await response.json();
        console.log('✅ API Success:', result);
        
        // Show success message
        if (result.completed) {
            showNotification('✅ Habit completed for ' + date + '!', 'success');
        } else {
            showNotification('Habit unchecked for ' + date, 'info');
        }
        
        // Reload habits
        await loadHabits();
        
    } catch (error) {
        console.error('💥 Network Error:', error);
        showNotification('Network error: ' + error.message, 'error');
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
            
            // Reload habits and dashboard
            await loadHabits();
            await loadDashboardHabits();
            updateDashboardStats();
            
            // Check for achievements
            checkAchievements();
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

// Update habits statistics in dashboard
function updateHabitsStats(habits) {
    const activeHabitsEl = document.getElementById('active-habits');
    if (activeHabitsEl) {
        activeHabitsEl.textContent = habits.length;
    }

    // Calculate today's progress
    const today = new Date().toISOString().split('T')[0];
    let todayCompleted = 0;
    let todayTotal = 0;

    habits.forEach(habit => {
        const completions = habit.completions || [];
        todayTotal++;
        if (completions.includes(today)) {
            todayCompleted++;
        }
    });

    const todayProgressEl = document.getElementById('today-progress');
    if (todayProgressEl) {
        todayProgressEl.textContent = `${todayCompleted}/${todayTotal}`;
    }

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

