# PriceTag - Product Requirements Document

## Vision
Every price on the internet, shown in hours of your life. A browser extension that makes the real cost of spending impossible to ignore.

**Example**: You earn $45/hr. That $6 latte = "8 min of your life". That $1,200 MacBook = "3 days, 2 hours".

---

## Problem Statement
People are desensitized to dollar amounts. $28 for Uber Eats "doesn't feel like much." But "37 minutes of your working life" hits differently. PriceTag bridges the gap between abstract money and concrete life-time, nudging better spending decisions without being preachy.

## Target Users
- Budget-conscious individuals (r/Frugal 2M+, r/personalfinance 18M+)
- Young professionals starting to manage money
- Anyone who wants to be more intentional about spending

---

## Features

### Phase 1 - MVP (Weekend 1)
Core extension that works on any website.

#### F1: Onboarding & Income Setup
- First-install popup asks for hourly wage (or annual salary / work hours per week to calculate it)
- Supports pre-tax and post-tax toggle (post-tax recommended, shown as default)
- Stored locally via Chrome Storage Sync
- Can be changed anytime from popup

#### F2: Price Detection & Conversion
- Detect prices on any webpage: `$XX.XX`, `$X,XXX`, `XX.XX USD`, etc.
- Support common formats: `$`, commas, decimals, ranges ("$10-$20")
- Convert each price to time: hours, minutes (e.g., "2h 15m")
- Display as a subtle tooltip/badge near the original price
- Original price remains visible - PriceTag adds context, doesn't replace

#### F3: Popup Dashboard
- Show current hourly wage
- Toggle extension on/off globally
- Toggle for current site (allowlist/blocklist)
- Quick stats: "Today you've browsed $X,XXX worth of items (XX hours of your life)"

#### F4: Smart Display
- Only annotate prices above a configurable minimum (default: $1)
- Don't annotate prices inside input fields, scripts, or metadata
- Graceful handling of dynamically loaded content (infinite scroll, SPAs)
- Performance: batch DOM updates, debounce MutationObserver

### Phase 2 - Polish (Weekend 2)
Make it delightful and shareable.

#### F5: Time Format Options
- Compact: "2h 15m"
- Conversational: "2 hours and 15 minutes of your life"
- Brutal: "You'd mass 2 hours and 15 minutes of Netflix for this"
- Custom format support

#### F6: Color Coding
- Green: < 1 hour of work
- Yellow: 1-4 hours
- Orange: 4-8 hours (half a day to full day)
- Red: > 8 hours (more than a full work day)
- Configurable thresholds

#### F7: Alternative Suggestions
- "This $28 Uber Eats = 37 min of work. Cooking at home (~$8) = 11 min"
- Pre-built suggestion categories: food, transport, entertainment, subscriptions
- User can add custom alternatives

#### F8: Weekly Summary
- Weekly notification/popup: "This week you browsed $X,XXX in products (XX hours of your life)"
- Breakdown by category if detectable (Amazon, food delivery, etc.)
- Trend: up/down vs last week

### Phase 3 - Growth (Week 3-4)
Viral features and monetization exploration.

#### F9: Share Cards
- "Share this price in life-hours" button
- Generates a clean image card: product + price + time conversion
- Shareable to Twitter/Reddit/Instagram stories

#### F10: Multi-Currency
- Auto-detect currency from page (EUR, GBP, JPY, INR, etc.)
- Convert to user's local currency first, then to time
- Uses a bundled exchange rate table (updated weekly via optional background fetch)

#### F11: Salary Comparison Mode
- "How long would minimum wage ($7.25/hr) work for this?"
- "How long would median US income work for this?"
- Toggle between your wage and comparison wages

#### F12: Firefox & Safari Support
- Port to Firefox (WebExtensions API is mostly compatible)
- Safari Web Extension (if demand warrants)

---

## Technical Requirements

### Performance
- Price detection must complete within 200ms on page load
- No visible layout shift when adding annotations
- Memory usage < 20MB
- MutationObserver must be debounced (100ms) to avoid perf issues on heavy SPAs

### Privacy & Security
- Zero network requests for core functionality (Phase 1-2)
- Hourly wage stored only in Chrome Storage (local + sync)
- No analytics, no tracking, no data collection
- Content Security Policy: strict, no eval, no remote scripts
- Optional: Phase 3 exchange rate fetch (can be disabled)

### Compatibility
- Chrome 110+ (MV3 baseline)
- Edge (Chromium-based, same extension)
- Brave, Arc, Opera (Chromium-based)
- Firefox (Phase 3)

### Price Detection Edge Cases
- Ranges: "$10 - $20" -> "13m - 27m"
- Strikethrough/sale prices: detect both, show savings in time too
- Subscription prices: "$9.99/mo" -> "13m/mo of your life"
- Per-unit prices: "$3.99/lb" -> show as-is with time annotation
- Negative prices / refunds: handle gracefully
- Non-price dollar signs (e.g., variable names in code blocks): skip
- Prices in images: out of scope

---

## Success Metrics
- **Install target**: 1,000 users in first month (via Reddit posts)
- **Retention**: 40%+ weekly active after install
- **Reviews**: 4.5+ stars on Chrome Web Store
- **Virality**: Share card feature generates 100+ shares/week by month 2

## Distribution Strategy
1. Post to r/Frugal, r/personalfinance, r/InternetIsBeautiful, r/chrome
2. Product Hunt launch
3. Hacker News Show HN
4. Twitter/X demos with screenshot comparisons (Amazon cart in life-hours)

---

## Non-Goals (Explicit)
- Not a budgeting app (no bank connections, no transaction tracking)
- Not a price comparison tool (no scraping competitor prices)
- Not a coupon/deal finder
- No account system or cloud backend
- No AI/ML for price detection (regex is sufficient and faster)

## Risks
- **Price detection accuracy**: False positives (non-price numbers) or missed prices. Mitigate with comprehensive regex + DOM context heuristics.
- **Site breakage**: Modifying DOM can break React/Vue hydration or checkout flows. Mitigate by using overlays/tooltips only, never modifying original text nodes.
- **Chrome Web Store review**: MV3 compliance, clear privacy policy needed. Mitigate by keeping permissions minimal (activeTab + storage only).
