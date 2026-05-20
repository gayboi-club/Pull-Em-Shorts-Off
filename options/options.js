'use strict';

const TOGGLE_MAP = {
  blockScroll: { default: true },
  hideSidebar: { default: true },
  redirectShorts: { default: false },
  hideShortsOnHomepage: { default: false },
  showReplacementGif: { default: true }
};

/**
 * Show a floating toast notification.
 */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

/**
 * Update visibility of GIF-related controls based on homepage toggle state.
 */
function updateGifVisibility() {
  const homepageHidden = document.getElementById('hideShortsOnHomepage').checked;
  const gifEnabled = document.getElementById('showReplacementGif').checked;
  const gifToggleGroup = document.getElementById('gifToggleGroup');
  const gifUrlGroup = document.getElementById('gifUrlGroup');

  gifToggleGroup.style.display = homepageHidden ? '' : 'none';
  gifUrlGroup.style.display = (homepageHidden && gifEnabled) ? '' : 'none';
}

/**
 * Load and display stats (blocked today + streak).
 */
async function loadStats() {
  try {
    const data = await browser.storage.local.get([
      'blockedToday', 'lastResetDate', 'streakCount', 'lastActiveDate'
    ]);

    const today = new Date().toDateString();

    // Blocked today
    let blocked = data.blockedToday || 0;
    if (data.lastResetDate !== today) {
      blocked = 0;
    }
    document.getElementById('blockedToday').textContent = blocked;

    // Streak calculation
    let streak = data.streakCount || 0;
    const lastActive = data.lastActiveDate;

    if (lastActive) {
      const lastDate = new Date(lastActive);
      const now = new Date();
      const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        streak = 1; // streak broken
        await browser.storage.local.set({ streakCount: 1, lastActiveDate: today });
      } else if (diffDays === 1 || lastActive !== today) {
        streak = (data.streakCount || 0) + (lastActive !== today ? 1 : 0);
        if (lastActive !== today) {
          await browser.storage.local.set({ streakCount: streak, lastActiveDate: today });
        }
      }
    } else {
      streak = 1;
      await browser.storage.local.set({ streakCount: 1, lastActiveDate: today });
    }

    document.getElementById('streakCount').textContent = streak;
  } catch (e) {
    // Storage not available
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Load all toggle settings
  const keys = Object.keys(TOGGLE_MAP);
  const settings = await browser.storage.local.get([...keys, 'customGifUrl', 'instaMode']);

  // Set up toggles with auto-save
  for (const [key, config] of Object.entries(TOGGLE_MAP)) {
    const checkbox = document.getElementById(key);
    if (!checkbox) continue;

    checkbox.checked = settings[key] ?? config.default;

    checkbox.addEventListener('change', async () => {
      await browser.storage.local.set({ [key]: checkbox.checked });
      updateGifVisibility();
      showToast('Saved');
    });
  }

  // Custom GIF URL
  const customGifInput = document.getElementById('customGifUrl');
  customGifInput.value = settings.customGifUrl || '';

  let saveTimeout;
  customGifInput.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      await browser.storage.local.set({ customGifUrl: customGifInput.value.trim() });
      showToast('Saved');
    }, 600);
  });

  // Insta Mode
  const instaModeRadios = document.querySelectorAll('input[name="instaMode"]');
  const savedInstaMode = settings.instaMode || 'block_reels';
  for (const radio of instaModeRadios) {
    if (radio.value === savedInstaMode) radio.checked = true;
    radio.addEventListener('change', async () => {
      if (radio.checked) {
        await browser.storage.local.set({ instaMode: radio.value });
        showToast('Saved');
      }
    });
  }

  updateGifVisibility();
  loadStats();
});
