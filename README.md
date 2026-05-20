# Pull Em Shorts Off

A minimalist Firefox extension that blocks YouTube Shorts infinite scrolling while letting you watch individual Shorts.

## Features

- **Scroll Blocking** — Watch a Short, but can't scroll to the next one
- **Sidebar Hidden** — Shorts icon removed from navigation
- **Homepage Control** — Choose to hide Shorts from your feed
- **Regular Player Redirect** — Automatically redirect Shorts to the regular YouTube player
- **Instagram Blocking** — Block Instagram entirely, or block only Instagram Reels.
- **Custom Replacement** — Replace hidden Shorts with your own GIF/video
- **Daily Streak Tracker** — Keep track of your progress and blocked scrolls

## Installation

### From Firefox Add-ons (Recommended)

1. Visit the [Firefox Add-ons page](https://addons.mozilla.org/en-GB/firefox/addon/pull-em-shorts-off/)
2. Click "Add to Firefox"

### Manual Installation

1. Download or clone this repository
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Select the `manifest.json` file

## Usage

1. Click the extension icon to quickly toggle features in the popup.
2. Click "All settings" for the full options page.
3. Configure your homepage Shorts visibility and custom GIF replacements.

## How it works

- The extension uses local storage to save your preferences.
- A content script injects minimal CSS and Javascript into YouTube to hide elements and block scrolling events (`wheel`, `keydown`, `touchmove`).
- A background script keeps track of your daily streak and blocked scroll count.

## Files

```
PullEmShortsOff/
├── manifest.json
├── background/
│   └── background.js
├── content/
│   ├── shorts-blocker.js
│   ├── sidebar-hider.js
│   └── styles.css
├── options/
│   ├── options.html
│   ├── options.js
│   └── options.css
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
└── icons/
    ├── icon-48.png
    └── icon-96.png
```

## Author

Made by **Energyboy :3**  
Email: hromek.timur@gmail.com

## Privacy

See [PRIVACY.md](PRIVACY.md) for the privacy policy. The extension does not collect or transmit any data to external servers.

## License

MIT
