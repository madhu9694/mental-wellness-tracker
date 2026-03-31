// ============================================
// GRIND & GLOW — Auth Logic (Signup & Login)
// Uses LocalStorage to simulate user accounts
// ============================================

document.addEventListener('DOMContentLoaded', function () {

  // ---- PASSWORD VISIBILITY TOGGLE ----
  const togglePwBtn = document.getElementById('togglePw');
  const passwordInput = document.getElementById('password');

  if (togglePwBtn && passwordInput) {
    togglePwBtn.addEventListener('click', function () {
      // Switch between "password" and "text"
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePwBtn.textContent = '🙈';
      } else {
        passwordInput.type = 'password';
        togglePwBtn.textContent = '👁';
      }
    });
  }

  // ---- SIGNUP FORM ----
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault(); // Stop the page from refreshing

      // Get field values
      const name     = document.getElementById('name').value.trim();
      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirm  = document.getElementById('confirm').value;

      // Clear old errors
      clearErrors();

      // Validate inputs
      let hasError = false;

      if (name.length < 2) {
        showError('nameError', 'Please enter your name (at least 2 characters).');
        hasError = true;
      }

      if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email address.');
        hasError = true;
      }

      if (password.length < 6) {
        showError('passwordError', 'Password must be at least 6 characters.');
        hasError = true;
      }

      if (password !== confirm) {
        showError('confirmError', 'Passwords do not match.');
        hasError = true;
      }

      if (hasError) return;

      // Save user to LocalStorage
      // In a real app this would be sent to a server!
      const user = {
        name: name,
        email: email,
        password: password, // Note: never store plain passwords in real apps!
        joinedAt: new Date().toISOString()
      };

      localStorage.setItem('gg_user', JSON.stringify(user));
      localStorage.setItem('gg_logged_in', 'true');

      // Redirect to dashboard
      window.location.href = 'dashboard.html';
    });
  }

  // ---- LOGIN FORM ----
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      clearErrors();

      let hasError = false;

      if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email address.');
        hasError = true;
      }

      if (password.length < 1) {
        showError('passwordError', 'Please enter your password.');
        hasError = true;
      }

      if (hasError) return;

      // For this demo: accept any credentials.
      // If no account exists, create a guest session.
      let user = JSON.parse(localStorage.getItem('gg_user') || 'null');

      if (!user) {
        // Create a quick account on the fly
        user = {
          name: email.split('@')[0], // Use part before @ as name
          email: email,
          joinedAt: new Date().toISOString()
        };
        localStorage.setItem('gg_user', JSON.stringify(user));
      }

      localStorage.setItem('gg_logged_in', 'true');
      window.location.href = 'dashboard.html';
    });
  }

});

// ---- HELPER FUNCTIONS ----

// Show an error message below a field
function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = message;
}

// Clear all error messages
function clearErrors() {
  const errors = document.querySelectorAll('.form-error');
  errors.forEach(function (el) { el.textContent = ''; });
}

// Simple email format check
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
