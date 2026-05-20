(function () {
  'use strict';

  let instaMode = 'block_reels'; // 'block_all' or 'block_reels'
  let debounceTimer = null;

  async function loadSettings() {
    try {
      const settings = await browser.storage.local.get(['instaMode']);
      instaMode = settings.instaMode ?? 'block_reels';
    } catch (e) { }
  }

  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.instaMode !== undefined) {
      instaMode = changes.instaMode.newValue;
      applyChanges();
    }
  });

  function applyChanges() {
    if (instaMode === 'block_all') {
      // Remove everything, show a simple blocked message
      document.body.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; height:100vh; width:100vw; background:#121212; color:#ffffff; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <div style="text-align:center;">
            <h1 style="margin-bottom:8px; font-size:24px; font-weight:600;">Instagram Blocked</h1>
            <p style="color:#999999; font-size:14px;">Pull Em Shorts Off is keeping you focused.</p>
          </div>
        </div>
      `;
      document.body.style.overflow = 'hidden';
      return;
    }

    if (instaMode === 'block_reels') {
      // Redirect away from /reels/ pages
      if (window.location.pathname.startsWith('/reels/')) {
        window.location.replace('https://www.instagram.com/');
        return;
      }

      // Hide Reels link in the sidebar or bottom nav
      // Instagram uses generic classes, but the href includes /reels/
      const links = document.querySelectorAll('a[href*="/reels/"]');
      links.forEach(link => {
        // Try to hide the parent list item if it exists, otherwise hide the link itself
        const container = link.closest('div[role="listitem"]') || link;
        container.style.display = 'none';
      });
    }
  }

  function onMutation() {
    if (debounceTimer) return;
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      if (instaMode === 'block_reels') applyChanges();
    }, 200);
  }

  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      applyChanges();
    }
    onMutation();
  });

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
