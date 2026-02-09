(function () {
  'use strict';

  function isShortPage() {
    return window.location.pathname.startsWith('/shorts/');
  }

  function blockScroll(e) {
    if (!isShortPage()) return;
    const shortsPlayer = document.querySelector('ytd-shorts');
    if (shortsPlayer && shortsPlayer.contains(e.target)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }

  function blockKeyboard(e) {
    if (!isShortPage()) return;
    const blockedKeys = ['ArrowUp', 'ArrowDown', 'j', 'k', 'PageUp', 'PageDown'];
    if (e.key === ' ') return;
    if (blockedKeys.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }

  let touchStartY = 0;
  let isTouchingShorts = false;

  function handleTouchStart(e) {
    if (!isShortPage()) {
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
    if (!isShortPage() || !isTouchingShorts) return;
    const touchY = e.touches[0].clientY;
    const deltaY = touchStartY - touchY;
    if (Math.abs(deltaY) > 10) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }

  function applyShortsStyles() {
    if (!isShortPage()) return;

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
    navButtons.forEach(btn => btn.style.display = 'none');
  }

  let lastUrl = location.href;

  function checkUrlChange() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (isShortPage()) applyShortsStyles();
    }
  }

  window.addEventListener('popstate', () => { lastUrl = location.href; });

  function init() {
    document.addEventListener('wheel', blockScroll, { passive: false, capture: true });
    document.addEventListener('keydown', blockKeyboard, { capture: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });

    const urlObserver = new MutationObserver(checkUrlChange);
    urlObserver.observe(document.body, { childList: true, subtree: true });

    if (isShortPage()) applyShortsStyles();
    setInterval(() => { if (isShortPage()) applyShortsStyles(); }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
