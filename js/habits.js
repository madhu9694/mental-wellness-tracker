// ============================================
// GRIND & GLOW — Habits Page JavaScript
// Features: Add habits, complete them, streaks,
//           delete habits, show insights
// ============================================

// ---- RUN ON PAGE LOAD ----
document.addEventListener('DOMContentLoaded', function () {

  // Render all habits
  renderHabits();

  // Update the insights panel (stats)
  updateInsights();

  // Set up the "Add Habit" form
  setupAddForm();

});

// ---- ADD HABIT FORM ----
function setupAddForm() {
  const form = document.getElementById('addHabitForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const input = document.getElementById('habitInput');
    const name = input.value.trim();

    if (name.length < 1) return; // Don't add empty habits

    // Create a new habit object
    const newHabit = {
      id: Date.now(),            // Unique ID using timestamp
      name: name,
      createdAt: getTodayKey(),
      completedDates: [],        // Array of "YYYY-MM-DD" strings
      streak: 0,
    };

    // Load existing habits, add new one, save back
    const habits = getHabits();
    habits.push(newHabit);
    saveHabits(habits);

    // Clear the input
    input.value = '';

    // Re-render the list
    renderHabits();
    updateInsights();

    showToast('New habit added: ' + name + ' 🌸');
  });
}

// ---- RENDER HABITS ----
function renderHabits() {
  const container = document.getElementById('habitsList');
  if (!container) return;

  const habits = getHabits();
  const todayKey = getTodayKey();

  if (habits.length === 0) {
    // Show an empty state message
    container.innerHTML =
      '<div class="habits-empty">' +
        '<span class="habits-empty-icon">🌱</span>' +
        '<p>No habits yet! Add one above to start your streak.</p>' +
      '</div>';
    return;
  }

  // Build HTML for each habit
  container.innerHTML = habits.map(function (habit) {
    const isDone = habit.completedDates.includes(todayKey);
    return (
      '<div class="habit-item ' + (isDone ? 'completed' : '') + '" id="habit-' + habit.id + '">' +

        // Checkbox button
        '<button class="habit-checkbox" onclick="toggleHabit(' + habit.id + ')" title="Mark complete">' +
          (isDone ? '✓' : '') +
        '</button>' +

        // Habit name
        '<span class="habit-name">' + escapeHtml(habit.name) + '</span>' +

        // Streak badge
        '<span class="habit-streak">🔥 ' + habit.streak + ' day' + (habit.streak === 1 ? '' : 's') + '</span>' +

        // Delete button
        '<button class="habit-delete" onclick="deleteHabit(' + habit.id + ')" title="Delete habit">🗑️</button>' +

      '</div>'
    );
  }).join('');

  // Update progress bar
  const completedCount = habits.filter(h => h.completedDates.includes(todayKey)).length;
  const pct = habits.length === 0 ? 0 : Math.round((completedCount / habits.length) * 100);

  const bar = document.getElementById('habitsProgressBar');
  if (bar) bar.style.width = pct + '%';

  const barPctLabel = document.getElementById('habitsProgressPct');
  if (barPctLabel) barPctLabel.textContent = pct + '%';
}

// ---- TOGGLE HABIT COMPLETION ----
function toggleHabit(habitId) {
  const habits = getHabits();
  const todayKey = getTodayKey();

  // Find the habit by ID
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

  const alreadyDone = habit.completedDates.includes(todayKey);

  if (alreadyDone) {
    // Un-complete: remove today from completed dates
    habit.completedDates = habit.completedDates.filter(d => d !== todayKey);
    // Recalculate streak
    habit.streak = calculateStreak(habit.completedDates);
    showToast('Habit unmarked: ' + habit.name);
  } else {
    // Complete: add today's date
    habit.completedDates.push(todayKey);
    // Recalculate streak
    habit.streak = calculateStreak(habit.completedDates);
    showToast('Done! 🎉 ' + habit.name + ' — ' + habit.streak + ' day streak!');
  }

  saveHabits(habits);
  renderHabits();
  updateInsights();
}

// ---- DELETE HABIT ----
function deleteHabit(habitId) {
  // Confirm before deleting
  if (!confirm('Delete this habit? Your streak will be lost.')) return;

  let habits = getHabits();
  habits = habits.filter(h => h.id !== habitId); // Remove the matching habit
  saveHabits(habits);

  renderHabits();
  updateInsights();
  showToast('Habit deleted.');
}

// ---- CALCULATE STREAK ----
// Count how many consecutive days ending today (or yesterday) the habit was done
function calculateStreak(completedDates) {
  if (completedDates.length === 0) return 0;

  // Sort dates newest first
  const sorted = completedDates.slice().sort().reverse();

  let streak = 0;
  let checkDate = new Date();

  // We allow streak to count if today OR yesterday was done
  // (so streak doesn't break if you haven't done it yet today)
  const todayStr = formatDate(checkDate);
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatDate(yesterdayDate);

  // Start counting from today or yesterday
  if (!sorted.includes(todayStr) && !sorted.includes(yesterdayStr)) return 0;

  // Walk backwards through dates
  if (sorted.includes(todayStr)) {
    checkDate = new Date();
  } else {
    checkDate = yesterdayDate;
  }

  while (true) {
    const key = formatDate(checkDate);
    if (completedDates.includes(key)) {
      streak++;
      // Go back one more day
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break; // Streak is broken
    }
  }

  return streak;
}

// ---- UPDATE INSIGHTS ----
function updateInsights() {
  const habits = getHabits();
  const todayKey = getTodayKey();

  const total = habits.length;
  const done = habits.filter(h => h.completedDates.includes(todayKey)).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

  setText('insightTotal', total);
  setText('insightDone', done);
  setText('insightPct', pct + '%');
  setText('insightBest', bestStreak + '🔥');
}

// ---- STORAGE HELPERS ----

function getHabits() {
  return JSON.parse(localStorage.getItem('gg_habits') || '[]');
}

function saveHabits(habits) {
  localStorage.setItem('gg_habits', JSON.stringify(habits));
}

// ---- GENERAL HELPERS ----

function getTodayKey() {
  return formatDate(new Date());
}

// Format a Date object as "YYYY-MM-DD"
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ---- TOAST ----
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(function () {
    toast.classList.remove('show');
  }, 2500);
}
