// Check authentication
if (!localStorage.getItem('userID')) {
  window.location.href = 'auth.html';
}

const userID = parseInt(localStorage.getItem('userID'));
const API_URL = 'http://127.0.0.1:5000';

// Load analytics data
async function loadAnalytics() {
  try {
    // Load summary data
    const summaryRes = await fetch(`${API_URL}/analytics/summary/${userID}`);
    const summary = await summaryRes.json();
    
    // Calculate productivity score
    const tasksCompleted = summary.tasksCompleted || 0;
    const pendingTasks = summary.pendingTasks || 0;
    const totalTasks = tasksCompleted + pendingTasks;
    let productivityScore = 0;
    
    if (totalTasks > 0) {
      productivityScore = Math.round((tasksCompleted / totalTasks) * 100);
    }
    
    // Determine score label
    let scoreLabel = "No data yet";
    if (productivityScore >= 80) scoreLabel = "Excellent Performance";
    else if (productivityScore >= 60) scoreLabel = "Above Average Performance";
    else if (productivityScore >= 40) scoreLabel = "Average Performance";
    else if (productivityScore > 0) scoreLabel = "Needs Improvement";
    
    // Update productivity score
    document.getElementById('productivityScore').textContent = productivityScore + ' / 100';
    document.getElementById('scoreLabel').textContent = scoreLabel;
    
    // Update summary cards
    document.getElementById('overviewCards').innerHTML = `
      <div class="card">
        <h3>Completed Tasks</h3>
        <p>${tasksCompleted}</p>
      </div>

      <div class="card">
        <h3>Pending Tasks</h3>
        <p>${pendingTasks}</p>
      </div>

      <div class="card">
        <h3>Goals Achieved</h3>
        <p>${summary.goalsCompleted || 0}</p>
      </div>

      <div class="card">
        <h3>Total Focus Time</h3>
        <p>${Math.floor(summary.totalFocusTime / 60) || 0} hours</p>
      </div>
    `;

    // Load daily analytics
    const dailyRes = await fetch(`${API_URL}/analytics/daily/${userID}`);
    const daily = await dailyRes.json();
    createDailyChart(daily);

    // Load weekly analytics
    const weeklyRes = await fetch(`${API_URL}/analytics/weekly/${userID}`);
    const weekly = await weeklyRes.json();
    createWeeklyChart(weekly);

  } catch (err) {
    console.error('Failed to load analytics:', err);
  }
}

// Create daily chart
function createDailyChart(data) {
  const ctx = document.getElementById("dailyChart");
  if (!ctx) return;

  const labels = data.map(d => d.date || "");
  const tasks = data.map(d => d.tasks_completed || 0);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Tasks Completed',
        data: tasks,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Create weekly chart
function createWeeklyChart(data) {
  const ctx = document.getElementById("weeklyChart");
  if (!ctx) return;

  const labels = data.map(d => `Week ${d.week || ""}`);
  const focusTime = data.map(d => Math.floor((d.total_focus_time || 0) / 60));

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Focus Time (hours)',
        data: focusTime,
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Create task status pie chart
async function createTaskStatusChart() {
  const ctx = document.getElementById("taskStatusChart");
  if (!ctx) return;

  try {
    const summaryRes = await fetch(`${API_URL}/analytics/summary/${userID}`);
    const summary = await summaryRes.json();
    
    const completed = summary.tasksCompleted || 0;
    const pending = summary.pendingTasks || 0;
    const total = completed + pending;
    const overdue = Math.floor(pending * 0.2); // Estimate 20% as overdue
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Pending', 'Overdue'],
        datasets: [{
          data: [completed, pending, overdue],
          backgroundColor: ['#10B981', '#3B82F6', '#EF4444'],
          borderColor: ['#059669', '#1E40AF', '#DC2626'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        }
      }
    });
  } catch (err) {
    console.error('Failed to load task status chart:', err);
  }
}

// Create session comparison chart
async function createSessionChart() {
  const ctx = document.getElementById("sessionChart");
  if (!ctx) return;

  try {
    const sessionsRes = await fetch(`${API_URL}/sessions/${userID}`);
    const sessions = await sessionsRes.json();
    
    let pomodoroCount = 0;
    let focusCount = 0;
    
    if (Array.isArray(sessions)) {
      sessions.forEach(session => {
        if (session.type === 'pomodoro') pomodoroCount++;
        else if (session.type === 'stopwatch') focusCount++;
      });
    }
    
    // Default to demo data if no sessions yet
    if (pomodoroCount === 0 && focusCount === 0) {
      pomodoroCount = 0;
      focusCount = 0;
    }
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pomodoro', 'Focus Sessions'],
        datasets: [{
          data: [pomodoroCount, focusCount],
          backgroundColor: ['#F59E0B', '#8B5CF6'],
          borderColor: ['#D97706', '#7C3AED'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        }
      }
    });
  } catch (err) {
    console.error('Failed to load session chart:', err);
  }
}

// Create monthly chart
async function createMonthlyChart() {
  const ctx = document.getElementById("monthlyChart");
  if (!ctx) return;

  try {
    const weeklyRes = await fetch(`${API_URL}/analytics/weekly/${userID}`);
    const weekly = await weeklyRes.json();
    
    const labels = weekly.map(w => `Week ${w.week || ''}`);
    const data = weekly.map(w => {
      const completed = w.tasks_completed || 0;
      const total = (w.tasks_completed || 0) + (w.pending_tasks || 0);
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    });
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.length > 0 ? labels : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          label: 'Weekly Progress %',
          data: data.length > 0 ? data : [0, 0, 0, 0],
          borderColor: '#06B6D4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      }
    });
  } catch (err) {
    console.error('Failed to load monthly chart:', err);
  }
}

// Initialize charts when page loads
document.addEventListener("DOMContentLoaded", function() {
  loadAnalytics();
  createTaskStatusChart();
  createSessionChart();
  createMonthlyChart();
});
