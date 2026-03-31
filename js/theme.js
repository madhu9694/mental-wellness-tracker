// ============================================
// GRIND & GLOW — Theme Toggle (Light / Dark)
// ============================================

// This file runs on every page and handles dark/light mode.

// 1. When the page loads, check if the user previously chose a theme.
//    If yes, apply it. If no, default to light mode.
(function () {
  const saved = localStorage.getItem('gg_theme');
  if (saved === 'dark') {
    document.body.classList.add('dark');
  }
})();

// 2. Once the DOM is ready, set up the toggle button.
document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  // Set correct emoji on page load
  updateToggleIcon(btn);

  // When the button is clicked, flip the theme
  btn.addEventListener('click', function () {
    document.body.classList.toggle('dark');

    // Save preference to localStorage
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('gg_theme', isDark ? 'dark' : 'light');

    // Update button icon
    updateToggleIcon(btn);
  });
});

// Helper: set the emoji based on current mode
function updateToggleIcon(btn) {
  const isDark = document.body.classList.contains('dark');
  btn.textContent = isDark ? '☀️' : '🌙';
  btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
}
