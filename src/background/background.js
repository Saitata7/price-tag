import { loadSettings, saveSettings } from '../utils/storage.js';

/**
 * Handle messages from content scripts.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PRICE_SEEN') {
    trackPriceSeen(message.value);
  }
});

/**
 * Track price statistics.
 */
async function trackPriceSeen(value) {
  const settings = await loadSettings();
  const today = new Date().toISOString().slice(0, 10);
  const stats = settings.stats || {};

  // Reset daily stats if it's a new day
  if (stats.todayDate !== today) {
    stats.todayPricesSeen = 0;
    stats.todayValueSeen = 0;
    stats.todayDate = today;
  }

  stats.totalPricesSeen = (stats.totalPricesSeen || 0) + 1;
  stats.totalValueSeen = (stats.totalValueSeen || 0) + value;
  stats.todayPricesSeen += 1;
  stats.todayValueSeen += value;

  await saveSettings({ stats });
}

/**
 * On install, open onboarding if not yet completed.
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const settings = await loadSettings();
    if (!settings.onboarded) {
      // The popup will show onboarding automatically
      chrome.action.openPopup?.();
    }
  }
});
