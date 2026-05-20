'use strict';

const TOGGLE_MAP = {
  toggleBlockScroll: 'blockScroll',
  toggleHideSidebar: 'hideSidebar',
  toggleHideHomepage: 'hideShortsOnHomepage',
  toggleRedirect: 'redirectShorts'
};

const DEFAULTS = {
  blockScroll: true,
  hideSidebar: true,
  hideShortsOnHomepage: false,
  redirectShorts: false
};

document.addEventListener('DOMContentLoaded', async () => {
  const keys = Object.values(TOGGLE_MAP);
  const settings = await browser.storage.local.get([...keys, 'instaMode']);

  for (const [elementId, storageKey] of Object.entries(TOGGLE_MAP)) {
    const checkbox = document.getElementById(elementId);
    if (!checkbox) continue;

    checkbox.checked = settings[storageKey] ?? DEFAULTS[storageKey];

    checkbox.addEventListener('change', async () => {
      await browser.storage.local.set({ [storageKey]: checkbox.checked });
    });
  }

  // Load Instagram mode
  const instaModeSelect = document.getElementById('instaModeSelect');
  if (instaModeSelect) {
    instaModeSelect.value = settings.instaMode || 'block_reels';
    instaModeSelect.addEventListener('change', async () => {
      await browser.storage.local.set({ instaMode: instaModeSelect.value });
    });
  }

  // Load blocked count
  try {
    const response = await browser.runtime.sendMessage({ action: 'getBlockedCount' });
    if (response && response.count !== undefined) {
      document.getElementById('blockedCount').textContent = response.count;
    }
  } catch (e) {
    // Background script might not be ready
  }

  // Open settings link
  document.getElementById('openSettings').addEventListener('click', () => {
    browser.runtime.openOptionsPage();
    window.close();
  });
});
