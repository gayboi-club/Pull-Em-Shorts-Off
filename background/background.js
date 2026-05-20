'use strict';

/**
 * Opens the options page when the extension icon is clicked.
 * Only fires when no default_popup is set, otherwise the popup handles it.
 */
browser.action.onClicked.addListener(() => browser.runtime.openOptionsPage());

/**
 * On first install, open the options page so the user can configure settings.
 */
browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        browser.runtime.openOptionsPage();
    }
});

/**
 * Handle messages from content scripts and popup.
 */
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openOptions') {
        browser.runtime.openOptionsPage();
    }

    if (message.action === 'getBlockedCount') {
        browser.storage.local.get(['blockedToday', 'lastResetDate']).then((data) => {
            const today = new Date().toDateString();
            if (data.lastResetDate !== today) {
                browser.storage.local.set({ blockedToday: 0, lastResetDate: today });
                sendResponse({ count: 0 });
            } else {
                sendResponse({ count: data.blockedToday || 0 });
            }
        });
        return true;
    }

    if (message.action === 'incrementBlocked') {
        browser.storage.local.get(['blockedToday', 'lastResetDate']).then((data) => {
            const today = new Date().toDateString();
            let count = data.blockedToday || 0;
            if (data.lastResetDate !== today) {
                count = 0;
            }
            count++;
            browser.storage.local.set({ blockedToday: count, lastResetDate: today });
            browser.action.setBadgeText({ text: String(count) });
            browser.action.setBadgeBackgroundColor({ color: '#6c5ce7' });
        });
    }
});

/**
 * Restore badge on startup.
 */
browser.storage.local.get(['blockedToday', 'lastResetDate']).then((data) => {
    const today = new Date().toDateString();
    if (data.lastResetDate === today && data.blockedToday > 0) {
        browser.action.setBadgeText({ text: String(data.blockedToday) });
        browser.action.setBadgeBackgroundColor({ color: '#6c5ce7' });
    }
});
