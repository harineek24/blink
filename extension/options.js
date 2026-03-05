/**
 * Options page script for Blink extension.
 */

const DEFAULTS = {
  notifications_enabled: true,
  low_blink_threshold: 5,
  interval_minutes: 5
};

async function loadSettings() {
  const data = await chrome.storage.local.get(null);
  const settings = data.settings || DEFAULTS;

  document.getElementById('notif-toggle').checked = settings.notifications_enabled !== false;
  document.getElementById('max-blinks').value = data.maxblinks || 250;
  document.getElementById('low-threshold').value = settings.low_blink_threshold || 5;
  document.getElementById('interval-min').value = settings.interval_minutes || 5;
}

async function saveSettings() {
  const settings = {
    notifications_enabled: document.getElementById('notif-toggle').checked,
    low_blink_threshold: parseInt(document.getElementById('low-threshold').value, 10) || 5,
    interval_minutes: parseInt(document.getElementById('interval-min').value, 10) || 5
  };
  const maxblinks = parseInt(document.getElementById('max-blinks').value, 10) || 250;

  await chrome.storage.local.set({ settings, maxblinks });

  const msg = document.getElementById('saved-msg');
  msg.classList.add('show');
  setTimeout(() => msg.classList.remove('show'), 2000);
}

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();

  document.getElementById('save-btn').addEventListener('click', saveSettings);

  document.getElementById('reset-btn').addEventListener('click', async () => {
    if (confirm('Reset today\'s blink data?')) {
      await chrome.runtime.sendMessage({ type: 'RESET_DAILY' });
      alert('Data reset!');
    }
  });
});
