# PriceTag - Browser Extension

## Project Overview
PriceTag is a Chrome/Edge browser extension that converts every price on the web into "hours of your life" based on your hourly income. It rewires spending behavior by making the true cost of purchases viscerally clear.

## Tech Stack
- **Extension**: Chrome Manifest V3 (compatible with Edge, Brave, Arc)
- **Frontend**: Vanilla JS + minimal CSS (popup UI)
- **Content Script**: DOM price detection and overlay injection
- **Storage**: Chrome Storage API (sync for cross-device)
- **Build**: Vite with CRXJS plugin for hot-reload dev experience

## Project Structure
```
price-tag/
  src/
    manifest.json          # MV3 manifest
    popup/                 # Extension popup (settings UI)
      popup.html
      popup.css
      popup.js
    content/               # Content script (price detection + overlay)
      content.js
      content.css
    background/            # Service worker
      background.js
    utils/
      price-parser.js      # Price detection regex + parsing
      time-formatter.js    # Convert dollar amount to time string
      currency.js          # Multi-currency support
    assets/                # Icons, images
  docs/
    PRD.md
  vite.config.js
  package.json
```

## Key Commands
- `npm install` - Install dependencies
- `npm run dev` - Dev build with hot reload
- `npm run build` - Production build to `dist/`
- `npm run test` - Run tests
- `npm run lint` - Lint code

## Architecture Decisions
- **Manifest V3**: Required for Chrome Web Store submission (MV2 deprecated)
- **No framework for popup**: Keep bundle tiny (<50KB). Popup is simple enough for vanilla JS
- **Content script price detection**: Use TreeWalker API to walk text nodes, regex to find prices, avoid modifying DOM structure (use CSS overlays/tooltips instead)
- **Chrome Storage Sync**: User's hourly wage syncs across devices automatically

## Code Conventions
- ES modules throughout
- No TypeScript (keep it simple for a weekend project)
- Prettier for formatting (2-space indent, single quotes)
- Test price parsing thoroughly (many edge cases)

## Important Notes
- Never store sensitive financial data beyond the hourly wage
- Price detection must not break page layouts or interfere with e-commerce checkout flows
- Extension must work on dynamically loaded content (MutationObserver for SPAs)
- Respect user privacy: all computation is local, zero network requests for core functionality
