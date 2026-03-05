# PriceTag

**Every price on the internet, shown in hours of your life.**

A Chrome extension that converts prices into time based on your hourly wage. That $6 latte? 8 minutes of work. That $1,200 MacBook? 3 days, 2 hours.

## How It Works

1. Install the extension and enter your hourly wage
2. Browse the web normally
3. Every price you see gets a small badge showing how much of your life it costs

## Features

- **Price detection** on any website ($XX.XX, $X,XXX, ranges, etc.)
- **Color-coded badges** — green (<1hr), yellow (1-4hr), orange (4-8hr), red (>8hr)
- **Dark mode** support
- **Per-site toggle** — disable on specific sites
- **Display styles** — compact (2h 15m) or conversational ("2 hours and 15 minutes of your life")
- **Minimum price threshold** — ignore small amounts
- **Daily stats** — see how much you've browsed in life-hours
- **Zero network requests** — all data stays local

## Development

```bash
npm install
npm run build     # Build to dist/
npm run test      # Run tests
```

### Load in Chrome

1. Run `npm run build`
2. Go to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" → select the `dist/` folder

## Tech Stack

- Vanilla JS (no framework)
- Vite for bundling
- Chrome Manifest V3
- Vitest for testing

## Privacy

PriceTag stores only your hourly wage in Chrome's sync storage. No analytics, no tracking, no network requests. Everything runs locally.
