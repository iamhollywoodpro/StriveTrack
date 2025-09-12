// Simple Habit System - Clean and Working
// This replaces the overly complex habit system with something that actually works

// Simple habit storage
let habits = JSON.parse(localStorage.getItem('simple_habits') || '[]');

// Simple habit creation
function createSimpleHabit(name, category = 'general') {
    const habit = {
        id: Date.now().toString(),
        name: name,
        category: category,
        created: new Date().toISOString(),
        completions: {}
    };
    
    habits.push(habit);
    saveHabits();
    showSimpleNotification('Habit created: ' + name);
    displaySimpleHabits();
    return habit;
}

// Save habits to localStorage
function saveHabits() {
    localStorage.setItem('simple_habits', JSON.stringify(habits));
}

// Load habits from localStorage
function loadSimpleHabits() {
    habits = JSON.parse(localStorage.getItem('simple_habits') || '[]');
    displaySimpleHabits();
}

// Display habits in the container
function displaySimpleHabits() {
    const container = document.getElementById('habits-container');
    const emptyState = document.getElementById('habits-empty-state');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (habits.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    habits.forEach(habit => {
        const habitCard = createSimpleHabitCard(habit);
        container.appendChild(habitCard);
    });
}

// Create a habit card element
function createSimpleHabitCard(habit) {
    const card = document.createElement('div');
    card.className = 'habit-card';
    
    const today = new Date().toISOString().split('T')[0];
    const isCompleted = habit.completions[today] || false;
    
    card.innerHTML = `
        <div class="flex items-center justify-between">
            <div>
                <h3 class="text-white font-semibold text-lg">${habit.name}</h3>
                <p class="text-white/60 text-sm">Category: ${habit.category}</p>
            </div>
            <div class="flex items-center space-x-3">
                <button 
                    onclick="toggleSimpleHabit('${habit.id}')" 
                    class="px-4 py-2 rounded-lg font-medium transition-colors ${
                        isCompleted 
                            ? 'bg-green-600 text-white' 
                            : 'bg-white/20 text-white hover:bg-white/30'
                    }">
                    ${isCompleted ? '✓ Completed' : 'Mark Complete'}
                </button>
                <button 
                    onclick="deleteSimpleHabit('${habit.id}')" 
                    class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Delete
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Toggle habit completion
function toggleSimpleHabit(habitId) {
    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === habitId);
    
    if (habit) {
        habit.completions[today] = !habit.completions[today];
        saveHabits();
        displaySimpleHabits();
        
        const action = habit.completions[today] ? 'completed' : 'uncompleted';
        showSimpleNotification(`Habit ${action}: ${habit.name}`);
    }
}

// Delete a habit
function deleteSimpleHabit(habitId) {
    if (confirm('Are you sure you want to delete this habit?')) {
        habits = habits.filter(h => h.id !== habitId);
        saveHabits();
        displaySimpleHabits();
        showSimpleNotification('Habit deleted');
    }
}

// Simple notification system
function showSimpleNotification(message) {
    // Remove any existing notifications
    const existing = document.querySelector('.simple-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'simple-notification fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Initialize simple habit system
function initSimpleHabits() {
    console.log('🎯 Initializing Simple Habit System');
    
    // Load existing habits
    loadSimpleHabits();
    
    // Set up form handler
    const form = document.getElementById('create-habit-form');
    if (form) {
        // Remove existing listeners
        form.onsubmit = null;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('habit-name');
            const categoryInput = document.getElementById('habit-category');
            
            if (nameInput && nameInput.value.trim()) {
                const name = nameInput.value.trim();
                const category = categoryInput ? categoryInput.value : 'general';
                
                createSimpleHabit(name, category);
                
                // Close modal and reset form
                const modal = document.getElementById('create-habit-modal');
                if (modal) modal.classList.add('hidden');
                
                form.reset();
            }
        });
    }
    
    console.log('✅ Simple Habit System Ready');
}

// Make functions globally available
window.createSimpleHabit = createSimpleHabit;
window.toggleSimpleHabit = toggleSimpleHabit;
window.deleteSimpleHabit = deleteSimpleHabit;
window.loadSimpleHabits = loadSimpleHabits;
window.initSimpleHabits = initSimpleHabits;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimpleHabits);
} else {
    initSimpleHabits();
}