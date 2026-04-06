// Check authentication
if (!localStorage.getItem('userID')) {
  window.location.href = 'auth.html';
}

const userID = parseInt(localStorage.getItem('userID'));
const API_URL = 'http://127.0.0.1:5000';

let userName = localStorage.getItem('name') || '';

// Show/hide sections
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.remove('active-section');
  });

  // Show selected
  document.getElementById(sectionId).classList.add('active-section');

  // Update active button
  document.querySelectorAll('.sidebar button').forEach(btn => {
    btn.classList.remove('active');
  });

  event.target.classList.add('active');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  // Load user profile
  const nameInput = document.querySelector('#profile input[placeholder="Your Name"]');
  const emailInput = document.querySelector('#profile input[placeholder="Email"]');
  
  if (nameInput) nameInput.value = userName;
  if (emailInput) emailInput.value = localStorage.getItem('email') || '';

  // Load settings
  const pomodoroInput = document.querySelector('#focus input[value="25"]');
  const shortBreakInput = document.querySelector('#focus input[value="5"]');
  const longBreakInput = document.querySelector('#focus input[value="15"]');

  if (pomodoroInput) pomodoroInput.value = localStorage.getItem('pomoDuration') || '25';
  if (shortBreakInput) shortBreakInput.value = localStorage.getItem('shortBreak') || '5';
  if (longBreakInput) longBreakInput.value = localStorage.getItem('longBreak') || '15';
});

// Save profile changes
document.querySelector('#profile .save-btn').addEventListener('click', function() {
  const nameInput = document.querySelector('#profile input[placeholder="Your Name"]');
  const emailInput = document.querySelector('#profile input[placeholder="Email"]');
  
  userName = nameInput.value;
  localStorage.setItem('name', userName);
  localStorage.setItem('email', emailInput.value);
  
  alert('Profile updated successfully!');
});

// Update password
document.querySelector('#security .save-btn').addEventListener('click', function() {
  const passwordInput = document.querySelector('#security input[type="password"]');
  
  if (passwordInput.value.length < 6) {
    alert('Password must be at least 6 characters long');
    return;
  }
  
  alert('Password updated successfully!');
  passwordInput.value = '';
});

// Reset progress
document.querySelector('.danger-btn').addEventListener('click', function() {
  if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
    localStorage.removeItem('userID');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    alert('Progress reset. Redirecting to login...');
    window.location.href = 'auth.html';
  }
});

// Export data
document.querySelector('.secondary-btn').addEventListener('click', function() {
  const userData = {
    name: userName,
    email: localStorage.getItem('email'),
    exportDate: new Date().toISOString()
  };
  
  const dataStr = JSON.stringify(userData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'trackwise-data.json';
  link.click();
});

