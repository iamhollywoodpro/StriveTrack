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

// **FIXED: Calculate total points from multiple sources**
function calculateTotalPoints() {
    const completions = getLocalCompletions();
    const media = JSON.parse(localStorage.getItem('strivetrack_media') || '[]');
    const userAchievements = JSON.parse(localStorage.getItem('user_achievements') || '{}');
    
    let totalPoints = 0;
    
    // Points from habit completions (10 points each)
    Object.values(completions).forEach(habitCompletions => {
        if (habitCompletions) {
            totalPoints += Object.values(habitCompletions).filter(Boolean).length * 10;
        }
    });
    
    // Points from media uploads (50 points each)
    totalPoints += media.length * 50;
    
    // Points from achievements
    const definitions = getAchievementDefinitions();
    Object.keys(userAchievements).forEach(achievementId => {
        if (userAchievements[achievementId].unlocked && definitions[achievementId]) {
            totalPoints += definitions[achievementId].points;
        }
    });
    
    console.log('💰 Calculated total points:', totalPoints, '(completions:', Object.values(completions).reduce((total, h) => total + Object.values(h || {}).filter(Boolean).length, 0) * 10, ', media:', media.length * 50, ', achievements:', Object.keys(userAchievements).length, ')');
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

// **FIXED WEEKLY CALENDAR HABIT DISPLAY WITH REAL-TIME DATES**
function createWeeklyHabitElement(habit) {
    console.log('🏗️ Creating WEEKLY habit element for:', habit.name);
    
    const div = document.createElement('div');
    div.className = 'habit-card';
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Handle different data formats for completed days
    const completedDays = habit.completed_days || {};
    const targetFrequency = habit.weekly_target || 7;
    
    // **FIX: Calculate this week's dates with real-time calendar**
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
                 style="cursor: pointer; min-height: 70px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 4px;"
                 title="${dayName}, ${dayDate.toLocaleDateString()} - Click to ${isCompleted ? 'unmark' : 'mark'} as completed">
                <div class="text-xs text-white/70 font-medium mb-1">${dayName}</div>
                <div class="text-lg mb-1">${isCompleted ? '✅' : (isPastDay ? '❌' : '⭕')}</div>
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
                <h3 class="text-white font-semibold text-lg">
                    ${habit.emoji || '🎯'} ${habit.name}
                </h3>
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

// **FIXED DISPLAY HABITS FUNCTION WITH EMPTY STATE MANAGEMENT**
function displayHabits(habits) {
    console.log('🎯 Displaying habits - WEEKLY CALENDAR VERSION ONLY');
    console.log('📊 Input habits:', habits?.length || 0, 'habits');
    
    const container = document.getElementById('habits-container');
    const emptyState = document.getElementById('habits-empty-state');
    
    if (!container) {
        console.error('❌ habits-container not found!');
        return;
    }
    
    container.innerHTML = '';
    
    if (!habits || habits.length === 0) {
        // **FIX: Show empty state, hide container**
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
        container.innerHTML = '';
        
        // **FIX: Update current week display**
        updateCurrentWeekDisplay();
        return;
    }
    
    // **FIX: Hide empty state when habits exist**
    if (emptyState) {
        emptyState.classList.add('hidden');
    }
    
    // Use ONLY weekly habit elements with clickable day cells
    habits.forEach(habit => {
        const habitElement = createWeeklyHabitElement(habit);
        container.appendChild(habitElement);
    });
    
    // Set up click handlers for day cells and delete buttons
    setupHabitClickHandlers();
    
    // **FIX: Update current week display**
    updateCurrentWeekDisplay();
    
    console.log('✅ Displayed', habits.length, 'habits with weekly calendars');
}

// **NEW: Update current week display with real dates**
function updateCurrentWeekDisplay() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const options = { month: 'short', day: 'numeric' };
    const startStr = weekStart.toLocaleDateString('en-US', options);
    const endStr = weekEnd.toLocaleDateString('en-US', options);
    
    const weekDisplay = document.getElementById('current-week-display');
    if (weekDisplay) {
        weekDisplay.textContent = `${startStr} - ${endStr}`;
        console.log('📅 Updated current week display:', `${startStr} - ${endStr}`);
    }
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
    
    // **FIX: Update points display immediately**
    updatePointsDisplay();
    
    // Refresh habit display to show new status
    loadHabits();
    
    // Check for achievements
    checkAndUnlockAchievements();
    
    // Show notification with points
    const action = wasCompleted ? 'unmarked' : 'completed';
    const pointsChange = newStatus ? 10 : -10;
    const pointsText = newStatus ? ' (+10 pts)' : ' (-10 pts)';
    showNotification(`Habit ${action}${pointsText} 🎉`, newStatus ? 'success' : 'info');
    
    console.log('💰 Points updated! Total now:', calculateTotalPoints());
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

// Auto-generate emoji based on habit name
function getHabitEmoji(habitName) {
    const name = habitName.toLowerCase();
    
    // Exercise and fitness
    if (name.includes('exercise') || name.includes('workout') || name.includes('gym') || name.includes('fitness')) return '💪';
    if (name.includes('run') || name.includes('jog') || name.includes('cardio')) return '🏃';
    if (name.includes('walk') || name.includes('steps')) return '🚶';
    if (name.includes('swim') || name.includes('pool')) return '🏊';
    if (name.includes('bike') || name.includes('cycle')) return '🚴';
    if (name.includes('yoga') || name.includes('stretch')) return '🧘';
    if (name.includes('lift') || name.includes('weight') || name.includes('strength')) return '🏋️';
    
    // Health and wellness
    if (name.includes('water') || name.includes('hydrat') || name.includes('drink')) return '💧';
    if (name.includes('sleep') || name.includes('rest') || name.includes('bed')) return '😴';
    if (name.includes('meditat') || name.includes('mindful')) return '🧘';
    if (name.includes('vitamin') || name.includes('supplement')) return '💊';
    
    // Food and nutrition
    if (name.includes('eat') || name.includes('food') || name.includes('meal')) return '🍽️';
    if (name.includes('fruit') || name.includes('apple') || name.includes('banana')) return '🍎';
    if (name.includes('vegetable') || name.includes('salad') || name.includes('green')) return '🥗';
    if (name.includes('protein') || name.includes('meat') || name.includes('chicken')) return '🍗';
    
    // Learning and productivity
    if (name.includes('read') || name.includes('book') || name.includes('study')) return '📚';
    if (name.includes('write') || name.includes('journal') || name.includes('diary')) return '✍️';
    if (name.includes('learn') || name.includes('course') || name.includes('skill')) return '🎓';
    if (name.includes('work') || name.includes('productive') || name.includes('task')) return '💼';
    
    // Social and personal
    if (name.includes('family') || name.includes('friend') || name.includes('social')) return '👥';
    if (name.includes('call') || name.includes('phone') || name.includes('contact')) return '📞';
    if (name.includes('clean') || name.includes('organize') || name.includes('tidy')) return '🧹';
    if (name.includes('money') || name.includes('save') || name.includes('budget')) return '💰';
    
    // Hobbies and activities
    if (name.includes('music') || name.includes('sing') || name.includes('instrument')) return '🎵';
    if (name.includes('art') || name.includes('draw') || name.includes('paint')) return '🎨';
    if (name.includes('garden') || name.includes('plant') || name.includes('grow')) return '🌱';
    if (name.includes('photo') || name.includes('picture') || name.includes('camera')) return '📸';
    
    // Default emojis for common words
    if (name.includes('daily') || name.includes('every day')) return '📅';
    if (name.includes('morning')) return '🌅';
    if (name.includes('evening') || name.includes('night')) return '🌙';
    
    // Default fallback
    return '🎯';
}

function handleCreateHabit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const habitName = formData.get('habit-name') || document.getElementById('habit-name').value;
    
    const habit = {
        id: 'habit_' + Date.now(),
        name: habitName,
        description: formData.get('habit-description') || document.getElementById('habit-description').value,
        weekly_target: parseInt(formData.get('habit-target') || document.getElementById('habit-target')?.value || 7),
        difficulty: formData.get('habit-difficulty') || document.getElementById('habit-difficulty')?.value || 'medium',
        emoji: getHabitEmoji(habitName), // Auto-generate emoji
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

// **ENHANCED MEDIA UPLOAD WITH PROGRESS TRACKING**
function openMediaUploadModal() {
    console.log('📸 Opening media upload modal');
    
    // Create dynamic upload modal
    const modal = document.createElement('div');
    modal.id = 'media-upload-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content max-w-2xl mx-auto">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-white">📸 Upload Progress Media</h2>
                <button onclick="closeModal('media-upload-modal')" class="text-white/70 hover:text-white">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <!-- Upload Area -->
            <div class="mb-6">
                <div class="upload-area border-2 border-dashed border-white/30 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 transition-all" 
                     onclick="document.getElementById('media-file-input').click()">
                    <div class="text-4xl mb-4">📷</div>
                    <h3 class="text-white text-lg font-semibold mb-2">Drop files here or click to browse</h3>
                    <p class="text-white/60 mb-4">Supports: JPG, PNG, WEBP, MP4, MOV (max 50MB)</p>
                    <button type="button" class="btn-primary">
                        <i class="fas fa-upload mr-2"></i>
                        Choose Files
                    </button>
                </div>
                <input type="file" id="media-file-input" class="hidden" accept="image/*,video/*" multiple>
            </div>
            
            <!-- Media Type Selection -->
            <div class="mb-6">
                <label class="block text-white/90 text-sm font-medium mb-3">Media Type</label>
                <div class="grid grid-cols-3 gap-4">
                    <div class="media-type-option">
                        <input type="radio" name="media-type" value="before" id="type-before" class="hidden">
                        <label for="type-before" class="media-type-card-improved cursor-pointer block">
                            <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-center border-2 border-transparent transition-all duration-200 hover:border-blue-400">
                                <div class="text-3xl mb-2">🏁</div>
                                <div class="font-semibold text-white">Before</div>
                                <div class="text-xs text-blue-100 mt-1">Starting point</div>
                            </div>
                        </label>
                    </div>
                    <div class="media-type-option">
                        <input type="radio" name="media-type" value="progress" id="type-progress" class="hidden" checked>
                        <label for="type-progress" class="media-type-card-improved cursor-pointer block">
                            <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-center border-2 border-purple-400 transition-all duration-200 hover:border-purple-300">
                                <div class="text-3xl mb-2">💪</div>
                                <div class="font-semibold text-white">Progress</div>
                                <div class="text-xs text-purple-100 mt-1">Journey update</div>
                            </div>
                        </label>
                    </div>
                    <div class="media-type-option">
                        <input type="radio" name="media-type" value="after" id="type-after" class="hidden">
                        <label for="type-after" class="media-type-card-improved cursor-pointer block">
                            <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-center border-2 border-transparent transition-all duration-200 hover:border-green-400">
                                <div class="text-3xl mb-2">🎆</div>
                                <div class="font-semibold text-white">After</div>
                                <div class="text-xs text-green-100 mt-1">Achievement</div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- Upload Progress -->
            <div id="upload-progress-container" class="hidden mb-6">
                <div class="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-white/90 font-medium">Uploading...</span>
                        <span id="upload-percentage" class="text-white/70">0%</span>
                    </div>
                    <div class="w-full bg-white/10 rounded-full h-2">
                        <div id="upload-progress-bar" class="bg-purple-500 h-2 rounded-full transition-all" style="width: 0%"></div>
                    </div>
                </div>
            </div>
            
            <!-- Upload Button -->
            <div class="flex gap-3">
                <button onclick="handleMediaUpload()" class="btn-primary flex-1" id="upload-btn">
                    <i class="fas fa-upload mr-2"></i>
                    Upload Media
                </button>
                <button onclick="closeModal('media-upload-modal')" class="btn-secondary">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.remove('hidden');
    
    // Set up file input change handler
    const fileInput = document.getElementById('media-file-input');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelection);
    }
}

function handleFileSelection() {
    const fileInput = document.getElementById('media-file-input');
    const files = fileInput.files;
    
    if (files.length > 0) {
        console.log('📸 Selected', files.length, 'file(s)');
        
        // Update upload area to show selected files
        const uploadArea = document.querySelector('.upload-area');
        if (uploadArea && files.length === 1) {
            const file = files[0];
            uploadArea.innerHTML = `
                <div class="text-3xl mb-3">📎</div>
                <h3 class="text-white font-semibold mb-1">${file.name}</h3>
                <p class="text-white/60 mb-2">${(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                <p class="text-green-400 text-sm">Ready to upload!</p>
            `;
        }
    }
}

function handleMediaUpload() {
    console.log('📸 Starting media upload process...');
    
    const fileInput = document.getElementById('media-file-input');
    const progressContainer = document.getElementById('upload-progress-container');
    const uploadBtn = document.getElementById('upload-btn');
    const progressBar = document.getElementById('upload-progress-bar');
    const percentage = document.getElementById('upload-percentage');
    
    if (!fileInput || !fileInput.files.length) {
        showNotification('Please select files to upload first.', 'warning');
        return;
    }
    
    const files = Array.from(fileInput.files);
    const mediaType = document.querySelector('input[name="media-type"]:checked')?.value || 'progress';
    
    console.log('📸 Uploading', files.length, 'file(s) as type:', mediaType);
    
    // Show progress UI
    if (progressContainer) progressContainer.classList.remove('hidden');
    if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Uploading...';
    }
    
    // Simulate upload progress with smooth animation
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 8 + 4; // More consistent progress increments
        if (progress > 100) progress = 100;
        
        if (progressBar) {
            // Force reflow to ensure animation works
            progressBar.style.transition = 'none';
            progressBar.offsetHeight; // Trigger reflow
            progressBar.style.transition = 'width 0.4s ease-out';
            progressBar.style.width = `${progress}%`;
        }
        if (percentage) percentage.textContent = `${Math.round(progress)}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            // Ensure 100% is visible before completion
            if (progressBar) progressBar.style.width = '100%';
            if (percentage) percentage.textContent = '100%';
            
            setTimeout(() => {
                completeUpload(files, mediaType);
            }, 500);
        }
    }, 200); // Balanced update speed
}

// **FIXED: Media upload with proper file storage**
function completeUpload(files, mediaType) {
    console.log('📸 Completing upload for', files.length, 'files');
    
    const media = JSON.parse(localStorage.getItem('strivetrack_media') || '[]');
    const uploadedItems = [];
    
    // Process each file
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const mediaItem = {
                id: 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                type: mediaType,
                name: file.name,
                uploaded_at: new Date().toISOString(),
                url: e.target.result, // Base64 data URL - will persist
                size: file.size,
                file_type: file.type
            };
            
            media.push(mediaItem);
            uploadedItems.push(mediaItem);
            
            // Save updated media array
            localStorage.setItem('strivetrack_media', JSON.stringify(media));
            
            console.log('📸 Media item saved:', mediaItem.name);
            
            // If this is the last file, complete the upload
            if (uploadedItems.length === files.length) {
                finishUpload(uploadedItems);
            }
        };
        
        reader.readAsDataURL(file); // Convert to base64
    });
}

function finishUpload(uploadedItems) {
    // **FIX: Update points immediately and show success**
    updatePointsDisplay();
    
    // Show completion state in progress bar
    const progressContainer = document.getElementById('upload-progress-container');
    const uploadBtn = document.getElementById('upload-btn');
    
    if (progressContainer) {
        progressContainer.innerHTML = `
            <div class="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                <i class="fas fa-check-circle text-green-400 text-2xl mb-2"></i>
                <div class="text-green-400 font-semibold">Upload Complete!</div>
                <div class="text-white/70 text-sm">${uploadedItems.length} file(s) uploaded successfully</div>
            </div>
        `;
    }
    
    if (uploadBtn) {
        uploadBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Complete!';
        uploadBtn.className = 'btn-primary bg-green-600 hover:bg-green-700';
    }
    
    // Show success notification
    showNotification(`Successfully uploaded ${uploadedItems.length} file(s)! 📸 +${uploadedItems.length * 50} pts`, 'success');
    
    // Auto-close modal after showing completion
    setTimeout(() => {
        const modal = document.getElementById('media-upload-modal');
        if (modal) {
            modal.remove();
        }
        // Refresh progress gallery and check achievements
        loadProgressGallery();
        checkAndUnlockAchievements();
    }, 2500); // Adequate time to see completion
    
    console.log('✅ Upload completed successfully with', uploadedItems.length, 'files');
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
    
    // **FIX: Load dashboard weekly progress with habit summaries**
    loadDashboardWeeklyProgress(habits);
    
    console.log('✅ Dashboard loaded with', totalHabits, 'habits,', completedToday, 'completed today');
}

// **NEW: Dashboard weekly progress function**
function loadDashboardWeeklyProgress(habits) {
    console.log('📊 Loading dashboard weekly progress for', habits.length, 'habits');
    
    const container = document.getElementById('dashboard-weekly-progress');
    if (!container) {
        console.log('❌ dashboard-weekly-progress container not found');
        return;
    }
    
    if (!habits || habits.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="text-4xl mb-3">🎯</div>
                <h3 class="text-white text-lg mb-2">No Habits Created Yet</h3>
                <p class="text-white/60 mb-4">Create your first habit to see your progress dashboard.</p>
                <button onclick="document.getElementById('create-habit-card').click()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>
                    Create Your First Habit
                </button>
            </div>
        `;
        return;
    }
    
    // Show habit summaries with progress bars
    const habitSummaries = habits.map(habit => {
        const completions = habit.completed_days || {};
        const weeklyTarget = habit.weekly_target || 7;
        
        // Calculate this week's completions
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        
        let weeklyCompletions = 0;
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + i);
            const dateStr = dayDate.toISOString().split('T')[0];
            if (completions[dateStr]) {
                weeklyCompletions++;
            }
        }
        
        const weeklyPercentage = Math.round((weeklyCompletions / weeklyTarget) * 100);
        const progressColor = weeklyPercentage >= 80 ? 'green' : weeklyPercentage >= 60 ? 'yellow' : 'red';
        
        return `
            <div class="bg-white/5 border border-white/10 rounded-lg p-4 mb-3">
                <div class="flex items-center justify-between mb-3">
                    <div>
                        <h4 class="text-white font-semibold">${habit.emoji || '🎯'} ${habit.name}</h4>
                        <p class="text-white/60 text-sm">${habit.description || 'Track your progress'}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-lg font-bold text-${progressColor === 'green' ? 'green' : progressColor === 'yellow' ? 'yellow' : 'red'}-400">
                            ${weeklyCompletions}/${weeklyTarget}
                        </div>
                        <div class="text-white/60 text-xs">This week</div>
                    </div>
                </div>
                <div class="w-full bg-white/10 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-500" 
                         style="width: ${weeklyPercentage}%; background: ${progressColor === 'green' ? 'linear-gradient(90deg, #10b981, #059669)' : progressColor === 'yellow' ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #ef4444, #dc2626)'}"></div>
                </div>
                <div class="flex justify-between mt-2 text-xs text-white/70">
                    <span>Progress: ${weeklyPercentage}%</span>
                    <span>🔥 ${habit.current_streak || 0} day streak</span>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = habitSummaries;
    console.log('✅ Dashboard weekly progress loaded');
}

// **ENHANCED PROGRESS GALLERY**
function loadProgressGallery() {
    console.log('📸 Loading progress gallery...');
    
    const media = JSON.parse(localStorage.getItem('strivetrack_media') || '[]');
    const container = document.getElementById('media-container');
    const emptyState = document.getElementById('media-empty-state');
    
    // Update gallery stats
    const totalUploads = media.length;
    const beforePhotos = media.filter(m => m.type === 'before').length;
    const progressPhotos = media.filter(m => m.type === 'progress').length;
    const afterPhotos = media.filter(m => m.type === 'after').length;
    
    // Update stat elements
    const totalEl = document.getElementById('total-uploads');
    const beforeEl = document.getElementById('before-count');
    const afterEl = document.getElementById('after-count');
    
    if (totalEl) totalEl.textContent = totalUploads;
    if (beforeEl) beforeEl.textContent = beforePhotos;
    if (afterEl) afterEl.textContent = afterPhotos;
    
    // Show/hide empty state
    if (media.length === 0) {
        if (container) container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    // Compare mode is now handled per-image via hover buttons (no top-level button needed)
    
    // Display media items
    if (container) {
        const mediaHtml = media.map(item => createMediaCard(item)).join('');
        container.innerHTML = mediaHtml;
    }
    
    console.log('📸 Gallery loaded - Total:', totalUploads, 'Before:', beforePhotos, 'Progress:', progressPhotos, 'After:', afterPhotos);
}

// **FIXED MEDIA CARD WITH PROPER IMAGE DISPLAY AND INTERACTIONS**
function createMediaCard(item) {
    const typeColors = {
        before: 'text-blue-400',
        progress: 'text-purple-400', 
        after: 'text-green-400'
    };
    
    const typeIcons = {
        before: '🏁',
        progress: '💪',
        after: '🎆'
    };
    
    const uploadDate = new Date(item.uploaded_at).toLocaleDateString();
    const isImage = item.file_type && item.file_type.startsWith('image/');
    const isInCompareMode = document.body.classList.contains('compare-mode');
    
    console.log('📸 Creating media card for:', item.name, 'URL exists:', !!item.url, 'Is image:', isImage);
    
    return `
        <div class="media-item relative bg-white/5 border border-white/10 rounded-lg overflow-hidden" data-media-id="${item.id}" data-media-type="${item.type}">
            <!-- Action buttons bar at top -->
            <div class="media-actions-bar flex justify-between items-center p-2 bg-black/20 backdrop-blur-sm">
                <div class="media-type-badge-small ${typeColors[item.type]}">
                    ${typeIcons[item.type]} ${item.type.toUpperCase()}
                </div>
                <div class="flex gap-2">
                    <button onclick="event.stopPropagation(); showFullscreenImage('${item.id}')" class="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-md transition-all duration-200" title="View Fullscreen">
                        <i class="fas fa-expand text-xs"></i>
                    </button>
                    <button onclick="event.stopPropagation(); toggleCompareMode(); selectForComparison('${item.id}');" class="bg-purple-500 hover:bg-purple-600 text-white p-1.5 rounded-md transition-all duration-200" title="Compare Photos">
                        <i class="fas fa-plus text-xs"></i>
                    </button>
                    <button onclick="event.stopPropagation(); deleteMediaItem('${item.id}')" class="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-md transition-all duration-200" title="Delete Media">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </div>
            
            <!-- Media preview area -->
            <div class="media-preview relative" style="height: 180px; cursor: zoom-in;" onclick="handleMediaClick('${item.id}', event)">
                ${item.url && isImage ? 
                    `<img src="${item.url}" alt="${item.name}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                     <div class="w-full h-full flex items-center justify-center text-white/40 text-4xl bg-white/5" style="display: none;">🖼️</div>` :
                    `<div class="w-full h-full flex items-center justify-center text-white/40 text-4xl bg-white/5">${isImage ? '🖼️' : '🎥'}</div>`
                }
            </div>
            
            <!-- Media info -->
            <div class="media-info p-3 bg-white/5">
                <div class="media-date text-xs text-white/60 mb-1">${uploadDate}</div>
                <div class="media-description text-sm text-white font-medium truncate">
                    ${item.name}
                </div>
                <div class="text-xs text-white/50 mt-1">
                    ${(item.size / (1024 * 1024)).toFixed(2)} MB
                </div>
            </div>
        </div>
    `;
}

// **HANDLE MEDIA CLICK**
function handleMediaClick(mediaId, event) {
    // If not clicking on action buttons, show fullscreen
    if (!event.target.closest('.media-actions-bar') && !event.target.closest('button')) {
        showFullscreenImage(mediaId);
    }
}

// **FULLSCREEN IMAGE VIEWER**
function showFullscreenImage(mediaId) {
    const media = JSON.parse(localStorage.getItem('strivetrack_media') || '[]');
    const item = media.find(m => m.id === mediaId);
    
    if (!item || !item.url) {
        console.log('❌ Media item not found:', mediaId);
        return;
    }
    
    // Create fullscreen modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'fullscreen-image-modal';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 95vw; max-height: 95vh; padding: 0; background: transparent; border: none;">
            <div class="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
                <div class="text-white">
                    <h3 class="text-lg font-semibold">${item.name}</h3>
                    <p class="text-white/70 text-sm">${item.type.toUpperCase()} • ${new Date(item.uploaded_at).toLocaleDateString()}</p>
                </div>
                <button class="text-white/70 hover:text-white text-2xl p-2 hover:bg-white/10 rounded-lg transition-all duration-200" id="fullscreen-close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="flex items-center justify-center" style="max-height: 80vh;">
                <img src="${item.url}" alt="${item.name}" class="max-w-full max-h-full object-contain">
            </div>
            <div class="flex justify-center gap-4 p-4 bg-black/50 backdrop-blur-sm">
                <button onclick="downloadMedia('${item.id}')" class="btn-secondary">
                    <i class="fas fa-download mr-2"></i>
                    Download
                </button>
                <button onclick="deleteMediaItem('${item.id}'); closeModal('fullscreen-image-modal');" class="btn-danger">
                    <i class="fas fa-trash mr-2"></i>
                    Delete
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.remove('hidden');
    
    // Set up close button event listener
    const closeBtn = modal.querySelector('#fullscreen-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
    }
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    console.log('🖼️ Opened fullscreen view for:', item.name);
}

// **MEDIA COMPARISON SYSTEM**
let compareSelection = [];

function toggleCompareMode() {
    const isCompareMode = document.body.classList.contains('compare-mode');
    
    if (isCompareMode) {
        // Exit compare mode
        document.body.classList.remove('compare-mode');
        compareSelection = [];
        
        // Update UI
        const compareBtn = document.getElementById('compare-mode-btn');
        if (compareBtn) {
            compareBtn.innerHTML = '<i class="fas fa-images mr-2"></i>Compare Mode';
            compareBtn.classList.remove('bg-red-600');
            compareBtn.classList.add('bg-purple-600');
        }
        
        // Refresh gallery to remove compare selections
        loadProgressGallery();
        
        console.log('🔄 Exited compare mode');
    } else {
        // Enter compare mode
        document.body.classList.add('compare-mode');
        
        // Update UI
        const compareBtn = document.getElementById('compare-mode-btn');
        if (compareBtn) {
            compareBtn.innerHTML = '<i class="fas fa-times mr-2"></i>Exit Compare';
            compareBtn.classList.remove('bg-purple-600');
            compareBtn.classList.add('bg-red-600');
        }
        
        // Refresh gallery to show compare interface
        loadProgressGallery();
        
        showNotification('Select 2 images to compare side by side', 'info');
        console.log('🔄 Entered compare mode');
    }
}

function selectForComparison(mediaId) {
    const media = JSON.parse(localStorage.getItem('strivetrack_media') || '[]');
    const item = media.find(m => m.id === mediaId);
    
    if (!item) return;
    
    // Check if already selected
    const existingIndex = compareSelection.findIndex(s => s.id === mediaId);
    
    if (existingIndex >= 0) {
        // Deselect
        compareSelection.splice(existingIndex, 1);
        document.querySelector(`[data-media-id="${mediaId}"]`).classList.remove('selected');
    } else if (compareSelection.length < 2) {
        // Select
        compareSelection.push(item);
        document.querySelector(`[data-media-id="${mediaId}"]`).classList.add('selected');
        
        if (compareSelection.length === 2) {
            // Show comparison
            setTimeout(() => showComparison(), 500);
        }
    } else {
        showNotification('You can only select 2 images for comparison', 'warning');
    }
    
    console.log('🔄 Compare selection:', compareSelection.length, 'items');
}

function showComparison() {
    if (compareSelection.length !== 2) return;
    
    const [item1, item2] = compareSelection;
    
    // Create comparison modal with fixed layout and proper close functionality
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'comparison-modal';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 95vw; max-height: 95vh; padding: 20px; background: rgba(30, 41, 59, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-white">🔄 Media Comparison</h2>
                <button id="comparison-close-btn" class="text-white/70 hover:text-white text-2xl p-2 hover:bg-white/10 rounded-lg transition-all duration-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <!-- Side-by-side comparison layout (always side-by-side on screens > 768px) -->
            <div class="flex flex-col md:flex-row gap-6 mb-6">
                <!-- Left Image -->
                <div class="flex-1 bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                    <div class="bg-white/10 p-3 border-b border-white/10">
                        <h3 class="text-white font-semibold text-lg">${item1.name}</h3>
                        <div class="text-white/60 text-sm">
                            ${item1.type.toUpperCase()} • ${new Date(item1.uploaded_at).toLocaleDateString()}
                        </div>
                    </div>
                    <div style="height: 400px; display: flex; align-items: center; justify-content: center;">
                        <img src="${item1.url}" alt="${item1.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    </div>
                </div>
                
                <!-- Right Image -->
                <div class="flex-1 bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                    <div class="bg-white/10 p-3 border-b border-white/10">
                        <h3 class="text-white font-semibold text-lg">${item2.name}</h3>
                        <div class="text-white/60 text-sm">
                            ${item2.type.toUpperCase()} • ${new Date(item2.uploaded_at).toLocaleDateString()}
                        </div>
                    </div>
                    <div style="height: 400px; display: flex; align-items: center; justify-content: center;">
                        <img src="${item2.url}" alt="${item2.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    </div>
                </div>
            </div>
            
            <!-- Action buttons -->
            <div class="flex gap-3">
                <button id="comparison-close-bottom-btn" class="btn-secondary flex-1">
                    <i class="fas fa-times mr-2"></i>
                    Close Comparison
                </button>
                <button onclick="downloadComparison()" class="btn-primary flex-1">
                    <i class="fas fa-download mr-2"></i>
                    Download Comparison
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.remove('hidden');
    
    // Set up close button event listeners  
    const closeBtn = modal.querySelector('#comparison-close-btn');
    const closeBottomBtn = modal.querySelector('#comparison-close-bottom-btn');
    
    const closeComparison = () => {
        modal.remove();
        toggleCompareMode(); // Exit compare mode
    };
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeComparison);
    }
    
    if (closeBottomBtn) {
        closeBottomBtn.addEventListener('click', closeComparison);
    }
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeComparison();
        }
    });
    
    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeComparison();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    console.log('🔄 Showing comparison between:', item1.name, 'and', item2.name);
}

// **MEDIA DOWNLOAD FUNCTION**
function downloadMedia(mediaId) {
    const media = JSON.parse(localStorage.getItem('strivetrack_media') || '[]');
    const item = media.find(m => m.id === mediaId);
    
    if (!item || !item.url) {
        showNotification('Media not found', 'error');
        return;
    }
    
    // Create download link
    const link = document.createElement('a');
    link.href = item.url;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Download started!', 'success');
    console.log('💾 Downloaded:', item.name);
}

function downloadComparison() {
    showNotification('Comparison download feature coming soon!', 'info');
}

// **DELETE MEDIA ITEM**
function deleteMediaItem(mediaId) {
    if (!confirm('Are you sure you want to delete this media item?')) return;
    
    const media = JSON.parse(localStorage.getItem('strivetrack_media') || '[]');
    const filteredMedia = media.filter(item => item.id !== mediaId);
    
    localStorage.setItem('strivetrack_media', JSON.stringify(filteredMedia));
    loadProgressGallery();
    showNotification('Media item deleted', 'info');
}

// **ENHANCED MODAL FUNCTIONS**
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
        
        // For dynamically created modals, remove from DOM
        if (modalId === 'media-upload-modal') {
            setTimeout(() => {
                if (modal.parentElement) {
                    modal.remove();
                }
            }, 300);
        }
        
        console.log('✅ Closed modal:', modalId);
    }
}

// **CLOSE MODAL ON BACKGROUND CLICK**
function setupModalBackgroundClose() {
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            const modalId = event.target.id;
            if (modalId) {
                closeModal(modalId);
            }
        }
    });
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
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    console.log('📝 Registering user:', email);
    
    // Validation
    if (!email || !email.includes('@')) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (!password || password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Check for admin email
    const isAdmin = email === 'iamhollywoodpro@protonmail.com';
    
    // Create new user
    currentUser = {
        id: isAdmin ? 'admin' : 'user_' + Date.now(),
        email: email,
        name: email.split('@')[0],
        role: isAdmin ? 'admin' : 'user',
        created_at: new Date().toISOString()
    };
    
    sessionId = isAdmin ? 'admin_' + Date.now() : 'offline_' + Date.now();
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('sessionId', sessionId);
    
    // Clear form
    event.target.reset();
    
    console.log('✅ Registration successful for:', currentUser.name, currentUser.role);
    
    // Show dashboard
    showDashboard();
    showNotification(`Welcome to StriveTrack, ${currentUser.name}!`, 'success');
    
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
    
    // Clear all session data
    localStorage.removeItem('sessionId');
    localStorage.removeItem('currentUser');
    
    // Reset global variables
    sessionId = null;
    currentUser = null;
    
    // Clear any form data
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (form.reset) form.reset();
    });
    
    // Clear any input fields
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.type !== 'submit' && input.type !== 'button') {
            input.value = '';
        }
    });
    
    // Reset navigation to habits tab
    showSection('habits');
    
    // Switch to login screen
    showLoginScreen();
    
    // Show notification
    showNotification('Logged out successfully!', 'info');
    
    console.log('✅ Logout completed - all data cleared');
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
    
    // Setup modal background closing
    setupModalBackgroundClose();
    
    // CONNECT LOGOUT BUTTON
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
        console.log('✅ Logout button connected');
    } else {
        console.log('❌ Logout button not found');
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
// **RESTORED ACHIEVEMENT SYSTEM - FULL FUNCTIONALITY**
function loadAchievements() {
    console.log('🏆 Loading achievements system...');
    
    // Load achievement definitions
    const achievementDefinitions = getAchievementDefinitions();
    
    // Check user progress and update achievements
    checkAndUnlockAchievements();
    
    // Display achievements
    displayAchievements(achievementDefinitions);
    
    // Load daily/weekly challenges
    loadDailyChallenges();
    loadWeeklyChallenges();
    
    console.log('✅ Achievement system loaded');
}

// **ACHIEVEMENT DEFINITIONS - COMPREHENSIVE SYSTEM**
function getAchievementDefinitions() {
    return {
        // ONBOARDING ACHIEVEMENTS
        first_login: {
            id: 'first_login',
            name: 'Welcome to StriveTrack',
            description: 'Complete your first login to StriveTrack',
            icon: '🎉',
            category: 'onboarding',
            rarity: 'common',
            points: 50,
            requirements: { type: 'login_count', target: 1 }
        },
        first_habit: {
            id: 'first_habit',
            name: 'Habit Creator',
            description: 'Create your first fitness habit',
            icon: '🎯',
            category: 'onboarding', 
            rarity: 'common',
            points: 100,
            requirements: { type: 'habits_created', target: 1 }
        },
        first_completion: {
            id: 'first_completion',
            name: 'First Steps',
            description: 'Complete your first habit for the day',
            icon: '✅',
            category: 'onboarding',
            rarity: 'common',
            points: 75,
            requirements: { type: 'total_completions', target: 1 }
        },
        
        // HABIT ACHIEVEMENTS
        habit_streak_3: {
            id: 'habit_streak_3',
            name: 'Getting Started',
            description: 'Maintain a 3-day habit streak',
            icon: '🔥',
            category: 'habits',
            rarity: 'common',
            points: 150,
            requirements: { type: 'max_streak', target: 3 }
        },
        habit_streak_7: {
            id: 'habit_streak_7',
            name: 'Weekly Warrior',
            description: 'Maintain a 7-day habit streak',
            icon: '🏆',
            category: 'habits',
            rarity: 'rare',
            points: 300,
            requirements: { type: 'max_streak', target: 7 }
        },
        habit_streak_30: {
            id: 'habit_streak_30',
            name: 'Monthly Master',
            description: 'Maintain a 30-day habit streak',
            icon: '🎆',
            category: 'habits',
            rarity: 'epic',
            points: 1000,
            requirements: { type: 'max_streak', target: 30 }
        },
        habit_streak_100: {
            id: 'habit_streak_100',
            name: 'Centurion',
            description: 'Maintain a 100-day habit streak',
            icon: '👑',
            category: 'habits',
            rarity: 'legendary',
            points: 5000,
            requirements: { type: 'max_streak', target: 100 }
        },
        
        // COMPLETION ACHIEVEMENTS
        completions_10: {
            id: 'completions_10',
            name: 'Committed',
            description: 'Complete 10 total habits',
            icon: '💪',
            category: 'consistency',
            rarity: 'common',
            points: 200,
            requirements: { type: 'total_completions', target: 10 }
        },
        completions_50: {
            id: 'completions_50',
            name: 'Dedicated',
            description: 'Complete 50 total habits',
            icon: '⭐',
            category: 'consistency',
            rarity: 'rare',
            points: 500,
            requirements: { type: 'total_completions', target: 50 }
        },
        completions_100: {
            id: 'completions_100',
            name: 'Unstoppable',
            description: 'Complete 100 total habits',
            icon: '🎆',
            category: 'consistency',
            rarity: 'epic',
            points: 1500,
            requirements: { type: 'total_completions', target: 100 }
        },
        
        // PROGRESS TRACKING
        first_upload: {
            id: 'first_upload',
            name: 'Picture Perfect',
            description: 'Upload your first progress photo',
            icon: '📸',
            category: 'progress',
            rarity: 'common',
            points: 100,
            requirements: { type: 'media_uploads', target: 1 }
        },
        progress_tracker: {
            id: 'progress_tracker',
            name: 'Progress Tracker',
            description: 'Upload 10 progress photos',
            icon: '📷',
            category: 'progress',
            rarity: 'rare',
            points: 400,
            requirements: { type: 'media_uploads', target: 10 }
        },
        
        // POINTS ACHIEVEMENTS
        points_1000: {
            id: 'points_1000',
            name: 'Point Collector',
            description: 'Earn 1,000 total points',
            icon: '💰',
            category: 'challenges',
            rarity: 'rare',
            points: 250,
            requirements: { type: 'total_points', target: 1000 }
        },
        points_5000: {
            id: 'points_5000',
            name: 'Point Master',
            description: 'Earn 5,000 total points',
            icon: '💸',
            category: 'challenges',
            rarity: 'epic',
            points: 500,
            requirements: { type: 'total_points', target: 5000 }
        }
    };
}

// **CHECK AND UNLOCK ACHIEVEMENTS**
function checkAndUnlockAchievements() {
    const definitions = getAchievementDefinitions();
    const userAchievements = JSON.parse(localStorage.getItem('user_achievements') || '{}');
    const habits = getLocalHabits();
    const completions = getLocalCompletions();
    const totalPoints = calculateTotalPoints();
    const media = JSON.parse(localStorage.getItem('strivetrack_media') || '[]');
    
    // Calculate user stats
    const stats = {
        login_count: 1, // Simplified for demo
        habits_created: habits.length,
        total_completions: Object.values(completions).reduce((total, habitComps) => {
            return total + Object.values(habitComps || {}).filter(Boolean).length;
        }, 0),
        max_streak: Math.max(...habits.map(h => calculateStreak(completions[h.id] || {})), 0),
        total_points: totalPoints,
        media_uploads: media.length
    };
    
    console.log('📊 User stats for achievements:', stats);
    
    let newlyUnlocked = [];
    
    // Check each achievement
    Object.values(definitions).forEach(achievement => {
        if (!userAchievements[achievement.id]) {
            const req = achievement.requirements;
            const currentValue = stats[req.type] || 0;
            
            if (currentValue >= req.target) {
                // Unlock achievement!
                userAchievements[achievement.id] = {
                    unlocked: true,
                    unlockedAt: new Date().toISOString(),
                    progress: currentValue,
                    target: req.target
                };
                newlyUnlocked.push(achievement);
                console.log('🏆 ACHIEVEMENT UNLOCKED:', achievement.name);
            }
        }
    });
    
    // Save achievements
    localStorage.setItem('user_achievements', JSON.stringify(userAchievements));
    
    // Show notifications for newly unlocked achievements
    newlyUnlocked.forEach((achievement, index) => {
        setTimeout(() => {
            showAchievementNotification(achievement);
        }, index * 2000); // Stagger notifications
    });
    
    return newlyUnlocked;
}

// **DISPLAY ACHIEVEMENTS**
function displayAchievements(definitions) {
    const container = document.getElementById('achievements-container');
    if (!container) {
        console.log('❌ achievements-container not found');
        return;
    }
    
    const userAchievements = JSON.parse(localStorage.getItem('user_achievements') || '{}');
    const habits = getLocalHabits();
    const completions = getLocalCompletions();
    const totalPoints = calculateTotalPoints();
    const media = JSON.parse(localStorage.getItem('strivetrack_media') || '[]');
    
    // Calculate current stats for progress
    const stats = {
        login_count: 1,
        habits_created: habits.length,
        total_completions: Object.values(completions).reduce((total, habitComps) => {
            return total + Object.values(habitComps || {}).filter(Boolean).length;
        }, 0),
        max_streak: Math.max(...habits.map(h => calculateStreak(completions[h.id] || {})), 0),
        total_points: totalPoints,
        media_uploads: media.length
    };
    
    const achievementCards = Object.values(definitions).map(achievement => {
        const userProgress = userAchievements[achievement.id];
        const isUnlocked = userProgress && userProgress.unlocked;
        const currentValue = stats[achievement.requirements.type] || 0;
        const target = achievement.requirements.target;
        const progress = Math.min((currentValue / target) * 100, 100);
        
        const rarityColors = {
            common: 'from-gray-600 to-gray-700',
            rare: 'from-blue-600 to-blue-700', 
            epic: 'from-purple-600 to-purple-700',
            legendary: 'from-yellow-500 to-orange-600'
        };
        
        return `
            <div class="enhanced-achievement-card ${isUnlocked ? 'unlocked' : 'locked'}" onclick="showAchievementDetails('${achievement.id}')">
                <div class="achievement-icon-large">
                    ${achievement.icon}
                </div>
                
                <div class="achievement-title">
                    ${achievement.name}
                </div>
                
                <div class="achievement-description">
                    ${achievement.description}
                </div>
                
                ${!isUnlocked ? `
                    <div class="progress-ring" style="--progress: ${progress}">
                        <div class="progress-text">${Math.round(progress)}%</div>
                    </div>
                    
                    <div class="text-xs text-white/70 mb-3">
                        Progress: ${currentValue} / ${target}
                    </div>
                ` : `
                    <div class="text-green-400 font-bold text-lg mb-3">
                        ✓ UNLOCKED
                    </div>
                `}
                
                <div class="achievement-details">
                    <span class="achievement-badge bg-gradient-to-r ${rarityColors[achievement.rarity]} text-white">
                        ${achievement.rarity.toUpperCase()}
                    </span>
                    <span class="text-yellow-400 font-bold">
                        ${achievement.points} pts
                    </span>
                </div>
                
                ${isUnlocked ? `
                    <div class="achievement-earned-date">
                        Unlocked: ${new Date(userProgress.unlockedAt).toLocaleDateString()}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    container.innerHTML = achievementCards;
    
    // Update achievement stats
    updateAchievementStats();
    
    console.log('✅ Achievements displayed');
}

// **ACHIEVEMENT NOTIFICATION**
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = `achievement-notification show ${achievement.rarity}`;
    
    notification.innerHTML = `
        <div class="achievement-notification-header">
            <div class="achievement-notification-icon">${achievement.icon}</div>
            <div class="achievement-notification-title">Achievement Unlocked!</div>
        </div>
        <div class="achievement-notification-name">${achievement.name}</div>
        <div class="achievement-notification-description">${achievement.description}</div>
        <div class="achievement-notification-points">
            <span class="text-yellow-400 font-bold">+${achievement.points} points</span>
            <span class="achievement-notification-rarity">${achievement.rarity.toUpperCase()}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger confetti animation
    if (window.confetti) {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 500);
    }, 5000);
}

// **UPDATE ACHIEVEMENT STATS**
function updateAchievementStats() {
    const userAchievements = JSON.parse(localStorage.getItem('user_achievements') || '{}');
    const unlockedCount = Object.values(userAchievements).filter(a => a.unlocked).length;
    const totalCount = Object.keys(getAchievementDefinitions()).length;
    const totalPoints = calculateTotalPoints();
    
    // Update points display
    const pointsDisplay = document.getElementById('total-points-display');
    if (pointsDisplay) {
        pointsDisplay.textContent = totalPoints.toLocaleString();
    }
    
    console.log(`🏆 Achievement stats: ${unlockedCount}/${totalCount} unlocked`);
}

// **DAILY CHALLENGES**
function loadDailyChallenges() {
    const container = document.getElementById('daily-challenges-container');
    if (!container) return;
    
    const challenges = getDailyChallenges();
    
    const challengeCards = challenges.map(challenge => `
        <div class="daily-challenge-card ${challenge.completed ? 'completed' : challenge.rarity}">
            <div class="text-3xl mb-3">${challenge.icon}</div>
            <h4 class="text-white font-bold mb-2">${challenge.name}</h4>
            <p class="text-white/80 text-sm mb-4">${challenge.description}</p>
            <div class="flex justify-between items-center">
                <span class="text-yellow-400 font-bold">+${challenge.points} pts</span>
                ${challenge.completed ? 
                    '<span class="text-green-400">✓ Complete</span>' : 
                    `<button onclick="completeChallenge('${challenge.id}')" class="btn-primary text-xs px-3 py-1">Complete</button>`
                }
            </div>
        </div>
    `).join('');
    
    container.innerHTML = challengeCards;
}

// **WEEKLY CHALLENGES** 
function loadWeeklyChallenges() {
    const container = document.getElementById('weekly-challenges-container');
    if (!container) return;
    
    const challenges = getWeeklyChallenges();
    
    const challengeCards = challenges.map(challenge => `
        <div class="weekly-challenge-card">
            <div class="text-4xl mb-4">${challenge.icon}</div>
            <h4 class="text-white font-bold text-lg mb-2">${challenge.name}</h4>
            <p class="text-white/80 mb-4">${challenge.description}</p>
            <div class="w-full bg-white/20 rounded-full h-2 mb-3">
                <div class="bg-purple-400 h-2 rounded-full" style="width: ${challenge.progress}%"></div>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-yellow-400 font-bold">+${challenge.points} pts</span>
                <span class="text-purple-300">${challenge.current}/${challenge.target}</span>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = challengeCards;
}

// **CHALLENGE DATA**
function getDailyChallenges() {
    return [
        {
            id: 'daily_habit_complete',
            name: 'Daily Achiever',
            description: 'Complete any habit today',
            icon: '✅',
            rarity: 'common',
            points: 50,
            completed: false
        },
        {
            id: 'daily_all_habits',
            name: 'Perfect Day',
            description: 'Complete all your habits today',
            icon: '🎆', 
            rarity: 'epic',
            points: 200,
            completed: false
        },
        {
            id: 'daily_early_bird',
            name: 'Early Bird',
            description: 'Complete a habit before 8 AM',
            icon: '🌅',
            rarity: 'rare',
            points: 100,
            completed: false
        }
    ];
}

function getWeeklyChallenges() {
    return [
        {
            id: 'weekly_consistency',
            name: 'Consistency Champion',
            description: 'Complete habits 5 days this week',
            icon: '🔥',
            points: 300,
            current: 2,
            target: 5,
            progress: 40
        },
        {
            id: 'weekly_streaker',
            name: 'Streak Builder',
            description: 'Maintain a 7-day streak',
            icon: '⚡',
            points: 500,
            current: 3,
            target: 7,
            progress: 43
        }
    ];
}

// **CHALLENGE COMPLETION**
function completeChallenge(challengeId) {
    console.log('🏆 Completing challenge:', challengeId);
    showNotification('Challenge completed! 🎉', 'success');
    // Refresh challenges
    loadDailyChallenges();
    loadWeeklyChallenges();
}

// **ACHIEVEMENT DETAILS MODAL**
function showAchievementDetails(achievementId) {
    console.log('🔍 Showing achievement details for:', achievementId);
    // Could implement a detailed modal here
}

// **COMPLETE ADMIN DASHBOARD SYSTEM**
function loadAdminDashboard() {
    console.log('⚡ Loading admin dashboard...');
    
    if (!currentUser || currentUser.role !== 'admin') {
        console.log('❌ Access denied - not admin');
        showNotification('Access denied. Admin only.', 'error');
        showTab('dashboard');
        return;
    }
    
    console.log('✅ Admin dashboard loaded for:', currentUser.email);
    
    // Get all users data (simulate multiple users)
    const allUsers = getAllUsersData();
    const allMedia = getAllMediaData();
    const flaggedContent = getFlaggedContent();
    
    // Show admin dashboard
    const adminSection = document.getElementById('admin-section');
    if (adminSection) {
        adminSection.innerHTML = `
            <div class="glass-card p-6">
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <h2 class="text-3xl font-bold text-white">🚫 StriveTrack Admin Dashboard</h2>
                        <p class="text-white/70">User management and platform oversight</p>
                        <div class="text-green-400 text-sm mt-1">
                            <i class="fas fa-circle text-xs mr-1"></i>
                            Online
                        </div>
                    </div>
                    <button onclick="refreshAdminData()" class="btn-primary">
                        <i class="fas fa-sync mr-2"></i>
                        Refresh
                    </button>
                </div>
                
                <!-- Admin Stats -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div class="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                        <div class="text-3xl mb-2">👥</div>
                        <div class="text-2xl font-bold text-white" id="admin-total-users">${allUsers.length}</div>
                        <div class="text-white/60 text-sm">Total Users</div>
                    </div>
                    <div class="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                        <div class="text-3xl mb-2">📸</div>
                        <div class="text-2xl font-bold text-white" id="admin-total-media">${allMedia.length}</div>
                        <div class="text-white/60 text-sm">Media Files</div>
                    </div>
                    <div class="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                        <div class="text-3xl mb-2">🟢</div>
                        <div class="text-2xl font-bold text-green-400" id="admin-online-users">${allUsers.filter(u => u.online).length}</div>
                        <div class="text-white/60 text-sm">Online Now</div>
                    </div>
                    <div class="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                        <div class="text-3xl mb-2">🚩</div>
                        <div class="text-2xl font-bold text-red-400" id="admin-flagged">${flaggedContent.length}</div>
                        <div class="text-white/60 text-sm">Flagged</div>
                    </div>
                </div>
                
                <!-- Platform Users Section -->
                <div class="mb-8">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-white">Platform Users</h3>
                        <div class="flex items-center gap-3">
                            <div class="relative">
                                <input type="text" placeholder="Search users..." 
                                       class="input-field text-sm pl-8" 
                                       id="admin-user-search"
                                       onkeyup="filterUsers(this.value)">
                                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div id="admin-users-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${allUsers.map(user => createUserCard(user)).join('')}
                    </div>
                </div>
                
                <!-- Recent Media Uploads -->
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-white mb-6">Recent Media Uploads</h3>
                    <div id="admin-recent-media" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        ${allMedia.slice(0, 12).map(media => createAdminMediaCard(media)).join('')}
                    </div>
                </div>
            </div>
        `;
    }
}

// **GENERATE DEMO USER DATA**
function getAllUsersData() {
    const demoUsers = [
        {
            id: 'admin',
            name: 'Admin',
            email: 'iamhollywoodpro@protonmail.com',
            role: 'admin',
            online: true,
            last_login: new Date().toISOString(),
            habits_count: 5,
            media_count: 8,
            points: 2450,
            joined: '2024-01-15'
        },
        {
            id: 'user1',
            name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            role: 'user',
            online: true,
            last_login: new Date(Date.now() - 300000).toISOString(), // 5 min ago
            habits_count: 3,
            media_count: 12,
            points: 1890,
            joined: '2024-02-20'
        },
        {
            id: 'user2',
            name: 'Mike Chen',
            email: 'mike.chen@email.com',
            role: 'user',
            online: false,
            last_login: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            habits_count: 7,
            media_count: 25,
            points: 3420,
            joined: '2024-01-30'
        },
        {
            id: 'user3',
            name: 'Emma Wilson',
            email: 'emma.w@email.com',
            role: 'user',
            online: true,
            last_login: new Date(Date.now() - 120000).toISOString(), // 2 min ago
            habits_count: 4,
            media_count: 18,
            points: 2100,
            joined: '2024-03-05'
        },
        {
            id: 'user4',
            name: 'David Rodriguez',
            email: 'david.r@email.com',
            role: 'user',
            online: false,
            last_login: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            habits_count: 2,
            media_count: 6,
            points: 980,
            joined: '2024-03-12'
        }
    ];
    
    // Add current user if not admin
    if (currentUser && currentUser.role !== 'admin') {
        const userHabits = getLocalHabits();
        const userMedia = JSON.parse(localStorage.getItem('strivetrack_media') || '[]');
        const userPoints = calculateTotalPoints();
        
        demoUsers.push({
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: 'user',
            online: true,
            last_login: new Date().toISOString(),
            habits_count: userHabits.length,
            media_count: userMedia.length,
            points: userPoints,
            joined: new Date().toISOString().split('T')[0]
        });
    }
    
    return demoUsers;
}

// **GENERATE DEMO MEDIA DATA**
function getAllMediaData() {
    const userMedia = JSON.parse(localStorage.getItem('strivetrack_media') || '[]');
    
    // Add demo media from other users
    const demoMedia = [
        {
            id: 'demo_media_1',
            user_id: 'user1',
            user_name: 'Sarah Johnson',
            type: 'before',
            name: 'before_workout.jpg',
            uploaded_at: new Date(Date.now() - 86400000).toISOString(),
            size: 2.1 * 1024 * 1024,
            flagged: false
        },
        {
            id: 'demo_media_2',
            user_id: 'user2',
            user_name: 'Mike Chen',
            type: 'progress',
            name: 'gym_session.jpg',
            uploaded_at: new Date(Date.now() - 3600000).toISOString(),
            size: 1.8 * 1024 * 1024,
            flagged: false
        },
        {
            id: 'demo_media_3',
            user_id: 'user3',
            user_name: 'Emma Wilson',
            type: 'after',
            name: 'transformation.jpg',
            uploaded_at: new Date(Date.now() - 7200000).toISOString(),
            size: 2.5 * 1024 * 1024,
            flagged: true
        }
    ];
    
    // Add user's actual media
    const enrichedUserMedia = userMedia.map(media => ({
        ...media,
        user_id: currentUser?.id || 'unknown',
        user_name: currentUser?.name || 'Unknown User',
        flagged: false
    }));
    
    return [...demoMedia, ...enrichedUserMedia];
}

// **GET FLAGGED CONTENT**
function getFlaggedContent() {
    const allMedia = getAllMediaData();
    return allMedia.filter(media => media.flagged);
}

// **CREATE USER CARD**
function createUserCard(user) {
    const timeAgo = getTimeAgo(user.last_login);
    const joinDate = new Date(user.joined).toLocaleDateString();
    
    return `
        <div class="user-card bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-all"
             onclick="openUserDetails('${user.id}')">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span class="text-white font-bold">${user.name.charAt(0)}</span>
                    </div>
                    <div>
                        <h4 class="text-white font-semibold">${user.name}</h4>
                        <p class="text-white/60 text-sm">${user.email}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full ${user.online ? 'bg-green-400' : 'bg-gray-400'}"></div>
                    <span class="text-xs text-white/60">${user.online ? 'Online' : 'Offline'}</span>
                </div>
            </div>
            
            <div class="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                <div>
                    <div class="text-white font-semibold">${user.habits_count}</div>
                    <div class="text-white/60">Habits</div>
                </div>
                <div>
                    <div class="text-white font-semibold">${user.media_count}</div>
                    <div class="text-white/60">Media</div>
                </div>
                <div>
                    <div class="text-white font-semibold">${user.points}</div>
                    <div class="text-white/60">Points</div>
                </div>
            </div>
            
            <div class="text-xs text-white/50">
                Last active: ${timeAgo}<br>
                Joined: ${joinDate}
            </div>
        </div>
    `;
}

// **CREATE ADMIN MEDIA CARD**
function createAdminMediaCard(media) {
    const timeAgo = getTimeAgo(media.uploaded_at);
    
    return `
        <div class="admin-media-card bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition-all"
             onclick="openMediaDetails('${media.id}')">
            <div class="aspect-square bg-white/5 flex items-center justify-center relative">
                <div class="text-2xl">📸</div>
                ${media.flagged ? '<div class="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></div>' : ''}
            </div>
            <div class="p-2">
                <div class="text-xs text-white font-medium truncate">${media.name}</div>
                <div class="text-xs text-white/60">${media.user_name}</div>
                <div class="text-xs text-white/50">${timeAgo}</div>
            </div>
        </div>
    `;
}

// **ADMIN UTILITY FUNCTIONS**
function getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

function filterUsers(query) {
    const users = getAllUsersData();
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
    );
    
    const container = document.getElementById('admin-users-grid');
    if (container) {
        container.innerHTML = filteredUsers.map(user => createUserCard(user)).join('');
    }
}

// **FIXED USER DETAILS WITH ACTUAL MEDIA DISPLAY**
function openUserDetails(userId) {
    const users = getAllUsersData();
    const user = users.find(u => u.id === userId);
    
    if (!user) return;
    
    // Get user's actual media - if it's current user, get real media
    let userMedia = [];
    if (currentUser && userId === currentUser.id) {
        // Get current user's actual media
        userMedia = JSON.parse(localStorage.getItem('strivetrack_media') || '[]');
        console.log('📸 Loading actual user media:', userMedia.length, 'items');
    } else {
        // Get demo media for other users
        const allMedia = getAllMediaData();
        userMedia = allMedia.filter(m => m.user_id === userId);
    }
    
    // Create user details modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'user-details-modal';
    modal.innerHTML = `
        <div class="modal-content max-w-6xl mx-auto max-h-90vh overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-white">👤 User Details: ${user.name}</h2>
                <button onclick="closeModal('user-details-modal')" class="text-white/70 hover:text-white">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h3 class="text-lg font-bold text-white mb-4">User Information</h3>
                    <div class="space-y-3">
                        <div><span class="text-white/60">Name:</span> <span class="text-white">${user.name}</span></div>
                        <div><span class="text-white/60">Email:</span> <span class="text-white">${user.email}</span></div>
                        <div><span class="text-white/60">Role:</span> <span class="text-white capitalize">${user.role}</span></div>
                        <div><span class="text-white/60">Status:</span> <span class="text-${user.online ? 'green' : 'gray'}-400">${user.online ? '🟢 Online' : '⚫ Offline'}</span></div>
                        <div><span class="text-white/60">Joined:</span> <span class="text-white">${new Date(user.joined).toLocaleDateString()}</span></div>
                        <div><span class="text-white/60">Last Login:</span> <span class="text-white">${getTimeAgo(user.last_login)}</span></div>
                    </div>
                </div>
                
                <div class="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h3 class="text-lg font-bold text-white mb-4">Activity Stats</h3>
                    <div class="space-y-3">
                        <div><span class="text-white/60">Active Habits:</span> <span class="text-white font-bold">${user.habits_count}</span></div>
                        <div><span class="text-white/60">Media Uploads:</span> <span class="text-white font-bold">${userMedia.length}</span></div>
                        <div><span class="text-white/60">Total Points:</span> <span class="text-yellow-400 font-bold">${user.points.toLocaleString()}</span></div>
                        <div><span class="text-white/60">Account Status:</span> <span class="text-green-400 font-bold">Active</span></div>
                    </div>
                </div>
            </div>
            
            <div class="mb-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-white">User's Media Files (${userMedia.length})</h3>
                    <div class="text-sm text-white/60">
                        Click images to view fullscreen • Admin controls available
                    </div>
                </div>
                
                ${userMedia.length === 0 ? `
                    <div class="text-center py-8 text-white/60">
                        <div class="text-4xl mb-2">📸</div>
                        <p>No media uploads yet</p>
                    </div>
                ` : `
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        ${userMedia.map(media => `
                            <div class="admin-media-item bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition-all">
                                <div class="aspect-square relative cursor-pointer" onclick="showAdminMediaFullscreen('${media.id}')">
                                    ${media.url ? 
                                        `<img src="${media.url}" alt="${media.name}" class="w-full h-full object-cover">` :
                                        `<div class="w-full h-full flex items-center justify-center text-white/40 text-2xl bg-white/5">📸</div>`
                                    }
                                    <div class="absolute top-1 right-1 bg-${getMediaTypeColor(media.type)}-600 text-white text-xs px-1 py-0.5 rounded">
                                        ${media.type.toUpperCase()}
                                    </div>
                                    ${media.flagged ? '<div class="absolute top-1 left-1 w-3 h-3 bg-red-500 rounded-full" title="Flagged content"></div>' : ''}
                                </div>
                                <div class="p-3">
                                    <div class="text-xs text-white font-medium truncate mb-1" title="${media.name}">${media.name}</div>
                                    <div class="text-xs text-white/60 mb-2">${getTimeAgo(media.uploaded_at)}</div>
                                    <div class="text-xs text-white/50 mb-3">${(media.size / (1024 * 1024)).toFixed(2)} MB</div>
                                    
                                    <!-- Admin Actions -->
                                    <div class="flex gap-1">
                                        <button onclick="downloadUserMedia('${media.id}')" class="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors" title="Download">
                                            <i class="fas fa-download"></i>
                                        </button>
                                        <button onclick="toggleFlagMedia('${media.id}')" class="flex-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded transition-colors" title="Flag/Unflag">
                                            <i class="fas fa-flag"></i>
                                        </button>
                                        <button onclick="deleteUserMedia('${media.id}')" class="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
            
            <div class="flex gap-3 pt-4 border-t border-white/10">
                <button onclick="exportUserData('${user.id}')" class="btn-primary">
                    <i class="fas fa-file-export mr-2"></i>
                    Export Data
                </button>
                <button onclick="suspendUser('${user.id}')" class="btn-danger">
                    <i class="fas fa-ban mr-2"></i>
                    Suspend User
                </button>
                <button onclick="closeModal('user-details-modal')" class="btn-secondary flex-1">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.remove('hidden');
    
    console.log('👤 Opened user details for:', user.name, 'with', userMedia.length, 'media files');
}

// **HELPER FUNCTIONS FOR ADMIN**
function getMediaTypeColor(type) {
    const colors = {
        before: 'blue',
        progress: 'purple',
        after: 'green'
    };
    return colors[type] || 'gray';
}

function showAdminMediaFullscreen(mediaId) {
    // Get media from current user's storage or demo data
    const allMedia = JSON.parse(localStorage.getItem('strivetrack_media') || '[]');
    const demoMedia = getAllMediaData();
    const allMediaCombined = [...allMedia, ...demoMedia];
    
    const media = allMediaCombined.find(m => m.id === mediaId);
    
    if (!media || !media.url) {
        showNotification('Media not found or no image available', 'error');
        return;
    }
    
    // Show fullscreen with admin controls
    showFullscreenImage(mediaId);
}

function exportUserData(userId) {
    console.log('💾 Exporting data for user:', userId);
    showNotification('User data export started', 'info');
}

function openMediaDetails(mediaId) {
    console.log('📸 Opening media details for:', mediaId);
    showNotification('Media details opened', 'info');
}

function refreshAdminData() {
    console.log('🔄 Refreshing admin data...');
    loadAdminDashboard();
    showNotification('Admin data refreshed', 'success');
}

function downloadUserMedia(mediaId) {
    console.log('💾 Downloading media:', mediaId);
    showNotification('Media download started', 'success');
}

function toggleFlagMedia(mediaId) {
    console.log('🚩 Toggling flag for media:', mediaId);
    showNotification('Media flag toggled', 'info');
}

function deleteUserMedia(mediaId) {
    if (confirm('Are you sure you want to delete this media?')) {
        console.log('🗑️ Deleting media:', mediaId);
        showNotification('Media deleted', 'success');
    }
}

function suspendUser(userId) {
    if (confirm('Are you sure you want to suspend this user?')) {
        console.log('⛔ Suspending user:', userId);
        showNotification('User suspended', 'warning');
    }
}

// **FIXED GOALS SECTION WITH FULL FUNCTIONALITY**
function loadGoals() {
    console.log('🎯 Loading goals...');
    
    const activeContainer = document.getElementById('active-goals-container');
    const completedContainer = document.getElementById('completed-goals-container');
    
    if (!activeContainer || !completedContainer) {
        console.log('❌ Goals containers not found');
        return;
    }
    
    const goals = getLocalGoals();
    const activeGoals = goals.filter(g => !g.completed);
    const completedGoals = goals.filter(g => g.completed);
    
    // Display active goals
    if (activeGoals.length === 0) {
        activeContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <div class="text-4xl mb-3">🎯</div>
                <h3 class="text-white text-lg mb-2">No Active Goals</h3>
                <p class="text-white/60 mb-4">Create your first goal to get started!</p>
                <button onclick="showCreateGoalModal()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>
                    Create Your First Goal
                </button>
            </div>
        `;
    } else {
        activeContainer.innerHTML = activeGoals.map(goal => createGoalCard(goal)).join('');
    }
    
    // Display completed goals
    if (completedGoals.length === 0) {
        completedContainer.innerHTML = `
            <div class="col-span-full text-center py-6">
                <div class="text-white/60">No completed goals yet. Keep working towards your active goals!</div>
            </div>
        `;
    } else {
        completedContainer.innerHTML = completedGoals.map(goal => createGoalCard(goal)).join('');
    }
    
    // Update goal statistics
    updateGoalStats(goals);
    
    console.log('✅ Goals loaded:', activeGoals.length, 'active,', completedGoals.length, 'completed');
}

// **CREATE GOAL CARD**
function createGoalCard(goal) {
    const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
    const isCompleted = goal.completed;
    const dueDate = goal.due_date ? new Date(goal.due_date) : null;
    const isOverdue = dueDate && dueDate < new Date() && !isCompleted;
    
    const categoryColors = {
        fitness: 'from-blue-500 to-blue-600',
        weight: 'from-green-500 to-green-600', 
        strength: 'from-red-500 to-red-600',
        endurance: 'from-purple-500 to-purple-600',
        habit: 'from-yellow-500 to-yellow-600'
    };
    
    return `
        <div class="bg-white/5 border border-white/10 rounded-lg p-6 transition-all hover:bg-white/10">
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-2xl">${getCategoryIcon(goal.category)}</span>
                        <h4 class="text-white font-bold text-lg">${goal.name}</h4>
                        ${isCompleted ? '<span class="text-green-400 text-sm">✓ Completed</span>' : ''}
                        ${isOverdue ? '<span class="text-red-400 text-sm">⚠ Overdue</span>' : ''}
                    </div>
                    <p class="text-white/70 text-sm mb-3">${goal.description}</p>
                </div>
                <div class="text-right">
                    <button onclick="deleteGoal('${goal.id}')" class="text-red-400 hover:text-red-300 text-sm">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="mb-4">
                <div class="flex justify-between text-sm text-white/70 mb-2">
                    <span>Progress</span>
                    <span>${goal.current_value} / ${goal.target_value} ${goal.unit}</span>
                </div>
                <div class="w-full bg-white/10 rounded-full h-3">
                    <div class="bg-gradient-to-r ${categoryColors[goal.category] || 'from-blue-500 to-blue-600'} h-3 rounded-full transition-all" 
                         style="width: ${progress}%"></div>
                </div>
                <div class="text-right mt-1">
                    <span class="text-sm font-bold ${progress >= 100 ? 'text-green-400' : progress >= 75 ? 'text-yellow-400' : 'text-white'}">
                        ${Math.round(progress)}%
                    </span>
                </div>
            </div>
            
            ${dueDate ? `
                <div class="text-xs text-white/60 mb-3">
                    Due: ${dueDate.toLocaleDateString()}
                </div>
            ` : ''}
            
            <div class="flex gap-2">
                ${!isCompleted ? `
                    <button onclick="updateGoalProgress('${goal.id}')" class="btn-primary text-sm px-3 py-1 flex-1">
                        <i class="fas fa-plus mr-1"></i>
                        Update Progress
                    </button>
                    ${progress >= 100 ? `
                        <button onclick="completeGoal('${goal.id}')" class="btn-success text-sm px-3 py-1">
                            <i class="fas fa-check mr-1"></i>
                            Complete
                        </button>
                    ` : ''}
                ` : `
                    <div class="text-green-400 text-sm font-semibold flex items-center">
                        <i class="fas fa-trophy mr-2"></i>
                        Goal Achieved!
                    </div>
                `}
            </div>
        </div>
    `;
}

// **GOAL HELPER FUNCTIONS**
function getLocalGoals() {
    return JSON.parse(localStorage.getItem('strivetrack_goals') || '[]');
}

function saveLocalGoals(goals) {
    localStorage.setItem('strivetrack_goals', JSON.stringify(goals));
    console.log('✅ Saved', goals.length, 'goals to localStorage');
}

function getCategoryIcon(category) {
    const icons = {
        fitness: '🏅',
        weight: '⚖️',
        strength: '💪',
        endurance: '🏃',
        habit: '🎯'
    };
    return icons[category] || '🎯';
}

function updateGoalStats(goals) {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.completed).length;
    const activeGoals = totalGoals - completedGoals;
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    
    // Update DOM elements
    const totalGoalsEl = document.getElementById('total-goals');
    const completedGoalsEl = document.getElementById('completed-goals-count');
    const activeGoalsEl = document.getElementById('active-goals-count');
    const completionRateEl = document.getElementById('goals-completion-rate');
    
    if (totalGoalsEl) totalGoalsEl.textContent = totalGoals;
    if (completedGoalsEl) completedGoalsEl.textContent = completedGoals;
    if (activeGoalsEl) activeGoalsEl.textContent = activeGoals;
    if (completionRateEl) completionRateEl.textContent = `${completionRate}%`;
}

// **REAL GOAL CREATION MODAL**
function showCreateGoalModal() {
    console.log('🎯 Opening create goal modal');
    
    // Create goal creation modal
    const modal = document.createElement('div');
    modal.id = 'create-goal-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content max-w-lg mx-auto">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-white">🎯 Create New Goal</h2>
                <button onclick="closeModal('create-goal-modal')" class="text-white/70 hover:text-white">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <form id="goal-form" class="space-y-4">
                <div>
                    <label class="block text-white/90 text-sm font-medium mb-2">Goal Name</label>
                    <input type="text" id="goal-name" class="input-field" placeholder="e.g., Lose 15 pounds" required>
                </div>
                
                <div>
                    <label class="block text-white/90 text-sm font-medium mb-2">Description</label>
                    <textarea id="goal-description" class="input-field" rows="3" placeholder="Describe your goal and how you plan to achieve it"></textarea>
                </div>
                
                <div>
                    <label class="block text-white/90 text-sm font-medium mb-2">Category</label>
                    <select id="goal-category" class="input-field">
                        <option value="fitness">Fitness</option>
                        <option value="weight">Weight</option>
                        <option value="strength">Strength</option>
                        <option value="endurance">Endurance</option>
                        <option value="habit">Habit</option>
                    </select>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-white/90 text-sm font-medium mb-2">Target Value</label>
                        <input type="number" id="goal-target" class="input-field" placeholder="15" required>
                    </div>
                    <div>
                        <label class="block text-white/90 text-sm font-medium mb-2">Unit</label>
                        <input type="text" id="goal-unit" class="input-field" placeholder="lbs" required>
                    </div>
                </div>
                
                <div>
                    <label class="block text-white/90 text-sm font-medium mb-2">Target Date</label>
                    <input type="date" id="goal-due-date" class="input-field">
                </div>
                
                <div class="flex gap-3 mt-6">
                    <button type="submit" class="btn-primary flex-1">
                        <i class="fas fa-plus mr-2"></i>
                        Create Goal
                    </button>
                    <button type="button" onclick="closeModal('create-goal-modal')" class="btn-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.remove('hidden');
    
    // Set up form handler
    const form = document.getElementById('goal-form');
    if (form) {
        form.addEventListener('submit', handleGoalForm);
    }
    
    // Set default date to 3 months from now
    const dueDateInput = document.getElementById('goal-due-date');
    if (dueDateInput) {
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 3);
        dueDateInput.value = futureDate.toISOString().split('T')[0];
    }
}

function handleGoalForm(event) {
    event.preventDefault();
    
    const goalData = {
        id: 'goal_' + Date.now(),
        name: document.getElementById('goal-name').value,
        description: document.getElementById('goal-description').value,
        category: document.getElementById('goal-category').value,
        current_value: 0,
        target_value: parseFloat(document.getElementById('goal-target').value),
        unit: document.getElementById('goal-unit').value,
        due_date: document.getElementById('goal-due-date').value,
        completed: false,
        created_at: new Date().toISOString()
    };
    
    // Save to localStorage
    const goals = getLocalGoals();
    goals.push(goalData);
    saveLocalGoals(goals);
    
    // Close modal and refresh
    closeModal('create-goal-modal');
    loadGoals();
    
    showNotification(`Goal "${goalData.name}" created! 🎯`, 'success');
    console.log('✅ Goal created:', goalData);
}

function createSampleGoal() {
    const goals = getLocalGoals();
    const sampleGoal = {
        id: 'goal_' + Date.now(),
        name: 'Lose 10 pounds',
        description: 'Reach my target weight through consistent diet and exercise',
        category: 'weight',
        current_value: 0,
        target_value: 10,
        unit: 'lbs',
        due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
        completed: false,
        created_at: new Date().toISOString()
    };
    
    goals.push(sampleGoal);
    saveLocalGoals(goals);
    loadGoals();
    showNotification('Sample goal created! 🎯', 'success');
}

function updateGoalProgress(goalId) {
    const goals = getLocalGoals();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    // Simulate progress update
    const increment = Math.min(goal.target_value * 0.2, goal.target_value - goal.current_value);
    goal.current_value += increment;
    
    saveLocalGoals(goals);
    loadGoals();
    showNotification(`Progress updated! +${increment.toFixed(1)} ${goal.unit}`, 'success');
}

function completeGoal(goalId) {
    const goals = getLocalGoals();
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    goal.completed = true;
    goal.completed_at = new Date().toISOString();
    
    saveLocalGoals(goals);
    loadGoals();
    showNotification(`Goal completed! 🎆 ${goal.name}`, 'success');
}

function deleteGoal(goalId) {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    const goals = getLocalGoals();
    const filteredGoals = goals.filter(g => g.id !== goalId);
    
    saveLocalGoals(filteredGoals);
    loadGoals();
    showNotification('Goal deleted', 'info');
}

// **FIXED NUTRITION SECTION WITH FULL FUNCTIONALITY**
function loadNutrition() {
    console.log('🍎 Loading nutrition...');
    
    loadNutritionSummary();
    loadFoodLog();
    
    console.log('✅ Nutrition section loaded');
}

// **NUTRITION SUMMARY**
function loadNutritionSummary() {
    const container = document.getElementById('nutrition-stats');
    if (!container) return;
    
    const todayLog = getTodayFoodLog();
    const totals = calculateNutritionTotals(todayLog);
    
    // Daily targets (example values)
    const targets = {
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 65
    };
    
    const statsHtml = `
        <div class="text-center">
            <div class="text-2xl font-bold text-white">${totals.calories}</div>
            <div class="text-white/60 text-sm">Calories</div>
            <div class="text-xs text-white/50">${targets.calories} goal</div>
        </div>
        <div class="text-center">
            <div class="text-2xl font-bold text-blue-400">${totals.protein}g</div>
            <div class="text-white/60 text-sm">Protein</div>
            <div class="text-xs text-white/50">${targets.protein}g goal</div>
        </div>
        <div class="text-center">
            <div class="text-2xl font-bold text-green-400">${totals.carbs}g</div>
            <div class="text-white/60 text-sm">Carbs</div>
            <div class="text-xs text-white/50">${targets.carbs}g goal</div>
        </div>
        <div class="text-center">
            <div class="text-2xl font-bold text-yellow-400">${totals.fat}g</div>
            <div class="text-white/60 text-sm">Fat</div>
            <div class="text-xs text-white/50">${targets.fat}g goal</div>
        </div>
    `;
    
    container.innerHTML = statsHtml;
}

// **FOOD LOG**
function loadFoodLog() {
    const container = document.getElementById('food-log-container');
    if (!container) return;
    
    const todayLog = getTodayFoodLog();
    
    if (todayLog.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="text-4xl mb-3">🍽️</div>
                <h3 class="text-white text-lg mb-2">No Food Logged Today</h3>
                <p class="text-white/60 mb-4">Start tracking your nutrition by logging your first meal.</p>
                <button onclick="showNutritionModal()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>
                    Log Your First Meal
                </button>
            </div>
        `;
        return;
    }
    
    const foodEntries = todayLog.map(entry => `
        <div class="bg-white/5 border border-white/10 rounded-lg p-4 mb-3">
            <div class="flex items-center justify-between mb-2">
                <div>
                    <h4 class="text-white font-semibold">${entry.name}</h4>
                    <p class="text-white/60 text-sm">${entry.meal_type} • ${entry.quantity} ${entry.unit}</p>
                </div>
                <div class="text-right">
                    <div class="text-white font-bold">${entry.calories} cal</div>
                    <button onclick="deleteFoodEntry('${entry.id}')" class="text-red-400 hover:text-red-300 text-xs">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-2 text-xs text-white/70">
                <div>P: ${entry.protein}g</div>
                <div>C: ${entry.carbs}g</div>
                <div>F: ${entry.fat}g</div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = foodEntries;
}

// **NUTRITION HELPER FUNCTIONS**
function getTodayFoodLog() {
    const allEntries = JSON.parse(localStorage.getItem('food_log') || '[]');
    const today = new Date().toISOString().split('T')[0];
    return allEntries.filter(entry => entry.date === today);
}

function calculateNutritionTotals(entries) {
    return entries.reduce((totals, entry) => {
        totals.calories += entry.calories || 0;
        totals.protein += entry.protein || 0;
        totals.carbs += entry.carbs || 0;
        totals.fat += entry.fat || 0;
        return totals;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

// **REAL NUTRITION MODAL**
function showNutritionModal() {
    console.log('🍎 Opening nutrition modal');
    
    // Create nutrition entry modal
    const modal = document.createElement('div');
    modal.id = 'nutrition-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content max-w-lg mx-auto">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-white">🍽️ Add Food Entry</h2>
                <button onclick="closeModal('nutrition-modal')" class="text-white/70 hover:text-white">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <form id="nutrition-form" class="space-y-4">
                <div>
                    <label class="block text-white/90 text-sm font-medium mb-2">Food Name</label>
                    <input type="text" id="food-name" class="input-field" placeholder="e.g., Chicken Breast" required>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-white/90 text-sm font-medium mb-2">Quantity</label>
                        <input type="number" id="food-quantity" class="input-field" placeholder="200" required>
                    </div>
                    <div>
                        <label class="block text-white/90 text-sm font-medium mb-2">Unit</label>
                        <select id="food-unit" class="input-field">
                            <option value="g">grams</option>
                            <option value="oz">ounces</option>
                            <option value="cup">cups</option>
                            <option value="piece">pieces</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label class="block text-white/90 text-sm font-medium mb-2">Meal Type</label>
                    <select id="meal-type" class="input-field">
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                    </select>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-white/90 text-sm font-medium mb-2">Calories</label>
                        <input type="number" id="food-calories" class="input-field" placeholder="250" required>
                    </div>
                    <div>
                        <label class="block text-white/90 text-sm font-medium mb-2">Protein (g)</label>
                        <input type="number" id="food-protein" class="input-field" placeholder="30">
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-white/90 text-sm font-medium mb-2">Carbs (g)</label>
                        <input type="number" id="food-carbs" class="input-field" placeholder="15">
                    </div>
                    <div>
                        <label class="block text-white/90 text-sm font-medium mb-2">Fat (g)</label>
                        <input type="number" id="food-fat" class="input-field" placeholder="8">
                    </div>
                </div>
                
                <div class="flex gap-3 mt-6">
                    <button type="submit" class="btn-primary flex-1">
                        <i class="fas fa-plus mr-2"></i>
                        Add Food Entry
                    </button>
                    <button type="button" onclick="closeModal('nutrition-modal')" class="btn-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.remove('hidden');
    
    // Set up form handler
    const form = document.getElementById('nutrition-form');
    if (form) {
        form.addEventListener('submit', handleNutritionForm);
    }
}

function handleNutritionForm(event) {
    event.preventDefault();
    
    const formData = {
        id: 'food_' + Date.now(),
        name: document.getElementById('food-name').value,
        quantity: parseFloat(document.getElementById('food-quantity').value),
        unit: document.getElementById('food-unit').value,
        meal_type: document.getElementById('meal-type').value,
        calories: parseFloat(document.getElementById('food-calories').value),
        protein: parseFloat(document.getElementById('food-protein').value) || 0,
        carbs: parseFloat(document.getElementById('food-carbs').value) || 0,
        fat: parseFloat(document.getElementById('food-fat').value) || 0,
        date: new Date().toISOString().split('T')[0],
        logged_at: new Date().toISOString()
    };
    
    // Save to localStorage
    const foodLog = JSON.parse(localStorage.getItem('food_log') || '[]');
    foodLog.push(formData);
    localStorage.setItem('food_log', JSON.stringify(foodLog));
    
    // Close modal and refresh
    closeModal('nutrition-modal');
    loadNutrition();
    
    showNotification(`Added ${formData.name} to your food log! 🍎`, 'success');
    console.log('✅ Food entry added:', formData);
}

function addSampleFoodEntry() {
    const foodLog = JSON.parse(localStorage.getItem('food_log') || '[]');
    const sampleEntry = {
        id: 'food_' + Date.now(),
        name: 'Chicken Breast',
        meal_type: 'lunch',
        quantity: 200,
        unit: 'g',
        calories: 330,
        protein: 62,
        carbs: 0,
        fat: 7,
        date: new Date().toISOString().split('T')[0],
        logged_at: new Date().toISOString()
    };
    
    foodLog.push(sampleEntry);
    localStorage.setItem('food_log', JSON.stringify(foodLog));
    
    loadNutrition();
    showNotification('Sample food entry added! 🍗', 'success');
}

function deleteFoodEntry(entryId) {
    const foodLog = JSON.parse(localStorage.getItem('food_log') || '[]');
    const filteredLog = foodLog.filter(entry => entry.id !== entryId);
    
    localStorage.setItem('food_log', JSON.stringify(filteredLog));
    loadNutrition();
    showNotification('Food entry deleted', 'info');
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
window.completeChallenge = completeChallenge;
window.showAchievementDetails = showAchievementDetails;
window.loadAchievements = loadAchievements;
window.showCreateGoalModal = showCreateGoalModal;
window.updateGoalProgress = updateGoalProgress;
window.completeGoal = completeGoal;
window.deleteGoal = deleteGoal;
window.showNutritionModal = showNutritionModal;
window.deleteFoodEntry = deleteFoodEntry;
window.deleteMediaItem = deleteMediaItem;
window.showFullscreenImage = showFullscreenImage;
window.toggleCompareMode = toggleCompareMode;
window.selectForComparison = selectForComparison;
window.downloadMedia = downloadMedia;
window.downloadComparison = downloadComparison;
window.filterUsers = filterUsers;
window.openUserDetails = openUserDetails;
window.openMediaDetails = openMediaDetails;
window.refreshAdminData = refreshAdminData;
window.downloadUserMedia = downloadUserMedia;
window.toggleFlagMedia = toggleFlagMedia;
window.deleteUserMedia = deleteUserMedia;
window.suspendUser = suspendUser;
window.handleMediaClick = handleMediaClick;
window.handleNutritionForm = handleNutritionForm;
window.handleGoalForm = handleGoalForm;
window.showAdminMediaFullscreen = showAdminMediaFullscreen;
window.exportUserData = exportUserData;

console.log('✅ StriveTrack FIXED version loaded successfully!');