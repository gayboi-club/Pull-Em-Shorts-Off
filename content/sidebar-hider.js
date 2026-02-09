(function () {
    'use strict';

    const DEFAULT_MEDIA = 'https://media.tenor.com/PntdHij84lQAAAAM/you-should-study-now-boykisser.gif';

    let hideShortsOnHomepage = false;
    let showReplacementGif = true;
    let customGifUrl = '';

    async function loadSettings() {
        try {
            const settings = await browser.storage.local.get(['hideShortsOnHomepage', 'showReplacementGif', 'customGifUrl']);
            hideShortsOnHomepage = settings.hideShortsOnHomepage ?? false;
            showReplacementGif = settings.showReplacementGif ?? true;
            customGifUrl = settings.customGifUrl || '';
        } catch (e) { }
    }

    browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'local') {
            if (changes.hideShortsOnHomepage !== undefined) {
                hideShortsOnHomepage = changes.hideShortsOnHomepage.newValue;
                applyChanges();
            }
            if (changes.showReplacementGif !== undefined) {
                showReplacementGif = changes.showReplacementGif.newValue;
                applyChanges();
            }
            if (changes.customGifUrl !== undefined) {
                customGifUrl = changes.customGifUrl.newValue || '';
                applyChanges();
            }
        }
    });

    function hideShortsNavigation() {
        const sidebarItems = document.querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer');
        sidebarItems.forEach(item => {
            const titleElement = item.querySelector('#endpoint');
            if (titleElement) {
                const href = titleElement.getAttribute('href');
                const title = titleElement.getAttribute('title') || '';
                if (href === '/shorts' || title.toLowerCase().includes('shorts')) {
                    item.style.display = 'none';
                }
            }
        });

        const allGuideItems = document.querySelectorAll('ytd-guide-entry-renderer');
        allGuideItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes('shorts')) item.style.display = 'none';
        });

        const miniGuideItems = document.querySelectorAll('ytd-mini-guide-entry-renderer');
        miniGuideItems.forEach(item => {
            const link = item.querySelector('a');
            if (link && link.href && link.href.includes('/shorts')) {
                item.style.display = 'none';
            }
        });
    }

    function createReplacementElement() {
        const mediaUrl = customGifUrl || DEFAULT_MEDIA;
        const isVideo = mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm');

        const wrapper = document.createElement('div');
        wrapper.className = 'peso-replacement';
        wrapper.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px;
      margin: 16px 0;
      border-radius: 12px;
      background: #f9f9f9;
    `;

        let media;
        if (isVideo) {
            media = document.createElement('video');
            media.src = mediaUrl;
            media.autoplay = true;
            media.loop = true;
            media.muted = true;
            media.playsInline = true;
        } else {
            media = document.createElement('img');
            media.src = mediaUrl;
            media.alt = '';
        }

        media.style.cssText = `max-width: 300px; border-radius: 8px;`;
        wrapper.appendChild(media);
        return wrapper;
    }

    function handleHomepageShorts() {
        const shortsShelves = document.querySelectorAll('ytd-rich-shelf-renderer, ytd-reel-shelf-renderer');

        shortsShelves.forEach(shelf => {
            const title = shelf.textContent.toLowerCase();
            if (title.includes('shorts')) {
                if (hideShortsOnHomepage) {
                    const existingReplacement = shelf.parentElement?.querySelector('.peso-replacement');
                    if (showReplacementGif && !existingReplacement) {
                        const replacement = createReplacementElement();
                        shelf.parentElement?.insertBefore(replacement, shelf);
                    } else if (!showReplacementGif && existingReplacement) {
                        existingReplacement.remove();
                    }
                    shelf.style.display = 'none';
                } else {
                    shelf.style.display = '';
                    const existingReplacement = shelf.parentElement?.querySelector('.peso-replacement');
                    if (existingReplacement) existingReplacement.remove();
                }
            }
        });

        if (hideShortsOnHomepage) {
            const channelTabs = document.querySelectorAll('yt-tab-shape, tp-yt-paper-tab');
            channelTabs.forEach(tab => {
                if (tab.textContent.toLowerCase().includes('shorts')) {
                    tab.style.display = 'none';
                }
            });
        }
    }

    function applyChanges() {
        hideShortsNavigation();
        handleHomepageShorts();
    }

    const observer = new MutationObserver(() => applyChanges());

    async function init() {
        await loadSettings();
        applyChanges();
        observer.observe(document.body, { childList: true, subtree: true });
        setInterval(applyChanges, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
