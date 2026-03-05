import { loadSettings, saveSettings } from '../utils/storage.js';

// Batch queue to avoid read-modify-write race conditions
let pendingValues = [];
let flushTimer = null;

chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.id !== chrome.runtime.id) return;
  if (message.type === 'PRICE_SEEN') {
    const value = typeof message.value === 'number' && isFinite(message.value)
      ? message.value
      : 0;
    if (value > 0) {
      pendingValues.push(value);
      scheduleFlush();
    }
  }
});

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(flushStats, 500);
}

async function flushStats() {
  flushTimer = null;
  const batch = pendingValues;
  pendingValues = [];
  if (batch.length === 0) return;

  const settings = await loadSettings();
  const today = new Date().toISOString().slice(0, 10);
  const stats = settings.stats || {};

  if (stats.todayDate !== today) {
    stats.todayPricesSeen = 0;
    stats.todayValueSeen = 0;
    stats.todayDate = today;
  }

  const batchTotal = batch.reduce((sum, v) => sum + v, 0);
  stats.totalPricesSeen = (stats.totalPricesSeen || 0) + batch.length;
  stats.totalValueSeen = (stats.totalValueSeen || 0) + batchTotal;
  stats.todayPricesSeen += batch.length;
  stats.todayValueSeen += batchTotal;

  await saveSettings({ stats });
}

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const settings = await loadSettings();
    if (!settings.onboarded) {
      chrome.action.openPopup?.();
    }
  }
});
