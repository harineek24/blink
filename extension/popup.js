/**
 * Popup script for Blink extension.
 * Reads data from chrome.storage and renders the dashboard.
 */

// ── Chart Setup ────────────────────────────────────────────────────
let trendsChart = null;
let currentView = 'today';

const CHART_COLORS = {
  primary: '#6366f1',
  primaryBg: 'rgba(99, 102, 241, 0.12)',
  text: '#64748b',
  border: '#4d5175'
};

function initChart() {
  const ctx = document.getElementById('trends-chart').getContext('2d');
  trendsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        fill: 'origin',
        tension: 0.4,
        label: 'Blinks',
        backgroundColor: CHART_COLORS.primaryBg,
        borderColor: CHART_COLORS.primary,
        borderWidth: 2,
        data: [],
        pointRadius: 0,
        pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: CHART_COLORS.border,
          borderWidth: 1,
          cornerRadius: 6,
          displayColors: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { display: false },
          ticks: { color: CHART_COLORS.text, font: { size: 10 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: CHART_COLORS.text, font: { size: 10 }, maxTicksLimit: 6 }
        }
      },
      interaction: { intersect: false, mode: 'index' }
    }
  });
}

// ── Data Helpers ───────────────────────────────────────────────────
function getTodayLabels(intervals) {
  const labels = [];
  const now = new Date();
  for (let i = intervals.length - 1; i >= 0; i--) {
    const t = new Date(now.getTime() - (intervals.length - 1 - i) * 5 * 60 * 1000);
    labels.unshift(t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
  }
  return labels;
}

function getWeekData(dailyData) {
  const today = new Date();
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    result.push({
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      blinks: (dailyData && dailyData[key]) || 0
    });
  }
  return result;
}

function getSuggestion(percentage) {
  if (percentage < 20) return { icon: '👍', text: 'Great start! Keep up the healthy blinking habits.' };
  if (percentage < 50) return { icon: '👁️', text: 'Doing well! Consider a short break to rest your eyes.' };
  if (percentage < 80) return { icon: '⏰', text: 'Time for a break! Look away from the screen for 20 seconds.' };
  return { icon: '🚨', text: 'High screen time detected! Take a longer break and stretch.' };
}

// ── UI Updates ─────────────────────────────────────────────────────
const RING_CIRCUMFERENCE = 2 * Math.PI * 52; // ~326.73

async function updateUI() {
  const data = await chrome.storage.local.get(null);
  const blinks = data.blinkcounter || 0;
  const maxBlinks = data.maxblinks || 250;
  const percentage = Math.min(blinks / maxBlinks, 1);

  // Counter
  document.getElementById('blink-count').textContent = blinks;
  document.getElementById('percentage').textContent = Math.round(percentage * 100) + '%';

  // Ring progress
  const offset = RING_CIRCUMFERENCE * (1 - percentage);
  document.getElementById('ring-progress').style.strokeDashoffset = offset;

  // Blinks per minute estimate
  const intervals = data.current_day_intervals || [];
  if (intervals.length > 0) {
    const recent = intervals.slice(-3);
    const avgPerInterval = recent.reduce((a, b) => a + b, 0) / recent.length;
    const intervalMin = (data.settings?.interval_minutes || 5);
    const bpm = (avgPerInterval / intervalMin).toFixed(1);
    document.getElementById('blinks-per-min').textContent = bpm;
  }

  // Suggestion
  const suggestion = getSuggestion(percentage * 100);
  document.getElementById('suggestion').innerHTML =
    `<span class="suggestion-icon">${suggestion.icon}</span>` +
    `<span class="suggestion-text">${suggestion.text}</span>`;

  // Chart
  updateChart(data);

  // Stats
  const dailyData = data.daily_data || {};
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('today-total').textContent = dailyData[today] || blinks;

  const weekValues = Object.entries(dailyData)
    .filter(([k]) => {
      const d = new Date(k);
      const now = new Date();
      return (now - d) <= 7 * 24 * 60 * 60 * 1000;
    })
    .map(([, v]) => v);
  const weekAvg = weekValues.length > 0
    ? Math.round(weekValues.reduce((a, b) => a + b, 0) / weekValues.length)
    : 0;
  document.getElementById('week-avg').textContent = weekAvg;

  const allValues = Object.values(dailyData);
  document.getElementById('best-day').textContent = allValues.length > 0
    ? Math.max(...allValues)
    : 0;
}

function updateChart(data) {
  if (!trendsChart) return;

  if (currentView === 'today') {
    const intervals = data.current_day_intervals || [];
    if (intervals.length === 0) {
      trendsChart.data.labels = ['No data'];
      trendsChart.data.datasets[0].data = [0];
    } else {
      trendsChart.data.labels = getTodayLabels(intervals);
      trendsChart.data.datasets[0].data = intervals;
    }
    trendsChart.data.datasets[0].label = 'Blinks / 5 min';
  } else {
    const week = getWeekData(data.daily_data);
    trendsChart.data.labels = week.map(d => d.label);
    trendsChart.data.datasets[0].data = week.map(d => d.blinks);
    trendsChart.data.datasets[0].label = 'Daily total';
  }

  trendsChart.update('none');
}

// ── Tracking Toggle ────────────────────────────────────────────────
async function updateTrackingUI() {
  const response = await chrome.runtime.sendMessage({ type: 'GET_TRACKING_STATUS' });
  const isTracking = response?.tracking || false;
  const dot = document.getElementById('tracking-dot');
  const label = document.getElementById('tracking-label');
  const btn = document.getElementById('toggle-btn');

  if (isTracking) {
    dot.classList.add('active');
    label.textContent = 'Tracking active';
    btn.textContent = 'Stop';
    btn.classList.add('active');
  } else {
    dot.classList.remove('active');
    label.textContent = 'Not tracking';
    btn.textContent = 'Start';
    btn.classList.remove('active');
  }
}

// ── Event Listeners ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initChart();
  updateUI();
  updateTrackingUI();

  // Refresh data every 2 seconds while popup is open
  setInterval(updateUI, 2000);

  // Toggle tracking — request camera permission first if needed
  document.getElementById('toggle-btn').addEventListener('click', async () => {
    const response = await chrome.runtime.sendMessage({ type: 'GET_TRACKING_STATUS' });
    const isCurrentlyTracking = response?.tracking || false;

    if (!isCurrentlyTracking) {
      // Before starting, ensure camera permission is granted.
      // Offscreen documents can't show permission prompts, so we
      // request it here in the popup (a visible context).
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Permission granted — stop the stream immediately (offscreen will open its own)
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        const label = document.getElementById('tracking-label');
        label.textContent = 'Camera access denied';
        console.error('Camera permission denied:', err);
        return;
      }
    }

    const result = await chrome.runtime.sendMessage({ type: 'TOGGLE_TRACKING' });
    if (result?.error) {
      const label = document.getElementById('tracking-label');
      label.textContent = 'Error: ' + (result.error === true ? 'Failed to start' : result.error);
    }
    updateTrackingUI();
  });

  // View toggle
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.dataset.view;
      updateUI();
    });
  });

  // Settings
  document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});

// Listen for storage changes to update UI in real-time
chrome.storage.onChanged.addListener(() => {
  updateUI();
});
