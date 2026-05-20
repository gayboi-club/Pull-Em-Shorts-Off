(function () {
  'use strict';

  const DEFAULT_MEDIA = 'https://media.tenor.com/PntdHij84lQAAAAM/you-should-study-now-boykisser.gif';

  let hideSidebar = true;
  let hideShortsOnHomepage = false;
  let showReplacementGif = true;
  let customGifUrl = '';
  let debounceTimer = null;

  /**
   * Load user preferences from storage.
   */
  async function loadSettings() {
    try {
      const settings = await browser.storage.local.get([
        'hideSidebar', 'hideShortsOnHomepage', 'showReplacementGif', 'customGifUrl'
      ]);
      hideSidebar = settings.hideSidebar ?? true;
      hideShortsOnHomepage = settings.hideShortsOnHomepage ?? false;
      showReplacementGif = settings.showReplacementGif ?? true;
      customGifUrl = settings.customGifUrl || '';
    } catch (e) { }
  }

  /**
   * Listen for setting changes in real time.
   */
  browser.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.hideSidebar !== undefined) hideSidebar = changes.hideSidebar.newValue;
    if (changes.hideShortsOnHomepage !== undefined) hideShortsOnHomepage = changes.hideShortsOnHomepage.newValue;
    if (changes.showReplacementGif !== undefined) showReplacementGif = changes.showReplacementGif.newValue;
    if (changes.customGifUrl !== undefined) customGifUrl = changes.customGifUrl.newValue || '';
    applyChanges();
  });

  /**
   * Hide the Shorts entry from YouTube's sidebar/mini-guide navigation.
   */
  function hideShortsNavigation() {
    if (!hideSidebar) return;

    const sidebarItems = document.querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer');
    sidebarItems.forEach(item => {
      const endpoint = item.querySelector('#endpoint');
      if (endpoint) {
        const href = endpoint.getAttribute('href');
        const title = endpoint.getAttribute('title') || '';
        if (href === '/shorts' || title.toLowerCase().includes('shorts')) {
          item.style.display = 'none';
        }
      }
    });

    const allGuideItems = document.querySelectorAll('ytd-guide-entry-renderer');
    allGuideItems.forEach(item => {
      if (item.textContent.toLowerCase().includes('shorts')) {
        item.style.display = 'none';
      }
    });

    const miniGuideItems = document.querySelectorAll('ytd-mini-guide-entry-renderer');
    miniGuideItems.forEach(item => {
      const link = item.querySelector('a');
      if (link && link.href && link.href.includes('/shorts')) {
        item.style.display = 'none';
      }
    });
  }

  /**
   * Create a replacement element (GIF or video) to show in place of hidden Shorts shelves.
   */
  function createReplacementElement() {
    const mediaUrl = customGifUrl || DEFAULT_MEDIA;
    const isVideo = mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm');

    const wrapper = document.createElement('div');
    wrapper.className = 'peso-replacement';

    // Detect YouTube dark mode
    const isDark = document.documentElement.hasAttribute('dark');
    wrapper.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px;
      margin: 16px 0;
      border-radius: 12px;
      background: ${isDark ? '#1a1a1a' : '#f9f9f9'};
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

    media.style.cssText = 'max-width: 300px; border-radius: 8px;';
    wrapper.appendChild(media);
    return wrapper;
  }

  /**
   * Hide or show Shorts shelves on the YouTube homepage.
   */
  function handleHomepageShorts() {
    const shortsShelves = document.querySelectorAll('ytd-rich-shelf-renderer, ytd-reel-shelf-renderer');

    shortsShelves.forEach(shelf => {
      const text = shelf.textContent.toLowerCase();
      if (!text.includes('shorts')) return;

      if (hideShortsOnHomepage) {
        const existing = shelf.parentElement?.querySelector('.peso-replacement');
        if (showReplacementGif && !existing) {
          const replacement = createReplacementElement();
          shelf.parentElement?.insertBefore(replacement, shelf);
        } else if (!showReplacementGif && existing) {
          existing.remove();
        }
        shelf.style.display = 'none';
      } else {
        shelf.style.display = '';
        const existing = shelf.parentElement?.querySelector('.peso-replacement');
        if (existing) existing.remove();
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

  /**
   * Apply all visibility changes.
   */
  function applyChanges() {
    hideShortsNavigation();
    handleHomepageShorts();
  }

  /**
   * Debounced mutation handler to avoid excessive DOM queries.
   */
  function onMutation() {
    if (debounceTimer) return;
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      applyChanges();
    }, 200);
  }

  const observer = new MutationObserver(onMutation);

  async function init() {
    await loadSettings();
    applyChanges();

    const waitForBody = () => {
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      } else {
        requestAnimationFrame(waitForBody);
      }
    };
    waitForBody();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
