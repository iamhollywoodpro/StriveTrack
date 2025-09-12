// FORCE HABIT SYSTEM - Inject directly via JavaScript
// This creates habits without relying on HTML changes

console.log('🚀 FORCE HABITS: Loading direct JavaScript habit system...');

// Wait for page to load
function initForceHabits() {
    console.log('🚀 FORCE HABITS: Initializing...');
    
    // Create habits storage
    let forceHabits = JSON.parse(localStorage.getItem('force_habits') || '[]');
    
    // Function to create the habits section if it doesn't exist
    function createHabitsSection() {
        let habitsSection = document.getElementById('habits-section');
        
        if (!habitsSection) {
            // Create the entire habits section from scratch
            const mainContent = document.querySelector('.max-w-7xl');
            if (mainContent) {
                habitsSection = document.createElement('div');
                habitsSection.id = 'habits-section';
                habitsSection.className = 'section';
                habitsSection.innerHTML = `
                    <div class="glass-card p-6">
                        <div class="flex items-center justify-between mb-6">
                            <div>
                                <h2 class="text-2xl font-bold text-white">🎯 Force Habits</h2>
                                <p class="text-white/70">Direct JavaScript habit system (bypasses deployment issues)</p>
                            </div>
                            <button class="btn-primary" onclick="addForceHabit()">
                                <i class="fas fa-plus mr-2"></i>
                                Add Habit
                            </button>
                        </div>
                        <div id="force-habits-container">
                            <!-- Habits will be added here -->
                        </div>
                    </div>
                `;
                
                // Insert after dashboard
                const dashboard = document.getElementById('dashboard-section');
                if (dashboard && dashboard.nextSibling) {
                    mainContent.insertBefore(habitsSection, dashboard.nextSibling);
                } else {
                    mainContent.appendChild(habitsSection);
                }
            }
        }
        
        // Make sure it's visible
        if (habitsSection) {
            habitsSection.classList.remove('hidden');
            habitsSection.style.display = 'block';
        }
        
        return habitsSection;
    }
    
    // Function to display habits
    function displayForceHabits() {
        console.log('🚀 FORCE HABITS: Displaying habits, count:', forceHabits.length);
        
        const container = document.getElementById('force-habits-container');
        if (!container) {
            console.error('🚀 FORCE HABITS: Container not found');
            return;
        }
        
        container.innerHTML = '';
        
        if (forceHabits.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-4xl mb-4">🎯</div>
                    <p class="text-white/60">No habits yet. Click "Add Habit" to create one!</p>
                </div>
            `;
            return;
        }
        
        forceHabits.forEach(habit => {
            const habitCard = document.createElement('div');
            habitCard.style.cssText = `
                background: rgba(255,255,255,0.1);
                border: 2px solid #10b981;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 16px;
                display: block;
                visibility: visible;
            `;
            
            habitCard.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h3 style="color: white; font-size: 1.125rem; font-weight: 600; margin: 0 0 8px 0;">
                            ✅ ${habit.name}
                        </h3>
                        <p style="color: rgba(255,255,255,0.6); font-size: 0.875rem; margin: 0;">
                            Created: ${new Date(habit.created).toLocaleDateString()}
                        </p>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button onclick="toggleForceHabit('${habit.id}')" 
                                style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                            ${habit.completed ? '✓ Done' : 'Complete'}
                        </button>
                        <button onclick="deleteForceHabit('${habit.id}')" 
                                style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                            Delete
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(habitCard);
        });
        
        console.log('🚀 FORCE HABITS: Displayed', forceHabits.length, 'habits');
    }
    
    // Function to add a habit
    window.addForceHabit = function() {
        const name = prompt('Enter habit name:');
        if (name && name.trim()) {
            const habit = {
                id: Date.now().toString(),
                name: name.trim(),
                created: new Date().toISOString(),
                completed: false
            };
            
            forceHabits.push(habit);
            localStorage.setItem('force_habits', JSON.stringify(forceHabits));
            displayForceHabits();
            
            alert('Habit created: ' + habit.name);
        }
    };
    
    // Function to toggle habit
    window.toggleForceHabit = function(id) {
        const habit = forceHabits.find(h => h.id === id);
        if (habit) {
            habit.completed = !habit.completed;
            localStorage.setItem('force_habits', JSON.stringify(forceHabits));
            displayForceHabits();
        }
    };
    
    // Function to delete habit
    window.deleteForceHabit = function(id) {
        if (confirm('Delete this habit?')) {
            forceHabits = forceHabits.filter(h => h.id !== id);
            localStorage.setItem('force_habits', JSON.stringify(forceHabits));
            displayForceHabits();
        }
    };
    
    // Initialize
    createHabitsSection();
    displayForceHabits();
    
    console.log('🚀 FORCE HABITS: System ready!');
}

// Run when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForceHabits);
} else {
    initForceHabits();
}

// Also run after a delay to ensure everything is loaded
setTimeout(initForceHabits, 2000);