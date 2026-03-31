// ============================================
// GRIND & GLOW — Dashboard JavaScript
// Handles: mood tracking, stats, quotes, greetings
// ============================================

// ---- MOTIVATIONAL QUOTES ----
const quotes = [
  "Small steps every day lead to big changes. 🌸",
  "You are doing better than you think. 💕",
  "Progress, not perfection. Keep glowing! ✨",
  "Every day is a fresh start. 🌷",
  "Be gentle with yourself today. 🌿",
  "Your mental health matters. Take care of you. 💗",
  "Consistency is the secret to glow-ups. 🔥",
  "You showed up today — that already counts. 🌟",
  "Breathe in peace, breathe out stress. 🕊️",
  "Tiny habits, big transformations. 💪",
];

// Emoji map: mood key → display info
const MOOD_MAP = {
  happy:   { emoji: '😊', label: 'Happy' },
  neutral: { emoji: '😐', label: 'Neutral' },
  sad:     { emoji: '😢', label: 'Sad' },
  angry:   { emoji: '😡', label: 'Stressed' },
  tired:   { emoji: '😴', label: 'Tired' },
};

// ---- RUN ON PAGE LOAD ----
document.addEventListener('DOMContentLoaded', function () {

  // Show greeting based on time of day
  showGreeting();

  // Show today's date
  showDate();

  // Show a random motivational quote
  showQuote();

  // Load and show today's mood (if already logged)
  loadTodayMood();

  // Set up mood button click events
  setupMoodButtons();

  // Load habit stats for the stats row
  loadStats();

  // Load quick habit list (today's habits preview)
  loadQuickHabits();

  // Load mood history
  loadMoodHistory();

});

// ---- GREETING ----
function showGreeting() {
  const hour = new Date().getHours();
  let timeWord = 'Morning';
  if (hour >= 12 && hour < 17) timeWord = 'Afternoon';
  else if (hour >= 17)          timeWord = 'Evening';

  const el = document.getElementById('timeOfDay');
  if (el) el.textContent = timeWord;

  // Show user's name if available
  const userEl = document.getElementById('userName');
  if (userEl) {
    const user = JSON.parse(localStorage.getItem('gg_user') || '{}');
    userEl.textContent = user.name || 'Friend';
  }
}

// ---- TODAY'S DATE ----
function showDate() {
  const el = document.getElementById('todayDate');
  if (!el) return;
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  el.textContent = now.toLocaleDateString('en-US', options);
}

// ---- RANDOM QUOTE ----
function showQuote() {
  const el = document.getElementById('dailyQuote');
  if (!el) return;
  // Pick a quote based on day of year so it changes daily
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  el.textContent = quotes[dayOfYear % quotes.length];
}

// ---- MOOD BUTTONS ----
function setupMoodButtons() {
  const buttons = document.querySelectorAll('.mood-btn');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const mood = btn.getAttribute('data-mood');
      saveMood(mood);

      // Update button styles: remove 'selected' from all, add to clicked
      buttons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      // Update the displayed text
      updateMoodDisplay(mood);

      showToast('Mood logged: ' + MOOD_MAP[mood].label + ' ' + MOOD_MAP[mood].emoji);
    });
  });
}

// Save mood to LocalStorage with today's date as key
function saveMood(moodKey) {
  const todayKey = getTodayKey();

  // Get existing mood logs (an object with date → mood)
  const logs = JSON.parse(localStorage.getItem('gg_mood_logs') || '{}');
  logs[todayKey] = moodKey;
  localStorage.setItem('gg_mood_logs', JSON.stringify(logs));
}

// Show currently selected mood text
function updateMoodDisplay(moodKey) {
  const el = document.getElementById('moodSelected');
  if (!el) return;
  const info = MOOD_MAP[moodKey];
  el.textContent = 'Today\'s mood: ' + info.emoji + ' ' + info.label;
  el.style.borderColor = 'var(--accent)';
  el.style.background = 'var(--accent-light)';
}

// Load today's mood on page open
function loadTodayMood() {
  const todayKey = getTodayKey();
  const logs = JSON.parse(localStorage.getItem('gg_mood_logs') || '{}');
  const todayMood = logs[todayKey];

  if (todayMood) {
    // Mark the right button as selected
    const btn = document.querySelector('.mood-btn[data-mood="' + todayMood + '"]');
    if (btn) btn.classList.add('selected');
    updateMoodDisplay(todayMood);
  }
}

// ---- STATS ----
function loadStats() {
  const habits = JSON.parse(localStorage.getItem('gg_habits') || '[]');
  const todayKey = getTodayKey();

  const totalHabits = habits.length;

  // Count how many are completed today
  const completedToday = habits.filter(function (h) {
    return h.completedDates && h.completedDates.includes(todayKey);
  }).length;

  // Completion percentage
  const pct = totalHabits === 0 ? 0 : Math.round((completedToday / totalHabits) * 100);

  // Best streak across all habits
  const bestStreak = habits.reduce(function (max, h) {
    return Math.max(max, h.streak || 0);
  }, 0);

  // Update DOM elements
  setText('totalHabits', totalHabits);
  setText('completedToday', completedToday);
  setText('completionPct', pct + '%');
  setText('bestStreak', bestStreak + '🔥');

  // Update progress bar
  const bar = document.getElementById('progressBar');
  if (bar) bar.style.width = pct + '%';

  const barLabel = document.getElementById('progressBarLabel');
  if (barLabel) barLabel.textContent = pct + '% complete';
}

// ---- QUICK HABITS ----
function loadQuickHabits() {
  const container = document.getElementById('quickHabitsList');
  if (!container) return;

  const habits = JSON.parse(localStorage.getItem('gg_habits') || '[]');
  const todayKey = getTodayKey();

  if (habits.length === 0) {
    container.innerHTML = '<p class="empty-state">No habits yet! <a href="habits.html">Add some →</a></p>';
    return;
  }

  // Show up to 5 habits as a preview
  const preview = habits.slice(0, 5);

  container.innerHTML = preview.map(function (habit) {
    const isDone = habit.completedDates && habit.completedDates.includes(todayKey);
    return (
      '<div class="quick-habit-item ' + (isDone ? 'done' : '') + '">' +
        '<div class="quick-habit-check">' + (isDone ? '✓' : '') + '</div>' +
        '<span class="quick-habit-name">' + escapeHtml(habit.name) + '</span>' +
        '<span class="quick-habit-streak">🔥 ' + (habit.streak || 0) + '</span>' +
      '</div>'
    );
  }).join('');

  if (habits.length > 5) {
    container.innerHTML += '<p style="text-align:center;margin-top:0.75rem;font-size:0.85rem;color:var(--text-muted)"><a href="habits.html">View all ' + habits.length + ' habits →</a></p>';
  }
}

// ---- MOOD HISTORY ----
function loadMoodHistory() {
  const container = document.getElementById('moodHistoryGrid');
  if (!container) return;

  const logs = JSON.parse(localStorage.getItem('gg_mood_logs') || '{}');
  const keys = Object.keys(logs).sort().reverse().slice(0, 14); // Last 14 days

  if (keys.length === 0) {
    container.innerHTML = '<p class="empty-state">No mood history yet. Start logging! 😊</p>';
    return;
  }

  container.innerHTML = keys.map(function (dateKey) {
    const mood = logs[dateKey];
    const info = MOOD_MAP[mood] || { emoji: '❓', label: 'Unknown' };
    // Format date nicely: "Mar 12"
    const [y, m, d] = dateKey.split('-');
    const dateObj = new Date(y, m - 1, d);
    const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
      '<div class="mood-history-item">' +
        '<span class="emoji">' + info.emoji + '</span>' +
        '<span>' + label + '</span>' +
      '</div>'
    );
  }).join('');
}

// ---- HELPERS ----

// Returns today's date as "YYYY-MM-DD"
function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

// Safely set text content of an element by ID
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// Prevent XSS when inserting user-provided text into HTML
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ---- TOAST NOTIFICATION ----
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');

  // Hide after 2.5 seconds
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(function () {
    toast.classList.remove('show');
  }, 2500);
}
