const ALARM_NAME = 'dailyNotification';
const DEFAULT_NOTIFICATION_HOUR = 20;

browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') browser.runtime.openOptionsPage();
    await setupDailyAlarm();
});

async function setupDailyAlarm() {
    await browser.alarms.clear(ALARM_NAME);
    const settings = await browser.storage.local.get(['notificationHour']);
    const hour = settings.notificationHour ?? DEFAULT_NOTIFICATION_HOUR;

    const now = new Date();
    const nextNotification = new Date();
    nextNotification.setHours(hour, 0, 0, 0);

    if (now >= nextNotification) nextNotification.setDate(nextNotification.getDate() + 1);
    const delayInMinutes = (nextNotification.getTime() - now.getTime()) / (1000 * 60);

    browser.alarms.create(ALARM_NAME, {
        delayInMinutes: delayInMinutes,
        periodInMinutes: 24 * 60
    });
}

browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_NAME) await sendDailyNotification();
});

async function sendDailyNotification() {
    const settings = await browser.storage.local.get(['webhookUrl', 'username']);
    if (!settings.webhookUrl) return;

    const username = settings.username || 'User';
    const messages = [
        `**${username}** made it through another day without falling down the Shorts rabbit hole.`,
        `Another day, another win for **${username}**. No Shorts scrolling.`,
        `**${username}** didn't scroll Shorts today. That's a wrap.`,
        `Daily check-in: **${username}** kept it together. Zero Shorts consumed via scroll.`,
        `**${username}** resisted the endless scroll. Day complete.`,
        `No Shorts doom-scrolling for **${username}** today.`,
        `**${username}** closed the loop without losing hours to Shorts. Nice.`,
        `Scroll count for **${username}**: zero. Another solid day.`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    const payload = {
        content: randomMessage,
        embeds: [{
            title: 'Pull Em Shorts Off - Daily Report',
            description: 'No infinite scrolling today.',
            color: 0x2d2d2d,
            footer: { text: 'Keep it up.' },
            timestamp: new Date().toISOString()
        }]
    };

    try {
        await fetch(settings.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) { }
}

browser.browserAction.onClicked.addListener(() => browser.runtime.openOptionsPage());

browser.runtime.onMessage.addListener(async (message) => {
    if (message.action === 'testNotification') {
        await sendDailyNotification();
        return { success: true };
    } else if (message.action === 'updateAlarm') {
        await setupDailyAlarm();
        return { success: true };
    }
});
