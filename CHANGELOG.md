# Changelog

All notable changes to this project will be documented in this file.

## [1.1.1] - 2026-05-20

### Added
- **Instagram Support**: Added the ability to either block Instagram entirely or block only Instagram Reels. This enforces that you can never have normal access to Reels. You can configure this setting in the options or popup menu.

## [1.1.0] - 2026-05-20

### Added
- **Manifest V3 Migration**: Updated extension architecture to Manifest V3 for modern compatibility and better performance.
- **Popup Menu**: Added a quick-access popup menu when clicking the extension icon to toggle individual features without opening the full settings page.
- **Granular Controls**: You can now individually toggle block scrolling, sidebar hiding, and homepage hiding.
- **Redirect Feature**: Added an option to automatically redirect Shorts links to the regular YouTube player.
- **Daily Streak & Block Counter**: Track how many Shorts scrolls were blocked today and your active day streak.

### Changed
- **Options Redesign**: Cleaned up the settings page using a minimalist dark theme, improving usability and aesthetics.
- **Performance**: Content scripts now use debounced `MutationObserver`s instead of `setInterval` polling, significantly reducing CPU usage.
- **Dark Mode**: The replacement GIF container now respects YouTube's native dark mode.

### Removed
- **Discord Notifications**: The Discord webhook integration has been entirely removed to simplify the extension and improve privacy. No external data transmission occurs.
