import { loadSettings, saveSettings } from '../utils/storage.js';
import { convertPrice } from '../utils/time-formatter.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

let settings = {};

// ── Init ──────────────────────────────────────────
async function init() {
  settings = await loadSettings();

  if (settings.onboarded && settings.hourlyWage > 0) {
    showDashboard();
  } else {
    showOnboarding();
  }
}

// ── Views ─────────────────────────────────────────
function showOnboarding() {
  $('#onboarding').classList.add('active');
  $('#dashboard').classList.remove('active');
  setupOnboarding();
}

function showDashboard() {
  $('#onboarding').classList.remove('active');
  $('#dashboard').classList.add('active');
  setupDashboard();
}

// ── Onboarding ────────────────────────────────────
function setupOnboarding() {
  const hourlyBtn = $('#toggle-hourly');
  const salaryBtn = $('#toggle-salary');
  const hourlyField = $('#hourly-field');
  const salaryFields = $('#salary-fields');
  const ctaBtn = $('#cta-btn');

  let incomeMode = 'hourly';

  hourlyBtn.addEventListener('click', () => {
    incomeMode = 'hourly';
    hourlyBtn.classList.add('active');
    salaryBtn.classList.remove('active');
    hourlyField.classList.remove('hidden');
    salaryFields.classList.remove('visible');
  });

  salaryBtn.addEventListener('click', () => {
    incomeMode = 'salary';
    salaryBtn.classList.add('active');
    hourlyBtn.classList.remove('active');
    hourlyField.classList.add('hidden');
    salaryFields.classList.add('visible');
  });

  ctaBtn.addEventListener('click', async () => {
    let hourlyWage = 0;

    if (incomeMode === 'hourly') {
      hourlyWage = parseFloat($('#hourly-input').value);
    } else {
      const salary = parseFloat($('#salary-input').value);
      const hoursPerWeek = parseFloat($('#hours-week-input').value) || 40;
      const weeksPerYear = 52;
      hourlyWage = salary / (hoursPerWeek * weeksPerYear);
    }

    if (!isFinite(hourlyWage) || hourlyWage <= 0 || hourlyWage > 100000) {
      const focusEl = incomeMode === 'hourly' ? '#hourly-input' : '#salary-input';
      $(focusEl).style.borderColor = '#ef4444';
      $(focusEl).focus();
      return;
    }

    const isPostTax = $('#post-tax-toggle').checked;

    await saveSettings({
      hourlyWage: Math.round(hourlyWage * 100) / 100,
      isPostTax,
      onboarded: true,
      enabled: true,
    });

    settings = await loadSettings();
    showDashboard();
  });
}

// ── Dashboard ─────────────────────────────────────
function setupDashboard() {
  renderWage();
  renderStats();
  renderSiteToggle();
  renderStyleSelector();
  renderThreshold();
  setupMasterToggle();
  setupWageEditor();
}

function renderWage() {
  const wage = settings.hourlyWage;
  $('#wage-value').textContent = `$${wage % 1 === 0 ? wage : wage.toFixed(2)}/hr`;
}

function renderStats() {
  const stats = settings.stats || {};
  const today = new Date().toISOString().slice(0, 10);

  if (!settings.enabled) {
    $('#stats-content').style.display = 'none';
    $('#stats-disabled').style.display = 'block';
    return;
  }

  $('#stats-content').style.display = 'flex';
  $('#stats-disabled').style.display = 'none';

  const todayValue = stats.todayDate === today ? stats.todayValueSeen || 0 : 0;
  const formatted = todayValue >= 1000
    ? `$${(todayValue / 1000).toFixed(1)}k`
    : `$${Math.round(todayValue)}`;

  $('#stats-amount').textContent = formatted;

  if (settings.hourlyWage > 0) {
    const { text } = convertPrice(todayValue, settings.hourlyWage, 'compact');
    $('#stats-time').textContent = text;
  }
}

async function renderSiteToggle() {
  const siteToggle = $('#site-toggle');
  const siteLabel = $('#current-site');

  // Get current tab hostname
  let hostname = 'this site';
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      hostname = new URL(tab.url).hostname;
    }
  } catch {
    // Not in extension context
  }

  siteLabel.textContent = hostname;

  const disabled = (settings.disabledSites || []).includes(hostname);
  siteToggle.checked = disabled;

  siteToggle.addEventListener('change', async () => {
    let sites = settings.disabledSites || [];
    if (siteToggle.checked) {
      if (!sites.includes(hostname)) sites.push(hostname);
    } else {
      sites = sites.filter((s) => s !== hostname);
    }
    await saveSettings({ disabledSites: sites });
    settings.disabledSites = sites;
  });
}

function renderStyleSelector() {
  const buttons = $$('.style-option');
  buttons.forEach((btn) => {
    if (btn.dataset.style === settings.displayStyle) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    btn.addEventListener('click', async () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      await saveSettings({ displayStyle: btn.dataset.style });
      settings.displayStyle = btn.dataset.style;
    });
  });
}

function renderThreshold() {
  const slider = $('#threshold-slider');
  const display = $('#threshold-value');
  slider.value = settings.minPrice || 1;
  display.textContent = `$${slider.value}`;

  slider.addEventListener('input', () => {
    display.textContent = `$${slider.value}`;
  });

  slider.addEventListener('change', async () => {
    await saveSettings({ minPrice: parseInt(slider.value, 10) });
    settings.minPrice = parseInt(slider.value, 10);
  });
}

function setupMasterToggle() {
  const toggle = $('#master-toggle');
  const dashBody = $('#dash-body');
  toggle.checked = settings.enabled;

  function applyState() {
    if (toggle.checked) {
      dashBody.classList.remove('disabled');
    } else {
      dashBody.classList.add('disabled');
    }
    renderStats();
  }

  applyState();

  toggle.addEventListener('change', async () => {
    await saveSettings({ enabled: toggle.checked });
    settings.enabled = toggle.checked;
    applyState();
  });
}

function setupWageEditor() {
  const valueEl = $('#wage-value');
  const inputEl = $('#wage-input-inline');
  const editBtn = $('#wage-edit-btn');
  let editing = false;

  editBtn.addEventListener('click', () => {
    if (!editing) {
      editing = true;
      inputEl.value = settings.hourlyWage;
      inputEl.style.display = 'block';
      valueEl.style.display = 'none';
      inputEl.focus();
      inputEl.select();
    } else {
      commitWageEdit();
    }
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commitWageEdit();
    if (e.key === 'Escape') cancelWageEdit();
  });

  inputEl.addEventListener('blur', () => {
    // Small delay to allow button click to register
    setTimeout(() => {
      if (editing) commitWageEdit();
    }, 150);
  });

  async function commitWageEdit() {
    const val = parseFloat(inputEl.value);
    if (isFinite(val) && val > 0 && val <= 100000) {
      settings.hourlyWage = Math.round(val * 100) / 100;
      await saveSettings({ hourlyWage: settings.hourlyWage });
      renderWage();
      renderStats();
    }
    editing = false;
    inputEl.style.display = 'none';
    valueEl.style.display = 'inline';
  }

  function cancelWageEdit() {
    editing = false;
    inputEl.style.display = 'none';
    valueEl.style.display = 'inline';
  }
}

// Boot
init();
