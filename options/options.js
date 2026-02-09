document.addEventListener('DOMContentLoaded', async () => {
    const settings = await browser.storage.local.get([
        'username', 'webhookUrl', 'notificationHour',
        'hideShortsOnHomepage', 'showReplacementGif', 'customGifUrl'
    ]);

    if (settings.username) document.getElementById('username').value = settings.username;
    if (settings.webhookUrl) document.getElementById('webhookUrl').value = settings.webhookUrl;
    if (settings.notificationHour !== undefined) {
        document.getElementById('notificationHour').value = settings.notificationHour;
    }

    const hideShortsCheckbox = document.getElementById('hideShortsOnHomepage');
    const showGifCheckbox = document.getElementById('showReplacementGif');
    const gifToggleGroup = document.getElementById('gifToggleGroup');
    const gifUrlGroup = document.getElementById('gifUrlGroup');
    const customGifInput = document.getElementById('customGifUrl');

    hideShortsCheckbox.checked = settings.hideShortsOnHomepage ?? false;
    showGifCheckbox.checked = settings.showReplacementGif ?? true;
    customGifInput.value = settings.customGifUrl || '';

    function updateGifVisibility() {
        const shortsHidden = hideShortsCheckbox.checked;
        const gifEnabled = showGifCheckbox.checked;
        gifToggleGroup.style.display = shortsHidden ? '' : 'none';
        gifUrlGroup.style.display = (shortsHidden && gifEnabled) ? '' : 'none';
    }
    updateGifVisibility();

    hideShortsCheckbox.addEventListener('change', async () => {
        await browser.storage.local.set({ hideShortsOnHomepage: hideShortsCheckbox.checked });
        updateGifVisibility();
    });

    showGifCheckbox.addEventListener('change', async () => {
        await browser.storage.local.set({ showReplacementGif: showGifCheckbox.checked });
        updateGifVisibility();
    });

    customGifInput.addEventListener('blur', async () => {
        await browser.storage.local.set({ customGifUrl: customGifInput.value.trim() });
    });

    document.getElementById('saveBtn').addEventListener('click', async () => {
        const username = document.getElementById('username').value.trim();
        const webhookUrl = document.getElementById('webhookUrl').value.trim();
        const notificationHour = parseInt(document.getElementById('notificationHour').value);
        const customGifUrl = customGifInput.value.trim();

        if (!username) { showStatus('Please enter your display name', 'error'); return; }
        if (!webhookUrl) { showStatus('Please enter a Discord webhook URL', 'error'); return; }
        if (!webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
            showStatus('Invalid webhook URL', 'error');
            return;
        }

        await browser.storage.local.set({ username, webhookUrl, notificationHour, customGifUrl });
        await browser.runtime.sendMessage({ action: 'updateAlarm' });
        showStatus('Settings saved', 'success');
    });

    document.getElementById('testBtn').addEventListener('click', async () => {
        const webhookUrl = document.getElementById('webhookUrl').value.trim();
        if (!webhookUrl) { showStatus('Please enter a webhook URL first', 'error'); return; }

        const username = document.getElementById('username').value.trim() || 'Test User';
        await browser.storage.local.set({ username, webhookUrl });

        showStatus('Sending...', 'info');
        try {
            await browser.runtime.sendMessage({ action: 'testNotification' });
            showStatus('Sent. Check Discord.', 'success');
        } catch (error) {
            showStatus('Failed: ' + error.message, 'error');
        }
    });
});

function showStatus(message, type) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.style.display = 'block';
    setTimeout(() => { statusEl.style.display = 'none'; }, 4000);
}
