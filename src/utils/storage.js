/**
 * Wrapper around Chrome Storage API for consistent access.
 */

const DEFAULTS = {
  hourlyWage: 0,
  isPostTax: true,
  enabled: true,
  minPrice: 1,
  displayStyle: 'compact',
  disabledSites: [],
  onboarded: false,
  stats: {
    totalPricesSeen: 0,
    totalValueSeen: 0,
    todayPricesSeen: 0,
    todayValueSeen: 0,
    todayDate: null,
  },
};

function getStorage() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return chrome.storage.sync;
  }
  // Fallback for testing: use an in-memory store
  const store = { ...DEFAULTS };
  return {
    get: (keys, cb) => {
      const result = {};
      const keyList = Array.isArray(keys) ? keys : Object.keys(keys);
      for (const key of keyList) {
        result[key] = store[key] ?? keys[key];
      }
      cb(result);
    },
    set: (data, cb) => {
      Object.assign(store, data);
      if (cb) cb();
    },
  };
}

export function loadSettings() {
  return new Promise((resolve) => {
    getStorage().get(DEFAULTS, (data) => resolve(data));
  });
}

export function saveSettings(data) {
  return new Promise((resolve) => {
    getStorage().set(data, () => resolve());
  });
}

export function isSiteDisabled(disabledSites, hostname) {
  return disabledSites.includes(hostname);
}
