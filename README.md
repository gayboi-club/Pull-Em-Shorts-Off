# Pull Em Shorts Off

A Firefox extension that blocks YouTube Shorts infinite scrolling while letting you watch individual Shorts.

## Features

- **Scroll Blocking** - Watch a Short, but can't scroll to the next one
- **Sidebar Hidden** - Shorts icon removed from navigation
- **Homepage Control** - Choose to hide Shorts from your feed
- **Custom Replacement** - Replace hidden Shorts with your own GIF/video
- **Discord Notifications** - Optional daily messages to your server

## Installation

### From Firefox Add-ons (Recommended)

1. Visit the [Firefox Add-ons page](https://addons.mozilla.org/en-GB/firefox/addon/pull-em-shorts-off/)
2. Click "Add to Firefox"

### Manual Installation

1. Download or clone this repository
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Select the `manifest.json` file

## Setup

1. Click the extension icon to open settings
2. Configure homepage Shorts visibility
3. (Optional) Set up Discord notifications with your webhook URL
4. (Optional) Set a custom GIF/video URL

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
└── icons/
    ├── icon-48.png
    └── icon-96.png
```

## Author

Made by **Energyboy :3**  
Email: hromek.timur@gmail.com

## Privacy

See [PRIVACY.md](PRIVACY.md) for the privacy policy.

## License

MIT
