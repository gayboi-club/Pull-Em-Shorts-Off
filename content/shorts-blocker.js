(function () {
  'use strict';

  let blockScroll = true;
  let redirectShorts = false;
  let lastUrl = location.href;
  let debounceTimer = null;

  /**
   * Load settings from storage.
   */
  async function loadSettings() {
    try {
      const settings = await browser.storage.local.get(['blockScroll', 'redirectShorts']);
      blockScroll = settings.blockScroll ?? true;
      redirectShorts = settings.redirectShorts ?? false;
    } catch (e) { }
  }

  /**
   * Listen for setting changes in real time.
   */
  browser.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.blockScroll !== undefined) blockScroll = changes.blockScroll.newValue;
    if (changes.redirectShorts !== undefined) {
      redirectShorts = changes.redirectShorts.newValue;
      if (redirectShorts && isShortPage()) tryRedirect();
    }
  });

  function isShortPage() {
    return window.location.pathname.startsWith('/shorts/');
  }

  /**
   * Extract the video ID from a /shorts/VIDEO_ID path and redirect to /watch?v=VIDEO_ID.
   */
  function tryRedirect() {
    if (!redirectShorts || !isShortPage()) return;
    const match = window.location.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]+)/);
    if (match) {
      window.location.replace(`https://www.youtube.com/watch?v=${match[1]}`);
    }
  }

  /**
   * Block mouse wheel scrolling on Shorts pages.
   */
  function blockWheelScroll(e) {
    if (!blockScroll || !isShortPage()) return;
    const shortsPlayer = document.querySelector('ytd-shorts');
    if (shortsPlayer && shortsPlayer.contains(e.target)) {
      e.preventDefault();
      e.stopPropagation();
      notifyBlocked();
      return false;
    }
  }

  /**
   * Block keyboard navigation between Shorts.
   */
  function blockKeyboard(e) {
    if (!blockScroll || !isShortPage()) return;
    const blockedKeys = ['ArrowUp', 'ArrowDown', 'j', 'k', 'PageUp', 'PageDown'];
    if (e.key === ' ') return;
    if (blockedKeys.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      notifyBlocked();
      return false;
    }
  }

  let touchStartY = 0;
  let isTouchingShorts = false;

  function handleTouchStart(e) {
    if (!blockScroll || !isShortPage()) {
      isTouchingShorts = false;
      return;
    }
    const shortsPlayer = document.querySelector('ytd-shorts');
    isTouchingShorts = shortsPlayer && shortsPlayer.contains(e.target);
    if (isTouchingShorts) {
      touchStartY = e.touches[0].clientY;
    }
  }

  function handleTouchMove(e) {
    if (!blockScroll || !isShortPage() || !isTouchingShorts) return;
    const deltaY = touchStartY - e.touches[0].clientY;
    if (Math.abs(deltaY) > 10) {
      e.preventDefault();
      e.stopPropagation();
      notifyBlocked();
      return false;
    }
  }

  /**
   * Notify background script that a scroll was blocked (for badge counter).
   */
  let lastNotifyTime = 0;
  function notifyBlocked() {
    const now = Date.now();
    if (now - lastNotifyTime < 2000) return; // debounce: max once per 2s
    lastNotifyTime = now;
    try {
      browser.runtime.sendMessage({ action: 'incrementBlocked' });
    } catch (e) { }
  }

  /**
   * Apply overflow and style overrides to prevent scrolling within the Shorts player.
   */
  function applyShortsStyles() {
    if (!blockScroll || !isShortPage()) return;

    const shortsContainer = document.querySelector('ytd-reel-video-renderer');
    if (shortsContainer) {
      shortsContainer.style.overflow = 'hidden';
      shortsContainer.style.touchAction = 'none';
    }

    const reelContainer = document.querySelector('#shorts-container');
    if (reelContainer) {
      reelContainer.style.overflow = 'hidden';
      reelContainer.style.touchAction = 'none';
    }

    const navButtons = document.querySelectorAll('[id*="navigation-button"]');
    navButtons.forEach(btn => { btn.style.display = 'none'; });
  }

  /**
   * Debounced handler for URL changes (YouTube uses SPA navigation).
   */
  function onDomMutation() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (isShortPage()) {
        tryRedirect();
        applyShortsStyles();
      }
    }

    if (debounceTimer) return;
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      if (isShortPage()) applyShortsStyles();
    }, 300);
  }

  function init() {
    document.addEventListener('wheel', blockWheelScroll, { passive: false, capture: true });
    document.addEventListener('keydown', blockKeyboard, { capture: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });

    window.addEventListener('popstate', () => { lastUrl = location.href; });

    // Single observer instead of polling with setInterval
    const observer = new MutationObserver(onDomMutation);

    const waitForBody = () => {
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
        tryRedirect();
        if (isShortPage()) applyShortsStyles();
      } else {
        requestAnimationFrame(waitForBody);
      }
    };
    waitForBody();
  }

  loadSettings().then(init);
})();
