/**
 * Background service worker for Blink extension.
 * Manages offscreen document lifecycle, data persistence, and notifications.
 */

// ── Constants ──────────────────────────────────────────────────────
const STORAGE_DEFAULTS = {
  blinkcounter: 0,
  blinkhistory: [],
  maxblinks: 250,
  daily_data: {},
  current_day_intervals: [],
  last_interval_update: new Date().toISOString(),
  settings: {
    notifications_enabled: true,
    low_blink_threshold: 5,
    high_blink_threshold: 120,
    interval_minutes: 5
  }
};

const ALARM_INTERVAL = 'blink-interval-check';
const ALARM_DAILY_RESET = 'blink-daily-reset';

// ── State ──────────────────────────────────────────────────────────
let offscreenCreated = false;
let previousIntervalCount = 0;
let isTracking = false;

// ── Offscreen Document Management ──────────────────────────────────
async function ensureOffscreenDocument() {
  if (offscreenCreated) return;

  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Webcam access for blink detection'
    });
    offscreenCreated = true;
  } catch (err) {
    // Document may already exist
    if (!err.message.includes('already exists')) {
      throw err;
    }
    offscreenCreated = true;
  }
}

async function closeOffscreenDocument() {
  if (!offscreenCreated) return;
  try {
    await chrome.offscreen.closeDocument();
  } catch {
    // Ignore errors when closing
  }
  offscreenCreated = false;
}

// ── Data Management ────────────────────────────────────────────────
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

async function getData() {
  const result = await chrome.storage.local.get(null);
  return { ...STORAGE_DEFAULTS, ...result };
}

async function saveData(data) {
  await chrome.storage.local.set(data);
}

async function updateIntervalData(currentCount) {
  const data = await getData();
  const now = new Date();
  const lastUpdate = new Date(data.last_interval_update);
  const intervalMs = (data.settings?.interval_minutes || 5) * 60 * 1000;

  if (now - lastUpdate >= intervalMs) {
    const intervalBlinks = currentCount - previousIntervalCount;
    if (intervalBlinks > 0) {
      data.current_day_intervals.push(intervalBlinks);
    }

    // Keep last 288 intervals (24 hours of 5-min intervals)
    if (data.current_day_intervals.length > 288) {
      data.current_day_intervals = data.current_day_intervals.slice(-288);
    }

    // Aggregate daily data
    const today = getCurrentDate();
    const dailyTotal = data.current_day_intervals.reduce((a, b) => a + b, 0);
    data.daily_data[today] = dailyTotal;

    data.last_interval_update = now.toISOString();
    previousIntervalCount = currentCount;

    await saveData(data);
  }
}

// ── Notifications ──────────────────────────────────────────────────
async function checkAndNotify(blinkCount) {
  const data = await getData();
  const settings = data.settings || STORAGE_DEFAULTS.settings;

  if (!settings.notifications_enabled) return;

  const intervals = data.current_day_intervals;
  const recentBlinks = intervals.length >= 2 ? intervals[intervals.length - 1] : null;

  if (recentBlinks !== null && recentBlinks < settings.low_blink_threshold) {
    chrome.notifications.create('low-blink', {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Blink Reminder',
      message: 'You are not blinking enough! Look away from your screen for 20 seconds.',
      priority: 2
    });
  }
}

// ── Tracking Control ───────────────────────────────────────────────
async function startTracking() {
  if (isTracking) return;

  await ensureOffscreenDocument();
  chrome.runtime.sendMessage({ type: 'START_DETECTION' });
  isTracking = true;

  // Set up interval alarm for data aggregation
  chrome.alarms.create(ALARM_INTERVAL, { periodInMinutes: 5 });

  // Initialize previous count
  const data = await getData();
  previousIntervalCount = data.blinkcounter;

  await chrome.storage.local.set({ tracking_active: true });
}

async function stopTracking() {
  if (!isTracking) return;

  chrome.runtime.sendMessage({ type: 'STOP_DETECTION' });
  await closeOffscreenDocument();
  isTracking = false;

  chrome.alarms.clear(ALARM_INTERVAL);
  await chrome.storage.local.set({ tracking_active: false });
}

// ── Message Handling ───────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'BLINK_DETECTED') {
    // Update storage with new blink count
    getData().then(data => {
      data.blinkcounter = message.count;

      // Update blink history (last 10 entries)
      if (data.blinkhistory.length >= 10) {
        data.blinkhistory.shift();
      }

      saveData(data);
      updateIntervalData(message.count);
    });
  }

  if (message.type === 'TOGGLE_TRACKING') {
    if (isTracking) {
      stopTracking().then(() => sendResponse({ tracking: false }));
    } else {
      startTracking().then(() => sendResponse({ tracking: true }));
    }
    return true; // async response
  }

  if (message.type === 'GET_TRACKING_STATUS') {
    sendResponse({ tracking: isTracking });
  }

  if (message.type === 'RESET_DAILY') {
    getData().then(data => {
      data.blinkcounter = 0;
      data.current_day_intervals = [];
      data.last_interval_update = new Date().toISOString();
      previousIntervalCount = 0;
      saveData(data);
      // Reset counter in offscreen doc too
      if (offscreenCreated) {
        chrome.runtime.sendMessage({ type: 'RESET_COUNT' });
      }
      sendResponse({ success: true });
    });
    return true;
  }
});

// ── Alarms ─────────────────────────────────────────────────────────
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_INTERVAL) {
    const data = await getData();
    await checkAndNotify(data.blinkcounter);
  }
});

// ── Install / Startup ──────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(async () => {
  const data = await getData();
  // Only set defaults if this is a fresh install
  if (!data.blinkcounter && data.blinkcounter !== 0) {
    await saveData(STORAGE_DEFAULTS);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  const { tracking_active } = await chrome.storage.local.get('tracking_active');
  if (tracking_active) {
    await startTracking();
  }
});
